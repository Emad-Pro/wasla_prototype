/* ===== e-invoicing hub ===== */
function pad6(n){ return String(n).padStart(6, '0'); }
M.invoices = function(){
  var plan = byId(D.settings.plans, D.subs.invoicing.plan), lim = plan.limit, used = D.invStats.month;
  var recent = D.invoices.slice(0, 5);
  var secs = [
    ['invoiceNew','إصدار فاتورة جديدة','plus','فاتورة ضريبية أو مبسطة بحساب تلقائي للضريبة', 'newInvoice'],
    ['customers','العملاء','users','اختيار العميل مباشرة دون إعادة كتابة بياناته'],
    ['inventory','المخزون','archive','الأصناف تُخصم تلقائياً عند اعتماد الفاتورة'],
    ['ai','المساعد الذكي','sparkles','قراءة فواتير الموردين وإدخال المشتريات'],
    ['invoiceLog','سجل الفواتير','list','البحث في الفواتير والإشعارات السابقة'],
    ['invoiceSettings','إعدادات المنشأة','building','الاسم والعنوان الوطني والشعار ولغة الفاتورة'],
    ['invoiceSettingsTax','بيانات الضريبة والربط','shield','الرقم الضريبي وحالة الربط مع منصة فاتورة'],
    ['invoiceSub','الاشتراك','calendar','باقتك وحدودها وتاريخ التجديد'],
    ['wallet','رصيد النقاط','coins','للمساعد الذكي فقط. الفوترة اليدوية لا تخصم نقاطاً']
  ];
  return pageHead('الفواتير الإلكترونية', 'أصدر فواتيرك وأرسلها واطبعها وفق متطلبات هيئة الزكاة والضريبة والجمارك.', '<button class="btn btn-primary" data-act="newInvoice">' + ic('plus') + ' فاتورة جديدة</button>')
    + '<div class="card card-tight row-between" style="margin-bottom:16px"><div class="row">' + ic('shield') + '<b class="small">الالتزام بمتطلبات الفوترة</b>' + pill('المرحلة الأولى: الإصدار والحفظ مفعّلة', 'ok') + pill(D.zatca.phase2 === 'live' ? 'المرحلة الثانية: مرتبطة' : 'المرحلة الثانية: بيئة الاختبار', D.zatca.phase2 === 'live' ? 'ok' : 'warn') + '</div><button class="btn btn-ghost btn-sm" data-go="invoiceSettings">التفاصيل ' + ic('chevL') + '</button></div>'
    + '<div class="kpis">'
    + kpi('فواتير هذا الشهر', num(used), lim ? 'من ' + num(lim) + ' في ' + plan.name : 'غير محدودة', 'receipt', 'invoiceLog', lim ? '<div class="meter" style="width:100%;margin-top:8px"><span style="width:' + Math.min(100, used / lim * 100) + '%"></span></div>' : '')
    + kpi('المبيعات', amt(D.invStats.sales), 'ر.س قبل الضريبة', 'chart')
    + kpi('الضريبة المحصّلة', amt(D.invStats.vat), 'ر.س ضريبة القيمة المضافة 15%', 'coins')
    + kpi('بانتظار الإبلاغ', D.invoices.filter(function(i){ return i.status === 'queued'; }).length, 'تُعاد المحاولة تلقائياً', 'clock', 'invoiceLog')
    + '</div>'
    + '<div class="sec-grid" style="margin-bottom:24px">' + secs.map(function(s){ return '<button class="sec-card" ' + (s[4] ? 'data-act="' + s[4] + '"' : s[0] === 'invoiceSettingsTax' ? 'data-go="invoiceSettings"' : 'data-go="' + s[0] + '"') + '><span class="list-ic tone-brand">' + ic(s[2]) + '</span><span class="grow"><b>' + s[1] + '</b><small>' + s[3] + '</small></span></button>'; }).join('') + '</div>'
    + '<div class="row-between" style="margin-bottom:10px"><h3>أحدث الفواتير</h3><button class="btn btn-ghost btn-sm" data-go="invoiceLog">السجل الكامل ' + ic('chevL') + '</button></div>' + invTable(recent);
};
function invTable(list){
  if (!list.length) return '<div id="inv-list"></div>' + empty('receipt', 'لا توجد فواتير مطابقة', 'غيّر عوامل التصفية أو أصدر فاتورة جديدة.');
  return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الرقم</th><th>النوع</th><th>العميل</th><th>التاريخ</th><th class="num">الإجمالي</th><th>الحالة</th></tr></thead><tbody id="inv-list">'
    + list.map(function(i){ var t = invTotals(i.lines), c = byId(D.customers, i.cust); return '<tr class="click" data-go="invoiceView" data-id="' + i.no + '" data-q="' + esc(i.no + ' ' + custName(i.cust) + ' ' + (c ? c.phone + ' ' + c.vat : '')) + '"><td class="tnum" dir="ltr" style="text-align:start"><b>' + i.no + '</b></td><td>' + INV_KIND[i.kind][0] + (i.ref ? '<span class="sub">مرتبط بـ ' + i.ref + '</span>' : '') + '</td><td>' + esc(custName(i.cust)) + '</td><td class="tnum">' + fmtDT(i.at) + '</td><td class="num">' + (i.kind === 'credit' ? '-' : '') + money(t.total) + '</td><td>' + st('inv', i.status) + '</td></tr>'; }).join('')
    + '</tbody></table></div><div id="inv-list-empty" hidden>' + empty('search', 'لا توجد نتائج', 'جرّب رقم الفاتورة أو اسم العميل أو رقم الجوال أو الرقم الضريبي.') + '</div>';
}

