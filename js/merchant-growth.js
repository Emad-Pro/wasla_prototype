/* ===== promotion with points ===== */
function enabledPricing(){ return D.settings.promoPricing.filter(function(p){ return D.settings.promoTypes[p.kind]; }); }
M.promo = function(){
  var t = curTab('camps', 'all'), bal = balance();
  var keys = [['all','الكل'],['draft','مسودة'],['review','قيد المراجعة'],['approved','مقبولة'],['active','نشطة'],['rejected','مرفوضة'],['completed','مكتملة'],['paused','متوقفة']];
  var list = D.campaigns.filter(function(c){ return t === 'all' || c.status === t; });
  return pageHead('الترويج بالنقاط', 'روّج لصور منتجاتك وعروضك داخل وصلة باستخدام رصيد النقاط.', '<button class="btn btn-primary" data-act="newPromo">' + ic('megaphone') + ' روّج الآن</button>')
    + '<div class="grid-2" style="margin-bottom:20px">'
    + '<section class="card balance-card"><div><div class="muted small">رصيد النقاط المتاح</div><div class="balance-big tnum">' + num(bal) + '<small>نقطة</small></div><div class="muted small">الترويج منفصل عن اشتراك صفحة المحل واشتراك الفواتير.</div></div><div class="stack-sm"><button class="btn btn-primary" data-act="openCharge">' + ic('coins') + ' شحن النقاط</button><button class="btn btn-ghost" style="color:var(--navy-ink)" data-act="walletLedger">سجل الحركات</button></div></section>'
    + '<section class="card"><div class="card-head"><div><h3>تكلفة الترويج</h3><p>تُقرأ من إعدادات الخادم، وتعدّلها إدارة وصلة دون تحديث التطبيق.</p></div></div><div class="tbl-wrap"><table class="tbl tbl-compact"><thead><tr><th>نوع الترويج</th><th>المدة</th><th class="num">التكلفة</th></tr></thead><tbody>'
    + D.settings.promoPricing.map(function(p){ var on = D.settings.promoTypes[p.kind]; return '<tr' + (on ? '' : ' style="opacity:.5"') + '><td>' + ic(p.kind === 'video' ? 'video' : 'image') + ' ' + KIND[p.kind] + (on ? '' : ' ' + pill('غير مفعّل', 'neutral')) + '</td><td>' + p.days + ' أيام</td><td class="num"><b>' + p.pts + '</b> نقطة</td></tr>'; }).join('')
    + '</tbody></table></div></section></div>'
    + tabs('camps', keys.map(function(k){ return [k[0], k[1], null, k[0] === 'all' ? D.campaigns.length : D.campaigns.filter(function(c){ return c.status === k[0]; }).length]; }), 'all')
    + (list.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الحملة</th><th>النوع</th><th>الفترة</th><th class="num">النقاط</th><th class="num">الظهور</th><th class="num">النقرات</th><th>الحالة</th></tr></thead><tbody>'
      + list.map(function(c){ return '<tr class="click" data-go="campaign" data-id="' + c.id + '"><td><b>' + esc(c.targetName) + '</b><span class="sub">' + c.days + ' أيام</span></td><td>' + KIND[c.kind] + '</td><td class="tnum">' + (c.start ? fmtShort(c.start) + ' – ' + fmtShort(c.end) : '—') + '</td><td class="num">' + c.pts + '</td><td class="num">' + num(c.impressions) + '</td><td class="num">' + num(c.clicks) + '</td><td>' + st('camp', c.status) + '</td></tr>'; }).join('')
      + '</tbody></table></div>' : empty('megaphone', 'لا توجد حملات بهذه الحالة', '', '<button class="btn btn-primary" data-act="newPromo">روّج الآن</button>'))
    + '<div style="margin-top:16px">' + note('neutral', 'عند رفض الحملة أو تعذّر تنفيذها تُسترجع النقاط كاملة إلى رصيدك. شراء النقاط لا يجدد أي اشتراك.', 'refresh') + '</div>';
};
ACT.walletLedger = function(){ S.tab.wallet = 'ledger'; go('wallet'); };
ACT.newPromo = function(el){
  var id = el && el.getAttribute && el.getAttribute('data-id');
  S.pn = {step:id ? 2 : 1, target:id || null, kind:'image', price:null, start:addDays(TODAY, 1), video:null};
  go('promoNew');
};
function promoTargets(){
  var t = D.offers.filter(function(o){ return o.status === 'active'; }).map(function(o){ return {id:o.id, name:o.title, sub:'عرض نشط · ' + amt(offerFinal(o)) + ' ر.س', obj:o}; });
  return t.concat(D.products.filter(function(p){ return !p.hidden; }).map(function(p){ return {id:p.id, name:p.name, sub:(p.type === 'product' ? 'منتج' : 'خدمة') + ' · ' + amt(p.sale || p.price) + ' ر.س', obj:p}; }));
}
M.promoNew = function(){
  if (!S.pn) S.pn = {step:1, target:null, kind:'image', price:null, start:addDays(TODAY, 1)};
  var p = S.pn, bal = balance(), targets = promoTargets();
  var steps = ['اختيار المحتوى','المدة والتكلفة','التأكيد'];
  var stepper = '<div class="stepper" style="margin-bottom:20px">' + steps.map(function(x, i){ var n = i + 1, cls = n < p.step ? 'done' : n === p.step ? 'cur' : ''; return '<button type="button" class="step ' + cls + '"' + (n < p.step ? ' data-act="setv" data-path="S.pn.step" data-num data-v="' + n + '"' : ' disabled') + '><span class="step-n">' + (n < p.step ? ic('check') : n) + '</span>' + x + '</button>'; }).join('') + '</div>';
  var body = '';
  if (p.step === 1){
    body = '<div class="card stack"><h3>ما الذي تريد ترويجه؟</h3><div class="stack-sm" role="radiogroup">' + targets.map(function(x){ return '<button type="button" class="opt' + (p.target === x.id ? ' sel' : '') + '" role="radio" aria-checked="' + (p.target === x.id) + '" data-act="setv" data-path="S.pn.target" data-v="' + x.id + '"><span class="radio"></span>' + thumb(x.obj, 'thumb-sm') + '<span class="opt-main"><b>' + esc(x.name) + '</b><small>' + x.sub + '</small></span></button>'; }).join('')
      + (D.settings.promoTypes.video ? '<button type="button" class="opt' + (p.target === 'VID' ? ' sel' : '') + '" data-act="setv" data-path="S.pn.target" data-v="VID"><span class="radio"></span><span class="thumb thumb-sm tone-sky">' + ic('video') + '</span><span class="opt-main"><b>مقطع فيديو جديد</b><small>ارفع مقطعاً قصيراً حتى 30 ثانية</small></span></button>' : '') + '</div>'
      + '<div class="form-actions"><button class="btn btn-primary btn-lg' + (p.target ? '' : ' is-disabled') + '" data-act="promoStep2">التالي ' + ic('chevL') + '</button><button class="btn btn-ghost btn-lg" data-go="promo">إلغاء</button></div></div>';
  } else if (p.step === 2){
    var kinds = p.target === 'VID' ? ['video'] : ['image'];
    var opts = enabledPricing().filter(function(x){ return kinds.indexOf(x.kind) > -1; });
    if (!p.price && opts[0]) p.price = opts[0].id;
    body = '<div class="card stack"><h3>اختر مدة الحملة</h3><p class="muted small">المحتوى: <b>' + esc(promoTargetName(p)) + '</b></p><div class="grid-2">' + opts.map(function(x){ return '<button type="button" class="opt' + (p.price === x.id ? ' sel' : '') + '" data-act="setv" data-path="S.pn.price" data-v="' + x.id + '"><span class="radio"></span><span class="opt-main"><b>' + x.days + ' أيام</b><small>' + KIND[x.kind] + '</small></span><b class="tnum">' + x.pts + ' نقطة</b></button>'; }).join('') + '</div>'
      + F({id:'pn-start', label:'تاريخ بدء الحملة', bind:'S.pn.start', type:'date', ltr:true, hint:'تبدأ الحملة في هذا التاريخ بعد موافقة الإدارة، وتنتهي تلقائياً عند انتهاء المدة.'})
      + '<div class="form-actions"><button class="btn btn-primary btn-lg" data-act="setv" data-path="S.pn.step" data-num data-v="3">مراجعة التكلفة ' + ic('chevL') + '</button><button class="btn btn-outline btn-lg" data-act="setv" data-path="S.pn.step" data-num data-v="1">' + ic('chevR') + ' السابق</button></div></div>';
  } else {
    var pr = byId(D.settings.promoPricing, p.price) || enabledPricing()[0], cost = pr.pts, after = bal - cost, ok = after >= 0;
    body = '<div class="split"><div class="card stack"><h3>تأكيد الحملة</h3>'
      + '<div class="sum-row"><span>المحتوى</span><b>' + esc(promoTargetName(p)) + '</b></div><div class="sum-row"><span>نوع الترويج</span><b>' + KIND[pr.kind] + '</b></div><div class="sum-row"><span>المدة</span><b>' + pr.days + ' أيام: ' + fmtShort(p.start) + ' – ' + fmtDate(addDays(p.start, pr.days)) + '</b></div>'
      + '<div class="sum-row"><span>رصيدك الحالي</span><b>' + num(bal) + ' نقطة</b></div><div class="sum-row"><span>تكلفة الحملة</span><b class="negv">-' + cost + ' نقطة</b></div><div class="sum-row total"><span>الرصيد بعد التأكيد</span><b class="' + (ok ? '' : 'negv') + '">' + num(after) + ' نقطة</b></div>'
      + (ok ? note('info', 'تُحجز النقاط عند التأكيد وتُرسل الحملة لمراجعة الإدارة. إذا رُفضت تُسترجع كاملة.') : note('bad', 'رصيدك غير كافٍ لهذه الحملة. تحتاج ' + (cost - bal) + ' نقطة إضافية.'))
      + '<div class="form-actions">' + (ok ? '<button class="btn btn-primary btn-lg" data-act="confirmPromo">' + ic('check') + ' تأكيد الحملة</button>' : '<button class="btn btn-primary btn-lg" data-act="openCharge">' + ic('coins') + ' شحن النقاط</button>') + '<button class="btn btn-ghost btn-lg" data-act="savePromoDraft">حفظ كمسودة</button><button class="btn btn-outline btn-lg" data-act="setv" data-path="S.pn.step" data-num data-v="2">' + ic('chevR') + ' السابق</button></div></div>'
      + '<div class="card stack"><h3>ما الذي ستقيسه الحملة؟</h3><p class="metric-def"><b>الظهور:</b> عدد مرات عرض الإعلان على شاشات العملاء.</p><p class="metric-def"><b>النقرات:</b> ضغطات العملاء على الإعلان.</p><p class="metric-def"><b>زيارات صفحة المحل:</b> فتح صفحة المحل خلال 24 ساعة من النقر.</p><p class="metric-def">لا تقيس الحملة حضور العميل إلى المحل أو الشراء؛ هذه أحداث مستقلة تظهر في تقارير الباركود والفواتير.</p></div></div>';
  }
  return pageHead('روّج الآن', 'ثلاث خطوات: اختر المحتوى، حدّد المدة، ثم أكّد التكلفة.', '', ['promo','الترويج بالنقاط']) + stepper + body;
};
function promoTargetName(p){ if (p.target === 'VID') return 'مقطع فيديو جديد'; var o = byId(D.offers, p.target) || byId(D.products, p.target); return o ? (o.title || o.name) : '—'; }
ACT.promoStep2 = function(){ if (!S.pn.target) return; S.pn.step = 2; S.pn.price = null; render(); };
function makeCampaign(status){
  var p = S.pn, pr = byId(D.settings.promoPricing, p.price) || enabledPricing()[0];
  var c = {id:'C' + (D.campaigns.length + 1), target:p.target, targetName:promoTargetName(p), kind:pr.kind, days:pr.days, pts:pr.pts, status:status, start:status === 'draft' ? '' : p.start, end:status === 'draft' ? '' : addDays(p.start, pr.days), impressions:0, clicks:0, visits:0};
  D.campaigns.unshift(c);
  return c;
}
ACT.confirmPromo = function(){
  var c = makeCampaign(D.settings.promoReview ? 'review' : 'approved');
  addLedger('used', -c.pts, 'حجز نقاط لحملة «' + c.targetName + '» قيد المراجعة (تُسترجع عند الرفض)', c.id, 'held');
  S.pn = null; go('campaign', {id:c.id});
  toast('أُرسلت الحملة للمراجعة وحُجزت ' + c.pts + ' نقطة');
};
ACT.savePromoDraft = function(){ makeCampaign('draft'); S.pn = null; S.tab.camps = 'draft'; go('promo'); toast('حُفظت الحملة كمسودة دون خصم نقاط'); };
M.campaign = function(){
  var c = byId(D.campaigns, S.m.params.id) || D.campaigns[0];
  var flow = ['draft','review','approved','active','completed'];
  var idx = flow.indexOf(c.status);
  var tl = [['مسودة','أُنشئت الحملة'],['قيد المراجعة','بانتظار موافقة الإدارة'],['مقبولة','مجدولة للبدء في ' + (c.start ? fmtDate(c.start) : '—')],['نشطة','تظهر للعملاء الآن'],['مكتملة','انتهت تلقائياً في ' + (c.end ? fmtDate(c.end) : '—')]];
  var acts = '';
  if (c.status === 'active') acts = '<button class="btn btn-danger" data-act="askPauseCamp" data-id="' + c.id + '">' + ic('pause') + ' إيقاف الحملة</button>';
  if (c.status === 'draft') acts = '<button class="btn btn-primary" data-act="draftToPromo" data-id="' + c.id + '">' + ic('send') + ' إكمال وإرسال للمراجعة</button>';
  var ctr = c.impressions ? (c.clicks / c.impressions * 100).toFixed(1) : '0.0';
  return pageHead(esc(c.targetName), KIND[c.kind] + ' · ' + c.days + ' أيام · ' + c.pts + ' نقطة', acts, ['promo','الترويج بالنقاط'])
    + '<div class="row" style="margin-bottom:16px">' + st('camp', c.status) + (c.start ? '<span class="muted small">' + fmtDate(c.start) + ' – ' + fmtDate(c.end) + '</span>' : '') + '</div>'
    + (c.status === 'rejected' ? '<div style="margin-bottom:16px">' + note('bad', '<b>سبب الرفض:</b> ' + esc(c.reason) + (c.refunded ? '<br>استُرجعت <b>' + c.refunded + ' نقاط</b> إلى رصيدك.' : '')) + '</div>' : '')
    + (c.status === 'paused' ? '<div style="margin-bottom:16px">' + note('info', esc(c.note || 'أُوقفت الحملة.') + ' لا تُسترجع نقاط الأيام التي مضت.') + '</div>' : '')
    + '<div class="funnel" style="margin-bottom:20px">'
    + kpi('مرات الظهور', num(c.impressions), 'عرض الإعلان على شاشة عميل', 'eye')
    + kpi('النقرات', num(c.clicks), 'نسبة النقر ' + ctr + '%', 'chevL')
    + kpi('زيارات صفحة المحل', num(c.visits), 'خلال 24 ساعة من النقر', 'store')
    + kpi('النقاط المستهلكة', c.status === 'rejected' ? 0 : c.status === 'draft' ? 0 : c.pts, c.status === 'review' ? 'محجوزة حتى المراجعة' : 'من رصيد المحفظة', 'coins')
    + '</div>'
    + '<div class="grid-2"><section class="card"><h3 style="margin-bottom:12px">الظهور اليومي</h3>' + (c.daily ? bars(c.daily.map(function(v, i){ return {l:'يوم ' + (i + 1), v:v}; }), {h:130, tone:'sky', label:'الظهور اليومي للحملة'}) : '<p class="muted small">تظهر البيانات بعد بدء الحملة.</p>') + '<p class="metric-def" style="margin-top:10px">هذه الأرقام تقيس التفاعل مع الإعلان فقط. الحضور الفعلي للمحل والشراء أحداث مختلفة تظهر في تقارير الباركود والفواتير.</p></section>'
    + '<section class="card"><h3 style="margin-bottom:12px">مراحل الحملة</h3><div class="timeline">' + tl.map(function(x, i){ var cls = c.status === 'rejected' ? (i === 0 ? 'done' : i === 1 ? 'cur' : '') : c.status === 'paused' ? (i < 3 ? 'done' : i === 3 ? 'cur' : '') : (i < idx ? 'done' : i === idx ? 'cur' : ''); return '<div class="tl-item ' + cls + '"><span class="tl-dot">' + ic(cls === 'done' ? 'check' : cls === 'cur' ? 'clock' : 'chevL') + '</span><div><b>' + x[0] + '</b><small>' + x[1] + '</small></div></div>'; }).join('') + '</div></section></div>';
};
ACT.askPauseCamp = function(el){ confirmModal('إيقاف الحملة؟', 'يتوقف ظهور الإعلان فوراً. وفق سياسة الاسترجاع الحالية لا تُسترجع نقاط الأيام التي مضت.', 'pauseCamp', {id:el.getAttribute('data-id')}, 'إيقاف الحملة', true); };
ACT.pauseCamp = function(el){ var c = byId(D.campaigns, el.getAttribute('data-id')); c.status = 'paused'; c.note = 'أوقفها التاجر في ' + fmtDate(TODAY) + '.'; closeModal(); render(); toast('أُوقفت الحملة'); };
ACT.draftToPromo = function(el){ var c = byId(D.campaigns, el.getAttribute('data-id')); D.campaigns = D.campaigns.filter(function(x){ return x !== c; }); S.pn = {step:2, target:c.target, kind:c.kind, price:null, start:addDays(TODAY, 1)}; go('promoNew'); };

