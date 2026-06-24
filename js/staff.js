// ─── Manajemen Karyawan (Absensi, Komisi, Shift) ─────────────────────
const NexaStaff = {
  attendance: [],

  init() {
    const saved = localStorage.getItem('nexapos_attendance');
    if (saved) { try { this.attendance = JSON.parse(saved); } catch (e) { this.attendance = []; } }
  },

  save() { localStorage.setItem('nexapos_attendance', JSON.stringify(this.attendance)); },

  // Clock In
  clockIn(staffId, staffName) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    // Check if already clocked in today
    const existing = this.attendance.find(a => a.staffId === staffId && a.date === today && !a.clockOut);
    if (existing) return { error: 'Sudah clock in hari ini' };
    const record = {
      id: 'att-' + Date.now().toString(36),
      staffId, staffName,
      date: today,
      clockIn: now.toISOString(),
      clockOut: null,
      status: 'present'
    };
    this.attendance.push(record);
    this.save();
    return record;
  },

  // Clock Out
  clockOut(staffId) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const record = this.attendance.find(a => a.staffId === staffId && a.date === today && !a.clockOut);
    if (!record) return { error: 'Belum clock in hari ini' };
    record.clockOut = now.toISOString();
    const ms = new Date(record.clockOut).getTime() - new Date(record.clockIn).getTime();
    record.hoursWorked = Math.round(ms / 3600000 * 10) / 10;
    this.save();
    return record;
  },

  // Get attendance for date range
  getRange(staffId, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.attendance.filter(a =>
      a.staffId === staffId &&
      new Date(a.date) >= since
    ).sort((a, b) => b.date.localeCompare(a.date));
  },

  // Get today's status
  getToday(staffId) {
    const today = new Date().toISOString().split('T')[0];
    return this.attendance.find(a => a.staffId === staffId && a.date === today);
  },

  // ─── Commission Calculation ──────────────────────────────────────
  calculateCommission(sales, staffId, rate = 0.01) {
    const staffSales = sales.filter(s => s.cashierId === staffId || s.staffId === staffId);
    const totalSales = staffSales.reduce((sum, s) => sum + (s.total || 0), 0);
    return { totalSales, commission: totalSales * rate, rate };
  },

  // ─── Render Absensi UI ───────────────────────────────────────────
  renderAttendance(containerId, staffList) {
    const container = document.getElementById(containerId);
    if (!container) return;
    this.init();
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = this.attendance.filter(a => a.date === today);

    let html = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">
    `;

    (staffList || []).forEach(staff => {
      const rec = todayRecords.find(r => r.staffId === staff.id);
      const isClockedIn = rec && !rec.clockOut;
      html += `
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div>
              <div style="font-weight:600;">${staff.name}</div>
              <div style="font-size:11px;color:var(--text2);">${staff.role || 'Staff'}</div>
            </div>
            <div style="font-size:24px;">${isClockedIn ? '🟢' : '⚪'}</div>
          </div>
          ${rec ? `
            <div style="font-size:12px;color:var(--text2);">
              <div>Masuk: ${new Date(rec.clockIn).toLocaleTimeString('id-ID')}</div>
              ${rec.clockOut ? `<div>Pulang: ${new Date(rec.clockOut).toLocaleTimeString('id-ID')}</div><div>Total: ${rec.hoursWorked} jam</div>` : ''}
            </div>
          ` : '<div style="font-size:11px;color:var(--text3);">Belum absen hari ini</div>'}
          <div style="margin-top:10px;">
            ${isClockedIn
              ? `<button onclick="NexaStaff.clockOut('${staff.id}');NexaStaff.renderAttendance('${containerId}',window._staffList||[])" style="padding:6px 14px;border-radius:8px;border:none;background:#ef4444;color:#fff;cursor:pointer;font-size:12px;">Clock Out</button>`
              : `<button onclick="NexaStaff.clockIn('${staff.id}','${staff.name}');NexaStaff.renderAttendance('${containerId}',window._staffList||[])" style="padding:6px 14px;border-radius:8px;border:none;background:#10b981;color:#fff;cursor:pointer;font-size:12px;">Clock In</button>`
            }
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  },

  // Render Commission UI
  renderCommission(containerId, transactions, staffList) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const rate = 0.01; // Default 1%

    let html = `
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:16px;">
        <div style="font-size:13px;font-weight:600;margin-bottom:12px;">💰 Komisi Karyawan (${(rate * 100)}% dari penjualan)</div>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="font-size:11px;color:var(--text2);">
            <th style="text-align:left;padding:8px;">Karyawan</th>
            <th style="text-align:right;padding:8px;">Total Penjualan</th>
            <th style="text-align:right;padding:8px;">Komisi</th>
          </tr></thead><tbody>
    `;

    (staffList || []).forEach(staff => {
      const calc = NexaStaff.calculateCommission(transactions, staff.id, rate);
      html += `
        <tr style="border-top:1px solid var(--border);">
          <td style="padding:8px;font-weight:500;">${staff.name}</td>
          <td style="padding:8px;text-align:right;">Rp ${calc.totalSales.toLocaleString('id-ID')}</td>
          <td style="padding:8px;text-align:right;color:#10b981;font-weight:600;">Rp ${calc.commission.toLocaleString('id-ID')}</td>
        </tr>
      `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  }
};

window.NexaStaff = NexaStaff;
