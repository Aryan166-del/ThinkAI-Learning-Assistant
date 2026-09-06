// ============================================
// server.js — Socratic AI Backend (Groq API)
// Run: node server.js
// ============================================
require('dotenv').config();
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// 👉 KEEP YOUR EXISTING GROQ API KEY HERE
const API_KEY = process.env.GROQ_API_KEY;

// ── MIME types ──
const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
};

// ── Server ──
const server = http.createServer((req, res) => {

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── API route ──
  if (req.method === 'POST' && req.url === '/api/chat') {

    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        callAI(payload, res);
      } catch (e) {
        sendJSON(res, 400, {
          error: 'Invalid JSON'
        });
      }
    });

    return;
  }

  // ── Static files ──
  let filePath = '.' + req.url;

  if (filePath === './') {
    filePath = './index.html';
  }

  filePath = filePath.split('?')[0];

  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {

    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': mime
    });

    res.end(data);
  });
});


// ============================================
// AI CALL — GROQ
// ============================================

function callAI(payload, res) {

  const requestBody = JSON.stringify({

    // Valid Groq model
    model: "llama-3.1-8b-instant",

    messages: payload.messages || [],

    temperature: 0.7,

    max_completion_tokens: 1024
  });


  // ── GROQ API CONFIGURATION ──
  const options = {

    hostname: "api.groq.com",

    path: "/openai/v1/chat/completions",

    method: "POST",

    headers: {

      "Authorization": `Bearer ${API_KEY}`,

      "Content-Type": "application/json",

      "Content-Length": Buffer.byteLength(requestBody)
    }
  };


  const apiReq = https.request(options, apiRes => {

    let data = '';

    apiRes.on('data', chunk => {
      data += chunk;
    });


    apiRes.on('end', () => {

      // Forward Groq's response
      res.writeHead(apiRes.statusCode, {
        'Content-Type': 'application/json'
      });

      res.end(data);
    });
  });


  apiReq.on('error', err => {

    console.error("Groq API Error:", err.message);

    sendJSON(res, 500, {
      error: err.message
    });
  });


  apiReq.write(requestBody);

  apiReq.end();
}


// ── Helper ──
function sendJSON(res, status, obj) {

  res.writeHead(status, {
    'Content-Type': 'application/json'
  });

  res.end(JSON.stringify(obj));
}


// ── Start server ──
server.listen(PORT, () => {

  console.log(`🚀 Server running at http://localhost:${PORT}`);

  if (API_KEY === "YOUR_EXISTING_GROQ_API_KEY") {

    console.log("⚠️ Please add your Groq API key in server.js");

  } else {

    console.log("✅ Groq AI connected successfully");
  }
});