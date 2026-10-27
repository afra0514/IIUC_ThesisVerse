import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// The admin panel is a separate page (admin.html) with its own login.
// It is not linked from the main website. This lets you open it at /admin
// (dev server and `vite preview`); on a static host use /admin.html.
const adminRoute = () => {
  const rewrite = (req, _res, next) => {
    if (req.url && /^\/admin\/?(\?.*)?$/.test(req.url)) {
      req.url = '/admin.html';
    }
    next();
  };
  return {
    name: 'admin-route',
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    }
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), adminRoute()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        admin: fileURLToPath(new URL('./admin.html', import.meta.url))
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
