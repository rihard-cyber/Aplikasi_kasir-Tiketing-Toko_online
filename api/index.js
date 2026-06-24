const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'nexapos-saas-secret-2026';

// ─── In-Memory Store ────────────────────────────────────────────────
const store = { owners: [], branches: {}, seeded: false };

function seed() {
  if (store.seeded) return;
  const pw = hashPassword('admin123');
  store.owners = [{ id: 'owner-1', name: 'Edward Stark', email: 'admin@nexapos.com', password: pw, phone: '08123456789', createdAt: new Date().toISOString() }];
  store.branches['branch-1'] = {
    meta: { id: 'branch-1', ownerId: 'owner-1', name: 'Senayan Flagship Store', address: 'Senayan City, Jakarta', phone: '021-1234567', city: 'Jakarta Pusat', createdAt: new Date().toISOString(), active: true },
    products: [
      { id:'p1', name:'Aether Chronograph Onyx', sku:'AETH-ONYX-01', barcode:'899123456001', category:'Luxury Accessories', brand:'Aether', unit:'pcs', cost:4500000, price:8900000, memberPrice:7900000, stock:12, maxStock:30, minStock:5, imgBg:'linear-gradient(135deg,#1e1e1e,#111)', imgEmoji:'⌚', desc:'Luxury mechanical watch.' },
      { id:'p2', name:'Caviar Leather Briefcase', sku:'CAV-BRIEF-02', barcode:'899123456002', category:'Luxury Accessories', brand:'Caviar', unit:'pcs', cost:3200000, price:6500000, memberPrice:5800000, stock:8, maxStock:20, minStock:3, imgBg:'linear-gradient(135deg,#3d2314,#21130b)', imgEmoji:'💼', desc:'Full-grain calfskin leather briefcase.' },
      { id:'p3', name:'Nova Ring V1 Titanium', sku:'NOVA-RING-03', barcode:'899123456003', category:'Gadgets', brand:'NovaTech', unit:'pcs', cost:1800000, price:3499000, memberPrice:3199000, stock:25, maxStock:50, minStock:8, imgBg:'linear-gradient(135deg,#708090,#4f5d65)', imgEmoji:'💍', desc:'Smart titanium ring health tracker.' },
      { id:'p4', name:'Carbon Knight Keyboard', sku:'CRBN-KNGT-04', barcode:'899123456004', category:'Office & Creative', brand:'NexaKey', unit:'pcs', cost:1200000, price:2450000, memberPrice:2200000, stock:4, maxStock:15, minStock:5, imgBg:'linear-gradient(135deg,#2b2b2b,#151515)', imgEmoji:'⌨️', desc:'Gasket-mounted aluminum keyboard.' },
      { id:'p5', name:'Zenith H1 ANC Headphones', sku:'ZENI-H1-05', barcode:'899123456005', category:'Gadgets', brand:'Zenith', unit:'pcs', cost:2100000, price:4200000, memberPrice:3800000, stock:18, maxStock:40, minStock:6, imgBg:'linear-gradient(135deg,#d3d3d3,#a9a9a9)', imgEmoji:'🎧', desc:'Hi-fi wireless ANC headphones.' },
      { id:'p6', name:'Organic Blue Mountain Coffee', sku:'BLU-MNTN-06', barcode:'899123456006', category:'Lifestyle', brand:'Origin Coffee', unit:'pack', cost:450000, price:950000, memberPrice:850000, stock:40, maxStock:100, minStock:10, imgBg:'linear-gradient(135deg,#4b382a,#2f1d11)', imgEmoji:'☕', desc:'Premium coffee beans.' },
      { id:'p7', name:'Spectra 49" Curved OLED', sku:'SPEC-CURV-07', barcode:'899123456007', category:'Office & Creative', brand:'Spectra', unit:'pcs', cost:11500000, price:21990000, memberPrice:19990000, stock:5, maxStock:10, minStock:2, imgBg:'linear-gradient(135deg,#4f46e5,#06b6d4)', imgEmoji:'🖥️', desc:'Ultrawide 49" curved OLED monitor.' },
      { id:'p8', name:'Aurora Buds Pro', sku:'AUR-BUDS-08', barcode:'899123456008', category:'Gadgets', brand:'NovaTech', unit:'pcs', cost:850000, price:1850000, memberPrice:1650000, stock:30, maxStock:60, minStock:10, imgBg:'linear-gradient(135deg,#a78bfa,#ec4899)', imgEmoji:'📳', desc:'Premium wireless earbuds with ANC.' }
    ],
    orders: [],
    transactions: [],
    staff: [{ id:'st1', name:'Edward Stark', role:'Admin', pin:'1234' }, { id:'st2', name:'John Doe', role:'Kasir', pin:'5555' }],
    settings: { companyName: 'Senayan Flagship Store', branchName: 'Senayan Flagship Store', taxRate: 0.11, currency: 'IDR', whatsappNotif: true }
  };
  store.seeded = true;
}

