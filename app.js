/**
 * CasirPRO - Enterprise Premium POS System
 * Complete Business Management Platform
 */

const DB_KEY = 'casirpro_db';
const TAX_RATE = 0.11;

async function sha256(str) {
  if (typeof crypto?.subtle?.digest !== 'function') return str;
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function isHashPin(pin) { return typeof pin === 'string' && /^[a-f0-9]{64}$/i.test(pin); }

// =============================================
// SEED DATA
// =============================================
const SEED_CATEGORIES = ['Gadgets', 'Luxury Accessories', 'Lifestyle', 'Office & Creative'];

const SEED_PRODUCTS = [
  { id:'p1', name:'Aether Chronograph Onyx', sku:'AETH-ONYX-01', barcode:'899123456001', category:'Luxury Accessories', brand:'Aether', unit:'pcs', cost:4500000, price:8900000, memberPrice:7900000, stock:12, maxStock:30, minStock:5, imgBg:'linear-gradient(135deg,#1e1e1e,#111)', imgEmoji:'⌚', desc:'Luxury mechanical with onyx bezel. 72h power reserve.' },
  { id:'p2', name:'Caviar Leather Briefcase', sku:'CAV-BRIEF-02', barcode:'899123456002', category:'Luxury Accessories', brand:'Caviar', unit:'pcs', cost:3200000, price:6500000, memberPrice:5800000, stock:8, maxStock:20, minStock:3, imgBg:'linear-gradient(135deg,#3d2314,#21130b)', imgEmoji:'💼', desc:'Full-grain calfskin leather with gold-plated buckles.' },
  { id:'p3', name:'Nova Ring V1 Titanium', sku:'NOVA-RING-03', barcode:'899123456003', category:'Gadgets', brand:'NovaTech', unit:'pcs', cost:1800000, price:3499000, memberPrice:3199000, stock:25, maxStock:50, minStock:8, imgBg:'linear-gradient(135deg,#708090,#4f5d65)', imgEmoji:'💍', desc:'Smart titanium ring health tracker. 7-day battery.' },
  { id:'p4', name:'Carbon Knight Keyboard', sku:'CRBN-KNGT-04', barcode:'899123456004', category:'Office & Creative', brand:'NexaKey', unit:'pcs', cost:1200000, price:2450000, memberPrice:2200000, stock:4, maxStock:15, minStock:5, imgBg:'linear-gradient(135deg,#2b2b2b,#151515)', imgEmoji:'⌨️', desc:'Gasket-mounted aluminum mechanical keyboard.' },
  { id:'p5', name:'Zenith H1 ANC Headphones', sku:'ZENI-H1-05', barcode:'899123456005', category:'Gadgets', brand:'Zenith', unit:'pcs', cost:2100000, price:4200000, memberPrice:3800000, stock:18, maxStock:40, minStock:6, imgBg:'linear-gradient(135deg,#d3d3d3,#a9a9a9)', imgEmoji:'🎧', desc:'Hi-fi wireless ANC headphones with carbon drivers.' },
  { id:'p6', name:'Organic Blue Mountain Coffee', sku:'BLU-MNTN-06', barcode:'899123456006', category:'Lifestyle', brand:'Origin Coffee', unit:'pack', cost:450000, price:950000, memberPrice:850000, stock:40, maxStock:100, minStock:10, imgBg:'linear-gradient(135deg,#4b382a,#2f1d11)', imgEmoji:'☕', desc:'Grade-1 Jamaican Blue Mountain coffee beans.' },
  { id:'p7', name:'Spectra 49" Curved OLED', sku:'SPEC-CURV-07', barcode:'899123456007', category:'Office & Creative', brand:'Spectra', unit:'pcs', cost:11500000, price:21990000, memberPrice:19990000, stock:5, maxStock:10, minStock:2, imgBg:'linear-gradient(135deg,#4f46e5,#06b6d4)', imgEmoji:'🖥️', desc:'Ultrawide 49" curved OLED 240Hz monitor.' },
  { id:'p8', name:'Aurora Buds Pro', sku:'AUR-BUDS-08', barcode:'899123456008', category:'Gadgets', brand:'NovaTech', unit:'pcs', cost:850000, price:1850000, memberPrice:1650000, stock:30, maxStock:60, minStock:10, imgBg:'linear-gradient(135deg,#a78bfa,#ec4899)', imgEmoji:'📳', desc:'Premium wireless earbuds with ANC and wireless charging.' },
  { id:'p9', name:'Diamond Crystal Pen', sku:'DIAM-PEN-09', barcode:'899123456009', category:'Luxury Accessories', brand:'Crystaluxe', unit:'pcs', cost:2500000, price:5500000, memberPrice:4900000, stock:15, maxStock:30, minStock:5, imgBg:'linear-gradient(135deg,#7dd3fc,#0369a1)', imgEmoji:'🖊️', desc:'Swiss-made fountain pen with diamond tip.' },
  { id:'p10', name:'Artisan Matcha Set', sku:'MATCHA-10', barcode:'899123456010', category:'Lifestyle', brand:'Zen Origins', unit:'set', cost:350000, price:780000, memberPrice:680000, stock:22, maxStock:40, minStock:8, imgBg:'linear-gradient(135deg,#65a30d,#3f6212)', imgEmoji:'🍵', desc:'Premium Japanese matcha tea ceremony set.' },
];

const SEED_CUSTOMERS = [
  { id:'c1', name:'Alice Wijaya', phone:'08129876543', email:'alice@elite.com', tier:'Diamond', points:3400, ltv:84000000, joinDate:'2025-01-12', cardNo:'CPR-DMND-1001', maxDebtLimit: 2000000, currentDebt: 0 },
  { id:'c2', name:'Budi Santoso', phone:'08119876542', email:'budi@business.com', tier:'Platinum', points:1250, ltv:25500000, joinDate:'2025-02-18', cardNo:'CPR-PLAT-2034', maxDebtLimit: 2000000, currentDebt: 0 },
  { id:'c3', name:'Clara Croft', phone:'08219876541', email:'clara@croft.org', tier:'Gold', points:850, ltv:12800000, joinDate:'2025-04-03', cardNo:'CPR-GOLD-3051', maxDebtLimit: 2000000, currentDebt: 0 },
  { id:'c4', name:'David Beckham', phone:'08789876540', email:'david@legend.com', tier:'Silver', points:300, ltv:5200000, joinDate:'2025-05-19', cardNo:'CPR-SLVR-4092', maxDebtLimit: 2000000, currentDebt: 0 },
];

const SEED_EXPENSES = [
  { id:'e1', date:'2026-06-01', desc:'Store Rent Premium', category:'Operational', amount:12000000 },
  { id:'e2', date:'2026-06-05', desc:'Electricity & Internet', category:'Utilities', amount:2500000 },
  { id:'e3', date:'2026-06-15', desc:'Staff Salaries', category:'Salary', amount:15000000 },
  { id:'e4', date:'2026-06-18', desc:'Premium Packaging', category:'Marketing', amount:3000000 },
];

const SEED_SUPPLIERS = [
  { id:'s1', name:'LuxTech Distribution', contact:'Mr. Wong', phone:'021-5550011', address:'Jakarta Industrial Estate' },
  { id:'s2', name:'Global Gadget Supply', contact:'Ms. Chen', phone:'021-5550022', address:'Surabaya Trade Center' },
];

// =============================================
// DATABASE
// =============================================
class Database {
  constructor() {
    this.load();
    if(!this.state||!this.state.products||!this.state.products.length) {
      this.seed();
    } else {
      if (!this.state.staffList) {
        this.state.staffList = [
          { id:'st1', name:'Edward Stark', role:'Admin', pin:'1234' },
          { id:'st2', name:'John Doe', role:'Kasir', pin:'5555' },
          { id:'st_demo', name:'Demo Master', role:'Admin', pin:'1' }
        ];
        this.save();
      } else if (!this.state.staffList.find(s => s.name === 'Demo Master')) {
        this.state.staffList.push({ id:'st_demo', name:'Demo Master', role:'Admin', pin:'1' });
        this.save();
      }
      try {
        localStorage.setItem('pos_products', JSON.stringify(this.state.products));
        localStorage.setItem('pos_settings', JSON.stringify(this.state.settings));
      } catch(e){}
    }
  }
  load() { try { const d=localStorage.getItem(DB_KEY); this.state=d?JSON.parse(d):null; } catch(e){ this.state=null; } }
  save() {
    try {
      localStorage.setItem(DB_KEY,JSON.stringify(this.state));
      if (this.state) {
        if (this.state.products) localStorage.setItem('pos_products', JSON.stringify(this.state.products));
        if (this.state.settings) localStorage.setItem('pos_settings', JSON.stringify(this.state.settings));
      }
      if (typeof syncStateToServer === 'function') syncStateToServer();
    } catch(e){}
  }

  seed() {
    this.state={
      categories:SEED_CATEGORIES, products:SEED_PRODUCTS, customers:SEED_CUSTOMERS,
      expenses:SEED_EXPENSES, suppliers:SEED_SUPPLIERS, purchases:[],
      transactions:[], heldCarts:[],
      staffList:[
        { id:'st1', name:'Edward Stark', role:'Admin', pin:'1234' },
        { id:'st2', name:'John Doe', role:'Kasir', pin:'5555' },
        { id:'st_demo', name:'Demo Master', role:'Admin', pin:'1' }
      ],
      shifts:[{ id:'sh1', cashier:'Edward Stark', startTime:'2026-06-23T08:00:00', endTime:null, totalSales:0, status:'Active' }],
      notifications:[
        { id:'n1', type:'info', title:'System Ready', message:'CasirPRO Premium initialized.', time:'13:00' },
        { id:'n2', type:'warning', title:'Low Stock', message:'Carbon Knight Keyboard: 4 units left.', time:'13:15' }
      ],
      settings:{ companyName:'CasirPRO Luxury Group', branchName:'Senayan Flagship Store', taxRate:0.11, currency:'IDR', whatsappNotif:true }
    };
    this.genHistory();
    this.save();
  }

  genHistory() {
    const txns=[]; let c=1000; const today=new Date();
    for(let i=30;i>=0;i--){
      const d=new Date(today); d.setDate(today.getDate()-i);
      d.setHours(9+Math.floor(Math.random()*11),Math.floor(Math.random()*60));
      const count=2+Math.floor(Math.random()*4);
      for(let j=0;j<count;j++){
        c++; const txnDate=new Date(d); txnDate.setMinutes(txnDate.getMinutes()+j*45);
        let cust=null, discPct=0;
        if(Math.random()<0.6){ cust=this.state.customers[Math.floor(Math.random()*this.state.customers.length)]; discPct={Diamond:0.10,Platinum:0.07,Gold:0.05}[cust.tier]||0.03; }
        const items=[]; let subtotal=0;
        const shuffled=[...this.state.products].sort(()=>0.5-Math.random());
        for(let k=0;k<1+Math.floor(Math.random()*3);k++){
          const p=shuffled[k]; const qty=1+Math.floor(Math.random()*2);
          const price=cust?p.memberPrice:p.price;
          const itemDisc=Math.round(price*discPct); const final=price-itemDisc;
          items.push({productId:p.id,name:p.name,qty,price,discount:itemDisc,subtotal:final*qty});
          subtotal+=final*qty;
        }
        const tax=Math.round(subtotal*TAX_RATE); const total=subtotal+tax;
        const methods=['QRIS','Debit Card','Bank Transfer','Cash'];
        txns.push({ id:`txn-${c}`, invoiceNo:`CPR-INV-${c}`, date:txnDate.toISOString(), items, subtotal, tax, total, paymentMethod:methods[Math.floor(Math.random()*methods.length)], status:'Paid', cashier:'Edward Stark', customerId:cust?cust.id:null, customerName:cust?cust.name:'Walk-in Guest' });
      }
    }
    this.state.transactions=txns;
  }
}

const db = new Database();

// =============================================
// STATE
// =============================================
let cart = [];
let selectedCustomer = null;
let activePayMethod = 'Cash';

// =============================================
// UTILITIES
// =============================================
const rp = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',minimumFractionDigits:0,maximumFractionDigits:0}).format(n);
const formatRupiah = rp;
const uid = (p='id') => `${p}-${Math.random().toString(36).substr(2,9)}`;
const todayStr = () => new Date().toISOString().split('T')[0];

function playSfx(name) {
  if (name === 'sfxAdd' && typeof sfxAdd === 'function') sfxAdd();
  else if (name === 'sfxSuccess' && typeof sfxSuccess === 'function') sfxSuccess();
  else if (name === 'sfxError' && typeof sfxError === 'function') sfxError();
  else if (name === 'sfxScan' && typeof sfxScan === 'function') sfxScan();
  else if (name === 'sfxClick' && typeof sfxClick === 'function') sfxClick();
}

function switchTab(tab) {
  const link = document.querySelector(`.sidebar-nav-link[data-tab="${tab}"]`);
  if (link) link.click();
}

function syncMobileHeaderTitle() {
  const activeLink = document.querySelector('.sidebar-nav-link.active');
  const mobileTitle = document.getElementById('mobilePageTitle');
  if (activeLink && mobileTitle) {
    const span = activeLink.querySelector('span');
    if (span) {
      let titleText = span.textContent.trim();
      // Remove emojis
      titleText = titleText.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '').trim();
      mobileTitle.textContent = titleText;
    }
  }
}

// =============================================
// DOM READY
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  try { initParticles(); } catch(e) { console.warn('Particles:', e); }
  try { initTheme(); } catch(e) { console.warn('Theme:', e); }
  try { initSidebar(); } catch(e) { console.warn('Sidebar:', e); }
  try { initRouter(); } catch(e) { console.warn('Router:', e); }
  try { initClock(); } catch(e) { console.warn('Clock:', e); }
  try { initNotif(); } catch(e) { console.warn('Notif:', e); }
  try { init3D(); } catch(e) { console.warn('3D:', e); }
  try { initPOS(); } catch(e) { console.warn('POS:', e); }
  try { initProductCRUD(); } catch(e) { console.warn('ProductCRUD:', e); }
  try { initCustomerCRM(); } catch(e) { console.warn('CustomerCRM:', e); }
  try { initFinance(); } catch(e) { console.warn('Finance:', e); }
  try { initPurchase(); } catch(e) { console.warn('Purchase:', e); }
  try { initSettings(); } catch(e) { console.warn('Settings:', e); }
  try { initAI(); } catch(e) { console.warn('AI:', e); }
  try { initKeyboard(); } catch(e) { console.warn('Keyboard:', e); }
  try { initKiosk(); } catch(e) { console.warn('Kiosk:', e); }
  try { connectWebSocket(); } catch(e) { console.warn('WS:', e); }
  try { startOrderPolling(); } catch(e) { console.warn('Polling:', e); }
  try { initMarketing(); } catch(e) { console.warn('Marketing:', e); }
  try { enhanceSettings(); } catch(e) { console.warn('EnhanceSettings:', e); }
  try { renderDashboard(); } catch(e) { console.warn('Dashboard:', e); }
  try { updateNotifBadge(); } catch(e) { console.warn('NotifBadge:', e); }
  try { initBarcodeScanner(); } catch(e) { console.warn('Barcode:', e); }
  try { lockTerminal(); } catch(e) { console.warn('Lock:', e); }
  try { initQueueSystem(); } catch(e) { console.warn('QueueSystem:', e); }
  try { initOfflineSupport(); } catch(e) { console.warn('Offline:', e); }
  try { initCasirPROPromo(); } catch(e) { console.warn('Promo:', e); }
  try { initCasirPROStaff(); } catch(e) { console.warn('Staff:', e); }
  try { initCasirPROReports(); } catch(e) { console.warn('Reports:', e); }
  try { initCasirPROPayment(); } catch(e) { console.warn('Payment:', e); }
  try { initCasirPROPrinter(); } catch(e) { console.warn('Printer:', e); }
  try { initCasirPROWhatsApp(); } catch(e) { console.warn('WA:', e); }
  setTimeout(sfxClick, 600);
});

// =============================================
// PARTICLES
// =============================================
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if(!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let w=window.innerWidth, h=window.innerHeight;
  canvas.width=w; canvas.height=h;
  const particles=[];
  for(let i=0;i<60;i++){
    particles.push({ x:Math.random()*w, y:Math.random()*h, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3, r:Math.random()*2+0.5 });
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(99,102,241,0.15)'; ctx.fill();
    });
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<120){ ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.strokeStyle=`rgba(99,102,241,${0.06*(1-dist/120)})`; ctx.stroke(); }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize',()=>{ w=window.innerWidth; h=window.innerHeight; canvas.width=w; canvas.height=h; });
}

// =============================================
// THEME
// =============================================
function initTheme() {
  const toggle=document.getElementById('themeToggle');
  const saved=localStorage.getItem('casirpro_theme')||'dark';
  document.documentElement.setAttribute('data-theme',saved);
  if(toggle) toggle.addEventListener('click',()=>{
    const cur=document.documentElement.getAttribute('data-theme');
    const next=cur==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme',next);
    localStorage.setItem('casirpro_theme',next);
  });
}

// =============================================
// SIDEBAR TOGGLE
// =============================================
function initSidebar() {
  const toggle=document.getElementById('sidebarToggle');
  const sidebar=document.getElementById('appSidebar');
  if(toggle&&sidebar) toggle.addEventListener('click',()=>sidebar.classList.toggle('open'));
  
  // Dynamically set Online Store link based on protocol and branch ID
  const storeLink = document.querySelector('.sidebar-nav-link[data-tab="store"]');
  if (storeLink) {
    const branch = (typeof BRANCH_ID !== 'undefined' && BRANCH_ID) || sessionStorage.getItem('casirpro_branch') || '';
    let base = 'store.html';
    if (branch) {
      storeLink.href = `${base}?branch=${branch}`;
    } else {
      storeLink.href = base;
    }
  }

  // Owner Portal redirection with authentication token
  const ownerLink = document.getElementById('sidebarOwnerPortalLink');
  if (ownerLink) {
    ownerLink.addEventListener('click', e => {
      e.preventDefault();
      const token = sessionStorage.getItem('casirpro_token') || localStorage.getItem('casirpro_owner_token') || '';
      let url = 'owner.html';
      if (token) {
        url += `?token=${encodeURIComponent(token)}`;
      }
      window.location.href = url;
    });
  }

  // Sidebar auto-hide on scroll
  (function() {
    const s = document.getElementById('appSidebar');
    if (!s) return;
    let lastY = 0;
    window.addEventListener('scroll', function() {
      const y = window.scrollY;
      if (y > lastY && y > 100) {
        s.classList.add('sidebar-collapsed');
      } else if (y < lastY) {
        s.classList.remove('sidebar-collapsed');
      }
      lastY = y;
    }, { passive: true });
    s.addEventListener('mouseenter', function() {
      s.classList.remove('sidebar-collapsed');
    });
    s.addEventListener('mouseleave', function() {
      if (window.scrollY > 100) s.classList.add('sidebar-collapsed');
    });
  })();
}

// =============================================
// ROUTER
// =============================================
function initRouter() {
  const links=document.querySelectorAll('.sidebar-nav-link:not([target="_blank"])');
  const sections=document.querySelectorAll('.app-section');
  links.forEach(link=>{
    link.addEventListener('click',e=>{
      e.preventDefault();
      const target=link.getAttribute('data-tab');
      
      // RBAC Check for Admin Tabs
      if (['pengaturan', 'keuangan', 'laporan', 'promo', 'karyawan'].includes(target) && db.state.activeCashier) {
        const currentUser = db.state.staffList.find(s => s.name === db.state.activeCashier);
        if (!currentUser || currentUser.role !== 'Admin') {
          toast('Akses Ditolak', 'Hanya Administrator yang dapat mengakses menu ini.', 'danger');
          playSfx('sfxError');
          return;
        }
      }
      
      links.forEach(l=>l.classList.remove('active'));
      link.classList.add('active');
      syncMobileHeaderTitle();
      sections.forEach(s=>{ s.classList.remove('active-section'); if(s.id==='section-'+target) s.classList.add('active-section'); });
      if(target==='kiosk') renderKioskView();
      if(target==='dashboard') renderDashboard();
      if(target==='pos') renderPOS();
      if(target==='produk') renderProducts();
      if(target==='pembelian') renderPurchaseView();
      if(target==='pelanggan') renderCustomers();
      if(target==='keuangan') renderFinanceView();
      if(target==='laporan') renderReport();
      if(target==='profil') renderProfilePage();
      if(target==='antrean') renderQueueView();
      if(target==='promo') renderPromoSection();
      if(target==='karyawan') renderStaffSection();
    });
  });
}

// =============================================
// CLOCK
// =============================================
function initClock() {
  const el=document.getElementById('headerTime');
  if(!el) return;
  function tick(){
    const n=new Date();
    el.textContent=n.toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})+' | '+n.toLocaleTimeString('id-ID');
  }
  tick(); setInterval(tick,1000);
}

// =============================================
// NOTIFICATIONS
// =============================================
function initNotif() {
  const bell=document.getElementById('notifBell'), pane=document.getElementById('notifPane'), clearBtn=document.getElementById('clearNotifBtn');
  let open=false;
  if(bell&&pane){
    bell.addEventListener('click',e=>{ e.stopPropagation(); open=!open; pane.style.display=open?'block':'none'; renderNotifList(); });
    document.addEventListener('click',e=>{ if(open&&!pane.contains(e.target)&&e.target!==bell){ open=false; pane.style.display='none'; } });
  }
  if(clearBtn) clearBtn.addEventListener('click',()=>{ db.state.notifications=[]; db.save(); renderNotifList(); updateNotifBadge(); });
}

function updateNotifBadge() {
  const badge=document.getElementById('notifCount');
  if(!badge) return;
  const c=db.state.notifications.length;
  badge.textContent=c; badge.style.display=c>0?'flex':'none';
}

function renderNotifList() {
  const el=document.getElementById('notifList');
  if(!el) return;
  if(!db.state.notifications.length){ el.innerHTML='<div class="notif-item"><span class="text-xs text-gray-500">No notifications</span></div>'; return; }
  el.innerHTML=db.state.notifications.map(n=>`<div class="notif-item"><div><div class="notif-item-title">${n.title}</div><div class="notif-item-msg">${n.message}</div><span class="notif-item-time">${n.time}</span></div></div>`).join('');
}

function toast(title,msg,type='info') {
  const c=document.getElementById('toast-container');
  if(!c) return;
  const el=document.createElement('div'); el.className='toast';
  const icons={info:'🔔',warning:'⚠️',danger:'🚨',success:'✅'};
  el.innerHTML=`<span class="toast-icon">${icons[type]||'🔔'}</span><div class="toast-content"><div class="toast-title" style="color:${type==='danger'?'var(--danger)':type==='success'?'var(--success)':type==='warning'?'var(--warning)':'var(--primary)'}">${title}</div><div class="toast-msg">${msg}</div></div><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  c.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('show'));
  setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=>el.remove(),300); },4000);
}

function notif(type,title,msg) {
  const t=new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
  db.state.notifications.unshift({id:uid('n'),type,title,message:msg,time:t});
  db.save(); updateNotifBadge(); toast(title,msg,type);
}

// =============================================
// 3D EFFECTS
// =============================================
function init3D() {
  document.addEventListener('mousemove',e=>{
    const card=e.target.closest('.prod-card,.vip-card');
    if(!card) return;
    const rect=card.getBoundingClientRect();
    const x=e.clientX-rect.left, y=e.clientY-rect.top;
    const xc=rect.width/2, yc=rect.height/2;
    const rx=-((y-yc)/yc)*10, ry=((x-xc)/xc)*10;
    card.style.transform=`perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
    const glow=card.querySelector('.shine');
    if(glow) glow.style.background=`radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.12) 0%, transparent 65%)`;
  });
  document.addEventListener('mouseout',e=>{
    const card=e.target.closest('.prod-card,.vip-card');
    if(!card) return;
    if(!e.relatedTarget||!card.contains(e.relatedTarget)){
      card.style.transform='perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      const glow=card.querySelector('.shine'); if(glow) glow.style.background='transparent';
    }
  });
}

// =============================================
// DASHBOARD
// =============================================
let salesChartInst=null, catChartInst=null;

function renderDashboard() {
  const today=todayStr();
  const txns=db.state.transactions;
  const exps=db.state.expenses;
  const todayTxns=txns.filter(t=>t.date.split('T')[0]===today);

  const salesToday=todayTxns.reduce((s,t)=>s+t.total,0);
  let profitToday=0;
  todayTxns.forEach(t=>{ let c=0; t.items.forEach(i=>{ const p=db.state.products.find(x=>x.id===i.productId); if(p) c+=p.cost*i.qty; }); profitToday+=(t.subtotal-c); });

  const month=new Date().getMonth(), year=new Date().getFullYear();
  const monthly=txns.filter(t=>{const d=new Date(t.date); return d.getMonth()===month&&d.getFullYear()===year;});
  const monthlySales=monthly.reduce((s,t)=>s+t.total,0);
  const avgTicket=monthly.length?Math.round(monthlySales/monthly.length):0;

  animateVal('dashSalesToday',rp(salesToday));
  document.getElementById('dashOrdersToday').textContent = t('transactions_count', { count: todayTxns.length });
  animateVal('dashProfitToday',rp(profitToday));
  const margin=salesToday>0?Math.round((profitToday/salesToday)*100):0;
  document.getElementById('dashProfitMargin').textContent = `Margin ${margin}%`;
  animateVal('dashMonthlySales',rp(monthlySales));
  document.getElementById('dashMonthlyOrders').textContent = t('orders_count', { count: monthly.length });
  animateVal('dashAvgTicket',rp(avgTicket));
  document.getElementById('dashLowStockCount').textContent = t('items_count', { count: db.state.products.filter(p=>p.stock<=p.minStock).length });

  renderTopProducts();
  renderLowStock();
  renderRecentTxns();
  renderCharts();
  setTimeout(() => {
    enhanceDashboard();
    enhanceDashboardMore();
    renderHourlyChart();
    renderCashFlowChart();
    renderTopCashiers();
    renderCategorySalesChart();
    addSalesTargetWidget();
    renderSalesTarget();
  }, 200);
}

function animateVal(id,val){
  const el=document.getElementById(id);
  if(el) el.textContent=val;
}

function renderTopProducts() {
  const el=document.getElementById('dashTopProducts');
  if(!el) return;
  const counts={};
  db.state.transactions.forEach(t=>t.items.forEach(i=>{ counts[i.productId]=(counts[i.productId]||0)+i.qty; }));
  const top=Object.keys(counts).map(id=>{ const p=db.state.products.find(x=>x.id===id); return {name:p?p.name:'?',sold:counts[id],revenue:counts[id]*(p?p.price:0)}; }).sort((a,b)=>b.sold-a.sold).slice(0,5);
  if(!top.length){ el.innerHTML=`<tr><td colspan="4" class="text-center py-6 text-gray-500">${t('no_data')}</td></tr>`; return; }
  const badges=['🥇','🥈','🥉','4️⃣','5️⃣'];
  el.innerHTML=top.map((p,i)=>`<tr><td class="pl-2 text-xs font-bold">${badges[i]||'#'+(i+1)}</td><td class="text-xs font-medium">${p.name}</td><td class="text-center text-xs font-semibold">${p.sold}</td><td class="text-right text-xs font-bold" style="color:var(--primary-light)">${rp(p.revenue)}</td></tr>`).join('');
}

function renderLowStock() {
  const el=document.getElementById('dashLowStock');
  if(!el) return;
  const low=db.state.products.filter(p=>p.stock<=p.minStock);
  if(!low.length){ el.innerHTML=`<div class="p-4 text-center text-xs" style="color:var(--success)">${t('all_stock_healthy')}</div>`; return; }
  el.innerHTML=low.map(p=>`<div class="stock-alert-item"><div><p>${p.name}</p><span>SKU: ${p.sku} | Min: ${p.minStock}</span></div><div class="stock-alert-right"><div class="num">${t('left_suffix', {count: p.stock})}</div><button onclick="restock('${p.id}')">${t('restock_btn')}</button></div></div>`).join('');
}

function restock(id) {
  const p=db.state.products.find(x=>x.id===id);
  if(!p) return;
  p.stock=p.maxStock; db.save();
  renderDashboard(); renderProducts();
  notif('success', t('restocked_title'), t('restocked_msg', { name: p.name, stock: p.stock }));
}

function renderRecentTxns() {
  const el=document.getElementById('dashRecentTxns');
  if(!el) return;
  const recent=[...db.state.transactions].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
  if(!recent.length){ el.innerHTML=`<div class="text-center text-xs py-4 text-gray-500">${t('no_sales_yet')}</div>`; return; }
  el.innerHTML=recent.map(t_item=>{
    const time=new Date(t_item.date).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
    const cls={QRIS:'bg-teal-500/20 text-teal-400',Cash:'bg-amber-500/20 text-amber-400','Debit Card':'bg-indigo-500/20 text-indigo-400'}[t_item.paymentMethod]||'bg-gray-500/20 text-gray-400';
    const custName = t_item.customerName === 'Walk-in Guest' ? t('walk_in_guest') : t_item.customerName;
    return `<div class="recent-txn-item"><div class="recent-txn-left"><span class="inv">${t_item.invoiceNo}</span><span class="meta">${custName} • ${time}</span></div><div class="recent-txn-right"><div class="amount">${rp(t_item.total)}</div><span class="pay-badge ${cls}">${t_item.paymentMethod}</span></div></div>`;
  }).join('');
}

function renderCharts() {
  const txns=db.state.transactions;
  const days=[]; const sales=[]; const profits=[];

  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    const ds=d.toISOString().split('T')[0];
    days.push(d.toLocaleDateString('id-ID',{weekday:'short'}));
    const dayTxns=txns.filter(t=>t.date.split('T')[0]===ds);
    sales.push(dayTxns.reduce((s,t)=>s+t.total,0));
    let p=0; dayTxns.forEach(t=>{ let c=0; t.items.forEach(i=>{ const pr=db.state.products.find(x=>x.id===i.productId); if(pr) c+=pr.cost*i.qty; }); p+=(t.subtotal-c); }); profits.push(p);
  }

  if(salesChartInst) salesChartInst.destroy();
  const sCtx=document.getElementById('salesChart');
  if(sCtx){
    salesChartInst=new Chart(sCtx.getContext('2d'),{
      type:'line',
      data:{ labels:days, datasets:[
        { label:'Revenue', data:sales, borderColor:'#6366F1', backgroundColor:'rgba(99,102,241,0.1)', fill:true, tension:0.4, borderWidth:2, pointRadius:4, pointBackgroundColor:'#818CF8' },
        { label:'Profit', data:profits, borderColor:'#10B981', backgroundColor:'rgba(16,185,129,0.05)', fill:true, tension:0.4, borderWidth:2, pointRadius:4, pointBackgroundColor:'#34D399' }
      ]},
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ labels:{ color:'#9CA3AF', font:{ size:10 } } } }, scales:{ x:{ grid:{ color:'rgba(255,255,255,0.03)' }, ticks:{ color:'#9CA3AF', font:{ size:10 } } }, y:{ grid:{ color:'rgba(255,255,255,0.03)' }, ticks:{ color:'#9CA3AF', font:{ size:10 }, callback:v=>v>=1000000?(v/1000000)+'M':rp(v) } } } }
    });
  }

  // Category chart
  const catCounts={};
  txns.forEach(t=>t.items.forEach(i=>{ const p=db.state.products.find(x=>x.id===i.productId); if(p) catCounts[p.category]=(catCounts[p.category]||0)+i.qty; }));
  const catLabels=Object.keys(catCounts), catVals=Object.values(catCounts);
  if(catChartInst) catChartInst.destroy();
  const cCtx=document.getElementById('categoryChart');
  if(cCtx){
    catChartInst=new Chart(cCtx.getContext('2d'),{
      type:'doughnut',
      data:{ labels:catLabels.length?catLabels:['No Data'], datasets:[{ data:catVals.length?catVals:[1], backgroundColor:['#6366F1','#EC4899','#10B981','#F59E0B','#8B5CF6'], borderWidth:0, hoverOffset:4 }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'right', labels:{ color:'#9CA3AF', font:{ size:10 } } } }, cutout:'65%' }
    });
  }
}

