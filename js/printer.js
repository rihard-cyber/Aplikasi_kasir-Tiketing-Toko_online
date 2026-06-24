// ─── Thermal Printer (ESC/POS via Web Bluetooth) ─────────────────────
const CasirPrint = {
  device: null, service: null, char: null,

  // ESC/POS commands
  CMD: {
    INIT: [0x1B, 0x40],
    LF: [0x0A],
    CUT: [0x1D, 0x56, 0x00],
    BOLD_ON: [0x1B, 0x45, 0x01],
    BOLD_OFF: [0x1B, 0x45, 0x00],
    ALIGN_CENTER: [0x1B, 0x61, 0x01],
    ALIGN_LEFT: [0x1B, 0x61, 0x00],
    ALIGN_RIGHT: [0x1B, 0x61, 0x02],
    FONT_LARGE: [0x1D, 0x21, 0x11],
    FONT_NORMAL: [0x1D, 0x21, 0x00],
    QR_CODE: [0x1D, 0x6B, 0x73]
  },

  text(str) { return new TextEncoder().encode(str + '\n'); },

  async connect() {
    if (!navigator.bluetooth) { alert('Browser tidak mendukung Bluetooth. Gunakan Chrome/Edge di Android atau Desktop.'); return false; }
    try {
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });
      const server = await this.device.gatt.connect();
      this.service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      this.char = await this.service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
      return true;
    } catch (e) {
      // Fallback: try serial over WebUSB or just show error
      console.error('Bluetooth printer error:', e);
      alert('Gagal konek printer: ' + e.message);
      return false;
    }
  },

  async print(data) {
    if (this.char) {
      try { await this.char.writeValue(data); } catch (e) { console.error('Print error:', e); }
    } else {
      console.warn('No printer connected');
    }
  },

  async printReceipt(order, storeName = 'CasirPRO') {
    const enc = new TextEncoder();
    let buf = [];

    const w = (cmd) => { buf = buf.concat(Array.from(cmd)); };
    const s = (str) => { buf = buf.concat(Array.from(enc.encode(str))); };

    w(this.CMD.INIT);

    // Header
    w(this.CMD.ALIGN_CENTER);
    w(this.CMD.BOLD_ON);
    s(storeName + '\n');
    w(this.CMD.BOLD_OFF);
    s('Jl. Contoh No. 123\n');
    s('Telp: 021-1234567\n');
    s('==============================\n');

    // Info
    w(this.CMD.ALIGN_LEFT);
    s('Order: ' + (order.invoiceNo || order.id) + '\n');
    s('Tanggal: ' + new Date().toLocaleString('id-ID') + '\n');
    s('Kasir: ' + (order.cashier || 'N/A') + '\n');
    s('-----------------------------\n');

    // Items
    if (order.items) {
      order.items.forEach(item => {
        const name = (item.name || 'Item').substring(0, 24);
        const qty = item.qty || 1;
        const price = item.price || 0;
        s(name + '\n');
        s('  ' + qty + ' x Rp ' + price.toLocaleString('id-ID') +
          '  = Rp ' + (qty * price).toLocaleString('id-ID') + '\n');
      });
    }

    s('-----------------------------\n');

    // Totals
    s('Subtotal: Rp ' + (order.subtotal || order.total || 0).toLocaleString('id-ID') + '\n');
    if (order.discount) s('Diskon: Rp ' + order.discount.toLocaleString('id-ID') + '\n');
    if (order.shippingCost) s('Ongkir: Rp ' + order.shippingCost.toLocaleString('id-ID') + '\n');
    w(this.CMD.BOLD_ON);
    s('TOTAL: Rp ' + (order.total || 0).toLocaleString('id-ID') + '\n');
    w(this.CMD.BOLD_OFF);

    s('-----------------------------\n');

    // Payment
    s('Bayar: ' + (order.paymentMethod || 'Tunai') + '\n');
    if (order.paid) s('Dibayar: Rp ' + order.paid.toLocaleString('id-ID') + '\n');
    if (order.change) s('Kembali: Rp ' + order.change.toLocaleString('id-ID') + '\n');

    // Footer
    w(this.CMD.ALIGN_CENTER);
    s('\nTerima kasih atas kunjungan Anda\n');
    s('~ Barang yang sudah dibeli tidak dapat\n');
    s('   dikembalikan kecuali ada cacat ~\n');
    s('\n');
    s('Powered by CasirPRO v5.0\n');

    // Cut
    w(this.CMD.LF);
    w(this.CMD.LF);
    w(this.CMD.LF);
    w(this.CMD.CUT);

    await this.print(new Uint8Array(buf));
  },

  // Print barcode label
  async printBarcode(text, label = '') {
    const enc = new TextEncoder();
    let buf = [];
    const w = (cmd) => { buf = buf.concat(Array.from(cmd)); };
    const s = (str) => { buf = buf.concat(Array.from(enc.encode(str))); };

    w(this.CMD.INIT);
    w(this.CMD.ALIGN_CENTER);
    if (label) { s(label + '\n'); }
    // Code 128 barcode
    w([0x1D, 0x6B, 0x49]);
    w([text.length + 2]);
    w([0x7B, 0x42]);
    s(text);
    s('\n');
    w(this.CMD.LF);
    w(this.CMD.CUT);

    await this.print(new Uint8Array(buf));
  },

  // Print as HTML fallback (when no Bluetooth)
  printHTML(receiptHtml) {
    const win = window.open('', '_blank', 'width=400,height=600');
    if (!win) { alert('Izinkan popup untuk mencetak struk'); return; }
    win.document.write(`
      <html><head><title>Print Struk</title>
      <style>
        body{font-family:'Courier New',monospace;font-size:12px;width:58mm;margin:0 auto;padding:5px;}
        @page{width:58mm;margin:0;} @media print{body{width:58mm;}}
        .center{text-align:center;} .bold{font-weight:700;} .line{border-top:1px dashed #000;margin:5px 0;}
      </style></head><body>
      ${receiptHtml}
      <script>window.onload=function(){window.print();setTimeout(function(){window.close()},500)}</script>
      </body></html>
    `);
    win.document.close();
  },

  // Generate receipt HTML for browser printing
  generateReceiptHTML(order, storeName = 'CasirPRO') {
    const itemsHtml = (order.items || []).map(item =>
      `<div>${(item.name || 'Item')} x${item.qty || 1}</div>
       <div style="text-align:right;">Rp ${(item.qty * item.price).toLocaleString('id-ID')}</div>`
    ).join('<div class="line"></div>');

    return `
      <div class="center bold" style="font-size:16px;">${storeName}</div>
      <div class="center" style="font-size:10px;">Jl. Contoh No. 123</div>
      <div class="line"></div>
      <div><b>${order.invoiceNo || order.id}</b></div>
      <div>${new Date().toLocaleString('id-ID')}</div>
      <div class="line"></div>
      ${itemsHtml}
      <div class="line"></div>
      <div class="bold" style="text-align:right;font-size:14px;">
        TOTAL: Rp ${(order.total || 0).toLocaleString('id-ID')}
      </div>
      <div class="line"></div>
      <div>Bayar: ${order.paymentMethod || 'Tunai'}</div>
      ${order.paid ? `<div>Dibayar: Rp ${order.paid.toLocaleString('id-ID')}</div>` : ''}
      ${order.change ? `<div>Kembali: Rp ${order.change.toLocaleString('id-ID')}</div>` : ''}
      <div class="center" style="margin-top:10px;font-size:10px;">
        Terima kasih<br>Powered by CasirPRO v5.0
      </div>
    `;
  }
};

window.CasirPrint = CasirPrint;
