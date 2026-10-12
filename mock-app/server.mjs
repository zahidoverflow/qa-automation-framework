import http from 'node:http';

let inMemoryTemplates = [
  { name: 'Payroll_Standard_Monthly', description: 'Monthly employee payroll distribution' },
  { name: 'Vendor_Operations_ACH', description: 'Recurring vendor payment template' }
];

let inMemoryPayees = [
  { name: 'Electric Utility Corp', account: '987654321', category: 'Utilities', status: 'Active' },
  { name: 'Metro Water & Sewage', account: '456789123', category: 'Utilities', status: 'Active' }
];

let inMemoryProfile = {
  fullName: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phone: '555-019-2834',
  paperless: true
};

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
    res.end(renderDashboardPage());
    return;
  }

  // 3. Transfers Route
  if (url.pathname === '/transfers') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        const params = new URLSearchParams(body);
        const fromAccount = params.get('fromAccount');
        const toAccount = params.get('toAccount');
        const amount = parseFloat(params.get('amount') || '0');

        if (fromAccount === toAccount) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(renderTransfersPage({ error: 'Source and destination accounts must be different' }));
          return;
        }

        if (amount <= 0 || isNaN(amount)) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(renderTransfersPage({ error: 'Transfer amount must be greater than zero' }));
          return;
        }

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
        const templateName = (params.get('templateName') || '').trim();
        const description = (params.get('description') || '').trim();

        if (!templateName || !description) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(renderTemplatesPage({ error: 'Template name and description are required' }));
          return;
        }

        inMemoryTemplates.push({ name: templateName, description });
        res.writeHead(302, { Location: '/ach/templates' });
        res.end();
      });
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderTemplatesPage());
    return;
  }

  // 5. Bill Pay Route
  if (url.pathname === '/billpay') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        const params = new URLSearchParams(body);
        const payee = params.get('payee');
        const amount = parseFloat(params.get('amount') || '0');
        const payDate = params.get('payDate');

        if (amount <= 0 || isNaN(amount)) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(renderBillPayPage({ error: 'Payment amount must be greater than zero' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(renderBillPayPage({ success: `Bill payment of $${amount.toFixed(2)} to ${payee} scheduled for ${payDate}.` }));
      });
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderBillPayPage());
    return;
  }

  // 6. Payees Management Route
  if (url.pathname === '/payees') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        const params = new URLSearchParams(body);
        const payeeName = (params.get('payeeName') || '').trim();
        const accountNumber = (params.get('accountNumber') || '').trim();
        const category = (params.get('category') || 'General').trim();

        if (!payeeName || !accountNumber) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(renderPayeesPage({ error: 'Payee name and account number are required' }));
          return;
        }

        inMemoryPayees.push({ name: payeeName, account: accountNumber, category, status: 'Active' });
        res.writeHead(302, { Location: '/payees' });
        res.end();
      });
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderPayeesPage());
    return;
  }

  // 7. Profile & Settings Route
  if (url.pathname === '/profile') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        const params = new URLSearchParams(body);
        const email = (params.get('email') || '').trim();
        const phone = (params.get('phone') || '').trim();
        const paperless = params.get('paperless') === 'on';

        if (!email.includes('@')) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(renderProfilePage({ error: 'Please enter a valid email address' }));
          return;
        }

        inMemoryProfile.email = email;
        inMemoryProfile.phone = phone;
        inMemoryProfile.paperless = paperless;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(renderProfilePage({ success: 'Contact preferences updated successfully' }));
      });
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderProfilePage());
    return;
  }

  // 8. Account Activity / Statements Route
  if (url.pathname === '/activity') {
    const filter = url.searchParams.get('type') || 'all';
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderActivityPage(filter));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

function renderHeader(activeNav = '') {
  return `
    <div class="header">
      <h2>Architect Online Banking Portal</h2>
      <div class="nav-links">
        <a href="/dashboard">Accounts</a>
        <a href="/transfers">Transfers</a>
        <a href="/billpay">Bill Pay</a>
        <a href="/payees">Payees</a>
        <a href="/ach/templates">ACH</a>
        <a href="/activity">Activity</a>
        <a href="/profile">Profile</a>
        <a href="/login?logout=true" id="sign-out-btn">Sign Out</a>
      </div>
    </div>
  `;
}

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