function refreshDashboard() { renderDashboard(); toast('Refreshed','Dashboard data updated.','success'); }

// =============================================
// POS
// =============================================
function initPOS() {
  const search=document.getElementById('posSearch');
  const customerSel=document.getElementById('posCustomerSelect');
  const cancelBtn=document.getElementById('cancelCartBtn');
  const checkoutBtn=document.getElementById('checkoutBtn');
  const holdBtn=document.getElementById('holdCartBtn');
  const fsBtn=document.getElementById('posFullscreen');

  renderPOS();

  if(search) search.addEventListener('input',renderPOS);
  if(customerSel){
    customerSel.innerHTML='<option value="">Walk-in Guest</option>'+db.state.customers.map(c=>`<option value="${c.id}">${c.name} (${c.tier})</option>`).join('');
    customerSel.addEventListener('change',e=>{ selectedCustomer=db.state.customers.find(c=>c.id===e.target.value)||null; updateCart(); });
  }
  if(cancelBtn) cancelBtn.addEventListener('click',()=>{ if(cart.length&&confirm('Clear cart?')){ cart=[]; renderCart(); } });
  if(holdBtn) holdBtn.addEventListener('click',holdCart);
  if(checkoutBtn) checkoutBtn.addEventListener('click',()=>{ if(!cart.length){ toast('Empty Cart','Add items first.','warning'); return; } openCheckout(); });
  if(fsBtn) fsBtn.addEventListener('click',()=>{ if(!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); });
}

function renderPOS() {
  renderCategories();
  renderPOSProducts();
  renderCart();
}

function renderCategories() {
  const el=document.getElementById('posCategories');
  if(!el) return;
  let activeCat='All';
  el.innerHTML=['All',...db.state.categories].map(c=>`<button class="pos-cat-btn${c===activeCat?' active':''}" data-cat="${c}" onclick="selectCategory('${c}')">${c}</button>`).join('');
}

function selectCategory(cat) {
  document.querySelectorAll('.pos-cat-btn').forEach(b=>b.classList.toggle('active',b.getAttribute('data-cat')===cat));
  renderPOSProducts();
}

function renderPOSProducts() {
  const el=document.getElementById('posProductGrid');
  if(!el) return;
  const search=(document.getElementById('posSearch')?.value||'').toLowerCase();
  const activeCat=document.querySelector('.pos-cat-btn.active')?.getAttribute('data-cat')||'All';
  const filtered=db.state.products.filter(p=>{
    const matchCat=activeCat==='All'||p.category===activeCat;
    const matchSearch=p.name.toLowerCase().includes(search)||p.sku.toLowerCase().includes(search)||p.barcode.includes(search);
    return matchCat&&matchSearch;
  });
  if(!filtered.length){ el.innerHTML=`<div class="col-span-full text-center py-16" style="color:var(--text-muted)"><div style="font-size:40px;margin-bottom:8px">📦</div><p class="font-semibold">${t('no_products_found')}</p></div>`; return; }
  el.innerHTML=filtered.map(p=>{
    const isLow=p.stock<=p.minStock;
    const price=selectedCustomer?p.memberPrice:p.price;
    const oldPrice=selectedCustomer?`<span class="prod-price-old">${rp(p.price)}</span>`:'';
    return `<div class="prod-card" onclick="addToCart('${p.id}')"><div class="shine"></div><div class="prod-card-image" style="background:${p.imgBg}"><span class="prod-emoji">${p.imgEmoji}</span>${isLow?`<span class="prod-low-badge">${t('low_badge')}</span>`:''}</div><div class="prod-card-body"><span class="prod-category">${p.category}</span><div class="prod-name">${p.name}</div><div class="prod-price">${oldPrice}<span class="prod-price-current">${rp(price)}</span></div><div class="prod-card-footer"><span class="prod-stock">${t('stock_label')} <b style="${isLow?'color:var(--danger)':''}">${p.stock}</b></span><span class="prod-sku">${p.sku}</span></div></div></div>`;
  }).join('');
}

function addToCart(id) {
  const p=db.state.products.find(x=>x.id===id);
  if(!p) return;
  if(p.stock<=0){ toast(t('out_of_stock'), t('has_0_stock', {name: p.name}), 'danger'); return; }
  const ex=cart.find(i=>i.productId===id);
  if(ex){
    if(ex.qty>=p.stock){ toast(t('limit_warning'), t('only_available', {count: p.stock}), 'warning'); return; }
    ex.qty++;
  } else cart.push({productId:p.id,name:p.name,qty:1,imgEmoji:p.imgEmoji,imgBg:p.imgBg,price:selectedCustomer?p.memberPrice:p.price});
  renderCart(); toast(t('added_toast'), t('added_msg', {name: p.name}), 'success');
}

function updateCartQty(id,qty) {
  const item=cart.find(i=>i.productId===id);
  const p=db.state.products.find(x=>x.id===id);
  if(!item||!p) return;
  if(qty<=0) cart=cart.filter(i=>i.productId!==id);
  else if(qty>p.stock){ toast(t('limit_warning'), t('only_available', {count: p.stock}), 'warning'); item.qty=p.stock; }
  else item.qty=qty;
  renderCart();
}

function renderCart() {
  const container=document.getElementById('cartItems');
  const countEl=document.getElementById('cartItemCount');
  if(!container) return;
  if(countEl) countEl.textContent=cart.length;
  if(!cart.length){
    container.innerHTML=`<div class="cart-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><p>${t('empty_cart')}</p><span>${t('select_products_to_start')}</span></div>`;
    updateTotals(); return;
  }
  // Show active promos bar
  let promoBar = '';
  if (typeof CasirPromo !== 'undefined') {
    CasirPromo.init();
    const cartData = { subtotal: cart.reduce((s, i) => {
      const p = db.state.products.find(x => x.id === i.productId);
      return s + ((p ? (selectedCustomer && p.memberPrice ? p.memberPrice : p.price) : 0) * i.qty);
    }, 0), items: cart.map(i => ({ id: i.productId, name: i.name, qty: i.qty })) };
    const promoResult = CasirPromo.apply(cartData, selectedCustomer);
    if (promoResult.discounts.length) {
      promoBar = `<div style="background:linear-gradient(135deg,rgba(245,158,11,0.1),rgba(245,158,11,0.02));border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:8px 12px;margin-bottom:8px;font-size:11px;">
        <div style="font-weight:600;color:var(--accent);margin-bottom:4px;">🏷️ Promo Aktif</div>
        ${promoResult.discounts.map(d => `<div style="display:flex;justify-content:space-between;font-size:10px;"><span>${d.name}</span><span style="color:var(--success);">-${rp(d.amount)}</span></div>`).join('')}
        ${promoResult.totalDiscount > 0 ? `<div style="border-top:1px solid rgba(245,158,11,0.1);margin-top:4px;padding-top:4px;display:flex;justify-content:space-between;font-weight:600;">Total Diskon Promo <span style="color:var(--success);">-${rp(promoResult.totalDiscount)}</span></div>` : ''}
      </div>`;
    }
  }
  container.innerHTML=promoBar + cart.map(item=>`<div class="cart-item"><div class="cart-item-img" style="background:${item.imgBg}"><span>${item.imgEmoji}</span></div><div class="cart-item-info"><div class="cart-item-name">${item.name}</div><div class="cart-item-price">${rp(item.price)}</div></div><div class="cart-item-qty"><button class="cart-qty-btn" onclick="updateCartQty('${item.productId}',${item.qty-1})">−</button><span class="cart-qty-val">${item.qty}</span><button class="cart-qty-btn" onclick="updateCartQty('${item.productId}',${item.qty+1})">+</button></div></div>`).join('');
  updateTotals();
}

