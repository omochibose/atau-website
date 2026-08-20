import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JWT } from 'google-auth-library';

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const SITE_URL = 'sc-domain:atau-dd.com';
const SITEMAP_URL = 'https://atau-dd.com/sitemap-index.xml';

async function main() {
  const keyJson = process.env.GSC_SERVICE_ACCOUNT_KEY;
  if (!keyJson) {
    console.log(
      '[submit-sitemap] GSC_SERVICE_ACCOUNT_KEY が未設定のためスキップします（ローカルビルドでは想定内）。'
    );
    return;
  }

  const credentials = JSON.parse(keyJson);
  const client = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters'],
  });

  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/sitemaps/${encodeURIComponent(SITEMAP_URL)}`;

  try {
    await client.request({ url: endpoint, method: 'PUT' });
    console.log(`[submit-sitemap] Search Console へ ${SITEMAP_URL} を再送信しました。`);
  } catch (err) {
    // サイトマップ再送信の失敗でビルド全体を落とさない
    console.error(
      '[submit-sitemap] サイトマップ再送信に失敗しました:',
      err instanceof Error ? err.message : err
    );
  }
}

main();
