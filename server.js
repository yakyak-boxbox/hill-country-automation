const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const routes = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/demo': 'demo_hub_v2.html',
  '/demo/': 'demo_hub_v2.html',
  '/calls': 'cold_call_script.html',
  '/calls/': 'cold_call_script.html',
};

const server = http.createServer((req, res) => {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204); res.end(); return;
  }

  if (req.url === '/api/claude' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        res.writeHead(500, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'API key not configured'}));
        return;
      }
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        }
      };
      const proxyReq = https.request(options, proxyRes => {
        let data = '';
        proxyRes.on('data', chunk => data += chunk);
        proxyRes.on('end', () => {
          res.writeHead(proxyRes.statusCode, {'Content-Type':'application/json'});
          res.end(data);
        });
      });
      proxyReq.on('error', err => {
        res.writeHead(500, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error: err.message}));
      });
      proxyReq.write(body);
      proxyReq.end();
    });
    return;
  }

  const filePath = routes[req.url];
  if (!filePath) { res.writeHead(404); res.end('Not found'); return; }

  fs.readFile(path.join(__dirname, filePath), (err, data) => {
    if (err) { res.writeHead(500); res.end('Error loading page'); return; }
    res.writeHead(200, {'Content-Type':'text/html'});
    res.end(data);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Running on port ${PORT}`));