/* ===== wallet ===== */
M.wallet = function(){
  var p = walletParts(), bal = balance(), t = curTab('wallet', 'packages');
  var tiles = [['free','مجانية','coins',p.free],['purchased','مشتراة','wallet',p.purchased],['earned','مكتسبة من جذب العملاء','qr',p.earned],['used','مستخدمة','megaphone',p.used],['refunded','مستردة','refresh',p.refunded],['correction','حركات تصحيحية','edit',p.correction],['expired','منتهية الصلاحية','clock',p.expired]];
  var tabBody = '';
  if (t === 'packages'){
    var pk = D.settings.packages.filter(function(x){ return x.on; });
    tabBody = '<div class="grid-auto">'
      + '<div class="pkg"><span class="pill pill-ok ribbon">' + ic('check') + ' مُنحت</span><span class="muted small">للحساب المؤهل</span><b class="tnum">50</b><span>نقطة مجانية</span><small class="muted">تُمنح مرة واحدة عند اعتماد الحساب.</small></div>'
      + pk.map(function(x){ return '<button class="pkg" data-act="openCharge" data-id="' + x.id + '">' + (x.tag ? '<span class="pill pill-brand ribbon">' + x.tag + '</span>' : '') + '<span class="muted small">باقة</span><b class="tnum">' + num(x.pts) + '</b><span>نقطة</span><span class="strong tnum">' + amt(x.price) + ' ر.س</span><small class="muted tnum">' + amt(x.price / x.pts) + ' ر.س للنقطة</small><span class="btn btn-primary btn-sm" style="margin-top:8px">اشحن الآن</span></button>'; }).join('')
      + '</div><p class="faint xs" style="margin-top:10px">الأسعار توضيحية. تحددها إدارة وصلة من لوحة الإدارة، وتشمل ضريبة القيمة المضافة.</p>';
  } else if (t === 'charges'){
    tabBody = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الرقم المرجعي</th><th>الباقة</th><th class="num">المبلغ</th><th>وسيلة الدفع</th><th>التاريخ</th><th>الحالة</th></tr></thead><tbody>'
      + D.charges.map(function(c){ return '<tr><td class="tnum" dir="ltr" style="text-align:start">' + c.ref + '</td><td>' + num(c.pts) + ' نقطة</td><td class="num">' + money(c.amount) + '</td><td>' + c.method + '</td><td class="tnum">' + fmtDT(c.at) + '</td><td>' + st('charge', c.status) + (c.note ? '<span class="sub">' + esc(c.note) + '</span>' : '') + '</td></tr>'; }).join('')
      + '</tbody></table></div><p class="faint xs" style="margin-top:10px">لكل عملية رقم مرجعي فريد. إذا وصل إشعار الدفع نفسه أكثر من مرة يتجاهله الخادم، فلا تُضاف النقاط مرتين.</p>';
  } else {
    var run = 0;
    var rows = D.ledger.map(function(x){ run += x.pts; return {x:x, bal:run}; }).reverse();
    tabBody = '<div class="row" style="margin-bottom:10px">' + pill('سجل للقراءة فقط', 'neutral', 'lock') + '<span class="muted small">لا تُحذف أي حركة. يُصحَّح الخطأ بحركة تصحيحية جديدة.</span></div>'
      + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>رقم الحركة</th><th>النوع</th><th class="num">النقاط</th><th>السبب</th><th>التاريخ والوقت</th><th>العملية المرتبطة</th><th class="num">الرصيد الناتج</th><th>الحالة</th></tr></thead><tbody>'
      + rows.map(function(r){ var x = r.x, lab = {free:'إضافة مجانية', purchased:'شحن', earned:'مكافأة', used:'خصم', refunded:'استرجاع', correction:'تصحيح', expired:'انتهاء صلاحية'}[x.cat]; return '<tr' + (x.cat === 'correction' ? ' class="row-warn"' : '') + '><td class="tnum">' + x.id + '</td><td>' + lab + '</td><td class="num ' + (x.pts > 0 ? 'pos' : 'negv') + '">' + (x.pts > 0 ? '+' : '') + x.pts + '</td><td>' + esc(x.reason) + '</td><td class="tnum">' + fmtDT(x.at) + '</td><td class="tnum">' + x.ref + '</td><td class="num"><b>' + num(r.bal) + '</b></td><td>' + st('ledger', x.status) + '</td></tr>'; }).join('')
      + '</tbody></table></div>';
  }
  return pageHead('النقاط والمحفظة', 'تُستخدم النقاط في الترويج وخدمات المساعد الذكي. لا تُعد رصيداً نقدياً ولا يمكن سحبها.')
    + '<section class="card balance-card" style="margin-bottom:16px"><div><div class="muted small">إجمالي الرصيد</div><div class="balance-big tnum">' + num(bal) + '<small>نقطة</small></div><div class="muted small">منها ' + Math.abs(D.ledger.filter(function(x){ return x.status === 'held'; }).reduce(function(a, x){ return a + x.pts; }, 0)) + ' نقطة محجوزة لحملات قيد المراجعة</div></div><div class="row"><button class="btn btn-primary btn-lg" data-act="openCharge">' + ic('coins') + ' شحن النقاط</button><button class="btn btn-ghost" style="color:var(--navy-ink)" data-act="newPromo">' + ic('megaphone') + ' استخدمها في الترويج</button></div></section>'
    + '<div class="kpis">' + tiles.map(function(x){ return kpi(x[1], (x[3] > 0 ? '+' : '') + num(x[3]), x[0] === 'expired' ? 'صلاحية النقاط غير مفعّلة حالياً' : '', x[2]); }).join('') + '</div>'
    + tabs('wallet', [['packages','باقات الشحن'],['charges','عمليات الشحن',null,D.charges.length],['ledger','سجل حركة النقاط',null,D.ledger.length]], 'packages') + tabBody;
};

