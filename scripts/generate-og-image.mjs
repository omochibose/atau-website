/**
 * OGP デフォルト画像生成スクリプト
 * 実行: node scripts/generate-og-image.mjs
 * 出力: public/og-default.png (1200×630)
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.resolve(__dirname, '../public/og-default.png');

// サイトカラー
const VOID    = '#FAF8F5';
const DEPTH   = '#F0EBE6';
const CREAM   = '#1A1814';
const DUST    = '#5C5852';
const ASH     = '#8A857C';
const BLUE    = '#1f6fbe';  // signal-blue approx
const BORDER  = 'rgba(26,24,20,0.10)';

const W = 1200;
const H = 630;

// グリッドライン (60px ピッチ)
const GRID_SIZE = 60;
const gridLines = [];
for (let x = 0; x <= W; x += GRID_SIZE) {
  gridLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${BORDER}" stroke-width="1"/>`);
}
for (let y = 0; y <= H; y += GRID_SIZE) {
  gridLines.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${BORDER}" stroke-width="1"/>`);
}

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'SystemJP';
        src: local('Hiragino Sans'), local('Yu Gothic'), local('Noto Sans JP'), local('sans-serif');
      }
    </style>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${DEPTH}"/>

  <!-- Grid overlay -->
  <g opacity="1">${gridLines.join('')}</g>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="${W}" height="4" fill="${BLUE}" opacity="0.7"/>

  <!-- Left content block -->

  <!-- ATAU wordmark -->
  <text
    x="80" y="148"
    font-family="'Space Grotesk', system-ui, sans-serif"
    font-size="80"
    font-weight="700"
    fill="${CREAM}"
    letter-spacing="-4"
  >ATAU</text>

  <!-- Tagline (monospace small caps) -->
  <text
    x="84" y="178"
    font-family="'Space Mono', 'Courier New', monospace"
    font-size="11"
    fill="${ASH}"
    letter-spacing="5"
  >INSPIRE AMBITION</text>

  <!-- Divider -->
  <rect x="80" y="205" width="400" height="1.5" fill="${BLUE}" opacity="0.35"/>

  <!-- Mission text line 1 -->
  <text
    x="80" y="316"
    font-family="'Hiragino Sans', 'Yu Gothic Medium', 'Noto Sans JP', system-ui, sans-serif"
    font-size="72"
    font-weight="700"
    fill="${CREAM}"
    letter-spacing="-2"
  >挑戦しやすい</text>

  <!-- Mission text line 2 -->
  <text
    x="80" y="406"
    font-family="'Hiragino Sans', 'Yu Gothic Medium', 'Noto Sans JP', system-ui, sans-serif"
    font-size="72"
    font-weight="700"
    fill="${CREAM}"
    letter-spacing="-2"
  >社会を創る</text>

  <!-- Sub copy -->
  <text
    x="82" y="462"
    font-family="'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', system-ui, sans-serif"
    font-size="18"
    fill="${DUST}"
  >ITの力で、挑戦を実現する</text>

  <!-- Right side decorative panel -->
  <rect x="860" y="60" width="260" height="510" rx="4" fill="${VOID}" opacity="0.7"/>

  <!-- Panel inner lines -->
  <rect x="884" y="100" width="212" height="1.5" fill="${BLUE}" opacity="0.4"/>
  <text x="884" y="136"
    font-family="'Space Mono', monospace" font-size="10" fill="${ASH}" letter-spacing="3"
  >EMPOWER</text>
  <text x="884" y="166"
    font-family="'Hiragino Sans', system-ui, sans-serif" font-size="13" fill="${DUST}"
  >外付けIT部門として</text>
  <text x="884" y="186"
    font-family="'Hiragino Sans', system-ui, sans-serif" font-size="13" fill="${DUST}"
  >中小企業の挑戦を支える</text>

  <rect x="884" y="220" width="212" height="1" fill="${BORDER}"/>
  <text x="884" y="256"
    font-family="'Space Mono', monospace" font-size="10" fill="${ASH}" letter-spacing="3"
  >AMPLIFY</text>
  <text x="884" y="286"
    font-family="'Hiragino Sans', system-ui, sans-serif" font-size="13" fill="${DUST}"
  >挑戦の過程を言語化し</text>
  <text x="884" y="306"
    font-family="'Hiragino Sans', system-ui, sans-serif" font-size="13" fill="${DUST}"
  >発信・共有する</text>

  <rect x="884" y="340" width="212" height="1" fill="${BORDER}"/>
  <text x="884" y="376"
    font-family="'Space Mono', monospace" font-size="10" fill="${ASH}" letter-spacing="3"
  >INSPIRE</text>
  <text x="884" y="406"
    font-family="'Hiragino Sans', system-ui, sans-serif" font-size="13" fill="${DUST}"
  >自ら挑戦し続け</text>
  <text x="884" y="426"
    font-family="'Hiragino Sans', system-ui, sans-serif" font-size="13" fill="${DUST}"
  >次の挑戦を触発する</text>

  <rect x="884" y="476" width="212" height="1.5" fill="${BLUE}" opacity="0.4"/>
  <text x="884" y="510"
    font-family="'Space Mono', monospace" font-size="10" fill="${ASH}" letter-spacing="2"
  >atau-dd.com</text>

  <!-- Bottom domain -->
  <text
    x="80" y="590"
    font-family="'Space Mono', 'Courier New', monospace"
    font-size="12"
    fill="${ASH}"
    letter-spacing="3"
  >atau-dd.com</text>
</svg>
`.trim();

const buf = Buffer.from(svg, 'utf-8');

await sharp(buf, { density: 150 })
  .resize(W, H)
  .png({ compressionLevel: 9 })
  .toFile(OUTPUT);

console.log(`✓ OGP image generated: ${OUTPUT}`);
