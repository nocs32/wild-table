import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const coreApiUrl = 'http://localhost:2570';

// Live tables: the Colyseus client talks to /live (matchmaking over HTTP, then a WebSocket);
// core-api serves those routes at its root.
const liveProxy = {
  target: coreApiUrl,
  ws: true,
  rewrite: (path: string): string => path.replace(/^\/live/u, ''),
};

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      'styled-system': fileURLToPath(new URL('./styled-system', import.meta.url)),
    },
  },
  // 5176 and 4176, one above Telephone Table's 5175 and 4175 (Scribble Table has 5174 and 4174,
  // Felt Table 5173 and 4173), so all four games may run at once.
  server: {
    port: 5176,
    strictPort: true,
    proxy: { '/api': coreApiUrl, '/live': liveProxy },
  },
  // `pnpm play`: the production build is served here, on this machine only, and a Cloudflare Tunnel
  // of its own (not the siblings') brings wild.timnox.dev to it. The preview reuses `server.proxy`,
  // so /api and /live reach core-api exactly as in dev.
  preview: {
    host: '127.0.0.1',
    port: 4176,
    strictPort: true,
    allowedHosts: ['wild.timnox.dev'],
  },
});
