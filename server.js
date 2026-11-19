const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.csv': 'text/csv',
  '.md': 'application/octet-stream',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.zip': 'application/zip'
};

const server = http.createServer((req, res) => {
  let safePath = decodeURIComponent(req.url.split('?')[0]);
  if (safePath === '/bible' || safePath === '/deck') safePath = '/bible.html';
  if (safePath === '/walkthrough') safePath = '/walkthrough.html';
  if (safePath === '/master-blueprint' || safePath === '/blueprint') safePath = '/master-blueprint.html';

  let filePath = path.join(__dirname, safePath === '/' ? 'index.html' : safePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(__dirname, 'index.html'), (err2, indexData) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        } else {
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff'
          });
          res.end(indexData);
        }
      });
    } else {
      let ext = path.extname(filePath).toLowerCase();
      let mime = MIME_TYPES[ext] || 'application/octet-stream';
      let headers = {
        'Content-Type': mime,
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      };

      if (ext === '.pptx') {
        const fname = path.basename(filePath);
        headers['Content-Disposition'] = `attachment; filename="${fname}"`;
      }
      if (ext === '.zip') {
        headers['Content-Disposition'] = 'attachment; filename="lanil-sports.zip"';
      }
      if (ext === '.xlsx') {
        headers['Content-Disposition'] = 'attachment; filename="LA_High_School_Yearbook_NIL_Directory_2026_2027.xlsx"';
      }
      if (ext === '.docx' || ext === '.md') {
        const fname = path.basename(filePath);
        headers['Content-Disposition'] = `attachment; filename="${fname}"`;
      }

      res.writeHead(200, headers);
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`LANILSPORTS server active on http://localhost:${PORT}`);
});