function updateTotals() {
  let sub=0, disc=0;
  cart.forEach(item=>{
    const p=db.state.products.find(x=>x.id===item.productId);
    if(!p) return;
    let price=p.price;
    if(selectedCustomer){
      price=p.memberPrice;
      const td={Diamond:0.10,Platinum:0.07,Gold:0.05,Silver:0.03}[selectedCustomer.tier]||0;
      disc+=price*td*item.qty;
    }
    sub+=price*item.qty;
  });
  const finalSub=sub-disc;
  const tax=Math.round(finalSub*db.state.settings.taxRate);
  const total=finalSub+tax;

  document.getElementById('cartSubtotal').textContent=rp(sub);
  document.getElementById('cartDiscount').textContent=`-${rp(disc)}`;
  document.getElementById('cartTax').textContent=rp(tax);
  document.getElementById('cartTotal').textContent=rp(total);
  document.getElementById('checkoutBtn').innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg> ${t('pay_btn').replace('{total}', rp(total))}`;
}

function holdCart() {
  if(!cart.length) return;
  db.state.heldCarts.push({id:uid('hold'),items:[...cart],customer:selectedCustomer,date:new Date().toISOString()});
  db.save();
  cart=[]; selectedCustomer=null;
  const sel=document.getElementById('posCustomerSelect');
  if(sel) sel.value='';
  renderCart();
  toast(t('cart_held'), t('saved_as_draft'), 'info');
}

// =============================================
// CHECKOUT
// =============================================
function openCheckout() {
  const modal=document.getElementById('checkoutModal');
  if(!modal) return;
  let sub=0, disc=0;
  cart.forEach(item=>{
    const p=db.state.products.find(x=>x.id===item.productId);
    if(!p) return;
    let price=p.price;
    if(selectedCustomer){
      price=p.memberPrice;
      const td={Diamond:0.10,Platinum:0.07,Gold:0.05,Silver:0.03}[selectedCustomer.tier]||0;
      disc+=price*td*item.qty;
    }
    sub+=price*item.qty;
  });
  const total=sub-disc+Math.round((sub-disc)*db.state.settings.taxRate);
  document.getElementById('checkoutTotal').textContent=rp(total);
  document.getElementById('cashReceived').value=total;
  calcChange();
  selectPayMethod('Cash');
  renderQRIS();
  modal.style.display='flex';
}

function selectPayMethod(m) {
  activePayMethod=m;
  document.querySelectorAll('.pay-method').forEach(b=>b.classList.toggle('active',b.getAttribute('data-method')===m));
  document.getElementById('checkoutPaneCash').style.display=m==='Cash'?'flex':'none';
  document.getElementById('checkoutPaneQris').style.display=m==='QRIS'?'flex':'none';
  document.getElementById('checkoutPaneSplit').style.display=m==='Split'?'flex':'none';
  document.getElementById('checkoutPaneDebit').style.display=m==='Debit'?'flex':'none';
  document.getElementById('checkoutPaneKasbon').style.display=m==='Kasbon'?'flex':'none';
  
  if (m === 'Kasbon') {
    const infoEl = document.getElementById('kasbonCustomerInfo');
    if (!selectedCustomer) {
      infoEl.innerHTML = `<span style="color:var(--danger); font-weight:700;">⚠️ Walk-in Guest tidak bisa menggunakan Kasbon.</span><br>Silakan pilih pelanggan terlebih dahulu di POS.`;
    } else {
      const limit = selectedCustomer.maxDebtLimit != null ? selectedCustomer.maxDebtLimit : 2000000;
      const debt = selectedCustomer.currentDebt || 0;
      const remaining = Math.max(0, limit - debt);
      const totalTxt = document.getElementById('checkoutTotal').textContent;
      const total = parseInt(totalTxt.replace(/[^0-9]/g,''))||0;
      
      infoEl.innerHTML = `
        Pelanggan: <strong>${selectedCustomer.name}</strong><br>
        Batas Limit Kasbon: <strong>${rp(limit)}</strong><br>
        Kasbon Saat Ini: <strong style="color:var(--rose);">${rp(debt)}</strong><br>
        Sisa Limit Tersedia: <strong style="color:var(--success);">${rp(remaining)}</strong><br>
        ------------------------------------------------<br>
        Belanja Sekarang: <strong>${rp(total)}</strong><br>
        ${total > remaining ? `<span style="color:var(--danger); font-weight:700;">⚠️ Saldo Kasbon Tidak Mencukupi!</span>` : `<span style="color:var(--success); font-weight:700;">✓ Batas Kasbon Aman</span>`}
      `;
    }
  }
  if(m==='QRIS') {
    const btn = document.getElementById('qrisPayWithCasirBtn');
    if (btn) {
      btn.onclick = () => {
        toast('✅ Pembayaran QRIS terkonfirmasi!', '', 'success');
        submitPayment();
      };
    }
  }
  if(m==='Split') initSplit();
}

function calcChange() {
  const totalTxt=document.getElementById('checkoutTotal').textContent;
  const total=parseInt(totalTxt.replace(/[^0-9]/g,''))||0;
  const received=parseInt(document.getElementById('cashReceived').value)||0;
  const change=received-total;
  const el=document.getElementById('checkoutChange');
  if(change>=0){ el.textContent=rp(change); el.style.color='var(--success)'; }
  else { el.textContent=`Short ${rp(Math.abs(change))}`; el.style.color='var(--danger)'; }
}

function setCash(v) {
  const totalTxt=document.getElementById('checkoutTotal').textContent;
  const total=parseInt(totalTxt.replace(/[^0-9]/g,''))||0;
  const el=document.getElementById('cashReceived');
  if(v==='exact') el.value=total;
  else el.value=v;
  calcChange();
}

function renderQRIS() {
  const totalTxt=document.getElementById('checkoutTotal').textContent;
  const total=parseInt(totalTxt.replace(/[^0-9]/g,''))||0;
  
  const amtEl = document.getElementById('qrisTotalAmount');
  if (amtEl) amtEl.textContent = rp(total);
  
  const container = document.getElementById('qrisImgContainer');
  if (container) {
    const branch = sessionStorage.getItem('casirpro_branch') || 'main';
    const qrData = `CASIRPRO-BRANCH-${branch}-TOTAL-${total}-${Date.now()}`;
    container.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrData)}" style="width:160px; height:160px; border-radius:8px;" alt="QRIS Dinamis">`;
  }
  
  if (window._qrisInterval) clearInterval(window._qrisInterval);
  let sec=299;
  const timer=document.getElementById('qrisTimer');
  if(timer){
    window._qrisInterval=setInterval(()=>{
      const m=Math.floor(sec/60), s=sec%60;
      timer.textContent=`Expires in ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      sec--;
      if(sec<0) { clearInterval(window._qrisInterval); window._qrisInterval = null; }
    },1000);
  }
}

function initSplit() {
  const totalTxt=document.getElementById('checkoutTotal').textContent;
  const total=parseInt(totalTxt.replace(/[^0-9]/g,''))||0;
  const half=Math.round(total/2);
  document.getElementById('splitCash').value=half;
  document.getElementById('splitQris').value=total-half;
  calcSplit();
}

function calcSplit() {
  const totalTxt=document.getElementById('checkoutTotal').textContent;
  const total=parseInt(totalTxt.replace(/[^0-9]/g,''))||0;
  const cash=parseInt(document.getElementById('splitCash').value)||0;
  const qris=parseInt(document.getElementById('splitQris').value)||0;
  const sum=cash+qris;
  document.getElementById('splitAllocated').textContent=rp(sum);
  const status=document.getElementById('splitStatus');
  if(sum===total){ status.textContent='✓ Balanced'; status.style.color='var(--success)'; }
  else if(sum<total){ status.textContent=`Short ${rp(total-sum)}`; status.style.color='var(--danger)'; }
  else { status.textContent=`Over ${rp(sum-total)}`; status.style.color='var(--warning)'; }
}

function closeCheckoutModal() {
  if (window._qrisInterval) { clearInterval(window._qrisInterval); window._qrisInterval = null; }
  document.getElementById('checkoutModal').style.display='none';
}

function submitPayment() {
  let sub=0, disc=0, promoDiscount=0;
  const items=[];
  const cartForPromo = { subtotal: 0, items: [] };
  cart.forEach(item=>{
    const p=db.state.products.find(x=>x.id===item.productId);
    if(!p) return;
    let price=p.price, itemDisc=0;
    if(selectedCustomer){
      if(p.memberPrice!=null && p.memberPrice>0){
        price=p.memberPrice;
      } else {
        const td={Diamond:0.10,Platinum:0.07,Gold:0.05,Silver:0.03}[selectedCustomer.tier]||0;
        disc+=price*td*item.qty;
      }
    }
    const final=price-itemDisc;
    items.push({productId:item.productId,name:item.name,qty:item.qty,price,discount:itemDisc,subtotal:final*item.qty});
    sub+=final*item.qty;
    disc+=itemDisc*item.qty;
    cartForPromo.items.push({ id: item.productId, name: item.name, qty: item.qty });
  });
  cartForPromo.subtotal = sub;

  // Apply promo engine
  let appliedPromos = [];
  if (typeof CasirPromo !== 'undefined') {
    CasirPromo.init();
    const promoResult = CasirPromo.apply(cartForPromo, selectedCustomer);
    if (promoResult.totalDiscount > 0) {
      promoDiscount = promoResult.totalDiscount;
      appliedPromos = promoResult.discounts;
      sub = Math.max(0, sub - promoDiscount);
    }
  }

  const tax=Math.round(sub*db.state.settings.taxRate);
  const total=sub+tax;

  let payMethod=activePayMethod;
  if(activePayMethod==='Split'){
    const cash=parseInt(document.getElementById('splitCash').value)||0;
    const qris=parseInt(document.getElementById('splitQris').value)||0;
    if(cash+qris!==total){ toast('Split Error','Amounts do not match total.','danger'); return; }
    payMethod=`Split(Cash:${rp(cash)},QRIS:${rp(qris)})`;
  } else if(activePayMethod==='Cash'){
    const received=parseInt(document.getElementById('cashReceived').value)||0;
    if(received<total){ toast('Insufficient','Cash amount is less than total.','danger'); return; }
  } else if(activePayMethod==='Debit'){
    payMethod='Debit Card';
  } else if (activePayMethod === 'QRIS') {
    // QRIS validated manually/dynamically; skip amount check
  } else if (activePayMethod === 'Kasbon') {
    if (!selectedCustomer) { toast('Error', 'Silakan pilih pelanggan terlebih dahulu.', 'danger'); return; }
    const limit = selectedCustomer.maxDebtLimit != null ? selectedCustomer.maxDebtLimit : 2000000;
    const debt = selectedCustomer.currentDebt || 0;
    const remaining = limit - debt;
    if (total > remaining) { toast('Batas Terlampaui', `Kasbon melebihi limit. Sisa limit: ${rp(remaining)}`, 'danger'); return; }
    
    selectedCustomer.currentDebt = (selectedCustomer.currentDebt || 0) + total;
    const cIdx = db.state.customers.findIndex(c => c.id === selectedCustomer.id);
    if (cIdx !== -1) db.state.customers[cIdx] = selectedCustomer;
    
    payMethod = 'Kasbon';
  }

  if(selectedCustomer){
    const pts=Math.floor(total/50000);
    selectedCustomer.points+=pts;
    selectedCustomer.ltv+=total;
    if(selectedCustomer.points>=3000) selectedCustomer.tier='Diamond';
    else if(selectedCustomer.points>=1200) selectedCustomer.tier='Platinum';
    else if(selectedCustomer.points>=600) selectedCustomer.tier='Gold';
    else selectedCustomer.tier='Silver';
    const idx=db.state.customers.findIndex(c=>c.id===selectedCustomer.id);
    if(idx!==-1) db.state.customers[idx]=selectedCustomer;
  }

  cart.forEach(item=>{
    const p=db.state.products.find(x=>x.id===item.productId);
    if(p){ p.stock-=item.qty; if(p.stock<=p.minStock) notif('warning','Low Stock',`${p.name}: ${p.stock} left.`); }
  });

  const invNo=`CPR-INV-${1000+db.state.transactions.length+1}`;
  const txn={ id:uid('txn'), invoiceNo:invNo, date:new Date().toISOString(), items, subtotal:sub, tax, total, promoDiscount, appliedPromos: appliedPromos.map(a => a.name), paymentMethod:payMethod, status:'Paid', cashier:db.state.activeCashier||'Edward Stark', customerId:selectedCustomer?selectedCustomer.id:null, customerName:selectedCustomer?selectedCustomer.name:'Walk-in Guest' };
  db.state.transactions.push(txn);

  const shift=db.state.shifts.find(s=>s.status==='Active' && s.cashier === (db.state.activeCashier || 'Edward Stark'));
  if(shift) {
    shift.totalSales = (shift.totalSales || 0) + total;
    let cashPortion = 0;
    if (activePayMethod === 'Cash') {
      cashPortion = total;
    } else if (activePayMethod === 'Split') {
      cashPortion = parseInt(document.getElementById('splitCash').value) || 0;
    }
    shift.expectedCash = (shift.expectedCash || shift.startingCash) + cashPortion;
  }

  db.save();

  // Offline save via CasirDB
  if (typeof CasirDB !== 'undefined') {
    CasirDB.open().then(() => {
      CasirDB.save('transactions', txn).catch(() => {});
    }).catch(() => {});
  }

  closeCheckoutModal();
  showReceipt(txn);

  // Thermal print via CasirPrint
  if (typeof CasirPrint !== 'undefined') {
    setTimeout(() => {
      CasirPrint.printReceipt(txn, { companyName: db.state.settings.companyName, branchName: db.state.settings.branchName });
    }, 500);
  }

  // WhatsApp notification (if customer has WA number)
  if (typeof CasirWA !== 'undefined' && selectedCustomer && selectedCustomer.phone) {
    CasirWA.sendReceipt(txn, selectedCustomer.phone);
  }

  cart=[]; selectedCustomer=null;
  const sel=document.getElementById('posCustomerSelect');
  if(sel) sel.value='';
  renderCart();
  toast('Sale Complete',`${invNo} - ${rp(total)}`,'success');
}

// =============================================
// RECEIPT
// =============================================
function showReceipt(txn) {
  const overlay=document.getElementById('receiptOverlay');
  const content=document.getElementById('receiptContent');
  const actions=document.getElementById('receiptActions');
  if(!overlay||!content) return;

  const items=txn.items.map(i=>`<div class="receipt-row"><span>${i.name} x${i.qty}</span><span>${rp(i.subtotal)}</span></div>`).join('');
  const date=new Date(txn.date).toLocaleString('id-ID');

  const noteHtml = txn.note ? `<div class="receipt-divider"></div><div class="receipt-row"><span>Note:</span><span>${txn.note}</span></div>` : '';
  const customerNameTranslated = txn.customerName === 'Walk-in Guest' ? t('walk_in_guest') : txn.customerName;
  const promoHtml = txn.promoDiscount > 0 ? `<div class="receipt-row" style="color:var(--accent);"><span>🏷️ Promo</span><span>-${rp(txn.promoDiscount)}</span></div>` : '';
  content.innerHTML=`<div class="receipt-header"><h3>${db.state.settings.companyName}</h3><p>${db.state.settings.branchName}</p><p>${txn.invoiceNo} | ${date}</p></div><div class="receipt-divider"></div><div class="receipt-row"><span>${t('receipt_cashier')}</span><span>${txn.cashier}</span></div><div class="receipt-row"><span>${t('receipt_customer')}</span><span>${customerNameTranslated}</span></div><div class="receipt-divider"></div>${items}${noteHtml}<div class="receipt-divider"></div><div class="receipt-row"><span>${t('subtotal')}</span><span>${rp(txn.subtotal)}</span></div>${promoHtml}<div class="receipt-row"><span>${t('tax')} (${Math.round(db.state.settings.taxRate*100)}%)</span><span>${rp(txn.tax)}</span></div><div class="receipt-total"><span>${t('total')}</span><span>${rp(txn.total)}</span></div><div class="receipt-divider"></div><div class="receipt-footer"><p>${t('th_payment')}: ${txn.paymentMethod}</p><p class="thanks">${t('receipt_thanks')}</p><p>CasirPRO • Enterprise Suite</p></div>`;

  // Add WA send button in receipt actions
  const receiptActions = document.querySelector('.receipt-actions');
  if (receiptActions) {
    const waBtn = receiptActions.querySelector('.wa-send-btn');
    if (!waBtn && txn.customerName !== 'Walk-in Guest') {
      const waBtnHtml = `<button class="glass-btn glass-btn-sm wa-send-btn" onclick="sendReceiptWA()" style="background:rgba(37,211,102,0.1);border-color:rgba(37,211,102,0.2);color:#25D366;font-size:10px;">💬 Kirim via WA</button>`;
      receiptActions.insertAdjacentHTML('afterbegin', waBtnHtml);
    }
  }

  overlay.style.display='flex';
  window.receiptTxn=txn;
}

function sendReceiptWA() {
  const txn = window.receiptTxn;
  if (!txn) return;
  if (typeof CasirWA !== 'undefined') {
    const phone = txn.customerPhone || (selectedCustomer && selectedCustomer.phone) || '';
    if (phone) {
      CasirWA.sendReceipt(phone, txn);
      toast('Struk dikirim via WhatsApp', '', 'success');
    } else {
      toast('No. HP pelanggan tidak tersedia', '', 'warning');
    }
  } else {
    toast('Modul WhatsApp tidak tersedia', '', 'warning');
  }
}

function closeReceipt() {
  document.getElementById('receiptOverlay').style.display='none';
}

function printReceipt() {
  const txn = window.receiptTxn;
  if (typeof CasirPrint !== 'undefined' && txn) {
    CasirPrint.printReceipt(txn, { companyName: db.state.settings.companyName, branchName: db.state.settings.branchName });
    return;
  }
  window.print();
}

function downloadReceipt() {
  const content=document.getElementById('receiptContent');
  if(!content) return;
  const clone=content.cloneNode(true);
  const style=document.createElement('style');
  style.textContent='body{font-family:Arial;padding:20px;color:#000;font-size:12px}';
  const win=window.open('','_blank');
  if(win){ win.document.write('<html><head><title>Receipt</title></head><body>'); win.document.write(style.outerHTML); win.document.write(clone.outerHTML); win.document.write('</body></html>'); win.document.close(); win.print(); }
}

// =============================================
// PRODUCT CRUD
// =============================================
function initProductCRUD() {
  const search=document.getElementById('productSearch');
  const addBtn=document.getElementById('addProductBtn');
  const form=document.getElementById('productForm');
  const stockInBtn=document.getElementById('stockInBtn');
  const stockOutBtn=document.getElementById('stockOutBtn');

  if(search) search.addEventListener('input',e=>renderProducts(e.target.value.toLowerCase()));
  if(addBtn) addBtn.addEventListener('click',()=>openProductModal());
  if(form) form.addEventListener('submit',e=>{ e.preventDefault(); saveProduct(); });
  if(stockInBtn) stockInBtn.addEventListener('click',()=>openStockModal('in'));
  if(stockOutBtn) stockOutBtn.addEventListener('click',()=>openStockModal('out'));
}

function openProductModal(id){
  const modal=document.getElementById('productModal');
  const title=document.getElementById('prodModalTitle');
  const form=document.getElementById('productForm');
  form.reset();
  document.getElementById('prodId').value='';
  title.textContent=t('add_product');
  if(id){
    const p=db.state.products.find(x=>x.id===id);
    if(p){
      title.textContent=t('edit_btn') + ' ' + t('th_product');
      document.getElementById('prodId').value=p.id;
      document.getElementById('prodName').value=p.name;
      document.getElementById('prodSku').value=p.sku;
      document.getElementById('prodBarcode').value=p.barcode;
      document.getElementById('prodCategory').value=p.category;
      document.getElementById('prodBrand').value=p.brand||'';
      document.getElementById('prodCost').value=p.cost;
      document.getElementById('prodPrice').value=p.price;
      document.getElementById('prodMemberPrice').value=p.memberPrice;
      document.getElementById('prodStock').value=p.stock;
      document.getElementById('prodMinStock').value=p.minStock;
      document.getElementById('prodDesc').value=p.desc||'';
    }
  }
  modal.style.display='flex';
}

function saveProduct(){
  const id=document.getElementById('prodId').value;
  const name=document.getElementById('prodName').value;
  const sku=document.getElementById('prodSku').value;
  const barcode=document.getElementById('prodBarcode').value;
  const cat=document.getElementById('prodCategory').value;
  const brand=document.getElementById('prodBrand').value;
  const cost=parseFloat(document.getElementById('prodCost').value);
  const price=parseFloat(document.getElementById('prodPrice').value);
  const memberPrice=parseFloat(document.getElementById('prodMemberPrice').value);
  const stock=parseInt(document.getElementById('prodStock').value);
  const minStock=parseInt(document.getElementById('prodMinStock').value);
  const desc=document.getElementById('prodDesc').value;

  if (!name) { toast(t('failed'), t('name_required', 'Nama produk wajib diisi.'), 'danger'); return; }
  if (!cost || cost <= 0) { toast(t('failed'), t('cost_invalid', 'Harga modal harus lebih besar dari 0.'), 'danger'); return; }
  if (!price || price <= 0) { toast(t('failed'), t('price_invalid', 'Harga jual harus lebih besar dari 0.'), 'danger'); return; }
  if (stock < 0) { toast(t('failed'), t('stock_negative', 'Stok tidak boleh negatif.'), 'danger'); return; }

  if(id){
    const idx=db.state.products.findIndex(p=>p.id===id);
    if(idx!==-1) Object.assign(db.state.products[idx],{name,sku,barcode,category:cat,brand,cost,price,memberPrice,stock,minStock,desc});
  } else {
    let emoji='📦', grad='linear-gradient(135deg,#1e293b,#0f172a)';
    if(cat.toLowerCase().includes('gadget')){ emoji='📱'; grad='linear-gradient(135deg,#8b5cf6,#4c1d95)'; }
    else if(cat.toLowerCase().includes('luxury')){ emoji='💎'; grad='linear-gradient(135deg,#f59e0b,#b45309)'; }
    else if(cat.toLowerCase().includes('lifestyle')){ emoji='☕'; grad='linear-gradient(135deg,#78350f,#451a03)'; }
    else if(cat.toLowerCase().includes('office')){ emoji='🖥️'; grad='linear-gradient(135deg,#1e40af,#1e3a5f)'; }
    db.state.products.push({id:uid('p'),name,sku,barcode,category:cat,brand,cost,price,memberPrice,stock,maxStock:stock*2,minStock,imgBg:grad,imgEmoji:emoji,desc});
  }
  db.save();
  closeModal('productModal');
  renderProducts();
  renderPOS();
  document.dispatchEvent(new CustomEvent('productsChanged'));
  syncProductsToServer();
  toast(t('saved'),`${name} ${t('saved').toLowerCase()}.`,'success');
}

function editProduct(id){ openProductModal(id); }
function deleteProduct(id){
  if(confirm(t('confirm_delete_product', 'Hapus produk ini?'))){ db.state.products=db.state.products.filter(p=>p.id!==id); db.save(); renderProducts(); renderPOS(); document.dispatchEvent(new CustomEvent('productsChanged')); syncProductsToServer(); toast(t('deleted'), t('product_removed', 'Produk dihapus.'),'danger'); }
}

function renderProducts(filter=''){
  const el=document.getElementById('productsTbody');
  if(!el) return;
  const prods=db.state.products.filter(p=>p.name.toLowerCase().includes(filter)||p.sku.toLowerCase().includes(filter)||p.barcode.includes(filter)||p.category.toLowerCase().includes(filter));
  if(!prods.length){ el.innerHTML=`<tr><td colspan="7" class="text-center py-8 text-gray-500">${t('no_products_found')}</td></tr>`; return; }
  el.innerHTML=prods.map(p=>{
    const isLow=p.stock<=p.minStock;
    return `<tr><td class="pl-4"><div class="flex items-center gap-2"><span style="font-size:16px">${p.imgEmoji}</span><div><p class="font-semibold" style="color:var(--text-primary)">${p.name}</p><span style="font-size:10px;color:var(--text-muted)">${p.sku}</span></div></div></td><td>${p.category}</td><td style="font-family:var(--font-mono)">${p.barcode}</td><td>${rp(p.cost)}</td><td style="font-weight:700;color:var(--primary-light)">${rp(p.price)}</td><td class="text-center"><span style="padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700;${isLow?'background:rgba(239,68,68,0.15);color:var(--danger);border:1px solid rgba(239,68,68,0.2)':'background:rgba(16,185,129,0.15);color:var(--success);border:1px solid rgba(16,185,129,0.2)'}">${p.stock}</span></td><td class="text-right pr-4"><button onclick="editProduct('${p.id}')" class="text-xs font-bold" style="color:var(--primary-light);background:none;border:none;cursor:pointer">${t('edit_btn')}</button> <button onclick="deleteProduct('${p.id}')" class="text-xs font-bold" style="color:var(--danger);background:none;border:none;cursor:pointer">${t('delete_btn')}</button></td></tr>`;
  }).join('');
}

function openStockModal(type) {
  const modal=document.getElementById('stockModal');
  const title=document.getElementById('stockModalTitle');
  const submit=document.getElementById('stockSubmitBtn');
  document.getElementById('stockType').value=type;
  title.textContent=type==='in'? t('stock_in') + ' (Receiving)' : t('stock_out') + ' (Issuing)';
  submit.textContent=type==='in'? t('stock_in') : t('stock_out');
  const sel=document.getElementById('stockProduct');
  sel.innerHTML=db.state.products.map(p=>`<option value="${p.id}">${p.name} (Stock: ${p.stock})</option>`).join('');
  document.getElementById('stockQty').value='';
  document.getElementById('stockRef').value='';
  document.getElementById('stockNotes').value='';
  document.getElementById('stockForm').onsubmit=e=>{ e.preventDefault(); processStock(); };
  modal.style.display='flex';
}

function processStock() {
  const type=document.getElementById('stockType').value;
  const prodId=document.getElementById('stockProduct').value;
  const qty=parseInt(document.getElementById('stockQty').value);
  const ref=document.getElementById('stockRef').value;
  const notes=document.getElementById('stockNotes').value;
  const p=db.state.products.find(x=>x.id===prodId);
  if(!p||!qty||qty<1){ toast(t('failed'), t('invalid_qty'), 'danger'); return; }
  if(type==='in') p.stock+=qty;
  else { if(p.stock<qty){ toast(t('failed'), t('only_available', {count: p.stock}), 'danger'); return; } p.stock-=qty; }
  db.save();
  closeModal('stockModal');
  renderProducts(); renderPOS();
  toast(t('success'), `${type==='in' ? t('received') : t('issued')} ${qty} x ${p.name}`, 'success');
  if(p.stock<=p.minStock) notif('warning', t('low_stock_critical'), `${p.name}: ${t('left_suffix', {count: p.stock})}`);
}

// =============================================
// CUSTOMER CRM
// =============================================
function initCustomerCRM() {
  const search=document.getElementById('customerSearch');
  const addBtn=document.getElementById('addCustomerBtn');
  const form=document.getElementById('customerForm');
  if(search) search.addEventListener('input',e=>renderCustomers(e.target.value.toLowerCase()));
  if(addBtn) addBtn.addEventListener('click',()=>openCustomerModal());
  if(form) form.addEventListener('submit',e=>{ e.preventDefault(); saveCustomer(); });
}

function openCustomerModal(id){
  const modal=document.getElementById('customerModal');
  const title=document.getElementById('custModalTitle');
  const form=document.getElementById('customerForm');
  form.reset();
  document.getElementById('custId').value='';
  document.getElementById('custDebtLimit').value = 2000000;
  document.getElementById('custCurrentDebt').value = 0;
  title.textContent=t('register_vip');
  if(id){
    const c=db.state.customers.find(x=>x.id===id);
    if(c){
      title.textContent=t('edit_btn') + ' VIP Member';
      document.getElementById('custId').value=c.id;
      document.getElementById('custName').value=c.name;
      document.getElementById('custPhone').value=c.phone;
      document.getElementById('custEmail').value=c.email;
      document.getElementById('custTier').value=c.tier;
      document.getElementById('custDebtLimit').value = c.maxDebtLimit != null ? c.maxDebtLimit : 2000000;
      document.getElementById('custCurrentDebt').value = c.currentDebt || 0;
    }
  }
  modal.style.display='flex';
}

function saveCustomer(){
  const id=document.getElementById('custId').value;
  const name=document.getElementById('custName').value;
  const phone=document.getElementById('custPhone').value;
  const email=document.getElementById('custEmail').value;
  const tier=document.getElementById('custTier').value;
  const maxDebtLimit = parseInt(document.getElementById('custDebtLimit').value) || 0;
  const currentDebt = parseInt(document.getElementById('custCurrentDebt').value) || 0;

  if(id){
    const idx=db.state.customers.findIndex(c=>c.id===id);
    if(idx!==-1) Object.assign(db.state.customers[idx],{name,phone,email,tier,maxDebtLimit,currentDebt});
  } else {
    db.state.customers.push({id:uid('c'),name,phone,email,tier,points:0,ltv:0,joinDate:new Date().toISOString().split('T')[0],cardNo:`CPR-${tier.substring(0,4).toUpperCase()}-${Math.floor(1000+Math.random()*9000)}`,maxDebtLimit,currentDebt});
  }
  db.save();
  closeModal('customerModal');
  renderCustomers();

  const sel=document.getElementById('posCustomerSelect');
  if(sel) sel.innerHTML=`<option value="">${t('walk_in_guest')}</option>`+db.state.customers.map(c=>`<option value="${c.id}">${c.name} (${c.tier})</option>`).join('');
  toast(t('success'),`${name} ${t('saved').toLowerCase()}.`, 'success');
}

function editCustomer(id){ openCustomerModal(id); }
function deleteCustomer(id){
  if(confirm(t('confirm_delete_vip'))){ db.state.customers=db.state.customers.filter(c=>c.id!==id); db.save(); renderCustomers(); }
}

function renderCustomers(filter=''){
  const tbody=document.getElementById('customersTbody');
  const cards=document.getElementById('vipCards');
  if(!tbody||!cards) return;

  const filtered=db.state.customers.filter(c=>c.name.toLowerCase().includes(filter)||c.phone.includes(filter)||c.tier.toLowerCase().includes(filter));
  tbody.innerHTML=filtered.length?filtered.map(c=>`<tr><td class="pl-4 font-semibold" style="color:var(--text-primary)">${c.name}</td><td style="font-family:var(--font-mono)">${c.cardNo}</td><td><span style="padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700;${c.tier==='Diamond'?'background:rgba(6,182,212,0.15);color:#22d3ee;border:1px solid rgba(6,182,212,0.2)':c.tier==='Platinum'?'background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.2)':c.tier==='Gold'?'background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.2)':'background:rgba(148,163,184,0.15);color:#94a3b8;border:1px solid rgba(148,163,184,0.2)'}">${c.tier}</span></td><td>${c.phone}</td><td style="font-weight:600;color:var(--primary-light)">${c.points} pts</td><td style="font-weight:600">${rp(c.ltv)}</td><td class="text-right pr-4"><button onclick="editCustomer('${c.id}')" class="text-xs font-bold" style="color:var(--primary-light);background:none;border:none;cursor:pointer">${t('edit_btn')}</button> <button onclick="deleteCustomer('${c.id}')" class="text-xs font-bold" style="color:var(--danger);background:none;border:none;cursor:pointer">${t('delete_btn')}</button></td></tr>`).join('')
  :`<tr><td colspan="7" class="text-center py-8 text-gray-500">${t('no_members_found')}</td></tr>`;

  cards.innerHTML=filtered.length?filtered.map(c=>{
    let tg='from-slate-700 to-slate-900', tc='text-slate-300', tl='SILVER', gl='rgba(148,163,184,0.2)';
    if(c.tier==='Diamond'){ tg='from-cyan-900 via-indigo-950 to-slate-950'; tc='text-cyan-400'; tl='DIAMOND VIP'; gl='rgba(6,182,212,0.3)'; }
    else if(c.tier==='Platinum'){ tg='from-indigo-900 via-slate-900 to-zinc-950'; tc='text-indigo-400'; tl='PLATINUM VIP'; gl='rgba(99,102,241,0.3)'; }
    else if(c.tier==='Gold'){ tg='from-amber-950 via-neutral-900 to-zinc-950'; tc='text-amber-400'; tl='GOLD PRIVILEGE'; gl='rgba(245,158,11,0.3)'; }
    return `<div class="vip-card" style="background:linear-gradient(135deg,${tg});border:1px solid ${gl};border-radius:var(--radius-xl)"><div class="shine"></div><div class="vip-card-top"><div><div class="vip-card-name">${c.name}</div><span class="vip-card-tier" style="color:${tc}">${tl}</span></div><span class="vip-card-brand">CASIR</span></div><div class="vip-card-bottom"><div><div class="vip-card-label">${t('th_ltv')}</div><div class="vip-card-value">${rp(c.ltv)}</div></div><div class="text-right"><div class="vip-card-label">${t('th_points')}</div><div class="vip-card-value" style="color:${tc}">${c.points}</div></div></div><div class="vip-card-id"><span>${c.cardNo}</span><span>${t('since_label')} ${new Date(c.joinDate).getFullYear()}</span></div><div class="vip-card-glow" style="background:${gl}"></div></div>`;
  }).join(''):`<div class="text-center py-8 text-gray-500" style="grid-column:1/-1">${t('no_vip_cards')}</div>`;
}

// =============================================
// FINANCE
// =============================================
function initFinance() {
  const form=document.getElementById('expenseForm');
  const addBtn=document.getElementById('addExpenseBtn');
  if(addBtn) addBtn.addEventListener('click',()=>document.getElementById('expenseModal').style.display='flex');
  if(form) form.addEventListener('submit',e=>{ e.preventDefault(); saveExpense(); });
}

function renderFinanceView() {
  const el=document.getElementById('financeTbody');
  const totalSalesEl=document.getElementById('finTotalRevenue');
  const totalCostEl=document.getElementById('finTotalCosts');
  const netProfitEl=document.getElementById('finNetProfit');
  if(!el) return;

  const exps=db.state.expenses;
  const txns=db.state.transactions;
  el.innerHTML=exps.map(e=>`<tr><td class="pl-4">${new Date(e.date).toLocaleDateString('id-ID')}</td><td>${e.desc}</td><td><span style="padding:2px 8px;border-radius:20px;font-size:10px;background:rgba(245,158,11,0.15);color:var(--warning);border:1px solid rgba(245,158,11,0.2)">${e.category}</span></td><td class="text-right pr-4 font-bold" style="color:var(--danger)">${rp(e.amount)}</td></tr>`).join('');

  const totalSales=txns.reduce((s,t)=>s+t.total,0);
  const totalExps=exps.reduce((s,e)=>s+e.amount,0);
  let cogs=0;
  txns.forEach(t=>t.items.forEach(i=>{ const p=db.state.products.find(x=>x.id===i.productId); if(p) cogs+=p.cost*i.qty; }));
  const gross=totalSales-cogs;
  const net=gross-totalExps;

  if(totalSalesEl) totalSalesEl.textContent=rp(totalSales);
  if(totalCostEl) totalCostEl.textContent=rp(totalExps+cogs);
  if(netProfitEl){ netProfitEl.textContent=rp(net); netProfitEl.style.color=net>=0?'var(--success)':'var(--danger)'; }
}

function saveExpense() {
  db.state.expenses.push({id:uid('e'),date:todayStr(),desc:document.getElementById('expDesc').value,category:document.getElementById('expCategory').value,amount:parseFloat(document.getElementById('expAmount').value)});
  db.save();
  closeModal('expenseModal');
  renderFinanceView();
  toast('Saved','Expense recorded.','success');
}

// =============================================
// PURCHASE
// =============================================
function initPurchase() {
  const supForm=document.getElementById('supplierForm');
  const poForm=document.getElementById('purchaseForm');
  const addSupBtn=document.getElementById('addSupplierBtn');
  const addPoBtn=document.getElementById('addPurchaseBtn');

  if(addSupBtn) addSupBtn.addEventListener('click',()=>document.getElementById('supplierModal').style.display='flex');
  if(addPoBtn) addPoBtn.addEventListener('click',()=>openPOModal());
  if(supForm) supForm.addEventListener('submit',e=>{ e.preventDefault(); saveSupplier(); });
  if(poForm) poForm.addEventListener('submit',e=>{ e.preventDefault(); savePO(); });
}

function saveSupplier() {
  db.state.suppliers.push({id:uid('s'),name:document.getElementById('supName').value,contact:document.getElementById('supContact').value,phone:document.getElementById('supPhone').value,address:document.getElementById('supAddress').value});
  db.save();
  closeModal('supplierModal');
  renderPurchaseView();
  toast('Saved','Supplier added.','success');
}

function openPOModal() {
  const modal=document.getElementById('purchaseModal');
  const supSel=document.getElementById('poSupplier');
  const prodSel=document.getElementById('poProduct');
  supSel.innerHTML=db.state.suppliers.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
  prodSel.innerHTML=db.state.products.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  document.getElementById('poQty').value='';
  document.getElementById('poPrice').value='';
  document.getElementById('poNotes').value='';
  modal.style.display='flex';
}

function savePO() {
  const supId=document.getElementById('poSupplier').value;
  const prodId=document.getElementById('poProduct').value;
  const qty=parseInt(document.getElementById('poQty').value);
  const price=parseFloat(document.getElementById('poPrice').value);
  const notes=document.getElementById('poNotes').value;
  const sup=db.state.suppliers.find(s=>s.id===supId);
  const prod=db.state.products.find(p=>p.id===prodId);
  if(!sup||!prod) return;

  db.state.purchases.push({id:uid('po'),supplier:sup.name,product:prod.name,qty,price,total:qty*price,date:new Date().toISOString(),status:'Pending',notes});
  db.save();
  closeModal('purchaseModal');
  renderPurchaseView();
  toast('PO Created',`${qty} x ${prod.name}`,'success');
}

function renderPurchaseView() {
  document.getElementById('supplierCount').textContent=db.state.suppliers.length;
  document.getElementById('poCount').textContent=db.state.purchases.length;

  const supEl=document.getElementById('suppliersTbody');
  if(supEl) supEl.innerHTML=db.state.suppliers.map(s=>`<tr><td class="pl-4 font-semibold" style="color:var(--text-primary)">${s.name}</td><td>${s.contact||'-'}</td><td class="text-right pr-4"><button onclick="deleteSupplier('${s.id}')" class="text-xs font-bold" style="color:var(--danger);background:none;border:none;cursor:pointer">Del</button></td></tr>`).join('')||'<tr><td colspan="3" class="text-center py-6 text-gray-500">No suppliers</td></tr>';

  const poEl=document.getElementById('purchaseTbody');
  if(poEl) poEl.innerHTML=db.state.purchases.length?db.state.purchases.map(po=>{
    const stCls=po.status==='Pending'?'rgba(245,158,11,0.15);color:var(--warning)':'rgba(16,185,129,0.15);color:var(--success)';
    return `<tr><td class="pl-4 font-mono font-semibold">${po.id}</td><td>${po.supplier}</td><td>${new Date(po.date).toLocaleDateString('id-ID')}</td><td><span style="padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700;background:${stCls}">${po.status}</span></td><td class="text-right pr-4 font-bold">${rp(po.total)}</td></tr>`;
  }).join(''):'<tr><td colspan="5" class="text-center py-6 text-gray-500">No purchase orders</td></tr>';
}

function deleteSupplier(id) {
  if(confirm('Delete supplier?')){ db.state.suppliers=db.state.suppliers.filter(s=>s.id!==id); db.save(); renderPurchaseView(); }
}

// =============================================
// REPORT
// =============================================
function renderReport() {
  const el=document.getElementById('reportTbody');
  const search=document.getElementById('reportSearch')?.value.toLowerCase()||'';
  if(!el) return;
  const txns=[...db.state.transactions].reverse().filter(t=>t.invoiceNo.toLowerCase().includes(search)||t.customerName.toLowerCase().includes(search)||t.paymentMethod.toLowerCase().includes(search));
  if(!txns.length){ el.innerHTML='<tr><td colspan="6" class="text-center py-8 text-gray-500">No transactions</td></tr>'; return; }
  el.innerHTML=txns.map(t=>{
    const d=new Date(t.date);
    return `<tr><td class="pl-4 font-semibold" style="color:var(--text-primary)">${t.invoiceNo}</td><td>${d.toLocaleDateString('id-ID')} ${d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</td><td>${t.customerName}</td><td><span style="padding:2px 8px;border-radius:20px;font-size:10px;background:rgba(99,102,241,0.15);color:var(--primary-light)">${t.paymentMethod}</span></td><td class="text-right font-bold" style="color:var(--primary-light)">${rp(t.total)}</td><td class="text-right pr-4"><button onclick="viewTxn('${t.id}')" class="text-xs font-bold" style="color:var(--primary-light);background:none;border:none;cursor:pointer">View</button></td></tr>`;
  }).join('');
}

function viewTxn(id) {
  const txn=db.state.transactions.find(t=>t.id===id);
  if(txn) showReceipt(txn);
}

// =============================================
// EXPORT CSV
// =============================================
function exportCSV() {
  const txns=db.state.transactions;
  if(!txns.length){ toast('No Data','No transactions to export.','warning'); return; }
  let csv='Invoice,Date,Customer,Payment,Items,Subtotal,Tax,Total\n';
  txns.forEach(t=>{
    const items=t.items.map(i=>`${i.name} x${i.qty}`).join('; ');
    csv+=`${t.invoiceNo},${new Date(t.date).toLocaleString('id-ID')},"${t.customerName}",${t.paymentMethod},"${items}",${t.subtotal},${t.tax},${t.total}\n`;
  });
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='casirpro_transactions.csv'; a.click();
  URL.revokeObjectURL(url);
  toast('Exported','CSV file downloaded.','success');
}

// =============================================
// AI CHAT
// =============================================
function initAI() {
  const fab=document.getElementById('aiFab');
  const drawer=document.getElementById('aiDrawer');
  const closeBtn=document.getElementById('aiCloseBtn');
  const sendBtn=document.getElementById('aiSendBtn');
  const input=document.getElementById('aiInput');

  if(fab&&drawer) fab.addEventListener('click',()=>drawer.classList.toggle('open'));
  if(closeBtn&&drawer) closeBtn.addEventListener('click',()=>drawer.classList.remove('open'));
  if(sendBtn&&input){
    sendBtn.addEventListener('click',sendAI);
    input.addEventListener('keypress',e=>{ if(e.key==='Enter') sendAI(); });
  }
}

function sendAI() {
  const input=document.getElementById('aiInput');
  const container=document.getElementById('aiMessages');
  if(!input||!container||!input.value.trim()) return;
  const q=input.value; input.value='';

  const userDiv=document.createElement('div'); userDiv.className='ai-msg ai-user';
  const userBubble=document.createElement('div'); userBubble.className='ai-bubble'; userBubble.textContent=q;
  userDiv.appendChild(userBubble);
  const userLabel=document.createElement('span'); userLabel.className='ai-label'; userLabel.textContent='You';
  userDiv.appendChild(userLabel);
  container.appendChild(userDiv);

  const botDiv=document.createElement('div'); botDiv.className='ai-msg ai-bot';
  botDiv.innerHTML=`<div class="ai-bubble"><span class="ai-typing">Analyzing...</span></div><span class="ai-label">CasirPRO AI</span>`;
  container.appendChild(botDiv);
  container.scrollTop=container.scrollHeight;

  setTimeout(()=>{
    const answer=generateAI(q);
    botDiv.querySelector('.ai-bubble').innerHTML=answer;
    container.scrollTop=container.scrollHeight;
  },800);
}

function generateAI(q) {
  const l=q.toLowerCase();
  const txns=db.state.transactions;
  const totalSales=txns.reduce((s,t)=>s+t.total,0);
  let cogs=0;
  txns.forEach(t=>t.items.forEach(i=>{ const p=db.state.products.find(x=>x.id===i.productId); if(p) cogs+=p.cost*i.qty; }));
  const gross=totalSales-cogs;
  const exps=db.state.expenses.reduce((s,e)=>s+e.amount,0);
  const net=gross-exps;

  if(l.includes('profit')||l.includes('laba')) return `<b>Profit Analysis</b><br>Revenue: ${rp(totalSales)}<br>COGS: ${rp(cogs)}<br>Expenses: ${rp(exps)}<br><b>Net Profit: ${rp(net)}</b><br>Margin: ${totalSales>0?Math.round((net/totalSales)*100):0}%`;
  if(l.includes('restock')||l.includes('stock')||l.includes('habis')) {
    const low=db.state.products.filter(p=>p.stock<=p.minStock);
    if(!low.length) return 'All stock levels are healthy. No restock needed.';
    return `<b>Restock Alert</b><br>${low.map(p=>`• ${p.name}: ${p.stock} left (min ${p.minStock})`).join('<br>')}`;
  }
  if(l.includes('popular')||l.includes('terlaris')||l.includes('best seller')){
    const counts={};
    txns.forEach(t=>t.items.forEach(i=>{ counts[i.productId]=(counts[i.productId]||0)+i.qty; }));
    let topId='', max=0;
    for(const id in counts){ if(counts[id]>max){ max=counts[id]; topId=id; } }
    const top=db.state.products.find(p=>p.id===topId);
    return top?`<b>Best Seller</b><br>${top.name}<br>Sold: ${max} units<br>Category: ${top.category}`:'No sales data yet.';
  }
  if(l.includes('forecast')||l.includes('prediksi')) return `<b>Sales Forecast</b><br>Projected growth: +15%<br>Estimated next month: ${rp(Math.round(totalSales*1.15))}<br>Key drivers: Gadgets & Luxury`;
  if(l.includes('customer')||l.includes('member')) return `<b>CRM Analytics</b><br>Total Members: ${db.state.customers.length}<br>Diamond: ${db.state.customers.filter(c=>c.tier==='Diamond').length}<br>Average LTV: ${rp(db.state.customers.length?Math.round(db.state.customers.reduce((s,c)=>s+c.ltv,0)/db.state.customers.length):0)}`;
  return `Hello! I'm CasirPRO AI. Ask me about:<br>• <i>Profit analysis</i><br>• <i>Stock alerts</i><br>• <i>Best sellers</i><br>• <i>Sales forecast</i>`;
}

// =============================================
// SETTINGS
// =============================================
function initSettings() {
  const form=document.getElementById('settingsForm');
  const resetBtn=document.getElementById('resetDbBtn');

  if(form){
    document.getElementById('setCompany').value=db.state.settings.companyName;
    document.getElementById('setBranch').value=db.state.settings.branchName;
    document.getElementById('setTax').value=db.state.settings.taxRate*100;
    document.getElementById('setCurrency').value=db.state.settings.currency;
    document.getElementById('setWhatsapp').checked=db.state.settings.whatsappNotif;
    const setStoreName = document.getElementById('setStoreName');
    if (setStoreName) setStoreName.value = db.state.settings.storeName || 'CasirStore';
    const setStoreWa = document.getElementById('setStoreWa');
    if (setStoreWa) setStoreWa.value = db.state.settings.storeWa || '6281234567890';
    const setRajaOngkirKey = document.getElementById('setRajaOngkirKey');
    if (setRajaOngkirKey) setRajaOngkirKey.value = db.state.settings.rajaongkirKey || '';
    const setOriginCity = document.getElementById('setOriginCity');
    if (setOriginCity) setOriginCity.value = db.state.settings.originCity || '151';
    const setBankName = document.getElementById('setBankName');
    if (setBankName) setBankName.value = db.state.settings.bankName || 'BCA';
    const setBankAccount = document.getElementById('setBankAccount');
    if (setBankAccount) setBankAccount.value = db.state.settings.bankAccount || '';
    const setBankHolder = document.getElementById('setBankHolder');
    if (setBankHolder) setBankHolder.value = db.state.settings.bankHolder || '';
    form.addEventListener('submit',e=>{ e.preventDefault(); saveSettings(); });
  }
  if(resetBtn) resetBtn.addEventListener('click',()=>{
    if(confirm('RESET DATABASE? This will erase ALL data!')){ db.seed(); renderDashboard(); renderPOS(); renderProducts(); renderCustomers(); renderFinanceView(); renderPurchaseView(); renderReport(); toast('Reset','Database restored to defaults.','danger'); }
  });

  // Server connection UI
  const serverUrl = document.getElementById('setServerUrl');
  const httpUrl = document.getElementById('setHttpUrl');
  const serverEnabled = document.getElementById('setServerEnabled');
  if (serverUrl) {
    serverUrl.value = localStorage.getItem('pos_server_url') || 'ws://localhost:3000';
    serverUrl.addEventListener('change', () => {
      localStorage.setItem('pos_server_url', serverUrl.value);
      if (confirm('Ubah URL server? Koneksi akan terputus dan tersambung ulang.')) connectWebSocket();
    });
  }
  if (httpUrl) {
    httpUrl.value = localStorage.getItem('pos_server_http_url') || 'http://localhost:3000';
    httpUrl.addEventListener('change', () => localStorage.setItem('pos_server_http_url', httpUrl.value));
  }
  if (serverEnabled) {
    serverEnabled.checked = localStorage.getItem('pos_server_enabled') !== 'false';
    serverEnabled.addEventListener('change', () => {
      localStorage.setItem('pos_server_enabled', serverEnabled.checked);
      if (serverEnabled.checked) { connectWebSocket(); }
      else { if (wsClient) { wsClient.close(); wsClient = null; }
        const el = document.getElementById('serverStatus');
        if (el) { el.textContent = '⚪ Server Dinonaktifkan'; el.className = 'text-gray-400'; }
      }
    });
  }
  const testBtn = document.getElementById('testServerBtn');
  if (testBtn) {
    testBtn.addEventListener('click', () => {
      const url = (httpUrl || {}).value || 'http://localhost:3000';
      testBtn.textContent = '⏳ Mengecek...';
      testBtn.disabled = true;
      fetch(url + '/api/settings').then(r => r.json()).then(() => {
        const el = document.getElementById('serverStatus');
        if (el) { el.textContent = '🟢 Server Terhubung'; el.className = 'text-emerald-300'; }
        toast('Sukses', 'Server terhubung!', 'success');
      }).catch(() => {
        toast('Gagal', 'Tidak dapat terhubung ke server', 'danger');
      }).finally(() => {
        testBtn.textContent = 'Test Koneksi';
        testBtn.disabled = false;
      });
    });
  }
  const syncBtn = document.getElementById('syncServerBtn');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      syncBtn.textContent = '⏳ Sync...';
      syncBtn.disabled = true;
      const data = {
        products: JSON.parse(localStorage.getItem('pos_products') || '[]'),
        transactions: JSON.parse(localStorage.getItem('pos_transactions') || '[]'),
        settings: db?.state?.settings || {},
        staffList: db?.state?.staffList || []
      };
      const url = (httpUrl || {}).value || 'http://localhost:3000';
      fetch(url + '/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()).then(() => {
        toast('Sukses', 'Data disinkronkan!', 'success');
      }).catch(() => {
        toast('Gagal', 'Sync gagal. Periksa koneksi server.', 'danger');
      }).finally(() => {
        syncBtn.textContent = 'Sync Data';
        syncBtn.disabled = false;
      });
    });
  }
}

function saveSettings() {
  Object.assign(db.state.settings,{
    companyName:document.getElementById('setCompany').value,
    branchName:document.getElementById('setBranch').value,
    taxRate:parseFloat(document.getElementById('setTax').value)/100,
    currency:document.getElementById('setCurrency').value,
    whatsappNotif:document.getElementById('setWhatsapp').checked,
    storeName: (document.getElementById('setStoreName') || {}).value || db.state.settings.storeName || 'CasirStore',
    storeWa: (document.getElementById('setStoreWa') || {}).value || db.state.settings.storeWa || '6281234567890',
    rajaongkirKey: (document.getElementById('setRajaOngkirKey') || {}).value || '',
    originCity: (document.getElementById('setOriginCity') || {}).value || '151',
    bankName: (document.getElementById('setBankName') || {}).value || 'BCA',
    bankAccount: (document.getElementById('setBankAccount') || {}).value || '',
    bankHolder: (document.getElementById('setBankHolder') || {}).value || ''
  });
  db.save();
  const el=document.getElementById('headerBranch');
  if(el) el.textContent=db.state.settings.branchName;
  syncServerSettings();
  toast('Saved','Settings updated.','success');
}

// =============================================
// KEYBOARD SHORTCUTS
// =============================================
function initKeyboard() {
  document.addEventListener('keydown',e=>{
    if(e.key==='F2'){ e.preventDefault(); const s=document.getElementById('posSearch'); if(s) s.focus(); }
    if(e.key==='F4'){ e.preventDefault(); const btn=document.getElementById('checkoutBtn'); if(btn) btn.click(); }
    if(e.key==='F5'){ e.preventDefault(); refreshDashboard(); }
    if(e.key==='F6'){ e.preventDefault(); const overlay=document.getElementById('receiptOverlay'); if(overlay&&overlay.style.display==='flex') printReceipt(); }
    if(e.key==='F7'){ e.preventDefault(); switchTab('kiosk'); }
    if(e.key==='F11'){ e.preventDefault(); const btn=document.getElementById('posFullscreen'); if(btn) btn.click(); }
    if(e.key==='Escape'){
      document.querySelectorAll('.modal-overlay').forEach(m=>m.style.display='none');
      const aiDrawer=document.getElementById('aiDrawer'); if(aiDrawer) aiDrawer.classList.remove('open');
      const notifPane=document.getElementById('notifPane'); if(notifPane) notifPane.style.display='none';
    }
  });
}

// =============================================
// HELPERS
// =============================================
function closeModal(id) {
  const el=document.getElementById(id);
  if(el) el.style.display='none';
}

// =============================================
// SOUND EFFECTS (Web Audio API)
// =============================================
let audioCtx = null;
function initAudio() {
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
}

function playTone(freq, duration, type = 'sine', vol = 0.15) {
  if (!audioCtx) { initAudio(); if (!audioCtx) return; }
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch(e) {}
}

function sfxAdd() { playTone(880, 0.08, 'sine', 0.1); }
function sfxRemove() { playTone(440, 0.06, 'sawtooth', 0.08); }
function sfxSuccess() { playTone(660, 0.1); setTimeout(() => playTone(880, 0.15), 100); setTimeout(() => playTone(1100, 0.2), 200); }
function sfxError() { playTone(300, 0.2, 'sawtooth', 0.12); setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.1), 150); }
function sfxClick() { playTone(1200, 0.03, 'sine', 0.05); }
function sfxScan() { playTone(1400, 0.05); setTimeout(() => playTone(1800, 0.08), 60); }

// Patch existing toast to play sounds
const _origToast = toast;
toast = function(t, m, type) {
  _origToast(t, m, type);
  if (type === 'success') sfxSuccess();
  else if (type === 'danger') sfxError();
  else if (type === 'warning') sfxClick();
};

// Patch addToCart
const _origAddToCart = addToCart;
addToCart = function(id) {
  _origAddToCart(id);
  const p = db.state.products.find(x => x.id === id);
  if (p && p.stock > 0) sfxAdd();
  else sfxError();
};

