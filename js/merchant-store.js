/* ===== dashboard ===== */
const SECTIONS = [
  ['profile','الملف الشخصي للمحل','store','بيانات المحل وصوره وساعات العمل كما يراها العملاء'],
  ['products','المنتجات والخدمات','box','الأسعار والتوفر والأصناف المرتبطة بالمخزون'],
  ['offerNew','إضافة عرض جديد','plus','عرض بخصم أو سعر خاص يظهر بعد موافقة الإدارة'],
  ['promo','الإعلانات والترويج','megaphone','روّج لعروضك ومنتجاتك برصيد النقاط'],
  ['qr','باركود المحل','qr','رمز خاص لجذب العملاء وتتبّع المسح والزيارات'],
  ['wallet','النقاط والمحفظة','wallet','الرصيد والشحن وسجل الحركات'],
  ['invoices','الفواتير الإلكترونية','receipt','إصدار الفواتير وإرسالها وفق متطلبات الهيئة'],
  ['customers','العملاء','users','بيانات العملاء وسجل فواتير كل عميل'],
  ['inventory','المخزون','archive','الكميات والمشتريات وتنبيهات النقص'],
  ['ai','المساعد الذكي','sparkles','قراءة فواتير الموردين وإدخال الأصناف بسرعة'],
  ['inbox','الرسائل والإشعارات','bell','محادثات العملاء وتنبيهات النظام'],
  ['reports','التقارير','chart','الزيارات والعروض والمبيعات والباركود'],
  ['settings','الاشتراكات والإعدادات','settings','الاشتراكات والموظفون والأمان']
];
function secStat(k){
  switch (k){
    case 'products': return D.products.filter(function(p){ return !p.hidden; }).length + ' منتجاً وخدمة ظاهرة';
    case 'offerNew': return D.offers.filter(function(o){ return o.status === 'review'; }).length + ' بانتظار المراجعة';
    case 'promo': return D.campaigns.filter(function(c){ return c.status === 'active'; }).length + ' حملة نشطة';
    case 'qr': return num(D.qr.scans) + ' مسحاً هذا الشهر';
    case 'wallet': return num(balance()) + ' نقطة';
    case 'invoices': return D.invStats.month + ' فاتورة هذا الشهر';
    case 'customers': return D.customers.length + ' عملاء في السجل';
    case 'inventory': var l = lowStock().length; return l ? l + ' أصناف منخفضة' : 'الكميات جيدة';
    case 'ai': var r = D.aiDocs.filter(function(d){ return d.status === 'review'; }).length; return r ? r + ' مستند بانتظار مراجعتك' : 'لا مستندات معلقة';
    case 'inbox': return (unreadCount() + unreadMsgs()) + ' غير مقروء';
    default: return '';
  }
}
M.dashboard = function(){
  var stv = D.store, bal = balance();
  var ao = D.offers.filter(function(o){ return o.status === 'active'; }).length;
  var ac = D.campaigns.filter(function(c){ return c.status === 'active'; }).length;
  var low = lowStock(), queued = D.invoices.filter(function(i){ return i.status === 'queued'; }).length, aiRev = D.aiDocs.filter(function(d){ return d.status === 'review'; }).length;
  var plan = byId(D.settings.plans, D.subs.invoicing.plan);
  var alerts = [];
  if (low.length) alerts.push(['warn','archive','انخفاض المخزون', low.length + ' أصناف وصلت إلى الحد الأدنى أو نفدت: ' + low.map(function(i){ return i.name; }).slice(0, 2).join('، ') + (low.length > 2 ? '…' : ''), 'inventory']);
  if (aiRev) alerts.push(['info','sparkles','مراجعة مطلوبة', 'فاتورة مورد قرأها المساعد الذكي بانتظار تأكيدك قبل تحديث المخزون', 'ai']);
  if (queued) alerts.push(['warn','receipt','فاتورة بانتظار الإبلاغ للهيئة', queued + ' فاتورة لم تُبلَّغ بعد. يعيد النظام المحاولة تلقائياً.', 'invoiceLog']);
  alerts.push(['neutral','calendar','اشتراك الفواتير', plan.name + ' فعّال، ويتجدد في ' + fmtDate(D.subs.invoicing.renews), 'invoiceSub']);
  var days = ['8','9','10','11','12','13','14','15','16','17','18','19','20','21'];
  return pageHead('لوحة التاجر', 'مرحباً ' + esc(stv.owner.split(' ')[0]) + '، هذه نظرة سريعة على متجرك اليوم.')
    + '<section class="card store-hero"><div class="sh-id">' + storeLogo(stv, 'lg') + '<div class="stack-sm"><h2>' + esc(stv.name) + '</h2><div class="meta-line">' + ic('pin') + esc(stv.city + '، ' + stv.district) + '<span class="faint">·</span>' + ic('star') + stv.rating + ' (' + stv.reviews + ' تقييماً)</div><div class="chips">' + st('acct', stv.status) + pill('اشتراك الفواتير: فعّال', 'ok') + pill('صفحة المحل: مجانية', 'neutral') + '</div></div></div>'
    + '<div class="sh-actions"><button class="btn btn-outline" data-act="editProfile">' + ic('edit') + ' تعديل الملف الشخصي</button><button class="btn btn-ghost" data-act="viewAsCustomer">' + ic('eye') + ' كما يراه العميل</button></div></section>'
    + '<section class="kpis">'
    + kpi('رصيد النقاط', num(bal), 'نقطة متاحة للترويج', 'wallet', 'wallet')
    + kpi('زيارات صفحة المحل', num(stv.visits30), 'آخر 30 يوماً', 'eye', 'reports')
    + kpi('العملاء', num(stv.customers), 'عملاء تعاملوا مع المحل', 'users', 'customers')
    + kpi('العروض النشطة', ao, 'ظاهرة للعملاء الآن', 'tag', 'offers')
    + kpi('الحملات النشطة', ac, 'حملات ترويج جارية', 'megaphone', 'promo')
    + '</section>'
    + '<div class="qa" role="group" aria-label="إجراءات سريعة">'
    + '<button class="btn btn-primary" data-act="newInvoice">' + ic('receipt') + ' فاتورة جديدة</button>'
    + '<button class="btn btn-outline" data-act="newOffer">' + ic('tag') + ' إضافة عرض</button>'
    + '<button class="btn btn-outline" data-act="newPromo">' + ic('megaphone') + ' روّج الآن</button>'
    + '<button class="btn btn-outline" data-act="newProduct">' + ic('box') + ' إضافة منتج</button>'
    + '<button class="btn btn-outline" data-go="ai">' + ic('camera') + ' تصوير فاتورة مورد</button>'
    + '<button class="btn btn-outline" data-act="openCharge">' + ic('coins') + ' شحن النقاط</button>'
    + '</div>'
    + '<div class="grid-2" style="margin-bottom:20px">'
    + '<section class="card"><div class="card-head"><div><h3>تنبيهات تحتاج انتباهك</h3><p>مرتبة حسب الأهمية</p></div></div><div class="list">' + alerts.map(function(a){ return '<div class="list-row click" data-go="' + a[4] + '" role="button" tabindex="0"><span class="list-ic tone-' + a[0] + '">' + ic(a[1]) + '</span><div class="grow"><b class="small">' + a[2] + '</b><div class="muted small">' + a[3] + '</div></div>' + ic('chevL') + '</div>'; }).join('') + '</div></section>'
    + '<section class="card"><div class="card-head"><div><h3>زيارات صفحة المحل</h3><p>آخر 14 يوماً، أكتوبر 2026</p></div><button class="btn btn-ghost btn-sm" data-go="reports">التقارير ' + ic('chevL') + '</button></div>'
    + bars(D.visits14.map(function(v, i){ return {l:days[i], v:v}; }), {h:130, vals:'key', hlLast:true, label:'زيارات صفحة المحل يومياً'})
    + '<p class="metric-def" style="margin-top:10px">تُحتسب الزيارة عند فتح صفحة المحل من حساب أو جهاز مختلف، مرة واحدة لكل 24 ساعة. لا تعني الزيارة حضور العميل إلى المحل.</p></section>'
    + '</div>'
    + '<h3 style="margin-bottom:12px">أقسام إدارة المحل</h3>'
    + '<div class="sec-grid">' + SECTIONS.map(function(s){ var stt = secStat(s[0]); return '<button class="sec-card" ' + (s[0] === 'offerNew' ? 'data-act="newOffer"' : 'data-go="' + s[0] + '"') + '><span class="list-ic tone-brand">' + ic(s[2]) + '</span><span class="grow"><b>' + s[1] + '</b><small>' + s[3] + '</small>' + (stt ? '<span class="stat">' + stt + '</span>' : '') + '</span></button>'; }).join('') + '</div>';
};
ACT.viewAsCustomer = function(){ S.c.view = 'app'; setSurface('customer'); };
ACT.editProfile = function(){ S.tab.profile = 'edit'; go('profile'); };