/* charge flow (modal) */
ACT.openCharge = function(el){
  var id = el && el.getAttribute && el.getAttribute('data-id');
  var first = D.settings.packages.filter(function(x){ return x.on; })[1] || D.settings.packages[0];
  S.ch = {step:'pick', pkg:id || first.id, method:'mada', ref:null, dup:false};
  chargeModal();
};
const PAY_METHODS = [['mada','مدى','بطاقة مدى البنكية'],['apple','Apple Pay','عبر جهاز Apple'],['card','بطاقة ائتمانية','فيزا أو ماستركارد'],['stc','STC Pay','محفظة STC Pay']];
function chargeModal(){
  var c = S.ch, pk = byId(D.settings.packages, c.pkg), m = PAY_METHODS.filter(function(x){ return x[0] === c.method; })[0], h = '';
  if (c.step === 'pick'){
    h = modalHead('شحن النقاط', 'الخطوة 1 من 3: اختر الباقة') + '<div class="modal-body"><div class="stack-sm">' + D.settings.packages.filter(function(x){ return x.on; }).map(function(x){ return '<button class="opt' + (c.pkg === x.id ? ' sel' : '') + '" data-act="chSet" data-k="pkg" data-v="' + x.id + '"><span class="radio"></span><span class="opt-main"><b>' + num(x.pts) + ' نقطة</b><small>' + (x.tag || amt(x.price / x.pts) + ' ر.س للنقطة') + '</small></span><b class="tnum">' + money(x.price) + '</b></button>'; }).join('') + '</div></div>'
      + '<div class="modal-foot"><button class="btn btn-primary" data-act="chGo" data-v="method">متابعة</button><button class="btn btn-ghost" data-act="closeModal">إلغاء</button></div>';
  } else if (c.step === 'method'){
    h = modalHead('وسيلة الدفع', 'الخطوة 2 من 3') + '<div class="modal-body"><div class="stack-sm">' + PAY_METHODS.map(function(x){ return '<button class="opt' + (c.method === x[0] ? ' sel' : '') + '" data-act="chSet" data-k="method" data-v="' + x[0] + '"><span class="radio"></span><span class="opt-main"><b>' + x[1] + '</b><small>' + x[2] + '</small></span></button>'; }).join('') + '</div>'
      + '<div class="card card-tight"><div class="sum-row"><span>الباقة</span><b>' + num(pk.pts) + ' نقطة</b></div><div class="sum-row total"><span>المبلغ شامل الضريبة</span><b>' + money(pk.price) + '</b></div></div><p class="faint xs">ستنتقل إلى بوابة الدفع المعتمدة. لا نحفظ بيانات بطاقتك.</p></div>'
      + '<div class="modal-foot"><button class="btn btn-primary" data-act="chGo" data-v="gateway">' + ic('lock') + ' المتابعة للدفع</button><button class="btn btn-ghost" data-act="chGo" data-v="pick">السابق</button></div>';
  } else if (c.step === 'gateway'){
    if (!c.ref) c.ref = rid('PAY-');
    h = modalHead('بوابة الدفع', 'محاكاة صفحة البوابة الخارجية') + '<div class="modal-body"><div class="card card-tight stack-sm" style="background:var(--surface)"><div class="row-between"><b>' + m[1] + '</b>' + pill('اتصال آمن', 'ok', 'lock') + '</div><div class="sum-row"><span>التاجر</span><b>وصلة</b></div><div class="sum-row"><span>الرقم المرجعي</span><b class="tnum" dir="ltr">' + c.ref + '</b></div><div class="sum-row total"><span>المبلغ</span><b>' + money(pk.price) + '</b></div></div>'
      + note('info', 'في النسخة الفعلية تظهر هنا صفحة البوابة (مثل Moyasar أو Tap). لا تُضاف النقاط إلا بعد تحقق الخادم من نتيجة الدفع.') + '</div>'
      + '<div class="modal-foot"><button class="btn btn-ok" data-act="chPay" data-v="success">' + ic('check') + ' محاكاة: دفع ناجح</button><button class="btn btn-danger" data-act="chPay" data-v="failed">محاكاة: دفع فاشل</button></div>';
  } else if (c.step === 'processing'){
    h = modalHead('جارٍ التحقق من الدفع') + '<div class="modal-body" style="align-items:center;text-align:center;padding-block:32px"><div class="list-ic tone-info" style="width:56px;height:56px">' + ic('refresh') + '</div><b>ننتظر تأكيد البوابة لدى الخادم</b><p class="muted small">الحالة الحالية: ' + st('charge', 'pending') + '</p></div>';
  } else if (c.step === 'success'){
    h = modalHead('تمت إضافة النقاط') + '<div class="modal-body" style="text-align:center;align-items:center"><div class="list-ic tone-ok" style="width:56px;height:56px">' + ic('check') + '</div><h2 class="tnum">+' + num(pk.pts) + ' نقطة</h2><p class="muted">رصيدك الآن <b class="tnum">' + num(balance()) + '</b> نقطة · الرقم المرجعي <span class="tnum" dir="ltr">' + c.ref + '</span></p>'
      + (c.dup ? note('ok', 'وصل إشعار الدفع نفسه مرة ثانية فتجاهله الخادم لأن الرقم المرجعي مسجّل مسبقاً. لم تُضف النقاط مرتين.', 'shield') : '<button class="btn btn-outline btn-sm" data-act="chDup">محاكاة: وصول إشعار الدفع مرتين</button>') + '</div>'
      + '<div class="modal-foot"><button class="btn btn-primary" data-act="chDone">تم</button></div>';
  } else {
    h = modalHead('لم تتم عملية الدفع') + '<div class="modal-body" style="text-align:center;align-items:center"><div class="list-ic tone-bad" style="width:56px;height:56px">' + ic('x') + '</div><p>رفض البنك العملية. <b>لم يُخصم أي مبلغ ولم تُضف نقاط.</b></p><p class="muted small">جرّب وسيلة دفع أخرى أو تواصل مع البنك.</p></div>'
      + '<div class="modal-foot"><button class="btn btn-primary" data-act="chGo" data-v="method">المحاولة مرة أخرى</button><button class="btn btn-ghost" data-act="chDone">إغلاق</button></div>';
  }
  openModal(h);
}
ACT.chSet = function(el){ S.ch[el.getAttribute('data-k')] = el.getAttribute('data-v'); chargeModal(); };
ACT.chGo = function(el){ S.ch.step = el.getAttribute('data-v'); if (S.ch.step === 'method') S.ch.ref = null; chargeModal(); };
ACT.chPay = function(el){
  var res = el.getAttribute('data-v'), c = S.ch, pk = byId(D.settings.packages, c.pkg), m = PAY_METHODS.filter(function(x){ return x[0] === c.method; })[0];
  var rec = {ref:c.ref, pts:pk.pts, amount:pk.price, method:m[1], at:nowStamp(), status:'pending'};
  D.charges.unshift(rec);
  c.step = 'processing'; chargeModal();
  setTimeout(function(){
    if (!S.ch || S.ch.ref !== rec.ref) return;
    if (res === 'success'){ rec.status = 'success'; addLedger('purchased', pk.pts, 'شحن باقة ' + pk.pts + ' نقطة', rec.ref); D.notifications.unshift({id:rid('N'), kind:'charge', title:'تم شحن ' + pk.pts + ' نقطة بنجاح', at:'الآن', go:'wallet', read:false}); }
    else { rec.status = 'failed'; rec.note = 'رفض البنك المُصدر العملية. لم يُخصم أي مبلغ.'; }
    S.ch.step = res; chargeModal(); render();
  }, 1300);
};
ACT.chDup = function(){ S.ch.dup = true; chargeModal(); };
ACT.chDone = function(){ closeModal(); S.ch = null; render(); };

