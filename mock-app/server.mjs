import http from 'node:http';

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/' || url.pathname === '/login') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        const params = new URLSearchParams(body);
        const username = params.get('username');
        const password = params.get('password');

        if (username === 'testuser@example.com' && password === 'SecurePassword123!') {
          res.writeHead(302, { Location: '/dashboard' });
          res.end();
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(renderLoginPage('Invalid username or password'));
        }
      });
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderLoginPage());
    return;
  }

  if (url.pathname === '/dashboard') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Architect Online Banking - Dashboard</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; }
          .header { background: #003366; color: white; padding: 15px 20px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
          .card { background: white; padding: 20px; margin-top: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .account-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
          .balance { font-weight: bold; color: #2e7d32; font-size: 1.1rem; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Architect Online Banking Portal</h2>
          <a href="/login" style="color: white; text-decoration: none;">Sign Out</a>
        </div>
        <div class="card">
          <h1>Account Summary</h1>
          <div class="account-row">
            <span>Primary Checking (*4821)</span>
            <span class="balance" data-testid="checking-balance">$12,450.00</span>
          </div>
          <div class="account-row">
            <span>High Yield Savings (*9102)</span>
            <span class="balance" data-testid="savings-balance">$45,120.00</span>
          </div>
        </div>
      </body>
      </html>
    `);
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

function renderLoginPage(error = '') {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Architect Online Banking - Sign In</title>
      <style>
        body { font-family: Arial, sans-serif; background: #eaedf2; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .login-card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 360px; }
        .title { color: #003366; text-align: center; margin-bottom: 24px; }
        .form-group { margin-bottom: 16px; }
        label { display: block; margin-bottom: 6px; font-weight: bold; font-size: 0.9rem; }
        input[type="text"], input[type="password"] { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #003366; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
        button:hover { background: #002244; }
        .alert-error { background: #ffebee; color: #c62828; padding: 10px; border-radius: 4px; margin-bottom: 16px; font-size: 0.85rem; }
      </style>
    </head>
    <body>
      <div class="login-card">
        <h2 class="title">User Portal Sign In</h2>
        ${error ? `<div class="alert-error" role="alert">${error}</div>` : ''}
        <form method="POST" action="/login">
          <div class="form-group">
            <label for="username">Username</label>
            <input id="username" name="username" type="text" autocomplete="username" required />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required />
          </div>
          <button type="submit">Sign In</button>
        </form>
      </div>
    </body>
    </html>
  `;
}

const PORT = 3000;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Mock Online Banking Server running at http://127.0.0.1:${PORT}`);
});