// =============================================
// QUICK DISCOUNT IN CART
// =============================================
function applyQuickDiscount(type, val) {
  if (!cart.length) { toast('Empty Cart', 'No items to discount.', 'warning'); return; }
  if (type === 'percent') {
    cart.forEach(item => {
      const p = db.state.products.find(x => x.id === item.productId);
      if (p) {
        const basePrice = selectedCustomer ? p.memberPrice : p.price;
        item.price = Math.round(basePrice * (1 - val / 100));
      }
    });
    toast('Discount', `${val}% off applied to all items.`, 'success');
  } else if (type === 'nominal') {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (val > total) { toast('Error', 'Discount exceeds total.', 'danger'); return; }
    const ratio = (total - val) / total;
    cart.forEach(item => { item.price = Math.round(item.price * ratio); });
    toast('Discount', `Rp ${val.toLocaleString()} off applied.`, 'success');
  } else if (type === 'clear') {
    cart.forEach(item => {
      const p = db.state.products.find(x => x.id === item.productId);
      if (p) item.price = selectedCustomer ? p.memberPrice : p.price;
    });
    toast('Discount', 'All discounts cleared.', 'info');
  }
  renderCart();
}

function setCustomPrice(productId, price) {
  const item = cart.find(i => i.productId === productId);
  if (!item) return;
  item.price = price;
  renderCart();
  toast('Custom Price', 'Price updated.', 'info');
}

// Add discount bar to cart footer
function renderQuickDiscountBar() {
  const footer = document.querySelector('.pos-cart-footer');
  if (!footer || footer.querySelector('.discount-bar')) return;
  const bar = document.createElement('div');
  bar.className = 'discount-bar';
  bar.style.cssText = 'display:flex;gap:4px;margin:8px 0;flex-wrap:wrap';
  bar.innerHTML = `
    <button class="glass-btn glass-btn-sm" onclick="applyQuickDiscount('percent',5)" style="font-size:10px;padding:4px 8px">-5%</button>
    <button class="glass-btn glass-btn-sm" onclick="applyQuickDiscount('percent',10)" style="font-size:10px;padding:4px 8px">-10%</button>
    <button class="glass-btn glass-btn-sm" onclick="applyQuickDiscount('percent',15)" style="font-size:10px;padding:4px 8px">-15%</button>
    <button class="glass-btn glass-btn-sm" onclick="applyQuickDiscount('percent',20)" style="font-size:10px;padding:4px 8px">-20%</button>
    <button class="glass-btn glass-btn-sm" onclick="applyQuickDiscount('percent',50)" style="font-size:10px;padding:4px 8px">-50%</button>
    <button class="glass-btn glass-btn-sm" onclick="applyQuickDiscount('clear')" style="font-size:10px;padding:4px 8px;background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.2);color:var(--danger)">✕ Clear</button>
  `;
  const totals = footer.querySelector('.cart-totals');
  if (totals) footer.insertBefore(bar, totals);
}

// Patch renderCart to add discount bar
const _origRenderCart = renderCart;
renderCart = function() {
  _origRenderCart();
  setTimeout(renderQuickDiscountBar, 10);
};

// =============================================
// TRANSACTION NOTES
// =============================================
let txnNote = '';

function setTransactionNote(note) {
  txnNote = note;
}

function addNoteToCheckout() {
  const noteInput = document.createElement('div');
  noteInput.id = 'checkoutNoteSection';
  noteInput.style.cssText = 'margin-top:12px';
  noteInput.innerHTML = `
    <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-secondary);display:block;margin-bottom:4px">Transaction Note</label>
    <input type="text" id="txnNoteInput" class="glass-input" placeholder="Add note for this transaction..." value="${txnNote}">
  `;
  const checkoutRight = document.querySelector('.checkout-right .pay-actions');
  const pane = document.querySelector('.checkout-right');
  if (pane && !document.getElementById('checkoutNoteSection')) {
    pane.insertBefore(noteInput, pane.querySelector('.pay-actions'));
  }
}

// Patch openCheckout to include notes
const _origOpenCheckout = openCheckout;
openCheckout = function() {
  _origOpenCheckout();
  setTimeout(() => {
    addNoteToCheckout();
    const inp = document.getElementById('txnNoteInput');
    if (inp) inp.addEventListener('input', e => { txnNote = e.target.value; });
  }, 50);
};

// Patch submitPayment to save note
const _origSubmitPayment = submitPayment;
submitPayment = function() {
  const noteEl = document.getElementById('txnNoteInput');
  if (noteEl) txnNote = noteEl.value;
  _origSubmitPayment();
  // Add note to transaction after it's created
  if (txnNote && db.state.transactions.length) {
    const last = db.state.transactions[db.state.transactions.length - 1];
    last.note = txnNote;
    db.save();
  }
  txnNote = '';
};

// =============================================
// MARKETING MODULE
// =============================================
function initMarketing() {
  // Add marketing tab to sidebar if not exists
  const nav = document.getElementById('sidebarNav');
  if (nav && !document.querySelector('[data-tab="marketing"]')) {
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'sidebar-nav-link';
    link.setAttribute('data-tab', 'marketing');
    link.innerHTML = `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg><span>Marketing</span>`;
    nav.appendChild(link);
    link.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.sidebar-nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      syncMobileHeaderTitle();
      document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active-section'));
      let sec = document.getElementById('section-marketing');
      if (!sec) {
        sec = createMarketingSection();
      }
      sec.classList.add('active-section');
      renderMarketing();
    });
  }

  // Seed promo data
  if (!db.state.promos) {
    db.state.promos = [
      { id: 'pr1', name: 'Happy Hour Coffee', type: 'discount', value: 15, category: 'Lifestyle', startTime: '14:00', endTime: '17:00', active: true, days: ['Mon','Tue','Wed','Thu'] },
      { id: 'pr2', name: 'Weekend Gadget Sale', type: 'discount', value: 10, category: 'Gadgets', active: true, days: ['Sat','Sun'] },
      { id: 'pr3', name: 'Luxury Bundle Deal', type: 'bundle', value: 20, category: 'Luxury Accessories', active: false, days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
    ];
    db.save();
  }
}

function createMarketingSection() {
  const viewport = document.querySelector('.app-viewport');
  const sec = document.createElement('section');
  sec.className = 'app-section';
  sec.id = 'section-marketing';
  sec.innerHTML = `
    <div class="section-header">
      <div>
        <h1 class="section-title">Marketing & Promotions</h1>
        <p class="section-subtitle">Manage flash sales, discount campaigns, and promotional events</p>
      </div>
      <div class="section-actions">
        <button class="glass-btn glass-btn-sm glass-btn-primary" onclick="openPromoModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Promo
        </button>
      </div>
    </div>
    <div class="stats-grid" id="marketingStats">
      <div class="stat-card glass-panel">
        <div class="stat-glow" style="background:var(--primary)"></div>
        <span class="stat-label">Active Promos</span>
        <p class="stat-value" id="mktActiveCount">0</p>
      </div>
      <div class="stat-card glass-panel">
        <div class="stat-glow" style="background:var(--success)"></div>
        <span class="stat-label">Total Discount Given</span>
        <p class="stat-value" id="mktTotalDiscount">Rp 0</p>
      </div>
      <div class="stat-card glass-panel">
        <div class="stat-glow" style="background:var(--warning)"></div>
        <span class="stat-label">Promo Impact</span>
        <p class="stat-value" id="mktImpact">+12%</p>
      </div>
    </div>
    <div class="dashboard-grid thirds" style="grid-template-columns:1.5fr 1fr">
      <div class="glass-panel">
        <div class="panel-header"><h3>Active Promotions</h3>        <span class="panel-badge" id="marketingCount">0</span></div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th class="pl-4">Name</th><th>Type</th><th>Value</th><th>Category</th><th>Status</th><th class="text-right pr-4">Actions</th></tr></thead>
            <tbody id="marketingTbody"></tbody>
          </table>
        </div>
      </div>
      <div class="glass-panel">
        <div class="panel-header"><h3>Flash Sale Timer</h3><span class="panel-badge" style="color:var(--danger)">LIVE</span></div>
        <div id="flashSaleDisplay" style="text-align:center;padding:20px">
          <div style="font-size:48px;font-weight:900;font-family:var(--font-display);margin-bottom:8px" id="flashCountdown">--:--:--</div>
          <p style="font-size:12px;color:var(--text-secondary)" id="flashStatus">No active flash sale</p>
        </div>
      </div>
    </div>
  `;
  viewport.appendChild(sec);
  return sec;
}

function renderMarketing() {
  const promos = db.state.promos || [];
  document.getElementById('mktActiveCount').textContent = promos.filter(p => p.active).length;
  document.getElementById('marketingCount').textContent = promos.length;

  const tbody = document.getElementById('marketingTbody');
  if (tbody) {
    if (!promos.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">No promotions yet</td></tr>';
    } else {
      tbody.innerHTML = promos.map(p => `
        <tr>
          <td class="pl-4 font-semibold" style="color:var(--text-primary)">${p.name}</td>
          <td><span style="padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;background:${p.type==='discount'?'rgba(99,102,241,0.15);color:var(--primary-light)':p.type==='bundle'?'rgba(16,185,129,0.15);color:var(--success)':'rgba(245,158,11,0.15);color:var(--warning)'}">${p.type}</span></td>
          <td style="font-weight:700;color:var(--primary-light)">${p.value}${p.type==='discount'?'%':'%'}</td>
          <td>${p.category}</td>
          <td><span style="padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700;background:${p.active?'rgba(16,185,129,0.15);color:var(--success)':'rgba(107,114,128,0.15);color:var(--text-muted)'}">${p.active?'Active':'Inactive'}</span></td>
          <td class="text-right pr-4">
            <button onclick="togglePromo('${p.id}')" class="text-xs font-bold" style="color:var(--primary-light);background:none;border:none;cursor:pointer">${p.active?'Pause':'Activate'}</button>
            <button onclick="deletePromo('${p.id}')" class="text-xs font-bold" style="color:var(--danger);background:none;border:none;cursor:pointer">Del</button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Flash sale countdown
  updateFlashSale();
}

function updateFlashSale() {
  const el = document.getElementById('flashCountdown');
  const statusEl = document.getElementById('flashStatus');
  if (!el || !statusEl) return;

  const activePromos = (db.state.promos || []).filter(p => p.active);
  if (!activePromos.length) {
    el.textContent = '--:--:--';
    statusEl.textContent = 'No active flash sale';
    return;
  }

  const now = new Date();
  const h = String(23 - now.getHours()).padStart(2, '0');
  const m = String(59 - now.getMinutes()).padStart(2, '0');
  const s = String(59 - now.getSeconds()).padStart(2, '0');
  el.textContent = `${h}:${m}:${s}`;
  statusEl.textContent = `${activePromos.length} promo(s) active today`;
  setTimeout(updateFlashSale, 1000);
}

function openPromoModal() {
  const overlay = document.querySelector('.modal-overlay#promoModal');
  if (overlay) { overlay.style.display = 'flex'; return; }

  const div = document.createElement('div');
  div.className = 'modal-overlay';
  div.id = 'promoModal';
  div.innerHTML = `
    <div class="glass-panel modal-content">
      <div class="modal-header">
        <h3>New Promotion</h3>
        <button class="modal-close" onclick="closeModal('promoModal')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <form id="promoForm" class="modal-body form-grid" onsubmit="savePromo(event)">
        <div class="form-group full-width"><label>Promo Name</label><input type="text" id="promoName" class="glass-input" required></div>
        <div class="form-group"><label>Type</label>
          <select id="promoType" class="glass-input">
            <option value="discount">Discount (%)</option>
            <option value="bundle">Bundle Deal</option>
            <option value="flash">Flash Sale</option>
          </select>
        </div>
        <div class="form-group"><label>Value (%)</label><input type="number" id="promoValue" class="glass-input" min="1" max="100" required></div>
        <div class="form-group"><label>Category</label>
          <select id="promoCategory" class="glass-input">
            <option value="All">All Categories</option>
            ${db.state.categories.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-check full-width" style="grid-column:1/-1">
          <input type="checkbox" id="promoActive" checked>
          <label for="promoActive">Active immediately</label>
        </div>
        <div class="form-actions full-width">
          <button type="button" class="glass-btn" onclick="closeModal('promoModal')">Cancel</button>
          <button type="submit" class="glass-btn glass-btn-primary">Create Promo</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(div);
  div.style.display = 'flex';
}

function savePromo(e) {
  e.preventDefault();
  if (!db.state.promos) db.state.promos = [];
  db.state.promos.push({
    id: uid('pr'),
    name: document.getElementById('promoName').value,
    type: document.getElementById('promoType').value,
    value: parseInt(document.getElementById('promoValue').value),
    category: document.getElementById('promoCategory').value,
    active: document.getElementById('promoActive').checked,
    days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  });
  db.save();
  closeModal('promoModal');
  renderMarketing();
  toast('Promo Created', 'New promotion is live.', 'success');
}

function togglePromo(id) {
  const p = (db.state.promos || []).find(x => x.id === id);
  if (p) { p.active = !p.active; db.save(); renderMarketing(); toast(p.active?'Activated':'Paused', `${p.name} ${p.active?'started':'paused'}.`, 'info'); }
}

function deletePromo(id) {
  if (confirm('Delete this promotion?')) {
    db.state.promos = (db.state.promos || []).filter(p => p.id !== id);
    db.save();
    renderMarketing();
    toast('Deleted', 'Promotion removed.', 'danger');
  }
}

// =============================================
// HOURLY SALES CHART
// =============================================
let hourlyChartInst = null;

function renderHourlyChart() {
  const canvas = document.getElementById('hourlyChart');
  if (!canvas) return;

  const hourly = Array(24).fill(0);
  const today = todayStr();
  db.state.transactions.filter(t => t.date.split('T')[0] === today).forEach(t => {
    const hour = new Date(t.date).getHours();
    hourly[hour] += t.total;
  });

  if (hourlyChartInst) hourlyChartInst.destroy();
  hourlyChartInst = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: Array.from({length: 24}, (_, i) => `${String(i).padStart(2,'0')}:00`),
      datasets: [{
        label: 'Sales by Hour',
        data: hourly,
        backgroundColor: hourly.map(v => v > 0 ? 'rgba(99,102,241,0.6)' : 'rgba(99,102,241,0.05)'),
        borderColor: 'rgba(99,102,241,0.8)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#9CA3AF', font: { size: 9 } } },
        y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#9CA3AF', font: { size: 9 }, callback: v => v >= 1000000 ? (v/1000000)+'M' : v >= 1000 ? (v/1000)+'K' : v } }
      }
    }
  });
}

// =============================================
// CASH FLOW CHART
// =============================================
let cashFlowChartInst = null;

function renderCashFlowChart() {
  const canvas = document.getElementById('cashFlowChart');
  if (!canvas) return;

  const days = [];
  const inflow = [];
  const outflow = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    days.push(d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));

    const dayTxns = db.state.transactions.filter(t => t.date.split('T')[0] === ds);
    inflow.push(dayTxns.reduce((s, t) => s + t.total, 0));

    const dayExps = db.state.expenses.filter(e => e.date === ds);
    outflow.push(dayExps.reduce((s, e) => s + e.amount, 0));
  }

  if (cashFlowChartInst) cashFlowChartInst.destroy();
  cashFlowChartInst = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        { label: 'Cash In', data: inflow, borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 2 },
        { label: 'Cash Out', data: outflow, borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.05)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#9CA3AF', font: { size: 10 } } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#9CA3AF', font: { size: 9 }, maxTicksLimit: 10 } },
        y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#9CA3AF', font: { size: 9 }, callback: v => v >= 1000000 ? (v/1000000)+'M' : v >= 1000 ? (v/1000)+'K' : v } }
      }
    }
  });
}

// =============================================
// BACKUP & RESTORE
// =============================================
function backupData() {
  const data = JSON.stringify(db.state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `casirpro_backup_${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Backup', 'Database exported successfully.', 'success');
}

function restoreData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.products || !data.customers) { toast('Error', 'Invalid backup file.', 'danger'); return; }
        db.state = data;
        db.save();
        toast('Restored', 'Database restored from backup.', 'success');
        setTimeout(() => location.reload(), 1000);
      } catch(err) { toast('Error', 'Could not parse backup file.', 'danger'); }
    };
    reader.readAsText(file);
  };
  input.click();
}

function importProducts() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const prods = JSON.parse(ev.target.result);
        if (!Array.isArray(prods)) { toast('Error', 'Must be an array of products.', 'danger'); return; }
        prods.forEach(p => {
          if (p.name && p.price) {
            db.state.products.push({
              id: uid('p'),
              name: p.name,
              sku: p.sku || `IMP-${Math.random().toString(36).substr(2,6).toUpperCase()}`,
              barcode: p.barcode || String(100000000000 + Math.floor(Math.random() * 900000000000)),
              category: p.category || 'General',
              brand: p.brand || '',
              cost: p.cost || Math.round(p.price * 0.5),
              price: p.price,
              memberPrice: p.memberPrice || Math.round(p.price * 0.9),
              stock: p.stock || 0,
              maxStock: p.maxStock || (p.stock || 0) * 2,
              minStock: p.minStock || 5,
              imgBg: 'linear-gradient(135deg,#1e293b,#0f172a)',
              imgEmoji: '📦',
              desc: p.desc || ''
            });
          }
        });
        db.save();
        toast('Imported', `${prods.filter(p => p.name && p.price).length} products added.`, 'success');
        renderProducts();
        renderPOS();
      } catch(err) { toast('Error', 'Invalid JSON file.', 'danger'); }
    };
    reader.readAsText(file);
  };
  input.click();
}

// =============================================
// ENHANCE SETTINGS WITH BACKUP/RESTORE
// =============================================
function enhanceSettings() {
  const settingsForm = document.getElementById('settingsForm');
  if (!settingsForm) return;

  const backupSection = document.createElement('div');
  backupSection.style.cssText = 'margin-top:16px;padding-top:16px;border-top:1px solid var(--border-subtle);display:flex;flex-direction:column;gap:8px';
  backupSection.innerHTML = `
    <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-secondary)">Data Management</label>
    <div style="display:flex;gap:8px">
      <button type="button" class="glass-btn glass-btn-sm" onclick="backupData()" style="flex:1;justify-content:center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Backup Data
      </button>
      <button type="button" class="glass-btn glass-btn-sm" onclick="restoreData()" style="flex:1;justify-content:center;background:rgba(245,158,11,0.15);border-color:rgba(245,158,11,0.2);color:var(--warning)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        Restore
      </button>
    </div>
    <button type="button" class="glass-btn glass-btn-sm" onclick="importProducts()" style="justify-content:center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      Import Products (JSON)
    </button>
  `;
  settingsForm.appendChild(backupSection);
}

// =============================================
// ENHANCE DASHBOARD WITH MORE CHARTS
// =============================================
function enhanceDashboard() {
  const dashboard = document.getElementById('section-dashboard');
  if (!dashboard || document.getElementById('enhancedCharts')) return;

  const chartContainer = document.createElement('div');
  chartContainer.id = 'enhancedCharts';
  chartContainer.className = 'dashboard-grid';
  chartContainer.style.cssText = 'margin-top:0';

  // Check if we already have the thirds grid after it
  const thirds = dashboard.querySelector('.dashboard-grid.thirds');
  const ref = dashboard.querySelector('.dashboard-grid:not(.thirds):last-of-type');

  chartContainer.innerHTML = `
    <div class="glass-panel chart-panel">
      <div class="panel-header">
        <h3>Sales by Hour (Today)</h3>
        <span class="panel-badge">Peak Hours</span>
      </div>
      <div class="chart-container"><canvas id="hourlyChart"></canvas></div>
    </div>
    <div class="glass-panel chart-panel">
      <div class="panel-header">
        <h3>Cash Flow (30 Days)</h3>
        <span class="panel-badge">In vs Out</span>
      </div>
      <div class="chart-container"><canvas id="cashFlowChart"></canvas></div>
    </div>
  `;

  if (ref && ref.parentNode) {
    ref.parentNode.insertBefore(chartContainer, ref.nextSibling);
  }

  // Render the new charts
  setTimeout(() => {
    renderHourlyChart();
    renderCashFlowChart();
  }, 100);
}



// =============================================
// CONFETTI CELEBRATION 🎉
// =============================================
function fireConfetti() {
  if (db.state.settings && db.state.settings.soundEnabled === false) return;
  const colors = ['#6366F1','#A78BFA','#10B981','#F59E0B','#EF4444','#EC4899','#06B6D4','#F97316'];
  const container = document.body;
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 6 + Math.random() * 8;
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const dur = 2 + Math.random() * 2;
    const rotate = Math.random() * 720;
    const drift = (Math.random() - 0.5) * 200;

    el.style.cssText = `
      position: fixed; top: -20px; left: ${left}%; z-index: 99999;
      width: ${size}px; height: ${size * 0.6}px;
      background: ${color}; border-radius: 2px;
      opacity: 0; pointer-events: none;
      animation: confettiFall ${dur}s ease-in ${delay}s forwards;
      --drift: ${drift}px; --rotate: ${rotate}deg;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), (dur + delay) * 1000 + 100);
  }
  // Inject keyframes if not already present
  if (!document.getElementById('confettiStyle')) {
    const style = document.createElement('style');
    style.id = 'confettiStyle';
    style.textContent = `
      @keyframes confettiFall {
        0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) translateX(var(--drift)) rotate(var(--rotate)); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  setTimeout(() => {
    const s = document.getElementById('confettiStyle');
    if (s) s.remove();
  }, 5500);
}

// Patch submitPayment to fire confetti after success
const _origSubmitPaymentFinal = submitPayment;
submitPayment = function() {
  _origSubmitPaymentFinal();
  setTimeout(fireConfetti, 300);
};

// =============================================
// BARCODE SCANNER SIMULATION (Keyboard Wedge)
// =============================================
let barcodeBuffer = '';
let barcodeTimer = null;

function initBarcodeScanner() {
  document.addEventListener('keydown', e => {
    // Ignore if typing in a regular text input (except POS search)
    const tag = e.target.tagName;
    const isInput = (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT');
    // Barcode scanners type very fast (< 50ms between chars)
    // We only capture in POS mode, lock screen, or when no input is focused
    
    if (e.key === 'Enter' && barcodeBuffer.length >= 6) {
      // Barcode complete!
      const barcode = barcodeBuffer;
      barcodeBuffer = '';
      barcodeTimer = null;
      
      // 1. Scan Login (Lock / Lock Screen command)
      if (barcode === 'CMD-LOCK' || barcode === 'CMD-LOGIN') {
        sfxScan();
        lockTerminal();
        toast('Command Scanned', 'Terminal Terkunci', 'info');
        return;
      }
      
      // 2. Select Employee (Scan masuk login/pilih kasir)
      if (barcode.startsWith('CMD-USER-')) {
        sfxScan();
        const rawName = barcode.substring(9).replace(/_/g, ' ');
        if (db.state && db.state.staffList) {
          let staff = db.state.staffList.find(s => s.name.toLowerCase() === rawName.toLowerCase());
          if (!staff) {
            staff = db.state.staffList.find(s => s.name.toLowerCase().includes(rawName.toLowerCase()));
          }
          if (staff) {
            // Lock screen if not open
            const lockScreen = document.getElementById('lockScreen');
            if (!lockScreen || lockScreen.style.display === 'none') {
              lockTerminal();
            }
            const select = document.getElementById('lockCashierSelect');
            if (select) {
              select.value = staff.name;
            }
            enteredPin = '';
            updatePinIndicator();
            toast('Kasir Terpilih', `Pegawai: ${staff.name}`, 'info');
          } else {
            toast('Pegawai Tidak Ditemukan', `Nama: ${rawName}`, 'warning');
          }
        }
        return;
      }
      
      // 3. Scan PIN (Scan masuk Pin)
      if (barcode.startsWith('CMD-PIN-')) {
        sfxScan();
        const pin = barcode.substring(8);
        const lockScreen = document.getElementById('lockScreen');
        if (!lockScreen || lockScreen.style.display === 'none') {
          lockTerminal();
        }
        enteredPin = pin;
        updatePinIndicator();
        setTimeout(submitPin, 200);
        return;
      }
      
      // 4. Scan View Messages/Orders (Scan liat pesan)
      if (barcode === 'CMD-VIEW-ORDERS' || barcode === 'CMD-PESANAN') {
        sfxScan();
        const posLink = document.querySelector('[data-tab="pos"]');
        if (posLink) posLink.click();
        
        // Highlight pending orders panel
        setTimeout(() => {
          const panel = document.querySelector('.pending-orders-panel');
          if (panel) {
            panel.scrollIntoView({ behavior: 'smooth' });
            panel.style.outline = '3px solid var(--primary)';
            panel.style.boxShadow = '0 0 20px var(--primary)';
            setTimeout(() => {
              panel.style.outline = 'none';
              panel.style.boxShadow = 'none';
            }, 2000);
          } else {
            toast('Info Pesanan', 'Tidak ada pesanan masuk yang pending', 'info');
          }
        }, 300);
        return;
      }
      
      // 5. Default: Search for product with this barcode
      const product = db.state.products.find(p => p.barcode === barcode);
      if (product) {
        sfxScan();
        // Switch to POS tab
        const posLink = document.querySelector('[data-tab="pos"]');
        if (posLink) posLink.click();
        // Focus search and show result
        const search = document.getElementById('posSearch');
        if (search) {
          search.value = product.name;
          // Trigger search
          const ev = new Event('input', { bubbles: true });
          search.dispatchEvent(ev);
        }
        // Add to cart after a brief delay
        setTimeout(() => {
          addToCart(product.id);
          if (search) search.value = '';
          renderPOS();
        }, 200);
      } else {
        toast('Barcode Not Found', `No product with barcode ${barcode}`, 'warning');
      }
      return;
    }
    
    // Capture barcode input globally if POS is active, lock screen is active, or if not inside inputs
    const posActive = document.getElementById('section-pos')?.classList.contains('active-section');
    const lockActive = document.getElementById('lockScreen')?.style.display === 'flex';
    const shouldCapture = (posActive && (!isInput || e.target.id === 'posSearch')) || lockActive || !isInput;
    
    if (shouldCapture) {
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        barcodeBuffer += e.key;
        clearTimeout(barcodeTimer);
        barcodeTimer = setTimeout(() => {
          // If no Enter within 200ms, it's probably manual typing, clear buffer
          if (barcodeBuffer.length < 6) {
            barcodeBuffer = '';
          }
        }, 200);
      }
    }
  });
}

// =============================================
// KITCHEN ORDER PRINT
// =============================================
function printKitchenOrder() {
  const lastTxn = db.state.transactions[db.state.transactions.length - 1];
  if (!lastTxn) { toast('No Transaction', 'Complete a sale first.', 'warning'); return; }

  const kitchenContent = `
    <div style="text-align:center;padding-bottom:8px;border-bottom:1px dashed #ccc;margin-bottom:8px">
      <h3 style="font-size:14px;font-weight:800">${db.state.settings.branchName}</h3>
      <p style="font-size:9px;color:#666">KITCHEN ORDER</p>
      <p style="font-size:9px;color:#666">${lastTxn.invoiceNo} | ${new Date(lastTxn.date).toLocaleString('id-ID')}</p>
    </div>
    ${lastTxn.items.map(i => `
      <div style="display:flex;justify-content:space-between;font-size:11px;padding:4px 0;border-bottom:1px dotted #eee">
        <span><b>${i.qty}x</b> ${i.name}</span>
      </div>
    `).join('')}
    <div style="text-align:center;padding-top:8px;border-top:1px dashed #ccc;margin-top:8px">
      <p style="font-size:10px;color:#666">Note: ${lastTxn.note || 'No special instructions'}</p>
      <p style="font-size:11px;font-weight:700;margin-top:4px">PLEASE PREPARE</p>
    </div>
  `;

  const win = window.open('', '_blank', 'width=300,height=600');
  if (win) {
    win.document.write(`<html><head><title>Kitchen Order - ${lastTxn.invoiceNo}</title><style>
      body { font-family: 'Courier New', monospace; width: 80mm; margin: 0 auto; padding: 10px; color: #000; font-size: 11px; }
      @media print { body { margin: 0; padding: 5px; } }
    </style></head><body>${kitchenContent}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
    toast('Kitchen Order', 'Sent to kitchen printer.', 'success');
  }
}

// Add kitchen print button to receipt actions
const _origShowReceipt = showReceipt;
showReceipt = function(txn) {
  _origShowReceipt(txn);
  // Add kitchen print button
  const actions = document.querySelector('.receipt-actions');
  if (actions && !document.getElementById('kitchenPrintBtn')) {
    const btn = document.createElement('button');
    btn.id = 'kitchenPrintBtn';
    btn.className = 'glass-btn glass-btn-sm';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M17 21H7a2 2 0 0 1-2-2v-4h14v4a2 2 0 0 1-2 2z"/><polyline points="7 13 7 5 17 5 17 13"/></svg> Kitchen`;
    btn.onclick = printKitchenOrder;
    actions.appendChild(btn);
  }
};

// =============================================
// TOP CASHIER LEADERBOARD
// =============================================
function renderTopCashiers() {
  const container = document.getElementById('dashTopCashiers');
  if (!container) return;

  // Count sales per cashier
  const cashierSales = {};
  db.state.transactions.forEach(t => {
    cashierSales[t.cashier] = (cashierSales[t.cashier] || 0) + t.total;
  });

  const today = todayStr();
  const todaySales = {};
  db.state.transactions.filter(t => t.date.split('T')[0] === today).forEach(t => {
    todaySales[t.cashier] = (todaySales[t.cashier] || 0) + t.total;
  });

  const sorted = Object.keys(cashierSales).sort((a, b) => cashierSales[b] - cashierSales[a]);
  const medals = ['🥇', '🥈', '🥉'];

  if (!sorted.length) {
    container.innerHTML = '<div class="text-center text-xs text-gray-500 py-4">No cashier data</div>';
    return;
  }

  container.innerHTML = sorted.slice(0, 5).map((name, i) => `
    <div class="flex items-center justify-between p-2.5 border-b border-gray-800/50 hover:bg-white/5 transition" style="border-bottom:1px solid var(--border-subtle)">
      <div class="flex items-center gap-2">
        <span class="text-sm">${medals[i] || '👤'}</span>
        <div>
          <p class="text-xs font-semibold" style="color:var(--text-primary)">${name}</p>
          <span class="text-[10px]" style="color:var(--text-muted)">Today: ${rp(todaySales[name] || 0)}</span>
        </div>
      </div>
      <span class="text-xs font-bold" style="color:var(--primary-light)">${rp(cashierSales[name])}</span>
    </div>
  `).join('');
}

// =============================================
// CATEGORY SALES BAR CHART
// =============================================
let catSalesChartInst = null;

function renderCategorySalesChart() {
  const canvas = document.getElementById('catSalesChart');
  if (!canvas) return;

  const catSales = {};
  db.state.transactions.forEach(t => {
    t.items.forEach(i => {
      const p = db.state.products.find(x => x.id === i.productId);
      if (p) catSales[p.category] = (catSales[p.category] || 0) + i.subtotal;
    });
  });

  const labels = Object.keys(catSales);
  const data = Object.values(catSales);
  const colors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];

  if (catSalesChartInst) catSalesChartInst.destroy();
  catSalesChartInst = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Revenue by Category',
        data,
        backgroundColor: labels.map((_, i) => colors[i % colors.length] + '80'),
        borderColor: labels.map((_, i) => colors[i % colors.length]),
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#9CA3AF', font: { size: 9 }, callback: v => v >= 1000000 ? (v/1000000)+'M' : v >= 1000 ? (v/1000)+'K' : v } },
        y: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 10 } } }
      }
    }
  });
}