/* ===== new invoice ===== */
ACT.newInvoice = function(el){
  var cid = el && el.getAttribute && el.getAttribute('data-cust');
  var c = cid ? byId(D.customers, cid) : null;
  S.inv = {kind:c && c.vat ? 'tax' : 'simplified', custMode:cid ? 'existing' : 'existing', cust:cid || 'CU1', nc:{name:'', phone:'', email:'', vat:''}, lines:[], showErr:false};
  go('invoiceNew');
};
function invDraftErrors(d){
  var e = [];
  var c = d.custMode === 'existing' ? byId(D.customers, d.cust) : d.custMode === 'new' ? d.nc : null;
  if (d.custMode === 'new'){
    if (!String(d.nc.name).trim()) e.push('أدخل اسم العميل الجديد');
    if (d.nc.phone && !/^0\d{9}$/.test(d.nc.phone)) e.push('رقم جوال العميل غير صحيح');
  }
  if (d.kind === 'tax'){
    if (!c) e.push('الفاتورة الضريبية تتطلب بيانات المشتري (منشأة)');
    else if (!/^3\d{13}3$/.test(c.vat || '')) e.push('الفاتورة الضريبية تتطلب رقماً ضريبياً صحيحاً للمشتري (15 رقماً يبدأ وينتهي بـ 3)');
  }
  if (!d.lines.length) e.push('أضف بنداً واحداً على الأقل');
  d.lines.forEach(function(l, i){
    var n = 'البند ' + (i + 1);
    if (!String(l.name).trim()) e.push(n + ': أدخل الوصف');
    if (!(Number(l.qty) > 0)) e.push(n + ': الكمية يجب أن تكون أكبر من صفر');
    if (!(Number(l.price) >= 0) || l.price === '') e.push(n + ': أدخل سعر الوحدة');
    if (Number(l.disc) > Number(l.qty) * Number(l.price)) e.push(n + ': الخصم أكبر من قيمة البند');
    if (l.inv){ var it = invItem(l.inv); if (it && Number(l.qty) > it.qty) e.push(n + ': الكمية المطلوبة (' + l.qty + ') أكبر من المتوفر في المخزون (' + it.qty + ')'); }
  });
  return e;
}
function invTotalsHtml(lines){
  var t = invTotals(lines);
  return '<div class="sum-row"><span>الإجمالي قبل الخصم</span><b>' + money(t.gross) + '</b></div><div class="sum-row"><span>الخصومات</span><b>' + (t.disc ? '-' : '') + money(t.disc) + '</b></div><div class="sum-row"><span>الإجمالي الخاضع للضريبة</span><b>' + money(t.net) + '</b></div><div class="sum-row"><span>ضريبة القيمة المضافة</span><b>' + money(t.vat) + '</b></div><div class="sum-row total"><span>الإجمالي المستحق</span><b>' + money(t.total) + '</b></div>';
}
M.invoiceNew = function(){
  if (!S.inv) ACT.newInvoice();
  var d = S.inv, errs = invDraftErrors(d);
  var custBlock = '';
  if (d.custMode === 'existing'){
    var c = byId(D.customers, d.cust);
    custBlock = F({id:'in-cust', type:'select', label:'العميل', bind:'S.inv.cust', rerender:true, options:D.customers.map(function(x){ return [x.id, x.name + ' · ' + x.phone + (x.vat ? ' · ضريبي' : '')]; })})
      + (c ? '<div class="party"><b>' + esc(c.name) + '</b><br>الجوال: <span class="tnum">' + c.phone + '</span>' + (c.email ? '<br>البريد: ' + esc(c.email) : '') + (c.vat ? '<br>الرقم الضريبي: <span class="tnum">' + c.vat + '</span>' : '<br><span class="faint">لا يوجد رقم ضريبي</span>') + '</div>' : '');
  } else if (d.custMode === 'new'){
    custBlock = '<div class="form-grid">' + F({id:'in-nc-name', label:'اسم العميل', bind:'S.inv.nc.name', req:true}) + F({id:'in-nc-phone', label:'رقم الجوال', bind:'S.inv.nc.phone', ltr:true, type:'tel', ph:'05XXXXXXXX'}) + F({id:'in-nc-email', label:'البريد الإلكتروني', bind:'S.inv.nc.email', ltr:true, type:'email', opt:true}) + F({id:'in-nc-vat', label:'الرقم الضريبي', bind:'S.inv.nc.vat', ltr:true, opt:d.kind !== 'tax', req:d.kind === 'tax', ph:'3XXXXXXXXXXXXX3', hint:'إلزامي في الفاتورة الضريبية للمنشآت'}) + '</div><p class="faint xs">يُحفظ العميل في قائمة العملاء تلقائياً عند اعتماد الفاتورة.</p>';
  } else {
    custBlock = note('neutral', 'فاتورة مبسطة لعميل نقدي دون تسجيل بياناته. مناسبة للمبيعات السريعة للأفراد.', 'user');
  }
  var lines = d.lines.map(function(l, i){
    var c = lineCalc(l), it = l.inv ? invItem(l.inv) : null;
    return '<tr><td class="line-name"><input class="input input-sm" data-bind="S.inv.lines.' + i + '.name" value="' + esc(l.name) + '" aria-label="وصف البند ' + (i + 1) + '">' + (it ? '<span class="sub">' + ic('archive') + ' مخزون: ' + it.qty + ' متوفر · ' + it.sku + '</span>' : l.svc ? '<span class="sub">خدمة</span>' : '<span class="sub">بند يدوي</span>') + '</td>'
      + '<td><input class="input input-sm tnum" type="number" min="0" step="1" data-bind="S.inv.lines.' + i + '.qty" data-num data-oninput="invRecalc" value="' + esc(l.qty) + '" aria-label="الكمية"></td>'
      + '<td><input class="input input-sm tnum" type="number" min="0" step="0.01" data-bind="S.inv.lines.' + i + '.price" data-num data-oninput="invRecalc" value="' + esc(l.price) + '" aria-label="سعر الوحدة"></td>'
      + '<td><input class="input input-sm tnum" type="number" min="0" step="0.01" data-bind="S.inv.lines.' + i + '.disc" data-num data-oninput="invRecalc" value="' + esc(l.disc) + '" aria-label="الخصم"></td>'
      + '<td><select class="select input-sm" data-bind="S.inv.lines.' + i + '.vat" data-num data-onchange="invRecalc" aria-label="نسبة الضريبة"><option value="15"' + (Number(l.vat) === 15 ? ' selected' : '') + '>15%</option><option value="0"' + (Number(l.vat) === 0 ? ' selected' : '') + '>0% (معفى)</option></select></td>'
      + '<td class="num" id="ln-tot-' + i + '"><b>' + amt(c.total) + '</b><span class="sub">ضريبة ' + amt(c.vat) + '</span></td>'
      + '<td><button type="button" class="icon-btn" data-act="rmLine" data-i="' + i + '" aria-label="حذف البند">' + ic('trash') + '</button></td></tr>';
  }).join('');
  return pageHead('فاتورة جديدة', 'تُحسب الضريبة والإجماليات تلقائياً، وتظهر الأخطاء قبل الاعتماد.', '', ['invoices','الفواتير الإلكترونية'])
    + '<div class="split"><div class="stack">'
    + '<div class="card stack"><h3>نوع المستند</h3><div class="grid-2">' + [['simplified','فاتورة ضريبية مبسطة','للأفراد. تُصدر فوراً وتُبلَّغ للهيئة خلال 24 ساعة.'],['tax','فاتورة ضريبية','للمنشآت. تتطلب الرقم الضريبي للمشتري، وتعتمدها الهيئة قبل المشاركة.']].map(function(x){ return '<button type="button" class="opt' + (d.kind === x[0] ? ' sel' : '') + '" data-act="setv" data-path="S.inv.kind" data-v="' + x[0] + '"><span class="radio"></span><span class="opt-main"><b>' + x[1] + '</b><small>' + x[2] + '</small></span></button>'; }).join('') + '</div><p class="faint xs">الإشعارات الدائنة والمدينة تُصدر من الفاتورة الأصلية بعد اعتمادها.</p></div>'
    + '<div class="card stack"><div class="row-between"><h3>العميل</h3><div class="seg">' + [['existing','عميل مسجّل'],['new','عميل جديد']].concat(d.kind === 'simplified' ? [['cash','عميل نقدي']] : []).map(function(x){ return '<button type="button" class="' + (d.custMode === x[0] ? 'on' : '') + '" data-act="setv" data-path="S.inv.custMode" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div>' + custBlock + '</div>'
    + '<div class="card stack"><div class="row-between"><h3>البنود</h3><div class="row"><button type="button" class="btn btn-outline btn-sm" data-act="openPicker">' + ic('archive') + ' من المخزون والخدمات</button><button type="button" class="btn btn-ghost btn-sm" data-act="addManualLine">' + ic('plus') + ' بند يدوي</button></div></div>'
    + (d.lines.length ? '<div class="tbl-wrap"><table class="tbl inv-lines"><thead><tr><th>الوصف</th><th style="width:90px">الكمية</th><th style="width:120px">سعر الوحدة</th><th style="width:110px">الخصم (ر.س)</th><th style="width:130px">الضريبة</th><th class="num">الإجمالي</th><th></th></tr></thead><tbody>' + lines + '</tbody></table></div>'
      : empty('box', 'لا توجد بنود بعد', 'اختر منتجاً أو خدمة من المخزون، أو أضف بنداً يدوياً.', '<button type="button" class="btn btn-primary" data-act="openPicker">' + ic('archive') + ' إضافة من المخزون والخدمات</button>'))
    + '</div></div>'
    + '<div class="stack split-aside"><div class="card stack"><h3>الإجماليات</h3><div id="inv-totals">' + invTotalsHtml(d.lines) + '</div>'
    + '<div id="inv-errs">' + (d.showErr && errs.length ? note('bad', '<b>صحّح ما يلي قبل الاعتماد:</b><ul style="margin:6px 0 0;padding-inline-start:18px">' + errs.map(function(x){ return '<li>' + x + '</li>'; }).join('') + '</ul>') : '') + '</div>'
    + '<button class="btn btn-primary btn-block btn-lg" data-act="reviewInvoice">' + ic('eye') + ' مراجعة الفاتورة واعتمادها</button><button class="btn btn-ghost btn-block" data-act="soon" data-msg="حُفظت الفاتورة كمسودة. المسودة لا تحمل رقماً ولا تُرسل للهيئة.">حفظ كمسودة</button><button class="btn btn-ghost btn-block" data-go="invoices">إلغاء</button>'
    + '<p class="faint xs">لا يُخصم أي رصيد نقاط عند إصدار الفاتورة يدوياً.</p></div></div></div>';
};
INPUT.invRecalc = function(){
  var d = S.inv;
  d.lines.forEach(function(l, i){ var c = lineCalc(l), cell = $('#ln-tot-' + i); if (cell) cell.innerHTML = '<b>' + amt(c.total) + '</b><span class="sub">ضريبة ' + amt(c.vat) + '</span>'; });
  var t = $('#inv-totals'); if (t) t.innerHTML = invTotalsHtml(d.lines);
  if (d.showErr){ var e = invDraftErrors(d), box = $('#inv-errs'); if (box) box.innerHTML = e.length ? note('bad', '<b>صحّح ما يلي قبل الاعتماد:</b><ul style="margin:6px 0 0;padding-inline-start:18px">' + e.map(function(x){ return '<li>' + x + '</li>'; }).join('') + '</ul>') : ''; }
};
ACT.rmLine = function(el){ S.inv.lines.splice(Number(el.getAttribute('data-i')), 1); render(); };
ACT.addManualLine = function(){ S.inv.lines.push({name:'', qty:1, price:'', disc:0, vat:15}); render(); var f = document.querySelector('.inv-lines tbody tr:last-child input'); if (f) f.focus(); };
ACT.openPicker = function(){
  var rows = D.inventory.filter(function(i){ return i.active; }).map(function(i){ return '<button class="list-row click" style="width:100%;background:none;border-inline:0;border-top:0;text-align:start;color:var(--fg)" data-act="pickLine" data-src="inv" data-id="' + i.id + '" data-q="' + esc(i.name + ' ' + i.sku + ' ' + i.barcode) + '"' + (i.qty <= 0 ? ' disabled style="opacity:.5"' : '') + '><span class="list-ic tone-info">' + ic('box') + '</span><span class="grow"><b class="small">' + esc(i.name) + '</b><span class="faint xs" style="display:block">' + i.sku + ' · المتوفر ' + i.qty + '</span></span><b class="tnum small">' + amt(i.sell) + '</b></button>'; }).join('')
    + D.products.filter(function(p){ return p.type === 'service' && !p.hidden; }).map(function(p){ return '<button class="list-row click" style="width:100%;background:none;border-inline:0;border-top:0;text-align:start;color:var(--fg)" data-act="pickLine" data-src="svc" data-id="' + p.id + '" data-q="' + esc(p.name + ' ' + p.cat) + '"><span class="list-ic tone-brand">' + ic('wrench') + '</span><span class="grow"><b class="small">' + esc(p.name) + '</b><span class="faint xs" style="display:block">خدمة · ' + esc(p.cat) + '</span></span><b class="tnum small">' + amt(p.sale || p.price) + '</b></button>'; }).join('');
  openModal(modalHead('إضافة بند', 'من المخزون أو قائمة الخدمات') + '<div class="modal-body"><div class="input-icon">' + ic('search') + '<input class="input" type="search" data-filter="#pick-list" placeholder="ابحث بالاسم أو الرمز أو الباركود" aria-label="بحث" autofocus></div><div class="list" id="pick-list">' + rows + '</div><div id="pick-list-empty" hidden>' + empty('search', 'لا توجد نتائج', '') + '</div></div>');
};
ACT.pickLine = function(el){
  var src = el.getAttribute('data-src'), id = el.getAttribute('data-id');
  if (src === 'inv'){ var i = invItem(id); var ex = S.inv.lines.filter(function(l){ return l.inv === id; })[0]; if (ex) ex.qty = Number(ex.qty) + 1; else S.inv.lines.push({name:i.name, qty:1, price:i.sell, disc:0, vat:15, inv:id}); }
  else { var p = byId(D.products, id); S.inv.lines.push({name:p.name, qty:1, price:p.sale || p.price, disc:0, vat:15, svc:id}); }
  closeModal(); render();
};
function draftAsInv(d){
  var c = d.custMode === 'new' ? {name:d.nc.name, phone:d.nc.phone, email:d.nc.email, vat:d.nc.vat} : null;
  return {no:'سيُخصص عند الاعتماد', kind:d.kind, cust:d.custMode === 'existing' ? d.cust : null, nc:c, at:nowStamp(), lines:d.lines, status:'draft'};
}
ACT.reviewInvoice = function(){
  var d = S.inv, e = invDraftErrors(d);
  d.showErr = true;
  if (e.length){ render(); toast('صحّح الأخطاء الظاهرة قبل الاعتماد', 'bad'); return; }
  openModal(modalHead('مراجعة الفاتورة', 'تأكد من البيانات. بعد الاعتماد لا يمكن تعديل الفاتورة أو حذفها.') + '<div class="modal-body">' + invDoc(draftAsInv(d), {draft:true}) + note('warn', 'التصحيح بعد الاعتماد يتم فقط بإصدار إشعار دائن أو مدين مرتبط بهذه الفاتورة.', 'lock') + '</div><div class="modal-foot"><button class="btn btn-primary btn-lg" data-act="approveInvoice">' + ic('check') + ' اعتماد الفاتورة</button><button class="btn btn-ghost" data-act="closeModal">رجوع للتعديل</button></div>', {wide:true});
};
function postInvoice(inv){
  D.invoices.unshift(inv);
  var t = invTotals(inv.lines), sign = inv.kind === 'credit' ? -1 : 1;
  if (inv.kind !== 'credit' && inv.kind !== 'debit') D.invStats.month++;
  D.invStats.sales = round2(D.invStats.sales + sign * t.net); D.invStats.vat = round2(D.invStats.vat + sign * t.vat);
  if (inv.kind === 'simplified' || inv.kind === 'credit' || inv.kind === 'debit'){
    setTimeout(function(){ if (inv.status === 'queued'){ inv.status = 'reported'; if (S.surface === 'merchant' && (S.m.screen === 'invoiceView' || S.m.screen === 'invoiceLog' || S.m.screen === 'invoices')) render(); toast('أُبلغ المستند ' + inv.no + ' لمنصة فاتورة بنجاح'); } }, 2200);
  }
}
ACT.approveInvoice = function(){
  var d = S.inv, custId = d.cust;
  if (d.custMode === 'new'){ custId = 'CU' + (D.customers.length + 1); D.customers.unshift({id:custId, name:d.nc.name, phone:d.nc.phone, email:d.nc.email, vat:d.nc.vat, notes:'', since:TODAY}); }
  if (d.custMode === 'cash') custId = null;
  var no = 'INV-2026-' + pad6(D.invSeq.inv++);
  var inv = {no:no, icv:D.invSeq.icv++, kind:d.kind, cust:custId, at:nowStamp(), status:d.kind === 'tax' ? 'cleared' : 'queued', uuid:uuid(), lines:JSON.parse(JSON.stringify(d.lines))};
  inv.lines.forEach(function(l){ if (l.inv){ var it = invItem(l.inv); var before = it.qty; it.qty = before - Number(l.qty); D.moves.unshift({at:inv.at, item:it.id, type:'sale', qty:-Number(l.qty), before:before, after:it.qty, ref:no, by:D.store.owner}); } });
  postInvoice(inv);
  S.inv = null; go('invoiceView', {id:no});
  toast(d.kind === 'tax' ? 'اعتمدت الهيئة الفاتورة الضريبية (Clearance) ويمكن مشاركتها الآن' : 'اعتُمدت الفاتورة ' + no + ' وحُدّث المخزون');
};

/* ===== invoice document ===== */
function invDoc(inv, o){
  o = o || {};
  var s = D.invSettings, k = INV_KIND[inv.kind], t = invTotals(inv.lines), en = s.lang === 'ar-en';
  var c = inv.cust ? byId(D.customers, inv.cust) : inv.nc;
  var h = function(ar, e){ return ar + (en ? '<span class="en-h">' + e + '</span>' : ''); };
  var buyer = c && c.name ? '<b>' + esc(c.name) + '</b><br>' + (c.phone ? 'الجوال: <span class="tnum">' + esc(c.phone) + '</span><br>' : '') + (c.vat ? 'الرقم الضريبي: <span class="tnum">' + esc(c.vat) + '</span>' : '') : '<b>عميل نقدي</b>';
  return '<article class="inv-doc">'
    + '<div class="inv-top"><div class="inv-seller">' + storeLogo(D.store, 'md') + '<div><b>' + esc(s.legalAr) + '</b>' + (en ? '<small dir="ltr" style="text-align:start">' + esc(s.legalEn) + '</small>' : '') + '<small>' + esc(s.building + ' ' + s.street + '، ' + s.district + '، ' + s.city + ' ' + s.postal) + '</small><small>الرقم الضريبي: <span class="tnum">' + s.vat + '</span> · السجل التجاري: <span class="tnum">' + s.cr + '</span></small></div></div>'
    + '<div class="inv-title"><h2>' + k[0] + '</h2>' + (en ? '<div class="en">' + k[1] + '</div>' : '') + '<div class="no tnum">' + esc(inv.no) + '</div><div class="muted small tnum">' + fmtDT(inv.at) + '</div></div></div>'
    + (inv.ref ? note('info', 'مرتبط بالفاتورة <b class="tnum">' + inv.ref + '</b>' + (inv.reason ? ' · السبب: ' + esc(inv.reason) : '')) : '')
    + '<div class="inv-parties"><div class="party"><h4>' + h('البائع', 'Seller') + '</h4><b>' + esc(D.store.name) + '</b><br>' + esc(s.city + '، ' + s.district) + '<br>الجوال: <span class="tnum">' + D.store.phone + '</span></div><div class="party"><h4>' + h('المشتري', 'Buyer') + '</h4>' + buyer + '</div></div>'
    + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>' + h('الوصف', 'Description') + '</th><th class="num">' + h('الكمية', 'Qty') + '</th><th class="num">' + h('سعر الوحدة', 'Unit price') + '</th><th class="num">' + h('الخصم', 'Discount') + '</th><th class="num">' + h('الخاضع للضريبة', 'Taxable') + '</th><th class="num">' + h('الضريبة', 'VAT') + '</th><th class="num">' + h('الإجمالي', 'Total') + '</th></tr></thead><tbody>'
    + inv.lines.map(function(l, i){ var c2 = lineCalc(l); return '<tr><td class="tnum">' + (i + 1) + '</td><td>' + esc(l.name) + '</td><td class="num">' + l.qty + '</td><td class="num">' + amt(l.price) + '</td><td class="num">' + amt(c2.disc) + '</td><td class="num">' + amt(c2.net) + '</td><td class="num">' + amt(c2.vat) + '<span class="sub">' + (l.vat == null ? 15 : l.vat) + '%</span></td><td class="num"><b>' + amt(c2.total) + '</b></td></tr>'; }).join('')
    + '</tbody></table></div>'
    + '<div class="inv-bottom"><div class="inv-qr">' + (o.draft ? '<div class="qr-box" style="width:132px;height:132px;align-items:center;justify-content:center;text-align:center;color:#536175;font-size:12px">يُولَّد رمز QR عند الاعتماد</div>' : '<div class="qr-box"><div data-qr="' + zatcaQR(inv) + '" data-size="118"></div></div>')
    + '<div class="inv-meta">' + (o.draft ? 'UUID / ICV / PIH are assigned on approval' : '<b>UUID</b> ' + inv.uuid + '<br><b>ICV</b> ' + inv.icv + '<br><b>PIH</b> ' + btoa(inv.uuid).slice(0, 32) + '…<br><b>QR</b> TLV Base64, tags 1–5') + '</div></div>'
    + '<div class="inv-totals">' + invTotalsHtml(inv.lines) + '</div></div>'
    + '</article>';
}
M.invoiceView = function(){
  var inv = D.invoices.filter(function(i){ return i.no === S.m.params.id; })[0] || D.invoices[0];
  var canNote = inv.kind === 'simplified' || inv.kind === 'tax';
  var related = D.invoices.filter(function(i){ return i.ref === inv.no; });
  var cust = inv.cust ? byId(D.customers, inv.cust) : null;
  var link = 'https://wasla.sa/i/' + inv.uuid.slice(0, 8);
  return pageHead(INV_KIND[inv.kind][0] + ' <span class="tnum" dir="ltr">' + inv.no + '</span>', '', '<button class="btn btn-outline" data-act="sendInApp" data-id="' + inv.no + '">' + ic('send') + ' إرسال للعميل في التطبيق</button><button class="btn btn-outline" data-act="copy" data-v="' + link + '" data-msg="تم نسخ رابط الفاتورة">' + ic('link') + ' مشاركة الرابط</button><button class="btn btn-outline" data-act="sendPdf" data-id="' + inv.no + '">' + ic('file') + ' إرسال PDF</button><button class="btn btn-primary" data-act="printInv">' + ic('printer') + ' طباعة</button>', ['invoiceLog','سجل الفواتير'])
    + '<div class="row" style="margin-bottom:14px">' + st('inv', inv.status) + '<span class="lock-note">' + ic('lock') + 'مستند معتمد: لا يمكن تعديله أو حذفه</span>' + (inv.status === 'queued' ? '<span class="muted small">يعيد النظام المحاولة تلقائياً كل 15 دقيقة.</span>' : '') + '</div>'
    + '<div class="split"><div>' + invDoc(inv, {}) + '</div><div class="stack split-aside">'
    + (canNote ? '<div class="card stack"><h3>تصحيح الفاتورة</h3><p class="muted small">لأن الفاتورة معتمدة، يتم أي تصحيح بإشعار مرتبط بها وفق متطلبات الهيئة.</p><button class="btn btn-outline" data-act="openNote" data-kind="credit" data-id="' + inv.no + '">' + ic('arrowDown') + ' إصدار إشعار دائن</button><button class="btn btn-outline" data-act="openNote" data-kind="debit" data-id="' + inv.no + '">' + ic('arrowUp') + ' إصدار إشعار مدين</button></div>' : '')
    + (related.length ? '<div class="card stack"><h3>مستندات مرتبطة</h3>' + related.map(function(r){ return '<button class="list-row click" style="background:none;border-inline:0;border-top:0;width:100%;text-align:start;color:var(--fg)" data-go="invoiceView" data-id="' + r.no + '">' + ic('file') + '<span class="grow"><b class="small tnum">' + r.no + '</b><span class="faint xs" style="display:block">' + INV_KIND[r.kind][0] + '</span></span>' + st('inv', r.status) + '</button>'; }).join('') + '</div>' : '')
    + (cust ? '<div class="card stack"><h3>العميل</h3><b>' + esc(cust.name) + '</b><span class="muted small tnum">' + cust.phone + '</span><button class="btn btn-ghost btn-sm" data-go="customer" data-id="' + cust.id + '">سجل فواتير العميل ' + ic('chevL') + '</button></div>' : '')
    + '<div class="card stack"><h3>سجل العمليات</h3><div class="timeline">' + [['اعتماد المستند وتوليد رمز QR', fmtDT(inv.at), 'done'], [inv.kind === 'tax' ? 'اعتماد الهيئة (Clearance)' : 'الإبلاغ لمنصة فاتورة (Reporting)', inv.status === 'queued' ? 'بانتظار المحاولة التالية' : fmtDT(inv.at), inv.status === 'queued' ? 'cur' : 'done'], ['حفظ في سجل الفواتير', 'يُحتفظ به وفق المدة النظامية', 'done']].map(function(x){ return '<div class="tl-item ' + x[2] + '"><span class="tl-dot">' + ic(x[2] === 'done' ? 'check' : 'clock') + '</span><div><b>' + x[0] + '</b><small>' + x[1] + '</small></div></div>'; }).join('') + '</div></div>'
    + '</div></div>';
};
ACT.sendInApp = function(el){ var inv = D.invoices.filter(function(i){ return i.no === el.getAttribute('data-id'); })[0]; if (!inv.cust){ toast('الفاتورة لعميل نقدي. استخدم مشاركة الرابط أو PDF.', 'info'); return; } toast('أُرسلت الفاتورة إلى حساب «' + custName(inv.cust) + '» في تطبيق وصلة، وتظهر في قسم الفواتير والضمان لديه'); };
ACT.sendPdf = function(el){
  var inv = D.invoices.filter(function(i){ return i.no === el.getAttribute('data-id'); })[0], c = inv.cust ? byId(D.customers, inv.cust) : null;
  openModal(modalHead('إرسال ملف PDF', inv.no) + '<div class="modal-body"><div class="stack-sm">' + [['whatsapp','واتساب', c ? c.phone : 'أدخل الرقم'],['mail','البريد الإلكتروني', c && c.email ? c.email : 'أدخل البريد'],['message','رسالة نصية', c ? c.phone : 'أدخل الرقم']].map(function(x){ return '<button class="opt" data-act="pdfVia" data-v="' + x[1] + '"><span class="list-ic tone-brand">' + ic(x[0]) + '</span><span class="opt-main"><b>' + x[1] + '</b><small class="tnum">' + esc(x[2]) + '</small></span>' + ic('chevL') + '</button>'; }).join('') + '</div><p class="faint xs">يُرفق مع ملف PDF رابط التحقق ورمز QR. الملف نسخة للعرض، والمستند النظامي هو النسخة الإلكترونية المحفوظة.</p></div>');
};
ACT.pdfVia = function(el){ closeModal(); toast('في النسخة الفعلية يُرسل ملف PDF عبر ' + el.getAttribute('data-v')); };
ACT.printInv = function(){
  openModal(modalHead('طباعة الفاتورة') + '<div class="modal-body"><div class="stack-sm">' + [['طابعة حرارية 80 مم','متصلة عبر البلوتوث · مناسبة للكاشير'],['طابعة A4','عبر الشبكة أو من الكمبيوتر'],['طابعة حرارية 58 مم','غير متصلة حالياً']].map(function(x, i){ return '<button class="opt' + (i === 0 ? ' sel' : '') + '"' + (i === 2 ? ' disabled style="opacity:.5"' : ' data-act="doPrint" data-v="' + x[0] + '"') + '><span class="radio"></span><span class="opt-main"><b>' + x[0] + '</b><small>' + x[1] + '</small></span></button>'; }).join('') + '</div></div>');
};
ACT.doPrint = function(el){ closeModal(); toast('أُرسلت الفاتورة إلى ' + el.getAttribute('data-v') + ' (محاكاة)'); };

/* credit / debit notes */
ACT.openNote = function(el){
  var inv = D.invoices.filter(function(i){ return i.no === el.getAttribute('data-id'); })[0];
  S.cn = {src:inv.no, kind:el.getAttribute('data-kind'), sel:{}, reason:'', amount:'', restock:true};
  noteModal();
};
function noteModal(){
  var n = S.cn, inv = D.invoices.filter(function(i){ return i.no === n.src; })[0], credit = n.kind === 'credit';
  var reasons = credit ? ['مرتجع بضاعة','خصم لاحق متفق عليه','خطأ في السعر','إلغاء خدمة لم تُقدَّم'] : ['خدمة إضافية بعد الفاتورة','خطأ في السعر بالنقص','رسوم إضافية متفق عليها'];
  var body = credit ? '<span class="label">البنود المشمولة</span>' + inv.lines.map(function(l, i){ var on = n.sel[i] != null; return '<div class="row-between card card-tight"><label class="check"><input type="checkbox" data-act="cnToggle" data-i="' + i + '"' + (on ? ' checked' : '') + '><span>' + esc(l.name) + ' <span class="faint xs">(' + l.qty + ' × ' + amt(l.price) + ')</span></span></label>' + (on ? '<input class="input input-sm tnum" style="width:90px" type="number" min="1" max="' + l.qty + '" data-bind="S.cn.sel.' + i + '" data-num value="' + n.sel[i] + '" aria-label="الكمية">' : '') + '</div>'; }).join('')
    : F({id:'cn-amt', label:'المبلغ الإضافي قبل الضريبة', bind:'S.cn.amount', type:'number', num:true, ltr:true, prefix:'ر.س', req:true});
  openModal(modalHead(credit ? 'إشعار دائن' : 'إشعار مدين', 'مرتبط بالفاتورة ' + inv.no) + '<form data-act="issueNote" novalidate><div class="modal-body">' + body
    + F({id:'cn-reason', type:'select', label:'سبب الإصدار', bind:'S.cn.reason', req:true, options:[['','اختر السبب']].concat(reasons.map(function(r){ return [r, r]; }))})
    + (credit ? SW({id:'cn-restock', bind:'S.cn.restock', label:'إعادة الأصناف المرتجعة إلى المخزون'}) : '')
    + '<div class="err" id="cn-err"></div></div><div class="modal-foot"><button class="btn btn-primary" type="submit">' + ic('check') + ' إصدار واعتماد الإشعار</button><button type="button" class="btn btn-ghost" data-act="closeModal">إلغاء</button></div></form>');
}
ACT.cnToggle = function(el){ var i = el.getAttribute('data-i'), inv = D.invoices.filter(function(x){ return x.no === S.cn.src; })[0]; if (S.cn.sel[i] != null) delete S.cn.sel[i]; else S.cn.sel[i] = inv.lines[i].qty; noteModal(); };
ACT.issueNote = function(){
  var n = S.cn, inv = D.invoices.filter(function(i){ return i.no === n.src; })[0], credit = n.kind === 'credit', err = '';
  if (!n.reason) err = 'اختر سبب الإصدار';
  if (credit && !Object.keys(n.sel).length) err = 'اختر بنداً واحداً على الأقل';
  if (!credit && !(Number(n.amount) > 0)) err = 'أدخل المبلغ الإضافي';
  if (err){ var e = $('#cn-err'); if (e) e.textContent = err; return; }
  var lines = credit ? Object.keys(n.sel).map(function(i){ var l = inv.lines[i]; return {name:l.name, qty:Math.min(Number(n.sel[i]) || 1, l.qty), price:l.price, disc:0, vat:l.vat, inv:l.inv}; }) : [{name:n.reason, qty:1, price:Number(n.amount), disc:0, vat:15}];
  var no = credit ? 'CN-2026-' + pad6(D.invSeq.cn++) : 'DN-2026-' + pad6(D.invSeq.dn++);
  var doc = {no:no, icv:D.invSeq.icv++, kind:n.kind, ref:inv.no, cust:inv.cust, at:nowStamp(), status:'queued', uuid:uuid(), reason:n.reason, lines:lines};
  if (credit && n.restock && n.reason === 'مرتجع بضاعة') lines.forEach(function(l){ if (l.inv){ var it = invItem(l.inv), b = it.qty; it.qty += Number(l.qty); D.moves.unshift({at:doc.at, item:it.id, type:'return', qty:Number(l.qty), before:b, after:it.qty, ref:no, by:D.store.owner}); } });
  postInvoice(doc); S.cn = null; closeModal(); go('invoiceView', {id:no});
  toast('صدر ' + INV_KIND[n.kind][0] + ' ' + no + ' مرتبطاً بالفاتورة ' + inv.no);
};

/* ===== invoice log ===== */
M.invoiceLog = function(){
  var k = curTab('invKind', 'all'), s = curTab('invStatus', 'all');
  var list = D.invoices.filter(function(i){ return (k === 'all' || i.kind === k) && (s === 'all' || i.status === s); });
  return pageHead('سجل الفواتير', 'كل الفواتير والإشعارات المعتمدة، محفوظة ولا تُحذف.', '<button class="btn btn-primary" data-act="newInvoice">' + ic('plus') + ' فاتورة جديدة</button>', ['invoices','الفواتير الإلكترونية'])
    + '<div class="row" style="margin-bottom:14px">' + searchBox('invlog', '#inv-list', 'ابحث برقم الفاتورة أو العميل أو الجوال أو الرقم الضريبي')
    + '<select class="select" style="width:auto" data-act-change aria-label="نوع المستند" data-bind="S.tab.invKind" data-rerender>' + [['all','كل الأنواع']].concat(Object.keys(INV_KIND).map(function(x){ return [x, INV_KIND[x][0]]; })).map(function(o){ return '<option value="' + o[0] + '"' + (k === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'
    + '<select class="select" style="width:auto" aria-label="الحالة" data-bind="S.tab.invStatus" data-rerender>' + [['all','كل الحالات'],['reported','مُبلّغة للهيئة'],['cleared','معتمدة من الهيئة'],['queued','بانتظار الإبلاغ']].map(function(o){ return '<option value="' + o[0] + '"' + (s === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>'
    + invTable(list);
};

/* ===== invoice settings & ZATCA ===== */
const ZATCA_CHECKS = ['فاتورة ضريبية','فاتورة ضريبية مبسطة','إشعار دائن ضريبي','إشعار دائن مبسط','إشعار مدين ضريبي','إشعار مدين مبسط'];
M.invoiceSettings = function(){
  var z = D.zatca, done = z.checks >= 6;
  var steps = [['إنشاء مفتاح التشفير وطلب الشهادة (CSR)', 'يُنشأ داخل الخادم ولا يغادره', 'done'], ['شهادة الامتثال (Compliance CSID)', 'صدرت من بوابة فاتورة باستخدام رمز OTP من حساب المنشأة', 'done'], ['فحوص الامتثال', z.checks + ' من 6 مستندات اجتازت الفحص', done ? 'done' : 'cur'], ['شهادة الإنتاج (Production CSID)', z.phase2 === 'live' ? 'مفعّلة: الربط الفعلي يعمل' : 'تُطلب عند حلول موعد إلزام المنشأة', z.phase2 === 'live' ? 'done' : '']];
  return pageHead('إعدادات المنشأة والضريبة', 'تظهر هذه البيانات في كل فاتورة. تعديلها لا يغيّر الفواتير السابقة.', '', ['invoices','الفواتير الإلكترونية'])
    + '<div class="split"><form class="stack" data-act="saveInvSettings" novalidate>'
    + '<div class="card stack"><h3>بيانات المنشأة</h3><div class="form-grid">' + F({id:'is-ar', label:'الاسم النظامي بالعربية', bind:'D.invSettings.legalAr', req:true, cls:'full'}) + F({id:'is-en', label:'الاسم بالإنجليزية', bind:'D.invSettings.legalEn', ltr:true, cls:'full', opt:true})
    + F({id:'is-vat', label:'الرقم الضريبي', bind:'D.invSettings.vat', ltr:true, req:true, hint:'15 رقماً يبدأ وينتهي بالرقم 3'}) + F({id:'is-cr', label:'رقم السجل التجاري', bind:'D.invSettings.cr', ltr:true}) + '</div></div>'
    + '<div class="card stack"><h3>العنوان الوطني</h3><div class="form-grid">' + F({id:'is-b', label:'رقم المبنى', bind:'D.invSettings.building', ltr:true}) + F({id:'is-st', label:'الشارع', bind:'D.invSettings.street'}) + F({id:'is-d', label:'الحي', bind:'D.invSettings.district'}) + F({id:'is-c', label:'المدينة', bind:'D.invSettings.city', type:'select', options:CITIES}) + F({id:'is-p', label:'الرمز البريدي', bind:'D.invSettings.postal', ltr:true}) + F({id:'is-a', label:'الرقم الإضافي', bind:'D.invSettings.addNo', ltr:true}) + '</div></div>'
    + '<div class="card stack"><h3>شكل الفاتورة</h3><div class="form-grid">' + F({id:'is-lang', type:'select', label:'لغة الفاتورة', bind:'D.invSettings.lang', options:[['ar','العربية فقط'],['ar-en','العربية والإنجليزية']]}) + F({id:'is-rate', type:'select', label:'نسبة الضريبة الافتراضية', bind:'D.invSettings.rate', options:[['15','15% (الأساسية)'],['0','0% (معفى)']]}) + '</div><div class="field"><span class="label">الشعار في الفاتورة</span>' + logoUploader('D.store.logo') + '</div></div>'
    + '<div class="form-actions"><button class="btn btn-primary btn-lg" type="submit">' + ic('check') + ' حفظ الإعدادات</button></div></form>'
    + '<div class="stack split-aside"><div class="card stack"><div class="row-between"><h3>الربط مع منصة فاتورة</h3>' + pill(z.phase2 === 'live' ? 'مرتبط' : 'بيئة الاختبار', z.phase2 === 'live' ? 'ok' : 'warn') + '</div>'
    + '<div class="sum-row"><span>المرحلة الأولى: الإصدار والحفظ</span>' + pill('مفعّلة', 'ok') + '</div><div class="sum-row"><span>المرحلة الثانية: الربط والتكامل</span>' + pill(z.phase2 === 'live' ? 'مفعّلة' : 'قيد التجهيز', z.phase2 === 'live' ? 'ok' : 'warn') + '</div>'
    + '<div class="timeline" style="margin-top:8px">' + steps.map(function(x){ return '<div class="tl-item ' + x[2] + '"><span class="tl-dot">' + ic(x[2] === 'done' ? 'check' : x[2] === 'cur' ? 'clock' : 'lock') + '</span><div><b>' + x[0] + '</b><small>' + x[1] + '</small></div></div>'; }).join('') + '</div>'
    + (z.checks > 0 && z.checks < 6 || S.zRun ? '<div class="stack-sm">' + ZATCA_CHECKS.map(function(c, i){ return '<div class="row small">' + (i < z.checks ? '<span class="pos">' + ic('check') + '</span>' : '<span class="faint">' + ic('clock') + '</span>') + c + '</div>'; }).join('') + '</div>' : '')
    + (!done ? '<button class="btn btn-primary" data-act="runZatca"' + (S.zRun ? ' disabled' : '') + '>' + ic('play') + (S.zRun ? ' جارٍ الفحص…' : ' تشغيل فحوص الامتثال') + '</button>' : z.phase2 !== 'live' ? '<button class="btn btn-outline" data-act="goLive">' + ic('key') + ' طلب شهادة الإنتاج (محاكاة)</button>' : '')
    + '<p class="faint xs">تُحفظ مفاتيح التشفير والشهادات داخل الخادم مشفّرة، ولا توضع داخل تطبيق الجوال. يجب التحقق من المتطلبات الفنية الحالية لدى الهيئة قبل الإطلاق.</p>'
    + '<div class="stack-sm"><a href="https://zatca.gov.sa/ar/E-Invoicing/Pages/default.aspx" target="_blank" rel="noopener">' + ic('link') + ' بوابة الفوترة الإلكترونية في الهيئة</a><a href="https://zatca.gov.sa/ar/E-Invoicing/PreparingYourBusiness/Phase1/Pages/How-to-prepare.aspx" target="_blank" rel="noopener">' + ic('link') + ' الاستعداد للمرحلة الأولى</a></div></div></div></div>';
};
ACT.saveInvSettings = function(){ if (!/^3\d{13}3$/.test(D.invSettings.vat)){ S.err = {'is-vat':'الرقم الضريبي 15 رقماً يبدأ وينتهي بالرقم 3'}; render(); return; } S.err = {}; render(); toast('حُفظت الإعدادات وستظهر في الفواتير الجديدة'); };
ACT.runZatca = function(){
  S.zRun = true; D.zatca.checks = 0; render();
  var t = setInterval(function(){ D.zatca.checks++; if (D.zatca.checks >= 6){ clearInterval(t); S.zRun = false; toast('اجتازت المستندات الستة فحوص الامتثال'); } if (S.m.screen === 'invoiceSettings') render(); }, 450);
};
ACT.goLive = function(){ D.zatca.phase2 = 'live'; render(); toast('صدرت شهادة الإنتاج وأصبح الربط الفعلي مفعّلاً (محاكاة)'); };

/* ===== invoicing subscription ===== */
M.invoiceSub = function(){
  var sub = D.subs.invoicing, plan = byId(D.settings.plans, sub.plan), used = D.invStats.month;
  return pageHead('اشتراك الفواتير الإلكترونية', 'اشتراك مستقل عن رصيد النقاط وعن صفحة المحل.', '', ['invoices','الفواتير الإلكترونية'])
    + '<div class="grid-2" style="margin-bottom:20px"><section class="card stack"><div class="row-between"><h3>اشتراكك الحالي</h3>' + pill('فعّال', 'ok') + '</div>'
    + '<div class="sum-row"><span>الباقة</span><b>' + plan.name + '</b></div><div class="sum-row"><span>السعر والمدة</span><b>' + money(plan.price) + ' شهرياً</b></div><div class="sum-row"><span>تاريخ البدء</span><b>' + fmtDate(sub.since) + '</b></div><div class="sum-row"><span>تاريخ التجديد</span><b>' + fmtDate(sub.renews) + '</b></div><div class="sum-row"><span>طريقة التفعيل</span><b>بعد تأكيد الدفع</b></div>'
    + (plan.limit ? '<div><div class="row-between small"><span class="muted">استخدام هذا الشهر</span><b class="tnum">' + used + ' / ' + plan.limit + ' فاتورة</b></div><div class="meter" style="margin-top:6px"><span style="width:' + Math.min(100, used / plan.limit * 100) + '%"></span></div></div>' : '')
    + '<div class="row"><button class="btn btn-primary" data-act="changePlan">تغيير الباقة</button><button class="btn btn-ghost" data-act="supportModal">' + ic('phone') + ' التواصل مع الدعم</button></div></section>'
    + '<section class="card stack"><h3>مزايا الخدمة</h3><div class="list">' + ['إصدار فواتير ضريبية ومبسطة وإشعارات دائنة ومدينة','رمز QR وبيانات إلكترونية وفق متطلبات الهيئة','إرسال الفاتورة للعميل في التطبيق أو برابط أو PDF','الطباعة على طابعات حرارية وA4','إدارة العملاء وربط الفواتير بالمخزون','حفظ آمن للسجلات وسجل تدقيق للعمليات'].map(function(f){ return '<div class="list-row">' + '<span class="pos">' + ic('check') + '</span><span class="small">' + f + '</span></div>'; }).join('') + '</div></section></div>'
    + '<h3 style="margin-bottom:12px">الباقات المتاحة</h3><div class="grid-2">' + D.settings.plans.map(function(p){ return '<div class="pkg' + (p.id === sub.plan ? ' sel' : '') + '">' + (p.id === sub.plan ? '<span class="pill pill-brand ribbon">باقتك الحالية</span>' : '') + '<span class="muted small">' + p.name + '</span><b class="tnum">' + p.price + ' <small style="font-size:14px">ر.س / شهر</small></b><div class="list">' + p.feats.map(function(f){ return '<div class="list-row small" style="padding:6px 0">' + ic('check') + f + '</div>'; }).join('') + '</div></div>'; }).join('') + '</div>'
    + '<div style="margin-top:16px">' + note('info', 'شراء النقاط للترويج أو للمساعد الذكي عملية مستقلة ولا يجدد هذا الاشتراك. ولا يمنعك رصيد النقاط من إصدار فواتيرك النظامية ضمن اشتراكك.') + '</div>';
};
ACT.changePlan = function(){
  var cur = D.subs.invoicing.plan;
  openModal(modalHead('تغيير باقة الفواتير') + '<div class="modal-body"><div class="stack-sm">' + D.settings.plans.map(function(p){ return '<button class="opt' + (p.id === (S.newPlan || cur) ? ' sel' : '') + '" data-act="pickPlan" data-v="' + p.id + '"><span class="radio"></span><span class="opt-main"><b>' + p.name + '</b><small>' + (p.limit ? p.limit + ' فاتورة شهرياً' : 'فواتير غير محدودة') + ' · ' + p.users + ' مستخدم</small></span><b class="tnum">' + money(p.price) + '</b></button>'; }).join('') + '</div>' + note('neutral', 'تُفعَّل الباقة الجديدة بعد تأكيد الدفع فقط، ويُحتسب فرق السعر للأيام المتبقية.') + '</div><div class="modal-foot"><button class="btn btn-primary" data-act="confirmPlan">' + ic('lock') + ' المتابعة للدفع</button><button class="btn btn-ghost" data-act="closeModal">إلغاء</button></div>');
};
ACT.pickPlan = function(el){ S.newPlan = el.getAttribute('data-v'); ACT.changePlan(); };
ACT.confirmPlan = function(){ var p = S.newPlan || D.subs.invoicing.plan; closeModal(); toast('جارٍ التحقق من الدفع…', 'info'); setTimeout(function(){ D.subs.invoicing.plan = p; S.newPlan = null; render(); toast('تأكد الدفع وفُعّلت ' + byId(D.settings.plans, p).name); }, 1200); };

/* ===== customers ===== */
function custStats(id){ var l = D.invoices.filter(function(i){ return i.cust === id; }); var total = l.reduce(function(a, i){ var t = invTotals(i.lines).total; return a + (i.kind === 'credit' ? -t : t); }, 0); return {count:l.filter(function(i){ return i.kind !== 'credit'; }).length, total:total, last:l[0] ? l[0].at : null, list:l}; }
M.customers = function(){
  return pageHead('العملاء', 'بيانات عملاء محلك محمية ولا تظهر لأي متجر آخر.', '<button class="btn btn-primary" data-act="addCustomer">' + ic('plus') + ' إضافة عميل</button>')
    + '<div class="row-between" style="margin-bottom:14px">' + searchBox('cust', '#cust-list', 'ابحث بالاسم أو رقم الجوال أو الرقم الضريبي') + '<span class="muted small">' + D.customers.length + ' عملاء</span></div>'
    + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>العميل</th><th>الجوال</th><th>الرقم الضريبي</th><th class="num">الفواتير</th><th class="num">إجمالي المشتريات</th><th>آخر فاتورة</th></tr></thead><tbody id="cust-list">'
    + D.customers.map(function(c){ var s = custStats(c.id); return '<tr class="click" data-go="customer" data-id="' + c.id + '" data-q="' + esc(c.name + ' ' + c.phone + ' ' + c.vat) + '"><td><b>' + esc(c.name) + '</b><span class="sub">عميل منذ ' + fmtDate(c.since) + '</span></td><td class="tnum">' + c.phone + '</td><td class="tnum">' + (c.vat || '<span class="faint">—</span>') + '</td><td class="num">' + s.count + '</td><td class="num">' + money(s.total) + '</td><td class="tnum">' + (s.last ? fmtDate(s.last) : '—') + '</td></tr>'; }).join('')
    + '</tbody></table></div><div id="cust-list-empty" hidden>' + empty('search', 'لا يوجد عميل مطابق', 'تحقق من الاسم أو الرقم، أو أضف العميل.', '<button class="btn btn-primary" data-act="addCustomer">' + ic('plus') + ' إضافة عميل</button>') + '</div>';
};
function custModal(c){
  S.cd = c ? JSON.parse(JSON.stringify(c)) : {id:null, name:'', phone:'', email:'', vat:'', notes:''};
  openModal(modalHead(c ? 'تعديل بيانات العميل' : 'إضافة عميل جديد', c ? 'يُسجّل التعديل في سجل العمليات باسمك' : '') + '<form data-act="saveCustomer" novalidate><div class="modal-body">' + F({id:'cd-name', label:'اسم العميل', bind:'S.cd.name', req:true, attrs:'autofocus'}) + '<div class="form-grid">' + F({id:'cd-phone', label:'رقم الجوال', bind:'S.cd.phone', req:true, ltr:true, type:'tel', ph:'05XXXXXXXX'}) + F({id:'cd-email', label:'البريد الإلكتروني', bind:'S.cd.email', ltr:true, type:'email', opt:true}) + '</div>' + F({id:'cd-vat', label:'الرقم الضريبي', bind:'S.cd.vat', ltr:true, opt:true, ph:'3XXXXXXXXXXXXX3', hint:'للمنشآت التي تحتاج فاتورة ضريبية'}) + F({id:'cd-notes', label:'ملاحظات', bind:'S.cd.notes', type:'textarea', opt:true}) + '</div><div class="modal-foot"><button class="btn btn-primary" type="submit">' + ic('check') + ' حفظ</button><button type="button" class="btn btn-ghost" data-act="closeModal">إلغاء</button></div></form>');
}
ACT.addCustomer = function(){ custModal(null); };
ACT.editCustomer = function(el){ custModal(byId(D.customers, el.getAttribute('data-id'))); };
ACT.saveCustomer = function(){
  var c = S.cd, e = {};
  if (!String(c.name).trim()) e['cd-name'] = 'أدخل اسم العميل';
  if (!/^0\d{9}$/.test(c.phone)) e['cd-phone'] = 'أدخل رقم جوال صحيحاً من 10 أرقام';
  else if (D.customers.some(function(x){ return x.phone === c.phone && x.id !== c.id; })) e['cd-phone'] = 'يوجد عميل مسجّل بهذا الرقم';
  if (c.email && !/^\S+@\S+\.\S+$/.test(c.email)) e['cd-email'] = 'صيغة البريد غير صحيحة';
  if (c.vat && !/^3\d{13}3$/.test(c.vat)) e['cd-vat'] = 'الرقم الضريبي 15 رقماً يبدأ وينتهي بالرقم 3';
  var mm = document.querySelectorAll('#modal-root .field');
  if (Object.keys(e).length){ mm.forEach(function(f){ var inp = f.querySelector('input,textarea'); if (inp && e[inp.id]){ f.classList.add('has-err'); f.querySelector('.err').textContent = e[inp.id]; } }); return; }
  if (c.id){ Object.assign(byId(D.customers, c.id), c); closeModal(); render(); toast('حُدّثت بيانات العميل'); }
  else { c.id = 'CU' + (D.customers.length + 1 + Math.floor(Math.random() * 50)); c.since = TODAY; D.customers.unshift(c); closeModal(); go('customer', {id:c.id}); toast('أُضيف العميل «' + c.name + '»'); }
};
M.customer = function(){
  var c = byId(D.customers, S.m.params.id) || D.customers[0], s = custStats(c.id);
  return pageHead(esc(c.name), 'عميل منذ ' + fmtDate(c.since), '<button class="btn btn-primary" data-act="newInvoice" data-cust="' + c.id + '">' + ic('receipt') + ' فاتورة جديدة لهذا العميل</button><button class="btn btn-outline" data-act="editCustomer" data-id="' + c.id + '">' + ic('edit') + ' تعديل البيانات</button>', ['customers','العملاء'])
    + '<div class="kpis">' + kpi('عدد الفواتير', s.count, '', 'receipt') + kpi('إجمالي المشتريات', amt(s.total), 'ر.س شامل الضريبة', 'coins') + kpi('آخر فاتورة', s.last ? fmtShort(s.last) : '—', '', 'calendar') + '</div>'
    + '<div class="split"><div class="stack"><h3>سجل الفواتير</h3>' + invTable(s.list) + '</div><div class="stack split-aside"><div class="card stack"><h3>بيانات التواصل</h3><dl class="kv"><dt>الجوال</dt><dd class="tnum">' + c.phone + '</dd><dt>البريد</dt><dd>' + esc(c.email || '—') + '</dd><dt>الرقم الضريبي</dt><dd class="tnum">' + (c.vat || '—') + '</dd></dl></div>'
    + '<div class="card stack"><h3>ملاحظات</h3><textarea class="textarea" id="cu-notes" data-bind="D.customers.' + D.customers.indexOf(c) + '.notes" aria-label="ملاحظات العميل">' + esc(c.notes) + '</textarea><button class="btn btn-outline btn-sm" data-act="soon" data-msg="حُفظت الملاحظة">حفظ الملاحظة</button></div>'
    + '<div class="card stack"><h3>سجل العمليات</h3><div class="timeline"><div class="tl-item done"><span class="tl-dot">' + ic('user') + '</span><div><b>أُضيف العميل</b><small>' + fmtDate(c.since) + ' · ياسر المالكي</small></div></div><div class="tl-item done"><span class="tl-dot">' + ic('edit') + '</span><div><b>تعديل رقم الجوال</b><small>بواسطة عبدالله الحربي (صلاحية: إدارة العملاء)</small></div></div></div></div></div></div>';
};

/* ===== inventory ===== */
M.inventory = function(){
  var t = curTab('inv', 'items');
  var low = lowStock();
  var head = pageHead('المخزون', 'يتحدث تلقائياً مع المبيعات والمشتريات والمرتجعات المعتمدة.', '<button class="btn btn-primary" data-act="addItem">' + ic('plus') + ' إضافة صنف</button><button class="btn btn-outline" data-go="ai">' + ic('camera') + ' تصوير فاتورة مورد</button>');
  var tb = tabs('inv', [['items','الأصناف',null,D.inventory.length],['moves','حركات المخزون',null,D.moves.length],['purchases','المشتريات والمرتجعات'],['reports','التقارير']], 'items');
  var body = '';
  if (t === 'items'){
    var f = curTab('invf', 'all');
    var list = D.inventory.filter(function(i){ return f === 'all' ? true : f === 'low' ? (i.qty > 0 && i.qty <= i.min) : i.qty <= 0; });
    body = (low.length ? '<div style="margin-bottom:14px">' + note('warn', '<b>تنبيه انخفاض المخزون:</b> ' + low.map(function(i){ return esc(i.name) + ' (' + i.qty + ')'; }).join('، ')) + '</div>' : '')
      + '<div class="row" style="margin-bottom:14px">' + searchBox('inv', '#inv-items', 'ابحث بالاسم أو الرمز أو الباركود') + tabs('invf', [['all','الكل'],['low','منخفض'],['out','نافد']], 'all', 'seg') + '</div>'
      + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الصنف</th><th>الباركود</th><th>التصنيف</th><th class="num">الكمية</th><th class="num">الحد الأدنى</th><th class="num">سعر الشراء</th><th class="num">سعر البيع</th><th>المورد</th><th>تاريخ الإضافة</th><th>الحالة</th><th></th></tr></thead><tbody id="inv-items">'
      + list.map(function(i){ var sup = byId(D.suppliers, i.sup), stt = i.qty <= 0 ? pill('نافد', 'bad') : i.qty <= i.min ? pill('منخفض', 'warn') : pill('متوفر', 'ok'); return '<tr data-q="' + esc(i.name + ' ' + i.sku + ' ' + i.barcode) + '"' + (i.qty <= 0 ? ' class="row-bad"' : i.qty <= i.min ? ' class="row-warn"' : '') + '><td><b>' + esc(i.name) + '</b><span class="sub tnum">' + i.sku + '</span></td><td class="tnum">' + (i.barcode || '—') + '</td><td>' + esc(i.cat) + '</td><td class="num"><b>' + i.qty + '</b></td><td class="num">' + i.min + '</td><td class="num">' + amt(i.buy) + '</td><td class="num">' + amt(i.sell) + '</td><td>' + (sup ? esc(sup.name) : '—') + '</td><td class="tnum">' + fmtDate(i.added) + '</td><td>' + stt + '</td><td><div class="row" style="flex-wrap:nowrap"><button class="btn btn-ghost btn-sm" data-act="editItem" data-id="' + i.id + '">تعديل</button><button class="btn btn-ghost btn-sm" data-act="adjustItem" data-id="' + i.id + '">تعديل الكمية</button></div></td></tr>'; }).join('')
      + '</tbody></table></div><div id="inv-items-empty" hidden>' + empty('search', 'لا يوجد صنف مطابق', 'جرّب الاسم أو الرمز أو الباركود.') + '</div>';
  } else if (t === 'moves'){
    var mt = curTab('mvType', 'all');
    var mv = D.moves.filter(function(m){ return mt === 'all' || m.type === mt; });
    body = '<div class="row" style="margin-bottom:14px">' + tabs('mvType', [['all','الكل']].concat(Object.keys(MOVE).map(function(k){ return [k, MOVE[k][0]]; })), 'all', 'seg') + '</div>'
      + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>التاريخ</th><th>الصنف</th><th>نوع الحركة</th><th class="num">الكمية</th><th class="num">قبل ← بعد</th><th>العملية المرتبطة</th><th>بواسطة</th></tr></thead><tbody>'
      + mv.map(function(m){ var it = invItem(m.item); return '<tr><td class="tnum">' + fmtDT(m.at) + '</td><td>' + esc(it ? it.name : m.item) + '</td><td>' + pill(MOVE[m.type][0], MOVE[m.type][1]) + (m.note ? '<span class="sub">' + esc(m.note) + '</span>' : '') + '</td><td class="num ' + (m.qty > 0 ? 'pos' : 'negv') + '"><b>' + (m.qty > 0 ? '+' : '') + m.qty + '</b></td><td class="num">' + m.before + ' ← ' + m.after + '</td><td class="tnum" dir="ltr" style="text-align:start">' + m.ref + '</td><td>' + esc(m.by) + '</td></tr>'; }).join('')
      + '</tbody></table></div><p class="faint xs" style="margin-top:10px">لا يمكن تعديل حركة مسجّلة. تعديل الكميات الحساسة يتطلب صلاحية «تعديل الكميات» ويُسجّل في سجل التدقيق.</p>';
  } else if (t === 'purchases'){
    if (!S.pur) S.pur = {sup:'S1', ref:'', date:TODAY, rows:[{item:'I2', qty:10, cost:132}]};
    if (!S.sret) S.sret = {item:'I6', qty:1, reason:'تالف عند الاستلام'};
    var p = S.pur, total = p.rows.reduce(function(a, r){ return a + (Number(r.qty) || 0) * (Number(r.cost) || 0); }, 0);
    var opts = D.inventory.map(function(i){ return [i.id, i.name]; });
    body = '<div class="split"><form class="card stack" data-act="savePurchase" novalidate><h3>تسجيل مشتريات من مورد</h3><div class="form-grid">' + F({id:'pu-sup', type:'select', label:'المورد', bind:'S.pur.sup', options:D.suppliers.map(function(s){ return [s.id, s.name]; })}) + F({id:'pu-ref', label:'رقم فاتورة المورد', bind:'S.pur.ref', ltr:true, req:true, ph:'J-88407'}) + F({id:'pu-date', label:'التاريخ', bind:'S.pur.date', type:'date', ltr:true}) + '</div>'
      + '<div class="tbl-wrap"><table class="tbl tbl-compact"><thead><tr><th>الصنف</th><th style="width:100px">الكمية</th><th style="width:130px">سعر الشراء</th><th></th></tr></thead><tbody>' + p.rows.map(function(r, i){ return '<tr><td><select class="select input-sm" data-bind="S.pur.rows.' + i + '.item" aria-label="الصنف">' + opts.map(function(o){ return '<option value="' + o[0] + '"' + (o[0] === r.item ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></td><td><input class="input input-sm tnum" type="number" min="1" data-bind="S.pur.rows.' + i + '.qty" data-num value="' + r.qty + '" aria-label="الكمية"></td><td><input class="input input-sm tnum" type="number" min="0" step="0.01" data-bind="S.pur.rows.' + i + '.cost" data-num value="' + r.cost + '" aria-label="سعر الشراء"></td><td><button type="button" class="icon-btn" data-act="rmImg" data-path="S.pur.rows" data-i="' + i + '" aria-label="حذف">' + ic('trash') + '</button></td></tr>'; }).join('') + '</tbody></table></div>'
      + '<div class="row-between"><button type="button" class="btn btn-ghost btn-sm" data-act="addPurRow">' + ic('plus') + ' إضافة صنف</button><b class="tnum">الإجمالي قبل الضريبة: ' + money(total) + '</b></div><div class="form-actions"><button class="btn btn-primary" type="submit">' + ic('check') + ' اعتماد المشتريات وتحديث الكميات</button><button type="button" class="btn btn-outline" data-go="ai">' + ic('sparkles') + ' أو اقرأ الفاتورة بالمساعد الذكي</button></div></form>'
      + '<div class="stack"><form class="card stack" data-act="saveSupReturn" novalidate><h3>مرتجع إلى المورد</h3>' + F({id:'sr-item', type:'select', label:'الصنف', bind:'S.sret.item', options:opts}) + F({id:'sr-qty', label:'الكمية', bind:'S.sret.qty', type:'number', num:true, ltr:true}) + F({id:'sr-reason', type:'select', label:'السبب', bind:'S.sret.reason', options:['تالف عند الاستلام','صنف غير مطابق للطلب','انتهاء الصلاحية']}) + '<button class="btn btn-outline" type="submit">تسجيل المرتجع</button></form>'
      + note('info', 'مرتجعات المبيعات تُسجَّل تلقائياً عند إصدار إشعار دائن بسبب «مرتجع بضاعة» من الفاتورة الأصلية.') + '</div></div>';
  } else {
    var sold = {};
    D.moves.forEach(function(m){ if (m.type === 'sale') sold[m.item] = (sold[m.item] || 0) - m.qty; });
    var base = {I1:46, I2:31, I3:18, I4:22, I7:15, I6:12, I8:9, I5:7};
    var top = D.inventory.map(function(i){ return {i:i, v:(base[i.id] || 4) + (sold[i.id] || 0)}; }).sort(function(a, b){ return b.v - a.v; }).slice(0, 6);
    var maxv = top[0].v;
    var value = D.inventory.reduce(function(a, i){ return a + i.qty * i.buy; }, 0);
    body = '<div class="kpis">' + kpi('قيمة المخزون', amt(value), 'ر.س بسعر الشراء', 'coins') + kpi('أصناف منخفضة أو نافدة', lowStock().length, 'تحتاج إعادة طلب', 'alert') + kpi('أصناف نشطة', D.inventory.length, '', 'archive') + '</div>'
      + '<div class="grid-2"><section class="card"><h3 style="margin-bottom:12px">الأصناف الأكثر حركة (90 يوماً)</h3>' + top.map(function(x){ return '<div class="hbar"><span>' + esc(x.i.name) + '</span><div class="meter"><span style="width:' + Math.round(x.v / maxv * 100) + '%"></span></div><b class="tnum">' + x.v + '</b></div>'; }).join('') + '<p class="metric-def">عدد الوحدات المباعة.</p></section>'
      + '<section class="card"><h3 style="margin-bottom:6px">المبيعات مقابل المشتريات</h3><div class="legend" style="margin-bottom:10px"><span><i style="background:var(--brand)"></i>المبيعات</span><span><i style="background:var(--line-2)"></i>المشتريات</span></div>' + bars2([{l:'مايو',a:9.8,b:7.1},{l:'يونيو',a:11.2,b:9.4},{l:'يوليو',a:12.6,b:8.2},{l:'أغسطس',a:14.1,b:10.5},{l:'سبتمبر',a:15.3,b:9.9},{l:'أكتوبر',a:16.8,b:11.4}], {fmt:function(v){ return v.toFixed(1); }, label:'المبيعات والمشتريات بآلاف الريالات'}) + '<p class="metric-def" style="margin-top:8px">بآلاف الريالات قبل الضريبة. بيانات توضيحية.</p></section></div>';
  }
  return head + tb + body;
};
ACT.addPurRow = function(){ S.pur.rows.push({item:D.inventory[0].id, qty:1, cost:D.inventory[0].buy}); render(); };
ACT.savePurchase = function(){
  var p = S.pur; if (!String(p.ref).trim()){ S.err = {'pu-ref':'أدخل رقم فاتورة المورد'}; render(); return; }
  p.rows.forEach(function(r){ var it = invItem(r.item), b = it.qty; it.qty += Number(r.qty) || 0; it.buy = Number(r.cost) || it.buy; D.moves.unshift({at:nowStamp(), item:it.id, type:'purchase', qty:Number(r.qty), before:b, after:it.qty, ref:p.ref, by:D.store.owner}); });
  S.pur = null; S.tab.inv = 'moves'; S.err = {}; render(); toast('اعتُمدت المشتريات وحُدّثت الكميات');
};
ACT.saveSupReturn = function(){ var r = S.sret, it = invItem(r.item), q = Number(r.qty) || 0; if (q <= 0 || q > it.qty){ S.err = {'sr-qty':'الكمية بين 1 و' + it.qty}; render(); return; } var b = it.qty; it.qty -= q; D.moves.unshift({at:nowStamp(), item:it.id, type:'supreturn', qty:-q, before:b, after:it.qty, ref:rid('RTS-', 4), by:D.store.owner, note:r.reason}); S.sret = null; S.err = {}; S.tab.inv = 'moves'; render(); toast('سُجّل المرتجع للمورد'); };
function itemModal(i){
  S.it = i ? JSON.parse(JSON.stringify(i)) : {id:null, name:'', sku:'', barcode:'', cat:'فلاتر', qty:0, buy:'', sell:'', sup:'S1', min:5, active:true, added:TODAY};
  S.it.force = false; S.it.warn = '';
  itemModalRender();
}
function itemModalRender(){
  var i = S.it;
  openModal(modalHead(i.id ? 'تعديل الصنف' : 'إضافة صنف جديد') + '<form data-act="saveItem" novalidate><div class="modal-body">' + (i.warn ? note('warn', i.warn) : '') + F({id:'it-name', label:'اسم الصنف', bind:'S.it.name', req:true, attrs:'autofocus'})
    + '<div class="form-grid">' + F({id:'it-sku', label:'رمز الصنف', bind:'S.it.sku', ltr:true}) + F({id:'it-bc', label:'الباركود', bind:'S.it.barcode', ltr:true, opt:true}) + F({id:'it-cat', type:'select', label:'التصنيف', bind:'S.it.cat', options:PCATS}) + F({id:'it-sup', type:'select', label:'المورد', bind:'S.it.sup', options:[['','—']].concat(D.suppliers.map(function(s){ return [s.id, s.name]; }))})
    + (i.id ? '' : F({id:'it-qty', label:'الكمية الافتتاحية', bind:'S.it.qty', type:'number', num:true, ltr:true})) + F({id:'it-min', label:'الحد الأدنى للتنبيه', bind:'S.it.min', type:'number', num:true, ltr:true}) + F({id:'it-buy', label:'سعر الشراء', bind:'S.it.buy', type:'number', num:true, ltr:true, req:true}) + F({id:'it-sell', label:'سعر البيع', bind:'S.it.sell', type:'number', num:true, ltr:true, req:true}) + '</div>'
    + SW({id:'it-active', bind:'S.it.active', label:'الصنف نشط'}) + '<div class="err" id="it-err"></div></div><div class="modal-foot"><button class="btn btn-primary" type="submit">' + ic('check') + (i.warn && !i.id ? ' إضافة رغم ذلك' : ' حفظ') + '</button>' + (i.warn && i.dupId ? '<button type="button" class="btn btn-outline" data-act="openDup">فتح الصنف الموجود</button>' : '') + '<button type="button" class="btn btn-ghost" data-act="closeModal">إلغاء</button></div></form>');
}
ACT.addItem = function(){ itemModal(null); };
ACT.editItem = function(el){ itemModal(invItem(el.getAttribute('data-id'))); };
ACT.openDup = function(){ itemModal(invItem(S.it.dupId)); };
ACT.saveItem = function(){
  var i = S.it, err = '';
  if (!String(i.name).trim()) err = 'أدخل اسم الصنف';
  else if (!(Number(i.buy) >= 0) || i.buy === '' || !(Number(i.sell) > 0)) err = 'أدخل سعر الشراء وسعر البيع';
  if (err){ var e = $('#it-err'); if (e) e.textContent = err; return; }
  if (!i.id){
    var hard = D.inventory.filter(function(x){ return (i.barcode && x.barcode === i.barcode) || (i.sku && x.sku === i.sku); })[0];
    if (hard){ i.warn = '<b>صنف مكرر:</b> الباركود أو الرمز مستخدم للصنف «' + esc(hard.name) + '». لا يمكن إضافة صنف بالباركود نفسه.'; i.dupId = hard.id; itemModalRender(); return; }
    var soft = D.inventory.filter(function(x){ var a = norm(x.name), b = norm(i.name); return a.indexOf(b) > -1 || b.indexOf(a) > -1; })[0];
    if (soft && !i.force){ i.warn = '<b>صنف مشابه موجود:</b> «' + esc(soft.name) + '». تأكد أنه صنف مختلف قبل الإضافة.'; i.dupId = soft.id; i.force = true; itemModalRender(); return; }
    var n = {id:'I' + (D.inventory.length + 1), name:i.name, sku:i.sku, barcode:i.barcode, cat:i.cat, qty:Number(i.qty) || 0, buy:Number(i.buy), sell:Number(i.sell), sup:i.sup, added:TODAY, min:Number(i.min) || 0, active:i.active};
    D.inventory.push(n);
    if (n.qty) D.moves.unshift({at:nowStamp(), item:n.id, type:'adjust', qty:n.qty, before:0, after:n.qty, ref:'OPEN-BAL', by:D.store.owner, note:'رصيد افتتاحي'});
    closeModal(); render(); toast('أُضيف الصنف «' + n.name + '»'); return;
  }
  var t = invItem(i.id); Object.assign(t, {name:i.name, sku:i.sku, barcode:i.barcode, cat:i.cat, buy:Number(i.buy), sell:Number(i.sell), sup:i.sup, min:Number(i.min), active:i.active});
  closeModal(); render(); toast('حُفظ الصنف');
};
ACT.adjustItem = function(el){
  var it = invItem(el.getAttribute('data-id'));
  S.adj = {id:it.id, val:it.qty, reason:''};
  openModal(modalHead('تعديل كمية «' + esc(it.name) + '»', 'الكمية الحالية: ' + it.qty) + '<form data-act="saveAdjust" novalidate><div class="modal-body">' + F({id:'adj-val', label:'الكمية الفعلية بعد الجرد', bind:'S.adj.val', type:'number', num:true, ltr:true, attrs:'min="0" autofocus'}) + F({id:'adj-reason', type:'select', label:'سبب التعديل', bind:'S.adj.reason', req:true, options:[['','اختر السبب'],['جرد دوري','جرد دوري'],['تالف','تالف'],['تصحيح خطأ إدخال','تصحيح خطأ إدخال'],['فقدان','فقدان']]}) + note('neutral', 'يتطلب صلاحية «تعديل الكميات». يُسجّل التعديل في سجل التدقيق باسمك مع الكمية قبل وبعد.', 'lock') + '<div class="err" id="adj-err"></div></div><div class="modal-foot"><button class="btn btn-primary" type="submit">تسجيل التعديل</button><button type="button" class="btn btn-ghost" data-act="closeModal">إلغاء</button></div></form>');
};
ACT.saveAdjust = function(){
  var a = S.adj, it = invItem(a.id);
  if (!a.reason){ var e = $('#adj-err'); if (e) e.textContent = 'اختر سبب التعديل'; return; }
  var v = Number(a.val); if (!(v >= 0)){ var e2 = $('#adj-err'); if (e2) e2.textContent = 'أدخل كمية صحيحة'; return; }
  var b = it.qty; it.qty = v;
  D.moves.unshift({at:nowStamp(), item:it.id, type:'adjust', qty:v - b, before:b, after:v, ref:rid('ADJ-', 4), by:D.store.owner, note:a.reason});
  closeModal(); render(); toast('سُجّل تعديل الكمية (' + b + ' ← ' + v + ')');
};

/* ===== AI assistant ===== */
function aiSample(){
  return {stage:'review', img:supplierDocImage(), name:'فاتورة الجزيرة J-88407.jpg', docId:'AI-DOC-032',
    header:{supplier:'شركة الجزيرة لقطع الغيار', supMatch:'S1', no:'J-88407', date:'2026-10-20', net:3064, vat:459.6, total:3523.6},
    rows:[
      {name:'فلتر زيت تويوتا أصلي', sku:'FLT-TY-01', barcode:'6281100450012', qty:24, cost:28, match:'I1', conf:'high', include:true, sell:''},
      {name:'زيت موبيل 1 ‎5W-30 (4 لتر)', sku:'OIL-MB-530', barcode:'', qty:12, cost:132, match:'I2', conf:'high', include:true, sell:''},
      {name:'فلتر هواء كامري 2020', sku:'FLT-CM-AIR', barcode:'', qty:10, cost:34, match:null, conf:'mid', include:true, sell:''},
      {name:'فلتر زيت تويوتا', sku:'', barcode:'', qty:6, cost:28, match:null, dup:'I1', res:null, conf:'mid', include:true, sell:''},
      {name:'شمعات احتراق NGK (طقم 4)', sku:'SPK-NGK-4', barcode:'', qty:'', cost:60, match:'I4', conf:'low', include:true, sell:'', note:'الكمية غير واضحة في الصورة'}
    ]};
}
function aiRowState(r){
  if (!r.include) return ['مستبعد', 'neutral', false];
  if (!(Number(r.qty) > 0)) return ['أدخل الكمية', 'bad', true];
  if (r.dup && !r.res) return ['مكرر محتمل: اختر الإجراء', 'warn', true];
  var target = r.match || (r.res === 'merge' ? r.dup : null);
  if (target) return ['سيُحدّث «' + invItem(target).name + '»: ' + invItem(target).qty + ' ← ' + (invItem(target).qty + Number(r.qty)), 'ok', false];
  if (!(Number(r.sell) > 0)) return ['صنف جديد: أدخل سعر البيع', 'warn', true];
  return ['سيُضاف كصنف جديد', 'info', false];
}
function aiSums(a){ var net = a.rows.filter(function(r){ return r.include; }).reduce(function(s, r){ return s + (Number(r.qty) || 0) * (Number(r.cost) || 0); }, 0); return {net:round2(net), diff:round2(a.header.net - net)}; }
function aiSumHtml(a){ var s = aiSums(a); return s.diff === 0 ? note('ok', 'مجموع البنود <b class="tnum">' + amt(s.net) + '</b> يطابق الإجمالي قبل الضريبة في المستند.') : note('warn', 'مجموع البنود <b class="tnum">' + amt(s.net) + '</b> لا يطابق الإجمالي في المستند <b class="tnum">' + amt(a.header.net) + '</b>. الفرق <b class="tnum">' + amt(Math.abs(s.diff)) + ' ر.س</b>. راجع الكميات والأسعار.'); }
M.ai = function(){
  var a = S.ai, cost = D.settings.aiCost, use = D.subs.aiUsage;
  var head = pageHead('المساعد الذكي', 'صوّر فاتورة المورد، وراجع الأصناف المستخرجة، ثم اعتمدها لتحديث المخزون.', a && a.stage !== 'start' ? '<button class="btn btn-ghost" data-act="aiReset">' + ic('x') + ' إنهاء</button>' : '');
  if (!a || a.stage === 'start'){
    return head + '<div class="grid-2" style="margin-bottom:20px"><section class="card stack"><h3>قراءة فاتورة مورد جديدة</h3><p class="muted small">يقرأ المساعد اسم المورد والتاريخ والرقم والأصناف والرموز والكميات والأسعار والضريبة والإجماليات. لا يُعدَّل المخزون قبل مراجعتك وتأكيدك.</p>'
      + '<div class="uploader"><label class="up-tile" style="width:150px;height:120px">' + ic('camera') + '<span>تصوير فاتورة مورد</span><input type="file" accept="image/*" capture="environment" data-onchange="aiFile"></label><label class="up-tile" style="width:150px;height:120px">' + ic('upload') + '<span>رفع صورة أو PDF</span><input type="file" accept="image/*,application/pdf" data-onchange="aiFile"></label><button type="button" class="up-tile" style="width:150px;height:120px" data-act="aiSampleDoc">' + ic('file') + '<span>تجربة بفاتورة نموذجية</span></button></div>'
      + '<p class="faint xs">نصيحة: صوّر الفاتورة كاملة على سطح مستوٍ وبإضاءة جيدة.</p></section>'
      + '<section class="card stack"><h3>التكلفة والحدود</h3><div class="sum-row"><span>تكلفة قراءة المستند</span><b>' + cost + ' نقطة</b></div><div class="sum-row"><span>رصيدك</span><b>' + num(balance()) + ' نقطة</b></div><div><div class="row-between small"><span class="muted">الاستخدام هذا الشهر</span><b class="tnum">' + use.month + ' / ' + use.limit + ' مستند</b></div><div class="meter" style="margin-top:6px"><span style="width:' + (use.month / use.limit * 100) + '%"></span></div></div>'
      + note('info', 'تُخصم النقاط بعد نجاح المعالجة فقط. لا خصم عند فشل تقني من النظام. ميزة اختيارية ولا تؤثر على إصدار الفواتير.') + '</section></div>'
      + '<h3 style="margin-bottom:10px">المستندات السابقة</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th>المستند</th><th>المورد</th><th>التاريخ</th><th class="num">الأصناف</th><th class="num">النقاط</th><th>الحالة</th><th></th></tr></thead><tbody>'
      + D.aiDocs.map(function(d){ return '<tr><td class="tnum">' + d.id + '</td><td>' + esc(d.supplier) + '</td><td class="tnum">' + fmtDT(d.at) + '</td><td class="num">' + d.items + '</td><td class="num">' + d.pts + '</td><td>' + st('ai', d.status) + '</td><td>' + (d.status === 'review' ? '<button class="btn btn-soft btn-sm" data-act="aiResume" data-id="' + d.id + '">متابعة المراجعة</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>';
  }
  if (a.stage === 'processing'){
    var steps = ['رفع المستند بأمان','قراءة النص من الصورة (OCR)','استخراج المورد والأصناف والأسعار','مطابقة الأصناف مع المخزون'];
    return head + '<div class="split"><div class="card stack" style="align-items:center;text-align:center;padding-block:40px">' + '<span class="list-ic tone-brand" style="width:64px;height:64px">' + ic('sparkles') + '</span><h2>جارٍ قراءة الفاتورة</h2><div class="stack-sm" style="text-align:start;min-width:260px">' + steps.map(function(s, i){ return '<div class="row small">' + (i < a.step ? '<span class="pos">' + ic('check') + '</span>' : i === a.step ? '<span style="color:var(--brand)">' + ic('clock') + '</span>' : '<span class="faint">' + ic('clock') + '</span>') + '<span class="' + (i > a.step ? 'faint' : '') + '">' + s + '</span></div>'; }).join('') + '</div></div><div class="card"><img src="' + a.img + '" alt="المستند المرفوع" style="width:100%;border-radius:10px;display:block"></div></div>';
  }
  if (a.stage === 'failed'){
    return head + '<div class="card" style="max-width:640px">' + empty('alert', 'تعذّرت قراءة المستند', 'حدث خطأ تقني في خدمة المعالجة. <b>لم تُخصم أي نقاط.</b> يمكنك المحاولة مرة أخرى أو تصوير المستند بإضاءة أفضل.', '<div class="row" style="justify-content:center"><button class="btn btn-primary" data-act="aiRetry">' + ic('refresh') + ' المحاولة مرة أخرى</button><button class="btn btn-outline" data-act="aiReset">إلغاء</button></div>') + '</div>';
  }
  if (a.stage === 'done'){
    return head + '<div class="card" style="max-width:680px">' + empty('check', 'حُدّث المخزون', 'أُضيفت ' + a.result.added + ' أصناف جديدة وحُدّثت ' + a.result.updated + ' أصناف، وسُجّلت حركات المخزون بمصدر «مساعد ذكي · ' + a.docId + '». خُصمت ' + D.settings.aiCost + ' نقطة.', '<div class="row" style="justify-content:center"><button class="btn btn-primary" data-act="aiToMoves">عرض حركات المخزون</button><button class="btn btn-outline" data-act="aiReset">قراءة مستند آخر</button></div>') + '</div>';
  }
  var blocking = a.rows.some(function(r){ return aiRowState(r)[2]; });
  var conf = function(c){ return c === 'high' ? pill('ثقة عالية', 'ok') : c === 'mid' ? pill('ثقة متوسطة', 'warn') : pill('ثقة منخفضة', 'bad'); };
  var h = a.header;
  return head + '<div class="row" style="margin-bottom:14px">' + pill('بانتظار مراجعتك', 'warn') + '<span class="muted small">لن يتغير المخزون حتى تضغط «اعتماد وتحديث المخزون».</span></div>'
    + '<div class="split" style="margin-bottom:16px"><div class="card stack"><h3>بيانات المستند</h3><div class="grid-2">'
    + '<div class="sum-row"><span>المورد</span><b>' + esc(h.supplier) + '</b></div><div class="sum-row"><span>مطابقة المورد</span>' + pill('مورد مسجّل', 'ok', 'check') + '</div>'
    + '<div class="sum-row"><span>رقم الفاتورة</span><b class="tnum">' + h.no + '</b></div><div class="sum-row"><span>التاريخ</span><b>' + fmtDate(h.date) + '</b></div>'
    + '<div class="sum-row"><span>الإجمالي قبل الضريبة</span><b>' + money(h.net) + '</b></div><div class="sum-row"><span>الضريبة 15%</span><b>' + money(h.vat) + '</b></div></div>'
    + '<div id="ai-sum">' + aiSumHtml(a) + '</div></div>'
    + '<button class="card" style="padding:10px;cursor:zoom-in" data-act="aiZoom" aria-label="تكبير صورة المستند"><img src="' + a.img + '" alt="صورة فاتورة المورد" style="width:100%;max-height:260px;object-fit:cover;object-position:top;border-radius:8px;display:block"></button></div>'
    + '<div class="tbl-wrap"><table class="tbl inv-lines"><thead><tr><th>تضمين</th><th>الصنف</th><th>الرمز / الباركود</th><th style="width:90px">الكمية</th><th style="width:110px">سعر الشراء</th><th style="width:110px">سعر البيع</th><th>الدقة</th><th>النتيجة</th></tr></thead><tbody>'
    + a.rows.map(function(r, i){ var s = aiRowState(r); var isNew = !r.match && r.res !== 'merge'; return '<tr' + (s[1] === 'bad' ? ' class="row-bad"' : '') + '><td><input type="checkbox" data-bind="S.ai.rows.' + i + '.include" data-rerender' + (r.include ? ' checked' : '') + ' aria-label="تضمين البند ' + (i + 1) + '" style="width:18px;height:18px;accent-color:var(--brand)"></td>'
      + '<td class="line-name"><input class="input input-sm" data-bind="S.ai.rows.' + i + '.name" value="' + esc(r.name) + '" aria-label="اسم الصنف">' + (r.note ? '<span class="sub negv">' + esc(r.note) + '</span>' : '') + '</td>'
      + '<td><input class="input input-sm ltr" data-bind="S.ai.rows.' + i + '.sku" value="' + esc(r.sku) + '" placeholder="—" aria-label="الرمز" style="min-width:110px"></td>'
      + '<td><input class="input input-sm tnum" type="number" min="0" data-bind="S.ai.rows.' + i + '.qty" data-num data-oninput="aiRecalc" data-rerender value="' + esc(r.qty) + '" aria-label="الكمية"></td>'
      + '<td><input class="input input-sm tnum" type="number" min="0" step="0.01" data-bind="S.ai.rows.' + i + '.cost" data-num data-oninput="aiRecalc" value="' + esc(r.cost) + '" aria-label="سعر الشراء"></td>'
      + '<td>' + (isNew ? '<input class="input input-sm tnum" type="number" min="0" step="0.01" data-bind="S.ai.rows.' + i + '.sell" data-num data-rerender value="' + esc(r.sell) + '" placeholder="مطلوب" aria-label="سعر البيع">' : '<span class="faint small">' + amt(invItem(r.match || r.dup).sell) + '</span>') + '</td>'
      + '<td>' + conf(r.conf) + '</td><td>' + pill(s[0], s[1])
      + (r.dup && r.include ? '<div class="row" style="margin-top:6px"><button type="button" class="chip' + (r.res === 'merge' ? ' on' : '') + '" data-act="aiRes" data-i="' + i + '" data-v="merge">دمج مع «' + esc(invItem(r.dup).name) + '»</button><button type="button" class="chip' + (r.res === 'new' ? ' on' : '') + '" data-act="aiRes" data-i="' + i + '" data-v="new">صنف جديد</button></div>' : '') + '</td></tr>'; }).join('')
    + '</tbody></table></div>'
    + '<div class="form-actions" style="margin-top:16px"><button class="btn btn-primary btn-lg' + (blocking ? ' is-disabled' : '') + '" data-act="aiApprove">' + ic('check') + ' اعتماد وتحديث المخزون</button><button class="btn btn-outline btn-lg" data-act="aiBetter">' + ic('camera') + ' طلب صورة أوضح</button><button class="btn btn-ghost btn-lg" data-act="aiReset">إلغاء</button></div>'
    + (blocking ? '<p class="small negv" style="margin-top:8px">أكمل البنود المظللة أو استبعدها قبل الاعتماد. لا نُدخل بيانات تخمينية على أنها مؤكدة.</p>' : '');
};
INPUT.aiRecalc = function(){ var b = $('#ai-sum'); if (b) b.innerHTML = aiSumHtml(S.ai); };
INPUT.aiFile = function(el, urls, files){ S.ai = {stage:'start', img:urls[0], name:files[0].name, fail:false}; aiConfirm(); };
ACT.aiSampleDoc = function(){ S.ai = {stage:'start', img:supplierDocImage(), name:'فاتورة الجزيرة J-88407.jpg', fail:false}; aiConfirm(); };
function aiConfirm(){
  var cost = D.settings.aiCost, bal = balance();
  openModal(modalHead('تأكيد قراءة المستند', esc(S.ai.name)) + '<div class="modal-body"><img src="' + S.ai.img + '" alt="" style="width:100%;max-height:220px;object-fit:cover;object-position:top;border-radius:10px">'
    + '<div class="sum-row"><span>تكلفة العملية</span><b>' + cost + ' نقطة</b></div><div class="sum-row"><span>رصيدك الحالي</span><b>' + num(bal) + ' نقطة</b></div><div class="sum-row total"><span>بعد النجاح</span><b>' + num(bal - cost) + ' نقطة</b></div>'
    + note('info', 'تُخصم النقاط بعد نجاح المعالجة فقط. إذا فشلت المعالجة بسبب خطأ تقني فلا يُخصم شيء.') + '<label class="check"><input type="checkbox" id="ai-fail" data-bind="S.ai.fail"' + (S.ai.fail ? ' checked' : '') + '><span>محاكاة فشل تقني (للتجربة)</span></label></div>'
    + '<div class="modal-foot"><button class="btn btn-primary" data-act="aiStart">' + ic('sparkles') + ' بدء القراءة</button><button class="btn btn-ghost" data-act="aiCancel">إلغاء</button></div>');
}
ACT.aiCancel = function(){ S.ai = null; closeModal(); render(); };
ACT.aiStart = function(){
  closeModal(); var fail = S.ai.fail; S.ai.stage = 'processing'; S.ai.step = 0; render();
  var t = setInterval(function(){
    if (!S.ai || S.ai.stage !== 'processing'){ clearInterval(t); return; }
    S.ai.step++;
    if (fail && S.ai.step === 2){ clearInterval(t); S.ai.stage = 'failed'; D.aiDocs.unshift({id:'AI-DOC-' + (33 + D.aiDocs.length), supplier:'—', at:nowStamp(), items:0, status:'failed', pts:0}); render(); return; }
    if (S.ai.step >= 4){ clearInterval(t); var img = S.ai.img; S.ai = aiSample(); S.ai.img = img; render(); toast('اكتملت القراءة. راجع النتائج قبل الاعتماد', 'info'); return; }
    if (S.m.screen === 'ai') render();
  }, 650);
};
ACT.aiRetry = function(){ S.ai = {stage:'start', img:supplierDocImage(), name:'فاتورة الجزيرة J-88407.jpg', fail:false}; aiConfirm(); };
ACT.aiReset = function(){ S.ai = null; render(); };
ACT.aiResume = function(el){ S.ai = aiSample(); S.ai.docId = el.getAttribute('data-id'); render(); };
ACT.aiRes = function(el){ var r = S.ai.rows[Number(el.getAttribute('data-i'))]; r.res = el.getAttribute('data-v'); render(); };
ACT.aiZoom = function(){ openModal(modalHead('صورة المستند') + '<div class="modal-body"><img src="' + S.ai.img + '" alt="صورة فاتورة المورد" style="width:100%;border-radius:10px"></div>', {wide:true}); };
ACT.aiBetter = function(){ openModal(modalHead('طلب صورة أوضح') + '<div class="modal-body"><p>يُحفظ المستند الحالي بحالة «بانتظار المراجعة» دون خصم نقاط، ويمكنك تصويره مرة أخرى.</p><ul style="margin:0;padding-inline-start:20px" class="muted small"><li>ضع الفاتورة على سطح مستوٍ</li><li>تأكد من ظهور كل الأعمدة والإجماليات</li><li>تجنّب الظلال والانعكاس</li></ul></div><div class="modal-foot"><button class="btn btn-primary" data-act="aiReset">حسناً</button></div>'); };
ACT.aiToMoves = function(){ S.ai = null; S.tab.inv = 'moves'; go('inventory'); };
ACT.aiApprove = function(){
  var a = S.ai, added = 0, updated = 0, at = nowStamp();
  if (a.rows.some(function(r){ return aiRowState(r)[2]; })) return;
  a.rows.filter(function(r){ return r.include; }).forEach(function(r){
    var target = r.match || (r.res === 'merge' ? r.dup : null), it;
    if (target){ it = invItem(target); var b = it.qty; it.qty += Number(r.qty); it.buy = Number(r.cost); D.moves.unshift({at:at, item:it.id, type:'ai', qty:Number(r.qty), before:b, after:it.qty, ref:a.docId, by:D.store.owner, note:'مساعد ذكي · ' + a.header.no}); updated++; }
    else { it = {id:'I' + (D.inventory.length + 1), name:r.name, sku:r.sku, barcode:r.barcode, cat:'فلاتر', qty:Number(r.qty), buy:Number(r.cost), sell:Number(r.sell), sup:a.header.supMatch, added:TODAY, min:3, active:true}; D.inventory.push(it); D.moves.unshift({at:at, item:it.id, type:'ai', qty:it.qty, before:0, after:it.qty, ref:a.docId, by:D.store.owner, note:'صنف جديد من مستند المورد'}); added++; }
  });
  addLedger('used', -D.settings.aiCost, 'قراءة فاتورة مورد بالمساعد الذكي', a.docId);
  D.subs.aiUsage.month++;
  var ex = byId(D.aiDocs, a.docId);
  if (ex){ ex.status = 'approved'; ex.pts = D.settings.aiCost; ex.items = added + updated; } else D.aiDocs.unshift({id:a.docId, supplier:a.header.supplier, at:at, items:added + updated, status:'approved', pts:D.settings.aiCost});
  D.notifications.forEach(function(n){ if (n.kind === 'review') n.read = true; });
  a.stage = 'done'; a.result = {added:added, updated:updated}; render(); window.scrollTo(0, 0);
  toast('حُدّث المخزون من فاتورة المورد');
};