function getOwners() { return store.owners; }
function saveOwners(o) { store.owners = o; }
function getBranches() { return Object.values(store.branches).map(b => b.meta); }
function saveBranches(list) { list.forEach(b => { if (store.branches[b.id]) store.branches[b.id].meta = b; else store.branches[b.id] = { meta: b, products: [], orders: [], transactions: [], staff: [], settings: {} }; }); }
function getBranchData(branchId) { return store.branches[branchId] || null; }
function getBranchFile(branchId, type) { const b = store.branches[branchId]; return b ? b[type] : null; }
function saveBranchFile(branchId, type, data) { if (!store.branches[branchId]) return; store.branches[branchId][type] = data; }

// ─── Crypto ──────────────────────────────────────────────────────────
function base64url(s) { return Buffer.from(s).toString('base64url'); }
function hashPassword(pw) { const salt = crypto.randomBytes(16).toString('hex'); const hash = crypto.scryptSync(pw, salt, 64).toString('hex'); return `${salt}:${hash}`; }
function verifyPassword(pw, stored) { const [salt, hash] = stored.split(':'); return crypto.scryptSync(pw, salt, 64).toString('hex') === hash; }
function createToken(payload) { const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' })); const body = base64url(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 7 * 86400000 })); const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url'); return `${header}.${body}.${sig}`; }
function verifyToken(token) { try { const parts = token.split('.'); if (parts.length !== 3) return null; const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${parts[0]}.${parts[1]}`).digest('base64url'); if (sig !== parts[2]) return null; const p = JSON.parse(Buffer.from(parts[1], 'base64url').toString()); if (p.exp && p.exp < Date.now()) return null; return p; } catch (e) { return null; } }

// ─── Shipping simulation ─────────────────────────────────────────────
const SIM_CITIES = [{ city_id:'39', city_name:'Jakarta Pusat' },{ city_id:'40', city_name:'Jakarta Selatan' },{ city_id:'41', city_name:'Jakarta Barat' },{ city_id:'42', city_name:'Jakarta Timur' },{ city_id:'43', city_name:'Jakarta Utara' },{ city_id:'114', city_name:'Bandung' },{ city_id:'151', city_name:'Bekasi' },{ city_id:'180', city_name:'Bogor' },{ city_id:'261', city_name:'Depok' },{ city_id:'351', city_name:'Kota Surabaya' },{ city_id:'352', city_name:'Kota Surakarta' },{ city_id:'444', city_name:'Makassar' },{ city_id:'455', city_name:'Medan' },{ city_id:'501', city_name:'Padang' },{ city_id:'540', city_name:'Pekanbaru' },{ city_id:'555', city_name:'Pontianak' },{ city_id:'557', city_name:'Samarinda' },{ city_id:'561', city_name:'Semarang' },{ city_id:'581', city_name:'Tangerang' },{ city_id:'585', city_name:'Yogyakarta' }];
function simShipping(courier, weight) { const baseCost = courier === 'jne' ? 15000 : courier === 'tiki' ? 20000 : 18000; const costs = []; costs.push({ service: 'REG', description: 'Regular Service', cost: baseCost + Math.floor(weight * 0.5), etd: '2-3 days' }); costs.push({ service: 'YES', description: 'Yakin Esok Sampai', cost: baseCost * 2 + Math.floor(weight * 0.5), etd: '1 day' }); return { code: courier, name: courier.toUpperCase(), costs }; }

// ─── Handler ─────────────────────────────────────────────────────────
module.exports = (req, res) => {
  seed();

  const { pathname } = new URL(req.url, 'http://localhost');
  const method = req.method;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') { res.status(204).end(); return; }

  const respond = (code, data) => { res.status(code).json(data); };
  const getAuth = () => { const auth = req.headers['authorization']; if (!auth || !auth.startsWith('Bearer ')) return null; return verifyToken(auth.slice(7)); };
  const readBody = () => new Promise(resolve => {
    if (req.body !== undefined) {
      if (typeof req.body === 'string') return resolve(req.body);
      return resolve(JSON.stringify(req.body));
    }
    let b = ''; req.on('data', c => b += c); req.on('end', () => resolve(b));
  });

  // Auth
  if (method === 'POST' && pathname === '/api/auth/register') {
    return (async () => {
      try {
        const { name, email, phone, password } = JSON.parse(await readBody());
        if (!name || !email || !password) return respond(400, { error: 'Name, email, password required' });
        const owners = getOwners();
        if (owners.find(o => o.email === email)) return respond(409, { error: 'Email already registered' });
        const owner = { id: 'owner-' + Date.now().toString(36), name, email, phone: phone || '', password: hashPassword(password), createdAt: new Date().toISOString() };
        owners.push(owner);
        saveOwners(owners);
        respond(201, { success: true, token: createToken({ ownerId: owner.id, email: owner.email, name: owner.name }) });
      } catch (e) { respond(400, { error: e.message }); }
    })();
  }

  if (method === 'POST' && pathname === '/api/auth/login') {
    return (async () => {
      try {
        const { email, password } = JSON.parse(await readBody());
        const owners = getOwners();
        const owner = owners.find(o => o.email === email);
        if (!owner || !verifyPassword(password, owner.password)) return respond(401, { error: 'Invalid email or password' });
        respond(200, { success: true, token: createToken({ ownerId: owner.id, email: owner.email, name: owner.name }) });
      } catch (e) { respond(400, { error: e.message }); }
    })();
  }

  if (method === 'GET' && pathname === '/api/auth/me') {
    const auth = getAuth();
    if (!auth) return respond(401, { error: 'Unauthorized' });
    const owners = getOwners();
    const owner = owners.find(o => o.id === auth.ownerId);
    if (!owner) return respond(404, { error: 'Owner not found' });
    return respond(200, { id: owner.id, name: owner.name, email: owner.email, phone: owner.phone, createdAt: owner.createdAt });
  }

  // Owner Dashboard
  if (method === 'GET' && pathname === '/api/owner/dashboard') {
    const auth = getAuth();
    if (!auth) return respond(401, { error: 'Unauthorized' });
    const branches = getBranches().filter(b => b.ownerId === auth.ownerId);
    let totalRevenue = 0, totalOrders = 0, totalTransactions = 0, totalProducts = 0;
    const branchDetails = branches.map(b => {
      const txns = getBranchFile(b.id, 'transactions') || [];
      const orders = getBranchFile(b.id, 'orders') || [];
      const products = getBranchFile(b.id, 'products') || [];
      const rev = txns.reduce((s, t) => s + (t.total || 0), 0);
      totalRevenue += rev; totalOrders += orders.length; totalTransactions += txns.length;
      totalProducts += products.length;
      return { id: b.id, name: b.name, city: b.city, revenue: rev, orders: orders.length, transactions: txns.length, products: products.length, active: b.active };
    });
    return respond(200, { totalRevenue, totalOrders, totalTransactions, totalProducts, branches: branchDetails });
  }

  if (method === 'GET' && pathname === '/api/owner/sales-history') {
    const auth = getAuth();
    if (!auth) return respond(401, { error: 'Unauthorized' });
    const branches = getBranches().filter(b => b.ownerId === auth.ownerId);
    const dailyMap = {};
    branches.forEach(b => {
      const txns = getBranchFile(b.id, 'transactions') || [];
      txns.forEach(t => {
        const day = (t.date || '').split('T')[0] || 'unknown';
        if (!dailyMap[day]) dailyMap[day] = { date: day, total: 0, count: 0 };
        dailyMap[day].total += t.total || 0;
        dailyMap[day].count += 1;
      });
    });
    return respond(200, Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)));
  }

  // Branches
  if (pathname === '/api/branches') {
    if (method === 'GET') {
      const auth = getAuth();
      if (!auth) return respond(401, { error: 'Unauthorized' });
      const branches = getBranches().filter(b => b.ownerId === auth.ownerId);
      const result = branches.map(b => {
        const orders = getBranchFile(b.id, 'orders') || [];
        const txns = getBranchFile(b.id, 'transactions') || [];
        return { ...b, orderCount: orders.length, txnCount: txns.length, totalSales: txns.reduce((s, t) => s + (t.total || 0), 0) };
      });
      return respond(200, result);
    }
    if (method === 'POST') {
      const auth = getAuth();
      if (!auth) return respond(401, { error: 'Unauthorized' });
      return (async () => {
        try {
          const { name, address, phone, city } = JSON.parse(await readBody());
          if (!name) return respond(400, { error: 'Branch name required' });
          const branch = { id: 'branch-' + Date.now().toString(36), ownerId: auth.ownerId, name, address: address || '', phone: phone || '', city: city || '', createdAt: new Date().toISOString(), active: true };
          store.branches[branch.id] = { meta: branch, products: [], orders: [], transactions: [], staff: [], settings: { companyName: name, branchName: name, taxRate: 0.11, currency: 'IDR' } };
          respond(201, { success: true, branch });
        } catch (e) { respond(400, { error: e.message }); }
      })();
    }
    return;
  }

  const branchMatch = pathname.match(/^\/api\/branches\/([^/]+)$/);
  if (branchMatch) {
    const branchId = branchMatch[1];
    if (method === 'PUT') {
      const auth = getAuth();
      if (!auth) return respond(401, { error: 'Unauthorized' });
      return (async () => {
        try {
          const branches = getBranches();
          const idx = branches.findIndex(b => b.id === branchId && b.ownerId === auth.ownerId);
          if (idx === -1) return respond(404, { error: 'Branch not found' });
          const update = JSON.parse(await readBody());
          const merged = { ...branches[idx], ...update, id: branchId, ownerId: auth.ownerId };
          store.branches[branchId].meta = merged;
          respond(200, { success: true, branch: merged });
        } catch (e) { respond(400, { error: e.message }); }
      })();
    }
    if (method === 'DELETE') {
      const auth = getAuth();
      if (!auth) return respond(401, { error: 'Unauthorized' });
      delete store.branches[branchId];
      return respond(200, { success: true });
    }
    return;
  }

  // Branch Data
  const requireBranchAuth = () => {
    const auth = getAuth();
    if (!auth) return null;
    const br = new URL(req.url, `http://${req.headers.host}`).searchParams.get('branch');
    if (!br) return null;
    const branches = getBranches();
    const branch = branches.find(b => b.id === br && b.ownerId === auth.ownerId);
    if (!branch) return null;
    return { auth, branch };
  };

  if (method === 'GET' && pathname === '/api/branch/products') { const ctx = requireBranchAuth(); if (!ctx) return respond(401, { error: 'Unauthorized' }); return respond(200, getBranchFile(ctx.branch.id, 'products') || []); }
  if (method === 'POST' && pathname === '/api/branch/products') { const ctx = requireBranchAuth(); if (!ctx) return respond(401, { error: 'Unauthorized' }); return (async () => { try { saveBranchFile(ctx.branch.id, 'products', JSON.parse(await readBody())); respond(200, { success: true }); } catch (e) { respond(400, { error: e.message }); } })(); }
  if (method === 'GET' && pathname === '/api/branch/orders') { const ctx = requireBranchAuth(); if (!ctx) return respond(401, { error: 'Unauthorized' }); return respond(200, getBranchFile(ctx.branch.id, 'orders') || []); }
  if (method === 'POST' && pathname === '/api/branch/orders') { const ctx = requireBranchAuth(); if (!ctx) return respond(401, { error: 'Unauthorized' }); return (async () => { try { saveBranchFile(ctx.branch.id, 'orders', JSON.parse(await readBody())); respond(200, { success: true }); } catch (e) { respond(400, { error: e.message }); } })(); }
  if (method === 'GET' && pathname === '/api/branch/transactions') { const ctx = requireBranchAuth(); if (!ctx) return respond(401, { error: 'Unauthorized' }); return respond(200, getBranchFile(ctx.branch.id, 'transactions') || []); }
  if (method === 'POST' && pathname === '/api/branch/transactions') { const ctx = requireBranchAuth(); if (!ctx) return respond(401, { error: 'Unauthorized' }); return (async () => { try { saveBranchFile(ctx.branch.id, 'transactions', JSON.parse(await readBody())); respond(200, { success: true }); } catch (e) { respond(400, { error: e.message }); } })(); }
  if (method === 'GET' && pathname === '/api/branch/staff') { const ctx = requireBranchAuth(); if (!ctx) return respond(401, { error: 'Unauthorized' }); return respond(200, getBranchFile(ctx.branch.id, 'staff') || []); }
  if (method === 'POST' && pathname === '/api/branch/staff') { const ctx = requireBranchAuth(); if (!ctx) return respond(401, { error: 'Unauthorized' }); return (async () => { try { saveBranchFile(ctx.branch.id, 'staff', JSON.parse(await readBody())); respond(200, { success: true }); } catch (e) { respond(400, { error: e.message }); } })(); }
  if (method === 'GET' && pathname === '/api/branch/settings') { const ctx = requireBranchAuth(); if (!ctx) return respond(401, { error: 'Unauthorized' }); return respond(200, getBranchFile(ctx.branch.id, 'settings') || {}); }
  if (method === 'POST' && pathname === '/api/branch/settings') { const ctx = requireBranchAuth(); if (!ctx) return respond(401, { error: 'Unauthorized' }); return (async () => { try { saveBranchFile(ctx.branch.id, 'settings', JSON.parse(await readBody())); respond(200, { success: true }); } catch (e) { respond(400, { error: e.message }); } })(); }

  // Store
  if (method === 'GET' && pathname === '/api/store/products') {
    const branchId = new URL(req.url, `http://${req.headers.host}`).searchParams.get('branch');
    let products = [];
    if (branchId) { products = getBranchFile(branchId, 'products') || []; }
    else { const branches = getBranches(); if (branches.length) products = getBranchFile(branches[0].id, 'products') || []; }
    return respond(200, products.filter(p => p.stock > 0).map(p => ({ id: p.id, name: p.name, price: p.price, stock: p.stock, category: p.category || 'Umum', image: p.imgEmoji || '📦', description: p.desc || '', unit: p.unit || 'pcs', sku: p.sku, imgBg: p.imgBg || 'linear-gradient(135deg,#1e293b,#0f172a)', imgEmoji: p.imgEmoji || '📦' })));
  }

  if (method === 'POST' && pathname === '/api/store/checkout') {
    return (async () => {
      try {
        const body = JSON.parse(await readBody());
        const branchId = body.branchId;
        if (!branchId) return respond(400, { error: 'Branch ID required' });
        const products = getBranchFile(branchId, 'products') || [];
        const orders = getBranchFile(branchId, 'orders') || [];
        for (const item of (body.items || [])) { const prod = products.find(p => p.id === item.id); if (prod && prod.stock < item.qty) return respond(400, { error: `Stok ${prod.name} tidak mencukupi (tersedia: ${prod.stock})` }); }
        for (const item of (body.items || [])) { const prod = products.find(p => p.id === item.id); if (prod) prod.stock -= item.qty; }
        const order = { id: Date.now(), invoiceNo: 'INV-' + Date.now().toString(36).toUpperCase(), timestamp: new Date().toISOString(), status: 'pending', source: 'online', branchId, items: body.items || [], subtotal: body.subtotal || 0, shippingCost: body.shippingCost || 0, shippingCourier: body.shippingCourier || '', shippingService: body.shippingService || '', shippingEtd: body.shippingEtd || '', total: body.total || 0, customerName: body.customerName || '', customerPhone: body.customerPhone || '', customerAddress: body.customerAddress || '', customerCity: body.customerCity || '', customerNote: body.customerNote || '', paymentMethod: body.paymentMethod || 'transfer', paymentStatus: 'unpaid', resi: '', resiDate: '' };
        orders.push(order);
        saveBranchFile(branchId, 'products', products);
        saveBranchFile(branchId, 'orders', orders);
        respond(201, { success: true, order });
      } catch (e) { respond(400, { error: e.message }); }
    })();
  }

  const storeOrderMatch = pathname.match(/^\/api\/store\/orders\/(\d+)$/);
  if (method === 'GET' && storeOrderMatch) {
    const branchId = new URL(req.url, `http://${req.headers.host}`).searchParams.get('branch');
    const orders = branchId ? (getBranchFile(branchId, 'orders') || []) : [];
    const order = orders.find(o => o.id === Number(storeOrderMatch[1]));
    if (!order) return respond(404, { error: 'Order not found' });
    return respond(200, order);
  }

  // Shipping
  if (method === 'POST' && pathname === '/api/shipping/cost') {
    return (async () => {
      try {
        const { origin, destination, weight, courier } = JSON.parse(await readBody());
        return respond(200, { rajaongkir: { results: [simShipping((courier || 'jne').toLowerCase(), weight || 1000)] } });
      } catch (e) { respond(500, { error: e.message }); }
    })();
  }

  if (method === 'GET' && pathname === '/api/shipping/cities') {
    return respond(200, { rajaongkir: { results: SIM_CITIES } });
  }

  // Legacy API
  const firstBranch = () => { const b = getBranches(); return b.length ? b[0].id : null; };
  if (method === 'GET' && pathname === '/api/products') { const id = firstBranch(); return respond(200, id ? (getBranchFile(id, 'products') || []) : []); }
  if (method === 'GET' && pathname === '/api/orders') { const id = firstBranch(); return respond(200, id ? (getBranchFile(id, 'orders') || []) : []); }
  if (method === 'GET' && pathname === '/api/settings') { const id = firstBranch(); return respond(200, id ? (getBranchFile(id, 'settings') || {}) : {}); }

  if (method === 'POST' && pathname === '/api/sync') {
    return (async () => {
      try {
        const data = JSON.parse(await readBody());
        const id = firstBranch();
        if (id) { if (data.products) saveBranchFile(id, 'products', data.products); if (data.settings) saveBranchFile(id, 'settings', data.settings); if (data.staffList) saveBranchFile(id, 'staff', data.staffList); }
        respond(200, { success: true });
      } catch (e) { respond(400, { error: e.message }); }
    })();
  }

  if (method === 'PUT' && pathname === '/api/settings') {
    return (async () => {
      try {
        const s = JSON.parse(await readBody());
        const id = firstBranch();
        if (id) { const settings = getBranchFile(id, 'settings') || {}; Object.assign(settings, s); saveBranchFile(id, 'settings', settings); }
        respond(200, { success: true });
      } catch (e) { respond(400, { error: e.message }); }
    })();
  }

  if (method === 'POST' && pathname === '/api/orders') {
    return (async () => {
      try {
        const order = JSON.parse(await readBody());
        order.id = Date.now(); order.timestamp = new Date().toISOString(); order.status = 'pending';
        const id = firstBranch();
        if (id) { const orders = getBranchFile(id, 'orders') || []; orders.push(order); saveBranchFile(id, 'orders', orders); }
        respond(201, { success: true, orderId: order.id });
      } catch (e) { respond(400, { error: 'Invalid JSON' }); }
    })();
  }

  const legacyOrderMatch = pathname.match(/^\/api\/orders\/(\d+)$/);
  if (method === 'PUT' && legacyOrderMatch) {
    return (async () => {
      try {
        const orderId = Number(legacyOrderMatch[1]);
        const update = JSON.parse(await readBody());
        const id = firstBranch();
        if (id) { const orders = getBranchFile(id, 'orders') || []; const idx = orders.findIndex(o => o.id === orderId); if (idx !== -1) orders[idx] = { ...orders[idx], ...update }; saveBranchFile(id, 'orders', orders); }
        respond(200, { success: true });
      } catch (e) { respond(400, { error: 'Invalid JSON' }); }
    })();
  }

  respond(404, { error: 'Not found' });
};