// =============================================
// ENHANCE DASHBOARD WITH MORE WIDGETS
// =============================================
function enhanceDashboardMore() {
  const dashboard = document.getElementById('section-dashboard');
  if (!dashboard || document.getElementById('extraWidgets')) return;

  const thirds = dashboard.querySelector('.dashboard-grid.thirds');
  if (!thirds) return;

  const extraWidgets = document.createElement('div');
  extraWidgets.id = 'extraWidgets';
  extraWidgets.className = 'dashboard-grid thirds';
  extraWidgets.style.cssText = 'margin-top:0';

  extraWidgets.innerHTML = `
    <div class="glass-panel">
      <div class="panel-header"><h3>Top Cashiers</h3><span class="panel-badge">Leaderboard</span></div>
      <div id="dashTopCashiers"></div>
    </div>
    <div class="glass-panel chart-panel" style="grid-column:span 2">
      <div class="panel-header"><h3>Revenue by Category</h3><span class="panel-badge">Breakdown</span></div>
      <div class="chart-container"><canvas id="catSalesChart"></canvas></div>
    </div>
  `;

  thirds.parentNode.insertBefore(extraWidgets, thirds.nextSibling);
}



// =============================================
// SOUND TOGGLE IN SETTINGS
// =============================================
function addSoundToggle() {
  const settingsForm = document.getElementById('settingsForm');
  if (!settingsForm || document.getElementById('soundToggleGroup')) return;

  if (db.state.settings.soundEnabled === undefined) {
    db.state.settings.soundEnabled = true;
    db.save();
  }

  const soundGroup = document.createElement('div');
  soundGroup.id = 'soundToggleGroup';
  soundGroup.className = 'form-check';
  soundGroup.style.cssText = 'margin:4px 0';
  soundGroup.innerHTML = `
    <input type="checkbox" id="setSound" ${db.state.settings.soundEnabled ? 'checked' : ''}>
    <label for="setSound">Enable Sound Effects</label>
  `;

  const whatsappCheck = document.querySelector('.form-check');
  if (whatsappCheck && whatsappCheck.parentNode) {
    whatsappCheck.parentNode.insertBefore(soundGroup, whatsappCheck.nextSibling);
  }

  document.getElementById('setSound')?.addEventListener('change', e => {
    db.state.settings.soundEnabled = e.target.checked;
    db.save();
    if (e.target.checked) sfxClick();
  });
}

// Patch enhanceSettings
const _origEnhanceSettings = enhanceSettings;
enhanceSettings = function() {
  _origEnhanceSettings();
  setTimeout(addSoundToggle, 50);
};

// Patch sfx functions to respect sound toggle
const _origSfxAdd = sfxAdd;
sfxAdd = function() { if (db.state.settings?.soundEnabled !== false) _origSfxAdd(); };
const _origSfxSuccess = sfxSuccess;
sfxSuccess = function() { if (db.state.settings?.soundEnabled !== false) _origSfxSuccess(); };
const _origSfxError = sfxError;
sfxError = function() { if (db.state.settings?.soundEnabled !== false) _origSfxError(); };
const _origSfxClick = sfxClick;
sfxClick = function() { if (db.state.settings?.soundEnabled !== false) _origSfxClick(); };
const _origSfxScan = sfxScan;
sfxScan = function() { if (db.state.settings?.soundEnabled !== false) _origSfxScan(); };

// =============================================
// DRAFT ORDERS PANEL (Resume Held Carts)
// =============================================
function initDraftOrders() {
  const holdBtn = document.getElementById('holdCartBtn');
  if (!holdBtn || document.getElementById('draftToggleBtn')) return;
  
  // Add draft toggle next to hold
  const draftBtn = document.createElement('button');
  draftBtn.id = 'draftToggleBtn';
  draftBtn.className = 'glass-btn';
  draftBtn.title = 'View Draft Orders';
  draftBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
  draftBtn.style.cssText = 'padding:8px;flex-shrink:0';
  draftBtn.onclick = showDraftOrders;
  holdBtn.parentNode.insertBefore(draftBtn, holdBtn.nextSibling);
}

function showDraftOrders() {
  const drafts = db.state.heldCarts || [];
  if (!drafts.length) { toast('No Drafts', 'No held carts available.', 'info'); return; }

  // Create draft modal
  let modal = document.getElementById('draftModal');
  if (modal) { modal.style.display = 'flex'; renderDraftList(); return; }

  modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'draftModal';
  modal.innerHTML = `
    <div class="glass-panel modal-content" style="max-width:500px">
      <div class="modal-header">
        <h3>Draft Orders (${drafts.length})</h3>
        <button class="modal-close" onclick="closeModal('draftModal')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body" id="draftList"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.style.display = 'flex';
  renderDraftList();
}

function renderDraftList() {
  const el = document.getElementById('draftList');
  if (!el) return;
  const drafts = db.state.heldCarts || [];

  if (!drafts.length) {
    el.innerHTML = '<div class="text-center text-gray-500 py-8 text-sm">No draft orders</div>';
    return;
  }

  el.innerHTML = drafts.map((d, i) => {
    const itemCount = d.items.reduce((s, it) => s + it.qty, 0);
    const total = d.items.reduce((s, it) => s + it.price * it.qty, 0);
    const date = new Date(d.date).toLocaleString('id-ID');
    const custName = d.customer ? d.customer.name : 'Walk-in Guest';
    return `
      <div class="flex items-center justify-between p-3 rounded-xl mb-2" style="background:var(--bg-glass);border:1px solid var(--border-subtle)">
        <div>
          <p class="text-xs font-semibold" style="color:var(--text-primary)">Draft #${i + 1}</p>
          <span class="text-[10px]" style="color:var(--text-muted)">${itemCount} items • ${custName} • ${date}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold" style="color:var(--primary-light)">${rp(total)}</span>
          <button class="glass-btn glass-btn-sm glass-btn-primary" onclick="resumeDraft('${d.id}')" style="font-size:10px;padding:4px 10px">Resume</button>
          <button class="glass-btn glass-btn-sm" onclick="deleteDraft('${d.id}')" style="font-size:10px;padding:4px 8px;background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.2);color:var(--danger)">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

function resumeDraft(id) {
  const idx = db.state.heldCarts.findIndex(d => d.id === id);
  if (idx === -1) return;
  const draft = db.state.heldCarts[idx];

  // Restore cart
  cart = draft.items.map(item => ({ ...item }));
  selectedCustomer = draft.customer || null;

  // Restore customer select
  const sel = document.getElementById('posCustomerSelect');
  if (sel && selectedCustomer) sel.value = selectedCustomer.id;

  // Remove draft
  db.state.heldCarts.splice(idx, 1);
  db.save();

  closeModal('draftModal');
  renderCart();
  toast('Draft Restored', 'Held cart has been resumed.', 'success');

  // Switch to POS
  const posLink = document.querySelector('[data-tab="pos"]');
  if (posLink) posLink.click();
}

function deleteDraft(id) {
  db.state.heldCarts = (db.state.heldCarts || []).filter(d => d.id !== id);
  db.save();
  renderDraftList();
  if (!db.state.heldCarts.length) closeModal('draftModal');
}

// =============================================
// SALES TARGET & PROGRESS BAR
// =============================================
function initSalesTarget() {
  if (!db.state.settings.dailyTarget) {
    db.state.settings.dailyTarget = 50000000; // Rp 50,000,000 default
    db.save();
  }
}

function renderSalesTarget() {
  const container = document.getElementById('salesTargetWidget');
  if (!container) return;

  const target = db.state.settings.dailyTarget || 50000000;
  const today = todayStr();
  const todaySales = db.state.transactions
    .filter(t => t.date.split('T')[0] === today)
    .reduce((s, t) => s + t.total, 0);

  const pct = Math.min(100, Math.round((todaySales / target) * 100));
  const remaining = Math.max(0, target - todaySales);
  const isAchieved = todaySales >= target;

  container.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <span class="text-xs font-semibold" style="color:var(--text-primary)">Daily Target: ${rp(target)}</span>
      <span class="text-xs font-bold" style="color:${isAchieved ? 'var(--success)' : 'var(--primary-light)'}">${pct}%</span>
    </div>
    <div style="height:8px;border-radius:10px;background:var(--bg-glass);overflow:hidden;position:relative">
      <div style="height:100%;width:${pct}%;border-radius:10px;background:${isAchieved ? 'linear-gradient(90deg,var(--success),var(--success-light))' : 'linear-gradient(90deg,var(--primary),var(--secondary))'};transition:width 0.8s cubic-bezier(0.34,1.56,0.64,1)"></div>
      ${isAchieved ? '<div style="position:absolute;right:4px;top:50%;transform:translateY(-50%);font-size:12px">🎯</div>' : ''}
    </div>
    <div class="flex justify-between items-center mt-1.5">
      <span class="text-[10px]" style="color:var(--text-muted)">Today: ${rp(todaySales)}</span>
      <span class="text-[10px]" style="color:${isAchieved ? 'var(--success)' : 'var(--warning)'}">
        ${isAchieved ? '✓ Target Achieved!' : `${rp(remaining)} remaining`}
      </span>
    </div>
  `;
}

function setSalesTarget() {
  const target = prompt('Set daily sales target (Rp):', (db.state.settings.dailyTarget || 50000000).toLocaleString());
  if (target) {
    const num = parseInt(target.replace(/[^0-9]/g, ''));
    if (num > 0) {
      db.state.settings.dailyTarget = num;
      db.save();
      renderSalesTarget();
      toast('Target Set', `Daily target: ${rp(num)}`, 'success');
    }
  }
}

// =============================================
// CUSTOMER PURCHASE HISTORY POPUP
// =============================================
function viewCustomerHistory(customerId) {
  const cust = db.state.customers.find(c => c.id === customerId);
  if (!cust) return;

  const txns = db.state.transactions.filter(t => t.customerId === customerId).sort((a, b) => new Date(b.date) - new Date(a.date));

  let modal = document.getElementById('custHistoryModal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'custHistoryModal';
  modal.style.display = 'flex';

  const totalSpent = txns.reduce((s, t) => s + t.total, 0);
  const txnCount = txns.length;
  const avgOrder = txnCount > 0 ? Math.round(totalSpent / txnCount) : 0;

  modal.innerHTML = `
    <div class="glass-panel modal-content" style="max-width:600px">
      <div class="modal-header">
        <h3>${cust.name} — Purchase History</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">
          <div class="p-3 rounded-xl text-center" style="background:var(--bg-glass);border:1px solid var(--border-subtle)">
            <div class="text-lg font-black" style="color:var(--primary-light)">${txnCount}</div>
            <div class="text-[10px]" style="color:var(--text-muted)">Orders</div>
          </div>
          <div class="p-3 rounded-xl text-center" style="background:var(--bg-glass);border:1px solid var(--border-subtle)">
            <div class="text-lg font-black" style="color:var(--success)">${rp(totalSpent)}</div>
            <div class="text-[10px]" style="color:var(--text-muted)">Total Spent</div>
          </div>
          <div class="p-3 rounded-xl text-center" style="background:var(--bg-glass);border:1px solid var(--border-subtle)">
            <div class="text-lg font-black" style="color:var(--warning)">${rp(avgOrder)}</div>
            <div class="text-[10px]" style="color:var(--text-muted)">Avg Order</div>
          </div>
        </div>
        <div style="max-height:300px;overflow-y:auto">
          ${txns.length ? txns.slice(0, 20).map(t => `
            <div class="flex justify-between items-center p-2.5 rounded-xl mb-1.5" style="background:var(--bg-glass);border:1px solid var(--border-subtle);cursor:pointer" onclick="viewTxn('${t.id}')">
              <div>
                <p class="text-xs font-semibold" style="color:var(--text-primary)">${t.invoiceNo}</p>
                <span class="text-[10px]" style="color:var(--text-muted)">${new Date(t.date).toLocaleDateString('id-ID')}</span>
              </div>
              <div class="text-right">
                <p class="text-xs font-bold" style="color:var(--primary-light)">${rp(t.total)}</p>
                <span class="text-[10px]" style="color:var(--text-muted)">${t.items.length} items</span>
              </div>
            </div>
          `).join('') : '<div class="text-center text-gray-500 py-4 text-sm">No purchase history</div>'}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Add customer history button in customers table
const _origRenderCustomers = renderCustomers;
renderCustomers = function(filter) {
  _origRenderCustomers(filter);
  // Add history buttons to customer rows
  document.querySelectorAll('#customersTbody tr').forEach(row => {
    const actions = row.querySelector('td:last-child');
    if (actions && !row.querySelector('.hist-btn')) {
      const editBtn = actions.querySelector('button');
      if (editBtn) {
        const histBtn = document.createElement('button');
        histBtn.className = 'hist-btn text-xs font-bold';
        histBtn.style.cssText = 'color:var(--success);background:none;border:none;cursor:pointer;margin-left:8px';
        histBtn.textContent = 'History';
        const custId = db.state.customers.find(c => row.textContent.includes(c.name))?.id;
        if (custId) histBtn.onclick = () => viewCustomerHistory(custId);
        editBtn.parentNode.insertBefore(histBtn, editBtn.nextSibling);
      }
    }
  });
};

// =============================================
// ACTIVITY LOG (Audit Trail)
// =============================================
function logActivity(action, detail) {
  if (!db.state.activityLog) db.state.activityLog = [];
  db.state.activityLog.unshift({
    id: uid('log'),
    action,
    detail,
    time: new Date().toISOString(),
    user: 'Edward Stark'
  });
  // Keep last 100 entries
  if (db.state.activityLog.length > 100) db.state.activityLog.length = 100;
  db.save();
}

// Patch key functions to log activity
const _origSaveProduct = saveProduct;
saveProduct = function() {
  const name = document.getElementById('prodName')?.value || 'Unknown';
  const id = document.getElementById('prodId')?.value;
  _origSaveProduct();
  logActivity(id ? 'Product Updated' : 'Product Created', name);
};

const _origDeleteProduct = deleteProduct;
deleteProduct = function(id) {
  const p = db.state.products.find(x => x.id === id);
  _origDeleteProduct(id);
  if (p) logActivity('Product Deleted', p.name);
};

const _origSaveCustomer = saveCustomer;
saveCustomer = function() {
  const name = document.getElementById('custName')?.value || 'Unknown';
  _origSaveCustomer();
  logActivity('Customer Saved', name);
};

const _origSubmitPaymentLog = submitPayment;
submitPayment = function() {
  _origSubmitPaymentLog();
  const last = db.state.transactions[db.state.transactions.length - 1];
  if (last) logActivity('Sale Completed', `${last.invoiceNo}: ${rp(last.total)}`);
};

// Activity log viewer in settings
function renderActivityLog() {
  const container = document.getElementById('activityLogContainer');
  if (!container) return;

  const logs = db.state.activityLog || [];
  if (!logs.length) {
    container.innerHTML = '<div class="text-center text-gray-500 py-4 text-sm">No activity recorded yet</div>';
    return;
  }

  container.innerHTML = logs.slice(0, 30).map(log => {
    const date = new Date(log.time);
    return `
      <div class="flex items-start gap-2 p-2 border-b" style="border-bottom:1px solid var(--border-subtle)">
        <div class="w-1.5 h-1.5 rounded-full mt-1.5" style="background:${log.action.includes('Sale') ? 'var(--success)' : log.action.includes('Delete') ? 'var(--danger)' : 'var(--primary)'}"></div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold" style="color:var(--text-primary)">${log.action}</p>
          <p class="text-[10px]" style="color:var(--text-muted)">${log.detail} • ${date.toLocaleString('id-ID')}</p>
        </div>
      </div>
    `;
  }).join('');
}

// Add activity log to settings
function addActivityLogToSettings() {
  const settingsPanel = document.querySelector('#section-pengaturan .dashboard-grid');
  if (!settingsPanel || document.getElementById('activityLogPanel')) return;

  const panel = document.createElement('div');
  panel.id = 'activityLogPanel';
  panel.className = 'glass-panel';
  panel.style.cssText = 'grid-column:1/-1;margin-top:0';
  panel.innerHTML = `
    <div class="panel-header">
      <h3>Activity Log</h3>
      <span class="panel-badge">${(db.state.activityLog || []).length} entries</span>
    </div>
    <div id="activityLogContainer" style="max-height:300px;overflow-y:auto"></div>
  `;
  settingsPanel.appendChild(panel);
  renderActivityLog();
}

// Patch enhanceSettings to add activity log
const _origEnhanceSettings2 = enhanceSettings;
enhanceSettings = function() {
  _origEnhanceSettings2();
  setTimeout(addActivityLogToSettings, 100);
  // Also log page visit
  setTimeout(() => logActivity('Session Started', 'CasirPRO v4.0 loaded'), 1000);
};

// =============================================
// EXCEL EXPORT FOR REPORTS
// =============================================
function exportToExcel(type = 'transactions') {
  if (type === 'transactions') {
    const txns = db.state.transactions;
    if (!txns.length) { toast('No Data', 'No transactions to export.', 'warning'); return; }

    let html = '<table><thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Items</th><th>Payment</th><th>Subtotal</th><th>Tax</th><th>Total</th></tr></thead><tbody>';
    txns.forEach(t => {
      const items = t.items.map(i => `${i.name} x${i.qty}`).join(', ');
      html += `<tr><td>${t.invoiceNo}</td><td>${new Date(t.date).toLocaleString('id-ID')}</td><td>${t.customerName}</td><td>${items}</td><td>${t.paymentMethod}</td><td>${t.subtotal}</td><td>${t.tax}</td><td>${t.total}</td></tr>`;
    });
    html += '</tbody></table>';

    downloadExcel('casirpro_transactions.xls', html);
    logActivity('Export', `Exported ${txns.length} transactions to Excel`);
    toast('Exported', `${txns.length} transactions exported.`, 'success');
  } else if (type === 'products') {
    const prods = db.state.products;
    let html = '<table><thead><tr><th>Name</th><th>SKU</th><th>Barcode</th><th>Category</th><th>Cost</th><th>Price</th><th>Member Price</th><th>Stock</th></tr></thead><tbody>';
    prods.forEach(p => {
      html += `<tr><td>${p.name}</td><td>${p.sku}</td><td>${p.barcode}</td><td>${p.category}</td><td>${p.cost}</td><td>${p.price}</td><td>${p.memberPrice}</td><td>${p.stock}</td></tr>`;
    });
    html += '</tbody></table>';
    downloadExcel('casirpro_products.xls', html);
    toast('Exported', `${prods.length} products exported.`, 'success');
  } else if (type === 'customers') {
    const custs = db.state.customers;
    let html = '<table><thead><tr><th>Name</th><th>Card No</th><th>Tier</th><th>Phone</th><th>Points</th><th>LTV</th></tr></thead><tbody>';
    custs.forEach(c => {
      html += `<tr><td>${c.name}</td><td>${c.cardNo}</td><td>${c.tier}</td><td>${c.phone}</td><td>${c.points}</td><td>${c.ltv}</td></tr>`;
    });
    html += '</tbody></table>';
    downloadExcel('casirpro_customers.xls', html);
    toast('Exported', `${custs.length} customers exported.`, 'success');
  }
}

function downloadExcel(filename, html) {
  const blob = new Blob([
    '\uFEFF' + // UTF-8 BOM for Excel
    '<html><head><meta charset="UTF-8"><style>td,th{border:1px solid #ccc;padding:6px;font-size:11px}th{background:#f0f0f0;font-weight:700}</style></head><body>' +
    html +
    '</body></html>'
  ], { type: 'application/vnd.ms-excel;charset=utf-8' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Add export buttons to report section
const _origRenderReport = renderReport;
renderReport = function() {
  _origRenderReport();
  const actions = document.querySelector('#section-laporan .section-actions');
  if (actions && !document.getElementById('excelExportBtn')) {
    const btn = document.createElement('button');
    btn.id = 'excelExportBtn';
    btn.className = 'glass-btn glass-btn-sm';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="16" x2="16" y2="16"/></svg>
      Export Excel`;
    btn.onclick = () => exportToExcel('transactions');
    actions.appendChild(btn);
  }
};

// =============================================
// ADD SALES TARGET WIDGET TO DASHBOARD
// =============================================
function addSalesTargetWidget() {
  const dashboard = document.getElementById('section-dashboard');
  const statsGrid = document.getElementById('statsGrid');
  if (!dashboard || !statsGrid || document.getElementById('salesTargetWidget')) return;

  const targetWidget = document.createElement('div');
  targetWidget.className = 'glass-panel';
  targetWidget.id = 'salesTargetWidget';
  targetWidget.style.cssText = 'padding:20px;cursor:pointer';
  targetWidget.onclick = setSalesTarget;
  targetWidget.title = 'Click to set daily target';

  statsGrid.parentNode.insertBefore(targetWidget, statsGrid.nextSibling);
  initSalesTarget();
  renderSalesTarget();
}



// =============================================
// ADD DRAFT ORDERS TO POS
// =============================================
const _origInitPOS = initPOS;
initPOS = function() {
  _origInitPOS();
  setTimeout(initDraftOrders, 100);
  setTimeout(renderPendingOrders, 200);
};

// =============================================
// KIOSK SELF-ORDER SYSTEM
// =============================================
let kioskCart = [];

const KIOSK_CATEGORY_ICONS = {
  'Makanan': '🍔', 'Minuman': '🥤', 'Snack': '🍿', 'Kopi': '☕',
  'Roti': '🥐', 'Kue': '🎂', 'Nasi': '🍚', 'Mie': '🍜',
  'default': '📦'
};

function renderKioskView() {
  renderKioskCategories();
  renderKioskGrid();
  updateKioskCartBar();
}

function initKiosk() {
  renderKioskCategories();
  renderKioskGrid();
  setupKioskCartBar();
  // auto-refresh when products change
  document.addEventListener('productsChanged', () => {
    renderKioskCategories();
    renderKioskGrid();
  });
}

function getKioskProducts() {
  try { return JSON.parse(localStorage.getItem('pos_products')) || []; } catch(e) { return []; }
}

function renderKioskCategories() {
  const el = document.getElementById('kioskCategories');
  if (!el) return;
  const products = getKioskProducts();
  const cats = [...new Set(products.map(p => p.category || 'Umum'))];
  let html = '<button class="kiosk-cat-btn active" data-cat="all">Semua</button>';
  cats.forEach(c => {
    html += `<button class="kiosk-cat-btn" data-cat="${c}">${KIOSK_CATEGORY_ICONS[c] || '📦'} ${c}</button>`;
  });
  el.innerHTML = html;
  el.querySelectorAll('.kiosk-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.kiosk-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderKioskGrid(btn.dataset.cat);
    });
  });
}

function renderKioskGrid(category = 'all') {
  const el = document.getElementById('kioskGrid');
  if (!el) return;
  const products = getKioskProducts();
  const filtered = category === 'all' ? products : products.filter(p => (p.category || 'Umum') === category);
  if (!filtered.length) {
    el.innerHTML = '<div style="text-align:center;padding:40px;opacity:0.4;">Belum ada produk — tambah di menu Produk & Stok</div>';
    return;
  }
  let html = '';
  filtered.forEach(p => {
    const qty = (kioskCart.find(i => i.id === p.id)?.qty) || 0;
    const oos = (p.stock !== undefined && p.stock <= 0);
    html += `
      <div class="kiosk-card ${oos ? 'out-of-stock' : ''}" data-id="${p.id}">
        <span class="badge-added ${qty > 0 ? 'show' : ''}">${qty}</span>
        <div class="emoji-icon">${p.imgEmoji || KIOSK_CATEGORY_ICONS[p.category] || '📦'}</div>
        <div class="prod-name">${p.name}</div>
        <div class="prod-price">${formatRupiah(p.price)}</div>
        <div class="prod-stock">${oos ? 'Habis' : 'Stok: ' + (p.stock ?? '∞')}</div>
      </div>`;
  });
  el.innerHTML = html;
  el.querySelectorAll('.kiosk-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      addToKioskCart(id);
    });
  });
}

function addToKioskCart(productId) {
  const products = getKioskProducts();
  const p = products.find(x => x.id === productId);
  if (!p || (p.stock !== undefined && p.stock <= 0)) {
    showKioskSnackbar('Stok habis!');
    return;
  }
  const existing = kioskCart.find(i => i.id === productId);
  if (existing) {
    existing.qty = (existing.qty || 0) + 1;
    // stock check
    if (p.stock !== undefined && existing.qty > p.stock) {
      existing.qty = p.stock;
      showKioskSnackbar('Stok tidak mencukupi');
      return;
    }
  } else {
    kioskCart.push({ id: productId, name: p.name, price: p.price, qty: 1 });
  }
  renderKioskGrid(document.querySelector('.kiosk-cat-btn.active')?.dataset?.cat || 'all');
  updateKioskCartBar();
  playSfx('sfxAdd');
}

function removeFromKioskCart(productId) {
  const existing = kioskCart.find(i => i.id === productId);
  if (!existing) return;
  if (existing.qty > 1) {
    existing.qty--;
  } else {
    kioskCart = kioskCart.filter(i => i.id !== productId);
  }
  renderKioskGrid(document.querySelector('.kiosk-cat-btn.active')?.dataset?.cat || 'all');
  updateKioskCartBar();
}

function clearKioskCart() {
  kioskCart = [];
  renderKioskGrid(document.querySelector('.kiosk-cat-btn.active')?.dataset?.cat || 'all');
  updateKioskCartBar();
}

function updateKioskCartBar() {
  const el = document.getElementById('kioskCartItems');
  const countEl = document.getElementById('kioskItemCount');
  const totalEl = document.getElementById('kioskTotal');
  if (!el) return;

  const total = kioskCart.reduce((s, i) => s + i.price * i.qty, 0);
  totalEl.textContent = formatRupiah(total);

  if (!kioskCart.length) {
    el.innerHTML = '<span style="opacity:0.4;font-size:0.8rem;">Belum ada produk — tap produk di atas</span>';
    countEl.textContent = '0 items';
    document.getElementById('kioskSendBtn').disabled = true;
    return;
  }
  document.getElementById('kioskSendBtn').disabled = false;
  const totalQty = kioskCart.reduce((s, i) => s + i.qty, 0);
  countEl.textContent = totalQty + ' items';

  let html = '';
  kioskCart.forEach(i => {
    html += `<div class="kiosk-cart-chip">
      <span class="chip-qty">${i.qty}x</span>
      <span>${i.name}</span>
      <span class="chip-remove" onclick="removeFromKioskCart('${i.id}')">✕</span>
    </div>`;
  });
  el.innerHTML = html;
}

function setupKioskCartBar() {
  const waInput = document.getElementById('kioskWaInput');
  if (waInput) {
    waInput.addEventListener('input', () => sanitizeWaInput(waInput));
  }
}

function sanitizeWaInput(input) {
  input.value = input.value.replace(/[^0-9]/g, '');
}

function showKioskSnackbar(msg) {
  let el = document.querySelector('.kiosk-snackbar');
  if (!el) {
    el = document.createElement('div');
    el.className = 'kiosk-snackbar';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2000);
}

function sendKioskOrder() {
  if (!kioskCart.length) return;
  const wa = document.getElementById('kioskWaInput')?.value?.trim() || '';

  // Build order object
  const order = {
    id: Date.now(),
    items: kioskCart.map(i => ({ ...i })),
    total: kioskCart.reduce((s, i) => s + i.price * i.qty, 0),
    customerWa: wa || '',
    customerName: wa ? 'WA: ' + wa : 'Walk-in',
    timestamp: new Date().toISOString(),
    status: 'pending', // pending | accepted | declined
    source: 'kiosk'
  };

  // Save to pending orders
  const orders = getPendingOrders();
  orders.push(order);
  localStorage.setItem('pos_pending_orders', JSON.stringify(orders));

  playSfx('sfxSuccess');

  // Show WA link or receipt
  let msg = '✓ Pesan terkirim ke kasir!';
  if (wa) {
    const orderText = formatWaOrderText(order);
    const waLink = `https://wa.me/${wa}?text=${encodeURIComponent(orderText)}`;
    msg += `<br><small>Struk dikirim via WA</small>`;
    // We could open WA link, but let user choose
    // For now, just show snackbar with copy option
  }
  showKioskSnackbar(msg);

  const itemCount = order.items.reduce((s, i) => s + i.qty, 0);

  // Clear cart
  kioskCart = [];
  renderKioskGrid(document.querySelector('.kiosk-cat-btn.active')?.dataset?.cat || 'all');
  updateKioskCartBar();

  // Notify POS if open in same window
  if (typeof renderPendingOrders === 'function') renderPendingOrders();

  // BroadcastChannel for multi-device
  notifyKioskOrder(order);

  // Also add to transactions for record
  logActivity(`Pesanan kiosk #${order.id} — ${itemCount} items — diterima`);
}

function formatWaOrderText(order) {
  let text = '🛍️ *Pesanan Kiosk*\n';
  text += '━━━━━━━━━━━━━━━━\n';
  order.items.forEach(i => {
    text += `${i.qty}x ${i.name} — ${formatRupiah(i.price * i.qty)}\n`;
  });
  text += '━━━━━━━━━━━━━━━━\n';
  text += `*Total: ${formatRupiah(order.total)}*\n`;
  text += `\nTerima kasih! 🎉`;
  return text;
}

// =============================================
// PENDING ORDERS (Kiosk → POS)
// =============================================
function getPendingOrders() {
  try { return JSON.parse(localStorage.getItem('pos_pending_orders')) || []; } catch(e) { return []; }
}

function acceptPendingOrder(orderId) {
  let orders = getPendingOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  order.status = 'accepted';

  // Auto-fill POS cart
  order.items.forEach(i => {
    for (let n = 0; n < i.qty; n++) {
      addToCart(i.id);
    }
  });

  // Add customer name
  const posCustomerEl = document.getElementById('posCustomerSelect');
  if (posCustomerEl && order.customerName) {
    const existing = [...posCustomerEl.options].find(o => o.text === order.customerName);
    if (existing) {
      posCustomerEl.value = existing.value;
    } else {
      const opt = document.createElement('option');
      opt.text = order.customerName;
      opt.value = '';
      posCustomerEl.add(opt);
      posCustomerEl.value = '';
    }
  }

  // For online orders, mark payment as paid and show shipping info
  if (order.source === 'online' || order.shippingCourier) {
    order.paymentStatus = 'paid';
    showKioskSnackbar('✓ Pesanan online dimuat — tandai已完成 pengiriman setelah diproses');
  }

  localStorage.setItem('pos_pending_orders', JSON.stringify(orders));
  renderPendingOrders();
  switchTab('pos');
  playSfx('sfxSuccess');
  showKioskSnackbar('✓ Pesanan dimuat ke POS');
}

function syncProductsToServer() {
  const url = localStorage.getItem('pos_server_http_url') || 'http://localhost:3000';
  const products = db?.state?.products || [];
  const settings = db?.state?.settings || {};
  const staffList = db?.state?.staffList || [];
  const branch = (typeof BRANCH_ID !== 'undefined' && BRANCH_ID) || sessionStorage.getItem('casirpro_branch') || '';
  const endpoint = branch ? '/api/branch/products' : '/api/sync';
  const syncData = branch ? products : { products, settings, staffList };
  fetch(url + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(syncData)
  }).catch(() => {});
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send(JSON.stringify({ type: 'sync', data: { products, settings, staffList }, branchId: branch }));
  }
}

function syncServerSettings() {
  const url = localStorage.getItem('pos_server_http_url') || 'http://localhost:3000';
  const settings = db?.state?.settings || {};
  const branch = (typeof BRANCH_ID !== 'undefined' && BRANCH_ID) || sessionStorage.getItem('casirpro_branch') || '';
  const endpoint = branch ? '/api/branch/settings' : '/api/settings';
  fetch(url + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storeName: settings.storeName || 'CasirStore',
      storeWa: settings.storeWa || '6281234567890',
      rajaongkirKey: settings.rajaongkirKey || '',
      originCity: settings.originCity || '151',
      bankName: settings.bankName || 'BCA',
      bankAccount: settings.bankAccount || '',
      bankHolder: settings.bankHolder || '',
      language: settings.language || 'id'
    })
  }).catch(() => {});
}

