import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

// astro:content の getCollection() は Astro の Vite 仮想モジュールに依存するため、
// tsx で直接実行するこのスクリプトからは呼び出せない。
// そのため src/content/blog/*.md を直接読み、frontmatter を手動でパースする
// （スキーマは src/content/config.ts の blog コレクション定義と揃えること）。

const __dirname = dirname(fileURLToPath(import.meta.url));

// ローカル開発用。Netlifyの本番ビルドには .env が存在しないため、
// 存在するときだけ読み込む（本番では環境変数はNetlify側から直接注入される）。
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const BLOG_DIR = join(__dirname, '..', 'src', 'content', 'blog');
const OUTPUT_PATH = join(__dirname, '..', 'src', 'data', 'blog-embeddings.json');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const EMBEDDING_MODEL = 'gemini-embedding-001';
const REQUEST_INTERVAL_MS = 100;
const FAILURE_RATE_LIMIT = 0.5; // これを超える失敗率でビルドを失敗させる

type BlogEmbeddingEntry = {
  slug: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  fullText: string;
  vector: number[];
  updatedAt: string;
};

type RawPost = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  draft: boolean;
  body: string;
};

function loadPublishedPosts(): RawPost[] {
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

  return files
    .map((filename): RawPost => {
      const raw = readFileSync(join(BLOG_DIR, filename), 'utf-8');
      const { data, content } = matter(raw);
      return {
        slug: filename.replace(/\.md$/, ''),
        title: data.title,
        description: data.description,
        tags: data.tags ?? [],
        draft: data.draft ?? false,
        body: content.trim(),
      };
    })
    .filter((post) => !post.draft);
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
  console.log(`[build-embeddings] ${posts.length}件の公開記事を検出しました。`);

  const entries: BlogEmbeddingEntry[] = [];
  let failures = 0;

  for (const post of posts) {
    const embedText = `${post.title}\n${post.description}\n${post.body}`;
    try {
      const vector = await getGeminiEmbedding(embedText, 'RETRIEVAL_DOCUMENT', post.title);
      entries.push({
        slug: post.slug,
        title: post.title,
        description: post.description,
        url: `/blog/${post.slug}/`,
        tags: post.tags,
        fullText: post.body,
        vector,
        updatedAt: new Date().toISOString(),
      });
      console.log(`[build-embeddings] OK: ${post.slug}`);
    } catch (err) {
      failures += 1;
      console.warn(`[build-embeddings] SKIP (embedding失敗): ${post.slug} — ${(err as Error).message}`);
    }
    await sleep(REQUEST_INTERVAL_MS);
  }

  const failureRate = posts.length > 0 ? failures / posts.length : 0;
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
