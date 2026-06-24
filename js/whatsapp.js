// ─── WhatsApp Integration ────────────────────────────────────────────
const CasirWA = {

  // Send receipt via WhatsApp
  sendReceipt(phone, order, storeName = 'CasirPRO') {
    const msg = this._receiptMessage(order, storeName);
    this.open(phone, msg);
  },

  // Send order notification to owner
  notifyOwner(phone, order, storeName = 'CasirPRO') {
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

  // Alias for sendPromo
  broadcast(promo) {
    const msg = `🏷️ *PROMO SPESIAL*\n\n${promo.name}\n${promo.description || ''}\n\n${promo.type === 'percentage' ? `Diskon ${promo.value}%` : `Diskon Rp ${(promo.value || 0).toLocaleString('id-ID')}`}\n${promo.endDate ? `\nBerlaku sampai: ${new Date(promo.endDate).toLocaleDateString('id-ID')}` : ''}\n\nKunjungi toko kami!`;
    const cleaned = prompt('Masukkan no. HP tujuan broadcast (pisahkan dengan koma):', '');
    if (cleaned) {
      cleaned.split(',').forEach(p => {
        const phone = p.trim();
        if (phone) this.open(phone, msg);
      });
    }
  },

  // Send order notification
  sendOrderNotification(order, storePhone) {
    const msg = `🔔 *PESANAN BARU*\n\n` +
      `🆔 ${order.invoiceNo || order.id}\n` +
      `👤 ${order.customerName || '-'}\n` +
      `💰 Rp ${(order.total || 0).toLocaleString('id-ID')}\n` +
      `💳 ${order.paymentMethod || '-'}\n` +
      `📦 ${(order.items || []).length} item\n\n` +
      `Terima kasih telah berbelanja!`;
    this.open(storePhone || '6281234567890', msg);
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

window.CasirWA = CasirWA;