function startOrderPolling() {
  setInterval(() => {
    const url = localStorage.getItem('pos_server_http_url') || 'http://localhost:3000';
    const enabled = localStorage.getItem('pos_server_enabled') !== 'false';
    if (!enabled) return;
    const branch = (typeof BRANCH_ID !== 'undefined' && BRANCH_ID) || sessionStorage.getItem('casirpro_branch') || '';
    const ordersEndpoint = branch ? `/api/branch/orders?branch=${branch}` : '/api/orders';
    fetch(url + ordersEndpoint)
      .then(r => r.json())
      .then(serverOrders => {
        if (!Array.isArray(serverOrders)) return;
        const local = getPendingOrders();
        let changed = false;
        serverOrders.forEach(o => {
          if (o.status === 'pending' && !local.find(x => x.id === o.id)) {
            local.push(o);
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem('pos_pending_orders', JSON.stringify(local));
          renderPendingOrders();
          handleIncomingOrderNotification();
        }
      })
      .catch(() => {});
  }, 10000); // poll every 10s
}

function declinePendingOrder(orderId) {
  let orders = getPendingOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  order.status = 'declined';
  localStorage.setItem('pos_pending_orders', JSON.stringify(orders));
  renderPendingOrders();
  showKioskSnackbar('✕ Pesanan ditolak');
}

function deletePendingOrder(orderId) {
  let orders = getPendingOrders().filter(o => o.id !== orderId);
  localStorage.setItem('pos_pending_orders', JSON.stringify(orders));
  renderPendingOrders();
}

function waPendingOrder(orderId) {
  const orders = getPendingOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order || !order.customerWa) return;
  const text = formatWaOrderText(order);
  window.open(`https://wa.me/${order.customerWa}?text=${encodeURIComponent(text)}`, '_blank');
}

function updateKioskBadge() {
  const count = getPendingOrders().filter(o => o.status === 'pending').length;
  const link = document.querySelector('.sidebar-nav-link[data-tab="kiosk"]');
  if (!link) return;
  let badge = link.querySelector('.nav-badge');
  if (count > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'nav-badge';
      link.appendChild(badge);
    }
    badge.textContent = count > 99 ? '99+' : count;
  } else {
    if (badge) badge.remove();
  }
  // also update POS badge
  const posLink = document.querySelector('.sidebar-nav-link[data-tab="pos"]');
  if (posLink) {
    let pbadge = posLink.querySelector('.nav-badge');
    if (count > 0) {
      if (!pbadge) {
        pbadge = document.createElement('span');
        pbadge.className = 'nav-badge';
        posLink.appendChild(pbadge);
      }
      pbadge.textContent = count;
    } else {
      if (pbadge) pbadge.remove();
    }
  }
}

function renderPendingOrders() {
  const container = document.querySelector('.pos-right');
  if (!container) return;
  const allOrders = getPendingOrders();
  const pending = allOrders.filter(o => o.status === 'pending');
  let existing = document.querySelector('.pending-orders-panel');
  if (existing) existing.remove();

  updateKioskBadge();

  if (!pending.length) return;

  // Merge with server orders that have shipping info
  let onlineOrders = [];
  try {
    const savedOnline = localStorage.getItem('pos_online_orders');
    if (savedOnline) onlineOrders = JSON.parse(savedOnline);
  } catch(e) {}

  const panel = document.createElement('div');
  panel.className = 'pending-orders-panel';
  panel.innerHTML = `<h4>🔔 Pesanan Masuk (${pending.length})</h4>`;

  pending.slice().reverse().forEach(o => {
    const isOnline = (o.source === 'online' || o.shippingCourier);
    const itemList = o.items.map(i => `${i.qty}x ${i.name}`).join(', ');
    const sourceIcon = isOnline ? '🌐' : '🛍️';
    const sourceLabel = isOnline ? 'Online' : 'Kiosk';

    panel.innerHTML += `<div class="pending-order-item" style="${isOnline ? 'border-color:var(--primary);background:rgba(99,102,241,0.04)' : ''}">
      <div class="po-info">
        <strong>${sourceIcon} #${String(o.id).slice(-6)}</strong>
        <span style="font-size:10px;background:var(--primary);color:#fff;padding:1px 6px;border-radius:4px;margin-left:4px">${sourceLabel}</span>
        — ${o.customerName || 'Walk-in'}<br>
        <span style="opacity:0.6;font-size:0.75rem;">${itemList} = ${formatRupiah(o.total)}</span>
        ${o.shippingCourier ? `<br><span style="font-size:0.7rem;opacity:0.5">🚚 ${o.shippingCourier} ${o.shippingService || ''} • ${formatRupiah(o.shippingCost)}</span>` : ''}
        ${o.shippingEtd ? `<span style="font-size:0.7rem;opacity:0.5"> • Estimasi: ${o.shippingEtd}</span>` : ''}
        ${o.customerAddress ? `<br><span style="font-size:0.7rem;opacity:0.4">📍 ${o.customerAddress}, ${o.customerCity || ''}</span>` : ''}
        ${o.customerNote ? `<br><span style="font-size:0.7rem;opacity:0.4">📝 ${o.customerNote}</span>` : ''}
        ${o.paymentStatus === 'paid' ? `<br><span style="font-size:0.7rem;color:var(--success)">✅ Lunas</span>` : (isOnline ? `<br><span style="font-size:0.7rem;color:var(--warning)">⏳ Menunggu Pembayaran</span>` : '')}
      </div>
      <div class="po-actions" style="flex-direction:column;gap:3px">
        <div style="display:flex;gap:4px">
          ${o.customerWa ? `<button class="po-whatsapp" onclick="waPendingOrder(${o.id})" title="WA Customer">📱</button>` : ''}
          ${o.customerPhone ? `<button class="po-whatsapp" onclick="waPendingOrderPhone(${o.id})" title="WA Customer">📞</button>` : ''}
          <button class="po-accept" onclick="acceptPendingOrder(${o.id})">Ambil</button>
          <button class="po-decline" onclick="declinePendingOrder(${o.id})">✕</button>
        </div>
        ${isOnline ? `<button class="po-whatsapp" style="font-size:10px;padding:2px 8px;width:100%" onclick="markOrderPaid(${o.id})">✅ Bayar</button>` : ''}
        ${o.paymentStatus === 'paid' ? `<button class="po-whatsapp" style="font-size:10px;padding:2px 8px;width:100%" onclick="inputResi(${o.id})">📦 Input Resi</button>` : ''}
        ${o.resi ? `<span style="font-size:10px;color:var(--success)">Resi: ${o.resi}</span>` : ''}
      </div>
    </div>`;
  });

  container.prepend(panel);
}

function markOrderPaid(orderId) {
  let orders = getPendingOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  order.paymentStatus = 'paid';
  order.status = 'accepted';
  localStorage.setItem('pos_pending_orders', JSON.stringify(orders));
  renderPendingOrders();
  showKioskSnackbar('✅ Pesanan ditandai LUNAS');
  playSfx('sfxSuccess');

  // Add items to cart
  order.items.forEach(i => {
    for (let n = 0; n < i.qty; n++) addToCart(i.id);
  });
  switchTab('pos');

  // Notify server
  sendOrderAction(orderId, 'accepted');

  // Send WA to customer
  if (order.customerPhone) {
    let text = `✅ *Pesanan Dikonfirmasi!*\n\n`;
    text += `Halo *${order.customerName}*,\n`;
    text += `Pesanan anda telah kami terima dan sedang diproses.\n\n`;
    text += `*Invoice:* ${order.invoiceNo || '#' + order.id}\n`;
    text += `*Total:* ${formatRupiah(order.total)}\n\n`;
    text += `Akan kami infokan resi pengiriman segera.\n`;
    text += `Terima kasih! 🎉`;
    window.open(`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  }
}

function inputResi(orderId) {
  let orders = getPendingOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const resi = prompt('Masukkan No. Resi pengiriman:', order.resi || '');
  if (!resi || resi === order.resi) return;

  order.resi = resi;
  order.resiDate = new Date().toISOString();
  order.status = 'shipped';
  localStorage.setItem('pos_pending_orders', JSON.stringify(orders));
  renderPendingOrders();
  showKioskSnackbar('📦 Resi tersimpan: ' + resi);

  // Send WA with resi
  if (order.customerPhone) {
    let text = `📦 *Pesanan Dikirim!*\n\n`;
    text += `Halo *${order.customerName}*,\n`;
    text += `Pesanan anda telah dikirim.\n\n`;
    text += `*Invoice:* ${order.invoiceNo || '#' + order.id}\n`;
    text += `*Kurir:* ${order.shippingCourier || '-'}\n`;
    text += `*No. Resi:* ${resi}\n\n`;
    text += `Silakan lacak pesanan anda. Terima kasih! 🎉`;
    window.open(`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  }
}

function waPendingOrderPhone(orderId) {
  const orders = getPendingOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order || !order.customerPhone) return;
  const phone = order.customerPhone.replace(/[^0-9]/g, '');
  window.open(`https://wa.me/${phone.startsWith('0') ? '62' + phone.substring(1) : phone}`, '_blank');
}

function sendOrderAction(orderId, action) {
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send(JSON.stringify({ type: 'order_action', orderId, action }));
  }
  // Also try REST
  const url = localStorage.getItem('pos_server_http_url') || 'http://localhost:3000';
  fetch(url + '/api/orders/' + orderId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: action })
  }).catch(() => {});
}

// =============================================
// MULTI-DEVICE SYNC (BroadcastChannel)
// =============================================
let kioskChannel = null;

function notifyKioskOrder(order) {
  try {
    if (!kioskChannel) {
      kioskChannel = new BroadcastChannel('pos_kiosk_channel');
    }
    kioskChannel.postMessage({ type: 'new_order', order });
  } catch(e) {
    // BroadcastChannel not supported — that's ok
  }
}

// Listen for kiosk orders from other tabs/windows
try {
  const bc = new BroadcastChannel('pos_kiosk_channel');
  bc.onmessage = (ev) => {
    if (ev.data?.type === 'new_order') {
      handleIncomingOrderNotification();
    }
  };
} catch(e) { /* BroadcastChannel not supported */ }

// =============================================
// WEBSOCKET CLIENT (Level 2 Multi-Device)
// =============================================
let wsClient = null;
let wsReconnectTimer = null;

function connectWebSocket() {
  const savedUrl = localStorage.getItem('pos_server_url') || 'ws://localhost:3000';
  const enabled = localStorage.getItem('pos_server_enabled') !== 'false';
  if (!enabled) return;

  try {
    if (wsClient) {
      wsClient.close();
      wsClient = null;
    }

    const branch = (typeof BRANCH_ID !== 'undefined' && BRANCH_ID) || sessionStorage.getItem('casirpro_branch') || '';
    const wsUrl = branch ? savedUrl + '?branch=' + branch : savedUrl;
    wsClient = new WebSocket(wsUrl);

    wsClient.onopen = () => {
      console.log('🔗 Connected to CasirPRO server');
      const statusEl = document.getElementById('serverStatus');
      if (statusEl) {
        statusEl.textContent = '🟢 Server Terhubung';
        statusEl.className = 'text-emerald-300';
      }
      clearTimeout(wsReconnectTimer);
    };

    wsClient.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'new_order') {
          const orders = getPendingOrders();
          // Avoid duplicates
          if (!orders.find(o => o.id === msg.order.id)) {
            orders.push(msg.order);
            localStorage.setItem('pos_pending_orders', JSON.stringify(orders));
            handleIncomingOrderNotification();
          }
        }
        if (msg.type === 'order_updated') {
          const orders = getPendingOrders();
          const idx = orders.findIndex(o => o.id === msg.order.id);
          if (idx !== -1) {
            orders[idx] = msg.order;
            localStorage.setItem('pos_pending_orders', JSON.stringify(orders));
            renderPendingOrders();
          }
        }
        if (msg.type === 'init') {
          // Initial state from server
          if (msg.orders && msg.orders.length) {
            const local = getPendingOrders();
            msg.orders.forEach(o => {
              if (!local.find(x => x.id === o.id)) local.push(o);
            });
            localStorage.setItem('pos_pending_orders', JSON.stringify(local));
            renderPendingOrders();
          }
          if (msg.staffList && msg.staffList.length) {
            db.state.staffList = msg.staffList;
            db.save();
            if (typeof renderStaffList === 'function') renderStaffList();
            if (typeof populateLockScreenCashiers === 'function') populateLockScreenCashiers();
          }
          if (msg.customers && msg.customers.length) {
            db.state.customers = msg.customers;
            db.save();
            if (typeof renderCustomers === 'function') renderCustomers();
          }
          if (msg.shifts && msg.shifts.length) {
            db.state.shifts = msg.shifts;
            db.save();
          }
          if (msg.settings) {
            db.state.settings = Object.assign(db.state.settings || {}, msg.settings);
            db.save();
            if (msg.settings.language && typeof applyLanguage === 'function') applyLanguage(msg.settings.language, false);
          }
        }
        if (msg.type === 'sync') {
          if (msg.data.products) {
            localStorage.setItem('pos_products', JSON.stringify(msg.data.products));
            if (typeof renderProducts === 'function') renderProducts();
            if (typeof renderPOS === 'function') renderPOS();
          }
          if (msg.data.staffList) {
            db.state.staffList = msg.data.staffList;
            db.save();
            if (typeof renderStaffList === 'function') renderStaffList();
            if (typeof populateLockScreenCashiers === 'function') populateLockScreenCashiers();
          }
          if (msg.data.customers) {
            db.state.customers = msg.data.customers;
            db.save();
            if (typeof renderCustomers === 'function') renderCustomers();
          }
          if (msg.data.shifts) {
            db.state.shifts = msg.data.shifts;
            db.save();
          }
          if (msg.data.settings) {
            db.state.settings = Object.assign(db.state.settings || {}, msg.data.settings);
            db.save();
            if (msg.data.settings.language && typeof applyLanguage === 'function') applyLanguage(msg.data.settings.language, false);
          }
          // showKioskSnackbar('🔄 Data disinkronkan dari server');
        }
      } catch(e) {}
    };

    wsClient.onclose = () => {
      console.log('🔌 Disconnected from server, reconnecting...');
      const statusEl = document.getElementById('serverStatus');
      if (statusEl) {
        statusEl.textContent = '🔴 Server Terputus';
        statusEl.className = 'text-red-400';
      }
      wsReconnectTimer = setTimeout(connectWebSocket, 3000);
    };

    wsClient.onerror = (err) => {
      console.log('WS error, will retry...');
      wsClient.close();
    };
  } catch(e) {
    console.log('WS connection failed, will retry...');
    wsReconnectTimer = setTimeout(connectWebSocket, 5000);
  }
}

function handleIncomingOrderNotification() {
  if (typeof renderPendingOrders === 'function') renderPendingOrders();
  playSfx('sfxSuccess');
  const posLink = document.querySelector('.sidebar-nav-link[data-tab="pos"]');
  if (posLink) {
    posLink.style.animation = 'none';
    setTimeout(() => {
      posLink.style.animation = 'pulse 0.6s 3';
    }, 10);
  }
  showKioskSnackbar('🔔 Ada pesanan baru!');
}

function sendOrderViaServer(order) {
  const branch = (typeof BRANCH_ID !== 'undefined' && BRANCH_ID) || sessionStorage.getItem('casirpro_branch') || '';
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send(JSON.stringify({ type: 'new_order', order, branchId: branch }));
  }
  // Also try REST API
  const serverUrl = localStorage.getItem('pos_server_http_url') || 'http://localhost:3000';
  fetch(serverUrl + '/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  }).catch(() => {});
}

// Update notifyKioskOrder to also send via WebSocket
const _origNotify = notifyKioskOrder;
notifyKioskOrder = function(order) {
  if (_origNotify) _origNotify(order);
  sendOrderViaServer(order);
};

// =============================================
// CASHIER LOCK SCREEN LOGIC
// =============================================
let enteredPin = '';
const PIN_MAP = {
  "Edward Stark": "1234",
  "John Doe": "5555",
  "Demo Master": "1"
};

function populateLockScreenCashiers() {
  const select = document.getElementById('lockCashierSelect');
  if (!select) return;
  if (!db.state || !db.state.staffList) return;
  
  select.innerHTML = db.state.staffList.map(s => {
    return `<option value="${s.name}">${s.name} (${s.role === 'Admin' ? 'Owner / Administrator' : 'Kasir Staff / Operator'})</option>`;
  }).join('');
}

function lockTerminal() {
  enteredPin = '';
  updatePinIndicator();
  populateLockScreenCashiers();
  
  const screen = document.getElementById('lockScreen');
  if (screen) {
    screen.style.display = 'flex';
    screen.style.transform = 'translateY(0)';
  }
  const select = document.getElementById('lockCashierSelect');
  if (select && db.state && db.state.activeCashier) {
    select.value = db.state.activeCashier;
  }
  playSfx('sfxClick');
}

function pressPin(num) {
  if (enteredPin.length >= 4) return;
  enteredPin += num;
  updatePinIndicator();
  playSfx('sfxClick');
  if (enteredPin.length === 4) {
    setTimeout(submitPin, 200);
  }
}

function clearPin() {
  enteredPin = '';
  updatePinIndicator();
  playSfx('sfxClick');
}

function updatePinIndicator() {
  const dots = document.querySelectorAll('.pin-dot');
  dots.forEach((dot, index) => {
    if (index < enteredPin.length) {
      dot.classList.add('filled');
    } else {
      dot.classList.remove('filled');
    }
  });
}

async function submitPin() {
  const select = document.getElementById('lockCashierSelect');
  if (!select) return;
  const cashier = select.value;
  
  // Dynamic PIN check from staffList
  let correctPin = '1234';
  if (db.state && db.state.staffList) {
    const staff = db.state.staffList.find(s => s.name === cashier);
    if (staff) correctPin = staff.pin;
  } else {
    correctPin = PIN_MAP[cashier] || '1234';
  }

  let pinMatch = false;
  if (isHashPin(correctPin)) {
    pinMatch = (await sha256(enteredPin)) === correctPin;
  } else {
    pinMatch = enteredPin === correctPin;
  }

  if (pinMatch) {
    // Authentication successful
    playSfx('sfxSuccess');
    
    // Check if cashier has active shift
    if (!db.state.shifts) db.state.shifts = [];
    const activeShift = db.state.shifts.find(s => s.status === 'Active' && s.cashier === cashier);
    if (!activeShift) {
      openBukaShiftModal(cashier);
      return;
    }

    const screen = document.getElementById('lockScreen');
    if (screen) {
      screen.style.transform = 'translateY(-100%)';
      setTimeout(() => { screen.style.display = 'none'; }, 400);
    }

    // Set active cashier
    if (!db.state) db.state = {};
    db.state.activeCashier = cashier;
    db.save();

    // Update header shift cashier name
    const cashierEl = document.getElementById('headerShiftName');
    if (cashierEl) cashierEl.textContent = cashier;

    // Trigger toast notification
    toast('Access Granted', `Selamat bertugas, ${cashier}!`, 'success');

    // Apply RBAC: Show/Hide tabs based on Role
    applyRoleBasedAccess(cashier);

    // Redirect to profile page automatically
    switchTab('profil');
  } else {
    // Authentication failed
    playSfx('sfxError');
    const container = document.querySelector('.lock-container');
    if (container) {
      container.classList.add('lock-shake');
      setTimeout(() => container.classList.remove('lock-shake'), 400);
    }
    toast('Access Denied', 'PIN yang Anda masukkan salah.', 'danger');
    clearPin();
  }
}

function applyRoleBasedAccess(cashier) {
  if (!db.state || !db.state.staffList) return;
  const staff = db.state.staffList.find(s => s.name === cashier);
  const isAdmin = staff && staff.role === 'Admin';

  // Hide/Show sidebar navigation links
  const adminTabs = ['pengaturan', 'keuangan', 'laporan'];
  adminTabs.forEach(tab => {
    const link = document.querySelector(`.sidebar-nav-link[data-tab="${tab}"]`);
    if (link) {
      link.style.display = isAdmin ? 'flex' : 'none';
    }
  });

  // Hide/Show Owner Portal sidebar link
  const ownerLink = document.getElementById('sidebarOwnerPortalLink');
  if (ownerLink) {
    ownerLink.style.display = isAdmin ? 'flex' : 'none';
  }

  // Hide/Show staff management panel inside Settings
  const staffPanel = document.getElementById('staffManagementPanel');
  if (staffPanel) {
    staffPanel.style.display = isAdmin ? 'block' : 'none';
  }
}

function updateShiftCashier(cashier) {
  if (!db.state.shifts) db.state.shifts = [];
  let activeShift = db.state.shifts.find(s => s.status === 'Active');
  if (activeShift) {
    activeShift.cashier = cashier;
  } else {
    db.state.shifts.push({
      id: uid('sh'),
      cashier: cashier,
      startTime: new Date().toISOString(),
      endTime: null,
      totalSales: 0,
      status: 'Active'
    });
  }
  db.save();
}

// =============================================
// STAFF MANAGEMENT & PROFILE SAYA LOGIC
// =============================================
let pinVisibilityState = {};

function initStaffAndProfile() {
  populateLockScreenCashiers();
  
  // Apply language on startup
  const startupLang = (db.state && db.state.settings && db.state.settings.language) || 'id';
  if (typeof applyLanguage === 'function') applyLanguage(startupLang, false);
  
  // Apply RBAC immediately for the loaded active cashier
  if (db.state && db.state.activeCashier) {
    applyRoleBasedAccess(db.state.activeCashier);
  }

  // Pre-load staff list if admin is active
  renderStaffList();
}

function generateRandomPin() {
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  const input = document.getElementById('newStaffPin');
  if (input) {
    input.value = pin;
  }
  playSfx('sfxClick');
}

function addNewStaff() {
  const nameInput = document.getElementById('newStaffName');
  const roleSelect = document.getElementById('newStaffRole');
  const pinInput = document.getElementById('newStaffPin');
  
  if (!nameInput || !roleSelect || !pinInput) return;
  
  const name = nameInput.value.trim();
  const role = roleSelect.value;
  const pin = pinInput.value;
  
  if (!name || !pin) {
    toast('Input Tidak Lengkap', 'Silakan isi nama dan generate PIN terlebih dahulu.', 'warning');
    playSfx('sfxError');
    return;
  }
  
  // Check for duplicates
  const exists = db.state.staffList.some(s => s.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    toast('Staff Sudah Terdaftar', 'Nama staff tersebut sudah ada di sistem.', 'warning');
    playSfx('sfxError');
    return;
  }
  
  const newStaff = {
    id: uid('st'),
    name: name,
    role: role,
    pin: pin
  };
  
  db.state.staffList.push(newStaff);
  db.save();
  syncProductsToServer();
  
  toast('Sukses', `Staff ${name} berhasil didaftarkan!`, 'success');
  playSfx('sfxSuccess');
  
  // Clear inputs
  nameInput.value = '';
  pinInput.value = '';
  
  renderStaffList();
  populateLockScreenCashiers();
}

