import http from 'http';

const server = http.createServer((req, res) => {
  const options = {
    hostname: 'localhost',
    port: 5173,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'localhost:5173'
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end('<html><head><meta http-equiv="refresh" content="2"></head><body style="font-family: sans-serif; text-align: center; padding: 40px;"><h3>Aaroh dev server initializing on 5173...</h3><p>Reloading automatically in 2 seconds.</p></body></html>');
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(3000, '0.0.0.0', () => {
  console.log('[Aaroh Port 3000 Proxy] Listening on 3000 -> forwarding to localhost:5173');
});
