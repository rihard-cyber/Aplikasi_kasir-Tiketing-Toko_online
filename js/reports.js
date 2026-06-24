// ─── Laporan Keuangan (Neraca, Laba Rugi, Arus Kas) ──────────────────
const NexaReports = {

  // ─── Laba Rugi (Profit & Loss) ──────────────────────────────────
  profitLoss(transactions, products, period = 'all') {
    const filtered = this._filterPeriod(transactions, period);
    const totalRevenue = filtered.reduce((s, t) => s + (t.total || 0), 0);
    const totalCost = filtered.reduce((s, t) => {
      const itemCost = (t.items || []).reduce((si, item) => {
        const prod = (products || []).find(p => p.id === item.id || p.name === item.name);
        return si + ((prod ? prod.cost || 0 : 0) * (item.qty || 1));
      }, 0);
      return s + itemCost;
    }, 0);
    const grossProfit = totalRevenue - totalCost;
    const expenses = filtered.reduce((s, t) => s + (t.expense || 0), 0);
    const netProfit = grossProfit - expenses;

    return {
      period: { label: this._periodLabel(period), from: filtered.length ? filtered[0].date : null, to: filtered.length ? filtered[filtered.length - 1].date : null },
      revenue: totalRevenue,
      costOfGoods: totalCost,
      grossProfit,
      grossMargin: totalRevenue ? ((grossProfit / totalRevenue) * 100).toFixed(1) + '%' : '0%',
      expenses,
      netProfit,
      netMargin: totalRevenue ? ((netProfit / totalRevenue) * 100).toFixed(1) + '%' : '0%',
      transactionCount: filtered.length
    };
  },

  // ─── Neraca (Balance Sheet) ─────────────────────────────────────
  balanceSheet(transactions, settings = {}) {
    const totalRevenue = transactions.reduce((s, t) => s + (t.total || 0), 0);
    const totalReceivable = transactions
      .filter(t => t.paymentMethod === 'credit' || t.paymentStatus === 'unpaid')
      .reduce((s, t) => s + (t.total || 0), 0);
    const cashInHand = totalRevenue - totalReceivable;
    const inventory = settings.inventoryValue || 0;
    const totalAssets = cashInHand + totalReceivable + inventory;

    const liabilities = settings.liabilities || 0;
    const equity = settings.initialCapital || 0;
    const retainedEarnings = totalRevenue - (settings.totalExpenses || 0);
    const totalEquity = equity + retainedEarnings;
    const totalLiabilitiesEquity = liabilities + totalEquity;

    return {
      date: new Date().toISOString().split('T')[0],
      assets: {
        cash: cashInHand,
        receivable: totalReceivable,
        inventory,
        total: totalAssets
      },
      liabilities: { total: liabilities },
      equity: {
        initialCapital: equity,
        retainedEarnings,
        total: totalEquity
      },
      totalLiabilitiesEquity
    };
  },

  // ─── Arus Kas (Cash Flow) ───────────────────────────────────────
  cashFlow(transactions, period = 'monthly') {
    const grouped = {};
    transactions.forEach(t => {
      let key;
      const d = new Date(t.date || t.timestamp || Date.now());
      if (period === 'daily') key = d.toISOString().split('T')[0];
      else if (period === 'monthly') key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      else key = d.getFullYear().toString();
      if (!grouped[key]) grouped[key] = { period: key, inflow: 0, outflow: 0, net: 0, count: 0 };
      grouped[key].inflow += t.total || 0;
      grouped[key].count++;
    });
    const result = Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
    result.forEach(r => r.net = r.inflow - r.outflow);
    return result;
  },

  // ─── Export CSV ─────────────────────────────────────────────────
  exportCSV(data, filename = 'laporan.csv') {
    const BOM = '\uFEFF';
    const rows = [];
    if (data.length) rows.push(Object.keys(data[0]).join(','));
    data.forEach(row => {
      rows.push(Object.values(row).map(v => typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v).join(','));
    });
    const blob = new Blob([BOM + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  // ─── Export PDF (simple) ────────────────────────────────────────
  exportPDF(title, content, filename = 'laporan.pdf') {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>${title}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:20px;color:#333;}
        h1{color:#1e293b;border-bottom:2px solid #6366F1;padding-bottom:8px;}
        table{width:100%;border-collapse:collapse;margin:10px 0;}
        th,td{padding:8px;text-align:left;border-bottom:1px solid #e2e8f0;}
        th{background:#f1f5f9;font-weight:600;}
        .total{font-weight:700;font-size:16px;color:#6366F1;}
        .footer{margin-top:20px;font-size:11px;color:#94a3b8;text-align:center;}
      </style></head><body>
      <h1>${title}</h1>
      ${content}
      <div class="footer">Dicetak dari NexaPOS v5.0 • ${new Date().toLocaleString('id-ID')}</div>
      <script>window.onload=function(){window.print();}<\/script>
      </body></html>
    `);
    win.document.close();
  },

  // ─── Helpers ────────────────────────────────────────────────────
  _filterPeriod(transactions, period) {
    if (period === 'all') return transactions;
    const now = new Date();
    let start;
    if (period === 'today') start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (period === 'week') { start = new Date(now); start.setDate(now.getDate() - 7); }
    else if (period === 'month') start = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (period === 'year') start = new Date(now.getFullYear(), 0, 1);
    return transactions.filter(t => new Date(t.date || t.timestamp || 0) >= start);
  },

  _periodLabel(period) {
    return { all: 'Semua Periode', today: 'Hari Ini', week: '7 Hari', month: 'Bulan Ini', year: 'Tahun Ini' }[period] || period;
  }
};

window.NexaReports = NexaReports;
