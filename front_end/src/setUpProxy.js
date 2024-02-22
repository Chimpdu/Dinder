const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', 
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      pathRewrite: function (path, req) {
        return path.replace(/^\/api/, ''); // Replace the first occurrence of '/api' with an empty string
      },
    })
  );
};
