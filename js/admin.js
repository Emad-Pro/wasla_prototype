/* ===== Wasla admin panel ===== */
const ANAV = [
  ['overview','نظرة عامة','grid'],
  ['merchants','التجار والطلبات','store'],
  ['moderation','مراجعة العروض والحملات','shield'],
  ['promoSettings','إعدادات الترويج','megaphone'],
  ['rewards','النقاط والمكافآت','coins'],
  ['fraud','الحالات المشبوهة','alert'],
  ['packages','الباقات والأسعار','wallet'],
  ['finance','المالية والتقارير','chart'],
  ['aiCost','تكلفة الذكاء الاصطناعي','sparkles'],
  ['ops','العمليات الفاشلة','refresh'],
  ['catalog','الأنشطة والخدمات','tag'],
  ['admins','المستخدمون والصلاحيات','lock'],
  ['audit','سجل التدقيق','list']
];
const APARENT = {merchant:'merchants'};
const ADMIN_USER = 'نورة السالم';
function modQueue(){
  var own = D.offers.filter(function(o){ return o.status === 'review'; }).map(function(o){ return Object.assign({own:true, merchant:D.store.name, submitted:o.submitted || nowStamp()}, o); });
  var ownC = D.campaigns.filter(function(c){ return c.status === 'review'; }).map(function(c){ return Object.assign({own:true, merchant:D.store.name, submitted:nowStamp()}, c); });
  return {offers:own.concat(D.admin.queue.offers), campaigns:ownC.concat(D.admin.queue.campaigns)};
}
function aBadge(k){
  if (k === 'merchants') return D.admin.merchants.filter(function(m){ return m.status === 'pending'; }).length;
  if (k === 'moderation'){ var q = modQueue(); return q.offers.length + q.campaigns.length; }
  if (k === 'fraud') return D.admin.fraud.filter(function(f){ return f.status === 'open'; }).length;
  if (k === 'ops') return D.admin.ops.filter(function(o){ return o.state !== 'resolved'; }).length;
  return 0;
}
function audit(action, target, detail){ D.admin.audit.unshift({at:nowStamp(), who:ADMIN_USER, action:action, target:target, detail:detail || '—'}); }
function renderAdmin(){
  var s = S.a.screen, cur = APARENT[s] || s, f = A[s] || A.overview;
  var nav = function(){ return ANAV.map(function(n){ var b = aBadge(n[0]); return '<button class="anav' + (cur === n[0] ? ' on' : '') + '" data-ago="' + n[0] + '"' + (cur === n[0] ? ' aria-current="page"' : '') + '>' + ic(n[2]) + '<span>' + n[1] + '</span>' + (b ? '<span class="badge">' + b + '</span>' : '') + '</button>'; }).join(''); };
  return '<div class="ashell"><aside class="aside" aria-label="أقسام لوحة الإدارة"><div class="admin-who"><span class="avatar">ن</span><div><b>' + ADMIN_USER + '</b><div style="color:var(--navy-dim)">مدير عام · لوحة إدارة وصلة</div></div></div>' + nav() + '</aside>'
    + '<div class="main"><nav class="amobile" aria-label="أقسام لوحة الإدارة">' + nav() + '</nav><main class="content">' + f() + '</main></div></div>';
}

/* overview */
A.overview = function(){
  var fin = D.admin.finance, q = modQueue(), pend = D.admin.merchants.filter(function(m){ return m.status === 'pending'; });
  var rev = fin.revenue[5], cost = fin.costs[5];
  return pageHead('نظرة عامة', 'ما يحتاج قراراً اليوم، ثم أداء المنصة هذا الشهر.')
    + '<div class="kpis">' + kpi('طلبات تسجيل جديدة', pend.length, 'بانتظار المراجعة', 'store') + kpi('محتوى بانتظار المراجعة', q.offers.length + q.campaigns.length, 'عروض وحملات', 'shield') + kpi('حالات مشبوهة', aBadge('fraud'), 'مكافآت معلّقة', 'alert') + kpi('عمليات تحتاج متابعة', aBadge('ops'), 'دفع، ربط، معالجة', 'refresh') + '</div>'
    + '<div class="grid-2" style="margin-bottom:16px"><section class="card"><div class="card-head"><h3>طلبات التجار</h3><button class="btn btn-ghost btn-sm" data-ago="merchants">الكل ' + ic('chevL') + '</button></div><div class="list">' + (pend.length ? pend.map(function(m){ return '<div class="list-row click" role="button" tabindex="0" data-ago="merchant" data-id="' + m.id + '"><span class="list-ic tone-warn">' + ic('store') + '</span><div class="grow"><b class="small">' + esc(m.name) + '</b><div class="faint xs">' + esc(m.city) + ' · ' + esc(m.activity) + ' · ' + fmtDate(m.at) + '</div></div><span class="btn btn-soft btn-sm">مراجعة</span></div>'; }).join('') : '<p class="muted small">لا توجد طلبات معلقة.</p>') + '</div></section>'
    + '<section class="card"><div class="card-head"><h3>المحتوى بانتظار المراجعة</h3><button class="btn btn-ghost btn-sm" data-ago="moderation">فتح قائمة المراجعة ' + ic('chevL') + '</button></div><div class="list">' + q.offers.concat(q.campaigns).slice(0, 5).map(function(x){ return '<div class="list-row click" role="button" tabindex="0" data-ago="moderation"><span class="list-ic tone-info">' + ic(x.title ? 'tag' : 'megaphone') + '</span><div class="grow"><b class="small">' + esc(x.title || x.targetName) + '</b><div class="faint xs">' + esc(x.merchant) + ' · ' + (x.title ? 'عرض' : 'حملة ' + KIND[x.kind]) + '</div></div>' + ic('chevL') + '</div>'; }).join('') + '</div></section></div>'
    + '<div class="kpis">' + kpi('إيرادات أكتوبر', num(rev), 'ر.س: شحن نقاط واشتراكات', 'coins') + kpi('التكاليف', num(cost), 'ر.س: استضافة ورسائل وذكاء اصطناعي', 'archive') + kpi('هامش الربح', Math.round((rev - cost) / rev * 100) + '%', num(rev - cost) + ' ر.س', 'chart') + kpi('فواتير صادرة عبر المنصة', num(fin.platformInvoices), 'هذا الشهر', 'receipt') + kpi('مستندات موردين مقروءة', num(fin.aiDocs), 'بالمساعد الذكي', 'sparkles') + '</div>'
    + '<section class="card"><div class="card-head"><div><h3>الإيرادات مقابل التكاليف</h3><p>آخر 6 أشهر، بالريال</p></div><div class="legend"><span><i style="background:var(--brand)"></i>الإيرادات</span><span><i style="background:var(--line-2)"></i>التكاليف</span></div></div>' + bars2(fin.months.map(function(m, i){ return {l:m, a:fin.revenue[i], b:fin.costs[i]}; }), {h:170, fmt:function(v){ return (v / 1000).toFixed(1) + 'k'; }, label:'الإيرادات والتكاليف شهرياً'}) + '</section>';
};