function deleteStaff(id) {
  if (!db.state || !db.state.staffList) return;
  
  const staff = db.state.staffList.find(s => s.id === id);
  if (!staff) return;
  
  // Check if trying to delete themselves
  if (db.state.activeCashier === staff.name) {
    toast('Aksi Dilarang', 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.', 'danger');
    playSfx('sfxError');
    return;
  }
  
  // Check if deleting the last admin
  const admins = db.state.staffList.filter(s => s.role === 'Admin');
  if (staff.role === 'Admin' && admins.length <= 1) {
    toast('Aksi Dilarang', 'Harus ada minimal satu Admin di sistem.', 'danger');
    playSfx('sfxError');
    return;
  }
  
  if (confirm(`Apakah Anda yakin ingin menghapus staff ${staff.name}?`)) {
    db.state.staffList = db.state.staffList.filter(s => s.id !== id);
    db.save();
    syncProductsToServer();
    
    toast('Staff Dihapus', `Staff ${staff.name} telah dihapus.`, 'success');
    playSfx('sfxSuccess');
    
    renderStaffList();
    populateLockScreenCashiers();
  }
}

function togglePinReveal(id, btn) {
  pinVisibilityState[id] = !pinVisibilityState[id];
  const pinSpan = document.getElementById(`pin-display-${id}`);
  if (pinSpan) {
    const staff = db.state.staffList.find(s => s.id === id);
    if (staff) {
      pinSpan.textContent = pinVisibilityState[id] ? (isHashPin(staff.pin) ? '🔒 (protected)' : staff.pin) : '••••';
      btn.textContent = pinVisibilityState[id] ? '🔒 Hide' : '👁️ Show';
    }
  }
  playSfx('sfxClick');
}

function renderStaffList() {
  const tbody = document.getElementById('staffListTableBody');
  if (!tbody || !db.state || !db.state.staffList) return;
  
  if (!db.state.staffList.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">Tidak ada staff terdaftar.</td></tr>`;
    return;
  }
  
  tbody.innerHTML = db.state.staffList.map(s => {
    const isVisible = pinVisibilityState[s.id] || false;
    const pinText = isVisible ? s.pin : '••••';
    const toggleText = isVisible ? '🔒 Hide' : '👁️ Show';
    const badgeClass = s.role === 'Admin' ? 'staff-role-badge admin' : 'staff-role-badge kasir';
    
    return `
      <tr>
        <td class="pl-2" style="font-weight:600; color:#fff;">${s.name}</td>
        <td><span class="${badgeClass}">${s.role}</span></td>
        <td>
          <div style="display:flex; align-items:center;">
            <span id="pin-display-${s.id}" style="font-family:monospace; font-weight:700; font-size:1.1rem; letter-spacing:1px; color:#fff;">${pinText}</span>
            <button class="eye-btn" onclick="togglePinReveal('${s.id}', this)" style="font-size:10px; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:4px; border:1px solid var(--border-subtle); margin-left:8px; color:var(--text-secondary);">${toggleText}</button>
          </div>
        </td>
        <td class="text-right pr-2">
          <button class="glass-btn glass-btn-sm" onclick="deleteStaff('${s.id}')" style="background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.2); color:var(--danger); font-size:10px; padding:4px 8px;">Hapus</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ─── Integration: CasirPRO Modules ────────────────────────────────────
function initOfflineSupport() {
  if (typeof CasirDB !== 'undefined') {
    CasirDB.open().catch(e => console.warn('CasirDB open:', e));
  }
  if (typeof initOfflineDetection === 'function') {
    initOfflineDetection();
  }
}

function initCasirPROPromo() {
  if (typeof CasirPromo !== 'undefined') {
    CasirPromo.init();
    updatePromoBadge();
  }
}

function initCasirPROStaff() {
  if (typeof CasirStaff !== 'undefined') {
    CasirStaff.init();
  }
}

function initCasirPROReports() {
  // Reports module is utilized in render calls
}

function initCasirPROPayment() {
  // Payment module is utilized in checkout flow
}

function initCasirPROPrinter() {
  // Printer module is utilized in receipt printing
}

function initCasirPROWhatsApp() {
  // WhatsApp module is utilized in order/receipt flow
}

function updatePromoBadge() {
  if (typeof CasirPromo === 'undefined') return;
  const badge = document.getElementById('promoCountBadge');
  if (badge) {
    const active = CasirPromo.promos.filter(p => p.active !== false).length;
    badge.textContent = active;
  }
}

function renderPromoSection() {
  if (typeof CasirPromo === 'undefined') return;
  CasirPromo.init();

  const tbody = document.getElementById('promoTbody');
  if (!tbody) return;

  if (!CasirPromo.promos.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-muted);">Belum ada promo. Klik "Buat Promo Baru" untuk memulai.</td></tr>';
    updatePromoBadge();
    document.getElementById('promoStats')?.querySelector('.stat-value') && (document.getElementById('promoActiveCount').textContent = '0');
    return;
  }

  const now = Date.now();
  const activePromos = CasirPromo.promos.filter(p => p.active !== false);
  document.getElementById('promoActiveCount').textContent = activePromos.length;

  tbody.innerHTML = CasirPromo.promos.map((p, i) => {
    const isActive = p.active !== false && new Date(p.startDate || 0).getTime() <= now && new Date(p.endDate || '2099-12-31').getTime() >= now;
    const typeLabels = { percentage: `Diskon ${p.value}%`, nominal: `Rp ${(p.value||0).toLocaleString('id-ID')}`, buy_x_get_y: 'Buy X Get Y', bundle: 'Bundle' };
    return `<tr>
      <td class="pl-4" style="font-weight:600;">${p.name}</td>
      <td><span style="background:var(--accent);color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">${typeLabels[p.type] || p.type}</span></td>
      <td>${p.type === 'percentage' ? p.value + '%' : p.type === 'nominal' ? 'Rp ' + (p.value||0).toLocaleString('id-ID') : '-'}</td>
      <td style="font-size:12px;">${p.startDate ? new Date(p.startDate).toLocaleDateString('id-ID') : '-'} &ndash; ${p.endDate ? new Date(p.endDate).toLocaleDateString('id-ID') : '-'}</td>
      <td>${p.minPurchase ? 'Rp ' + p.minPurchase.toLocaleString('id-ID') : '-'}</td>
      <td>${isActive ? '<span style="color:var(--success);font-weight:600;">🟢 Aktif</span>' : '<span style="color:var(--text-muted);">🔴 Nonaktif</span>'}</td>
      <td class="text-right pr-4">
        <button class="glass-btn glass-btn-sm" onclick="CasirPromo.remove('${p.id}');renderPromoSection();" style="background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.2);color:var(--danger);font-size:10px;padding:4px 8px;">Hapus</button>
      </td>
    </tr>`;
  }).join('');

  updatePromoBadge();

  // Populate broadcast dropdown
  const select = document.getElementById('promoBroadcastSelect');
  if (select) {
    select.innerHTML = '<option value="">-- Pilih Promo --</option>' +
      activePromos.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  }
}

function showPromoForm() {
  if (typeof CasirPromo === 'undefined') return;
  CasirPromo.showAddForm(() => { renderPromoSection(); toast('Promo berhasil ditambahkan', '', 'success'); });
}

function broadcastPromo() {
  const select = document.getElementById('promoBroadcastSelect');
  if (!select || !select.value) return toast('Pilih promo terlebih dahulu', '', 'warning');
  const promo = CasirPromo.promos.find(p => p.id === select.value);
  if (!promo) return;
  try {
    if (typeof CasirWA !== 'undefined' && typeof CasirWA.broadcast === 'function') {
      CasirWA.broadcast(promo);
      toast('Broadcast promo dikirim via WhatsApp', '', 'success');
    } else {
      throw new Error('CasirWA.broadcast not available');
    }
  } catch (e) {
    // Fallback: open wa.me with promo message
    const msg = encodeURIComponent(`Halo! Ada promo menarik dari kami: ${promo.name}\n${promo.description || ''}\n\nDiskon: ${promo.type === 'percentage' ? promo.value + '%' : 'Rp ' + (promo.value||0).toLocaleString('id-ID')}\nBerlaku sampai: ${promo.endDate ? new Date(promo.endDate).toLocaleDateString('id-ID') : 'Sekarang'}\n\nKunjungi toko kami!`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }
}

function renderStaffSection() {
  const tbody = document.getElementById('staffTbody');
  if (!tbody || !db.state || !db.state.staffList) return;

  const staffList = db.state.staffList || [];
  if (typeof CasirStaff !== 'undefined') CasirStaff.init();

  document.getElementById('staffTotalCount').textContent = staffList.length;

  // Count present today
  let presentCount = 0;
  if (typeof CasirStaff !== 'undefined') {
    const today = new Date().toISOString().split('T')[0];
    const todayRecs = CasirStaff.attendance.filter(a => a.date === today);
    presentCount = todayRecs.length;
  }
  document.getElementById('staffPresentCount').textContent = presentCount;

  const badge = document.getElementById('staffCountBadge');
  if (badge) badge.textContent = staffList.length;

  // Commission total
  const transactions = db.state.transactions || [];
  let totalCommission = 0;
  if (typeof CasirStaff !== 'undefined') {
    staffList.forEach(s => {
      const calc = CasirStaff.calculateCommission(transactions, s.id);
      totalCommission += calc.commission;
    });
  }
  document.getElementById('staffCommissionTotal').textContent = 'Rp ' + totalCommission.toLocaleString('id-ID');

  if (!staffList.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-muted);">Belum ada karyawan. Tambah melalui menu Pengaturan > Staff.</td></tr>';
    return;
  }

  tbody.innerHTML = staffList.map(s => {
    const todayRec = typeof CasirStaff !== 'undefined' ? CasirStaff.getToday(s.id) : null;
    const isClockedIn = todayRec && !todayRec.clockOut;
    const status = isClockedIn ? '<span style="color:var(--success);font-weight:600;">🟢 Hadir</span>' :
      todayRec ? '<span style="color:var(--text-muted);">✅ Selesai</span>' :
      '<span style="color:var(--text-muted);">⚪ Tidak Hadir</span>';
    const commission = typeof CasirStaff !== 'undefined' ? CasirStaff.calculateCommission(transactions, s.id).commission : 0;
    return `<tr>
      <td class="pl-4" style="font-weight:600;">${s.name}</td>
      <td><span style="background:${s.role === 'Admin' ? 'var(--accent)' : 'var(--primary)'};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">${s.role || 'Staff'}</span></td>
      <td>${s.phone || '-'}</td>
      <td>${status}</td>
      <td>${todayRec ? '✅' : '—'}</td>
      <td>Rp ${commission.toLocaleString('id-ID')}</td>
      <td class="text-right pr-4">
        <button class="glass-btn glass-btn-sm" onclick="CasirStaff.clockIn('${s.id}','${s.name}');renderStaffSection();" style="font-size:10px;padding:4px 8px;${isClockedIn ? 'background:rgba(239,68,68,0.1);color:var(--danger);' : 'background:rgba(16,185,129,0.1);color:var(--success);'}">${isClockedIn ? 'Clock Out' : 'Clock In'}</button>
      </td>
    </tr>`;
  }).join('');
}

function renderStaffClockUI() {
  const panel = document.getElementById('staffClockPanel');
  if (!panel) return;
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  if (panel.style.display === 'none') return;
  
  const tbody = document.getElementById('staffClockTbody');
  if (!tbody || !db.state || !db.state.staffList) return;
  
  if (typeof CasirStaff === 'undefined') {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted);">Modul Karyawan tidak tersedia</td></tr>';
    return;
  }
  
  CasirStaff.init();
  const today = new Date().toISOString().split('T')[0];
  const todayRecs = CasirStaff.attendance.filter(a => a.date === today);
  
  if (!todayRecs.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted);">Belum ada absensi hari ini</td></tr>';
    return;
  }
  
  tbody.innerHTML = todayRecs.map(r => {
    const staff = db.state.staffList.find(s => s.id === r.staffId);
    const name = staff ? staff.name : r.staffName || 'Unknown';
    const isClockedIn = !r.clockOut;
    return `<tr>
      <td class="pl-4" style="font-weight:600;">${name}</td>
      <td>${r.clockIn ? new Date(r.clockIn).toLocaleTimeString('id-ID') : '-'}</td>
      <td>${r.clockOut ? new Date(r.clockOut).toLocaleTimeString('id-ID') : '-'}</td>
      <td>${isClockedIn ? '<span style="color:var(--success);">🟢 Hadir</span>' : '<span style="color:var(--text-muted);">✅ Selesai</span>'}</td>
      <td class="text-right pr-4">
        ${isClockedIn ? `<button class="glass-btn glass-btn-sm" onclick="CasirStaff.clockOut('${r.staffId}');renderStaffClockUI();renderStaffSection();" style="background:rgba(239,68,68,0.1);color:var(--danger);font-size:10px;padding:4px 8px;">Clock Out</button>` : '<span style="font-size:10px;color:var(--text-muted);">Selesai</span>'}
      </td>
    </tr>`;
  }).join('');
}

function showStaffForm() {
  // Navigate to settings where staff management is
  switchTab('pengaturan');
  setTimeout(() => {
    const panel = document.getElementById('staffManagementPanel');
    if (panel) {
      panel.style.display = 'block';
      panel.scrollIntoView({ behavior: 'smooth' });
    }
  }, 300);
}

function renderProfilePage() {
  const activeUser = db.state.activeCashier;
  if (!activeUser || !db.state.staffList) return;
  
  const staff = db.state.staffList.find(s => s.name === activeUser);
  if (!staff) return;
  
  // Set Profile Name and Role Badge
  const profileNameEl = document.getElementById('profileName');
  const profileRoleEl = document.getElementById('profileRole');
  const profileAvatarEl = document.getElementById('profileAvatar');
  
  if (profileNameEl) profileNameEl.textContent = staff.name;
  if (profileRoleEl) {
    profileRoleEl.textContent = staff.role;
    profileRoleEl.style.background = staff.role === 'Admin' ? 'var(--accent)' : 'var(--primary)';
    profileRoleEl.style.color = staff.role === 'Admin' ? '#000' : '#fff';
  }
  if (profileAvatarEl) {
    profileAvatarEl.textContent = staff.role === 'Admin' ? '👑' : '🧑‍💻';
    profileAvatarEl.style.borderColor = staff.role === 'Admin' ? 'var(--accent)' : 'var(--primary)';
  }
  
  // Get active shift
  let shiftStart = '-';
  let shiftTxn = 0;
  let shiftSales = 0;
  
  const activeShift = db.state.shifts ? db.state.shifts.find(s => s.status === 'Active' && s.cashier === activeUser) : null;
  if (activeShift) {
    shiftStart = new Date(activeShift.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' (' + new Date(activeShift.startTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ')';
    
    // Calculate transactions done by this cashier since shift started
    const startTimeISO = activeShift.startTime;
    const cashTxns = db.state.transactions.filter(t => t.cashier === activeUser && t.date >= startTimeISO);
    
    shiftTxn = cashTxns.length;
    shiftSales = cashTxns.reduce((sum, t) => sum + t.total, 0);
  }
  
  const shiftStartEl = document.getElementById('profileShiftStart');
  const shiftTxnEl = document.getElementById('profileShiftTxn');
  const shiftSalesEl = document.getElementById('profileShiftSales');
  
  if (shiftStartEl) shiftStartEl.textContent = shiftStart;
  if (shiftTxnEl) shiftTxnEl.textContent = `${shiftTxn} Transaksi`;
  if (shiftSalesEl) shiftSalesEl.textContent = rp(shiftSales);
}

async function changePersonalPin() {
  const currentPinInput = document.getElementById('currentPinInput');
  const newPinInput = document.getElementById('newPinInput');
  const confirmNewPinInput = document.getElementById('confirmNewPinInput');
  
  if (!currentPinInput || !newPinInput || !confirmNewPinInput) return;
  
  const currentPin = currentPinInput.value;
  const newPin = newPinInput.value;
  const confirmPin = confirmNewPinInput.value;
  
  if (currentPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
    toast('Format PIN Salah', 'PIN harus berupa 4 digit angka.', 'warning');
    playSfx('sfxError');
    return;
  }
  
  if (!/^\d+$/.test(newPin)) {
    toast('Format PIN Salah', 'PIN hanya boleh berisi angka.', 'warning');
    playSfx('sfxError');
    return;
  }
  
  const activeUser = db.state.activeCashier;
  const staff = db.state.staffList.find(s => s.name === activeUser);
  if (!staff) return;
  
  // Verify current PIN (supports both hashed and plaintext)
  let currentOk = false;
  if (isHashPin(staff.pin)) {
    currentOk = (await sha256(currentPin)) === staff.pin;
  } else {
    currentOk = staff.pin === currentPin;
  }
  if (!currentOk) {
    toast('Autentikasi Gagal', 'PIN lama yang Anda masukkan salah.', 'danger');
    playSfx('sfxError');
    return;
  }
  
  // Verify new PIN matches confirm PIN
  if (newPin !== confirmPin) {
    toast('Konfirmasi Salah', 'PIN baru dan Konfirmasi PIN tidak cocok.', 'warning');
    playSfx('sfxError');
    return;
  }
  
  // Save new PIN (hash if the existing format uses hashes)
  staff.pin = isHashPin(staff.pin) ? await sha256(newPin) : newPin;
  db.save();
  syncProductsToServer();
  
  toast('Sukses', 'PIN Keamanan Anda berhasil diubah!', 'success');
  playSfx('sfxSuccess');
  
  // Clear inputs
  currentPinInput.value = '';
  newPinInput.value = '';
  confirmNewPinInput.value = '';
}

// Patch enhanceSettings to initialize staff list & profile features
const _origEnhanceSettingsMore = enhanceSettings;
enhanceSettings = function() {
  if (typeof _origEnhanceSettingsMore === 'function') _origEnhanceSettingsMore();
  try { initStaffAndProfile(); } catch(e) { console.error('initStaffAndProfile error:', e); }
};

// =============================================
// MULTI-LANGUAGE TRANSLATION (ID, EN, ZH)
// =============================================
const TRANSLATIONS = {
  id: {
    // Sidebar
    kiosk: "🛍️ Kiosk",
    dashboard: "Dashboard",
    pos: "POS Terminal",
    products: "Produk & Stok",
    purchase: "Pembelian",
    crm: "VIP CRM",
    finance: "Keuangan",
    reports: "Laporan",
    store: "🌐 Toko Online",
    profile: "🧑‍💻 Profile Saya",
    settings: "⚙️ Pengaturan",
    queue_tab: "🎫 Antrean",
    owner_portal: "👑 Dashboard Owner",
    
    // Header
    locked_title: "CasirPRO Terkunci",
    locked_subtitle: "Pilih Kasir & Masukkan 4-Digit PIN Prioritas",
    active_cashier: "Kasir Aktif",
    
    // Profile
    profile_title: "Profile Saya",
    profile_subtitle: "Shift aktif, statistik penjualan personal, dan kelola PIN keamanan Anda",
    profile_details: "💼 Detail Personal & Shift",
    profile_shift_start: "Shift Dimulai:",
    profile_shift_txn: "Transaksi Shift Ini:",
    profile_shift_sales: "Total Omset Shift Ini:",
    security_title: "🔐 Ubah PIN Keamanan",
    current_pin: "PIN Saat Ini",
    new_pin: "PIN Baru",
    confirm_pin: "Konfirmasi PIN Baru",
    update_pin_btn: "Update PIN Baru",
    
    // Settings & Staff
    settings_title: "System Settings",
    settings_subtitle: "Configure store profile, tax rates, printers, and system preferences",
    store_config: "Konfigurasi Toko",
    keyboard_shortcuts: "Keyboard Shortcuts",
    server_connection: "🔗 Server Connection",
    online_store_settings: "🌐 Online Store",
    payment_info: "Info Pembayaran Transfer",
    danger_zone: "Danger Zone",
    staff_panel_title: "👥 Kelola Staff & Kasir",
    add_staff_title: "Daftarkan Staff Baru",
    staff_name_label: "Nama Lengkap Staff",
    staff_role_label: "Role / Akses",
    staff_pin_label: "PIN Awal",
    generate_pin_btn: "🎲 Acak",
    register_staff_btn: "Daftarkan Staff",
    staff_list_title: "Daftar Staff Aktif",
    
    // Settings forms
    company_name: "Nama Perusahaan",
    branch_store_name: "Nama Cabang / Toko",
    tax_rate: "Tarif Pajak (PPN %)",
    currency: "Mata Uang",
    language_label: "Bahasa / Language",
    auto_whatsapp: "Kirim Struk WhatsApp Otomatis",
    save_settings: "Simpan Pengaturan",
    server_status: "Status Server",
    server_enabled: "Aktifkan koneksi server",
    ws_url: "WebSocket URL",
    http_url: "HTTP API URL",
    test_conn: "Test Koneksi",
    sync_data: "Sync Data",
    online_store_name: "Nama Toko Online",
    store_wa: "No. WA Toko (untuk customer)",
    rajaongkir_key: "RajaOngkir API Key",
    origin_city: "Kota Asal (origin) — ID Kota RajaOngkir",
    payment_info_settings: "Info Pembayaran Transfer",
    bank_name: "Nama Bank",
    bank_account: "Nomor Rekening",
    bank_holder: "Atas Nama",
    danger_zone_title: "Danger Zone",
    danger_zone_subtitle: "Reset database ke pengaturan pabrik. Ini akan menghapus semua transaksi, produk, dan pengaturan.",
    reset_db_btn: "Reset Database",

    // Dashboard
    dashboard_subtitle: "Real-time business intelligence & ringkasan operasional",
    export: "Ekspor",
    refresh: "Muat Ulang",
    today_revenue: "Omset Hari Ini",
    net_profit_today: "Profit Bersih Hari Ini",
    monthly_revenue: "Omset Bulan Ini",
    avg_ticket_size: "Rata-rata Transaksi",
    low_stock_alert: "Stok Hampir Habis",
    sales_profit_trend: "Tren Penjualan & Profit",
    revenue_by_category: "Pendapatan per Kategori",
    top_products: "Produk Terlaris",
    low_stock_critical: "Peringatan Stok Rendah",
    recent_transactions: "Transaksi Terakhir",
    days_7: "7 Hari Terakhir",
    share: "Porsi",
    best_sellers: "Terlaris",
    critical: "Kritis",
    latest: "Terbaru",
    transactions_count: "{count} Transaksi",
    orders_count: "{count} Pesanan",
    items_count: "{count} Item",
    no_data: "Tidak ada data",
    all_stock_healthy: "✓ Semua tingkat stok aman",
    left_suffix: "{count} sisa",
    restock_btn: "Isi Stok",
    no_sales_yet: "Belum ada penjualan",
    walk_in_guest: "Pelanggan Umum",
    
    // POS Terminal
    pos_search_placeholder: "Cari produk, SKU, atau scan barcode...",
    cart_title: "Keranjang",
    subtotal: "Subtotal",
    discount: "Diskon",
    tax: "PPN (11%)",
    total: "Total",
    hold: "Tahan",
    clear: "Bersihkan",
    pay_btn: "Bayar {total}",
    no_products_found: "Produk tidak ditemukan",
    low_badge: "Tipis",
    stock_label: "Stok: ",
    empty_cart: "Keranjang Kosong",
    select_products_to_start: "Pilih produk untuk memulai",
    out_of_stock: "Stok Habis",
    has_0_stock: "{name} memiliki stok 0.",
    limit_warning: "Batas Stok",
    only_available: "Hanya tersedia {count} unit.",
    added_toast: "Ditambahkan",
    added_msg: "{name} x1",
    cart_held: "Keranjang Ditahan",
    saved_as_draft: "Transaksi disimpan sebagai draf.",
    restocked_title: "Stok Diisi",
    restocked_msg: "{name} berhasil diisi menjadi {stock}.",

    // Checkout Modal & Payments
    payment_title: "Pembayaran",
    total_bill: "Total Tagihan",
    cash: "Tunai",
    qris: "QRIS",
    debit: "Debit",
    split: "Gabungan (Split)",
    amount_received: "Jumlah Uang Diterima",
    exact: "Pas",
    change_label: "Kembalian:",
    qris_gateway: "Gerbang Pembayaran Premium CasirPay",
    qris_expires: "Kedaluwarsa dalam {time}",
    cash_portion: "Porsi Tunai",
    qris_portion: "Porsi QRIS",
    allocated_label: "Dialokasikan:",
    balanced: "Seimbang (Pas)",
    card_number: "Nomor Kartu",
    amount: "Jumlah",
    cancel: "Batal",
    pay_now: "Bayar Sekarang",
    print_receipt: "Cetak Struk",
    download: "Unduh",
    close: "Tutup",
    receipt_cashier: "Kasir",
    receipt_customer: "Pelanggan",
    receipt_thanks: "TERIMA KASIH ATAS KUNJUNGAN ANDA",

    // Products view
    products_title: "Produk & Inventaris",
    products_subtitle: "Kelola katalog produk, tingkat stok, dan mutasi barang",
    stock_in: "Stok Masuk",
    stock_out: "Stok Keluar",
    add_product: "Tambah Produk",
    search_products_placeholder: "Cari berdasarkan nama, SKU, barcode, kategori...",
    th_product_sku: "Produk / SKU",
    th_category: "Kategori",
    th_barcode: "Barcode",
    th_cost: "Harga Modal",
    th_retail: "Harga Jual",
    th_stock: "Stok",
    th_actions: "Aksi",
    edit_btn: "Ubah",
    delete_btn: "Hapus",
    invalid_qty: "Jumlah tidak valid.",
    received: "Diterima",
    issued: "Dikeluarkan",

    // Purchases view
    purchase_title: "Pembelian & Pengadaan",
    purchase_subtitle: "Kelola pesanan pembelian, data supplier, dan alur pengadaan",
    add_supplier: "Tambah Supplier",
    add_purchase: "Purchase Order Baru",
    suppliers: "Supplier",
    purchase_orders: "Pesanan Pembelian",
    th_name: "Nama",
    th_contact: "Kontak",
    th_po: "PO #",
    th_date: "Tanggal",
    th_status: "Status",
    th_total: "Total",
    supplier_added: "Supplier berhasil ditambahkan.",
    po_created: "PO Berhasil Dibuat",
    no_suppliers: "Tidak ada supplier",
    no_purchase_orders: "Tidak ada pesanan pembelian",
    confirm_delete_supplier: "Hapus supplier ini?",

    // CRM View
    crm_title: "VIP CRM & Loyalitas",
    crm_subtitle: "Kelola pelanggan premium, tingkat reward, dan analisis loyalitas",
    register_vip: "Daftarkan Anggota VIP",
    search_customers_placeholder: "Cari berdasarkan nama, nomor telepon, tier...",
    th_card_no: "No Kartu",
    th_phone: "Telepon",
    th_points: "Poin",
    th_ltv: "LTV",
    no_members_found: "Anggota tidak ditemukan",
    since_label: "Sejak",
    no_vip_cards: "Tidak ada kartu VIP untuk ditampilkan",
    confirm_delete_vip: "Hapus anggota VIP ini?",

    // Finance View
    finance_title: "Keuangan & Kas",
    finance_subtitle: "Pemantauan arus kas, pelacakan pengeluaran, dan analitik finansial",
    add_expense: "Tambah Pengeluaran",
    expense_log: "Log Pengeluaran",
    operational: "Operasional",
    th_description: "Deskripsi",
    th_amount: "Jumlah",
    expense_recorded: "Pengeluaran berhasil dicatat.",

    // Reports View
    reports_title: "Laporan & Analitik",
    reports_subtitle: "Riwayat transaksi lengkap, jejak audit, dan intelijen bisnis",
    export_csv: "Ekspor CSV",
    search_reports_placeholder: "Cari berdasarkan nomor invoice, pelanggan, atau metode pembayaran...",
    th_invoice: "Invoice",
    th_datetime: "Tanggal/Waktu",
    th_customer: "Pelanggan",
    th_payment: "Pembayaran",
    no_transactions: "Tidak ada transaksi",
    view_btn: "Lihat",

    // Shortcuts descriptions
    shortcut_focus: "Fokus Pencarian",
    shortcut_new_txn: "Transaksi Baru",
    shortcut_checkout: "Bayar / Checkout",
    shortcut_refresh: "Muat Ulang",
    shortcut_print: "Cetak Struk",
    shortcut_fs: "Layar Penuh POS",
    shortcut_close: "Tutup Modal",
    shortcut_qty: "Sesuaikan Qty",

    // Placeholders
    store_name_placeholder: "CasirStore",
    store_wa_placeholder: "6281234567890",
    rajaongkir_key_placeholder: "Masukkan API key RajaOngkir",
    origin_city_placeholder: "151 (Jakarta)",
    bank_name_placeholder: "BCA",
    bank_acc_placeholder: "1234567890",
    bank_holder_placeholder: "Atas Nama",
    th_product: "Produk",
    th_sold: "Terjual",
    th_revenue: "Pendapatan",

    // Roles and staff management
    role_admin: "Pemilik / Administrator",
    role_cashier: "Staf Kasir / Operator",
    welcome_msg: "Selamat bertugas, {name}!",
    no_staff_registered: "Tidak ada staff terdaftar.",
    hide_pin: "🔒 Sembunyikan",
    show_pin: "👁️ Tampilkan",
    
    // Messages / Toasts
    access_granted: "Akses Diberikan",
    access_denied: "Akses Ditolak",
    wrong_pin: "PIN yang Anda masukkan salah.",
    success: "Sukses",
    failed: "Gagal",
    saved: "Tersimpan",
    deleted: "Dihapus",
    promo: '🏷️ Promo',
    karyawan: '👥 Karyawan',
    loyalty_driven: 'Loyalty Driven',
    restock_required: 'Butuh Stok',
    th_supplier: 'Supplier',
    th_tier: 'Tier'
  },
  en: {
    // Sidebar
    kiosk: "🛍️ Kiosk",
    dashboard: "Dashboard",
    pos: "POS Terminal",
    products: "Products & Stock",
    purchase: "Purchases",
    crm: "VIP CRM",
    finance: "Finance",
    reports: "Reports",
    store: "🌐 Online Store",
    profile: "🧑‍💻 My Profile",
    settings: "⚙️ Settings",
    queue_tab: "🎫 Queue",
    owner_portal: "👑 Owner Dashboard",
    
    // Header
    locked_title: "CasirPRO Locked",
    locked_subtitle: "Select Cashier & Enter 4-Digit PIN",
    active_cashier: "Active Cashier",
    
    // Profile
    profile_title: "My Profile",
    profile_subtitle: "Active shift, personal sales stats, and manage security PIN",
    profile_details: "💼 Personal & Shift Details",
    profile_shift_start: "Shift Started:",
    profile_shift_txn: "Shift Transactions:",
    profile_shift_sales: "Total Shift Revenue:",
    security_title: "🔐 Change Security PIN",
    current_pin: "Current PIN",
    new_pin: "New PIN",
    confirm_pin: "Confirm New PIN",
    update_pin_btn: "Update Security PIN",
    
    // Settings & Staff
    settings_title: "System Settings",
    settings_subtitle: "Configure store profile, tax rates, printers, and system preferences",
    store_config: "Store Configuration",
    keyboard_shortcuts: "Keyboard Shortcuts",
    server_connection: "🔗 Server Connection",
    online_store_settings: "🌐 Online Store",
    payment_info: "Transfer Payment Info",
    danger_zone: "Danger Zone",
    staff_panel_title: "👥 Manage Staff & Cashiers",
    add_staff_title: "Register New Staff",
    staff_name_label: "Staff Full Name",
    staff_role_label: "Role / Access",
    staff_pin_label: "Initial PIN",
    generate_pin_btn: "🎲 Random",
    register_staff_btn: "Register Staff",
    staff_list_title: "Active Staff Directory",
    
    // Settings forms
    company_name: "Company Name",
    branch_store_name: "Branch / Store Name",
    tax_rate: "Tax Rate (PPN %)",
    currency: "Currency",
    language_label: "Language / Bahasa",
    auto_whatsapp: "Auto WhatsApp Receipt",
    save_settings: "Save Settings",
    server_status: "Server Status",
    server_enabled: "Enable server connection",
    ws_url: "WebSocket URL",
    http_url: "HTTP API URL",
    test_conn: "Test Connection",
    sync_data: "Sync Data",
    online_store_name: "Online Store Name",
    store_wa: "Store WA No. (for customer)",
    rajaongkir_key: "RajaOngkir API Key",
    origin_city: "Origin City ID (RajaOngkir)",
    payment_info_settings: "Transfer Payment Info",
    bank_name: "Bank Name",
    bank_account: "Account Number",
    bank_holder: "Account Holder",
    danger_zone_title: "Danger Zone",
    danger_zone_subtitle: "Reset database to factory defaults. This will erase all transactions, products, and settings.",
    reset_db_btn: "Reset Database",

    // Dashboard
    dashboard_subtitle: "Real-time business intelligence & operational overview",
    export: "Export",
    refresh: "Refresh",
    today_revenue: "Today's Revenue",
    net_profit_today: "Net Profit Today",
    monthly_revenue: "Monthly Revenue",
    avg_ticket_size: "Avg Ticket Size",
    low_stock_alert: "Low Stock Alert",
    sales_profit_trend: "Sales & Profit Trend",
    revenue_by_category: "Revenue by Category",
    top_products: "Top Products",
    low_stock_critical: "Low Stock Alert",
    recent_transactions: "Recent Transactions",
    days_7: "7 Days",
    share: "Share",
    best_sellers: "Best Sellers",
    critical: "Critical",
    latest: "Latest",
    transactions_count: "{count} Transactions",
    orders_count: "{count} Orders",
    items_count: "{count} Items",
    no_data: "No data",
    all_stock_healthy: "✓ All stock levels healthy",
    left_suffix: "{count} left",
    restock_btn: "Restock",
    no_sales_yet: "No sales yet",
    walk_in_guest: "Walk-in Guest",
    
    // POS Terminal
    pos_search_placeholder: "Search product, SKU, or scan barcode...",
    cart_title: "Cart",
    subtotal: "Subtotal",
    discount: "Discount",
    tax: "Tax (11%)",
    total: "Total",
    hold: "Hold",
    clear: "Clear",
    pay_btn: "Pay {total}",
    no_products_found: "No products found",
    low_badge: "Low",
    stock_label: "Stock: ",
    empty_cart: "Cart is empty",
    select_products_to_start: "Select products to start",
    out_of_stock: "Out of Stock",
    has_0_stock: "{name} has 0 stock.",
    limit_warning: "Limit",
    only_available: "Only {count} available.",
    added_toast: "Added",
    added_msg: "{name} x1",
    cart_held: "Cart Held",
    saved_as_draft: "Transaction saved as draft.",
    restocked_title: "Restocked",
    restocked_msg: "{name} replenished to {stock}.",

    // Checkout Modal & Payments
    payment_title: "Payment",
    total_bill: "Total Bill",
    cash: "Cash",
    qris: "QRIS",
    debit: "Debit",
    split: "Split",
    amount_received: "Amount Received",
    exact: "Exact",
    change_label: "Change:",
    qris_gateway: "CasirPay Premium Gateway",
    qris_expires: "Expires in {time}",
    cash_portion: "Cash Portion",
    qris_portion: "QRIS Portion",
    allocated_label: "Allocated:",
    balanced: "Balanced",
    card_number: "Card Number",
    amount: "Amount",
    cancel: "Cancel",
    pay_now: "Pay Now",
    print_receipt: "Print Receipt",
    download: "Download",
    close: "Close",
    receipt_cashier: "Cashier",
    receipt_customer: "Customer",
    receipt_thanks: "THANK YOU FOR YOUR PATRONAGE",

    // Products view
    products_title: "Products & Inventory",
    products_subtitle: "Manage product catalog, stock levels, and inventory movements",
    stock_in: "Stock In",
    stock_out: "Stock Out",
    add_product: "Add Product",
    search_products_placeholder: "Search by name, SKU, barcode, category...",
    th_product_sku: "Product / SKU",
    th_category: "Category",
    th_barcode: "Barcode",
    th_cost: "Cost Price",
    th_retail: "Retail Price",
    th_stock: "Stock",
    th_actions: "Actions",
    edit_btn: "Edit",
    delete_btn: "Delete",
    invalid_qty: "Invalid quantity.",
    received: "Received",
    issued: "Issued",

    // Purchases view
    purchase_title: "Purchasing & Procurement",
    purchase_subtitle: "Manage purchase orders, supplier records, and procurement workflows",
    add_supplier: "Add Supplier",
    add_purchase: "New Purchase Order",
    suppliers: "Suppliers",
    purchase_orders: "Purchase Orders",
    th_name: "Name",
    th_contact: "Contact",
    th_po: "PO #",
    th_date: "Date",
    th_status: "Status",
    th_total: "Total",
    supplier_added: "Supplier added.",
    po_created: "PO Created",
    no_suppliers: "No suppliers",
    no_purchase_orders: "No purchase orders",
    confirm_delete_supplier: "Delete supplier?",

    // CRM View
    crm_title: "VIP CRM & Loyalty",
    crm_subtitle: "Manage premium members, reward tiers, and loyalty analytics",
    register_vip: "Register VIP Member",
    search_customers_placeholder: "Search by name, phone, tier...",
    th_card_no: "Card No",
    th_phone: "Phone",
    th_points: "Points",
    th_ltv: "LTV",
    no_members_found: "No members found",
    since_label: "Since",
    no_vip_cards: "No VIP cards to display",
    confirm_delete_vip: "Remove VIP member?",

    // Finance View
    finance_title: "Finance & Treasury",
    finance_subtitle: "Cash flow monitoring, expense tracking, and financial analytics",
    add_expense: "Add Expense",
    expense_log: "Expense Log",
    operational: "Operational",
    th_description: "Description",
    th_amount: "Amount",
    expense_recorded: "Expense recorded.",

    // Reports View
    reports_title: "Reports & Analytics",
    reports_subtitle: "Complete transaction history, audit trails, and business intelligence",
    export_csv: "Export CSV",
    search_reports_placeholder: "Search by invoice, customer, or payment method...",
    th_invoice: "Invoice",
    th_datetime: "Date/Time",
    th_customer: "Customer",
    th_payment: "Payment",
    no_transactions: "No transactions",
    view_btn: "View",

    // Shortcuts descriptions
    shortcut_focus: "Focus Search",
    shortcut_new_txn: "New Transaction",
    shortcut_checkout: "Checkout",
    shortcut_refresh: "Refresh",
    shortcut_print: "Print Receipt",
    shortcut_fs: "Fullscreen POS",
    shortcut_close: "Close Modal",
    shortcut_qty: "Qty Adjust",

    // Placeholders
    store_name_placeholder: "CasirStore",
    store_wa_placeholder: "6281234567890",
    rajaongkir_key_placeholder: "Enter RajaOngkir API key",
    origin_city_placeholder: "151 (Jakarta)",
    bank_name_placeholder: "BCA",
    bank_acc_placeholder: "1234567890",
    bank_holder_placeholder: "Account Holder",
    th_product: "Product",
    th_sold: "Sold",
    th_revenue: "Revenue",

    // Roles and staff management
    role_admin: "Owner / Administrator",
    role_cashier: "Cashier Staff / Operator",
    welcome_msg: "Welcome to your shift, {name}!",
    no_staff_registered: "No staff registered.",
    hide_pin: "🔒 Hide",
    show_pin: "👁️ Show",
    
    // Messages / Toasts
    access_granted: "Access Granted",
    access_denied: "Access Denied",
    wrong_pin: "The PIN you entered is incorrect.",
    success: "Success",
    failed: "Failed",
    saved: "Saved",
    deleted: "Deleted",
    promo: '🏷️ Promo',
    karyawan: '👥 Staff',
    loyalty_driven: 'Loyalty Driven',
    restock_required: 'Restock Required',
    th_supplier: 'Supplier',
    th_tier: 'Tier'
  },
  zh: {
    // Sidebar
    kiosk: "🛍️ 自助终端",
    dashboard: "数据仪表板",
    pos: "收银系统",
    products: "产品与库存",
    purchase: "采购管理",
    crm: "VIP 客户关系",
    finance: "财务管理",
    reports: "交易报表",
    store: "🌐 线上商城",
    profile: "🧑‍💻 个人中心",
    settings: "⚙️ 系统设置",
    queue_tab: "🎫 排队取号",
    owner_portal: "👑 老板仪表盘",
    
    // Header
    locked_title: "CasirPRO 已锁定",
    locked_subtitle: "请选择收银员并输入4位安全密码",
    active_cashier: "当前收银员",
    
    // Profile
    profile_title: "个人中心",
    profile_subtitle: "查看当前当班时间、个人销售业绩，及修改安全密码",
    profile_details: "💼 个人信息与班次",
    profile_shift_start: "当班开始时间:",
    profile_shift_txn: "本次当班交易数:",
    profile_shift_sales: "本次当班销售总额:",
    security_title: "🔐 修改安全密码 (PIN)",
    current_pin: "当前密码",
    new_pin: "新密码",
    confirm_pin: "确认新密码",
    update_pin_btn: "更新密码",
    
    // Settings & Staff
    settings_title: "系统参数设置",
    settings_subtitle: "配置店铺资料、税率、打印机、及系统首选项",
    store_config: "店铺信息配置",
    keyboard_shortcuts: "快捷键说明",
    server_connection: "🔗 局域网同步服务器",
    online_store_settings: "🌐 线上网店参数",
    payment_info: "汇款账户信息",
    danger_zone: "危险区域 (数据重置)",
    staff_panel_title: "👥 员工与收银员管理",
    add_staff_title: "添加新员工",
    staff_name_label: "员工姓名",
    staff_role_label: "系统权限",
    staff_pin_label: "初始密码",
    generate_pin_btn: "🎲 随机",
    register_staff_btn: "确认添加",
    staff_list_title: "在职员工列表",
    
    // Settings forms
    company_name: "商户公司名称",
    branch_store_name: "分店名称",
    tax_rate: "增值税率 (PPN %)",
    currency: "记账币种",
    language_label: "选择系统语言 / Language",
    auto_whatsapp: "自动发送WhatsApp电子收据",
    save_settings: "保存系统设置",
    server_status: "服务器状态",
    server_enabled: "启用局域网连接",
    ws_url: "WebSocket URL",
    http_url: "HTTP API URL",
    test_conn: "测试连接",
    sync_data: "同步数据",
    online_store_name: "微商店前台名称",
    store_wa: "商户 WhatsApp 电话",
    rajaongkir_key: "RajaOngkir API 密钥",
    origin_city: "物流发货源城市 ID",
    payment_info_settings: "汇款账户信息",
    bank_name: "开户行",
    bank_account: "银行账号",
    bank_holder: "收款人姓名",
    danger_zone_title: "危险区域",
    danger_zone_subtitle: "重置本地数据库至出厂默认状态。该操作将清除所有交易流水、商品目录及系统配置。",
    reset_db_btn: "清空并重置数据库",

    // Dashboard
    dashboard_subtitle: "实时商业智能和运营概览",
    export: "数据导出",
    refresh: "刷新",
    today_revenue: "今日营业额",
    net_profit_today: "今日净利润",
    monthly_revenue: "本月营业额",
    avg_ticket_size: "平均客单价",
    low_stock_alert: "库存告急商品",
    sales_profit_trend: "销售与利润趋势",
    revenue_by_category: "按类别收入占比",
    top_products: "畅销商品排行",
    low_stock_critical: "库存告急提示",
    recent_transactions: "最新交易记录",
    days_7: "近7天趋势",
    share: "占比",
    best_sellers: "最热卖",
    critical: "紧急",
    latest: "最新",
    transactions_count: "{count} 笔交易",
    orders_count: "{count} 笔订单",
    items_count: "{count} 个商品",
    no_data: "暂无数据",
    all_stock_healthy: "✓ 所有商品库存充足",
    left_suffix: "剩余 {count}",
    restock_btn: "补货",
    no_sales_yet: "暂无销售记录",
    walk_in_guest: "普通散客",
    
    // POS Terminal
    pos_search_placeholder: "搜索商品名称、SKU或扫描条码...",
    cart_title: "购物车",
    subtotal: "小计",
    discount: "会员折扣",
    tax: "增值税 (11%)",
    total: "应付总计",
    hold: "挂单",
    clear: "清空",
    pay_btn: "支付 {total}",
    no_products_found: "未找到匹配商品",
    low_badge: "库存低",
    stock_label: "库存: ",
    empty_cart: "购物车是空的",
    select_products_to_start: "请选择商品开始交易",
    out_of_stock: "商品已售罄",
    has_0_stock: "{name} 库存不足。",
    limit_warning: "限购",
    only_available: "仅剩 {count} 件商品。",
    added_toast: "已添加",
    added_msg: "{name} x1",
    cart_held: "已挂单",
    saved_as_draft: "交易已存为草稿。",
    restocked_title: "已成功补货",
    restocked_msg: "{name} 的库存已成功补充至 {stock} 个。",

    // Checkout Modal & Payments
    payment_title: "收银结账",
    total_bill: "应付总额",
    cash: "现金支付",
    qris: "二维码扫码",
    debit: "银行卡",
    split: "组合支付 (Split)",
    amount_received: "实收金额 (Tunai)",
    exact: "刚好 (实付)",
    change_label: "找零:",
    qris_gateway: "CasirPay 高级扫码支付网关",
    qris_expires: "二维码在 {time} 后过期",
    cash_portion: "现金支付部分",
    qris_portion: "扫码支付部分",
    allocated_label: "已分配额:",
    balanced: "已结清",
    card_number: "卡号",
    amount: "金额",
    cancel: "取消",
    pay_now: "立即结账",
    print_receipt: "打印小票",
    download: "下载小票",
    close: "关闭",
    receipt_cashier: "收银员",
    receipt_customer: "顾客姓名",
    receipt_thanks: "感谢您的光临与支持",

    // Products view
    products_title: "产品与库存管理",
    products_subtitle: "管理产品目录、库存水平和出入库变动",
    stock_in: "入库登记",
    stock_out: "出库登记",
    add_product: "添加商品",
    search_products_placeholder: "根据名称、SKU、条码、类别搜索...",
    th_product_sku: "产品 / SKU",
    th_category: "商品品类",
    th_barcode: "条形码",
    th_cost: "进货成本",
    th_retail: "零售价",
    th_stock: "当前库存",
    th_actions: "操作",
    edit_btn: "编辑",
    delete_btn: "删除",
    invalid_qty: "输入的数量不合规。",
    received: "入库成功",
    issued: "出库成功",

    // Purchases view
    purchase_title: "采购与供应管理",
    purchase_subtitle: "管理采购订单、供应商记录以及采购工作流",
    add_supplier: "新增供应商",
    add_purchase: "新建采购订单",
    suppliers: "合作供应商",
    purchase_orders: "采购订单目录",
    th_name: "供应商名称",
    th_contact: "联系人/电话",
    th_po: "PO 采购单号",
    th_date: "采购日期",
    th_status: "订单状态",
    th_total: "总金额",
    supplier_added: "供应商成功添加。",
    po_created: "采购订单创建成功",
    no_suppliers: "暂无合作供应商信息",
    no_purchase_orders: "暂无采购订单",
    confirm_delete_supplier: "确定要删除该供应商吗？",

    // CRM View
    crm_title: "VIP 会员管理",
    crm_subtitle: "管理尊贵会员、等级权益及积分消费分析",
    register_vip: "注册尊贵会员",
    search_customers_placeholder: "根据姓名、电话或会员等级搜索...",
    th_card_no: "会员卡号",
    th_phone: "联系电话",
    th_points: "当前积分",
    th_ltv: "总消费额 (LTV)",
    no_members_found: "未找到匹配的会员信息",
    since_label: "入会年份",
    no_vip_cards: "暂无可展示的会员卡片",
    confirm_delete_vip: "确定要删除该尊贵会员吗？",

    // Finance View
    finance_title: "财务结算管理",
    finance_subtitle: "现金流监控、日常费用支出以及盈利分析",
    add_expense: "新增费用开支",
    expense_log: "开支账目记录",
    operational: "日常运营",
    th_description: "费用详情",
    th_amount: "支出金额",
    expense_recorded: "该笔支出已成功入账。",

    // Reports View
    reports_title: "交易报表与审计",
    reports_subtitle: "查看完整交易历史账单、审计日志及智能报表",
    export_csv: "导出为 CSV 格式",
    search_reports_placeholder: "搜索小票单号、顾客姓名或支付方式...",
    th_invoice: "发票/单号",
    th_datetime: "交易时间",
    th_customer: "消费者姓名",
    th_payment: "支付渠道",
    no_transactions: "暂无交易流水记录",
    view_btn: "详情",

    // Shortcuts descriptions
    shortcut_focus: "聚焦商品搜索",
    shortcut_new_txn: "开单新交易",
    shortcut_checkout: "收银结算",
    shortcut_refresh: "刷新数据",
    shortcut_print: "打印收据",
    shortcut_fs: "全屏收银",
    shortcut_close: "关闭窗口",
    shortcut_qty: "快捷加减数量",

    // Placeholders
    store_name_placeholder: "CasirStore",
    store_wa_placeholder: "6281234567890",
    rajaongkir_key_placeholder: "输入 RajaOngkir API 密钥",
    origin_city_placeholder: "151 (雅加达)",
    bank_name_placeholder: "开户行",
    bank_acc_placeholder: "账号",
    bank_holder_placeholder: "户名",
    th_product: "商品名",
    th_sold: "已售件数",
    th_revenue: "营业额",

    // Roles and staff management
    role_admin: "店主 / 管理员",
    role_cashier: "收银员 / 操作员",
    welcome_msg: "祝您工作顺利，{name}！",
    no_staff_registered: "暂无注册的系统员工。",
    hide_pin: "🔒 隐藏密码",
    show_pin: "👁️ 显示密码",
    
    // Messages / Toasts
    access_granted: "验证通过",
    access_denied: "拒绝访问",
    wrong_pin: "您输入的密码有误。",
    success: "成功",
    failed: "失败",
    saved: "配置已保存",
    deleted: "数据已删除",
    promo: '🏷️ 促销',
    karyawan: '👥 员工',
    loyalty_driven: '忠诚度驱动',
    restock_required: '需要补货',
    th_supplier: '供应商',
    th_tier: '等级'
  }
};

function t(key, replacements = {}) {
  const lang = (db.state && db.state.settings && db.state.settings.language) || 'id';
  let val = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS['id'][key] || key;
  Object.keys(replacements).forEach(k => {
    val = val.replace(`{${k}}`, replacements[k]);
  });
  return val;
}

function applyLanguage(lang, syncToServer = true) {
  if (!TRANSLATIONS[lang]) lang = 'id';
  
  document.documentElement.setAttribute('lang', lang);
  
  // Statically marked items
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const trans = TRANSLATIONS[lang][key];
    if (trans) {
      const icon = el.querySelector('svg');
      if (icon) {
        const span = el.querySelector('span');
        if (span) {
          span.textContent = trans;
        } else {
          el.innerHTML = '';
          el.appendChild(icon);
          el.appendChild(document.createTextNode(' ' + trans));
        }
      } else {
        el.textContent = trans;
      }
    }
  });

  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const trans = TRANSLATIONS[lang][key];
    if (trans) {
      el.setAttribute('placeholder', trans);
    }
  });

  // Sync to database
  if (!db.state.settings) db.state.settings = {};
  db.state.settings.language = lang;
  db.save();

  // Sync inputs
  const select = document.getElementById('setLanguage');
  if (select) select.value = lang;
  const headerSelect = document.getElementById('headerLanguageSelect');
  if (headerSelect) headerSelect.value = lang;

  // Re-render components with translated labels
  if (typeof renderStaffList === 'function') renderStaffList();
  if (typeof renderProfilePage === 'function') renderProfilePage();
  if (typeof renderCart === 'function') renderCart();

  if (syncToServer) {
    syncServerSettings();
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      const branch = (typeof BRANCH_ID !== 'undefined' && BRANCH_ID) || sessionStorage.getItem('casirpro_branch') || '';
      wsClient.send(JSON.stringify({ type: 'sync', data: { settings: db.state.settings }, branchId: branch }));
    }
  }
  syncMobileHeaderTitle();
}

// Decorate the global toast function to automatically translate notifications
const _origToastLang = toast;
toast = function(title, msg, type = 'info') {
  let tTitle = t(title);
  let tMsg = msg;
  
  if (tMsg && typeof tMsg === 'string') {
    if (tMsg.startsWith('Selamat bertugas, ')) {
      const name = tMsg.replace('Selamat bertugas, ', '').replace('!', '');
      const welcomeFormat = t('welcome_msg');
      tMsg = welcomeFormat ? welcomeFormat.replace('{name}', name) : tMsg;
    } else {
      tMsg = t(tMsg);
    }
  }
  
  if (typeof _origToastLang === 'function') {
    _origToastLang(tTitle, tMsg, type);
  }
};

// =============================================
// SYSTEM SHORTCUT BARCODES
// =============================================
function showSystemBarcodes() {
  const container = document.getElementById('staffBarcodesContainer');
  if (!container) return;
  
  if (!db.state || !db.state.staffList || !db.state.staffList.length) {
    container.innerHTML = '<p style="color:#666; font-size:12px; margin:0;">Tidak ada staff terdaftar. Silakan daftarkan staff terlebih dahulu.</p>';
  } else {
    container.innerHTML = db.state.staffList.map(s => {
      const sanitizedName = s.name.toUpperCase().replace(/\s+/g, '_');
      const selectBarcodeText = `CMD-USER-${sanitizedName}`;
      const pinBarcodeText = `CMD-PIN-${s.pin}`;
      
      return `
        <div style="padding: 12px; border: 1px solid #eee; border-radius: 8px; display: flex; flex-direction: column; gap: 12px; background: #fafafa;">
          <div style="font-weight: bold; color: #111; font-size: 13px; border-bottom: 1px solid #eee; padding-bottom: 4px; display:flex; justify-content:space-between;">
            <span>👤 ${s.name} (${s.role})</span>
            <span style="font-family:monospace; color:#666; font-size:11px;">PIN: ${s.pin}</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 20px;">
            <div style="flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 10px; font-weight: bold; color: #555;">SCAN UNTUK PILIH KASIR:</span>
              <img src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(selectBarcodeText)}&scale=2&rotate=N&includeText=true" alt="${selectBarcodeText} Barcode" style="height:60px; max-width:200px; display:block;" />
            </div>
            <div style="flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 10px; font-weight: bold; color: #555;">SCAN MASUK PIN:</span>
              <img src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(pinBarcodeText)}&scale=2&rotate=N&includeText=true" alt="${pinBarcodeText} Barcode" style="height:60px; max-width:200px; display:block;" />
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
  
  // Show modal
  const modal = document.getElementById('systemBarcodeModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function printBarcodeSheet() {
  const printContent = document.getElementById('barcodePrintArea').innerHTML;
  const win = window.open('', '_blank');
  win.document.write(`
    <html>
      <head>
        <title>Print Barcode Pintasan POS</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #000; background: #fff; }
          .print-only-header { display: block !important; text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
          code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 11px; }
          h4 { margin-top: 15px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; font-size: 14px; font-weight: bold; }
          img { display: block; margin: 5px 0; max-height: 70px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="print-only-header">
          <h2 style="margin:0;">Lembar Barcode Pintasan POS</h2>
          <p style="margin:5px 0 0 0; font-size:12px; color:#555;">CasirPRO System Barcodes Sheet</p>
        </div>
        ${printContent}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => { window.close(); }, 500);
          }
        <\/script>
      </body>
    </html>
  `);
  win.document.close();
}

// =============================================
// QUEUE & VOICE ANNOUNCEMENT SYSTEM
// =============================================
function initQueueSystem() {
  if (!db.state.queues) db.state.queues = [];
  
  // Load counter setting from localStorage
  const savedCounter = localStorage.getItem('pos_queue_counter') || 'Kasir 1';
  const counterInput = document.getElementById('queueCounterInput');
  if (counterInput) {
    counterInput.value = savedCounter;
  }
  
  renderQueueList();
}

function saveQueueCounterSetting(val) {
  localStorage.setItem('pos_queue_counter', val || 'Kasir 1');
  toast('Sistem Antrean', `Lokasi diubah ke: ${val}`, 'info');
}

function generateQueueNumber() {
  const todayStr = new Date().toDateString();
  if (!db.state.queueDate || db.state.queueDate !== todayStr) {
    db.state.queues = [];
    db.state.queueDate = todayStr;
    db.state.queueSeq = 0;
  }
  
  db.state.queueSeq = (db.state.queueSeq || 0) + 1;
  const number = db.state.queueSeq;
  
  const newQueue = {
    id: Date.now(),
    number: number,
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    status: 'waiting',
    counter: ''
  };
  
  db.state.queues.push(newQueue);
  db.save();
  renderQueueList();
  
  toast('Antrean Baru', `Nomor antrean ${number} berhasil diambil!`, 'success');
  playSfx('sfxSuccess');
}

function renderQueueView() {
  renderQueueList();
}

function renderQueueList() {
  const tbody = document.getElementById('queueListTableBody');
  const activeDisplay = document.getElementById('activeQueueDisplay');
  const activeInfo = document.getElementById('activeQueueInfo');
  const pendingCountEl = document.getElementById('queuePendingCount');
  
  if (!db.state || !db.state.queues) return;
  
  // Sort queues so recent is first
  const queues = db.state.queues;
  const waiting = queues.filter(q => q.status === 'waiting');
  
  if (pendingCountEl) {
    pendingCountEl.textContent = `${waiting.length} Menunggu`;
  }
  
  // 1. Find active (called) queue
  const calledQueue = queues.slice().reverse().find(q => q.status === 'called');
  if (calledQueue) {
    if (activeDisplay) activeDisplay.textContent = calledQueue.number;
    if (activeInfo) activeInfo.textContent = `Menuju ke ${calledQueue.counter || 'Kasir 1'}`;
  } else {
    if (activeDisplay) activeDisplay.textContent = '—';
    if (activeInfo) activeInfo.textContent = 'Belum ada antrean yang dipanggil';
  }
  
  // 2. Render table body
  if (!tbody) return;
  if (queues.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--text-muted);">Belum ada antrean hari ini.</td></tr>`;
    return;
  }
  
  tbody.innerHTML = queues.slice().reverse().map(q => {
    let statusBadge = '';
    let actionBtn = '';
    
    if (q.status === 'waiting') {
      statusBadge = `<span class="status-badge pending">Menunggu</span>`;
      actionBtn = `<button class="glass-btn glass-btn-sm glass-btn-primary" onclick="callQueue(${q.id})" style="font-size:10px; padding:4px 8px;">Panggil</button>`;
    } else if (q.status === 'called') {
      statusBadge = `<span class="status-badge" style="background:rgba(99,102,241,0.15); color:var(--primary-light);">Dipanggil</span>`;
      actionBtn = `<button class="glass-btn glass-btn-sm" onclick="callQueue(${q.id})" style="font-size:10px; padding:4px 8px; margin-right:4px;">Panggil Ulang</button>
                   <button class="glass-btn glass-btn-sm" onclick="completeQueueDirect(${q.id})" style="background:rgba(16,185,129,0.1); border-color:rgba(16,185,129,0.2); color:var(--success); font-size:10px; padding:4px 8px;">Selesai</button>`;
    } else if (q.status === 'completed') {
      statusBadge = `<span class="status-badge paid">Selesai</span>`;
      actionBtn = `<span style="font-size:11px; color:var(--text-muted);">Selesai di ${q.counter || 'Kasir'}</span>`;
    }
    
    return `
      <tr>
        <td class="pl-2" style="font-weight:700; font-size:1.1rem; color:#fff;">Antrean #${q.number}</td>
        <td>${q.time}</td>
        <td>${statusBadge}</td>
        <td class="text-right pr-2">${actionBtn}</td>
      </tr>
    `;
  }).join('');
}

function callQueue(id) {
  const queues = db.state.queues;
  const queue = queues.find(q => q.id === id);
  if (!queue) return;
  
  const counter = document.getElementById('queueCounterInput')?.value || 'Kasir 1';
  
  // Update queue status
  queue.status = 'called';
  queue.counter = counter;
  db.save();
  renderQueueList();
  
  // Voice announcement!
  announceQueue(queue.number, counter);
}

function completeQueueDirect(id) {
  const queues = db.state.queues;
  const queue = queues.find(q => q.id === id);
  if (queue) {
    queue.status = 'completed';
    db.save();
    renderQueueList();
    playSfx('sfxSuccess');
    toast('Antrean Selesai', `Antrean #${queue.number} ditandai selesai.`, 'success');
  }
}

function recallActiveQueue() {
  const queues = db.state.queues;
  const calledQueue = queues.slice().reverse().find(q => q.status === 'called');
  if (calledQueue) {
    announceQueue(calledQueue.number, calledQueue.counter || 'Kasir 1');
  } else {
    toast('Info', 'Tidak ada antrean aktif untuk dipanggil ulang', 'warning');
  }
}

function completeActiveQueue() {
  const queues = db.state.queues;
  const calledQueue = queues.slice().reverse().find(q => q.status === 'called');
  if (calledQueue) {
    completeQueueDirect(calledQueue.id);
  } else {
    toast('Info', 'Tidak ada antrean aktif saat ini', 'warning');
  }
}

function playQueueChime() {
  if (typeof playTone === 'function') {
    // Beautiful dual-tone department store chime
    playTone(554.37, 0.15, 'sine', 0.15); // C#5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.15), 120); // E5
    setTimeout(() => playTone(880.00, 0.3, 'sine', 0.15), 240); // A5
  }
}

function announceQueue(number, counter) {
  // Play chime first
  playQueueChime();
  
  // Wait 600ms for chime to play, then speak
  setTimeout(() => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const text = `Nomor antrean ${number}, silakan menuju ke ${counter}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID'; // Indonesian Language voice
      utterance.rate = 0.82; // Natural and clear speed
      utterance.pitch = 1.0;
      
      // Select Indonesian voice if available
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ind') || v.name.toLowerCase().includes('indonesian'));
      if (idVoice) {
        utterance.voice = idVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported in this browser.');
    }
  }, 650);
}

// =============================================
// CASHIER SHIFT MANAGEMENT & SYNC FUNCTIONS
// =============================================
function openBukaShiftModal(cashier) {
  const modal = document.getElementById('bukaShiftModal');
  const cashierInput = document.getElementById('bukaShiftCashier');
  const modalAwalInput = document.getElementById('bukaShiftModalAwal');
  
  if (cashierInput) cashierInput.value = cashier;
  if (modalAwalInput) modalAwalInput.value = 200000; // default starting cash
  
  if (modal) modal.style.display = 'flex';
}

function submitBukaShift() {
  const cashier = document.getElementById('bukaShiftCashier').value;
  const startingCash = parseFloat(document.getElementById('bukaShiftModalAwal').value) || 0;
  
  if (!db.state.shifts) db.state.shifts = [];
  
  // Close any existing active shifts for this cashier
  db.state.shifts.forEach(s => {
    if (s.cashier === cashier && s.status === 'Active') {
      s.status = 'Closed';
      s.endTime = new Date().toISOString();
    }
  });

  const newShift = {
    id: uid('sh'),
    cashier: cashier,
    startTime: new Date().toISOString(),
    endTime: null,
    startingCash: startingCash,
    expectedCash: startingCash,
    actualCash: 0,
    discrepancy: 0,
    status: 'Active',
    notes: ''
  };
  
  db.state.shifts.push(newShift);
  
  // Set active cashier
  db.state.activeCashier = cashier;
  db.save();

  // Hide bukaShiftModal
  const modal = document.getElementById('bukaShiftModal');
  if (modal) modal.style.display = 'none';

  // Hide lockScreen
  const screen = document.getElementById('lockScreen');
  if (screen) {
    screen.style.transform = 'translateY(-100%)';
    setTimeout(() => { screen.style.display = 'none'; }, 400);
  }

  // Update header shift cashier name
  const cashierEl = document.getElementById('headerShiftName');
  if (cashierEl) cashierEl.textContent = cashier;

  toast('Shift Dimulai', `Shift untuk ${cashier} dibuka dengan modal awal ${rp(startingCash)}.`, 'success');
  playSfx('sfxSuccess');
  applyRoleBasedAccess(cashier);
  switchTab('profil');
  renderProfilePage();
}

function openCloseShiftModal() {
  const cashier = db.state.activeCashier || 'Edward Stark';
  if (!db.state.shifts) db.state.shifts = [];
  const activeShift = db.state.shifts.find(s => s.status === 'Active' && s.cashier === cashier);
  
  if (!activeShift) {
    toast('Error', 'Tidak ada shift aktif untuk kasir ini.', 'danger');
    return;
  }
  
  // Calculate cash sales in this shift
  const startTimeISO = activeShift.startTime;
  const cashTxns = db.state.transactions.filter(t => t.cashier === cashier && t.date >= startTimeISO && t.paymentMethod === 'Cash');
  const cashSales = cashTxns.reduce((sum, t) => sum + (t.total || 0), 0);
  
  const startingCash = parseFloat(activeShift.startingCash) || 0;
  const expectedCash = startingCash + cashSales;
  
  // Populate Tutup Shift Modal fields
  document.getElementById('tutupShiftCashier').value = cashier;
  document.getElementById('tutupShiftStart').value = new Date(activeShift.startTime).toLocaleTimeString('id-ID') + ' (' + new Date(activeShift.startTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ')';
  document.getElementById('tutupShiftModalAwalVal').value = rp(startingCash);
  document.getElementById('tutupShiftCashSales').value = rp(cashSales);
  document.getElementById('tutupShiftExpected').value = rp(expectedCash);
  
  // Reset actual cash input & diff UI
  document.getElementById('tutupShiftActual').value = '';
  const diffEl = document.getElementById('tutupShiftDifference');
  if (diffEl) {
    diffEl.textContent = 'Rp 0';
    diffEl.style.background = 'rgba(255,255,255,0.03)';
    diffEl.style.color = 'var(--text-secondary)';
  }
  document.getElementById('tutupShiftNotes').value = '';
  
  // Show modal
  const modal = document.getElementById('tutupShiftModal');
  if (modal) modal.style.display = 'flex';
}

function calcShiftDiscrepancy() {
  const cashier = db.state.activeCashier || 'Edward Stark';
  const activeShift = db.state.shifts.find(s => s.status === 'Active' && s.cashier === cashier);
  if (!activeShift) return;
  
  const startTimeISO = activeShift.startTime;
  const cashTxns = db.state.transactions.filter(t => t.cashier === cashier && t.date >= startTimeISO && t.paymentMethod === 'Cash');
  const cashSales = cashTxns.reduce((sum, t) => sum + (t.total || 0), 0);
  
  const startingCash = parseFloat(activeShift.startingCash) || 0;
  const expectedCash = startingCash + cashSales;
  
  const actualCash = parseFloat(document.getElementById('tutupShiftActual').value) || 0;
  const discrepancy = actualCash - expectedCash;
  
  const diffEl = document.getElementById('tutupShiftDifference');
  if (diffEl) {
    if (discrepancy === 0) {
      diffEl.textContent = 'Rp 0 (SEIMBANG)';
      diffEl.style.background = 'rgba(16,185,129,0.15)';
      diffEl.style.color = 'var(--success)';
    } else if (discrepancy > 0) {
      diffEl.textContent = '+ ' + rp(discrepancy) + ' (SURPLUS)';
      diffEl.style.background = 'rgba(59,130,246,0.15)';
      diffEl.style.color = 'var(--blue)';
    } else {
      diffEl.textContent = '- ' + rp(Math.abs(discrepancy)) + ' (DEFISIT / SELISIH)';
      diffEl.style.background = 'rgba(244,63,94,0.15)';
      diffEl.style.color = 'var(--rose)';
    }
  }
}

function submitTutupShift() {
  const cashier = db.state.activeCashier || 'Edward Stark';
  const activeShift = db.state.shifts.find(s => s.status === 'Active' && s.cashier === cashier);
  if (!activeShift) return;
  
  const startTimeISO = activeShift.startTime;
  const cashTxns = db.state.transactions.filter(t => t.cashier === cashier && t.date >= startTimeISO && t.paymentMethod === 'Cash');
  const cashSales = cashTxns.reduce((sum, t) => sum + (t.total || 0), 0);
  
  const startingCash = parseFloat(activeShift.startingCash) || 0;
  const expectedCash = startingCash + cashSales;
  
  const actualCash = parseFloat(document.getElementById('tutupShiftActual').value) || 0;
  const discrepancy = actualCash - expectedCash;
  const notes = document.getElementById('tutupShiftNotes').value;
  
  // Update shift state
  activeShift.endTime = new Date().toISOString();
  activeShift.expectedCash = expectedCash;
  activeShift.actualCash = actualCash;
  activeShift.discrepancy = discrepancy;
  activeShift.status = 'Closed';
  activeShift.notes = notes;
  
  db.save();

  // Hide tutupShiftModal
  const modal = document.getElementById('tutupShiftModal');
  if (modal) modal.style.display = 'none';
  
  toast('Shift Ditutup', `Shift kasir ${cashier} berhasil ditutup dengan status ${discrepancy === 0 ? 'Seimbang' : discrepancy > 0 ? 'Surplus' : 'Defisit'}.`, 'success');
  playSfx('sfxSuccess');
  
  // Show lockScreen to force login/new shift opening
  const screen = document.getElementById('lockScreen');
  if (screen) {
    screen.style.display = 'flex';
    screen.style.transform = 'translateY(0)';
  }
  
  // Clear active cashier
  db.state.activeCashier = '';
  db.save();
  
  // Generate Laporan Tutup Shift for WhatsApp share
  const closingReportText = `🔐 *LAPORAN TUTUP SHIFT KASIR* 🔐\n` +
    `---------------------------------------\n` +
    `👤 *Kasir:* ${cashier}\n` +
    `📅 *Mulai Shift:* ${new Date(activeShift.startTime).toLocaleString('id-ID')}\n` +
    `📅 *Tutup Shift:* ${new Date(activeShift.endTime).toLocaleString('id-ID')}\n` +
    `---------------------------------------\n` +
    `💵 *Modal Awal:* ${rp(startingCash)}\n` +
    `📈 *Penjualan Tunai:* ${rp(cashSales)}\n` +
    `💸 *Uang Seharusnya:* ${rp(expectedCash)}\n` +
    `📥 *Uang Aktual Laci:* ${rp(actualCash)}\n` +
    `⚠️ *Selisih Kas:* ${discrepancy === 0 ? 'Rp 0 (SEIMBANG)' : (discrepancy > 0 ? '+' : '-') + rp(Math.abs(discrepancy))}\n` +
    `📝 *Catatan:* ${notes || '-'}\n` +
    `---------------------------------------\n` +
    `*CasirPRO Enterprise* - Terverifikasi`;

  // Pre-load inside a confirmation toast or copy to clipboard
  navigator.clipboard.writeText(closingReportText).then(() => {
    toast('Laporan Disalin', 'Laporan tutup shift telah disalin ke clipboard untuk WhatsApp.', 'info');
  }).catch(() => {});
  
  // Trigger WhatsApp share using settings WhatsApp number if enabled
  const companyPhone = (db.state.settings && db.state.settings.whatsappPhone) || '';
  if (companyPhone) {
    const formattedPhone = companyPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(closingReportText)}`, '_blank');
  } else {
    // Just open WhatsApp blank or prompt owner share
    window.open(`https://wa.me/?text=${encodeURIComponent(closingReportText)}`, '_blank');
  }
}

function syncStateToServer() {
  const branch = (typeof BRANCH_ID !== 'undefined' && BRANCH_ID) || sessionStorage.getItem('casirpro_branch') || 'branch-1';
  const syncData = {
    type: 'sync',
    branchId: branch,
    data: {
      customers: db.state.customers,
      shifts: db.state.shifts,
      transactions: db.state.transactions
    }
  };

  // If websocket is open, send via websocket
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send(JSON.stringify(syncData));
  }

  // Also sync via REST API to ensure Vercel / serverless is updated!
  const httpUrl = localStorage.getItem('pos_server_http_url') || 'http://localhost:3000';
  const branchAuthToken = sessionStorage.getItem('casirpro_token') || 'demo-token';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + branchAuthToken
  };

  fetch(httpUrl + '/api/branch/customers?branch=' + branch, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(db.state.customers || [])
  }).catch(e => console.error('Error syncing customers:', e));

  fetch(httpUrl + '/api/branch/shifts?branch=' + branch, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(db.state.shifts || [])
  }).catch(e => console.error('Error syncing shifts:', e));
}



