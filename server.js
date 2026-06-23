/**
 * NexaPOS SaaS v5.0
 * Multi-tenant POS Server — Auth, Branches, Owner Dashboard
 *
 * Mode SINGLE (backward-compatible):  /  serves legacy POS
 * Mode SAAS:                         /owner — owner portal
 *                                    /pos?branch=X&token=Y — branch POS
 *                                    /store?branch=X — online store
 */

const http = require('http');
const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const JWT_SECRET = process.env.JWT_SECRET || 'nexapos-saas-secret-2026';

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ─── Persistence ───────────────────────────────────────────────────────
function readJSON(file) {
  const fp = path.join(DATA_DIR, file);
  try { if (fs.existsSync(fp)) return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) {}
  return null;
}
function writeJSON(file, data) {
  try { fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2)); } catch (e) {}
}

// ─── Crypto Helpers ────────────────────────────────────────────────────
function base64url(s) { return Buffer.from(s).toString('base64url'); }

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(pw, stored) {
  const [salt, hash] = stored.split(':');
  return crypto.scryptSync(pw, salt, 64).toString('hex') === hash;
}

function createToken(payload) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 7 * 86400000 }));
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}
function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${parts[0]}.${parts[1]}`).digest('base64url');
    if (sig !== parts[2]) return null;
    const p = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (p.exp && p.exp < Date.now()) return null;
    return p;
  } catch (e) { return null; }
}

// ─── Data Store ────────────────────────────────────────────────────────
function getOwners() { return readJSON('owners.json') || []; }
function saveOwners(o) { writeJSON('owners.json', o); }
function getBranches() { return readJSON('branches.json') || []; }
function saveBranches(b) { writeJSON('branches.json', b); }

function getBranchFile(branchId, type) { return readJSON(`branch_${branchId}_${type}.json`); }
function saveBranchFile(branchId, type, data) { writeJSON(`branch_${branchId}_${type}.json`, data); }

// ─── Seed: default owner if none exist ──────────────────────────────────
function seed() {
  const owners = getOwners();
  if (owners.length === 0) {
    owners.push({
      id: 'owner-1', name: 'Edward Stark', email: 'admin@nexapos.com',
      password: hashPassword('admin123'), phone: '08123456789',
      createdAt: new Date().toISOString()
    });
    saveOwners(owners);
    console.log('  Default owner: admin@nexapos.com / admin123');
  }
  const branches = getBranches();
  if (branches.length === 0) {
    branches.push({
      id: 'branch-1', ownerId: 'owner-1', name: 'Senayan Flagship Store',
      address: 'Senayan City, Jakarta', phone: '021-1234567', city: 'Jakarta Pusat',
      createdAt: new Date().toISOString(), active: true
    });
    saveBranches(branches);
    // Seed branch products from legacy
    if (!getBranchFile('branch-1', 'products')) {
      saveBranchFile('branch-1', 'products', [
        { id:'p1', name:'Aether Chronograph Onyx', sku:'AETH-ONYX-01', barcode:'899123456001', category:'Luxury Accessories', brand:'Aether', unit:'pcs', cost:4500000, price:8900000, memberPrice:7900000, stock:12, maxStock:30, minStock:5, imgBg:'linear-gradient(135deg,#1e1e1e,#111)', imgEmoji:'⌚', desc:'Luxury mechanical watch with onyx bezel.' },
        { id:'p2', name:'Caviar Leather Briefcase', sku:'CAV-BRIEF-02', barcode:'899123456002', category:'Luxury Accessories', brand:'Caviar', unit:'pcs', cost:3200000, price:6500000, memberPrice:5800000, stock:8, maxStock:20, minStock:3, imgBg:'linear-gradient(135deg,#3d2314,#21130b)', imgEmoji:'💼', desc:'Full-grain calfskin leather briefcase.' },
        { id:'p3', name:'Nova Ring V1 Titanium', sku:'NOVA-RING-03', barcode:'899123456003', category:'Gadgets', brand:'NovaTech', unit:'pcs', cost:1800000, price:3499000, memberPrice:3199000, stock:25, maxStock:50, minStock:8, imgBg:'linear-gradient(135deg,#708090,#4f5d65)', imgEmoji:'💍', desc:'Smart titanium ring health tracker.' },
        { id:'p4', name:'Carbon Knight Keyboard', sku:'CRBN-KNGT-04', barcode:'899123456004', category:'Office & Creative', brand:'NexaKey', unit:'pcs', cost:1200000, price:2450000, memberPrice:2200000, stock:4, maxStock:15, minStock:5, imgBg:'linear-gradient(135deg,#2b2b2b,#151515)', imgEmoji:'⌨️', desc:'Gasket-mounted aluminum mechanical keyboard.' },
        { id:'p5', name:'Zenith H1 ANC Headphones', sku:'ZENI-H1-05', barcode:'899123456005', category:'Gadgets', brand:'Zenith', unit:'pcs', cost:2100000, price:4200000, memberPrice:3800000, stock:18, maxStock:40, minStock:6, imgBg:'linear-gradient(135deg,#d3d3d3,#a9a9a9)', imgEmoji:'🎧', desc:'Hi-fi wireless ANC headphones.' },
        { id:'p6', name:'Organic Blue Mountain Coffee', sku:'BLU-MNTN-06', barcode:'899123456006', category:'Lifestyle', brand:'Origin Coffee', unit:'pack', cost:450000, price:950000, memberPrice:850000, stock:40, maxStock:100, minStock:10, imgBg:'linear-gradient(135deg,#4b382a,#2f1d11)', imgEmoji:'☕', desc:'Grade-1 Jamaican Blue Mountain coffee.' },
        { id:'p7', name:'Spectra 49" Curved OLED', sku:'SPEC-CURV-07', barcode:'899123456007', category:'Office & Creative', brand:'Spectra', unit:'pcs', cost:11500000, price:21990000, memberPrice:19990000, stock:5, maxStock:10, minStock:2, imgBg:'linear-gradient(135deg,#4f46e5,#06b6d4)', imgEmoji:'🖥️', desc:'Ultrawide 49" curved OLED 240Hz monitor.' },
        { id:'p8', name:'Aurora Buds Pro', sku:'AUR-BUDS-08', barcode:'899123456008', category:'Gadgets', brand:'NovaTech', unit:'pcs', cost:850000, price:1850000, memberPrice:1650000, stock:30, maxStock:60, minStock:10, imgBg:'linear-gradient(135deg,#a78bfa,#ec4899)', imgEmoji:'📳', desc:'Premium wireless earbuds with ANC.' }
      ]);
      saveBranchFile('branch-1', 'staff', [
        { id:'st1', name:'Edward Stark', role:'Admin', pin:'1234' },
        { id:'st2', name:'John Doe', role:'Kasir', pin:'5555' }
      ]);
      saveBranchFile('branch-1', 'settings', {
        companyName:'Nexa Luxury Group', branchName:'Senayan Flagship Store',
        taxRate:0.11, currency:'IDR', whatsappNotif:true
      });
    }
    console.log('  Default branch: Senayan Flagship Store');
  }
}
seed();

// ─── Migrate legacy server_data.json ───────────────────────────────────
(function migrateLegacy() {
  const legacyFile = path.join(__dirname, 'server_data.json');
  if (!fs.existsSync(legacyFile)) return;
  try {
    const legacy = JSON.parse(fs.readFileSync(legacyFile, 'utf8'));
    const branches = getBranches();
    const mainBranch = branches.find(b => b.ownerId === 'owner-1') || branches[0];
    if (mainBranch) {
      if (legacy.products && legacy.products.length && !getBranchFile(mainBranch.id, 'products')) {
        saveBranchFile(mainBranch.id, 'products', legacy.products);
      }
      if (legacy.orders && legacy.orders.length) {
        const existing = getBranchFile(mainBranch.id, 'orders') || [];
        saveBranchFile(mainBranch.id, 'orders', [...existing, ...legacy.orders]);
      }
      if (legacy.settings) {
        saveBranchFile(mainBranch.id, 'settings', legacy.settings);
      }
    }
    // Rename legacy so it's not re-imported
    fs.renameSync(legacyFile, legacyFile + '.backup');
    console.log('  Legacy data migrated to branch store');
  } catch (e) { console.warn('  Migrate skipped:', e.message); }
})();

// ─── RajaOngkir ────────────────────────────────────────────────────────
const RAJAONGKIR_BASE = 'https://api.rajaongkir.com/starter';
function rajaongkirCost(origin, dest, weight, courier, apiKey) {
  return new Promise((resolve, reject) => {
    const postData = `origin=${origin}&destination=${dest}&weight=${weight}&courier=${courier}`;
    const req = https.request(`${RAJAONGKIR_BASE}/cost`, {
      method: 'POST',
      headers: { 'key': apiKey, 'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData) }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(new Error('Invalid RajaOngkir response')); } });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function rajaongkirCities(apiKey) {
  return new Promise((resolve, reject) => {
    const req = https.request(`${RAJAONGKIR_BASE}/city`, {
      method: 'GET', headers: { 'key': apiKey }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

// ─── Simulated shipping ────────────────────────────────────────────────
function simShipping(courier, weight) {
  const couriers = {
    jne: { name: 'JNE', costs: [
      { service: 'REG', cost: [{ value: 15000 + (weight > 1000 ? Math.ceil((weight-1000)/1000)*5000 : 0), etd: '2-3', note: '' }] },
      { service: 'YES', cost: [{ value: 25000 + (weight > 1000 ? Math.ceil((weight-1000)/1000)*8000 : 0), etd: '1-1', note: '' }] },
      { service: 'OKE', cost: [{ value: 10000 + (weight > 1000 ? Math.ceil((weight-1000)/1000)*4000 : 0), etd: '3-5', note: '' }] }
    ]},
    jnt: { name: 'J&T Express', costs: [
      { service: 'EZ', cost: [{ value: 12000 + (weight > 1000 ? Math.ceil((weight-1000)/1000)*3000 : 0), etd: '2-3', note: '' }] },
      { service: 'Regular', cost: [{ value: 9000 + (weight > 1000 ? Math.ceil((weight-1000)/1000)*2500 : 0), etd: '3-5', note: '' }] }
    ]},
    sicepat: { name: 'SiCepat Express', costs: [
      { service: 'REG', cost: [{ value: 12000 + (weight > 1000 ? Math.ceil((weight-1000)/1000)*5000 : 0), etd: '2-3', note: '' }] },
      { service: 'BEST', cost: [{ value: 18000 + (weight > 1000 ? Math.ceil((weight-1000)/1000)*6000 : 0), etd: '1-2', note: '' }] },
      { service: 'Gokil', cost: [{ value: 8000 + (weight > 1000 ? Math.ceil((weight-1000)/1000)*3000 : 0), etd: '4-7', note: '' }] }
    ]},
    gosend: { name: 'GoSend', costs: [{ service: 'SameDay', cost: [{ value: 25000 + (weight > 1000 ? Math.ceil((weight-1000)/1000)*10000 : 0), etd: 'Same Day', note: '' }] }] },
    grab: { name: 'GrabExpress', costs: [{ service: 'Instant', cost: [{ value: 35000 + (weight > 1000 ? Math.ceil((weight-1000)/1000)*12000 : 0), etd: 'Instant', note: '' }] }] },
    toko: { name: 'Ambil di Toko', costs: [{ service: 'Ambil Sendiri', cost: [{ value: 0, etd: '-', note: '' }] }] }
  };
  return couriers[courier] || { name: courier || 'JNE', costs: [{ service: 'Reguler', cost: [{ value: 15000, etd: '2-4', note: '' }] }] };
}

const SIM_CITIES = [
  { city_id:'151', city_name:'Jakarta', type:'Kota' }, { city_id:'152', city_name:'Jakarta Selatan', type:'Kota' },
  { city_id:'153', city_name:'Jakarta Timur', type:'Kota' }, { city_id:'154', city_name:'Jakarta Pusat', type:'Kota' },
  { city_id:'155', city_name:'Jakarta Barat', type:'Kota' }, { city_id:'156', city_name:'Jakarta Utara', type:'Kota' },
  { city_id:'23', city_name:'Bandung', type:'Kota' }, { city_id:'32', city_name:'Bekasi', type:'Kota' },
  { city_id:'114', city_name:'Depok', type:'Kota' }, { city_id:'157', city_name:'Tangerang', type:'Kota' },
  { city_id:'158', city_name:'Surabaya', type:'Kota' }, { city_id:'203', city_name:'Yogyakarta', type:'Kota' },
  { city_id:'55', city_name:'Semarang', type:'Kota' }, { city_id:'74', city_name:'Medan', type:'Kota' },
  { city_id:'245', city_name:'Makassar', type:'Kota' }, { city_id:'447', city_name:'Denpasar', type:'Kota' },
  { city_id:'501', city_name:'Palembang', type:'Kota' }, { city_id:'520', city_name:'Pekanbaru', type:'Kota' },
  { city_id:'472', city_name:'Banjarmasin', type:'Kota' }, { city_id:'343', city_name:'Manado', type:'Kota' },
  { city_id:'399', city_name:'Pontianak', type:'Kota' }
];

// ─── HTTP Server ────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const method = req.method;

  const respond = (code, data) => {
    res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(data));
  };
  const readBody = () => new Promise(resolve => { let b = ''; req.on('data', c => b += c); req.on('end', () => resolve(b)); });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ─── Parse Auth ──────────────────────────────────────────────────
  function getAuth() {
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) return null;
    return verifyToken(auth.slice(7));
  }

  // ─── API: Auth ───────────────────────────────────────────────────
  if (method === 'POST' && pathname === '/api/auth/register') {
    (async () => {
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
    return;
  }

  if (method === 'POST' && pathname === '/api/auth/login') {
    (async () => {
      try {
        const { email, password } = JSON.parse(await readBody());
        const owners = getOwners();
        const owner = owners.find(o => o.email === email);
        if (!owner || !verifyPassword(password, owner.password)) return respond(401, { error: 'Invalid email or password' });
        respond(200, { success: true, token: createToken({ ownerId: owner.id, email: owner.email, name: owner.name }) });
      } catch (e) { respond(400, { error: e.message }); }
    })();
    return;
  }

  if (method === 'GET' && pathname === '/api/auth/me') {
    const auth = getAuth();
    if (!auth) return respond(401, { error: 'Unauthorized' });
    const owners = getOwners();
    const owner = owners.find(o => o.id === auth.ownerId);
    if (!owner) return respond(404, { error: 'Owner not found' });
    respond(200, { id: owner.id, name: owner.name, email: owner.email, phone: owner.phone, createdAt: owner.createdAt });
    return;
  }

  // ─── API: Branches ───────────────────────────────────────────────
  if (pathname === '/api/branches') {
    if (method === 'GET') {
      const auth = getAuth();
      if (!auth) return respond(401, { error: 'Unauthorized' });
      const branches = getBranches().filter(b => b.ownerId === auth.ownerId);
      // Attach quick stats
      const result = branches.map(b => {
        const orders = getBranchFile(b.id, 'orders') || [];
        const txns = getBranchFile(b.id, 'transactions') || [];
        return { ...b, orderCount: orders.length, txnCount: txns.length, totalSales: txns.reduce((s, t) => s + (t.total || 0), 0) };
      });
      respond(200, result);
      return;
    }
    if (method === 'POST') {
      const auth = getAuth();
      if (!auth) return respond(401, { error: 'Unauthorized' });
      (async () => {
        try {
          const { name, address, phone, city } = JSON.parse(await readBody());
          if (!name) return respond(400, { error: 'Branch name required' });
          const branches = getBranches();
          const branch = {
            id: 'branch-' + Date.now().toString(36),
            ownerId: auth.ownerId,
            name, address: address || '', phone: phone || '', city: city || '',
            createdAt: new Date().toISOString(), active: true
          };
          branches.push(branch);
          saveBranches(branches);
          // Seed branch with default products
          saveBranchFile(branch.id, 'products', [
            { id:'p1', name:'Aether Chronograph Onyx', sku:'AETH-ONYX-01', barcode:'899123456001', category:'Luxury Accessories', brand:'Aether', unit:'pcs', cost:4500000, price:8900000, memberPrice:7900000, stock:12, maxStock:30, minStock:5, imgBg:'linear-gradient(135deg,#1e1e1e,#111)', imgEmoji:'⌚', desc:'Luxury mechanical watch.' },
            { id:'p2', name:'Caviar Leather Briefcase', sku:'CAV-BRIEF-02', barcode:'899123456002', category:'Luxury Accessories', brand:'Caviar', unit:'pcs', cost:3200000, price:6500000, memberPrice:5800000, stock:8, maxStock:20, minStock:3, imgBg:'linear-gradient(135deg,#3d2314,#21130b)', imgEmoji:'💼', desc:'Full-grain calfskin leather briefcase.' },
            { id:'p3', name:'Nova Ring V1 Titanium', sku:'NOVA-RING-03', barcode:'899123456003', category:'Gadgets', brand:'NovaTech', unit:'pcs', cost:1800000, price:3499000, memberPrice:3199000, stock:25, maxStock:50, minStock:8, imgBg:'linear-gradient(135deg,#708090,#4f5d65)', imgEmoji:'💍', desc:'Smart titanium ring health tracker.' },
            { id:'p4', name:'Carbon Knight Keyboard', sku:'CRBN-KNGT-04', barcode:'899123456004', category:'Office & Creative', brand:'NexaKey', unit:'pcs', cost:1200000, price:2450000, memberPrice:2200000, stock:4, maxStock:15, minStock:5, imgBg:'linear-gradient(135deg,#2b2b2b,#151515)', imgEmoji:'⌨️', desc:'Gasket-mounted aluminum keyboard.' },
            { id:'p5', name:'Zenith H1 ANC Headphones', sku:'ZENI-H1-05', barcode:'899123456005', category:'Gadgets', brand:'Zenith', unit:'pcs', cost:2100000, price:4200000, memberPrice:3800000, stock:18, maxStock:40, minStock:6, imgBg:'linear-gradient(135deg,#d3d3d3,#a9a9a9)', imgEmoji:'🎧', desc:'Hi-fi wireless ANC headphones.' },
            { id:'p6', name:'Organic Blue Mountain Coffee', sku:'BLU-MNTN-06', barcode:'899123456006', category:'Lifestyle', brand:'Origin Coffee', unit:'pack', cost:450000, price:950000, memberPrice:850000, stock:40, maxStock:100, minStock:10, imgBg:'linear-gradient(135deg,#4b382a,#2f1d11)', imgEmoji:'☕', desc:'Premium coffee beans.' },
            { id:'p7', name:'Spectra 49" Curved OLED', sku:'SPEC-CURV-07', barcode:'899123456007', category:'Office & Creative', brand:'Spectra', unit:'pcs', cost:11500000, price:21990000, memberPrice:19990000, stock:5, maxStock:10, minStock:2, imgBg:'linear-gradient(135deg,#4f46e5,#06b6d4)', imgEmoji:'🖥️', desc:'Ultrawide 49" curved OLED monitor.' },
            { id:'p8', name:'Aurora Buds Pro', sku:'AUR-BUDS-08', barcode:'899123456008', category:'Gadgets', brand:'NovaTech', unit:'pcs', cost:850000, price:1850000, memberPrice:1650000, stock:30, maxStock:60, minStock:10, imgBg:'linear-gradient(135deg,#a78bfa,#ec4899)', imgEmoji:'📳', desc:'Premium wireless earbuds with ANC.' }
          ]);
          saveBranchFile(branch.id, 'staff', [
            { id:'st1', name:'Edward Stark', role:'Admin', pin:'1234' },
            { id:'st2', name:'John Doe', role:'Kasir', pin:'5555' }
          ]);
          saveBranchFile(branch.id, 'settings', {
            companyName: branch.name, branchName: branch.name,
            taxRate: 0.11, currency: 'IDR', whatsappNotif: true
          });
          respond(201, { success: true, branch });
        } catch (e) { respond(400, { error: e.message }); }
      })();
      return;
    }
  }

  // Branch update/delete
  const branchMatch = pathname.match(/^\/api\/branches\/([^/]+)$/);
  if (branchMatch) {
    const branchId = branchMatch[1];
    if (method === 'PUT') {
      const auth = getAuth();
      if (!auth) return respond(401, { error: 'Unauthorized' });
      (async () => {
        try {
          const branches = getBranches();
          const idx = branches.findIndex(b => b.id === branchId && b.ownerId === auth.ownerId);
          if (idx === -1) return respond(404, { error: 'Branch not found' });
          const update = JSON.parse(await readBody());
          branches[idx] = { ...branches[idx], ...update, id: branchId, ownerId: auth.ownerId };
          saveBranches(branches);
          respond(200, { success: true, branch: branches[idx] });
        } catch (e) { respond(400, { error: e.message }); }
      })();
      return;
    }
    if (method === 'DELETE') {
      const auth = getAuth();
      if (!auth) return respond(401, { error: 'Unauthorized' });
      const branches = getBranches().filter(b => !(b.id === branchId && b.ownerId === auth.ownerId));
      saveBranches(branches);
      respond(200, { success: true });
      return;
    }
  }

  // ─── API: Branch Data ────────────────────────────────────────────
  function requireBranchAuth() {
    const auth = getAuth();
    if (!auth) return null;
    const br = url.searchParams.get('branch');
    if (!br) return null;
    const branches = getBranches();
    const branch = branches.find(b => b.id === br && b.ownerId === auth.ownerId);
    if (!branch) return null;
    return { auth, branch };
  }

  // Branch products
  if (method === 'GET' && pathname === '/api/branch/products') {
    const ctx = requireBranchAuth();
    if (!ctx) return respond(401, { error: 'Unauthorized' });
    respond(200, getBranchFile(ctx.branch.id, 'products') || []);
    return;
  }
  if (method === 'POST' && pathname === '/api/branch/products') {
    const ctx = requireBranchAuth();
    if (!ctx) return respond(401, { error: 'Unauthorized' });
    (async () => {
      try {
        const products = JSON.parse(await readBody());
        saveBranchFile(ctx.branch.id, 'products', products);
        respond(200, { success: true });
      } catch (e) { respond(400, { error: e.message }); }
    })();
    return;
  }

  // Branch orders
  if (method === 'GET' && pathname === '/api/branch/orders') {
    const ctx = requireBranchAuth();
    if (!ctx) return respond(401, { error: 'Unauthorized' });
    respond(200, getBranchFile(ctx.branch.id, 'orders') || []);
    return;
  }
  if (method === 'POST' && pathname === '/api/branch/orders') {
    const ctx = requireBranchAuth();
    if (!ctx) return respond(401, { error: 'Unauthorized' });
    (async () => {
      try {
        const orders = JSON.parse(await readBody());
        saveBranchFile(ctx.branch.id, 'orders', orders);
        respond(200, { success: true });
      } catch (e) { respond(400, { error: e.message }); }
    })();
    return;
  }

  // Branch transactions
  if (method === 'GET' && pathname === '/api/branch/transactions') {
    const ctx = requireBranchAuth();
    if (!ctx) return respond(401, { error: 'Unauthorized' });
    respond(200, getBranchFile(ctx.branch.id, 'transactions') || []);
    return;
  }
  if (method === 'POST' && pathname === '/api/branch/transactions') {
    const ctx = requireBranchAuth();
    if (!ctx) return respond(401, { error: 'Unauthorized' });
    (async () => {
      try {
        const transactions = JSON.parse(await readBody());
        saveBranchFile(ctx.branch.id, 'transactions', transactions);
        respond(200, { success: true });
      } catch (e) { respond(400, { error: e.message }); }
    })();
    return;
  }

  // Branch staff
  if (method === 'GET' && pathname === '/api/branch/staff') {
    const ctx = requireBranchAuth();
    if (!ctx) return respond(401, { error: 'Unauthorized' });
    respond(200, getBranchFile(ctx.branch.id, 'staff') || []);
    return;
  }
  if (method === 'POST' && pathname === '/api/branch/staff') {
    const ctx = requireBranchAuth();
    if (!ctx) return respond(401, { error: 'Unauthorized' });
    (async () => {
      try {
        const staff = JSON.parse(await readBody());
        saveBranchFile(ctx.branch.id, 'staff', staff);
        respond(200, { success: true });
      } catch (e) { respond(400, { error: e.message }); }
    })();
    return;
  }

  // Branch settings
  if (method === 'GET' && pathname === '/api/branch/settings') {
    const ctx = requireBranchAuth();
    if (!ctx) return respond(401, { error: 'Unauthorized' });
    respond(200, getBranchFile(ctx.branch.id, 'settings') || {});
    return;
  }
  if (method === 'POST' && pathname === '/api/branch/settings') {
    const ctx = requireBranchAuth();
    if (!ctx) return respond(401, { error: 'Unauthorized' });
    (async () => {
      try {
        const settings = JSON.parse(await readBody());
        saveBranchFile(ctx.branch.id, 'settings', settings);
        respond(200, { success: true });
      } catch (e) { respond(400, { error: e.message }); }
    })();
    return;
  }

  // ─── API: Store (public, scoped to branch) ───────────────────────
  if (method === 'GET' && pathname === '/api/store/products') {
    const branchId = url.searchParams.get('branch');
    let products = [];
    if (branchId) {
      products = getBranchFile(branchId, 'products') || [];
    } else {
      // Fallback: try first branch
      const branches = getBranches();
      if (branches.length) products = getBranchFile(branches[0].id, 'products') || [];
    }
    respond(200, products.filter(p => p.stock > 0).map(p => ({
      id: p.id, name: p.name, price: p.price, stock: p.stock, category: p.category || 'Umum',
      image: p.imgEmoji || '📦', description: p.desc || '', unit: p.unit || 'pcs', sku: p.sku,
      imgBg: p.imgBg || 'linear-gradient(135deg,#1e293b,#0f172a)', imgEmoji: p.imgEmoji || '📦'
    })));
    return;
  }

  if (method === 'POST' && pathname === '/api/store/checkout') {
    (async () => {
      try {
        const body = JSON.parse(await readBody());
        const branchId = body.branchId;
        if (!branchId) return respond(400, { error: 'Branch ID required' });
        const products = getBranchFile(branchId, 'products') || [];
        const orders = getBranchFile(branchId, 'orders') || [];

        for (const item of (body.items || [])) {
          const prod = products.find(p => p.id === item.id);
          if (prod) {
            if (prod.stock < item.qty) return respond(400, { error: `Stok ${prod.name} tidak mencukupi (tersedia: ${prod.stock})` });
          }
        }
        for (const item of (body.items || [])) {
          const prod = products.find(p => p.id === item.id);
          if (prod) prod.stock -= item.qty;
        }

        const order = {
          id: Date.now(), invoiceNo: 'INV-' + Date.now().toString(36).toUpperCase(),
          timestamp: new Date().toISOString(), status: 'pending', source: 'online',
          branchId, items: body.items || [], subtotal: body.subtotal || 0,
          shippingCost: body.shippingCost || 0, shippingCourier: body.shippingCourier || '',
          shippingService: body.shippingService || '', shippingEtd: body.shippingEtd || '',
          total: body.total || 0, customerName: body.customerName || '',
          customerPhone: body.customerPhone || '', customerAddress: body.customerAddress || '',
          customerCity: body.customerCity || '', customerNote: body.customerNote || '',
          paymentMethod: body.paymentMethod || 'transfer', paymentStatus: 'unpaid', resi: '', resiDate: ''
        };

        orders.push(order);
        saveBranchFile(branchId, 'products', products);
        saveBranchFile(branchId, 'orders', orders);
        broadcast({ type: 'new_order', order, branchId });

        respond(201, { success: true, order });
      } catch (e) { respond(400, { error: e.message }); }
    })();
    return;
  }

  const storeOrderMatch = pathname.match(/^\/api\/store\/orders\/(\d+)$/);
  if (method === 'GET' && storeOrderMatch) {
    const branchId = url.searchParams.get('branch');
    const orders = branchId ? (getBranchFile(branchId, 'orders') || []) : [];
    const order = orders.find(o => o.id === Number(storeOrderMatch[1]));
    if (!order) return respond(404, { error: 'Order not found' });
    respond(200, order);
    return;
  }

  // ─── API: Shipping ───────────────────────────────────────────────
  if (method === 'POST' && pathname === '/api/shipping/cost') {
    (async () => {
      try {
        const { origin, destination, weight, courier } = JSON.parse(await readBody());
        const branchId = url.searchParams.get('branch');
        let apiKey = '';
        if (branchId) {
          const settings = getBranchFile(branchId, 'settings');
          if (settings) apiKey = settings.rajaongkirKey || '';
        }
        if (!apiKey) return respond(200, { rajaongkir: { results: [simShipping((courier || 'jne').toLowerCase(), weight || 1000)] } });
        const result = await rajaongkirCost(origin, destination, weight, courier, apiKey);
        respond(200, result);
      } catch (e) { respond(500, { error: e.message }); }
    })();
    return;
  }

  if (method === 'GET' && pathname === '/api/shipping/cities') {
    (async () => {
      const branchId = url.searchParams.get('branch');
      let apiKey = '';
      if (branchId) {
        const settings = getBranchFile(branchId, 'settings');
        if (settings) apiKey = settings.rajaongkirKey || '';
      }
      if (!apiKey) return respond(200, { rajaongkir: { results: SIM_CITIES } });
      const result = await rajaongkirCities(apiKey);
      respond(200, result || { rajaongkir: { results: SIM_CITIES } });
    })();
    return;
  }

  // ─── API: Owner Dashboard ────────────────────────────────────────
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
      totalRevenue += rev; totalOrders += orders.length; totalTransactions += txns.length; totalProducts += products.length;
      return { id: b.id, name: b.name, city: b.city, revenue: rev, orders: orders.length, transactions: txns.length, products: products.length, active: b.active };
    });
    respond(200, { totalRevenue, totalOrders, totalTransactions, totalProducts, branches: branchDetails });
    return;
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
    respond(200, Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)));
    return;
  }

  // ─── Legacy API (backward compatible, single mode) ──────────────
  // These are served when no branch context is given (legacy POS)

  // Legacy legacy data loaded from server_data.json backup
  const legacyDB = (function loadLegacy() {
    const lf = path.join(__dirname, 'server_data.json.backup');
    try { if (fs.existsSync(lf)) return JSON.parse(fs.readFileSync(lf, 'utf8')); } catch (e) {}
    // Fallback: read from first branch
    const branches = getBranches();
    if (branches.length) {
      return {
        products: getBranchFile(branches[0].id, 'products') || [],
        orders: getBranchFile(branches[0].id, 'orders') || [],
        settings: getBranchFile(branches[0].id, 'settings') || {},
        staffList: getBranchFile(branches[0].id, 'staff') || []
      };
    }
    return { products: [], orders: [], settings: {}, staffList: [] };
  })();

  if (method === 'GET' && pathname === '/api/products') { respond(200, legacyDB.products); return; }
  if (method === 'GET' && pathname === '/api/orders') { respond(200, legacyDB.orders); return; }
  if (method === 'GET' && pathname === '/api/settings') { respond(200, legacyDB.settings); return; }

  if (method === 'POST' && pathname === '/api/sync') {
    (async () => {
      try {
        const data = JSON.parse(await readBody());
        const branches = getBranches();
        const mainBranch = branches[0];
        if (mainBranch) {
          if (data.products) saveBranchFile(mainBranch.id, 'products', data.products);
          if (data.settings) saveBranchFile(mainBranch.id, 'settings', data.settings);
          if (data.staffList) saveBranchFile(mainBranch.id, 'staff', data.staffList);
        }
        broadcast({ type: 'sync', data });
        respond(200, { success: true });
      } catch (e) { respond(400, { error: e.message }); }
    })();
    return;
  }

  if (method === 'PUT' && pathname === '/api/settings') {
    (async () => {
      try {
        const s = JSON.parse(await readBody());
        const branches = getBranches();
        if (branches.length) {
          const settings = getBranchFile(branches[0].id, 'settings') || {};
          Object.assign(settings, s);
          saveBranchFile(branches[0].id, 'settings', settings);
        }
        respond(200, { success: true });
      } catch (e) { respond(400, { error: e.message }); }
    })();
    return;
  }

  // Legacy order handling (for legacy POS)
  if (method === 'POST' && pathname === '/api/orders') {
    (async () => {
      try {
        const order = JSON.parse(await readBody());
        order.id = Date.now(); order.timestamp = new Date().toISOString(); order.status = 'pending';
        const branches = getBranches();
        if (branches.length) {
          const orders = getBranchFile(branches[0].id, 'orders') || [];
          orders.push(order);
          saveBranchFile(branches[0].id, 'orders', orders);
        }
        broadcast({ type: 'new_order', order });
        respond(201, { success: true, orderId: order.id });
      } catch (e) { respond(400, { error: 'Invalid JSON' }); }
    })();
    return;
  }

  const legacyOrderMatch = pathname.match(/^\/api\/orders\/(\d+)$/);
  if (method === 'PUT' && legacyOrderMatch) {
    (async () => {
      try {
        const orderId = Number(legacyOrderMatch[1]);
        const update = JSON.parse(await readBody());
        const branches = getBranches();
        if (branches.length) {
          const orders = getBranchFile(branches[0].id, 'orders') || [];
          const idx = orders.findIndex(o => o.id === orderId);
          if (idx !== -1) {
            orders[idx] = { ...orders[idx], ...update };
            saveBranchFile(branches[0].id, 'orders', orders);
            broadcast({ type: 'order_updated', order: orders[idx] });
          }
        }
        respond(200, { success: true });
      } catch (e) { respond(400, { error: 'Invalid JSON' }); }
    })();
    return;
  }

  // ─── Static Files ────────────────────────────────────────────────
  const MIME = {
    '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
  };
  let cleanPath = pathname.replace(/\/$/, '');
  if (cleanPath === '') cleanPath = '/';

  let fp = cleanPath;
  if (cleanPath === '/') { fp = '/index.html'; }
  else if (cleanPath === '/store' || cleanPath === '/tokoonline') { fp = '/store.html'; }
  else if (cleanPath === '/owner' || cleanPath === '/ownerportal') { fp = '/owner.html'; }
  else if (cleanPath === '/pos') { fp = '/index.html'; }

  fp = path.join(__dirname, fp);
  if (!path.resolve(fp).startsWith(__dirname)) { res.writeHead(403); res.end('Forbidden'); return; }
  const ext = path.extname(fp);
  fs.readFile(fp, (err, data) => {
    if (err) {
      if (!ext) { fs.readFile(path.join(__dirname, 'index.html'), (e2, d2) => { if (e2) { res.writeHead(404); res.end('Not found'); return; } res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(d2); }); return; }
      res.writeHead(404); res.end('Not found'); return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

// ─── WebSocket ──────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server });
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const branchId = url.searchParams.get('branch');

  // Send init data
  const initData = { type: 'init' };
  if (branchId) {
    initData.products = getBranchFile(branchId, 'products') || [];
    initData.orders = (getBranchFile(branchId, 'orders') || []).filter(o => o.status === 'pending');
    initData.staffList = getBranchFile(branchId, 'staff') || [];
    initData.settings = getBranchFile(branchId, 'settings') || {};
    initData.branchId = branchId;
  } else {
    // Legacy mode
    const branches = getBranches();
    if (branches.length) {
      const b = branches[0];
      initData.products = getBranchFile(b.id, 'products') || [];
      initData.orders = (getBranchFile(b.id, 'orders') || []).filter(o => o.status === 'pending');
      initData.staffList = getBranchFile(b.id, 'staff') || [];
      initData.settings = getBranchFile(b.id, 'settings') || {};
    }
  }
  ws.send(JSON.stringify(initData));

  ws.on('message', data => {
    try {
      const msg = JSON.parse(data);
      const brId = msg.branchId || branchId;
      if (!brId) return;

      if (msg.type === 'new_order') {
        msg.order.id = Date.now(); msg.order.timestamp = new Date().toISOString(); msg.order.status = 'pending';
        msg.order.branchId = brId;
        const orders = getBranchFile(brId, 'orders') || [];
        orders.push(msg.order); saveBranchFile(brId, 'orders', orders);
        broadcast({ type: 'new_order', order: msg.order, branchId: brId }, ws);
      }
      if (msg.type === 'order_action') {
        const orders = getBranchFile(brId, 'orders') || [];
        const idx = orders.findIndex(o => o.id === msg.orderId);
        if (idx !== -1) { orders[idx].status = msg.action; saveBranchFile(brId, 'orders', orders); broadcast({ type: 'order_updated', order: orders[idx], branchId: brId }); }
      }
      if (msg.type === 'sync') {
        if (msg.data.products) { saveBranchFile(brId, 'products', msg.data.products); }
        if (msg.data.settings) { const s = getBranchFile(brId, 'settings') || {}; Object.assign(s, msg.data.settings); saveBranchFile(brId, 'settings', s); }
        if (msg.data.staffList) { saveBranchFile(brId, 'staff', msg.data.staffList); }
        if (msg.data.transactions) { saveBranchFile(brId, 'transactions', msg.data.transactions); }
        broadcast({ type: 'sync', data: msg.data, branchId: brId }, ws);
      }
    } catch (e) {}
  });
});

function broadcast(msg, exclude = null) {
  const s = JSON.stringify(msg);
  wss.clients.forEach(c => { if (c.readyState === 1 && c !== exclude) c.send(s); });
}

// ─── Start ─────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║        NexaPOS SaaS v5.0                 ║');
  console.log('  ╠══════════════════════════════════════════╣');
  console.log(`  ║  http://localhost:${PORT}          — POS Legacy    ║`);
  console.log(`  ║  http://localhost:${PORT}/owner    — Owner Portal  ║`);
  console.log(`  ║  http://localhost:${PORT}/store    — Online Store  ║`);
  console.log(`  ║  http://localhost:${PORT}/pos      — Branch POS    ║`);
  console.log('  ║  Level 5: SaaS Multi-Cabang + Auth    ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
});
