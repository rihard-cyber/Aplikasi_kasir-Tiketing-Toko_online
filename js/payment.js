// ─── Payment Gateway Integration (Midtrans / Xendit / QRIS) ──────────
const CasirPay = {
  config: { serverKey: '', clientKey: '', mode: 'sandbox', provider: 'midtrans' },

  init(cfg) { Object.assign(this.config, cfg); },

  // Generate QRIS payment via Midtrans Snap
  async snapQRIS(order) {
    const serverUrl = localStorage.getItem('pos_server_http_url') || 'http://localhost:3000';
    try {
      const res = await fetch(serverUrl + '/api/payment/qris', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: order.total || 0,
          orderId: order.id || 'ORD-' + Date.now(),
          customer: order.customer || {}
        })
      });
      return await res.json();
    } catch (e) { return { error: e.message }; }
  },

  // Generate QR in browser (fallback when no payment gateway configured)
  generateQRIS(total, label = 'CasirPRO') {
    const qrData = `QRIS:${label}:${total}:${Date.now()}`;
    return qrData;
  },

  // Show QRIS payment modal
  async showQRModal(total, onPaidOrOrderId, onPaidFallback) {
    let orderId = '';
    let onPaid = onPaidFallback;
    if (typeof onPaidOrOrderId === 'function') {
      onPaid = onPaidOrOrderId;
    } else {
      orderId = onPaidOrOrderId || '';
    }
    const existing = document.getElementById('casirpayModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'casirpayModal';
    modal.style.cssText = `
      position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;
      background:rgba(0,0,0,0.7);backdrop-filter:blur(10px);
      display:flex;align-items:center;justify-content:center;
      animation:fadeIn .3s ease;
    `;
    modal.innerHTML = `
      <div style="background:linear-gradient(135deg,#0f172a,#1e293b);border:1px solid rgba(99,102,241,0.3);
            border-radius:24px;padding:40px;max-width:380px;width:90%;text-align:center;
            box-shadow:0 25px 60px rgba(0,0,0,0.6);">
        <div style="font-size:12px;color:#6366F1;font-weight:700;letter-spacing:2px;margin-bottom:8px;">CASIRPAY PREMIUM</div>
        <div style="font-size:28px;font-weight:700;color:#fff;margin-bottom:4px;">Rp ${total.toLocaleString('id-ID')}</div>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:20px;">Scan QRIS untuk membayar</div>
        <div id="casirpayQRContainer" style="background:#fff;border-radius:16px;padding:16px;margin:0 auto 20px;width:200px;height:200px;display:flex;align-items:center;justify-content:center;">
          <div style="color:#333;font-size:12px;text-align:center;">
            <div style="font-size:40px;margin-bottom:8px;">🏦</div>
            <div>Memuat QRIS...</div>
          </div>
        </div>
        <div id="casirpayTimer" style="font-size:13px;color:#f59e0b;font-weight:600;margin-bottom:16px;">
          ⏳ Menunggu pembayaran...
        </div>
        <div style="display:flex;gap:8px;justify-content:center;">
          <button onclick="document.getElementById('casirpayModal').remove()"
            style="padding:8px 20px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);
            background:transparent;color:#94a3b8;cursor:pointer;font-size:13px;">Batal</button>
          <button onclick="if(typeof onCasirPayConfirm==='function')onCasirPayConfirm()"
            style="padding:8px 20px;border-radius:10px;border:none;
            background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;cursor:pointer;font-size:13px;font-weight:600;">
            Konfirmasi Manual
          </button>
        </div>
        <div style="margin-top:16px;font-size:10px;color:#475569;">
          Didukung oleh CasirPay Gateway • MDR 0.7%
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Try API, fallback to simulated QR
    const result = await this.snapQRIS({ id: orderId, total, customer: {} });
    const qrContainer = document.getElementById('casirpayQRContainer');
    if (result && result.qr_url) {
      qrContainer.innerHTML = `<img src="${result.qr_url}" style="width:180px;height:180px;border-radius:8px;" alt="QRIS">`;
    } else {
      qrContainer.innerHTML = `
        <div style="text-align:center;color:#333;">
          <div style="font-size:48px;margin-bottom:8px;">💳</div>
          <div style="font-size:14px;font-weight:700;color:#1e293b;">QRIS</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">Rp ${total.toLocaleString('id-ID')}</div>
          <div style="margin-top:12px;padding:8px 16px;background:#6366F1;color:#fff;border-radius:8px;font-size:11px;font-weight:600;">
            Bayar di E-Wallet / Mobile Banking
          </div>
        </div>`;
    }

    // Start polling
    let elapsed = 0;
    const timer = document.getElementById('casirpayTimer');
    const interval = setInterval(() => {
      elapsed += 1;
      if (elapsed >= 300) {
        clearInterval(interval);
        timer.innerHTML = '⌛ Waktu habis';
        return;
      }
      timer.innerHTML = `⏳ ${300 - elapsed}s tersisa`;
    }, 1000);

    window.onCasirPayConfirm = () => {
      clearInterval(interval);
      modal.remove();
      if (onPaid) onPaid({ success: true, transactionId: 'QR-' + Date.now().toString(36).toUpperCase() });
    };
  },

  // Xendit-style invoice link
  async createInvoice(order) {
    const serverUrl = localStorage.getItem('pos_server_http_url') || 'http://localhost:3000';
    try {
      const res = await fetch(serverUrl + '/api/payment/invoice', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      return await res.json();
    } catch (e) { return { error: e.message }; }
  }
};

window.CasirPay = CasirPay;
