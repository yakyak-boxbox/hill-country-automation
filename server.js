const http = require('http');
const fs = require('fs');
const path = require('path');

const routes = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/demo': 'demo_hub_v2.html',
  '/demo/': 'demo_hub_v2.html',
  '/calls': 'cold_call_script.html',
  '/calls/': 'cold_call_script.html',
};

const server = http.createServer((req, res) => {
  const filePath = routes[req.url];
  if (!filePath) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  fs.readFile(path.join(__dirname, filePath), (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading page');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Running on port ${PORT}`));