/* ===== profile ===== */
function cloneStore(){ var c = JSON.parse(JSON.stringify(D.store)); c._newSvc = ''; return c; }
M.profile = function(){
  var t = curTab('profile', 'preview');
  if (t === 'edit' && !S.pf) S.pf = cloneStore();
  var head = pageHead('الملف الشخصي للمحل', 'هذه الصفحة هي واجهة محلك أمام العملاء داخل تطبيق وصلة.',
    t === 'preview' ? '<button class="btn btn-primary" data-act="tab" data-k="profile" data-v="edit">' + ic('edit') + ' تعديل الملف الشخصي</button>' : '');
  var tb = tabs('profile', [['preview','كما يراه العميل','eye'],['edit','تعديل البيانات','edit']], 'preview');
  if (t === 'preview'){
    return head + tb + '<div class="grid-2"><div class="phone" style="max-width:420px;justify-self:center">' + storePublic(D.store, {embedded:true}) + '</div>'
      + '<div class="stack"><section class="card"><h3 style="margin-bottom:10px">ملخص الظهور</h3><dl class="kv"><dt>حالة الملف</dt><dd>' + st('acct', D.store.status) + '</dd><dt>زيارات الصفحة</dt><dd class="tnum">' + num(D.store.visits30) + ' خلال 30 يوماً</dd><dt>التقييم</dt><dd>' + D.store.rating + ' من 5 (' + D.store.reviews + ' تقييماً)</dd><dt>العروض الظاهرة</dt><dd>' + D.offers.filter(function(o){ return o.status === 'active'; }).length + '</dd><dt>المنتجات والخدمات</dt><dd>' + D.products.filter(function(p){ return !p.hidden; }).length + ' ظاهرة</dd></dl></section>'
      + note('info', 'تعريف الزيارة: فتح صفحة المحل من حساب أو جهاز مختلف، مرة واحدة كل 24 ساعة. لا تُحتسب زياراتك أنت أو موظفيك.')
      + note('neutral', 'التقييمات ميزة اختيارية تفعّلها الإدارة. يستطيع التاجر الرد على التقييم، ولا يستطيع حذفه.', 'star') + '</div></div>';
  }
  return head + tb + '<form class="stack" data-act="saveProfile" novalidate>'
    + note('warn', 'تخضع تعديلات الاسم والصور والوصف لمراجعة الإدارة قبل ظهورها للعملاء. باقي البيانات تُحدَّث فوراً بعد الحفظ.')
    + storeFields('S.pf', {gallery:true, email:true})
    + '<div class="sticky-actions"><button class="btn btn-primary btn-lg" type="submit">' + ic('check') + ' حفظ التعديلات</button><button type="button" class="btn btn-ghost btn-lg" data-act="cancelProfile">إلغاء</button></div></form>';
};
ACT.saveProfile = function(){
  var e = validateStore(S.pf); S.err = e;
  if (Object.keys(e).length){ render(); var f = document.querySelector('.has-err'); if (f) f.scrollIntoView({block:'center'}); toast('راجع الحقول المظللة باللون الأحمر', 'bad'); return; }
  var reviewNeeded = S.pf.name !== D.store.name || S.pf.desc !== D.store.desc || S.pf.logo !== D.store.logo || (S.pf.gallery || []).length !== (D.store.gallery || []).length;
  var pf = S.pf; delete pf._newSvc; D.store = pf; S.pf = null; S.tab.profile = 'preview';
  render(); window.scrollTo(0, 0);
  toast(reviewNeeded ? 'حُفظت التعديلات. الاسم والصور والوصف الجديدة تظهر للعملاء بعد مراجعة الإدارة.' : 'حُفظت التعديلات وأصبحت ظاهرة للعملاء');
};
ACT.cancelProfile = function(){ S.pf = null; S.err = {}; S.tab.profile = 'preview'; render(); };

