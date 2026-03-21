/**
 * setupProxy.js — proxy para el dev server de CRA (npm start)
 *
 * A diferencia del campo "proxy" en package.json, este archivo usa
 * http-proxy-middleware directamente y proxea TODAS las peticiones a /api,
 * incluyendo las que vienen de <iframe>, <video> o <a href> con Accept: text/html.
 *
 * En producción, nginx hace el mismo proxy (ver nginx.conf).
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://backend:8080',
      changeOrigin: true,
      // Sin filtro por Content-Type ni Accept → proxea iframes, videos y PDFs
      onError: (err, req, res) => {
        console.error('[proxy] Error:', err.message, req.url);
      },
    })
  );
};