function renderDashboardPage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Architect Online Banking - Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; }
        .header { background: #003366; color: white; padding: 15px 20px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
        .nav-links a { color: white; margin-left: 15px; text-decoration: none; font-weight: bold; }
        .card { background: white; padding: 20px; margin-top: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .account-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .balance { font-weight: bold; color: #2e7d32; font-size: 1.1rem; }
      </style>
    </head>
    <body>
      ${renderHeader()}
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
        .nav-links a { color: white; margin-left: 15px; text-decoration: none; font-weight: bold; }
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
      ${renderHeader()}
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

function renderTemplatesPage({ error = '' } = {}) {
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
        .nav-links a { color: white; margin-left: 15px; text-decoration: none; font-weight: bold; }
        .card { background: white; padding: 24px; margin-top: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 16px; }
        label { display: block; margin-bottom: 6px; font-weight: bold; }
        input[type="text"] { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        button { padding: 12px 24px; background: #003366; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
        .alert-error { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8fafc; color: #475569; }
      </style>
    </head>
    <body>
      ${renderHeader()}
      <div class="card">
        <h1>ACH Payment Templates</h1>
        ${error ? `<div class="alert-error" role="alert">${error}</div>` : ''}
        <form method="POST" action="/ach/templates">
          <div class="form-group">
            <label for="templateName">Template Name</label>
            <input id="templateName" name="templateName" type="text" />
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <input id="description" name="description" type="text" />
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

function renderBillPayPage({ error = '', success = '' } = {}) {
  const payeeOptions = inMemoryPayees.map(p => `
    <option value="${p.name}">${p.name} (Acct: ...${p.account.slice(-4)})</option>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Architect Online Banking - Bill Pay</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; }
        .header { background: #003366; color: white; padding: 15px 20px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
        .nav-links a { color: white; margin-left: 15px; text-decoration: none; font-weight: bold; }
        .card { background: white; padding: 24px; margin-top: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px; }
        .form-group { margin-bottom: 16px; }
        label { display: block; margin-bottom: 6px; font-weight: bold; }
        select, input[type="number"], input[type="date"] { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        button { padding: 12px 24px; background: #003366; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
        .alert-error { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
        .alert-success { background: #e8f5e9; color: #2e7d32; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
      </style>
    </head>
    <body>
      ${renderHeader()}
      <div class="card">
        <h1>Schedule Bill Payment</h1>
        ${error ? `<div class="alert-error" role="alert">${error}</div>` : ''}
        ${success ? `<div class="alert-success" role="status">${success}</div>` : ''}
        <form method="POST" action="/billpay">
          <div class="form-group">
            <label for="payee">Select Payee</label>
            <select id="payee" name="payee">
              ${payeeOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="payDate">Payment Date</label>
            <input id="payDate" name="payDate" type="date" value="2026-10-20" required />
          </div>
          <div class="form-group">
            <label for="amount">Payment Amount ($)</label>
            <input id="amount" name="amount" type="number" step="0.01" required />
          </div>
          <button type="submit">Submit Payment</button>
        </form>
      </div>
    </body>
    </html>
  `;
}

function renderPayeesPage({ error = '' } = {}) {
  const rows = inMemoryPayees.map(p => `
    <tr class="payee-row">
      <td><strong>${p.name}</strong></td>
      <td>****${p.account.slice(-4)}</td>
      <td>${p.category}</td>
      <td><span style="color: #2e7d32; font-weight: bold;">${p.status}</span></td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Architect Online Banking - Manage Payees</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; }
        .header { background: #003366; color: white; padding: 15px 20px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
        .nav-links a { color: white; margin-left: 15px; text-decoration: none; font-weight: bold; }
        .card { background: white; padding: 24px; margin-top: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 16px; }
        label { display: block; margin-bottom: 6px; font-weight: bold; }
        input[type="text"] { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        button { padding: 12px 24px; background: #003366; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
        .alert-error { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8fafc; color: #475569; }
      </style>
    </head>
    <body>
      ${renderHeader()}
      <div class="card">
        <h1>Add New Bill Payee</h1>
        ${error ? `<div class="alert-error" role="alert">${error}</div>` : ''}
        <form method="POST" action="/payees">
          <div class="form-group">
            <label for="payeeName">Payee Name</label>
            <input id="payeeName" name="payeeName" type="text" />
          </div>
          <div class="form-group">
            <label for="accountNumber">Account / Biller Number</label>
            <input id="accountNumber" name="accountNumber" type="text" />
          </div>
          <div class="form-group">
            <label for="category">Category</label>
            <input id="category" name="category" type="text" value="Utilities" />
          </div>
          <button type="submit">Add Payee</button>
        </form>

        <h2 style="margin-top: 32px;">Registered Payees</h2>
        <table>
          <thead>
            <tr>
              <th>Payee Name</th>
              <th>Account Number</th>
              <th>Category</th>
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

function renderProfilePage({ error = '', success = '' } = {}) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Architect Online Banking - Profile Settings</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; }
        .header { background: #003366; color: white; padding: 15px 20px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
        .nav-links a { color: white; margin-left: 15px; text-decoration: none; font-weight: bold; }
        .card { background: white; padding: 24px; margin-top: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px; }
        .form-group { margin-bottom: 16px; }
        label { display: block; margin-bottom: 6px; font-weight: bold; }
        input[type="text"] { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        button { padding: 12px 24px; background: #003366; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
        .alert-error { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
        .alert-success { background: #e8f5e9; color: #2e7d32; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
        .checkbox-group { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
      </style>
    </head>
    <body>
      ${renderHeader()}
      <div class="card">
        <h1>Profile & Notification Settings</h1>
        ${error ? `<div class="alert-error" role="alert">${error}</div>` : ''}
        ${success ? `<div class="alert-success" role="status">${success}</div>` : ''}
        <form method="POST" action="/profile">
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input id="fullName" name="fullName" type="text" value="${inMemoryProfile.fullName}" readonly style="background: #f1f5f9;" />
          </div>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input id="email" name="email" type="text" value="${inMemoryProfile.email}" />
          </div>
          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input id="phone" name="phone" type="text" value="${inMemoryProfile.phone}" />
          </div>
          <div class="checkbox-group">
            <input id="paperless" name="paperless" type="checkbox" ${inMemoryProfile.paperless ? 'checked' : ''} />
            <label for="paperless" style="margin: 0; font-weight: normal;">Enroll in Paperless e-Statements</label>
          </div>
          <button type="submit">Update Preferences</button>
        </form>
      </div>
    </body>
    </html>
  `;
}

function renderActivityPage(filter = 'all') {
  const transactions = [
    { date: '2026-10-10', desc: 'Payroll Direct Deposit', type: 'Credit', amount: '+$3,250.00' },
    { date: '2026-10-08', desc: 'Whole Foods Market #102', type: 'Debit', amount: '-$84.20' },
    { date: '2026-10-05', desc: 'Electric Utility Autopay', type: 'Debit', amount: '-$125.40' },
    { date: '2026-10-01', desc: 'ATM Cash Withdrawal', type: 'Debit', amount: '-$200.00' },
  ];

  const filtered = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type.toLowerCase() === filter.toLowerCase());

  const rows = filtered.map(t => `
    <tr class="tx-row">
      <td>${t.date}</td>
      <td><strong>${t.desc}</strong></td>
      <td>${t.type}</td>
      <td style="color: ${t.type === 'Credit' ? '#2e7d32' : '#c62828'}; font-weight: bold;">${t.amount}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Architect Online Banking - Account Activity</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; }
        .header { background: #003366; color: white; padding: 15px 20px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
        .nav-links a { color: white; margin-left: 15px; text-decoration: none; font-weight: bold; }
        .card { background: white; padding: 24px; margin-top: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .filter-bar { margin: 16px 0; display: flex; gap: 10px; align-items: center; }
        .filter-btn { padding: 8px 16px; background: #e2e8f0; text-decoration: none; color: #1e293b; border-radius: 4px; font-weight: bold; }
        .filter-btn.active { background: #003366; color: white; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8fafc; color: #475569; }
      </style>
    </head>
    <body>
      ${renderHeader()}
      <div class="card">
        <h1>Account Activity & History</h1>
        <div class="filter-bar">
          <span>Filter Transactions:</span>
          <a href="/activity?type=all" class="filter-btn ${filter === 'all' ? 'active' : ''}">All</a>
          <a href="/activity?type=credit" class="filter-btn ${filter === 'credit' ? 'active' : ''}">Credits</a>
          <a href="/activity?type=debit" class="filter-btn ${filter === 'debit' ? 'active' : ''}">Debits</a>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Type</th>
              <th>Amount</th>
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
