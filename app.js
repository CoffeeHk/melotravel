(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const money = n => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(n) || 0);
  const dateFmt = s => { if (!s) return '—'; const d = new Date(s + 'T12:00:00'); return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); };
  const today = () => new Date().toISOString().slice(0, 10);
  const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ================= CATÁLOGOS =================
  const CATEGORIES = {
    expense: ['Combustible','Mantenimiento','Repuestos','Neumáticos','Peajes','Lavado','Seguro / SOAT','Revisión técnica','Compras','Personal','Otro'],
    income:  ['Servicio de transporte','Fletes / carga','Alquiler de unidad','Otro']
  };
  const VEHICLES = ['Vanche', 'Camión JAC', 'Sunray', 'General / oficina'];
  const USERS = [
    { id: 'carlos',   name: 'Carlos',         role: 'employee' },
    { id: 'junior',   name: 'Junior',         role: 'employee' },
    { id: 'jhonatan', name: 'Jhonatan',       role: 'employee' },
    { id: 'admin',    name: 'Administración', role: 'approver' }
  ];
  const DEMO_PIN = '1234';

  // ================= ESTADO =================
  let currentUser = null;
  let page = 'dashboard';
  let selectedReview = null;
  let historyFilter = 'Todos';
  let searchText = '';
  let draftEvidence = [];
  let toastTimer;

  // ================= DATOS DEMO =================
  let records = [
    { id: 1001, date: '2026-10-17', type: 'Egreso',  category: 'Combustible',   customCategory: '', vehicle: 'Camión JAC', amount: 183.10, description: 'Abastecimiento para servicio a Lima', vendor: 'Grifo Lima Norte', account: 'Caja chica', payment: 'Efectivo', submitter: 'Carlos',   status: 'approved',  notes: 'Combustible para recorrido programado.', evidence: [], rejectionReason: '' },
    { id: 1002, date: '2026-10-18', type: 'Ingreso', category: 'Servicio de transporte', customCategory: '', vehicle: 'Vanche', amount: 800, description: 'Servicio de transporte a Chala', vendor: 'Cliente de servicio', account: 'BCP', payment: 'Transferencia', submitter: 'Junior', status: 'approved', notes: 'Servicio completado.', evidence: [], rejectionReason: '' },
    { id: 1003, date: '2026-10-19', type: 'Egreso',  category: 'Repuestos',     customCategory: '', vehicle: 'Vanche', amount: 250, description: 'Compra de repuestos menores', vendor: 'Repuestos Central', account: 'Yape / Plin', payment: 'Yape / Plin', submitter: 'Carlos', status: 'pending', notes: 'Repuestos para revisión del sistema de frenos.', evidence: [], rejectionReason: '' },
    { id: 1004, date: '2026-10-19', type: 'Egreso',  category: 'Mantenimiento', customCategory: '', vehicle: 'Camión JAC', amount: 320, description: 'Cambio de aceite y filtro', vendor: 'Taller JAC', account: 'Caja chica', payment: 'Efectivo', submitter: 'Jhonatan', status: 'pending', notes: 'Mantenimiento periódico. Confirmar kilometraje.', evidence: [], rejectionReason: '' },
    { id: 1005, date: '2026-10-16', type: 'Egreso',  category: 'Peajes',        customCategory: '', vehicle: 'Sunray', amount: 45, description: 'Peajes de recorrido', vendor: 'Peajes ruta sur', account: 'Caja chica', payment: 'Efectivo', submitter: 'Junior', status: 'rejected', notes: 'Falta evidencia legible del pago.', evidence: [], rejectionReason: 'La foto adjunta está borrosa, no se lee el monto.' }
  ];

  // ================= UTILIDADES UI =================
  function toast(msg, type = '') { 
    let old = $('.toast'); if (old) old.remove(); 
    const el = document.createElement('div'); 
    el.className = `toast ${type}`; 
    el.textContent = msg; 
    $('#toastRoot').appendChild(el); 
    clearTimeout(toastTimer); 
    toastTimer = setTimeout(() => el.remove(), 3200); 
  }

  function statusPill(status) { 
    const map = { approved: ['approved','Aprobado'], pending: ['pending','Pendiente'], rejected: ['rejected','Rechazado'] }; 
    const [cl, label] = map[status] || map.pending; 
    return `<span class="pill ${cl}">${label}</span>`; 
  }

  function pageHead(kicker, title, desc, action = '') {
    return `<div class="page-head"><div><div class="eyebrow">${kicker}</div><h2>${title}</h2><p>${desc}</p></div>${action}</div>`;
  }

  function closeModal() { $('#modalRoot').innerHTML = ''; }

  // ================= NAVEGACIÓN =================
  function setPage(next) { 
    page = next; 
    $$('.nav-button').forEach(b => b.classList.toggle('active', b.dataset.page === page)); 
    render(); 
  }

  // ================= RENDERIZADO PRINCIPAL =================
  function render() {
    if (!currentUser) {
      $('#loginScreen').classList.remove('hidden');
      $('#app').classList.add('hidden');
      return;
    }
    $('#loginScreen').class