/* ===== products & services ===== */
M.products = function(){
  var f = curTab('pf', 'all');
  var list = D.products.filter(function(p){ return f === 'all' ? true : f === 'hidden' ? p.hidden : (p.type === f && !p.hidden); });
  var count = function(k){ return D.products.filter(function(p){ return k === 'all' ? true : k === 'hidden' ? p.hidden : (p.type === k && !p.hidden); }).length; };
  return pageHead('المنتجات والخدمات', 'ما يضيفه هنا يظهر للعملاء في صفحة المحل مع الأسعار وحالة التوفر.', '<button class="btn btn-primary" data-act="newProduct">' + ic('plus') + ' إضافة منتج أو خدمة</button>')
    + tabs('pf', [['all','الكل',null,count('all')],['product','المنتجات',null,count('product')],['service','الخدمات',null,count('service')],['hidden','المخفية',null,count('hidden')]], 'all')
    + '<div class="row-between" style="margin-bottom:14px">' + searchBox('prod', '#prod-list', 'ابحث بالاسم أو الرمز أو التصنيف') + '<span class="muted small">المنتج له كمية في المخزون، والخدمة لا تحتاج كمية.</span></div>'
    + (list.length ? '<div class="stack-sm" id="prod-list">' + list.map(prodRow).join('') + '</div><div id="prod-list-empty" hidden>' + empty('search', 'لا توجد نتائج مطابقة', 'جرّب كلمة أخرى أو امسح البحث.') + '</div>'
      : empty('box', 'لا توجد عناصر هنا', f === 'hidden' ? 'العناصر التي تخفيها تظهر هنا، وتبقى سجلاتها المالية محفوظة.' : 'أضف أول منتج أو خدمة ليظهر في صفحة المحل.', '<button class="btn btn-primary" data-act="newProduct">' + ic('plus') + ' إضافة منتج أو خدمة</button>'))
    + '<div style="margin-top:16px">' + note('neutral', 'لا يمكن حذف منتج أو خدمة وردت في فواتير سابقة، حتى تبقى السجلات المالية صحيحة. استخدم «إخفاء» عند عدم التوفر.', 'lock') + '</div>';
};
function prodRow(p){
  var inv = p.inv ? invItem(p.inv) : null, qty = inv ? inv.qty : null;
  var avail = p.type === 'product' ? (qty > 0) : p.avail;
  return '<div class="prod-row' + (p.hidden ? ' is-hidden' : '') + '" data-q="' + esc(p.name + ' ' + p.cat + ' ' + (inv ? inv.sku + ' ' + inv.barcode : '')) + '">' + thumb(p, 'thumb-sm')
    + '<div class="prod-main"><h3>' + esc(p.name) + '</h3><div class="chips">' + pill(p.type === 'product' ? 'منتج' : 'خدمة', p.type === 'product' ? 'info' : 'brand') + pill(esc(p.cat), 'neutral') + (p.hidden ? pill('مخفي عن العملاء', 'neutral', 'eyeOff') : avail ? pill('متوفر', 'ok') : pill('غير متوفر', 'bad')) + '</div>'
    + '<div class="item-meta">' + (inv ? '<span>' + ic('archive') + 'المتوفر: <b class="tnum">' + qty + '</b></span><span class="tnum">' + ic('hash') + inv.sku + '</span>' : '') + '</div></div>'
    + '<div class="price">' + (p.sale ? '<b class="tnum">' + amt(p.sale) + '</b><s class="tnum">' + amt(p.price) + '</s>' : '<b class="tnum">' + amt(p.price) + '</b>') + '<span class="muted small">ر.س</span></div>'
    + '<div class="row"><button class="btn btn-outline btn-sm" data-act="editProduct" data-id="' + p.id + '">' + ic('edit') + ' تعديل</button><button class="btn btn-ghost btn-sm" data-act="toggleHide" data-id="' + p.id + '">' + ic(p.hidden ? 'eye' : 'eyeOff') + (p.hidden ? ' إظهار' : ' إخفاء') + '</button></div></div>';
}
ACT.toggleHide = function(el){ var p = byId(D.products, el.getAttribute('data-id')); p.hidden = !p.hidden; render(); toast(p.hidden ? 'أُخفي «' + p.name + '» عن العملاء. سجلاته محفوظة.' : 'أصبح «' + p.name + '» ظاهراً للعملاء'); };
ACT.newProduct = function(){ S.prod = {id:null, type:'service', name:'', cat:'صيانة دورية', desc:'', imgs:[], price:'', sale:'', avail:true, qty:'', sku:'', barcode:''}; go('productForm'); };
ACT.editProduct = function(el){
  var p = byId(D.products, el.getAttribute('data-id')), inv = p.inv ? invItem(p.inv) : null;
  S.prod = {id:p.id, type:p.type, name:p.name, cat:p.cat, desc:p.desc, imgs:(p.imgs || []).slice(), price:p.price, sale:p.sale || '', avail:p.avail, qty:inv ? inv.qty : '', sku:inv ? inv.sku : '', barcode:inv ? inv.barcode : ''};
  go('productForm');
};
M.productForm = function(){
  if (!S.prod) ACT.newProduct();
  var p = S.prod, isP = p.type === 'product';
  return pageHead(p.id ? 'تعديل «' + esc(p.name) + '»' : 'إضافة منتج أو خدمة', 'يظهر في صفحة المحل بعد الحفظ.', '', ['products','المنتجات والخدمات'])
    + '<form class="stack" data-act="saveProduct" novalidate style="max-width:860px">'
    + '<div class="card stack"><span class="label">النوع</span><div class="seg" role="tablist">' + [['service','خدمة','wrench'],['product','منتج له مخزون','box']].map(function(x){ return '<button type="button" class="' + (p.type === x[0] ? 'on' : '') + '" data-act="setv" data-path="S.prod.type" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>'
    + '<div class="form-grid">'
    + F({id:'pr-name', label:'اسم ' + (isP ? 'المنتج' : 'الخدمة'), bind:'S.prod.name', req:true, cls:'full', ph:isP ? 'مثال: فلتر زيت تويوتا أصلي' : 'مثال: تغيير زيت مع فلتر'})
    + F({id:'pr-cat', type:'select', label:'التصنيف', bind:'S.prod.cat', options:PCATS, req:true})
    + '<div class="field"><span class="label">حالة التوفر</span>' + (isP ? '<p class="muted small" style="padding-top:10px">تُحسب تلقائياً من الكمية في المخزون</p>' : SW({id:'pr-avail', bind:'S.prod.avail', label:'متوفرة حالياً', rerender:true})) + '</div>'
    + F({id:'pr-desc', type:'textarea', label:'وصف مختصر', bind:'S.prod.desc', cls:'full', opt:true, ph:'ما الذي يشمله؟ ولأي سيارات يناسب؟'})
    + '</div></div>'
    + '<div class="card stack"><h3>السعر</h3><div class="form-grid">'
    + F({id:'pr-price', label:'السعر الأساسي', bind:'S.prod.price', type:'number', num:true, req:true, ltr:true, attrs:'min="0" step="0.01" inputmode="decimal"', prefix:'ر.س'})
    + F({id:'pr-sale', label:'السعر بعد الخصم', bind:'S.prod.sale', type:'number', num:true, ltr:true, opt:true, attrs:'min="0" step="0.01" inputmode="decimal"', prefix:'ر.س', hint:'اتركه فارغاً إذا لم يكن هناك خصم'})
    + '</div><p class="faint xs">الأسعار شاملة ضريبة القيمة المضافة كما تظهر للعميل.</p></div>'
    + (isP ? '<div class="card stack"><h3>بيانات المخزون</h3><div class="form-grid">'
      + F({id:'pr-qty', label:'الكمية المتوفرة', bind:'S.prod.qty', type:'number', num:true, req:true, ltr:true, attrs:'min="0" step="1"', hint:p.id ? 'تعديل الكمية هنا يُسجّل حركة «تسوية» في سجل المخزون' : 'يُنشأ صنف مرتبط في المخزون تلقائياً'})
      + F({id:'pr-sku', label:'رمز الصنف', bind:'S.prod.sku', ltr:true, opt:true, ph:'FLT-TY-01'})
      + F({id:'pr-barcode', label:'الباركود', bind:'S.prod.barcode', ltr:true, opt:true, ph:'6281100450012', cls:'full', attrs:'inputmode="numeric"'})
      + '</div></div>' : '')
    + '<div class="card stack"><h3>الصور</h3>' + uploader('S.prod.imgs', {max:5, title:p.name || 'منتج من ورشة النخبة'}) + '<small class="hint">الصورة الأولى تظهر كصورة رئيسية. حتى 5 صور.</small></div>'
    + '<div class="sticky-actions"><button class="btn btn-primary btn-lg" type="submit">' + ic('check') + ' حفظ</button><button type="button" class="btn btn-ghost btn-lg" data-go="products">إلغاء</button></div></form>';
};
ACT.saveProduct = function(){
  var p = S.prod, e = {};
  if (!String(p.name).trim()) e['pr-name'] = 'أدخل الاسم';
  if (!(Number(p.price) > 0)) e['pr-price'] = 'أدخل سعراً أكبر من صفر';
  if (p.sale !== '' && p.sale != null && !(Number(p.sale) > 0 && Number(p.sale) < Number(p.price))) e['pr-sale'] = 'السعر بعد الخصم يجب أن يكون أقل من السعر الأساسي';
  if (p.type === 'product' && (p.qty === '' || Number(p.qty) < 0)) e['pr-qty'] = 'أدخل الكمية المتوفرة';
  if (p.type === 'product' && p.barcode && D.inventory.some(function(i){ return i.barcode === p.barcode && (!p.id || byId(D.products, p.id).inv !== i.id); })) e['pr-barcode'] = 'هذا الباركود مستخدم لصنف آخر في المخزون';
  S.err = e; if (Object.keys(e).length){ render(); toast('راجع الحقول المظللة', 'bad'); return; }
  var target = p.id ? byId(D.products, p.id) : null;
  if (!target){ target = {id:'P' + (D.products.length + 1), hidden:false}; D.products.unshift(target); }
  Object.assign(target, {type:p.type, name:p.name, cat:p.cat, desc:p.desc, imgs:p.imgs, price:Number(p.price), sale:p.sale === '' ? null : Number(p.sale), avail:p.type === 'service' ? p.avail : Number(p.qty) > 0});
  if (p.type === 'product'){
    var inv = target.inv ? invItem(target.inv) : null;
    if (!inv){ inv = {id:'I' + (D.inventory.length + 1), name:p.name, sku:p.sku || '', barcode:p.barcode || '', cat:p.cat, qty:0, buy:0, sell:Number(p.price), sup:'', added:TODAY, min:3, active:true}; D.inventory.push(inv); target.inv = inv.id; }
    var before = inv.qty, q = Number(p.qty);
    if (q !== before) D.moves.unshift({at:nowStamp(), item:inv.id, type:'adjust', qty:q - before, before:before, after:q, ref:'PRD-EDIT', by:D.store.owner, note:'من شاشة المنتجات'});
    Object.assign(inv, {name:p.name, sku:p.sku, barcode:p.barcode, cat:p.cat, sell:Number(p.sale || p.price), qty:q});
  }
  S.prod = null; go('products'); toast('تم حفظ «' + target.name + '»');
};

/* ===== offers ===== */
M.offers = function(){
  var t = curTab('offers', 'active');
  var keys = [['active','النشطة'],['review','قيد المراجعة'],['rejected','المرفوضة'],['expired','المنتهية'],['paused','الموقوفة'],['draft','المسودات']];
  var list = D.offers.filter(function(o){ return o.status === t; });
  return pageHead('العروض', 'عروض بخصم أو بسعر خاص تظهر في صفحة المحل وقسم العروض للعملاء القريبين.', '<button class="btn btn-primary" data-act="newOffer">' + ic('plus') + ' إضافة عرض جديد</button>')
    + (D.settings.promoReview ? '<div style="margin-bottom:14px">' + note('info', 'تراجع إدارة وصلة العروض الجديدة قبل ظهورها للعامة، وعادةً خلال ساعات العمل نفسها.') + '</div>' : '')
    + tabs('offers', keys.map(function(k){ return [k[0], k[1], null, D.offers.filter(function(o){ return o.status === k[0]; }).length]; }), 'active')
    + (list.length ? '<div class="item-grid">' + list.map(offerCard).join('') + '</div>' : empty('tag', 'لا توجد عروض ' + keys.filter(function(k){ return k[0] === t; })[0][1], t === 'active' ? 'أنشئ عرضاً جديداً ليظهر للعملاء بعد الموافقة.' : '', t === 'active' || t === 'draft' ? '<button class="btn btn-primary" data-act="newOffer">' + ic('plus') + ' إضافة عرض جديد</button>' : ''));
};
function offerCard(o){
  var f = offerFinal(o), pct = offerPct(o);
  var left = o.end ? daysBetween(TODAY, o.end) : null;
  var acts = '';
  if (o.status === 'active') acts = '<button class="btn btn-soft btn-sm" data-act="newPromo" data-id="' + o.id + '">' + ic('megaphone') + ' روّج الآن</button><button class="btn btn-ghost btn-sm" data-act="offerStatus" data-id="' + o.id + '" data-v="paused">' + ic('pause') + ' إيقاف</button><button class="btn btn-ghost btn-sm" data-act="previewOffer" data-id="' + o.id + '">' + ic('eye') + ' معاينة</button>';
  else if (o.status === 'review') acts = '<button class="btn btn-ghost btn-sm" data-act="previewOffer" data-id="' + o.id + '">' + ic('eye') + ' معاينة</button><span class="muted xs" style="align-self:center">أُرسل ' + (o.submitted ? fmtDT(o.submitted) : 'اليوم') + '</span>';
  else if (o.status === 'rejected') acts = '<button class="btn btn-outline btn-sm" data-act="editOffer" data-id="' + o.id + '">' + ic('edit') + ' تعديل وإعادة الإرسال</button>';
  else if (o.status === 'expired') acts = '<button class="btn btn-outline btn-sm" data-act="repostOffer" data-id="' + o.id + '">' + ic('refresh') + ' إعادة النشر بتواريخ جديدة</button>';
  else if (o.status === 'paused') acts = '<button class="btn btn-outline btn-sm" data-act="offerStatus" data-id="' + o.id + '" data-v="active">' + ic('play') + ' استئناف</button><button class="btn btn-ghost btn-sm" data-act="editOffer" data-id="' + o.id + '">' + ic('edit') + ' تعديل</button>';
  else acts = '<button class="btn btn-outline btn-sm" data-act="editOffer" data-id="' + o.id + '">' + ic('edit') + ' إكمال العرض</button><button class="btn btn-ghost btn-sm" data-act="askDelDraft" data-id="' + o.id + '">' + ic('trash') + ' حذف المسودة</button>';
  return '<article class="item"><div class="item-media">' + thumb(o, 'thumb-wide') + st('offer', o.status) + (pct > 0 ? '<span class="off tnum">-' + pct + '%</span>' : '') + '</div>'
    + '<div class="item-body"><h3>' + esc(o.title) + '</h3><div class="price"><b class="tnum">' + amt(f) + '</b><span class="muted small">ر.س</span>' + (o.price ? '<s class="tnum">' + amt(o.price) + '</s>' : '') + '</div>'
    + '<div class="item-meta"><span>' + ic('tag') + esc(o.type) + '</span>' + (o.start ? '<span>' + ic('calendar') + fmtShort(o.start) + ' – ' + fmtDate(o.end) + '</span>' : '<span>' + ic('calendar') + 'لم تُحدد المدة</span>') + (o.times ? '<span>' + ic('clock') + o.times.from + '–' + o.times.to + '</span>' : '') + '</div>'
    + (o.status === 'active' && left != null ? '<div class="item-meta"><span>' + ic('eye') + num(o.views) + ' مشاهدة</span><span>' + num(o.clicks) + ' نقرة</span><span class="' + (left <= 7 ? 'negv' : '') + '">ينتهي خلال ' + left + ' يوماً</span></div>' : '')
    + (o.status === 'rejected' ? note('bad', '<b>سبب الرفض:</b> ' + esc(o.reason)) : '')
    + '</div><div class="item-foot">' + acts + '</div></article>';
}
ACT.offerStatus = function(el){ var o = byId(D.offers, el.getAttribute('data-id')), v = el.getAttribute('data-v'); o.status = v; S.tab.offers = v; render(); toast(v === 'paused' ? 'أُوقف العرض ولم يعد ظاهراً للعملاء' : 'استُؤنف العرض وأصبح ظاهراً للعملاء'); };
ACT.askDelDraft = function(el){ confirmModal('حذف المسودة؟', 'تُحذف مسودة العرض نهائياً. لا يؤثر ذلك على أي عرض منشور.', 'delDraft', {id:el.getAttribute('data-id')}, 'حذف المسودة', true); };
ACT.delDraft = function(el){ D.offers = D.offers.filter(function(o){ return o.id !== el.getAttribute('data-id'); }); closeModal(); render(); toast('حُذفت المسودة'); };
ACT.newOffer = function(){ S.of = {id:null, title:'', desc:'', type:'تغيير زيت وفلاتر', price:'', mode:'pct', pct:'', special:'', start:addDays(TODAY, 1), end:addDays(TODAY, 15), timesOn:false, tFrom:'08:00', tTo:'16:00', imgs:[]}; go('offerForm'); };
ACT.editOffer = function(el){ var o = byId(D.offers, el.getAttribute('data-id')); S.of = {id:o.id, title:o.title, desc:o.desc, type:o.type, price:o.price, mode:o.mode, pct:o.pct || '', special:o.special || '', start:o.start, end:o.end, timesOn:!!o.times, tFrom:o.times ? o.times.from : '08:00', tTo:o.times ? o.times.to : '16:00', imgs:(o.imgs || []).slice()}; go('offerForm'); };
ACT.repostOffer = function(el){ ACT.editOffer(el); S.of.id = null; S.of.start = addDays(TODAY, 1); S.of.end = addDays(TODAY, 15); render(); toast('نُسخ العرض المنتهي إلى عرض جديد بتواريخ جديدة', 'info'); };
M.offerForm = function(){
  if (!S.of) ACT.newOffer();
  var o = S.of, f = offerFinal(o), pct = offerPct(o);
  return pageHead(o.id ? 'تعديل العرض' : 'إضافة عرض جديد', 'أنشئ عرضاً واضحاً يجذب العملاء إلى متجرك.', '', ['offers','العروض'])
    + '<form class="split" data-act="publishOffer" novalidate><div class="stack">'
    + '<div class="card stack"><h3>بيانات العرض</h3>'
    + F({id:'of-title', label:'عنوان العرض', bind:'S.of.title', req:true, ph:'مثال: خصم 20% على تغيير الزيت والفلتر', attrs:'maxlength="70"', hint:'عنوان قصير وواضح، حتى 70 حرفاً'})
    + F({id:'of-desc', type:'textarea', label:'وصف تفصيلي', bind:'S.of.desc', req:true, ph:'ما الذي يشمله العرض؟ وما الشروط؟'})
    + F({id:'of-type', type:'select', label:'نوع الخدمة أو المنتج', bind:'S.of.type', options:D.store.services.concat(['إطارات وبطاريات','منتج من المتجر'])})
    + '</div>'
    + '<div class="card stack"><h3>السعر والخصم</h3>'
    + '<div class="seg">' + [['pct','نسبة خصم'],['fixed','سعر خاص']].map(function(x){ return '<button type="button" class="' + (o.mode === x[0] ? 'on' : '') + '" data-act="setv" data-path="S.of.mode" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>'
    + '<div class="form-grid">' + F({id:'of-price', label:'السعر الأصلي', bind:'S.of.price', type:'number', num:true, req:true, ltr:true, prefix:'ر.س', attrs:'min="0" step="0.01" inputmode="decimal"', oninput:'offerCalc'})
    + (o.mode === 'pct' ? F({id:'of-pct', label:'نسبة الخصم', bind:'S.of.pct', type:'number', num:true, req:true, ltr:true, prefix:'%', attrs:'min="1" max="90" step="1" inputmode="numeric"', oninput:'offerCalc'})
      : F({id:'of-special', label:'السعر الخاص', bind:'S.of.special', type:'number', num:true, req:true, ltr:true, prefix:'ر.س', attrs:'min="0" step="0.01" inputmode="decimal"', oninput:'offerCalc'}))
    + '</div><div class="note note-ok" id="of-calc">' + ic('tag') + '<span>' + offerCalcText(o) + '</span></div></div>'
    + '<div class="card stack"><h3>مدة العرض</h3><div class="form-grid">'
    + F({id:'of-start', label:'تاريخ البداية', bind:'S.of.start', type:'date', req:true, ltr:true})
    + F({id:'of-end', label:'تاريخ الانتهاء', bind:'S.of.end', type:'date', req:true, ltr:true})
    + '</div>' + SW({id:'of-times', bind:'S.of.timesOn', rerender:true, label:'تحديد أوقات معينة للاستفادة من العرض'})
    + (o.timesOn ? '<div class="form-grid">' + F({id:'of-tfrom', label:'من الساعة', bind:'S.of.tFrom', type:'time', ltr:true}) + F({id:'of-tto', label:'إلى الساعة', bind:'S.of.tTo', type:'time', ltr:true}) + '</div>' : '') + '</div>'
    + '<div class="card stack"><h3>صور الإعلان</h3>' + uploader('S.of.imgs', {max:6, title:o.title || 'عرض خاص'}) + '<small class="hint">صوّر إعلاناً جديداً أو ارفع من الجهاز. يمكنك إضافة حتى 6 صور وحذفها قبل النشر. لا تضع أرقام تواصل داخل الصورة.</small>' + (S.err['of-imgs'] ? '<small class="err">' + S.err['of-imgs'] + '</small>' : '') + '</div>'
    + '</div><div class="stack split-aside"><div class="card stack"><h3>ملخص قبل النشر</h3>'
    + '<div id="of-summary">' + offerSummary(o) + '</div>'
    + '<div class="stack-sm"><button class="btn btn-primary btn-block btn-lg" type="submit">' + ic('send') + ' نشر العرض</button><button type="button" class="btn btn-outline btn-block" data-act="previewDraftOffer">' + ic('eye') + ' معاينة العرض</button><button type="button" class="btn btn-ghost btn-block" data-act="saveOfferDraft">حفظ كمسودة</button><button type="button" class="btn btn-ghost btn-block" data-go="offers">إلغاء</button></div>'
    + '<p class="faint xs">بعد النشر يُرسل العرض لمراجعة الإدارة، ولا يظهر للعامة قبل الموافقة.</p></div></div></form>';
};
function offerCalcText(o){
  var p = Number(o.price) || 0, f = offerFinal(o);
  if (!p) return 'أدخل السعر الأصلي ليظهر السعر النهائي تلقائياً';
  if (o.mode === 'pct' && !(Number(o.pct) > 0)) return 'أدخل نسبة الخصم';
  if (o.mode === 'fixed' && !(Number(o.special) > 0)) return 'أدخل السعر الخاص';
  if (f >= p) return 'السعر بعد الخصم يجب أن يكون أقل من السعر الأصلي';
  return 'السعر النهائي للعميل: <b class="tnum">' + amt(f) + ' ر.س</b> بدلاً من <s class="tnum">' + amt(p) + '</s>، أي توفير <b class="tnum">' + amt(p - f) + ' ر.س</b> (' + offerPct(o) + '%)';
}
function offerSummary(o){
  var p = Number(o.price) || 0, f = offerFinal(o), d = o.start && o.end ? daysBetween(o.start, o.end) + 1 : 0;
  return '<div class="sum-row"><span>السعر الأصلي</span><b>' + amt(p) + ' ر.س</b></div><div class="sum-row"><span>الخصم</span><b>' + offerPct(o) + '%</b></div><div class="sum-row"><span>مدة العرض</span><b>' + (d > 0 ? d + ' يوماً' : '—') + '</b></div><div class="sum-row total"><span>السعر النهائي</span><b>' + (p ? amt(f) + ' ر.س' : '—') + '</b></div>';
}
INPUT.offerCalc = function(){ var c = $('#of-calc span'), s = $('#of-summary'); if (c) c.innerHTML = offerCalcText(S.of); if (s) s.innerHTML = offerSummary(S.of); };
function validateOffer(o, full){
  var e = {};
  if (!String(o.title).trim()) e['of-title'] = 'أدخل عنوان العرض';
  if (!full) return e;
  if (!String(o.desc).trim()) e['of-desc'] = 'أدخل وصفاً للعرض';
  if (!(Number(o.price) > 0)) e['of-price'] = 'أدخل السعر الأصلي';
  if (o.mode === 'pct' && !(Number(o.pct) >= 1 && Number(o.pct) <= 90)) e['of-pct'] = 'نسبة الخصم بين 1% و90%';
  if (o.mode === 'fixed' && !(Number(o.special) > 0 && Number(o.special) < Number(o.price))) e['of-special'] = 'السعر الخاص يجب أن يكون أقل من السعر الأصلي';
  if (!o.start) e['of-start'] = 'حدد تاريخ البداية';
  if (!o.end) e['of-end'] = 'حدد تاريخ الانتهاء';
  else if (o.start && o.end < o.start) e['of-end'] = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية';
  if (!o.imgs.length) e['of-imgs'] = 'أضف صورة واحدة على الأقل للإعلان';
  return e;
}
function storeOffer(status){
  var o = S.of, t = o.id ? byId(D.offers, o.id) : null;
  if (!t){ t = {id:'O' + (D.offers.length + 1 + Math.floor(Math.random() * 90)), views:0, clicks:0}; D.offers.unshift(t); }
  Object.assign(t, {title:o.title, desc:o.desc, type:o.type, price:Number(o.price) || 0, mode:o.mode, pct:o.mode === 'pct' ? Number(o.pct) : null, special:o.mode === 'fixed' ? Number(o.special) : null, start:o.start, end:o.end, times:o.timesOn ? {from:o.tFrom, to:o.tTo} : null, imgs:o.imgs, status:status, reason:null, submitted:nowStamp()});
  return t;
}
ACT.publishOffer = function(){
  var e = validateOffer(S.of, true); S.err = e;
  if (Object.keys(e).length){ render(); var f = document.querySelector('.has-err, .err:not(:empty)'); if (f) f.scrollIntoView({block:'center'}); toast('أكمل الحقول المطلوبة قبل النشر', 'bad'); return; }
  var t = storeOffer(D.settings.promoReview ? 'review' : 'active');
  S.of = null; S.tab.offers = t.status; go('offers');
  toast(t.status === 'review' ? 'أُرسل العرض للمراجعة، وسيظهر للعملاء بعد موافقة الإدارة' : 'نُشر العرض وأصبح ظاهراً للعملاء');
};
ACT.saveOfferDraft = function(){ var e = validateOffer(S.of, false); S.err = e; if (Object.keys(e).length){ render(); return; } storeOffer('draft'); S.of = null; S.tab.offers = 'draft'; go('offers'); toast('حُفظ العرض كمسودة'); };
function offerPreviewHtml(o){
  var f = offerFinal(o);
  return '<div class="phone" style="border-width:6px;border-radius:28px;max-width:360px;margin:0 auto"><div class="phone-bar">' + ic('chevR') + '<h3>تفاصيل العرض</h3>' + ic('share') + '</div>'
    + (o.imgs && o.imgs[0] ? '<img src="' + o.imgs[0] + '" alt="" style="width:100%;aspect-ratio:16/10;object-fit:cover;display:block">' : thumb(o, 'thumb-wide'))
    + '<div class="sp-body" style="padding-top:14px"><div class="row">' + storeLogo(D.store, 'sm') + '<div><b class="small">' + esc(D.store.name) + '</b><div class="faint xs">' + D.store.distance + ' · ' + esc(D.store.district) + '</div></div></div>'
    + '<h2>' + esc(o.title || 'عنوان العرض') + '</h2><div class="price"><b class="tnum">' + amt(f) + '</b><span class="muted small">ر.س</span><s class="tnum">' + amt(o.price) + '</s>' + pill('-' + offerPct(o) + '%', 'brand') + '</div>'
    + '<p class="muted small">' + esc(o.desc || '') + '</p><div class="item-meta"><span>' + ic('calendar') + 'حتى ' + fmtDate(o.end) + '</span>' + (o.timesOn || o.times ? '<span>' + ic('clock') + (o.tFrom || o.times.from) + '–' + (o.tTo || o.times.to) + '</span>' : '') + '</div>'
    + '<button class="btn btn-primary btn-block" type="button">احجز الآن</button></div></div>';
}
ACT.previewDraftOffer = function(){ openModal(modalHead('معاينة العرض', 'هكذا يظهر العرض للعميل داخل تطبيق وصلة') + '<div class="modal-body">' + offerPreviewHtml(S.of) + '</div><div class="modal-foot"><button class="btn btn-ghost" data-act="closeModal">رجوع للتعديل</button></div>'); };
ACT.previewOffer = function(el){ var o = byId(D.offers, el.getAttribute('data-id')); openModal(modalHead('معاينة العرض', 'كما يظهر للعميل') + '<div class="modal-body">' + offerPreviewHtml(o) + '</div><div class="modal-foot"><button class="btn btn-ghost" data-act="closeModal">إغلاق</button></div>'); };
