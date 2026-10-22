(() => {
'use strict';

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const fmt = value => new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(Number(value)||0);
const fmtShort = value => Number(value||0).toLocaleString('es-PE',{minimumFractionDigits:0,maximumFractionDigits:0});
const localDate = () => {const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const dateFmt = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('es-PE',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const timeFmt = value => value ? new Date(value).toLocaleString('es-PE',{dateStyle:'short',timeStyle:'short'}) : '—';
const abbreviate = value => String(value||'').split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase();
const storageKey = 'melo-travel-demo-v2';
const users = [
  {id:'carlos',name:'Carlos',role:'employee'},
  {id:'junior',name:'Junior',role:'employee'},
  {id:'jhonatan',name:'Jhonatan',role:'employee'},
  {id:'admin',name:'Administración',role:'approver'}
];
const categories = {
  Egreso:['Combustible','Mantenimiento','Repuestos','Neumáticos','Peajes','Lavado','Seguro / SOAT','Revisión técnica','Compras','Personal','Otro'],
  Ingreso:['Servicio de transporte','Fletes / carga','Alquiler de unidad','Otro']
};
const seedRecords = [
  {id:1001,date:'2026-10-17',type:'Egreso',category:'Combustible',vehicle:'Camión JAC',amount:183.10,description:'Abastecimiento para servicio a Lima',vendor:'Grifo Lima Norte',account:'Caja chica',payment:'Efectivo',submitter:'Carlos',submitterId:'carlos',status:'approved',notes:'Combustible para recorrido programado.',evidence:[],reviewer:'Administración',reviewedAt:'2026-10-18T14:10:00',rejectionReason:''},
  {id:1002,date:'2026-10-18',type:'Ingreso',category:'Servicio de transporte',vehicle:'Vanche',amount:800,description:'Servicio de transporte a Chala',vendor:'Cliente de servicio',account:'BCP',payment:'Transferencia',submitter:'Junior',submitterId:'junior',status:'approved',notes:'Servicio completado.',evidence:[],reviewer:'Administración',reviewedAt:'2026-10-19T12:20:00',rejectionReason:''},
  {id:1003,date:'2026-10-19',type:'Egreso',category:'Repuestos',vehicle:'Vanche',amount:250,description:'Compra de repuestos menores',vendor:'Repuestos Central',account:'Yape / Plin',payment:'Yape / Plin',submitter:'Carlos',submitterId:'carlos',status:'pending',notes:'Repuestos para revisión del sistema de frenos.',evidence:[],rejectionReason:''},
  {id:1004,date:'2026-10-19',type:'Egreso',category:'Mantenimiento',vehicle:'Camión JAC',amount:320,description:'Cambio de aceite y filtro',vendor:'Taller JAC',account:'Caja chica',payment:'Efectivo',submitter:'Jhonatan',submitterId:'jhonatan',status:'pending',notes:'Mantenimiento periódico. Confirmar kilometraje.',evidence:[],rejectionReason:''},
  {id:1005,date:'2026-10-16',type:'Egreso',category:'Peajes',vehicle:'Sunray',amount:45,description:'Peajes de recorrido',vendor:'Peajes ruta sur',account:'Caja chica',payment:'Efectivo',submitter:'Junior',submitterId:'junior',status:'rejected',notes:'Falta evidencia legible del pago.',evidence:[],reviewer:'Administración',reviewedAt:'2026-10-17T12:15:00',rejectionReason:'La foto adjunta está borrosa, no se lee el monto.'}
];
const icons = {
  'layout-dashboard':'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  'plus-circle':'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  'clipboard-check':'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M8.5 13l2.5 2.5 4.5-5"/>',
  'list':'<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  'bar-chart':'<path d="M4 20V12M10 20V4M16 20v-9M22 20V8"/>',
  'truck':'<path d="M3 5h12v12H3zM15 9h4l3 4v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  'logout':'<path d="M10 17l5-5-5-5M15 12H3M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
  'menu':'<path d="M4 6h16M4 12h16M4 18h16"/>',
  'eye':'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off':'<path d="M3 3l18 18M10.6 5.1A11 11 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3 3.7M6 6.3C3.5 8.2 2 12 2 12s3.6 7 10 7c1.7 0 3.3-.5 4.6-1.3"/>',
  'calendar':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
  'trend-up':'<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  'trend-down':'<path d="M3 7l6 6 4-4 8 8M15 17h6v-6"/>',
  'wallet':'<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 10h18M15 15h3M6 6V3h12"/>',
  'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
  'arrow-right':'<path d="M5 12h14M13 6l6 6-6 6"/>',
  'download':'<path d="M12 3v13M7 11l5 5 5-5M4 18v3h16v-3"/>',
  'chevron-down':'<path d="M6 9l6 6 6-6"/>',
  'file-text':'<path d="M6 3h8l5 5v13H6zM14 3v5h5M9 13h7M9 17h7"/>',
  'shield-check':'<path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5zM8 12l3 3 5-5"/>',
  'image':'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m4 18 5-5 4 4 3-3 5 5"/>',
  'search':'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
  'filter':'<path d="M4 5h16l-6.5 7v7l-3 2v-9z"/>',
  'check':'<path d="M5 12l4 4L19 6"/>',
  'x':'<path d="M5 5l14 14M19 5 5 19"/>',
  'info':'<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
  'refresh':'<path d="M20 7V3l-4 4M4 17v4l4-4M4.7 9a8 8 0 0 1 13.7-3M19.3 15a8 8 0 0 1-13.7 3"/>',
  'printer':'<path d="M6 9V3h12v6M6 18H4V9h16v9h-2M7 15h10v6H7z"/>',
  'receipt':'<path d="M5 3h14v19l-3-2-4 2-4-2-3 2zM8 8h8M8 12h8M8 16h5"/>',
  'layers':'<path d="m12 2 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',
  'shield':'<path d="M12 2l9 4v6c0 5-3.6 8.3-9 10-5.4-1.7-9-5-9-10V6z"/>',
  'file-spreadsheet':'<path d="M5 3h10l4 4v14H5zM15 3v4h4M8 11h8M8 15h8M12 11v8"/>'
};
const icon = (name,size=19) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.info}</svg>`;

const freshState = () => ({records:seedRecords.map(x=>({...x})),vehicles:['Vanche','Camión JAC','Sunray','General / oficina']});
function loadData(){
  try {const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
    if(saved && Array.isArray(saved.records) && Array.isArray(saved.vehicles) && saved.vehicles.length) return saved;
  } catch(error){console.warn('No se pudieron leer los datos locales.',error);}
  return freshState();
}
let data=loadData();
function persist(){
  try {localStorage.setItem(storageKey,JSON.stringify(data));return true;}
  catch(error){toast('Almacenamiento local lleno. Los últimos cambios podrían perderse al recargar.','error');return false;}
}
let currentUser=null;
let page='dashboard';
let selectedReview=null;
let attachedImages=[];
let toastTimer=null;
let dashPeriod='month';
let dashDay=localDate();
let dashMonth=localDate().slice(0,7);
let dashYear=localDate().slice(0,4);
let dashVehicle='Todos';
let dashSearch='';
let historyStatus='Todos', historyType='Todos', historyVehicle='Todos', historySearch='';
let reportVehicle='Todos', reportPeriod='all';
let reportDay=localDate(), reportMonth=localDate().slice(0,7), reportYear=localDate().slice(0,4);
let reportFrom=localDate().slice(0,7)+'-01', reportTo=localDate(), reportSearch='';
function filteredReportRows(){
 let rows=periodFilter(visibleRecords(),reportPeriod,reportDay,reportMonth,reportYear);
 if(reportPeriod==='range'){
  if(!reportFrom || !reportTo || reportFrom>reportTo) return [];
  rows=rows.filter(r=>r.date>=reportFrom && r.date<=reportTo);
 }
 if(reportVehicle!=='Todos') rows=rows.filter(r=>r.vehicle===reportVehicle);
 if(reportSearch.trim()){
  const q=reportSearch.trim().toLowerCase();
  rows=rows.filter(r=>[r.description,r.vendor,r.category,r.submitter,r.vehicle,r.type,r.date,r.id].join(' ').toLowerCase().includes(q));
 }
 return rows;
}
function reportPeriodLabel(){
 return ({all:'Histórico general',day:dateFmt(reportDay),month:reportMonth,year:reportYear,range:`${dateFmt(reportFrom)} — ${dateFmt(reportTo)}`})[reportPeriod];
}
const isAdmin=()=>currentUser?.role==='approver';
const visibleRecords=()=>isAdmin()?data.records:data.records.filter(r=>r.submitterId===currentUser?.id || (!r.submitterId && r.submitter===currentUser?.name));
const approvedRows=rows=>rows.filter(r=>r.status==='approved');
const total=(rows,type)=>rows.filter(r=>r.type===type).reduce((sum,r)=>sum+Number(r.amount),0);
const sortNewest=rows=>[...rows].sort((a,b)=>(b.date||'').localeCompare(a.date||'') || b.id-a.id);
const pill=status=>`<span class="pill ${esc(status)}">${({approved:'Aprobado',pending:'Pendiente',rejected:'Rechazado'})[status]||'Pendiente'}</span>`;
const pageTitle=()=>({dashboard:'Panel general',new:'Registrar movimiento',review:'Aprobaciones',history:'Historial',reports:'Reportes',vehicles:'Vehículos'})[page]||'Panel general';
function toast(msg,type=''){
  $('#toastRoot').innerHTML=`<div class="toast ${type}">${esc(msg)}</div>`;
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('#toastRoot').innerHTML='';},3900);
}
function pageHead(kicker,title,subtitle,actions=''){
 return `<div class="page-head"><div><span class="eyebrow">${esc(kicker)}</span><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div><div class="page-head-actions">${actions}</div></div>`;
}
function empty(title,desc=''){
 return `<div class="empty"><div class="empty-illustration">${icon('file-text',25)}</div><strong>${esc(title)}</strong><p>${esc(desc)}</p></div>`;
}
function periodFilter(rows,period,day,month,year){
 if(period==='day')return rows.filter(r=>r.date===day);
 if(period==='month')return rows.filter(r=>(r.date||'').slice(0,7)===month);
 if(period==='year')return rows.filter(r=>(r.date||'').slice(0,4)===year);
 return rows;
}
function render(){
 if(!currentUser){$('#loginScreen').classList.remove('hidden');$('#app').classList.add('hidden');return;}
 $('#loginScreen').classList.add('hidden');$('#app').classList.remove('hidden');
 $('#userChip').textContent=currentUser.name;
 $('#userRole').textContent=isAdmin()?'Administrador':'Colaborador';
 $('#userAvatar').textContent=abbreviate(currentUser.name);
 $('#todayTag').textContent=new Date().toLocaleDateString('es-PE',{day:'2-digit',month:'short',year:'numeric'});
 $('#breadcrumbPage').textContent=pageTitle();
 $('#pendingNavCount').textContent=visibleRecords().filter(r=>r.status==='pending').length;
 $$('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
 $('#main').innerHTML=({dashboard:renderDashboard,new:renderNew,review:renderReview,history:renderHistory,reports:renderReports,vehicles:renderVehicles})[page]();
 $$('.nav-icon').forEach(el=>{if(!el.dataset.ready){el.innerHTML=icon(el.dataset.icon);el.dataset.ready='1';}});
 bindPage();
}
function setPage(next){
 if(!['dashboard','new','review','history','reports','vehicles'].includes(next))return;
 page=next;closeMobileMenu();render();window.scrollTo(0,0);
}

function chartBuckets(rows){
 const buckets=Array.from({length:6},(_,i)=>({label:'',in:0,out:0}));
 const mo=Number(dashMonth.slice(5,7));
 if(dashPeriod==='month' || dashPeriod==='day'){
  const m=dashPeriod==='day'?dashDay.slice(0,7):dashMonth;
  const ends=[5,10,15,20,25,31];
  buckets.forEach((b,i)=>b.label=`${i===0?1:ends[i-1]+1}–${ends[i]}`);
  rows.filter(r=>r.date.slice(0,7)===m).forEach(r=>{const d=Number(r.date.slice(8,10));const idx=Math.min(5,ends.findIndex(end=>d<=end));if(r.type==='Ingreso')buckets[idx].in+=r.amount;else buckets[idx].out+=r.amount;});
 }else if(dashPeriod==='year'){
  const labels=['Ene–Feb','Mar–Abr','May–Jun','Jul–Ago','Sep–Oct','Nov–Dic'];
  buckets.forEach((b,i)=>b.label=labels[i]);
  rows.filter(r=>r.date.startsWith(dashYear)).forEach(r=>{const idx=Math.floor((Number(r.date.slice(5,7))-1)/2);if(idx>=0 && idx<6){if(r.type==='Ingreso')buckets[idx].in+=r.amount;else buckets[idx].out+=r.amount;}});
 }else{
  const labels=['Ene–Feb','Mar–Abr','May–Jun','Jul–Ago','Sep–Oct','Nov–Dic'];
  buckets.forEach((b,i)=>b.label=labels[i]);
  const year=Math.max(Number(dashYear),...rows.map(r=>Number(r.date.slice(0,4))||0));
  rows.filter(r=>r.date.startsWith(String(year))).forEach(r=>{const idx=Math.floor((Number(r.date.slice(5,7))-1)/2);if(idx>=0 && idx<6){if(r.type==='Ingreso')buckets[idx].in+=r.amount;else buckets[idx].out+=r.amount;}});
 }
 return buckets;
}
function chartHTML(scoped){
 // Chart is based on actual approved movement amounts, not invented sample bars.
 const buckets=chartBuckets(scoped);
 const max=Math.max(1,...buckets.map(x=>Math.max(x.in,x.out)));
 return `<div class="panel"><div class="panel-head"><div><h3>Comportamiento financiero</h3><p>Ingresos y egresos aprobados por periodo</p></div><div class="chart-legend"><span><i></i> Ingresos</span><span class="red"><i></i> Egresos</span></div></div>
 <div class="bars-chart">${buckets.map(b=>`<div class="chart-period"><div class="bar-pair"><div title="Ingresos: ${fmt(b.in)}" class="bar income ${b.in?'has-data':''}" style="height:${Math.min(100,b.in/max*100)}%"></div><div title="Egresos: ${fmt(b.out)}" class="bar expense ${b.out?'has-data':''}" style="height:${Math.min(100,b.out/max*100)}%"></div></div></div>`).join('')}</div>
 <div style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px">${buckets.map(b=>`<div class="bar-label">${esc(b.label)}</div>`).join('')}</div>
 <div class="chart-total"><span>Movimiento aprobado en el filtro actual</span><strong>${scoped.length} registros</strong></div></div>`;
}
const categoryColors=['#df1d43','#e97548','#f3b658','#3158b4','#7c61c2','#0c9c6b','#8a96ad'];
function categoryHTML(scoped){
 const groups={};scoped.filter(r=>r.type==='Egreso').forEach(r=>{const cat=r.category==='Otro' && r.customCategory?r.customCategory:r.category;groups[cat]=(groups[cat]||0)+Number(r.amount);});
 const ordered=Object.entries(groups).sort((a,b)=>b[1]-a[1]);
 const sum=ordered.reduce((n,x)=>n+x[1],0);
 let cursor=0;
 const stops=ordered.map(([_,value],index)=>{const start=cursor;cursor+=100*value/sum;return `${categoryColors[index%categoryColors.length]} ${start.toFixed(3)}% ${cursor.toFixed(3)}%`;});
 const gradient=sum?`conic-gradient(${stops.join(',')})`:'conic-gradient(#ebeff5 0 100%)';
 return `<div class="panel"><div class="panel-head"><div><h3>Distribución de gastos</h3><p>Por categoría, solo aprobados</p></div></div><div class="donut-wrap"><div class="donut" style="background:${gradient}"><div class="donut-hole"><strong>${sum?fmtShort(sum):'—'}</strong><span>Total S/</span></div></div></div>${ordered.length?`<div class="category-list">${ordered.slice(0,5).map(([cat,val],i)=>`<div class="category-line"><div class="category-left"><i style="background:${categoryColors[i%categoryColors.length]}"></i><span title="${esc(cat)}">${esc(cat)}</span></div><b>${(val/sum*100).toFixed(1)}%</b></div>`).join('')}</div>`:`<div class="footer-note" style="text-align:center">Aún no hay gastos aprobados en este filtro.</div>`}</div>`;
}
function tableHTML(rows,compact=false){
 if(!rows.length)return empty('Sin movimientos para mostrar','Modifica los filtros o registra una nueva operación.');
 return `<div class="table-wrap"><table><thead><tr><th>ID / fecha</th><th>Descripción</th><th>Vehículo</th><th>Responsable</th><th>Estado</th><th class="text-right">Importe</th></tr></thead><tbody>${rows.map(r=>`<tr data-detail="${Number(r.id)}"><td><span class="thin-id">#${Number(r.id)}</span><div>${dateFmt(r.date)}</div></td><td><strong>${esc(r.description)}</strong><div class="row-sub">${esc(r.category==='Otro'&&r.customCategory?r.customCategory:r.category)} · ${esc(r.type)}</div></td><td>${esc(r.vehicle)}</td><td>${esc(r.submitter)}</td><td>${pill(r.status)}</td><td class="text-right amount ${r.type==='Ingreso'?'income-text':'expense-text'}">${r.type==='Ingreso'?'+':'−'}${fmt(r.amount)}</td></tr>`).join('')}</tbody></table></div>`;
}
function renderDashboard(){
 const base=visibleRecords();
 const filtered=periodFilter(base,dashPeriod,dashDay,dashMonth,dashYear).filter(r=>(dashVehicle==='Todos'||r.vehicle===dashVehicle) && (!dashSearch || [r.description,r.vendor,r.category,r.submitter,r.vehicle,r.type].join(' ').toLowerCase().includes(dashSearch.toLowerCase())));
 const accepted=approvedRows(filtered), income=total(accepted,'Ingreso'), expense=total(accepted,'Egreso'), balance=income-expense;
 const recent=sortNewest(filtered).slice(0,7);
 const fleet=data.vehicles.map(name=>({name,amount:accepted.filter(r=>r.vehicle===name&&r.type==='Egreso').reduce((s,r)=>s+r.amount,0)})).filter(v=>v.amount>0).sort((a,b)=>b.amount-a.amount).slice(0,4);
 const fleetTotal=fleet.reduce((s,v)=>s+v.amount,0);
 const periodLabel=dashPeriod==='month'?dashMonth:dashPeriod==='day'?dashDay:dashPeriod==='year'?dashYear:'Histórico general';
 return `<div class="welcome-bar"><div><span class="eyebrow">CENTRO DE CONTROL</span><h1>${isAdmin()?'Panel financiero':'Mi panel financiero'}</h1><p>Control de ingresos, egresos y movimientos de Melo Travel.</p></div><button class="btn btn-primary" data-go="new">${icon('plus-circle',17)} Registrar movimiento</button></div>
 <div class="panel dashboard-filters"><div class="field"><label for="dPeriod">PERIODO</label><select id="dPeriod"><option value="month" ${dashPeriod==='month'?'selected':''}>Por mes</option><option value="day" ${dashPeriod==='day'?'selected':''}>Por día</option><option value="year" ${dashPeriod==='year'?'selected':''}>Por año</option><option value="all" ${dashPeriod==='all'?'selected':''}>Histórico general</option></select></div>
 ${dashPeriod==='day'?`<div class="field"><label>DÍA</label><input id="dDate" type="date" value="${esc(dashDay)}"></div>`:''}
 ${dashPeriod==='month'?`<div class="field"><label>MES</label><input id="dMonth" type="month" value="${esc(dashMonth)}"></div>`:''}
 ${dashPeriod==='year'?`<div class="field"><label>AÑO</label><select id="dYear">${Array.from(new Set([...base.map(r=>r.date.slice(0,4)),localDate().slice(0,4)] )).sort().reverse().map(y=>`<option value="${esc(y)}" ${dashYear===y?'selected':''}>${esc(y)}</option>`).join('')}</select></div>`:''}
 <div class="field"><label for="dVehicle">VEHÍCULO</label><select id="dVehicle"><option value="Todos">Todos los vehículos</option>${data.vehicles.map(v=>`<option ${dashVehicle===v?'selected':''}>${esc(v)}</option>`).join('')}</select></div>
 <div class="field search-field"><label for="dSearch">BUSCAR OPERACIÓN</label><input id="dSearch" placeholder="Descripción, proveedor, responsable…" value="${esc(dashSearch)}"></div>
 <button type="button" class="btn btn-small" id="dReset" title="Limpiar filtros">${icon('refresh',14)} Limpiar</button></div>
 <section class="metrics"><div class="metric"><div class="metric-kicker"><span>Ingresos aprobados</span><div class="metric-icon">${icon('trend-up',21)}</div></div><div class="metric-value positive">${fmt(income)}</div><div class="metric-foot">Según los filtros aplicados</div></div>
 <div class="metric"><div class="metric-kicker"><span>Egresos aprobados</span><div class="metric-icon red">${icon('trend-down',21)}</div></div><div class="metric-value">${fmt(expense)}</div><div class="metric-foot">Según los filtros aplicados</div></div>
 <div class="metric"><div class="metric-kicker"><span>Balance neto</span><div class="metric-icon blue">${icon('wallet',21)}</div></div><div class="metric-value ${balance<0?'negative':''}">${fmt(balance)}</div><div class="metric-foot">Ingresos menos egresos aprobados</div></div>
 <div class="metric"><div class="metric-kicker"><span>Pendientes de revisión</span><div class="metric-icon gold">${icon('clock',21)}</div></div><div class="metric-value">${filtered.filter(r=>r.status==='pending').length}</div><div class="metric-foot">Movimientos aún no contabilizados</div></div></section>
 <div class="dashboard-chart-grid">${chartHTML(accepted)}${categoryHTML(accepted)}</div>
 <div class="bottom-grid"><div class="panel"><div class="panel-head"><div><h3>Últimos movimientos</h3><p>Operaciones del periodo ${esc(periodLabel)}</p></div><button class="small-link" data-go="history">Ver historial →</button></div>${tableHTML(recent,true)}</div>
 <div class="panel quick-access-panel"><div class="panel-head"><div><h3>Accesos rápidos</h3><p>Operaciones frecuentes</p></div></div><div class="quick-access-buttons"><button class="quick-action" data-go="new">${icon('plus-circle')} <span>Registrar movimiento</span>${icon('arrow-right',15)}</button><button class="quick-action" data-go="review">${icon('clipboard-check')} <span>${isAdmin()?'Revisar aprobaciones':'Ver estado de mis registros'}</span>${icon('arrow-right',15)}</button><button class="quick-action" data-go="reports">${icon('bar-chart')} <span>Consultar reportes</span>${icon('arrow-right',15)}</button><button class="quick-action" data-go="vehicles">${icon('truck')} <span>Consultar vehículos</span>${icon('arrow-right',15)}</button>
 </div><div class="fleet-mini"><div class="panel-head" style="margin-bottom:3px"><div><h3>Gastos por vehículo</h3><p>Periodo seleccionado</p></div></div>${fleet.length?fleet.map(f=>`<div class="fleet-line"><div class="fleet-line-top"><span>${esc(f.name)}</span><strong>${fmt(f.amount)}</strong></div><div class="progress-track"><div class="progress-bar ${f.amount===Math.max(...fleet.map(x=>x.amount))?'red':''}" style="width:${fleetTotal?f.amount/fleetTotal*100:0}%"></div></div></div>`).join(''):'<div class="footer-note">Sin gastos aprobados para los filtros.</div>'}</div></div></div>
 <div class="notice is-demo info" style="margin-top:18px">${icon('info',18)}<div><strong>Vista de demostración</strong><p>Solo los movimientos aprobados se suman al balance. Los datos quedan guardados localmente en este navegador, no en una base de datos.</p></div></div>`;
}
function renderNew(){
 const now=localDate();
 return `${pageHead('GESTIÓN DE OPERACIONES','Nuevo movimiento','Completa los datos y adjunta evidencia para enviar a revisión.',`<button class="btn" data-go="history">${icon('list',16)} Ver historial</button>`)}
 <div style="max-width:970px"><div class="notice info">${icon('shield-check',19)}<div><strong>Proceso de validación</strong><p>El registro permanecerá pendiente hasta que Administración lo apruebe. Los movimientos pendientes no afectan el balance financiero.</p></div></div>
 <form id="movementForm" class="panel"><div class="panel-head"><div><h3>Información del movimiento</h3><p>Los campos marcados con * son obligatorios</p></div><span class="pill pending">Pendiente de aprobación</span></div>
 <div class="form-grid"><div class="field"><label for="fType">TIPO DE MOVIMIENTO *</label><select id="fType" required><option value="Egreso">Egreso / gasto</option><option value="Ingreso">Ingreso</option></select></div>
 <div class="field"><label for="fDate">FECHA *</label><input id="fDate" type="date" value="${now}" required></div>
 <div class="field"><label for="fAmount">IMPORTE EN SOLES (S/) *</label><input id="fAmount" type="number" inputmode="decimal" min="0.01" step="0.01" placeholder="0.00" required></div>
 <div class="field"><label for="fCategory">CATEGORÍA *</label><select id="fCategory" required></select></div>
 <div class="field full hidden" id="otherCategoryWrap"><label for="fOtherCategory">ESPECIFICA LA CATEGORÍA *</label><input id="fOtherCategory" placeholder="Nombre de la categoría"></div>
 <div class="field"><label for="fVehicle">VEHÍCULO / ÁREA *</label><select id="fVehicle" required>${data.vehicles.map(v=>`<option>${esc(v)}</option>`).join('')}</select></div>
 <div class="field"><label for="fVendor">PROVEEDOR / CLIENTE</label><input id="fVendor" maxlength="120" placeholder="Nombre del proveedor o cliente"></div>
 <div class="field"><label for="fPayment">MEDIO DE PAGO</label><select id="fPayment"><option>Efectivo</option><option>Yape / Plin</option><option>Transferencia</option><option>Tarjeta</option><option>Otro</option></select></div>
 <div class="field"><label for="fAccount">CUENTA / CAJA</label><select id="fAccount"><option>Caja chica</option><option>BCP</option><option>Yape / Plin</option><option>Otra cuenta</option></select></div>
 <div class="field full"><label for="fDescription">DESCRIPCIÓN DE LA OPERACIÓN *</label><input id="fDescription" maxlength="180" placeholder="Ej. Compra de repuestos para el vehículo" required></div>
 <div class="field full"><label for="fNotes">NOTAS ADICIONALES</label><textarea id="fNotes" maxlength="750" placeholder="Número de operación, kilometraje, observaciones, etc."></textarea></div>
 <div class="field full"><label for="fEvidence">COMPROBANTES O EVIDENCIAS (HASTA 3 FOTOS)</label><div class="upload-box">${icon('image',23)}<p class="footer-note" style="margin:5px 0 12px">Fotos JPG, PNG o WEBP · Máximo 3 MB por foto. Se optimizarán antes de guardarse localmente.</p><input id="fEvidence" type="file" accept="image/png,image/jpeg,image/webp" multiple><div class="preview-list" id="previewList"></div></div></div></div>
 <div class="form-actions"><button type="button" class="btn" data-go="dashboard">Cancelar</button><button type="submit" class="btn btn-primary" id="saveMovement">${icon('check',17)} Enviar a revisión</button></div><p class="footer-note">Este prototipo almacena registros y fotos solo en este navegador. No lo utilices como archivo financiero definitivo hasta implementar Supabase.</p></form></div>`;
}
function renderReview(){
 const queue=sortNewest(visibleRecords().filter(r=>r.status==='pending'));
 const current=queue.find(r=>r.id===selectedReview)||queue[0];selectedReview=current?.id??null;
 return `${pageHead('CONTROL INTERNO',isAdmin()?'Aprobaciones':'Mis revisiones',isAdmin()?'Verifica cada movimiento antes de aprobar o rechazar.':'Consulta el estado de tus movimientos pendientes.',`<span class="pill pending">${queue.length} pendientes</span>`)}
 ${!isAdmin()?`<div class="notice info">${icon('info',18)}<div><strong>Acceso de colaborador</strong><p>Administración es la única cuenta que puede aprobar o rechazar movimientos.</p></div></div>`:''}
 <div class="review-layout"><div><div class="panel-head"><div><h3>Bandeja de pendientes</h3><p>${queue.length} operación(es) por revisar</p></div></div>${queue.length?queue.map(r=>`<button class="review-item ${current?.id===r.id?'selected':''}" data-select-review="${Number(r.id)}"><div class="review-item-top"><div><div class="review-item-title">${esc(r.description)}</div><div class="review-item-sub">${dateFmt(r.date)} · ${esc(r.submitter)}</div></div><strong class="review-item-amount">${fmt(r.amount)}</strong></div><div class="review-item-bottom"><span class="tag">${esc(r.type)}</span><span class="tag">${esc(r.vehicle)}</span>${pill(r.status)}</div></button>`).join(''):empty('¡Todo al día!','No tienes movimientos pendientes de revisión.')}</div>
 <div class="panel review-details">${current?`<div class="panel-head"><div><h3>Detalle del movimiento #${current.id}</h3><p>Revisa los datos antes de tomar una decisión</p></div>${pill(current.status)}</div><span class="eyebrow">${esc(current.type)}</span><h2>${fmt(current.amount)}</h2>
 <div class="detail-grid"><div class="detail-item"><strong>Descripción</strong><span>${esc(current.description)}</span></div><div class="detail-item"><strong>Fecha</strong><span>${dateFmt(current.date)}</span></div><div class="detail-item"><strong>Vehículo</strong><span>${esc(current.vehicle)}</span></div><div class="detail-item"><strong>Responsable</strong><span>${esc(current.submitter)}</span></div><div class="detail-item"><strong>Categoría</strong><span>${esc(current.category==='Otro'&&current.customCategory?current.customCategory:current.category)}</span></div><div class="detail-item"><strong>Proveedor / cliente</strong><span>${esc(current.vendor||'—')}</span></div><div class="detail-item"><strong>Medio de pago</strong><span>${esc(current.payment||'—')}</span></div><div class="detail-item"><strong>Cuenta</strong><span>${esc(current.account||'—')}</span></div></div>
 <div class="detail-block"><h4>Observaciones</h4><p>${esc(current.notes||'Sin observaciones adicionales.')}</p></div><div class="detail-block"><h4>Comprobantes adjuntos (${current.evidence?.length||0})</h4>${evidenceHTML(current)}</div>
 ${isAdmin()?`<div class="approval-actions"><button class="btn btn-success" data-approve="${current.id}">${icon('check',17)} Aprobar movimiento</button><button class="btn btn-danger" data-reject="${current.id}">${icon('x',17)} Rechazar movimiento</button></div>`:''}`:empty('Selecciona un movimiento','Aquí aparecerán los datos y comprobantes de la operación.')}</div></div>`;
}
function evidenceHTML(r){return r.evidence?.length?`<div class="evidence-grid">${r.evidence.map((_,i)=>`<img class="evidence-image" data-evidence-record="${r.id}" data-evidence-index="${i}" src="${esc(r.evidence[i])}" alt="Comprobante ${i+1}">`).join('')}</div>`:'<div class="upload-box" style="text-align:center;color:var(--muted);font-size:12px">Sin fotos adjuntas</div>';}
function renderHistory(){
 let rows=visibleRecords();
 if(historyStatus!=='Todos')rows=rows.filter(r=>r.status===historyStatus);
 if(historyType!=='Todos')rows=rows.filter(r=>r.type===historyType);
 if(historyVehicle!=='Todos')rows=rows.filter(r=>r.vehicle===historyVehicle);
 if(historySearch)rows=rows.filter(r=>[r.description,r.vendor,r.category,r.submitter,r.vehicle,r.date,r.id].join(' ').toLowerCase().includes(historySearch.toLowerCase()));
 rows=sortNewest(rows);
 return `${pageHead('TRAZABILIDAD','Historial de movimientos','Consulta operaciones y encuentra comprobantes por responsable, estado y vehículo.',`<button class="btn" id="exportHistory">${icon('download',16)} Exportar CSV</button><button class="btn btn-primary" data-go="new">${icon('plus-circle',16)} Nuevo registro</button>`)}
 <div class="panel"><div class="panel-head"><div><h3>Registro de operaciones</h3><p>${rows.length} movimiento(s) encontrados</p></div></div>
 <div class="table-filter-row"><input class="filter-input search" id="hSearch" value="${esc(historySearch)}" placeholder="Buscar por descripción, código o proveedor…"><select class="filter-input" id="hStatus"><option value="Todos">Todos los estados</option><option value="approved" ${historyStatus==='approved'?'selected':''}>Aprobado</option><option value="pending" ${historyStatus==='pending'?'selected':''}>Pendiente</option><option value="rejected" ${historyStatus==='rejected'?'selected':''}>Rechazado</option></select><select class="filter-input" id="hType"><option value="Todos">Ingresos y egresos</option><option value="Ingreso" ${historyType==='Ingreso'?'selected':''}>Ingresos</option><option value="Egreso" ${historyType==='Egreso'?'selected':''}>Egresos</option></select><select class="filter-input" id="hVehicle"><option value="Todos">Todos los vehículos</option>${data.vehicles.map(v=>`<option ${historyVehicle===v?'selected':''}>${esc(v)}</option>`).join('')}</select><button class="btn btn-small" id="hReset">${icon('refresh',15)} Limpiar</button></div>
 ${tableHTML(rows)}<div class="footer-note">Haz clic en una fila para consultar los detalles y las evidencias del registro.</div></div>`;
}
function renderReports(){
 const all=visibleRecords();
 let rows=filteredReportRows();
 const accepted=approvedRows(rows),income=total(accepted,'Ingreso'),expense=total(accepted,'Egreso'),balance=income-expense;
 const fleet=data.vehicles.map(v=>({name:v,inc:total(accepted.filter(r=>r.vehicle===v),'Ingreso'),out:total(accepted.filter(r=>r.vehicle===v),'Egreso'),count:accepted.filter(r=>r.vehicle===v).length})).filter(x=>x.count>0);
 const cat={};accepted.filter(r=>r.type==='Egreso').forEach(r=>{const name=r.category==='Otro'&&r.customCategory?r.customCategory:r.category;cat[name]=(cat[name]||0)+r.amount;});
 return `${pageHead('ANÁLISIS FINANCIERO','Reportes','Una vista consolidada de los movimientos aprobados.',`<button class="btn" id="printReport">${icon('printer',16)} Imprimir</button><button class="btn btn-primary" id="exportReport">${icon('download',16)} Descargar CSV</button>`)}
 <div class="panel dashboard-filters reports-filters">
 <div class="field"><label for="rPeriod">PERIODO</label><select id="rPeriod"><option value="all" ${reportPeriod==='all'?'selected':''}>Histórico general</option><option value="day" ${reportPeriod==='day'?'selected':''}>Por día</option><option value="month" ${reportPeriod==='month'?'selected':''}>Por mes</option><option value="year" ${reportPeriod==='year'?'selected':''}>Por año</option><option value="range" ${reportPeriod==='range'?'selected':''}>Rango de fechas</option></select></div>
 ${reportPeriod==='day'?`<div class="field"><label for="rDay">DÍA</label><input id="rDay" type="date" value="${esc(reportDay)}"></div>`:''}
 ${reportPeriod==='month'?`<div class="field"><label for="rMonth">MES</label><input id="rMonth" type="month" value="${esc(reportMonth)}"></div>`:''}
 ${reportPeriod==='year'?`<div class="field"><label for="rYear">AÑO</label><select id="rYear">${Array.from(new Set([...all.map(r=>r.date.slice(0,4)),localDate().slice(0,4)])).sort().reverse().map(y=>`<option value="${esc(y)}" ${reportYear===y?'selected':''}>${esc(y)}</option>`).join('')}</select></div>`:''}
 ${reportPeriod==='range'?`<div class="field"><label for="rFrom">DESDE</label><input id="rFrom" type="date" value="${esc(reportFrom)}"></div><div class="field"><label for="rTo">HASTA</label><input id="rTo" type="date" value="${esc(reportTo)}"></div>`:''}
 <div class="field"><label for="rVehicle">VEHÍCULO</label><select id="rVehicle"><option value="Todos" ${reportVehicle==='Todos'?'selected':''}>Todos los vehículos</option>${data.vehicles.map(v=>`<option ${reportVehicle===v?'selected':''}>${esc(v)}</option>`).join('')}</select></div>
 <div class="field search-field"><label for="rSearch">BUSCAR OPERACIÓN</label><input id="rSearch" placeholder="Descripción, proveedor, responsable…" value="${esc(reportSearch)}"></div>
 <button type="button" class="btn btn-small" id="rReset">${icon('refresh',14)} Limpiar</button>
 </div>
 <p class="report-period-summary">${icon('calendar',15)} <span>Periodo: <strong>${esc(reportPeriodLabel())}</strong></span><span class="summary-dot">·</span><span>Vehículo: <strong>${esc(reportVehicle==='Todos'?'Todos':reportVehicle)}</strong></span><span class="summary-dot">·</span><span>${accepted.length} ${accepted.length===1?'operación aprobada':'operaciones aprobadas'}</span></p>
 ${reportPeriod==='range' && reportFrom>reportTo?`<div class="notice"><div><strong>Rango de fechas incorrecto</strong><p>La fecha inicial no puede ser posterior a la final.</p></div></div>`:''}
 <div class="report-cards"><div class="report-card"><span>Ingresos aprobados</span><strong class="positive" style="color:var(--green)">${fmt(income)}</strong></div><div class="report-card"><span>Egresos aprobados</span><strong>${fmt(expense)}</strong></div><div class="report-card"><span>Balance neto</span><strong style="color:${balance>=0?'var(--green)':'var(--red)'}">${fmt(balance)}</strong></div></div>
 <div class="dashboard-chart-grid"><div class="panel"><div class="panel-head"><div><h3>Resumen por vehículo</h3><p>Operaciones aprobadas del periodo</p></div></div>${fleet.length?`<div class="table-wrap"><table><thead><tr><th>Vehículo</th><th class="text-right">Ingresos</th><th class="text-right">Egresos</th><th class="text-right">Resultado</th></tr></thead><tbody>${fleet.map(f=>`<tr><td><strong>${esc(f.name)}</strong></td><td class="text-right">${fmt(f.inc)}</td><td class="text-right">${fmt(f.out)}</td><td class="text-right amount">${fmt(f.inc-f.out)}</td></tr>`).join('')}</tbody></table></div>`:empty('Sin operaciones aprobadas','No hay información para generar el reporte.')}</div><div class="panel"><div class="panel-head"><div><h3>Gastos por categoría</h3><p>Distribución de egresos aprobados</p></div></div>${Object.entries(cat).length?Object.entries(cat).sort((a,b)=>b[1]-a[1]).map(([name,amount])=>`<div class="report-row"><span>${esc(name)}</span><strong>${fmt(amount)}</strong></div>`).join(''):empty('Sin egresos registrados')}</div></div>
 <div class="notice info is-demo">${icon('info',18)}<div><strong>Alcance del reporte</strong><p>El balance es una diferencia simple entre ingresos y egresos aprobados; no equivale a utilidad contable ni incluye conciliación bancaria o impuestos.</p></div></div>`;
}
function renderVehicles(){
 const rows=approvedRows(visibleRecords());
 const cards=data.vehicles.map(name=>{const mine=rows.filter(r=>r.vehicle===name);const income=total(mine,'Ingreso'),expense=total(mine,'Egreso');return {name,income,expense,count:mine.length,balance:income-expense};});
 return `${pageHead('GESTIÓN DE FLOTA','Vehículos','Consulta el resultado registrado de cada vehículo y los gastos generales.',isAdmin()?`<button class="btn btn-primary" id="addVehicle">${icon('plus-circle',16)} Añadir vehículo</button>`:'')}
 <div class="vehicle-cards">${cards.map(v=>`<div class="panel vehicle-card"><div class="vehicle-card-header"><div class="vehicle-icon">${icon('truck',23)}</div><div><strong>${esc(v.name)}</strong><span>${v.count} operaciones aprobadas</span></div></div><div class="vehicle-values"><div><span>Ingresos</span><strong style="color:var(--green)">${fmt(v.income)}</strong></div><div><span>Egresos</span><strong>${fmt(v.expense)}</strong></div><div><span>Balance</span><strong class="${v.balance<0?'negative':'positive'}">${fmt(v.balance)}</strong></div></div><div class="mini-note">Se consideran únicamente los movimientos aprobados.</div></div>`).join('')}</div>
 <div class="notice info is-demo">${icon('info',18)}<div><strong>Catálogo de vehículos</strong><p>En esta versión puedes añadir vehículos de prueba desde Administración. La gestión completa y compartida entre dispositivos se implementará con la base de datos.</p></div></div>`;
}

function openModal(title,body,footer=''){
 $('#modalRoot').innerHTML=`<div class="modal-backdrop" id="modalBackdrop"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><h3>${esc(title)}</h3><button class="modal-close" id="modalClose" aria-label="Cerrar">×</button></div><div class="modal-body">${body}</div>${footer?`<div class="modal-footer">${footer}</div>`:''}</div></div>`;
 $('#modalClose').addEventListener('click',closeModal);
 $('#modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal();});
 bindEvidence($('#modalRoot'));
}
function closeModal(){ $('#modalRoot').innerHTML=''; }
function detail(id){
 const r=visibleRecords().find(x=>x.id===id);if(!r)return;
 const body=`<div class="review-item-top"><div><span class="eyebrow">${esc(r.type)} · #${r.id}</span><h2 style="font-size:27px;letter-spacing:-.04em;margin:8px 0 13px">${fmt(r.amount)}</h2></div>${pill(r.status)}</div><div class="detail-grid"><div class="detail-item"><strong>Descripción</strong><span>${esc(r.description)}</span></div><div class="detail-item"><strong>Fecha</strong><span>${dateFmt(r.date)}</span></div><div class="detail-item"><strong>Vehículo</strong><span>${esc(r.vehicle)}</span></div><div class="detail-item"><strong>Categoría</strong><span>${esc(r.category==='Otro'&&r.customCategory?r.customCategory:r.category)}</span></div><div class="detail-item"><strong>Registrado por</strong><span>${esc(r.submitter)}</span></div><div class="detail-item"><strong>Proveedor / cliente</strong><span>${esc(r.vendor||'—')}</span></div><div class="detail-item"><strong>Medio de pago</strong><span>${esc(r.payment||'—')}</span></div><div class="detail-item"><strong>Cuenta / caja</strong><span>${esc(r.account||'—')}</span></div></div><div class="detail-block"><h4>Observaciones</h4><p>${esc(r.notes||'Sin observaciones.')}</p></div>${r.reviewer?`<div class="detail-block"><h4>Revisión</h4><p>${esc(r.reviewer)} · ${timeFmt(r.reviewedAt)}</p></div>`:''}${r.status==='rejected'?`<div class="notice"><div><strong>Motivo del rechazo</strong><p>${esc(r.rejectionReason||'No especificado')}</p></div></div>`:''}<div class="detail-block"><h4>Evidencias</h4>${evidenceHTML(r)}</div>`;
 openModal(`Movimiento #${r.id}`,body,`<button class="btn" id="detailClose">Cerrar</button>`);
 $('#detailClose').addEventListener('click',closeModal);
}
function bindEvidence(root=document){
 $$('[data-evidence-record]',root).forEach(image=>image.addEventListener('click',()=>{
  const r=visibleRecords().find(x=>x.id===Number(image.dataset.evidenceRecord));const idx=Number(image.dataset.evidenceIndex);
  if(!r?.evidence?.[idx])return;
  const el=document.createElement('div');el.className='lightbox';
  const img=document.createElement('img');img.src=r.evidence[idx];img.alt='Comprobante ampliado';
  const btn=document.createElement('button');btn.textContent='×';btn.setAttribute('aria-label','Cerrar imagen');
  el.append(img,btn);el.addEventListener('click',()=>el.remove());document.body.appendChild(el);
 }));
}
function rejectPrompt(id){
 if(!isAdmin())return toast('Tu usuario no puede aprobar ni rechazar.','error');
 openModal(`Rechazar movimiento #${id}`,`<div class="field"><label for="rejectionReason">MOTIVO DEL RECHAZO *</label><textarea id="rejectionReason" maxlength="400" placeholder="Explica qué debe corregir el colaborador…" required></textarea></div>`,`<button class="btn" id="cancelReject">Cancelar</button><button class="btn btn-danger" id="confirmReject">Confirmar rechazo</button>`);
 $('#cancelReject').addEventListener('click',closeModal);
 $('#confirmReject').addEventListener('click',()=>{const reason=$('#rejectionReason').value.trim();if(!reason)return toast('Debes indicar el motivo del rechazo.','error');decide(id,'rejected',reason);closeModal();});
}
function decide(id,status,reason=''){
 if(!isAdmin())return toast('No tienes permisos para esta acción.','error');
 const r=data.records.find(x=>x.id===id);
 if(!r||r.status!=='pending')return toast('Este movimiento ya no está pendiente.','error');
 r.status=status;r.reviewer=currentUser.name;r.reviewerId=currentUser.id;r.reviewedAt=new Date().toISOString();r.rejectionReason=reason;
 persist();selectedReview=null;render();toast(status==='approved'?'Movimiento aprobado correctamente.':'Movimiento rechazado con motivo registrado.','success');
}
function resetEvidence(){attachedImages=[];const el=$('#previewList');if(el)el.innerHTML='';const input=$('#fEvidence');if(input)input.value='';}
function updatePreview(){const root=$('#previewList');if(root)root.innerHTML=attachedImages.map((src,i)=>`<div class="preview-item"><img src="${src}" alt="Vista previa ${i+1}"><button type="button" aria-label="Quitar evidencia" data-remove-image="${i}">×</button></div>`).join('');$$('[data-remove-image]').forEach(btn=>btn.addEventListener('click',()=>{attachedImages.splice(Number(btn.dataset.removeImage),1);updatePreview();}));}
async function compressImage(file){
 if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Solo se permiten fotos JPG, PNG o WEBP.');
 if(file.size>3*1024*1024)throw Error('Cada foto debe pesar como máximo 3 MB.');
 const dataUrl=await new Promise((resolve,reject)=>{const rd=new FileReader();rd.onload=()=>resolve(rd.result);rd.onerror=()=>reject(Error('No se pudo leer la fotografía.'));rd.readAsDataURL(file);});
 const im=await new Promise((resolve,reject)=>{const x=new Image();x.onload=()=>resolve(x);x.onerror=()=>reject(Error('Imagen no válida.'));x.src=dataUrl;});
 const scale=Math.min(1,850/Math.max(im.naturalWidth,im.naturalHeight));
 const cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(im.naturalWidth*scale));cv.height=Math.max(1,Math.round(im.naturalHeight*scale));
 const c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,cv.width,cv.height);c.drawImage(im,0,0,cv.width,cv.height);
 return cv.toDataURL('image/jpeg',.66);
}
function bindForm(){
 const type=$('#fType'),category=$('#fCategory'),other=$('#otherCategoryWrap');
 const refreshCats=()=>{const old=category.value;category.innerHTML=categories[type.value].map(v=>`<option>${esc(v)}</option>`).join('');if(categories[type.value].includes(old))category.value=old;other.classList.toggle('hidden',category.value!=='Otro');};
 type.addEventListener('change',refreshCats);category.addEventListener('change',()=>other.classList.toggle('hidden',category.value!=='Otro'));refreshCats();
 $('#fEvidence').addEventListener('change',async e=>{
  const incoming=[...e.target.files];
  if(attachedImages.length+incoming.length>3){toast('Puedes adjuntar un máximo de 3 fotografías.','error');e.target.value='';return;}
  const btn=$('#saveMovement');btn.disabled=true;btn.textContent='Procesando fotos…';
  try {for(const f of incoming)attachedImages.push(await compressImage(f));updatePreview();}
  catch(err){toast(err.message||'Error al procesar las fotografías.','error');}
  finally{btn.disabled=false;btn.innerHTML=`${icon('check',17)} Enviar a revisión`;e.target.value='';}
 });
 $('#movementForm').addEventListener('submit',e=>{
  e.preventDefault();const amount=Number($('#fAmount').value);
  const description=$('#fDescription').value.trim();const custom=$('#fOtherCategory')?.value.trim()||'';
  if(!Number.isFinite(amount)||amount<=0||amount>999999999)return toast('Ingresa un importe válido.','error');
  if(!description)return toast('Completa la descripción.','error');
  if(category.value==='Otro'&&!custom)return toast('Especifica la categoría personalizada.','error');
  if(!$('#fDate').value)return toast('Selecciona una fecha.','error');
  const record={id:Math.max(1000,...data.records.map(r=>Number(r.id)||1000))+1,date:$('#fDate').value,type:type.value,category:category.value,customCategory:category.value==='Otro'?custom:'',vehicle:$('#fVehicle').value,amount:Math.round(amount*100)/100,description,vendor:$('#fVendor').value.trim(),account:$('#fAccount').value,payment:$('#fPayment').value,notes:$('#fNotes').value.trim(),submitter:currentUser.name,submitterId:currentUser.id,status:'pending',evidence:[...attachedImages],rejectionReason:'',createdAt:new Date().toISOString()};
  data.records.push(record);persist();resetEvidence();selectedReview=record.id;setPage('review');toast(`Movimiento #${record.id} enviado a revisión.`,'success');
 });
}
function csvExport(records,filename){
 const columns=[['ID','id'],['Fecha','date'],['Tipo','type'],['Categoría','category'],['Vehículo','vehicle'],['Monto S/','amount'],['Descripción','description'],['Proveedor / cliente','vendor'],['Cuenta','account'],['Medio de pago','payment'],['Responsable','submitter'],['Estado','status'],['Revisor','reviewer'],['Fecha revisión','reviewedAt'],['Motivo rechazo','rejectionReason']];
 const csv=[columns.map(c=>c[0]),...records.map(r=>columns.map(c=>r[c[1]]??''))].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
 toast('Reporte CSV exportado correctamente.','success');
}
function addVehicle(){
 if(!isAdmin())return;
 openModal('Añadir vehículo',`<div class="field"><label for="newVehicleName">NOMBRE DEL VEHÍCULO O ÁREA *</label><input id="newVehicleName" maxlength="50" placeholder="Ej. Minibús 02"></div><p class="footer-note">El catálogo se guardará solamente en este navegador durante la fase de demostración.</p>`,`<button class="btn" id="cancelVehicle">Cancelar</button><button class="btn btn-primary" id="confirmVehicle">Agregar</button>`);
 $('#cancelVehicle').addEventListener('click',closeModal);
 $('#confirmVehicle').addEventListener('click',()=>{const value=$('#newVehicleName').value.trim();if(value.length<2)return toast('Escribe el nombre del vehículo.','error');if(data.vehicles.some(x=>x.toLowerCase()===value.toLowerCase()))return toast('Ese vehículo ya existe.','error');data.vehicles.push(value);persist();closeModal();render();toast('Vehículo añadido al catálogo local.','success');});
}
function focusPreservedInput(selector,onInput){const el=$(selector);if(!el)return;el.addEventListener('input',e=>{const pos=e.target.selectionStart;onInput(e.target.value);render();const next=$(selector);if(next){next.focus();if(typeof pos==='number')next.setSelectionRange(pos,pos);}});}
function bindPage(){
 $$('[data-go]').forEach(el=>el.addEventListener('click',()=>setPage(el.dataset.go)));
 $$('[data-detail]').forEach(el=>el.addEventListener('click',()=>detail(Number(el.dataset.detail))));
 $$('[data-select-review]').forEach(el=>el.addEventListener('click',()=>{selectedReview=Number(el.dataset.selectReview);render();}));
 $$('[data-approve]').forEach(el=>el.addEventListener('click',()=>decide(Number(el.dataset.approve),'approved')));
 $$('[data-reject]').forEach(el=>el.addEventListener('click',()=>rejectPrompt(Number(el.dataset.reject))));
 bindEvidence($('#main'));
 if(page==='new'){resetEvidence();bindForm();}
 if(page==='dashboard'){
  $('#dPeriod')?.addEventListener('change',e=>{dashPeriod=e.target.value;render();});
  $('#dDate')?.addEventListener('change',e=>{dashDay=e.target.value;render();});
  $('#dMonth')?.addEventListener('change',e=>{dashMonth=e.target.value;render();});
  $('#dYear')?.addEventListener('change',e=>{dashYear=e.target.value;render();});
  $('#dVehicle')?.addEventListener('change',e=>{dashVehicle=e.target.value;render();});
  focusPreservedInput('#dSearch',value=>dashSearch=value);
  $('#dReset')?.addEventListener('click',()=>{dashPeriod='month';dashMonth=localDate().slice(0,7);dashDay=localDate();dashYear=localDate().slice(0,4);dashVehicle='Todos';dashSearch='';render();});
 }
 if(page==='history'){
  $('#hStatus')?.addEventListener('change',e=>{historyStatus=e.target.value;render();});
  $('#hType')?.addEventListener('change',e=>{historyType=e.target.value;render();});
  $('#hVehicle')?.addEventListener('change',e=>{historyVehicle=e.target.value;render();});
  focusPreservedInput('#hSearch',value=>historySearch=value);
  $('#hReset')?.addEventListener('click',()=>{historyStatus='Todos';historyType='Todos';historyVehicle='Todos';historySearch='';render();});
  $('#exportHistory')?.addEventListener('click',()=>{let rows=visibleRecords();if(historyStatus!=='Todos')rows=rows.filter(r=>r.status===historyStatus);if(historyType!=='Todos')rows=rows.filter(r=>r.type===historyType);if(historyVehicle!=='Todos')rows=rows.filter(r=>r.vehicle===historyVehicle);if(historySearch)rows=rows.filter(r=>[r.description,r.vendor,r.category,r.submitter,r.vehicle,r.date,r.id].join(' ').toLowerCase().includes(historySearch.toLowerCase()));csvExport(sortNewest(rows),'melo-travel-historial.csv');});
 }
 if(page==='reports'){
  $('#rVehicle')?.addEventListener('change',e=>{reportVehicle=e.target.value;render();});
  $('#rPeriod')?.addEventListener('change',e=>{reportPeriod=e.target.value;render();});
  $('#rDay')?.addEventListener('change',e=>{reportDay=e.target.value;render();});
  $('#rMonth')?.addEventListener('change',e=>{reportMonth=e.target.value;render();});
  $('#rYear')?.addEventListener('change',e=>{reportYear=e.target.value;render();});
  $('#rFrom')?.addEventListener('change',e=>{reportFrom=e.target.value;render();});
  $('#rTo')?.addEventListener('change',e=>{reportTo=e.target.value;render();});
  focusPreservedInput('#rSearch',value=>reportSearch=value);
  $('#rReset')?.addEventListener('click',()=>{reportPeriod='all';reportVehicle='Todos';reportDay=localDate();reportMonth=localDate().slice(0,7);reportYear=localDate().slice(0,4);reportFrom=localDate().slice(0,7)+'-01';reportTo=localDate();reportSearch='';render();});
  $('#printReport')?.addEventListener('click',()=>window.print());
  $('#exportReport')?.addEventListener('click',()=>csvExport(sortNewest(approvedRows(filteredReportRows())),'melo-travel-reporte.csv'));
 }
 $('#addVehicle')?.addEventListener('click',addVehicle);
}
function closeMobileMenu(){$('#sidebar').classList.remove('mobile-open');$('#mobileOverlay').classList.add('hidden');}
function globalEvents(){
 $('#loginForm').addEventListener('submit',e=>{e.preventDefault();const u=users.find(u=>u.id===$('#loginUser').value);if(!u||$('#loginPin').value!=='1234')return toast('Usuario o PIN incorrecto.','error');currentUser=u;page='dashboard';render();});
 $('#togglePin').innerHTML=icon('eye',17);
 $('#togglePin').addEventListener('click',()=>{const el=$('#loginPin');el.type=el.type==='password'?'text':'password';$('#togglePin').innerHTML=icon(el.type==='password'?'eye':'eye-off',17);});
 $('#logoutBtn').innerHTML=icon('logout',18);
 $('#logoutBtn').addEventListener('click',()=>{currentUser=null;page='dashboard';resetEvidence();$('#loginPin').value='';closeMobileMenu();closeModal();render();});
 $('#mobileMenu').innerHTML=icon('menu',22);
 $('#mobileMenu').addEventListener('click',()=>{$('#sidebar').classList.toggle('mobile-open');$('#mobileOverlay').classList.toggle('hidden',!$('#sidebar').classList.contains('mobile-open'));});
 $('#mobileOverlay').addEventListener('click',closeMobileMenu);
 $$('.nav-button').forEach(btn=>btn.addEventListener('click',()=>setPage(btn.dataset.page)));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeMobileMenu();$('.lightbox')?.remove();}});
}
globalEvents();render();
})();