/* merchants */
A.merchants = function(){
  var t = curTab('am', 'pending');
  var list = D.admin.merchants.filter(function(m){ return t === 'all' || m.status === t; });
  return pageHead('التجار والطلبات', 'مراجعة طلبات التسجيل واعتماد الحسابات أو رفضها أو إيقافها.')
    + tabs('am', [['pending','بانتظار المراجعة',null,D.admin.merchants.filter(function(m){ return m.status === 'pending'; }).length],['needs_info','يحتاج استكمال'],['approved','معتمدة'],['rejected','مرفوضة'],['suspended','موقوفة'],['all','الكل',null,D.admin.merchants.length]], 'pending')
    + '<div class="row" style="margin-bottom:12px">' + searchBox('am', '#am-list', 'ابحث باسم المحل أو صاحبه أو المدينة') + '</div>'
    + (list.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>المحل</th><th>صاحب الحساب</th><th>المدينة</th><th>النشاط</th><th>تاريخ الطلب</th><th>الحالة</th></tr></thead><tbody id="am-list">' + list.map(function(m){ return '<tr class="click" data-ago="merchant" data-id="' + m.id + '" data-q="' + esc(m.name + ' ' + m.owner + ' ' + m.city) + '"><td><b>' + esc(m.name) + '</b>' + (m.self ? '<span class="sub">المتجر المستخدم في تطبيق التاجر</span>' : m.fromReg ? '<span class="sub">طلب جديد من النموذج</span>' : '') + '</td><td>' + esc(m.owner) + '</td><td>' + esc(m.city) + '</td><td>' + esc(m.activity) + '</td><td class="tnum">' + fmtDate(m.at) + '</td><td>' + st('acct', m.status) + '</td></tr>'; }).join('') + '</tbody></table></div><div id="am-list-empty" hidden>' + empty('search', 'لا توجد نتائج', '') + '</div>' : empty('store', 'لا توجد حسابات بهذه الحالة', ''));
};
A.merchant = function(){
  var m = byId(D.admin.merchants, S.a.params.id) || D.admin.merchants[0];
  var st0 = m.self ? D.store : null;
  var checks = [['رقم الجوال موثّق برمز تحقق', true], ['البريد الإلكتروني موثّق', m.status !== 'pending'], ['السجل التجاري: ' + (m.cr ? 'صالح حتى مارس 2027 (تحقق آلي)' : 'لم يُدخل'), !!m.cr && m.id !== 'M5'], ['صورة واجهة المحل مرفقة', m.id !== 'M4'], ['الموقع على الخريطة داخل حدود المدينة', m.id !== 'M4'], ['لا يوجد حساب سابق بالرقم نفسه', true]];
  return pageHead(esc(m.name), esc(m.owner) + ' · ' + esc(m.city), '', ['merchants','التجار والطلبات'])
    + '<div class="row" style="margin-bottom:16px">' + st('acct', m.status) + (m.bonus ? pill('مُنحت مكافأة التسجيل (50 نقطة)', 'ok', 'coins') : pill('لم تُمنح مكافأة التسجيل بعد', 'neutral', 'coins')) + '</div>'
    + (m.note ? '<div style="margin-bottom:16px">' + note(m.status === 'needs_info' ? 'info' : 'bad', '<b>ملاحظة القرار:</b> ' + esc(m.note)) + '</div>' : '')
    + '<div class="split"><div class="stack"><section class="card"><h3 style="margin-bottom:10px">بيانات المنشأة</h3><dl class="kv"><dt>اسم المحل</dt><dd>' + esc(m.name) + '</dd><dt>صاحب الحساب</dt><dd>' + esc(m.owner) + '</dd><dt>الجوال</dt><dd class="tnum">' + m.phone + '</dd><dt>السجل التجاري</dt><dd class="tnum">' + (m.cr || '—') + '</dd><dt>النشاط</dt><dd>' + esc(m.activity) + '</dd><dt>المدينة</dt><dd>' + esc(m.city) + '</dd><dt>تاريخ الطلب</dt><dd>' + fmtDate(m.at) + '</dd></dl></section>'
    + '<section class="card"><h3 style="margin-bottom:10px">الموقع</h3>' + fakeMap({pin:st0 ? st0.pin : {x:44, y:52}, h:180}) + '</section>'
    + '<section class="card"><h3 style="margin-bottom:10px">التحقق الآلي</h3><div class="list">' + checks.map(function(c){ return '<div class="list-row small"><span class="' + (c[1] ? 'pos' : 'negv') + '">' + ic(c[1] ? 'check' : 'x') + '</span>' + c[0] + '</div>'; }).join('') + '</div></section></div>'
    + '<div class="stack split-aside"><section class="card stack"><h3>القرار</h3><p class="muted small">يصل القرار للتاجر كإشعار ورسالة نصية. كل قرار يُسجّل في سجل التدقيق.</p>'
    + (m.status !== 'approved' ? '<button class="btn btn-ok" data-act="aDecide" data-type="merchant" data-id="' + m.id + '" data-v="approved">' + ic('check') + ' اعتماد الحساب</button>' : '')
    + (m.status === 'pending' || m.status === 'needs_info' ? '<button class="btn btn-outline" data-act="aDecide" data-type="merchant" data-id="' + m.id + '" data-v="needs_info">' + ic('edit') + ' طلب استكمال بيانات</button><button class="btn btn-danger" data-act="aDecide" data-type="merchant" data-id="' + m.id + '" data-v="rejected">' + ic('x') + ' رفض الطلب</button>' : '')
    + (m.status === 'approved' ? '<button class="btn btn-danger" data-act="aDecide" data-type="merchant" data-id="' + m.id + '" data-v="suspended">' + ic('pause') + ' إيقاف الحساب</button>' : '')
    + '<p class="faint xs">تُمنح مكافأة التسجيل (' + D.settings.rewards.register + ' نقطة) عند أول اعتماد فقط، ولا تتكرر للحساب نفسه.</p></section>'
    + (m.self ? note('info', 'هذا هو المتجر المستخدم في «تطبيق التاجر». أي قرار هنا ينعكس على حالة الحساب هناك.') : '') + '</div></div>';
};

/* decisions (shared modal) */
const REASONS = {
  merchant:{rejected:['السجل التجاري منتهي أو غير مطابق','بيانات المنشأة غير صحيحة','النشاط غير مدعوم في وصلة'], needs_info:['صورة واجهة المحل غير واضحة','موقع المحل على الخريطة غير دقيق','رقم السجل التجاري مطلوب'], suspended:['بلاغات متكررة عن أسعار مضللة','محتوى مخالف لسياسة النشر','اشتباه في التلاعب بالمكافآت']},
  offer:{rejected:['الصورة تتضمن رقم تواصل خارجي','ادعاء خصم غير موثّق','السعر الأصلي غير منطقي','محتوى غير مسموح بنشره']},
  camp:{rejected:['المحتوى المرتبط مرفوض','الفيديو منخفض الجودة','محتوى غير مسموح بترويجه']}
};
ACT.aDecide = function(el){
  S.dec = {type:el.getAttribute('data-type'), id:el.getAttribute('data-id'), v:el.getAttribute('data-v'), reason:''};
  var d = S.dec, needReason = d.v !== 'approved', opts = needReason ? REASONS[d.type][d.v] : [];
  var titles = {approved:'تأكيد الاعتماد', rejected:'سبب الرفض', needs_info:'البيانات المطلوب استكمالها', suspended:'سبب الإيقاف'};
  openModal(modalHead(titles[d.v]) + '<form data-act="aConfirm" novalidate><div class="modal-body">'
    + (needReason ? '<div class="chips">' + opts.map(function(o){ return '<button type="button" class="chip" data-act="aReason" data-v="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div>' + F({id:'dec-reason', type:'textarea', label:'نص يظهر للتاجر', bind:'S.dec.reason', req:true, ph:'اكتب السبب بوضوح وما المطلوب لتصحيحه', attrs:'autofocus'})
      : '<p>' + (d.type === 'merchant' ? 'سيُفعّل الحساب ويظهر المحل للعملاء، وتُمنح مكافأة التسجيل إن لم تُمنح سابقاً.' : d.type === 'camp' ? 'تُعتمد الحملة وتبدأ في موعدها، وتتحول النقاط المحجوزة إلى خصم نهائي.' : 'يظهر العرض للعملاء فوراً.') + '</p>')
    + '<div class="err" id="dec-err"></div></div><div class="modal-foot"><button class="btn ' + (needReason ? 'btn-danger' : 'btn-ok') + '" type="submit">تأكيد</button><button type="button" class="btn btn-ghost" data-act="closeModal">إلغاء</button></div></form>');
};
ACT.aReason = function(el){ S.dec.reason = el.getAttribute('data-v'); var f = $('#dec-reason'); if (f){ f.value = S.dec.reason; f.focus(); } };
ACT.aConfirm = function(){
  var d = S.dec;
  if (d.v !== 'approved' && !String(d.reason).trim()){ $('#dec-err').textContent = 'اكتب السبب ليصل للتاجر'; return; }
  if (d.type === 'merchant'){
    var m = byId(D.admin.merchants, d.id); m.status = d.v; m.note = d.v === 'approved' ? '' : d.reason;
    var bonusMsg = '';
    if (d.v === 'approved' && !m.bonus){ m.bonus = true; bonusMsg = ' ومُنحت ' + D.settings.rewards.register + ' نقطة'; }
    if (m.self) D.store.status = d.v;
    audit({approved:'اعتماد تاجر', rejected:'رفض تاجر', needs_info:'طلب استكمال بيانات', suspended:'إيقاف تاجر'}[d.v], m.name, d.reason || (bonusMsg ? 'مكافأة التسجيل' : ''));
    closeModal(); render(); toast('حُفظ القرار: ' + ST.acct[d.v][0] + bonusMsg); return;
  }
  if (d.type === 'offer'){
    var o = byId(D.offers, d.id);
    if (o){ o.status = d.v === 'approved' ? 'active' : 'rejected'; o.reason = d.reason; D.notifications.unshift({id:rid('N'), kind:'offer', title:(d.v === 'approved' ? 'تم قبول عرضك «' : 'رُفض عرض «') + o.title + '»', at:'الآن', go:'offers', read:false}); }
    else D.admin.queue.offers = D.admin.queue.offers.filter(function(x){ return x.id !== d.id; });
    audit(d.v === 'approved' ? 'قبول عرض' : 'رفض عرض', d.id, d.reason);
    closeModal(); render(); toast(d.v === 'approved' ? 'قُبل العرض وأصبح ظاهراً للعملاء' : 'رُفض العرض وأُبلغ التاجر بالسبب'); return;
  }
  var c = byId(D.campaigns, d.id);
  if (c){
    var held = D.ledger.filter(function(x){ return x.ref === c.id && x.status === 'held'; })[0];
    if (held) held.status = 'done';
    if (d.v === 'approved'){ c.status = 'approved'; }
    else { c.status = 'rejected'; c.reason = d.reason; c.refunded = c.pts; addLedger('refunded', c.pts, 'استرجاع: رفض الحملة ' + c.id, c.id); }
    D.notifications.unshift({id:rid('N'), kind:'campaign', title:d.v === 'approved' ? 'قُبلت حملتك «' + c.targetName + '» وستبدأ في موعدها' : 'رُفضت حملتك «' + c.targetName + '» واستُرجعت ' + c.pts + ' نقطة', at:'الآن', go:'promo', read:false});
  } else D.admin.queue.campaigns = D.admin.queue.campaigns.filter(function(x){ return x.id !== d.id; });
  audit(d.v === 'approved' ? 'قبول حملة' : 'رفض حملة واسترجاع النقاط', d.id, d.reason);
  closeModal(); render(); toast(d.v === 'approved' ? 'قُبلت الحملة' : 'رُفضت الحملة واستُرجعت النقاط للتاجر');
};

/* moderation */
A.moderation = function(){
  var q = modQueue(), t = curTab('mod', 'offers');
  var list = t === 'offers' ? q.offers : q.campaigns;
  return pageHead('مراجعة العروض والحملات', 'لا يظهر أي إعلان للعامة قبل الموافقة. يُرسل سبب الرفض للتاجر.')
    + tabs('mod', [['offers','العروض',null,q.offers.length],['campaigns','الحملات الترويجية',null,q.campaigns.length]], 'offers')
    + (list.length ? '<div class="stack">' + list.map(function(x){
      if (t === 'offers') return '<article class="mod-card">' + thumb(x) + '<div class="stack-sm"><div class="row-between"><h3>' + esc(x.title) + '</h3>' + pill('بانتظار المراجعة', 'warn') + '</div><div class="faint xs">' + esc(x.merchant) + ' · أُرسل ' + fmtDT(x.submitted) + '</div><p class="small">' + esc(x.desc) + '</p><div class="price"><b class="tnum">' + amt(offerFinal(x)) + '</b><span class="muted small">ر.س</span><s class="tnum">' + amt(x.price) + '</s>' + pill('-' + offerPct(x) + '%', 'brand') + '</div><div class="item-meta"><span>' + ic('calendar') + fmtShort(x.start) + ' – ' + fmtDate(x.end) + '</span></div>' + (x.flag ? note('warn', esc(x.flag)) : '') + '<div class="row"><button class="btn btn-ok btn-sm" data-act="aDecide" data-type="offer" data-id="' + x.id + '" data-v="approved">' + ic('check') + ' قبول ونشر</button><button class="btn btn-danger btn-sm" data-act="aDecide" data-type="offer" data-id="' + x.id + '" data-v="rejected">' + ic('x') + ' رفض مع السبب</button></div></div></article>';
      return '<article class="mod-card"><div class="thumb ' + (x.kind === 'video' ? 'tone-sky' : 'tone-brand') + '">' + ic(x.kind === 'video' ? 'video' : 'image') + '</div><div class="stack-sm"><div class="row-between"><h3>' + esc(x.targetName) + '</h3>' + pill('بانتظار المراجعة', 'warn') + '</div><div class="faint xs">' + esc(x.merchant) + ' · ' + KIND[x.kind] + ' · ' + x.days + ' أيام · تبدأ ' + fmtDate(x.start) + '</div><div class="sum-row"><span>النقاط المحجوزة</span><b>' + x.pts + ' نقطة</b></div><p class="faint xs">عند الرفض تُسترجع النقاط كاملة للتاجر تلقائياً.</p><div class="row"><button class="btn btn-ok btn-sm" data-act="aDecide" data-type="camp" data-id="' + x.id + '" data-v="approved">' + ic('check') + ' قبول الحملة</button><button class="btn btn-danger btn-sm" data-act="aDecide" data-type="camp" data-id="' + x.id + '" data-v="rejected">' + ic('x') + ' رفض واسترجاع النقاط</button></div></div></article>';
    }).join('') + '</div>' : empty('check', 'لا يوجد محتوى بانتظار المراجعة', 'كل العروض والحملات المرسلة تمت مراجعتها.'));
};

/* promotion settings */
A.promoSettings = function(){
  var s = D.settings;
  return pageHead('إعدادات الترويج', 'تُطبّق التغييرات على تطبيق التاجر فوراً دون إصدار تحديث جديد.', '<button class="btn btn-primary" data-act="aSave" data-what="إعدادات الترويج">' + ic('check') + ' حفظ وتطبيق</button>')
    + '<div class="split"><div class="stack"><section class="card"><div class="card-head"><div><h3>تكاليف الترويج ومدد الحملات</h3><p>جرّب تعديل تكلفة ثم افتح «تطبيق التاجر › الترويج بالنقاط».</p></div><button class="btn btn-ghost btn-sm" data-act="aAddPrice">' + ic('plus') + ' إضافة مدة</button></div><div class="tbl-wrap"><table class="tbl tbl-compact"><thead><tr><th>نوع الترويج</th><th style="width:130px">المدة (أيام)</th><th style="width:140px">التكلفة (نقاط)</th><th></th></tr></thead><tbody>'
    + s.promoPricing.map(function(p, i){ return '<tr><td>' + ic(p.kind === 'video' ? 'video' : 'image') + ' ' + KIND[p.kind] + '</td><td><input class="input input-sm tnum" type="number" min="1" data-bind="D.settings.promoPricing.' + i + '.days" data-num value="' + p.days + '" aria-label="المدة"></td><td><input class="input input-sm tnum" type="number" min="1" data-bind="D.settings.promoPricing.' + i + '.pts" data-num value="' + p.pts + '" aria-label="التكلفة"></td><td><button class="icon-btn" data-act="rmImg" data-path="D.settings.promoPricing" data-i="' + i + '" aria-label="حذف">' + ic('trash') + '</button></td></tr>'; }).join('') + '</tbody></table></div></section>'
    + '<section class="card stack"><h3>سياسة استرجاع النقاط</h3>' + [['full_before_start','استرجاع كامل عند الرفض أو تعذّر التنفيذ قبل البدء'],['prorata','استرجاع نسبي للأيام المتبقية عند الإيقاف من الإدارة'],['none_after_start','لا استرجاع بعد بدء الحملة إلا بقرار إداري']].map(function(r){ return '<button type="button" class="opt' + (s.refund === r[0] ? ' sel' : '') + '" data-act="setv" data-path="D.settings.refund" data-v="' + r[0] + '"><span class="radio"></span><span class="opt-main"><b class="small">' + r[1] + '</b></span></button>'; }).join('') + '</section></div>'
    + '<div class="stack split-aside"><section class="card stack"><h3>أنواع الترويج</h3>' + SW({id:'pt-img', bind:'D.settings.promoTypes.image', label:'ترويج الصور والعروض', rerender:true}) + SW({id:'pt-vid', bind:'D.settings.promoTypes.video', label:'ترويج الفيديو', rerender:true}) + SW({id:'pt-rev', bind:'D.settings.promoReview', label:'مراجعة العروض والحملات قبل النشر'}) + '</section>'
    + '<section class="card stack"><h3>المحتوى المسموح بترويجه</h3>' + [['offers','العروض التجارية'],['products','صور المنتجات والخدمات'],['videos','مقاطع الفيديو القصيرة'],['external','روابط خارجية وأرقام تواصل داخل الإعلان']].map(function(c){ return CB({id:'ct-' + c[0], bind:'D.settings.content.' + c[0], label:c[1]}); }).join('') + '</section></div></div>';
};
ACT.aAddPrice = function(){ D.settings.promoPricing.push({id:rid('pp'), kind:'image', days:14, pts:25}); render(); };
ACT.aSave = function(el){ audit('تعديل ' + el.getAttribute('data-what'), 'إعدادات المنصة', 'حُفظ من لوحة الإدارة'); render(); toast('حُفظت ' + el.getAttribute('data-what') + ' وطُبّقت فوراً على تطبيق التاجر'); };

/* rewards */
A.rewards = function(){
  var r = D.settings.rewards;
  if (!S.adjBal) S.adjBal = {store:'M1', pts:'', reason:''};
  return pageHead('النقاط والمكافآت', 'قواعد منح النقاط عبر باركود المحل وحدودها. تُطبّق من الخادم دون تحديث التطبيق.', '<button class="btn btn-primary" data-act="aSave" data-what="قواعد المكافآت">' + ic('check') + ' حفظ وتطبيق</button>')
    + '<div class="grid-2"><section class="card"><h3 style="margin-bottom:6px">قيم المكافآت</h3>'
    + [['register','مكافأة اعتماد حساب التاجر (مرة واحدة)'],['signup','تسجيل عميل جديد مؤهل عبر رمز المحل'],['visit','زيارة مؤهلة']].map(function(x){ return '<div class="setting-row"><div class="grow"><b>' + x[1] + '</b></div><input class="input input-sm tnum" type="number" min="0" data-bind="D.settings.rewards.' + x[0] + '" data-num value="' + r[x[0]] + '" aria-label="' + x[1] + '"></div>'; }).join('')
    + '<div class="setting-row"><div class="grow"><b>مكافأة الهدف الشهري</b><small>عند الوصول إلى عدد عملاء جدد خلال الشهر</small></div>' + SW({id:'r-goal', bind:'D.settings.rewards.goalOn', rerender:true}) + '</div>'
    + (r.goalOn ? '<div class="setting-row"><div class="grow"><b>الهدف (عملاء جدد)</b></div><input class="input input-sm tnum" type="number" data-bind="D.settings.rewards.goalTarget" data-num value="' + r.goalTarget + '"></div><div class="setting-row"><div class="grow"><b>نقاط المكافأة</b></div><input class="input input-sm tnum" type="number" data-bind="D.settings.rewards.goalBonus" data-num value="' + r.goalBonus + '"></div>' : '') + '</section>'
    + '<section class="card"><h3 style="margin-bottom:6px">شروط الزيارة المؤهلة</h3>'
    + '<div class="setting-row"><div class="grow"><b>تواجد العميل قرب المحل</b><small>ضمن 150 متراً عبر الموقع، وبموافقة العميل</small></div>' + SW({id:'r-geo', bind:'D.settings.rewards.geo'}) + '</div>'
    + '<div class="setting-row"><div class="grow"><b>مهلة بين زيارتين للعميل نفسه</b><small>تمنع احتساب الزيارات المتكررة</small></div><input class="input input-sm tnum" type="number" data-bind="D.settings.rewards.gapHours" data-num value="' + r.gapHours + '" aria-label="ساعات"></div>'
    + '<div class="setting-row"><div class="grow"><b>رمز تحقق من شاشة التاجر</b><small>يمسح العميل رمزاً يتغير كل دقيقة عند الكاشير</small></div>' + SW({id:'r-otp', bind:'D.settings.rewards.otp'}) + '</div>'
    + '<div class="setting-row"><div class="grow"><b>الحد اليومي لكل متجر</b><small>عدد المكافآت</small></div><input class="input input-sm tnum" type="number" data-bind="D.settings.rewards.dailyCap" data-num value="' + r.dailyCap + '"></div>'
    + '<div class="setting-row"><div class="grow"><b>الحد الشهري لكل متجر</b><small>نقاط</small></div><input class="input input-sm tnum" type="number" data-bind="D.settings.rewards.monthlyCap" data-num value="' + r.monthlyCap + '"></div>'
    + '<div class="setting-row"><div class="grow"><b>صلاحية النقاط</b></div><select class="select input-sm" style="width:auto" data-bind="D.settings.rewards.expiry" aria-label="صلاحية النقاط">' + [['none','بدون انتهاء'],['6','6 أشهر'],['12','12 شهراً']].map(function(o){ return '<option value="' + o[0] + '"' + (r.expiry === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div></section></div>'
    + '<section class="card stack" style="margin-top:16px;max-width:760px"><div class="row-between"><h3>حركة تصحيحية لرصيد تاجر</h3>' + pill('صلاحية حساسة', 'bad', 'lock') + '</div><p class="muted small">لا يُعدَّل الرصيد مباشرة. تُضاف حركة تصحيحية بسبب واضح، وتظهر للتاجر في سجل حركاته، وتُسجّل في سجل التدقيق.</p>'
    + '<form class="form-grid" data-act="aAdjBal" novalidate>' + F({id:'ab-store', type:'select', label:'المتجر', bind:'S.adjBal.store', options:D.admin.merchants.filter(function(m){ return m.status === 'approved'; }).map(function(m){ return [m.id, m.name]; })}) + F({id:'ab-pts', label:'النقاط (+ للإضافة، - للخصم)', bind:'S.adjBal.pts', type:'number', num:true, ltr:true}) + F({id:'ab-reason', label:'السبب', bind:'S.adjBal.reason', cls:'full', req:true, ph:'مثال: تعويض عن حملة تعذّر عرضها بسبب خلل فني'}) + '<div class="full"><button class="btn btn-outline" type="submit">تسجيل الحركة التصحيحية</button></div></form></section>';
};
ACT.aAdjBal = function(){
  var a = S.adjBal, e = {};
  if (!Number(a.pts)) e['ab-pts'] = 'أدخل عدد النقاط';
  if (!String(a.reason).trim()) e['ab-reason'] = 'السبب إلزامي';
  S.err = e; if (Object.keys(e).length){ render(); return; }
  var m = byId(D.admin.merchants, a.store);
  if (m.self) addLedger('correction', Number(a.pts), 'حركة تصحيحية من الإدارة: ' + a.reason, 'ADM-' + rid('', 4));
  audit('حركة تصحيحية للنقاط', m.name, (a.pts > 0 ? '+' : '') + a.pts + ' نقطة. السبب: ' + a.reason);
  S.adjBal = null; render(); toast('سُجّلت الحركة التصحيحية' + (m.self ? ' وظهرت في محفظة التاجر' : ''));
};

/* fraud */
A.fraud = function(){
  var list = D.admin.fraud;
  return pageHead('الحالات المشبوهة', 'مكافآت أوقفها النظام تلقائياً لأنها خالفت قواعد منع التلاعب.')
    + '<div class="stack">' + list.map(function(f){ var sev = {high:['عالية','bad'], mid:['متوسطة','warn'], low:['منخفضة','info']}[f.sev]; return '<div class="card row" style="align-items:flex-start;gap:14px"><span class="list-ic tone-' + sev[1] + '">' + ic('alert') + '</span><div class="grow stack-sm"><div class="row-between"><b>' + esc(f.rule) + '</b>' + (f.status === 'open' ? pill('خطورة ' + sev[0], sev[1]) : pill(f.status === 'confirmed' ? 'أُكدت المكافآت' : f.status === 'reversed' ? 'رُفضت المكافآت' : 'أُوقفت مكافآت المتجر', 'neutral')) + '</div><div class="faint xs">' + esc(f.store) + ' · ' + f.pts + ' نقطة معلّقة · ' + fmtDT(f.at) + '</div>'
      + (f.status === 'open' ? '<div class="row"><button class="btn btn-outline btn-sm" data-act="aFraud" data-id="' + f.id + '" data-v="confirmed">' + ic('check') + ' تأكيد المكافآت</button><button class="btn btn-danger btn-sm" data-act="aFraud" data-id="' + f.id + '" data-v="reversed">رفض المكافآت</button><button class="btn btn-ghost btn-sm" data-act="aFraud" data-id="' + f.id + '" data-v="blocked">' + ic('pause') + ' إيقاف مكافآت المتجر</button></div>' : '') + '</div></div>'; }).join('') + '</div>'
    + '<div style="margin-top:16px">' + note('neutral', 'الضوابط المفعّلة: تحقق الحسابات الجديدة برقم الجوال، منع احتساب التسجيل مرتين، حدود يومية وشهرية، مهلة بين الزيارات، التحقق من الأحداث في الخادم، ورصد الأنماط غير الطبيعية.', 'shield') + '</div>';
};
ACT.aFraud = function(el){
  var f = byId(D.admin.fraud, el.getAttribute('data-id')), v = el.getAttribute('data-v'); f.status = v;
  if (f.store === D.store.name && v === 'confirmed'){ addLedger('earned', f.pts, 'زيارة مؤهلة (أُكدت بعد المراجعة)', f.id); D.qr.pending = Math.max(0, D.qr.pending - 1); D.qr.earned += f.pts; D.qrEvents.forEach(function(e){ if (e.reward === 'pending' && e.ev === 'visit') e.reward = 'earned'; }); }
  if (f.store === D.store.name && v === 'reversed'){ D.qr.pending = Math.max(0, D.qr.pending - 1); D.qrEvents.forEach(function(e){ if (e.reward === 'pending' && e.ev === 'visit') e.reward = 'rejected'; }); }
  audit({confirmed:'تأكيد مكافآت معلّقة', reversed:'رفض مكافآت معلّقة', blocked:'إيقاف مكافآت متجر'}[v], f.store, f.rule);
  render(); toast('حُفظ القرار وسُجّل في سجل التدقيق');
};

/* packages & plans */
A.packages = function(){
  var s = D.settings;
  return pageHead('الباقات والأسعار', 'باقات النقاط واشتراكات الفواتير منفصلة تماماً. الأسعار هنا توضيحية.', '<button class="btn btn-primary" data-act="aSave" data-what="الباقات والأسعار">' + ic('check') + ' حفظ وتطبيق</button>')
    + '<section class="card" style="margin-bottom:16px"><div class="card-head"><div><h3>باقات شحن النقاط</h3><p>تظهر للتاجر في «النقاط والمحفظة».</p></div><button class="btn btn-ghost btn-sm" data-act="aAddPkg">' + ic('plus') + ' باقة جديدة</button></div><div class="tbl-wrap"><table class="tbl tbl-compact"><thead><tr><th>النقاط</th><th>السعر (ر.س)</th><th class="num">سعر النقطة</th><th>وسم</th><th>مفعّلة</th></tr></thead><tbody>'
    + s.packages.map(function(p, i){ return '<tr><td><input class="input input-sm tnum" type="number" data-bind="D.settings.packages.' + i + '.pts" data-num value="' + p.pts + '" aria-label="النقاط"></td><td><input class="input input-sm tnum" type="number" step="0.01" data-bind="D.settings.packages.' + i + '.price" data-num value="' + p.price + '" aria-label="السعر"></td><td class="num">' + amt(p.price / p.pts) + '</td><td><input class="input input-sm" data-bind="D.settings.packages.' + i + '.tag" value="' + esc(p.tag) + '" aria-label="وسم"></td><td><input type="checkbox" style="width:18px;height:18px;accent-color:var(--brand)" data-bind="D.settings.packages.' + i + '.on"' + (p.on ? ' checked' : '') + ' aria-label="مفعّلة"></td></tr>'; }).join('') + '</tbody></table></div>'
    + '<div class="setting-row"><div class="grow"><b>النقاط المجانية للحساب المؤهل</b><small>تُمنح مرة واحدة عند الاعتماد</small></div><input class="input input-sm tnum" type="number" data-bind="D.settings.rewards.register" data-num value="' + s.rewards.register + '"></div></section>'
    + '<section class="card" style="margin-bottom:16px"><h3 style="margin-bottom:10px">اشتراكات الفواتير الإلكترونية</h3><div class="tbl-wrap"><table class="tbl tbl-compact"><thead><tr><th>الباقة</th><th>السعر الشهري (ر.س)</th><th>حد الفواتير (0 = غير محدود)</th><th>المستخدمون</th></tr></thead><tbody>' + s.plans.map(function(p, i){ return '<tr><td><b>' + p.name + '</b></td><td><input class="input input-sm tnum" type="number" data-bind="D.settings.plans.' + i + '.price" data-num value="' + p.price + '"></td><td><input class="input input-sm tnum" type="number" data-bind="D.settings.plans.' + i + '.limit" data-num value="' + p.limit + '"></td><td><input class="input input-sm tnum" type="number" data-bind="D.settings.plans.' + i + '.users" data-num value="' + p.users + '"></td></tr>'; }).join('') + '</tbody></table></div>'
    + '<div class="setting-row"><div class="grow"><b>رسوم صفحة المحل</b><small>0 = مجانية. أي رسوم تُعلن للتجار مسبقاً.</small></div><input class="input input-sm tnum" type="number" data-bind="D.settings.storePageFee" data-num value="' + s.storePageFee + '"></div></section>'
    + '<section class="card"><h3 style="margin-bottom:10px">خدمات الذكاء الاصطناعي</h3><div class="setting-row"><div class="grow"><b>تكلفة قراءة مستند مورد</b><small>بالنقاط، تُخصم بعد النجاح فقط</small></div><input class="input input-sm tnum" type="number" data-bind="D.settings.aiCost" data-num value="' + s.aiCost + '"></div><div class="setting-row"><div class="grow"><b>الحد الشهري لكل متجر</b><small>يمنع التكاليف غير المتوقعة</small></div><input class="input input-sm tnum" type="number" data-bind="D.settings.aiMonthlyLimit" data-num value="' + s.aiMonthlyLimit + '"></div></section>';
};
ACT.aAddPkg = function(){ D.settings.packages.push({id:rid('pk'), pts:1000, price:379, on:false, tag:''}); render(); };

/* finance */
A.finance = function(){
  var f = D.admin.finance, rev = f.revenue[5], cost = f.costs[5];
  var costs = [['الاستضافة وقاعدة البيانات والتخزين', 4200], ['رسائل التحقق SMS', 2850], ['معالجة الذكاء الاصطناعي', 706], ['رسوم بوابة الدفع', 1124], ['ربط الفوترة والشهادات', 1600], ['الدعم والتشغيل', 3500]];
  var allCharges = D.charges.map(function(c){ return Object.assign({store:D.store.name}, c); }).concat([{ref:'PAY-4K7Z90', store:'ورشة الأمانة للسمكرة', pts:500, amount:199, method:'مدى', at:'2026-10-20T19:02', status:'success'}, {ref:'PAY-8H2K19', store:'مركز الإطارات الحديث', pts:100, amount:49, method:'Apple Pay', at:'2026-10-21T09:04', status:'success', note:'وصل إشعاره مرتين، وتجاهل الخادم التكرار'}]);
  return pageHead('المالية والتقارير', 'الإيرادات والتكاليف وهامش الربح، وعمليات الشحن والاشتراكات.')
    + '<div class="kpis">' + kpi('إيرادات شحن النقاط', num(f.points), 'ر.س هذا الشهر', 'coins') + kpi('إيرادات الاشتراكات', num(f.subs), 'ر.س هذا الشهر', 'calendar') + kpi('التكاليف', num(cost), 'ر.س هذا الشهر', 'archive') + kpi('صافي الهامش', num(rev - cost), Math.round((rev - cost) / rev * 100) + '% من الإيرادات', 'chart') + kpi('فواتير صادرة', num(f.platformInvoices), 'عبر كل المتاجر', 'receipt') + kpi('قراءات مستندات الموردين', num(f.aiDocs), 'بالمساعد الذكي', 'sparkles') + '</div>'
    + '<div class="grid-2" style="margin-bottom:16px"><section class="card"><div class="card-head"><h3>الإيرادات مقابل التكاليف</h3><div class="legend"><span><i style="background:var(--brand)"></i>الإيرادات</span><span><i style="background:var(--line-2)"></i>التكاليف</span></div></div>' + bars2(f.months.map(function(m, i){ return {l:m, a:f.revenue[i], b:f.costs[i]}; }), {h:160, fmt:function(v){ return (v / 1000).toFixed(1) + 'k'; }, label:'الإيرادات والتكاليف شهرياً'}) + '</section>'
    + '<section class="card"><h3 style="margin-bottom:12px">توزيع تكاليف أكتوبر</h3>' + costs.map(function(c){ return '<div class="hbar"><span>' + c[0] + '</span><div class="meter"><span style="width:' + Math.round(c[1] / 4200 * 100) + '%;background:var(--navy-2)"></span></div><b class="tnum">' + num(c[1]) + '</b></div>'; }).join('') + '<p class="metric-def">بالريال. أرقام توضيحية.</p></section></div>'
    + '<h3 style="margin-bottom:10px">آخر عمليات شحن النقاط</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th>الرقم المرجعي</th><th>المتجر</th><th>الباقة</th><th class="num">المبلغ</th><th>الوسيلة</th><th>التاريخ</th><th>الحالة</th></tr></thead><tbody>' + allCharges.map(function(c){ return '<tr><td class="tnum" dir="ltr" style="text-align:start">' + c.ref + '</td><td>' + esc(c.store) + '</td><td>' + num(c.pts) + ' نقطة</td><td class="num">' + money(c.amount) + '</td><td>' + c.method + '</td><td class="tnum">' + fmtDT(c.at) + '</td><td>' + st('charge', c.status) + (c.note ? '<span class="sub">' + esc(c.note) + '</span>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>';
};

/* AI cost */
A.aiCost = function(){
  if (!S.calc) S.calc = {cost:0.10, margin:50};
  var c = S.calc, price = c.margin < 100 ? Number(c.cost) / (1 - Number(c.margin) / 100) : 0;
  var pk = D.settings.packages.filter(function(p){ return p.on; }), ptVal = pk.reduce(function(a, p){ return a + p.price; }, 0) / pk.reduce(function(a, p){ return a + p.pts; }, 0);
  var cur = D.settings.aiCost * ptVal;
  return pageHead('تكلفة الذكاء الاصطناعي', 'قياس التكلفة الفعلية لكل عملية لتسعير النقاط بهامش ربح مدروس.')
    + '<div class="kpis">' + kpi('عمليات هذا الشهر', num(D.admin.finance.aiDocs), 'قراءة مستندات موردين', 'sparkles') + kpi('متوسط التكلفة الفعلية', '0.11', 'ر.س لكل مستند', 'coins') + kpi('سعر العملية للتاجر', D.settings.aiCost + ' نقطة', '≈ ' + amt(cur) + ' ر.س بمتوسط سعر النقطة', 'tag') + kpi('نسبة الفشل', '1.8%', 'لا تُخصم فيها نقاط', 'alert') + '</div>'
    + '<div class="grid-2"><section class="card"><h3 style="margin-bottom:12px">تفصيل تكلفة المستند الواحد</h3>' + [['المعالجة (نموذج الذكاء الاصطناعي)', .09], ['تخزين الصورة والنتائج', .01], ['خدمات خارجية وتشغيل', .01]].map(function(x){ return '<div class="sum-row"><span>' + x[0] + '</span><b>' + x[1].toFixed(2) + ' ر.س</b></div>'; }).join('') + '<div class="sum-row total"><span>الإجمالي</span><b>0.11 ر.س</b></div><p class="metric-def" style="margin-top:8px">تُحسب من سجلات الاستخدام الفعلية لكل عملية، لا من تقدير ثابت.</p></section>'
    + '<section class="card stack"><h3>حاسبة السعر</h3><p class="muted small">مثال الوثيقة: تكلفة 0.10 ر.س وهامش 50% تعطي سعراً نظرياً 0.20 ر.س قبل المصاريف الأخرى.</p><div class="form-grid">' + F({id:'calc-cost', label:'التكلفة الفعلية للعملية', bind:'S.calc.cost', type:'number', num:true, ltr:true, prefix:'ر.س', attrs:'step="0.01" min="0"', rerender:true}) + F({id:'calc-m', label:'هامش الربح المستهدف', bind:'S.calc.margin', type:'number', num:true, ltr:true, prefix:'%', attrs:'min="0" max="95"', rerender:true}) + '</div>'
    + '<div class="sum-row"><span>السعر النظري</span><b>' + amt(price) + ' ر.س</b></div><div class="sum-row"><span>متوسط سعر النقطة في الباقات</span><b>' + amt(ptVal) + ' ر.س</b></div><div class="sum-row total"><span>النقاط المقترحة للعملية</span><b>' + Math.max(1, Math.ceil(price / ptVal)) + ' نقطة</b></div><p class="faint xs">أرقام توضيحية وليست أسعاراً نهائية.</p></section></div>'
    + '<section class="card" style="margin-top:16px"><h3 style="margin-bottom:6px">حدود الاستخدام والتنبيهات</h3><div class="setting-row"><div class="grow"><b>الحد الشهري لكل متجر</b></div><input class="input input-sm tnum" type="number" data-bind="D.settings.aiMonthlyLimit" data-num value="' + D.settings.aiMonthlyLimit + '"></div><div class="setting-row"><div class="grow"><b>تنبيه عند تجاوز التكلفة اليومية للمنصة</b><small>بالريال</small></div><input class="input input-sm tnum" type="number" value="500" aria-label="الحد اليومي"></div><div class="setting-row"><div class="grow"><b>إيقاف الخدمة تلقائياً عند تجاوز الميزانية الشهرية</b></div>' + SW({id:'ai-stop', bind:'S.aiStop'}) + '</div></section>';
};

/* failed operations */
A.ops = function(){
  var lab = {payment:'الدفع', zatca:'منصة فاتورة', ai:'المساعد الذكي', sms:'رسائل التحقق'};
  var stLab = {resolved:['تمت المعالجة','ok'], retrying:['إعادة محاولة تلقائية','warn'], monitoring:['تحت المراقبة','info']};
  return pageHead('العمليات الفاشلة والأخطاء الفنية', 'ما فشل، وما فعله النظام تلقائياً، وما يحتاج تدخلاً.')
    + '<div class="stack">' + D.admin.ops.map(function(o){ return '<div class="card row" style="align-items:flex-start;gap:14px"><span class="list-ic tone-' + o.sev + '">' + ic(o.kind === 'payment' ? 'wallet' : o.kind === 'zatca' ? 'receipt' : o.kind === 'ai' ? 'sparkles' : 'message') + '</span><div class="grow stack-sm"><div class="row-between"><b>' + esc(o.title) + '</b>' + pill(stLab[o.state][0], stLab[o.state][1]) + '</div><p class="small muted">' + esc(o.detail) + '</p><div class="faint xs">' + lab[o.kind] + ' · ' + fmtDT(o.at) + '</div>' + (o.state !== 'resolved' ? '<div class="row"><button class="btn btn-outline btn-sm" data-act="aRetry" data-id="' + o.id + '">' + ic('refresh') + ' إعادة المحاولة الآن</button><button class="btn btn-ghost btn-sm" data-act="aResolve" data-id="' + o.id + '">تحديد كمعالجة</button></div>' : '') + '</div></div>'; }).join('') + '</div>';
};
ACT.aRetry = function(el){ var o = byId(D.admin.ops, el.getAttribute('data-id')); toast('جارٍ إعادة المحاولة…', 'info'); setTimeout(function(){ o.state = 'resolved'; o.detail += ' نجحت إعادة المحاولة اليدوية.'; if (o.kind === 'zatca') D.invoices.forEach(function(i){ if (i.status === 'queued') i.status = 'reported'; }); audit('إعادة محاولة عملية', o.title, 'نجحت'); render(); toast('نجحت العملية'); }, 1000); };
ACT.aResolve = function(el){ var o = byId(D.admin.ops, el.getAttribute('data-id')); o.state = 'resolved'; audit('إغلاق عملية فاشلة', o.title, 'يدوياً'); render(); };

/* catalog */
A.catalog = function(){
  if (S.newAct == null){ S.newAct = ''; S.newSvc = ''; }
  return pageHead('الأنشطة والخدمات', 'تظهر للتجار عند التسجيل وتعديل الملف، وللعملاء في التصنيفات، دون تحديث التطبيق.')
    + '<div class="grid-2"><section class="card stack"><h3>الأنشطة التجارية (' + ACTIVITIES.length + ')</h3><div class="chips">' + ACTIVITIES.map(function(a){ return pill(esc(a), 'neutral'); }).join('') + '</div><div class="row"><input class="input input-sm" style="max-width:260px" data-bind="S.newAct" value="' + esc(S.newAct) + '" placeholder="نشاط جديد" aria-label="نشاط جديد"><button class="btn btn-outline btn-sm" data-act="aAddAct">' + ic('plus') + ' إضافة</button></div></section>'
    + '<section class="card stack"><h3>الخدمات المعيارية (' + SERVICES.length + ')</h3><div class="chips">' + SERVICES.map(function(a){ return pill(esc(a), 'neutral'); }).join('') + '</div><div class="row"><input class="input input-sm" style="max-width:260px" data-bind="S.newSvc" value="' + esc(S.newSvc) + '" placeholder="خدمة جديدة" aria-label="خدمة جديدة"><button class="btn btn-outline btn-sm" data-act="aAddSvc">' + ic('plus') + ' إضافة</button></div></section></div>';
};
ACT.aAddAct = function(){ var v = String(S.newAct).trim(); if (!v) return; ACTIVITIES.push(v); audit('إضافة نشاط تجاري', v); S.newAct = ''; render(); toast('أُضيف النشاط ويظهر الآن في تسجيل التجار'); };
ACT.aAddSvc = function(){ var v = String(S.newSvc).trim(); if (!v) return; SERVICES.push(v); audit('إضافة خدمة معيارية', v); S.newSvc = ''; render(); toast('أُضيفت الخدمة'); };

/* admins & permissions */
A.admins = function(){
  var P = ['اعتماد التجار','مراجعة المحتوى','إعدادات النقاط والترويج','تعديل أرصدة النقاط','المالية والتقارير','إعدادات النظام'];
  return pageHead('المستخدمون والصلاحيات', 'لا يستطيع أي مستخدم غير مخوّل تغيير الأرصدة أو الإعدادات الحساسة.')
    + '<div class="tbl-wrap"><table class="tbl perm-grid"><thead><tr><th>المستخدم</th>' + P.map(function(p){ return '<th>' + p + '</th>'; }).join('') + '</tr></thead><tbody>' + D.admin.admins.map(function(a){ return '<tr><td><b>' + a.name + '</b><span class="sub">' + a.role + '</span></td>' + a.perms.map(function(v){ return '<td>' + (v ? '<span class="pos">' + ic('check') + '</span>' : '<span class="faint">—</span>') + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>'
    + '<div class="grid-2" style="margin-top:16px">' + note('warn', '<b>الصلاحيات الحساسة</b> (تعديل الأرصدة، إعدادات النقاط، المالية) تتطلب التحقق بخطوتين، وسبباً مكتوباً، وتُسجّل في سجل التدقيق.', 'lock') + note('neutral', 'مفاتيح الربط مع الهيئة وبوابة الدفع والذكاء الاصطناعي محفوظة في الخادم فقط، ولا تظهر في لوحة الإدارة أو التطبيق.', 'key') + '</div>';
};

/* audit */
A.audit = function(){
  return pageHead('سجل التدقيق', 'كل إجراء إداري مسجّل بالوقت والمستخدم والتفاصيل، ولا يمكن تعديله.')
    + '<div class="row" style="margin-bottom:12px">' + searchBox('audit', '#audit-list', 'ابحث بالإجراء أو المستخدم أو المتجر') + '</div>'
    + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الوقت</th><th>المستخدم</th><th>الإجراء</th><th>الهدف</th><th>التفاصيل</th></tr></thead><tbody id="audit-list">' + D.admin.audit.map(function(a){ return '<tr data-q="' + esc(a.who + ' ' + a.action + ' ' + a.target + ' ' + a.detail) + '"><td class="tnum">' + fmtDT(a.at) + '</td><td>' + esc(a.who) + '</td><td><b>' + esc(a.action) + '</b></td><td>' + esc(a.target) + '</td><td class="small">' + esc(a.detail) + '</td></tr>'; }).join('') + '</tbody></table></div><div id="audit-list-empty" hidden>' + empty('search', 'لا توجد نتائج', '') + '</div>';
};
