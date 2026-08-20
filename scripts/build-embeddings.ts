import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

// astro:content の getCollection() は Astro の Vite 仮想モジュールに依存するため、
// tsx で直接実行するこのスクリプトからは呼び出せない。
// そのため src/content/blog/*.md を直接読み、frontmatter を手動でパースする
// （スキーマは src/content/config.ts の blog コレクション定義と揃えること）。
//
// about/business/showcase/contactのような固定ページは、内容を要約した別ファイルを
// 手動で維持するとページ本体とズレる（二重管理によるヒューマンエラー）ため採用しない。
// 代わりに、このスクリプトは `astro build` の後に実行する前提とし、
// ビルド済みHTML（dist/<slug>/index.html）の<main>部分をテキスト化して埋め込み対象にする。
// ページの実装（.astro）そのものが唯一の情報源になり、同期漏れが構造的に起きなくなる。

const __dirname = dirname(fileURLToPath(import.meta.url));

// ローカル開発用。Netlifyの本番ビルドには .env が存在しないため、
// 存在するときだけ読み込む（本番では環境変数はNetlify側から直接注入される）。
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const BLOG_DIR = join(__dirname, '..', 'src', 'content', 'blog');
const DIST_DIR = join(__dirname, '..', 'dist');
const OUTPUT_PATH = join(__dirname, '..', 'src', 'data', 'site-embeddings.json');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// チャットボットに検索させたい固定ページ。新しいページを対象に加えたい場合はここにslugを足すだけでよい。
const STATIC_PAGE_SLUGS = ['about', 'business', 'showcase', 'contact'];
const EMBEDDING_MODEL = 'gemini-embedding-001';
const REQUEST_INTERVAL_MS = 100;
const FAILURE_RATE_LIMIT = 0.5; // これを超える失敗率でビルドを失敗させる

type SiteEmbeddingEntry = {
  slug: string;
  sourceType: 'blog' | 'page';
  title: string;
  description: string;
  url: string;
  tags: string[];
  fullText: string;
  vector: number[];
  updatedAt: string;
};

type RawDoc = {
  slug: string;
  sourceType: 'blog' | 'page';
  title: string;
  description: string;
  url: string;
  tags: string[];
  draft: boolean;
  body: string;
};

function loadPublishedPosts(): RawDoc[] {
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

  return files
    .map((filename): RawDoc => {
      const raw = readFileSync(join(BLOG_DIR, filename), 'utf-8');
      const { data, content } = matter(raw);
      const slug = filename.replace(/\.md$/, '');
      return {
        slug,
        sourceType: 'blog',
        title: data.title,
        description: data.description,
        url: `/blog/${slug}/`,
        tags: data.tags ?? [],
        draft: data.draft ?? false,
        body: content.trim(),
      };
    })
    .filter((post) => !post.draft);
}

const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
  nbsp: ' ',
};

function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#39|amp|lt|gt|quot|nbsp);/g, (_, entity) => HTML_ENTITIES[entity]);
}

function htmlToText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

// about/business/showcase/contactなどの固定ページ。
// ページ実装（.astro）はマークアップとロジックが混在し、その内容を別ファイルへ
// 手動で複製すると本文とズレる（二重管理）ため、ビルド済みHTMLの<main>を
// そのままテキスト化して埋め込み対象にする。ページの実装自体が唯一の情報源になる。
function loadStaticPages(): RawDoc[] {
  if (!existsSync(DIST_DIR)) {
    throw new Error(
      `${DIST_DIR} が見つかりません。このスクリプトは \`astro build\` の後に実行してください。`
    );
  }

  return STATIC_PAGE_SLUGS.map((slug): RawDoc => {
    const htmlPath = join(DIST_DIR, slug, 'index.html');
    if (!existsSync(htmlPath)) {
      throw new Error(`${htmlPath} が見つかりません。STATIC_PAGE_SLUGS のslugを確認してください。`);
    }
    const html = readFileSync(htmlPath, 'utf-8');

    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
    const descriptionMatch = html.match(/<meta name="description" content="([\s\S]*?)"/);
    const mainMatch = html.match(/<main>([\s\S]*?)<\/main>/);

    if (!titleMatch || !descriptionMatch || !mainMatch) {
      throw new Error(`${htmlPath} からtitle/description/mainのいずれかを抽出できませんでした。`);
    }

    return {
      slug,
      sourceType: 'page',
      title: decodeHtmlEntities(titleMatch[1]).replace(/\s*\|\s*ATAU$/, ''),
      description: decodeHtmlEntities(descriptionMatch[1]),
      url: `/${slug}/`,
      tags: [],
      draft: false,
      body: htmlToText(mainMatch[1]),
    };
  });
}

async function getGeminiEmbedding(
  text: string,
  taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY',
  title?: string
): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        taskType,
        ...(title ? { title } : {}),
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const json = await response.json();
  const vector = json?.embedding?.values;
  if (!Array.isArray(vector)) {
    throw new Error('Gemini API response missing embedding.values');
  }
  return vector;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

  if (!GEMINI_API_KEY) {
    console.warn(
      '[build-embeddings] GEMINI_API_KEY が未設定のため、チャットボット検索インデックスの生成をスキップします。'
    );
    console.warn(
      '[build-embeddings] ローカルビルドではこれは想定内です。Netlify本番ビルドでは GEMINI_API_KEY を必ず設定してください。'
    );
    writeFileSync(OUTPUT_PATH, JSON.stringify([], null, 2));
    return;
  }

  const posts = loadPublishedPosts();
  const pages = loadStaticPages();
  const docs = [...posts, ...pages];
  console.log(
    `[build-embeddings] ${posts.length}件の公開記事、${pages.length}件の固定ページを検出しました。`
  );

  const entries: SiteEmbeddingEntry[] = [];
  let failures = 0;

  for (const doc of docs) {
    const embedText = `${doc.title}\n${doc.description}\n${doc.body}`;
    try {
      const vector = await getGeminiEmbedding(embedText, 'RETRIEVAL_DOCUMENT', doc.title);
      entries.push({
        slug: doc.slug,
        sourceType: doc.sourceType,
        title: doc.title,
        description: doc.description,
        url: doc.url,
        tags: doc.tags,
        fullText: doc.body,
        vector,
        updatedAt: new Date().toISOString(),
      });
      console.log(`[build-embeddings] OK: ${doc.slug}`);
    } catch (err) {
      failures += 1;
      console.warn(`[build-embeddings] SKIP (embedding失敗): ${doc.slug} — ${(err as Error).message}`);
    }
    await sleep(REQUEST_INTERVAL_MS);
  }

  const failureRate = docs.length > 0 ? failures / docs.length : 0;
  if (failureRate > FAILURE_RATE_LIMIT) {
    console.error(
      `[build-embeddings] 失敗率 ${(failureRate * 100).toFixed(0)}% が閾値 ${(FAILURE_RATE_LIMIT * 100).toFixed(0)}% を超えました。ビルドを失敗させます。`
    );
    process.exit(1);
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(entries, null, 2));
  console.log(`[build-embeddings] ${entries.length}件のエントリを ${OUTPUT_PATH} に書き出しました（失敗: ${failures}件）。`);
}

main().catch((err) => {
  console.error('[build-embeddings] 予期しないエラーで終了します:', err);
  process.exit(1);
});