/* ===== store QR ===== */
function storeLink(){ return 'https://wasla.sa/s/' + D.store.id; }
M.qr = function(){
  var q = D.qr, r = D.settings.rewards;
  var evLab = {scan:['مسح الرمز','scan'], signup:['تسجيل عميل جديد','user'], visit:['زيارة مؤهلة','pin'], purchase:['شراء مؤكد','receipt']};
  return pageHead('باركود المحل', 'رمز QR خاص بمحلك يفتح صفحتك في وصلة، ويساعدك على جذب العملاء وكسب نقاط.')
    + '<div class="grid-2" style="margin-bottom:20px"><section class="card qr-card"><div class="qr-box"><div data-qr="' + storeLink() + '" data-size="180"></div></div>'
    + '<div class="stack-sm grow" style="min-width:220px"><h3>' + esc(D.store.name) + '</h3><p class="muted small">يفتح الرمز صفحة المحل في التطبيق، أو صفحة ويب مناسبة إذا لم يكن التطبيق مثبتاً.</p><div class="row"><span class="tnum small" dir="ltr" style="user-select:all">' + storeLink() + '</span><span class="faint xs">(رابط توضيحي)</span></div>'
    + '<div class="row"><button class="btn btn-primary btn-sm" data-act="soon" data-msg="في التطبيق الفعلي يُحفظ الرمز كصورة PNG عالية الوضوح (2000×2000)">' + ic('download') + ' تنزيل كصورة</button><button class="btn btn-outline btn-sm" data-act="soon" data-msg="في التطبيق الفعلي تُفتح نافذة الطباعة بقالب A6 جاهز">' + ic('printer') + ' طباعة</button><button class="btn btn-outline btn-sm" data-act="soon" data-msg="في التطبيق الفعلي تُفتح قائمة المشاركة في الجوال">' + ic('share') + ' مشاركة</button><button class="btn btn-ghost btn-sm" data-act="copy" data-v="' + storeLink() + '" data-msg="تم نسخ رابط المحل">' + ic('copy') + ' نسخ الرابط</button></div>'
    + '<p class="faint xs">لا يحتوي الرمز على أي معلومات حساسة، فقط معرّف المحل.</p></div></section>'
    + '<section class="card"><h3 style="margin-bottom:12px">استخدامات جاهزة</h3><div class="row" style="align-items:flex-start;gap:16px"><div class="sticker"><b>امسح واحصل على عروض المحل</b><div class="qr-box"><div data-qr="' + storeLink() + '" data-size="120"></div></div><small>' + esc(D.store.name) + '</small></div>'
    + '<div class="stack-sm grow" style="min-width:180px"><div class="list-row">' + ic('store') + '<span class="small">ملصق الكاشير وواجهة المحل</span></div><div class="list-row">' + ic('receipt') + '<span class="small">أسفل الفواتير المطبوعة</span></div><div class="list-row">' + ic('megaphone') + '<span class="small">الإعلانات ومنشورات التواصل</span></div><button class="btn btn-ghost btn-sm" data-surface="customer">' + ic('eye') + ' ماذا يرى العميل عند المسح؟</button></div></div></section></div>'
    + '<h3 style="margin-bottom:6px">إحصائيات الرمز هذا الشهر</h3><p class="muted small" style="margin-bottom:12px">كل رقم يقيس حدثاً مختلفاً، ولا تُجمع في رقم واحد.</p>'
    + '<div class="funnel" style="margin-bottom:12px">'
    + kpi('مرات المسح', num(q.scans), 'فتح الرمز بكاميرا الجوال', 'qr')
    + kpi('سجّلوا عبر الرمز', num(q.signups), 'حسابات جديدة بدأت من رمزك', 'user')
    + kpi('زيارات مؤهلة', num(q.visits), 'تحققت وفق شروط الزيارة', 'pin')
    + kpi('مشتريات مؤكدة', num(q.purchases), 'مرتبطة بفاتورة صادرة', 'receipt')
    + kpi('النقاط المكتسبة', num(q.earned), 'أُضيفت إلى محفظتك', 'coins')
    + kpi('مكافآت معلقة', num(q.pending), 'بانتظار مراجعة الإدارة', 'clock')
    + '</div>' + note('warn', 'مسح الرمز وحده لا يُعد دليلاً على زيارة المحل أو إتمام شراء. تُحتسب الزيارة المؤهلة فقط عند تحقق الشروط من جهة الخادم.')
    + '<div class="grid-2" style="margin-top:20px"><section class="card"><h3 style="margin-bottom:12px">آخر الأحداث</h3><div class="tbl-wrap"><table class="tbl tbl-compact"><thead><tr><th>الوقت</th><th>الحدث</th><th>العميل</th><th>المكافأة</th></tr></thead><tbody>'
    + D.qrEvents.map(function(e){ return '<tr><td class="tnum">' + fmtShort(e.at) + '، ' + fmtTime(e.at) + '</td><td>' + evLab[e.ev][0] + '</td><td>' + esc(e.who) + '</td><td>' + st('reward', e.reward) + (e.note ? '<span class="sub">' + esc(e.note) + '</span>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div></section>'
    + '<section class="card stack"><h3>مكافآت جذب العملاء</h3><p class="muted small">تحددها إدارة وصلة وتُحدَّث دون تحديث التطبيق.</p>'
    + '<div class="sum-row"><span>تسجيل عميل جديد مؤهل عبر رمزك</span><b>' + r.signup + ' نقاط</b></div><div class="sum-row"><span>زيارة مؤهلة</span><b>' + r.visit + ' نقاط</b></div>' + (r.goalOn ? '<div class="sum-row"><span>هدف شهري: ' + r.goalTarget + ' عميلاً جديداً</span><b>+' + r.goalBonus + ' نقطة</b></div><div><div class="row-between small"><span class="muted">تقدّمك هذا الشهر</span><b class="tnum">' + q.signups + ' / ' + r.goalTarget + '</b></div><div class="meter" style="margin-top:6px"><span style="width:' + Math.min(100, q.signups / r.goalTarget * 100) + '%"></span></div></div>' : '')
    + '<div class="sum-row"><span>الحد الأقصى اليومي</span><b>' + r.dailyCap + ' مكافآت</b></div><div class="sum-row"><span>الحد الأقصى الشهري</span><b>' + r.monthlyCap + ' نقطة</b></div>'
    + '<p class="faint xs">النقاط المكتسبة للترويج داخل وصلة فقط، وليست رصيداً نقدياً قابلاً للسحب. تُعلَّق المكافآت المشكوك فيها للمراجعة.</p></section></div>';
};
