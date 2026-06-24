// ─── Promo & Diskon Engine ──────────────────────────────────────────
const CasirPromo = {
  promos: [],

  init() {
    const saved = localStorage.getItem('casirpro_promos');
    if (saved) { try { this.promos = JSON.parse(saved); } catch (e) { this.promos = []; } }
  },

  save() { localStorage.setItem('casirpro_promos', JSON.stringify(this.promos)); },

  add(promo) {
    promo.id = promo.id || 'promo-' + Date.now().toString(36);
    promo.createdAt = new Date().toISOString();
    this.promos.push(promo);
    this.save();
  },

  update(id, data) {
    const idx = this.promos.findIndex(p => p.id === id);
    if (idx !== -1) { this.promos[idx] = { ...this.promos[idx], ...data }; this.save(); }
  },

  remove(id) {
    this.promos = this.promos.filter(p => p.id !== id);
    this.save();
  },

  // Apply active promos to cart
  apply(cart, customer = null) {
    const now = Date.now();
    const active = this.promos.filter(p =>
      p.active !== false &&
      new Date(p.startDate || 0).getTime() <= now &&
      new Date(p.endDate || '2099-12-31').getTime() >= now
    );

    let result = { discounts: [], subtotal: cart.subtotal || 0, total: cart.total || 0 };

    for (const promo of active) {
      switch (promo.type) {
        case 'percentage':
          if (this._matchesCondition(promo, cart, customer)) {
            const disc = Math.min(cart.subtotal * (promo.value / 100), promo.maxDiscount || Infinity);
            result.discounts.push({ name: promo.name, amount: disc, type: 'percentage' });
          }
          break;
        case 'nominal':
          if (this._matchesCondition(promo, cart, customer)) {
            result.discounts.push({ name: promo.name, amount: promo.value, type: 'nominal' });
          }
          break;
        case 'buy_x_get_y':
          if (this._matchesCondition(promo, cart, customer)) {
            result.discounts.push({ name: promo.name, amount: 0, type: 'bogo', description: promo.description });
          }
          break;
        case 'bundle':
          if (this._matchesCondition(promo, cart, customer)) {
            const bundleDisc = this._calcBundleDiscount(promo, cart);
            if (bundleDisc > 0) result.discounts.push({ name: promo.name, amount: bundleDisc, type: 'bundle' });
          }
          break;
      }
    }

    result.totalDiscount = result.discounts.reduce((s, d) => s + (d.amount || 0), 0);
    result.totalAfterDiscount = cart.subtotal - result.totalDiscount;
    return result;
  },

  _matchesCondition(promo, cart, customer) {
    if (promo.minPurchase && cart.subtotal < promo.minPurchase) return false;
    if (promo.minItems && (cart.items || []).reduce((s, i) => s + (i.qty || 0), 0) < promo.minItems) return false;
    if (promo.memberOnly && (!customer || !customer.isMember)) return false;
    if (promo.productIds && promo.productIds.length) {
      const cartIds = (cart.items || []).map(i => i.id);
      if (!promo.productIds.some(id => cartIds.includes(id))) return false;
    }
    return true;
  },

  _calcBundleDiscount(promo, cart) {
    const bundleProducts = promo.bundleItems || [];
    let found = 0;
    for (const bp of bundleProducts) {
      const inCart = (cart.items || []).find(i => i.id === bp.productId || i.name === bp.productName);
      if (inCart && (inCart.qty || 0) >= (bp.qty || 1)) found++;
    }
    if (found === bundleProducts.length && bundleProducts.length > 0) {
      return promo.bundlePrice ? (cart.subtotal - promo.bundlePrice) : 0;
    }
    return 0;
  },

  // ─── UI Helpers ─────────────────────────────────────────────────
  renderPromoList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    this.init();
    if (!this.promos.length) {
      container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text2);">Belum ada promo</div>`;
      return;
    }
    container.innerHTML = this.promos.map(p => `
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-weight:600;font-size:14px;">${p.name}</div>
          <div style="font-size:11px;color:var(--text2);">${p.description || ''}
            ${p.type === 'percentage' ? ` • Diskon ${p.value}%` : ''}
            ${p.type === 'nominal' ? ` • Diskon Rp ${(p.value || 0).toLocaleString('id-ID')}` : ''}
          </div>
          <div style="font-size:10px;color:var(--text3);margin-top:4px;">
            ${p.startDate ? 'Mulai ' + new Date(p.startDate).toLocaleDateString('id-ID') : ''}
            ${p.endDate ? ' • Sampai ' + new Date(p.endDate).toLocaleDateString('id-ID') : ''}
            ${p.active !== false ? '🟢 Aktif' : '🔴 Nonaktif'}
          </div>
        </div>
        <button onclick="CasirPromo.remove('${p.id}');CasirPromo.renderPromoList('${containerId}')"
          style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#ef4444;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:11px;">Hapus</button>
      </div>
    `).join('');
  },

  showAddForm(onSave) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;animation:fadeIn .3s;';
    modal.innerHTML = `
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:30px;max-width:480px;width:92%;max-height:80vh;overflow-y:auto;">
        <h3 style="margin-bottom:16px;">Tambah Promo Baru</h3>
        <div class="form-group"><label>Nama Promo</label><input id="promoName" class="input" placeholder="Contoh: Diskon Akhir Pekan"></div>
        <div class="form-group"><label>Deskripsi</label><input id="promoDesc" class="input" placeholder="Deskripsi promo"></div>
        <div class="form-group"><label>Tipe</label>
          <select id="promoType" class="input">
            <option value="percentage">Persentase (%)</option>
            <option value="nominal">Nominal (Rp)</option>
            <option value="buy_x_get_y">Buy X Get Y</option>
            <option value="bundle">Bundle Price</option>
          </select>
        </div>
        <div class="form-group"><label>Nilai</label><input id="promoValue" class="input" type="number" placeholder="Nilai diskon"></div>
        <div class="form-group"><label>Min. Pembelian (Rp)</label><input id="promoMin" class="input" type="number" placeholder="0 = tanpa minimal"></div>
        <div class="form-group"><label>Periode Mulai</label><input id="promoStart" class="input" type="date"></div>
        <div class="form-group"><label>Periode Selesai</label><input id="promoEnd" class="input" type="date"></div>
        <div class="form-group"><label>Khusus Member?</label>
          <select id="promoMember" class="input"><option value="0">Tidak</option><option value="1">Ya</option></select>
        </div>
        <div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end;">
          <button onclick="this.closest('div[style]').remove()" class="btn btn-ghost">Batal</button>
          <button id="promoSaveBtn" class="btn btn-gold">Simpan Promo</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#promoSaveBtn').onclick = () => {
      const promo = {
        name: modal.querySelector('#promoName').value,
        description: modal.querySelector('#promoDesc').value,
        type: modal.querySelector('#promoType').value,
        value: Number(modal.querySelector('#promoValue').value) || 0,
        minPurchase: Number(modal.querySelector('#promoMin').value) || 0,
        startDate: modal.querySelector('#promoStart').value,
        endDate: modal.querySelector('#promoEnd').value,
        memberOnly: modal.querySelector('#promoMember').value === '1',
        active: true
      };
      if (!promo.name) return alert('Nama promo wajib diisi');
      this.add(promo);
      modal.remove();
      if (onSave) onSave();
    };
  }
};

window.CasirPromo = CasirPromo;
