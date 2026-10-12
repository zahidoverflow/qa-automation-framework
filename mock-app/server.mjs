import http from 'node:http';

let inMemoryTemplates = [
  { name: 'Payroll_Standard_Monthly', description: 'Monthly employee payroll distribution' },
  { name: 'Vendor_Operations_ACH', description: 'Recurring vendor payment template' }
];

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // 1. Login & Logout Routes
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
          res.end(renderLoginPage({ error: 'Invalid username or password' }));
        }
      });
      return;
    }

    const isLoggedOut = url.searchParams.get('logout') === 'true';
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderLoginPage({ notice: isLoggedOut ? 'You have been safely signed out.' : '' }));
    return;
  }

  // 2. Dashboard Route
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
          .nav-links a { color: white; margin-left: 20px; text-decoration: none; font-weight: bold; }
          .card { background: white; padding: 20px; margin-top: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .account-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
          .balance { font-weight: bold; color: #2e7d32; font-size: 1.1rem; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Architect Online Banking Portal</h2>
          <div class="nav-links">
            <a href="/dashboard">Accounts</a>
            <a href="/transfers">Transfers</a>
            <a href="/ach/templates">ACH Templates</a>
            <a href="/login?logout=true" id="sign-out-btn">Sign Out</a>
          </div>
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

  // 3. Transfers Route
  if (url.pathname === '/transfers') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        const params = new URLSearchParams(body);
        const amount = parseFloat(params.get('amount') || '0');

        if (amount > 12450.00) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(renderTransfersPage({ error: 'Transfer amount exceeds available checking balance ($12,450.00)' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(renderTransfersPage({ success: `Transfer of $${amount.toFixed(2)} completed successfully.` }));
        }
      });
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderTransfersPage());
    return;
  }

  // 4. ACH Templates Route
  if (url.pathname === '/ach/templates') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        const params = new URLSearchParams(body);
        const templateName = params.get('templateName');
        const description = params.get('description');

        if (templateName && description) {
          inMemoryTemplates.push({ name: templateName, description });
        }
        res.writeHead(302, { Location: '/ach/templates' });
        res.end();
      });
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderTemplatesPage());
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

function renderLoginPage({ error = '', notice = '' } = {}) {
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
        .alert-notice { background: #e8f5e9; color: #2e7d32; padding: 10px; border-radius: 4px; margin-bottom: 16px; font-size: 0.85rem; }
      </style>
    </head>
    <body>
      <div class="login-card">
        <h2 class="title">User Portal Sign In</h2>
        ${notice ? `<div class="alert-notice" role="status">${notice}</div>` : ''}
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

function renderTransfersPage({ error = '', success = '' } = {}) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Architect Online Banking - Transfers</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; }
        .header { background: #003366; color: white; padding: 15px 20px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
        .nav-links a { color: white; margin-left: 20px; text-decoration: none; font-weight: bold; }
        .card { background: white; padding: 24px; margin-top: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px; }
        .form-group { margin-bottom: 16px; }
        label { display: block; margin-bottom: 6px; font-weight: bold; }
        select, input[type="number"] { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        button { padding: 12px 24px; background: #003366; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
        .alert-error { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
        .alert-success { background: #e8f5e9; color: #2e7d32; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Architect Online Banking Portal</h2>
        <div class="nav-links">
          <a href="/dashboard">Accounts</a>
          <a href="/transfers">Transfers</a>
          <a href="/ach/templates">ACH Templates</a>
          <a href="/login?logout=true">Sign Out</a>
        </div>
      </div>
      <div class="card">
        <h1>Internal Funds Transfer</h1>
        ${error ? `<div class="alert-error" role="alert">${error}</div>` : ''}
        ${success ? `<div class="alert-success" role="status">${success}</div>` : ''}
        <form method="POST" action="/transfers">
          <div class="form-group">
            <label for="fromAccount">From Account</label>
            <select id="fromAccount" name="fromAccount">
              <option value="checking">Primary Checking (*4821) - $12,450.00</option>
              <option value="savings">High Yield Savings (*9102) - $45,120.00</option>
            </select>
          </div>
          <div class="form-group">
            <label for="toAccount">To Account</label>
            <select id="toAccount" name="toAccount">
              <option value="savings">High Yield Savings (*9102)</option>
              <option value="checking">Primary Checking (*4821)</option>
            </select>
          </div>
          <div class="form-group">
            <label for="amount">Transfer Amount ($)</label>
            <input id="amount" name="amount" type="number" step="0.01" required />
          </div>
          <button type="submit">Execute Transfer</button>
        </form>
      </div>
    </body>
    </html>
  `;
}

function renderTemplatesPage() {
  const rows = inMemoryTemplates.map(t => `
    <tr class="template-row">
      <td><strong>${t.name}</strong></td>
      <td>${t.description}</td>
      <td><span style="color: #2e7d32; font-weight: bold;">Active</span></td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Architect Online Banking - ACH Templates</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; }
        .header { background: #003366; color: white; padding: 15px 20px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
        .nav-links a { color: white; margin-left: 20px; text-decoration: none; font-weight: bold; }
        .card { background: white; padding: 24px; margin-top: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 16px; }
        label { display: block; margin-bottom: 6px; font-weight: bold; }
        input[type="text"] { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        button { padding: 12px 24px; background: #003366; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8fafc; color: #475569; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Architect Online Banking Portal</h2>
        <div class="nav-links">
          <a href="/dashboard">Accounts</a>
          <a href="/transfers">Transfers</a>
          <a href="/ach/templates">ACH Templates</a>
          <a href="/login?logout=true">Sign Out</a>
        </div>
      </div>
      <div class="card">
        <h1>ACH Payment Templates</h1>
        <form method="POST" action="/ach/templates">
          <div class="form-group">
            <label for="templateName">Template Name</label>
            <input id="templateName" name="templateName" type="text" required />
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <input id="description" name="description" type="text" required />
          </div>
          <button type="submit">Save Template</button>
        </form>

        <h2 style="margin-top: 32px;">Existing Templates</h2>
        <table>
          <thead>
            <tr>
              <th>Template Name</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
}

const PORT = 3000;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Mock Online Banking Server running at http://127.0.0.1:${PORT}`);
});
