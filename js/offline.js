// ─── Offline Mode (IndexedDB + Auto-Sync) ────────────────────────────
const NexaDB = {
  DB_NAME: 'NexaPOS',
  DB_VERSION: 2,
  db: null,

  async open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('transactions')) {
          const tx = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
          tx.createIndex('date', 'date', { unique: false });
          tx.createIndex('synced', 'synced', { unique: false });
        }
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('queue')) {
          db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      };
      req.onsuccess = (e) => { this.db = e.target.result; resolve(this.db); };
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async save(store, data) {
    if (!this.db) await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(store, 'readwrite');
      const obj = tx.objectStore(store);
      if (Array.isArray(data)) {
        data.forEach(item => obj.put(item));
      } else {
        obj.put(data);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  },

  async getAll(store) {
    if (!this.db) await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(store, 'readonly');
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async getByIndex(store, index, value) {
    if (!this.db) await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(store, 'readonly');
      const req = tx.objectStore(store).index(index).getAll(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async get(store, key) {
    if (!this.db) await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(store, 'readonly');
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async delete(store, key) {
    if (!this.db) await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(store, 'readwrite');
      tx.objectStore(store).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  },

  async clear(store) {
    if (!this.db) await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(store, 'readwrite');
      tx.objectStore(store).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  }
};

// ─── Sync Engine ─────────────────────────────────────────────────────
const NexaSync = {
  isSyncing: false,
  listeners: [],

  onSync(fn) { this.listeners.push(fn); },

  async syncAll() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      await this.syncTransactions();
      await this.syncOrders();
      this.listeners.forEach(fn => fn('complete'));
    } catch (e) { console.error('Sync error:', e); }
    this.isSyncing = false;
  },

  async syncTransactions() {
    const unsynced = await NexaDB.getByIndex('transactions', 'synced', false);
    if (!unsynced.length) return;
    const serverUrl = localStorage.getItem('pos_server_http_url') || 'http://localhost:3000';
    try {
      const res = await fetch(serverUrl + '/api/sync', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: unsynced })
      });
      if (res.ok) {
        for (const t of unsynced) {
          t.synced = true;
          await NexaDB.save('transactions', t);
        }
      }
    } catch (e) { console.log('Sync deferred (offline)'); }
  },

  async syncOrders() {
    const unsynced = await NexaDB.getByIndex('orders', 'synced', false);
    if (!unsynced.length) return;
    const serverUrl = localStorage.getItem('pos_server_http_url') || 'http://localhost:3000';
    for (const order of unsynced) {
      try {
        const res = await fetch(serverUrl + '/api/orders', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        });
        if (res.ok) {
          order.synced = true;
          await NexaDB.save('orders', order);
        }
      } catch (e) { /* stay queued */ }
    }
  }
};

// ─── Online/Offline Detection ────────────────────────────────────────
function initOfflineDetection() {
  const updateStatus = () => {
    const el = document.getElementById('serverStatus');
    if (el) {
      if (navigator.onLine) {
        el.textContent = '🟢 Online';
        el.style.color = '#10b981';
        // Try sync when coming back online
        NexaSync.syncAll();
      } else {
        el.textContent = '🔴 Offline (mode lokal)';
        el.style.color = '#ef4444';
      }
    }
  };
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();

  // Periodic sync
  setInterval(() => { if (navigator.onLine) NexaSync.syncAll(); }, 60000);
}

window.NexaDB = NexaDB;
window.NexaSync = NexaSync;
window.initOfflineDetection = initOfflineDetection;
