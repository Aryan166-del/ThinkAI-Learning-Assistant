const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { callGroq(JSON.parse(body), res); }
      catch (e) { res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' })); }
    });
    return;
  }

  let filePath = '.' + req.url;
  if (filePath === './') filePath = './index.html';
  filePath = filePath.split('?')[0];
  const mime = MIME[path.extname(filePath)] || 'text/plain';
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not Found'); return; }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

function callGroq(payload, res) {
  const messages = [
    { role: 'system', content: 'You are a Socratic AI Tutor. Help students learn through guided questions and clear explanations.' },
    ...(payload.messages || [])
  ];
  const body = JSON.stringify({ model: GROQ_MODEL, messages, max_tokens: 1024, temperature: 0.7 });
  const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };
  const apiReq = https.request(options, apiRes => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(data); });
  });
  apiReq.on('error', err => { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); });
  apiReq.write(body);
  apiReq.end();
}

server.listen(PORT, () => {
  console.log(`\n🦉 Socratic AI Server running!`);
  console.log(`   Open: http://localhost:${PORT}`);
  console.log(`✅ Groq AI connected — model: ${GROQ_MODEL}\n`);
});