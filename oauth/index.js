const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const ORIGIN = process.env.ORIGIN || 'https://jaitoutessaye-production.up.railway.app';
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  // /auth — redirige vers GitHub OAuth
  if (parsed.pathname === '/auth') {
    const params = querystring.stringify({
      client_id: CLIENT_ID,
      scope: 'repo,user',
      redirect_uri: `https://${req.headers.host}/callback`,
    });
    res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params}` });
    res.end();
    return;
  }

  // /callback — échange le code contre un token
  if (parsed.pathname === '/callback') {
    const code = parsed.query.code;
    const postData = querystring.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code });
    const options = {
      hostname: 'github.com',
      path: '/login/oauth/access_token',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    };
    const ghReq = https.request(options, (ghRes) => {
      let data = '';
      ghRes.on('data', (chunk) => (data += chunk));
      ghRes.on('end', () => {
        const { access_token, error } = JSON.parse(data);
        if (error || !access_token) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`<script>window.opener.postMessage('authorization:github:error:${error}','${ORIGIN}');window.close();</script>`);
          return;
        }
        const msg = JSON.stringify({ token: access_token, provider: 'github' });
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<script>window.opener.postMessage('authorization:github:success:${msg}','${ORIGIN}');window.close();</script>`);
      });
    });
    ghReq.write(postData);
    ghReq.end();
    return;
  }

  res.writeHead(200);
  res.end('OAuth proxy OK');
});

server.listen(PORT, () => console.log(`OAuth proxy running on port ${PORT}`));
