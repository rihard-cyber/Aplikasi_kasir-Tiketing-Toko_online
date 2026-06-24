// ─── WhatsApp Integration ────────────────────────────────────────────
const NexaWA = {

  // Send receipt via WhatsApp
  sendReceipt(phone, order, storeName = 'NexaPOS') {
    const msg = this._receiptMessage(order, storeName);
    this.open(phone, msg);
  },

  // Send order notification to owner
  notifyOwner(phone, order, storeName = 'NexaPOS') {
    const msg = `🔔 *PESANAN BARU* - ${storeName}\n\n` +
      `📋 *${order.invoiceNo || order.id}*\n` +
      `👤 ${order.customerName || 'Walk-in'}\n` +
      `💰 Rp ${(order.total || 0).toLocaleString('id-ID')}\n` +
      `💳 ${order.paymentMethod || 'Tunai'}\n` +
      `📦 ${(order.items || []).length} item\n\n` +
      `🕐 ${new Date().toLocaleString('id-ID')}`;
    this.open(phone, msg);
  },

  // Send marketing/promo broadcast
  sendPromo(phone, message) {
    this.open(phone, message);
  },

  // Open WhatsApp
  open(phone, text) {
    const cleaned = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/62${cleaned.startsWith('0') ? cleaned.slice(1) : cleaned}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  },

  // Internal: generate receipt message
  _receiptMessage(order, storeName) {
    let msg = `🧾 *${storeName}*\n`;
    msg += `_Struk Pembelian_\n\n`;
    msg += `No: ${order.invoiceNo || order.id}\n`;
    msg += `Tgl: ${new Date().toLocaleString('id-ID')}\n`;
    msg += `Kasir: ${order.cashier || 'N/A'}\n`;
    msg += `─────────────────────\n`;

    (order.items || []).forEach(item => {
      const name = item.name || 'Item';
      const qty = item.qty || 1;
      const price = item.price || 0;
      msg += `${name}\n ${qty} x Rp ${price.toLocaleString('id-ID')} = Rp ${(qty * price).toLocaleString('id-ID')}\n`;
    });

    msg += `─────────────────────\n`;
    msg += `*TOTAL: Rp ${(order.total || 0).toLocaleString('id-ID')}*\n`;
    if (order.paid) msg += `Dibayar: Rp ${order.paid.toLocaleString('id-ID')}\n`;
    if (order.change) msg += `Kembali: Rp ${order.change.toLocaleString('id-ID')}\n`;
    msg += `Bayar: ${order.paymentMethod || 'Tunai'}\n`;
    msg += `\n_Terima kasih_\n`;

    return msg;
  }
};

window.NexaWA = NexaWA;
