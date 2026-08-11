import blogIndex from '../../src/data/blog-embeddings.json';

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

type ChatRequest = {
  question: string;
};

type ChatResponse = {
  answer: string | null;
  sources: { title: string; url: string }[];
  noMatch: boolean;
  error?: string;
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const THRESHOLD = Number(process.env.SIMILARITY_THRESHOLD ?? '0.72');
const MAX_QUESTION_LENGTH = 500;
const TOP_K = 3;
const EMBEDDING_MODEL = 'gemini-embedding-001';
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `あなたはATAU Digital Design（ATAU DD）のWebサイト上で動作するアシスタントです。
以下のルールを厳格に守ってください。

1. 回答は必ず、ユーザーメッセージ内の「参考情報」セクションに含まれる内容のみを根拠にすること。
   自身の一般知識や学習済みの情報を用いて回答してはならない。
2. 参考情報の中に質問に答えられる内容が含まれていない場合は、
   本文で回答を作らず、必ず次のJSON形式のみを出力すること：
   {"noContext": true}
3. 参考情報に基づいて回答できる場合は、次のJSON形式で出力すること：
   {"noContext": false, "answer": "回答本文（敬体、簡潔に3〜5文程度）"}
4. 参考情報に含まれるURLやリンクをそのまま回答文に含めてよいが、
   存在しないURLを生成してはならない。
5. 料金・契約・個別見積もりなど、記事の一般的な説明を超える個別具体的な判断が
   必要な質問には、参考情報に金額等の記載がある場合を除き、
   「詳細については直接お問い合わせください」という旨を添えること。
6. 出力は必ず有効なJSONのみとし、前後に説明文やMarkdown装飾を含めないこと。`;

function json(body: ChatResponse | { error: string }, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getGeminiEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        taskType: 'RETRIEVAL_QUERY',
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}`);
  }

  const data = await response.json();
  const vector = data?.embedding?.values;
  if (!Array.isArray(vector)) {
    throw new Error('Gemini API response missing embedding.values');
  }
  return vector;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function callClaude(
  context: string,
  question: string
): Promise<{ noContext: boolean; answer?: string }> {
  const tools = [
    {
      name: 'respond',
      description: '参考情報に基づいて回答するか、該当なしを返す',
      input_schema: {
        type: 'object',
        properties: {
          noContext: { type: 'boolean' },
          answer: { type: 'string' },
        },
        required: ['noContext'],
      },
    },
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      tools,
      tool_choice: { type: 'tool', name: 'respond' },
      messages: [
        {
          role: 'user',
          content: `参考情報:\n${context}\n\n質問: ${question}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Claude API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const toolUse = data.content?.find((block: { type: string }) => block.type === 'tool_use');
  if (!toolUse) {
    throw new Error('Claude response missing tool_use block');
  }

  return toolUse.input as { noContext: boolean; answer?: string };
}

async function logChatInteraction(entry: {
  question: string;
  matchedTitle: string | null;
  matchedScore: number | null;
  noMatch: boolean;
  answer: string | null;
}): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/atau_dd_chat_logs`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        question: entry.question,
        matched_title: entry.matchedTitle,
        matched_score: entry.matchedScore,
        no_match: entry.noMatch,
        answer: entry.answer,
      }),
    });
    if (!res.ok) {
      console.error(`[chat] Supabaseへのログ書き込みに失敗しました: ${res.status}`);
    }
  } catch (err) {
    // ログ記録の失敗はチャット応答自体を止めない
    console.error('[chat] Supabaseへのログ書き込みで例外が発生しました:', err);
  }
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  if (!GEMINI_API_KEY || !ANTHROPIC_API_KEY) {
    console.error('[chat] GEMINI_API_KEY または ANTHROPIC_API_KEY が未設定です。');
    return json({ error: 'server_misconfigured' }, 500);
  }

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const question = body.question?.trim();
  if (!question || question.length > MAX_QUESTION_LENGTH) {
    return json({ error: 'invalid_question' }, 400);
  }

  const index = blogIndex as BlogEmbeddingEntry[];
  if (index.length === 0) {
    return json({ answer: null, sources: [], noMatch: true });
  }

  try {
    const questionVector = await getGeminiEmbedding(question);

    const matches = index
      .map((entry) => ({ ...entry, score: cosineSimilarity(questionVector, entry.vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K);

    const topScore = matches[0]?.score ?? null;
    const topTitle = matches[0]?.title ?? null;

    if (matches.length === 0 || matches[0].score < THRESHOLD) {
      await logChatInteraction({
        question,
        matchedTitle: topTitle,
        matchedScore: topScore,
        noMatch: true,
        answer: null,
      });
      return json({ answer: null, sources: [], noMatch: true });
    }

    const relevant = matches.filter((m) => m.score >= THRESHOLD);
    const context = relevant.map((m) => `【${m.title}】\n${m.fullText}`).join('\n\n---\n\n');

    const llmResult = await callClaude(context, question);

    if (llmResult.noContext || !llmResult.answer) {
      await logChatInteraction({
        question,
        matchedTitle: topTitle,
        matchedScore: topScore,
        noMatch: true,
        answer: null,
      });
      return json({ answer: null, sources: [], noMatch: true });
    }

    await logChatInteraction({
      question,
      matchedTitle: topTitle,
      matchedScore: topScore,
      noMatch: false,
      answer: llmResult.answer,
    });

    return json({
      answer: llmResult.answer,
      sources: relevant.map((m) => ({ title: m.title, url: m.url })),
      noMatch: false,
    });
  } catch (err) {
    console.error('[chat] Unexpected error:', err);
    return json({ error: 'internal_error' }, 500);
  }
};
