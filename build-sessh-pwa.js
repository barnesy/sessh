/**
 * Build Script for "Session Drummer" (short_name: "sessh") Standalone GitHub Pages PWA
 * Outputs a < 200 KB self-contained, 100% offline-capable PWA into ./docs (and syncs icons/manifest to public/)
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, 'magenta-studio', 'magenta4live.amxd', 'code', 'public');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const WORKFLOWS_DIR = path.join(ROOT_DIR, '.github', 'workflows');

if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });
if (!fs.existsSync(WORKFLOWS_DIR)) fs.mkdirSync(WORKFLOWS_DIR, { recursive: true });

// ----------------------------------------------------------------------------
// 1. Pure-Node PNG Generator (Creates crisp 192x192 & 512x512 WebAPK Icons)
// ----------------------------------------------------------------------------
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
  }
  return (c ^ -1) >>> 0;
}
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generateSesshPng(size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const padColors = [
    [244, 63, 94],   // Kick Rose
    [251, 146, 60],  // Rim Orange
    [234, 179, 8],   // Snare Gold
    [245, 158, 11],  // Clap Amber
    [56, 189, 248],  // Hat Sky
    [132, 220, 198], // Open Hat Teal
    [168, 85, 247],  // Tom Purple
    [231, 63, 246]   // Crash Magenta
  ];

  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0; // Filter type 0
    for (let x = 0; x < size; x++) {
      const idx = rowStart + 1 + x * 4;
      const nx = x / size;
      const ny = y / size;

      // Dark studio background with subtle radial glow
      const dx = nx - 0.5;
      const dy = ny - 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let r = Math.round(18 + Math.max(0, 0.5 - dist) * 28);
      let g = Math.round(19 + Math.max(0, 0.5 - dist) * 16);
      let b = Math.round(28 + Math.max(0, 0.5 - dist) * 44);

      // Outer neon border ring
      if (nx > 0.06 && nx < 0.94 && ny > 0.06 && ny < 0.94) {
        const onBorder =
          nx < 0.085 || nx > 0.915 || ny < 0.085 || ny > 0.915;
        if (onBorder) {
          r = 231;
          g = 63;
          b = 246;
        }
      }

      // 4x2 MPC Drum Pad Grid in center (nx: 0.14..0.86, ny: 0.24..0.76)
      if (nx >= 0.14 && nx <= 0.86 && ny >= 0.24 && ny <= 0.76) {
        const gx = (nx - 0.14) / 0.72; // 0..1 across 4 columns
        const gy = (ny - 0.24) / 0.52; // 0..1 across 2 rows
        const col = Math.min(3, Math.floor(gx * 4));
        const row = Math.min(1, Math.floor(gy * 2));
        const cellX = (gx * 4) - col;
        const cellY = (gy * 2) - row;
        if (cellX > 0.08 && cellX < 0.92 && cellY > 0.1 && cellY < 0.9) {
          const c = padColors[row * 4 + col];
          // Highlight bottom bar of each pad
          if (cellY > 0.72) {
            r = c[0];
            g = c[1];
            b = c[2];
          } else {
            r = Math.round(c[0] * 0.35 + 24);
            g = Math.round(c[1] * 0.35 + 25);
            b = Math.round(c[2] * 0.35 + 34);
          }
        }
      }

      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#12131c"/>
  <rect x="24" y="24" width="464" height="464" rx="80" fill="none" stroke="#e73ff6" stroke-width="12"/>
  <text x="256" y="118" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="64" letter-spacing="4">sessh</text>
  <!-- 4x2 Drum Pads -->
  <rect x="64" y="156" width="84" height="84" rx="14" fill="#f43f5e"/>
  <rect x="164" y="156" width="84" height="84" rx="14" fill="#fb923c"/>
  <rect x="264" y="156" width="84" height="84" rx="14" fill="#eab308"/>
  <rect x="364" y="156" width="84" height="84" rx="14" fill="#f59e0b"/>
  <rect x="64" y="256" width="84" height="84" rx="14" fill="#38bdf8"/>
  <rect x="164" y="256" width="84" height="84" rx="14" fill="#84dcc6"/>
  <rect x="264" y="256" width="84" height="84" rx="14" fill="#a855f7"/>
  <rect x="364" y="256" width="84" height="84" rx="14" fill="#e73ff6"/>
  <text x="256" y="420" text-anchor="middle" fill="#84dcc6" font-family="system-ui, sans-serif" font-weight="800" font-size="34" letter-spacing="2">SESSION DRUMMER</text>
</svg>`;

const png192 = generateSesshPng(192);
const png512 = generateSesshPng(512);

for (const dir of [DOCS_DIR, PUBLIC_DIR]) {
  fs.writeFileSync(path.join(dir, 'icon.svg'), iconSvg, 'utf8');
  fs.writeFileSync(path.join(dir, 'icon-192.png'), png192);
  fs.writeFileSync(path.join(dir, 'icon-512.png'), png512);
}

// ----------------------------------------------------------------------------
// 2. Write Manifest ("Session Drummer" / "sessh") for GitHub Pages & Local
//    Matches strictly-spending's verified Android WebAPK schema
// ----------------------------------------------------------------------------
const manifestObj = {
  id: './?pwa=1',
  name: 'Session Drummer',
  short_name: 'sessh',
  description: '16-Bar Session Drummer & Artist Groove Workstation (21 Legendary Drummers, 105 Songs, 21 Drum Kits)',
  start_url: './?pwa=1',
  scope: './',
  display: 'standalone',
  display_override: ['standalone', 'minimal-ui'],
  orientation: 'any',
  background_color: '#12131c',
  theme_color: '#12131c',
  categories: ['music', 'entertainment', 'utilities'],
  prefer_related_applications: false,
  icons: [
    {
      src: './icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: './icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: './icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable'
    },
    {
      src: './icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable'
    }
  ]
};

fs.writeFileSync(path.join(DOCS_DIR, 'manifest.json'), JSON.stringify(manifestObj, null, 2), 'utf8');
fs.writeFileSync(path.join(PUBLIC_DIR, 'manifest.json'), JSON.stringify(manifestObj, null, 2), 'utf8');

// ----------------------------------------------------------------------------
// 3. Copy Latest fold-studio-dock.js to ./docs
// ----------------------------------------------------------------------------
const dockJsPath = path.join(PUBLIC_DIR, 'fold-studio-dock.js');
fs.copyFileSync(dockJsPath, path.join(DOCS_DIR, 'fold-studio-dock.js'));

// ----------------------------------------------------------------------------
// 4. Write Clean Standalone index.html & Offline Service Worker (sw.js) in ./docs and PUBLIC_DIR
// ----------------------------------------------------------------------------
const standaloneHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#12131c">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="sessh">
  <link rel="manifest" href="./manifest.json">
  <link rel="icon" type="image/svg+xml" href="./icon.svg">
  <link rel="apple-touch-icon" href="./icon-192.png">
  <link rel="apple-touch-icon" sizes="180x180" href="./icon-192.png">
  <link rel="apple-touch-icon" sizes="192x192" href="./icon-192.png">
  <title>Session Drummer (sessh)</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: #12131c;
      color: #f3f4f6;
      font-family: 'Roboto', system-ui, -apple-system, sans-serif;
    }
  </style>
  <script defer src="./fold-studio-dock.js?v=28"></script>
</head>
<body></body>
</html>
`;
fs.writeFileSync(path.join(DOCS_DIR, 'index.html'), standaloneHtml, 'utf8');
fs.writeFileSync(path.join(DOCS_DIR, '404.html'), standaloneHtml, 'utf8');
fs.writeFileSync(path.join(DOCS_DIR, '.nojekyll'), '', 'utf8');
fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), standaloneHtml, 'utf8');

const standaloneSw = `// Session Drummer ("sessh") WebAPK / PWA Service Worker
const CACHE_NAME = 'sessh-pwa-v28';
const PRECACHE_URLS = [
  './',
  './index.html',
  './fold-studio-dock.js',
  './fold-studio-dock.js?v=28',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first passthrough with offline fallback support so Chrome Android WebAPK minting succeeds
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  if (url.pathname.includes('/api/') || url.pathname.endsWith('/call') || url.pathname.endsWith('/status')) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(event.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html'))
        )
    );
    return;
  }

  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
`;
fs.writeFileSync(path.join(DOCS_DIR, 'sw.js'), standaloneSw, 'utf8');
fs.writeFileSync(path.join(PUBLIC_DIR, 'sw.js'), standaloneSw, 'utf8');

// ----------------------------------------------------------------------------
// 5. Write GitHub Actions Workflow (.github/workflows/deploy-pages.yml)
// ----------------------------------------------------------------------------
const ghWorkflow = `name: Deploy Session Drummer (sessh) PWA to GitHub Pages

on:
  push:
    branches: ["main", "master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload PWA Artifact (./docs)
        uses: actions/upload-pages-artifact@v3
        with:
          path: './docs'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
fs.writeFileSync(path.join(WORKFLOWS_DIR, 'deploy-pages.yml'), ghWorkflow, 'utf8');

console.log('✅ Built Session Drummer ("sessh") GitHub Pages PWA in ./docs:');
for (const f of fs.readdirSync(DOCS_DIR)) {
  const sz = (fs.statSync(path.join(DOCS_DIR, f)).size / 1024).toFixed(1);
  console.log(`   - docs/${f} (${sz} KB)`);
}
