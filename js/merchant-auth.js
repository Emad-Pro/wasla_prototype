/* ===== merchant shell ===== */
const AUTH = ['role','login','forgot','register','regDone','accountStatus'];
const MNAV = [
  {g:'المتجر', items:[['dashboard','الرئيسية','home'],['profile','الملف الشخصي للمحل','store'],['products','المنتجات والخدمات','box'],['offers','العروض','tag']]},
  {g:'جذب العملاء', items:[['promo','الترويج بالنقاط','megaphone'],['qr','باركود المحل','qr'],['wallet','النقاط والمحفظة','wallet']]},
  {g:'الإدارة المالية', items:[['invoices','الفواتير الإلكترونية','receipt'],['customers','العملاء','users'],['inventory','المخزون','archive'],['ai','المساعد الذكي','sparkles']]},
  {g:'عام', items:[['inbox','الرسائل والإشعارات','bell'],['reports','التقارير','chart'],['settings','الاشتراكات والإعدادات','settings']]}
];
const PARENT = {productForm:'products', offerForm:'offers', promoNew:'promo', campaign:'promo', invoiceNew:'invoices', invoiceView:'invoices', invoiceLog:'invoices', invoiceSettings:'invoices', invoiceSub:'invoices', customer:'customers'};

function renderMerchant(){
  var s = S.m.screen;
  if (AUTH.indexOf(s) > -1 || !S.m.authed){
    var fn = AUTH.indexOf(s) > -1 ? M[s] : M.role;
    var wide = s === 'register' || s === 'regDone' || s === 'accountStatus';
    return '<main class="auth-wrap"><div class="auth-col" style="max-width:' + (wide ? '760px' : '480px') + '">' + fn() + '</div>' + authArt() + '</main>';
  }
  var f = M[s] || M.dashboard;
  return '<div class="shell">' + mSide() + '<div class="main">' + mAppbar() + '<main class="content" id="content">' + f() + '</main></div></div>' + mBottom() + (S.ui.drawer ? mDrawer() : '');
}
function badgeFor(k){
  if (k === 'inbox') return unreadCount() + unreadMsgs();
  if (k === 'ai') return D.aiDocs.filter(function(d){ return d.status === 'review'; }).length;
  if (k === 'inventory') return lowStock().length;
  if (k === 'offers') return D.offers.filter(function(o){ return o.status === 'rejected'; }).length;
  return 0;
}
function navHtml(){
  var cur = PARENT[S.m.screen] || S.m.screen;
  return MNAV.map(function(g){
    return '<div class="nav-group"><h6>' + g.g + '</h6>' + g.items.map(function(it){
      var b = badgeFor(it[0]);
      return '<button class="nav-item' + (cur === it[0] ? ' on' : '') + '" data-go="' + it[0] + '"' + (cur === it[0] ? ' aria-current="page"' : '') + '>' + ic(it[2]) + '<span>' + it[1] + '</span>' + (b ? '<span class="badge">' + b + '</span>' : '') + '</button>';
    }).join('') + '</div>';
  }).join('');
}
function sideStore(){ return '<div class="side-store">' + storeLogo(D.store, 'sm') + '<div><b>' + esc(D.store.name) + '</b>' + st('acct', D.store.status) + '</div></div>'; }
function mSide(){ return '<aside class="side" aria-label="أقسام لوحة التاجر">' + sideStore() + navHtml() + '<div class="side-foot"><button class="nav-item" data-act="logout">' + ic('logout') + '<span>تسجيل الخروج</span></button></div></aside>'; }
function screenTitle(){
  var cur = PARENT[S.m.screen] || S.m.screen, t = 'لوحة التاجر';
  MNAV.forEach(function(g){ g.items.forEach(function(it){ if (it[0] === cur) t = it[1]; }); });
  return t;
}
function mAppbar(){ return '<div class="appbar"><button class="icon-btn" data-act="drawer" aria-label="فتح القائمة">' + ic('menu') + '</button><h2>' + screenTitle() + '</h2><button class="icon-btn" data-go="inbox" aria-label="الإشعارات">' + ic('bell') + (unreadCount() ? '<span class="dot"></span>' : '') + '</button></div>'; }
function mBottom(){
  var cur = PARENT[S.m.screen] || S.m.screen;
  var items = [['dashboard','الرئيسية','home'],['offers','العروض','tag'],['invoices','الفواتير','receipt'],['wallet','النقاط','wallet']];
  return '<nav class="bottom-nav" aria-label="التنقل السريع">' + items.map(function(it){ return '<button class="' + (cur === it[0] ? 'on' : '') + '" data-go="' + it[0] + '">' + ic(it[2]) + it[1] + '</button>'; }).join('') + '<button data-act="drawer">' + ic('grid') + 'المزيد</button></nav>';
}
function mDrawer(){ return '<div class="drawer-back" data-act="drawerBack"><aside class="drawer" role="dialog" aria-modal="true" aria-label="القائمة"><div class="drawer-head">' + sideStore() + '<button class="icon-btn" data-act="drawer" aria-label="إغلاق القائمة">' + ic('x') + '</button></div>' + navHtml() + '<div class="side-foot"><button class="nav-item" data-act="logout">' + ic('logout') + '<span>تسجيل الخروج</span></button></div></aside></div>'; }
function authArt(){
  return '<div class="auth-art" aria-hidden="true"><svg viewBox="0 0 640 150">'
    + '<g style="fill:var(--line)"><rect x="40" y="40" width="26" height="80"/><rect x="72" y="20" width="22" height="100"/><rect x="100" y="55" width="30" height="65"/><rect x="470" y="30" width="24" height="90"/><rect x="500" y="10" width="28" height="110"/><rect x="534" y="50" width="22" height="70"/><rect x="562" y="35" width="30" height="85"/></g>'
    + '<path d="M-10 140 C150 130 230 80 360 88 S560 130 650 70" style="fill:none;stroke:var(--brand);stroke-width:16;stroke-linecap:round"/>'
    + '<path d="M-10 140 C150 130 230 80 360 88 S560 130 650 70" style="fill:none;stroke:var(--card);stroke-width:2;stroke-dasharray:14 12"/>'
    + '<text x="320" y="52" text-anchor="middle" style="fill:var(--muted);font:600 16px var(--font-display)">سيارتك… في أيدٍ أمينة</text>'
    + '</svg></div>';
}
ACT.drawer = function(){ S.ui.drawer = !S.ui.drawer; render(); };
ACT.drawerBack = function(el, e){ if (e.target === el){ S.ui.drawer = false; render(); } };
ACT.logout = function(){ confirmModal('تسجيل الخروج؟', 'ستعود إلى شاشة اختيار نوع الحساب. بياناتك محفوظة في الحساب.', 'doLogout', {}, 'تسجيل الخروج'); };
ACT.doLogout = function(){ S.m.authed = false; go('role'); };
ACT.roleCustomer = function(){ setSurface('customer'); toast('واجهة العميل: صفحة المحل كما تظهر داخل التطبيق', 'info'); };
ACT.enterApp = function(){ S.m.authed = true; go('dashboard'); toast('مرحباً بك في لوحة التاجر'); };

/* ===== role select ===== */
M.role = function(){
  return '<section class="auth-card">'
    + '<div class="auth-top"><span></span>' + langPick() + '</div>'
    + brandBlock(true)
    + '<h1 class="auth-title">مرحباً بك</h1><p class="auth-sub">اختر نوع الحساب للمتابعة</p>'
    + '<div class="role-list">'
    + '<button class="role-btn" data-act="roleCustomer">' + ic('car') + '<span><b>دخول العميل</b><small>استمتع بالعروض والخدمات القريبة منك</small></span>' + ic('chevL', 'chev') + '</button>'
    + '<button class="role-btn is-primary" data-go="login">' + ic('store') + '<span><b>دخول التاجر</b><small>إدارة متجرك وعروضك وفواتيرك</small></span>' + ic('chevL', 'chev') + '</button>'
    + '</div>'
    + '<p class="auth-foot">ليس لديك حساب تاجر؟ <a href="#" data-act="startReg">إنشاء حساب جديد</a></p>'
    + '</section>';
};
ACT.startReg = function(){ S.reg = freshReg(); go('register'); };

/* ===== login ===== */
const LOGIN_META = {
  phone:{label:'رقم الجوال', ph:'05XXXXXXXX', type:'tel', icon:'phone', sample:'0551234567'},
  cr:{label:'رقم السجل التجاري', ph:'10 أرقام', type:'text', icon:'file', sample:'1010654321'},
  email:{label:'البريد الإلكتروني', ph:'name@example.com', type:'email', icon:'mail', sample:'info@alnokhba-auto.sa'}
};
M.login = function(){
  var L = S.login, m = LOGIN_META[L.method];
  return '<section class="auth-card">'
    + '<div class="auth-top"><button class="link-back" data-go="role">' + ic('chevR') + ' نوع الحساب</button>' + langPick() + '</div>'
    + brandBlock(false)
    + '<h1 class="auth-title">مرحباً بعودتك</h1><p class="auth-sub">سجّل دخولك إلى حساب التاجر</p>'
    + '<form class="stack" data-act="doLogin" novalidate>'
    + '<div class="seg seg-block" role="tablist" aria-label="طريقة تسجيل الدخول">' + [['phone','رقم الجوال'],['cr','السجل التجاري'],['email','البريد الإلكتروني']].map(function(x){ return '<button type="button" role="tab" aria-selected="' + (L.method === x[0]) + '" class="' + (L.method === x[0] ? 'on' : '') + '" data-act="loginMethod" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>'
    + (L.error ? note('bad', esc(L.error)) : '')
    + F({id:'lg-id', label:m.label, bind:'S.login.id', type:m.type, ph:m.ph, icon:m.icon, ltr:true, attrs:'autocomplete="username"'})
    + '<div class="field' + (S.err['lg-pw'] ? ' has-err' : '') + '"><label for="lg-pw">كلمة المرور</label><div class="input-icon has-end">' + ic('lock') + '<input class="input ltr" id="lg-pw" type="' + (L.showPw ? 'text' : 'password') + '" data-bind="S.login.pw" value="' + esc(L.pw) + '" autocomplete="current-password"><button type="button" class="pw-toggle" data-act="togglePw" aria-label="' + (L.showPw ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور') + '">' + ic(L.showPw ? 'eyeOff' : 'eye') + '</button></div><small class="err">' + esc(S.err['lg-pw'] || '') + '</small></div>'
    + '<div class="row-between"><label class="check"><input type="checkbox" data-bind="S.login.remember"' + (L.remember ? ' checked' : '') + '><span>تذكّرني على هذا الجهاز</span></label><a href="#" data-act="startForgot">نسيت كلمة المرور؟</a></div>'
    + '<button class="btn btn-primary btn-block btn-lg" type="submit">تسجيل الدخول</button>'
    + '</form>'
    + '<p class="auth-foot">ليس لديك حساب؟ <a href="#" data-act="startReg">إنشاء حساب تاجر جديد</a></p>'
    + '<div class="demo-box"><b>جرّب حالات تسجيل الدخول</b><div class="chips">'
    + '<button class="chip" data-act="demoLogin" data-v="ok">' + ic('check') + 'دخول ناجح</button>'
    + '<button class="chip" data-act="demoLogin" data-v="wrong">بيانات غير صحيحة</button>'
    + '<button class="chip" data-act="demoLogin" data-v="pending">حساب قيد المراجعة</button>'
    + '<button class="chip" data-act="demoLogin" data-v="needs_info">يحتاج استكمال</button>'
    + '<button class="chip" data-act="demoLogin" data-v="rejected">طلب مرفوض</button></div>'
    + '<span>«تذكّرني» يحفظ جلسة آمنة بمفتاح مشفّر على الجهاز، ولا يحفظ كلمة المرور نفسها.</span></div>'
    + '</section>';
};
ACT.loginMethod = function(el){ var k = el.getAttribute('data-v'); S.login.method = k; S.login.id = LOGIN_META[k].sample; S.login.error = ''; S.err = {}; render(); };
ACT.togglePw = function(){ S.login.showPw = !S.login.showPw; render(); var f = $('#lg-pw'); if (f) f.focus(); };
ACT.doLogin = function(){
  var L = S.login, e = {};
  if (!String(L.id).trim()) e['lg-id'] = 'أدخل ' + LOGIN_META[L.method].label;
  else if (L.method === 'phone' && !/^05\d{8}$/.test(L.id)) e['lg-id'] = 'رقم الجوال يبدأ بـ 05 ويتكون من 10 أرقام';
  else if (L.method === 'cr' && !/^\d{10}$/.test(L.id)) e['lg-id'] = 'رقم السجل التجاري يتكون من 10 أرقام';
  else if (L.method === 'email' && !/^\S+@\S+\.\S+$/.test(L.id)) e['lg-id'] = 'صيغة البريد الإلكتروني غير صحيحة';
  if (!L.pw) e['lg-pw'] = 'أدخل كلمة المرور';
  S.err = e; L.error = '';
  if (Object.keys(e).length){ render(); return; }
  if (D.store.status !== 'approved'){ S.acctView = D.store.status; go('accountStatus'); return; }
  S.m.authed = true; go('dashboard'); toast('مرحباً بعودتك، ' + D.store.owner.split(' ')[0]);
};
ACT.demoLogin = function(el){
  var v = el.getAttribute('data-v');
  if (v === 'ok'){ S.m.authed = true; D.store.status = 'approved'; go('dashboard'); toast('مرحباً بعودتك، عبدالله'); return; }
  if (v === 'wrong'){ S.login.error = 'بيانات الدخول غير صحيحة. تحقّق من البيانات وكلمة المرور ثم حاول مرة أخرى.'; S.err = {}; render(); return; }
  S.acctView = v; go('accountStatus');
};

/* ===== forgot password ===== */
ACT.startForgot = function(){ S.fp = {step:1, method:'phone', val:'0551234567', code:'', pw:'', pw2:''}; go('forgot'); };
M.forgot = function(){
  if (!S.fp) S.fp = {step:1, method:'phone', val:'0551234567', code:'', pw:'', pw2:''};
  var f = S.fp, body = '';
  if (f.step === 1){
    body = '<h1 class="auth-title">استعادة كلمة المرور</h1><p class="auth-sub">اختر وسيلة التحقق وسنرسل لك رمزاً لمرة واحدة</p>'
      + '<form class="stack" data-act="fpSend" novalidate><div class="seg seg-block">' + [['phone','رسالة نصية'],['email','البريد الإلكتروني']].map(function(x){ return '<button type="button" class="' + (f.method === x[0] ? 'on' : '') + '" data-act="fpMethod" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>'
      + F({id:'fp-val', label:f.method === 'phone' ? 'رقم الجوال المسجّل' : 'البريد الإلكتروني المسجّل', bind:'S.fp.val', ltr:true, icon:f.method === 'phone' ? 'phone' : 'mail'})
      + '<button class="btn btn-primary btn-block btn-lg" type="submit">إرسال رمز التحقق</button></form>';
  } else if (f.step === 2){
    body = '<h1 class="auth-title">أدخل رمز التحقق</h1><p class="auth-sub">إذا كانت البيانات مسجّلة لدينا فسيصلك رمز من 4 أرقام على ' + (f.method === 'phone' ? maskPhone(f.val) : esc(f.val)) + '</p>'
      + '<form class="stack" data-act="fpVerify" novalidate>' + F({id:'fp-code', label:'رمز التحقق', bind:'S.fp.code', attrs:'inputmode="numeric" maxlength="4" autocomplete="one-time-code"', hint:'للتجربة: أي 4 أرقام، مثل 1234'})
      + '<button class="btn btn-primary btn-block btn-lg" type="submit">تحقّق</button><p class="auth-foot">لم يصلك الرمز؟ <button type="button" class="linklike" data-act="soon" data-msg="أُعيد إرسال الرمز. يمكنك طلب رمز جديد بعد 60 ثانية.">إعادة الإرسال</button></p></form>';
  } else if (f.step === 3){
    body = '<h1 class="auth-title">كلمة مرور جديدة</h1><p class="auth-sub">8 أحرف على الأقل وتحتوي على حروف وأرقام</p>'
      + '<form class="stack" data-act="fpSave" novalidate>' + F({id:'fp-pw', label:'كلمة المرور الجديدة', bind:'S.fp.pw', type:'password', ltr:true, icon:'lock'}) + F({id:'fp-pw2', label:'تأكيد كلمة المرور', bind:'S.fp.pw2', type:'password', ltr:true, icon:'lock'})
      + '<button class="btn btn-primary btn-block btn-lg" type="submit">حفظ كلمة المرور</button></form>';
  } else {
    body = '<div class="empty">' + ic('shield') + '<h3>تم تغيير كلمة المرور</h3><p>سجّلنا خروجك من الأجهزة الأخرى حفاظاً على أمان حسابك.</p><button class="btn btn-primary" data-go="login">العودة لتسجيل الدخول</button></div>';
  }
  return '<section class="auth-card"><div class="auth-top"><button class="link-back" data-go="login">' + ic('chevR') + ' تسجيل الدخول</button><span class="faint small">' + (f.step < 4 ? 'الخطوة ' + f.step + ' من 3' : '') + '</span></div>' + brandBlock(false) + body + '</section>';
};
ACT.fpMethod = function(el){ S.fp.method = el.getAttribute('data-v'); S.fp.val = S.fp.method === 'phone' ? '0551234567' : 'info@alnokhba-auto.sa'; render(); };
ACT.fpSend = function(){ if (!String(S.fp.val).trim()){ S.err = {'fp-val':'أدخل البيانات المطلوبة'}; render(); return; } S.fp.step = 2; S.err = {}; render(); };
ACT.fpVerify = function(){ if (!/^\d{4}$/.test(S.fp.code)){ S.err = {'fp-code':'الرمز يتكون من 4 أرقام'}; render(); return; } S.fp.step = 3; S.err = {}; render(); };
ACT.fpSave = function(){
  var e = {};
  if (!(S.fp.pw.length >= 8 && /[A-Za-z؀-ۿ]/.test(S.fp.pw) && /\d/.test(S.fp.pw))) e['fp-pw'] = 'كلمة المرور 8 أحرف على الأقل وتحتوي على حروف وأرقام';
  if (S.fp.pw !== S.fp.pw2) e['fp-pw2'] = 'كلمتا المرور غير متطابقتين';
  S.err = e; if (Object.keys(e).length){ render(); return; }
  S.fp.step = 4; render();
};

/* ===== shared store form ===== */
function hoursEditor(path){
  var hs = getPath(path) || [];
  return '<div class="hours">' + hs.map(function(h, i){
    return '<div class="hour-row"><span class="day">' + h.d + '</span><label class="switch"><input type="checkbox" data-bind="' + path + '.' + i + '.open" data-rerender' + (h.open ? ' checked' : '') + ' aria-label="' + h.d + ' يوم عمل"><span class="xs muted">' + (h.open ? 'مفتوح' : 'إجازة') + '</span></label>'
      + '<input class="input input-sm tnum" type="time" data-bind="' + path + '.' + i + '.from" value="' + h.from + '"' + (h.open ? '' : ' disabled') + ' aria-label="' + h.d + ': وقت الفتح">'
      + '<input class="input input-sm tnum" type="time" data-bind="' + path + '.' + i + '.to" value="' + h.to + '"' + (h.open ? '' : ' disabled') + ' aria-label="' + h.d + ': وقت الإغلاق"></div>';
  }).join('') + '</div><div class="row"><button type="button" class="btn btn-ghost btn-sm" data-act="copyHours" data-path="' + path + '">' + ic('copy') + ' تطبيق أوقات السبت على باقي أيام العمل</button></div>';
}
ACT.copyHours = function(el){ var hs = getPath(el.getAttribute('data-path')); hs.forEach(function(h, i){ if (i > 0 && h.open){ h.from = hs[0].from; h.to = hs[0].to; } }); render(); };
ACT.addSvc = function(el){ var p = el.getAttribute('data-path'), o = getPath(p), v = String(o._newSvc || '').trim(); if (!v) return; o.services = (o.services || []).concat(o.services.indexOf(v) > -1 ? [] : [v]); o._newSvc = ''; delete S.err['sf-svc']; render(); };
ACT.addPhone = function(el){ var p = el.getAttribute('data-path'), arr = (getPath(p) || []).slice(); if (arr.length >= 3){ toast('يمكن إضافة 3 أرقام إضافية كحد أقصى', 'info'); return; } arr.push(''); setPath(p, arr); render(); };
function storeFields(path, o){
  o = o || {};
  var v = getPath(path);
  var extraSvcs = (v.services || []).filter(function(s){ return SERVICES.indexOf(s) < 0; });
  return '<div class="card stack"><h3>هوية المحل</h3><div class="form-grid">'
    + F({id:'sf-name', label:'اسم المحل أو الورشة', bind:path + '.name', req:true, ph:'مثال: ورشة النخبة لصيانة السيارات', cls:'full'})
    + '<div class="field full"><span class="label">صورة واجهة المحل أو الشعار</span>' + logoUploader(path + '.logo') + '<small class="hint">تظهر للعملاء في صفحة المحل ونتائج البحث.</small></div>'
    + (o.gallery ? '<div class="field full"><span class="label">صور إضافية للمحل</span>' + uploader(path + '.gallery', {max:6, title:'من داخل ورشة النخبة'}) + '<small class="hint">تخضع الصور الجديدة لمراجعة الإدارة قبل ظهورها للعملاء.</small></div>' : '')
    + '</div></div>'
    + '<div class="card stack"><h3>النشاط والخدمات</h3>'
    + '<div class="field' + (S.err['sf-act'] ? ' has-err' : '') + '"><span class="label">نوع النشاط التجاري <span class="req">*</span></span><small class="hint">يمكنك اختيار أكثر من نشاط. تضيف إدارة وصلة أنشطة جديدة دون تحديث التطبيق.</small>' + chipsPicker(path + '.activities', ACTIVITIES) + '<small class="err">' + esc(S.err['sf-act'] || '') + '</small></div>'
    + '<div class="field' + (S.err['sf-svc'] ? ' has-err' : '') + '"><span class="label">التخصصات والخدمات <span class="req">*</span></span>' + chipsPicker(path + '.services', SERVICES.concat(extraSvcs))
    + '<div class="row" style="margin-top:4px"><input class="input input-sm" style="max-width:280px" id="sf-newsvc" data-bind="' + path + '._newSvc" value="' + esc(v._newSvc || '') + '" placeholder="خدمة أخرى غير موجودة في القائمة" aria-label="إضافة خدمة أخرى"><button type="button" class="btn btn-outline btn-sm" data-act="addSvc" data-path="' + path + '">' + ic('plus') + ' إضافة</button></div><small class="err">' + esc(S.err['sf-svc'] || '') + '</small></div>'
    + F({id:'sf-desc', type:'textarea', label:'وصف مختصر للمنشأة', bind:path + '.desc', ph:'نبذة عن المحل ومميزاته والخدمات التي يقدمها', hint:'يظهر في صفحة المحل. يُفضّل ألا يتجاوز 300 حرف.', attrs:'maxlength="400"'})
    + '</div>'
    + '<div class="card stack"><h3>العنوان والموقع</h3><div class="form-grid">'
    + F({id:'sf-city', type:'select', label:'المدينة', bind:path + '.city', options:CITIES, req:true})
    + F({id:'sf-district', label:'الحي', bind:path + '.district', req:true, ph:'مثال: حي العليا'})
    + F({id:'sf-street', label:'الشارع', bind:path + '.street', ph:'مثال: طريق الملك فهد', cls:'full', opt:true})
    + '</div><div class="field' + (S.err.pin ? ' has-err' : '') + '"><span class="label">تحديد الموقع على الخريطة <span class="req">*</span></span>' + fakeMap({pin:v.pin, path:path + '.pin', h:240}) + '<small class="hint">اضغط على موقع المحل بدقة. يستخدمه العملاء للوصول وحساب المسافة.</small><small class="err">' + esc(S.err.pin || '') + '</small></div></div>'
    + '<div class="card stack"><h3>ساعات العمل وأيام الدوام</h3>' + hoursEditor(path + '.hours') + (S.err.hours ? note('bad', S.err.hours) : '') + '</div>'
    + '<div class="card stack"><h3>التواصل</h3><div class="form-grid">'
    + F({id:'sf-phone', label:'رقم التواصل الأساسي', bind:path + '.phone', req:true, ltr:true, type:'tel', ph:'05XXXXXXXX', icon:'phone'})
    + F({id:'sf-wa', label:'رقم واتساب', bind:path + '.whatsapp', ltr:true, type:'tel', ph:'05XXXXXXXX', opt:true, icon:'whatsapp'})
    + '<div class="field full"><span class="label">أرقام إضافية <span class="faint xs">(اختياري)</span></span>' + (v.phones || []).map(function(p, i){ return '<div class="row"><input class="input ltr grow" type="tel" data-bind="' + path + '.phones.' + i + '" value="' + esc(p) + '" placeholder="رقم إضافي" aria-label="رقم إضافي ' + (i + 1) + '"><button type="button" class="icon-btn" data-act="rmImg" data-path="' + path + '.phones" data-i="' + i + '" aria-label="حذف الرقم">' + ic('trash') + '</button></div>'; }).join('') + '<div><button type="button" class="btn btn-ghost btn-sm" data-act="addPhone" data-path="' + path + '.phones">' + ic('plus') + ' إضافة رقم</button></div></div>'
    + F({id:'sf-web', label:'الموقع الإلكتروني', bind:path + '.website', ltr:true, ph:'example.com', opt:true, icon:'globe'})
    + (o.email ? F({id:'sf-email', label:'البريد الإلكتروني للتواصل', bind:path + '.email', ltr:true, type:'email', opt:true, icon:'mail'}) : '')
    + '</div></div>';
}
function validateStore(v){
  var e = {};
  if (!String(v.name || '').trim()) e['sf-name'] = 'أدخل اسم المحل';
  if (!(v.activities || []).length) e['sf-act'] = 'اختر نشاطاً واحداً على الأقل';
  if (!(v.services || []).length) e['sf-svc'] = 'اختر خدمة واحدة على الأقل';
  if (!String(v.district || '').trim()) e['sf-district'] = 'أدخل اسم الحي';
  if (!v.pin) e.pin = 'حدّد موقع المحل على الخريطة';
  if (!/^0\d{9}$/.test(v.phone || '')) e['sf-phone'] = 'أدخل رقم تواصل صحيحاً من 10 أرقام';
  if (v.whatsapp && !/^05\d{8}$/.test(v.whatsapp)) e['sf-wa'] = 'رقم واتساب يبدأ بـ 05 ويتكون من 10 أرقام';
  if (!(v.hours || []).some(function(h){ return h.open; })) e.hours = 'حدّد يوم عمل واحداً على الأقل';
  return e;
}

/* ===== registration ===== */
M.register = function(){
  if (!S.reg) S.reg = freshReg();
  var r = S.reg, s = r.step;
  var steps = [['البيانات الأساسية'],['بيانات المتجر'],['مراجعة الحساب']];
  var stepper = '<div class="stepper">' + steps.map(function(x, i){
    var n = i + 1, cls = n < s ? 'done' : n === s ? 'cur' : '';
    return '<button type="button" class="step ' + cls + '"' + (n < s ? ' data-act="regStep" data-v="' + n + '"' : ' disabled') + '><span class="step-n">' + (n < s ? ic('check') : n) + '</span>' + x[0] + '</button>';
  }).join('') + '</div>';
  var body = '';
  if (s === 1){
    body = '<form class="stack" data-act="regNext1" novalidate><div class="card stack"><div class="form-grid">'
      + F({id:'reg-owner', label:'اسم التاجر أو المنشأة', bind:'S.reg.owner', req:true, icon:'store', cls:'full', ph:'كما يظهر في السجل التجاري'})
      + F({id:'reg-phone', label:'رقم الجوال', bind:'S.reg.accPhone', req:true, icon:'phone', ltr:true, type:'tel', ph:'05XXXXXXXX', hint:'سنرسل رمز تحقق إلى هذا الرقم'})
      + F({id:'reg-email', label:'البريد الإلكتروني', bind:'S.reg.email', req:true, icon:'mail', ltr:true, type:'email', ph:'name@example.com'})
      + F({id:'reg-cr', label:'رقم السجل التجاري', bind:'S.reg.cr', icon:'file', ltr:true, ph:'10 أرقام', opt:true, hint:'عند انطباقه على المنشأة', cls:'full'})
      + F({id:'reg-pw', label:'كلمة المرور', bind:'S.reg.pw', req:true, icon:'lock', ltr:true, type:'password', hint:'8 أحرف على الأقل، حروف وأرقام'})
      + F({id:'reg-pw2', label:'تأكيد كلمة المرور', bind:'S.reg.pw2', req:true, icon:'lock', ltr:true, type:'password'})
      + '</div>'
      + CB({id:'reg-terms', bind:'S.reg.terms', label:'أوافق على <a href="#" data-act="soon" data-msg="تُعرض الشروط والأحكام كاملة هنا في النسخة الفعلية">الشروط والأحكام</a>'})
      + CB({id:'reg-privacy', bind:'S.reg.privacy', label:'أوافق على <a href="#" data-act="soon" data-msg="تُعرض سياسة الخصوصية كاملة هنا في النسخة الفعلية">سياسة الخصوصية</a> واستخدام بياناتي لتقديم الخدمة'})
      + '</div><div class="form-actions"><button class="btn btn-primary btn-lg" type="submit">التالي ' + ic('chevL') + '</button><button type="button" class="btn btn-ghost" data-act="regDemo">تعبئة ببيانات تجريبية</button></div></form>';
  } else if (s === 2){
    body = '<form class="stack" data-act="regNext2" novalidate>' + storeFields('S.reg', {})
      + '<div class="form-actions"><button type="button" class="btn btn-outline btn-lg" data-act="regStep" data-v="1">' + ic('chevR') + ' السابق</button><button class="btn btn-primary btn-lg" type="submit">التالي ' + ic('chevL') + '</button></div></form>';
  } else {
    body = regReview(r);
  }
  return '<section class="auth-card"><div class="auth-top"><button class="link-back" data-go="role">' + ic('chevR') + ' العودة</button>' + langPick() + '</div>'
    + '<div class="row" style="justify-content:center;gap:14px">' + logoMark().replace('class="mark"', 'class="mark" style="width:40px;height:48px"') + '<div><h1 style="font-size:22px">إنشاء حساب تاجر جديد</h1><p class="muted small">سجّل بياناتك لبدء إدارة متجرك وعروضك على وصلة</p></div></div>'
    + stepper + body + '<p class="auth-foot">لديك حساب بالفعل؟ <a href="#" data-go="login">تسجيل الدخول</a></p></section>';
};
function regReview(r){
  var sec = function(title, step, html){ return '<div class="card stack"><div class="row-between"><h3>' + title + '</h3><button class="btn btn-ghost btn-sm" data-act="regStep" data-v="' + step + '">' + ic('edit') + ' تعديل</button></div>' + html + '</div>'; };
  var openDays = r.hours.filter(function(h){ return h.open; });
  return '<div class="stack">' + note('info', 'راجع بياناتك قبل الإرسال. يمكنك الرجوع لأي مرحلة دون فقدان ما أدخلته.')
    + sec('البيانات الأساسية', 1, '<dl class="kv"><dt>اسم التاجر أو المنشأة</dt><dd>' + esc(r.owner) + '</dd><dt>رقم الجوال</dt><dd class="ltr" style="text-align:start">' + esc(r.accPhone) + ' ' + (r.verified ? pill('موثّق', 'ok', 'check') : '') + '</dd><dt>البريد الإلكتروني</dt><dd class="ltr" style="text-align:start">' + esc(r.email) + '</dd><dt>السجل التجاري</dt><dd>' + esc(r.cr || 'لا ينطبق') + '</dd><dt>كلمة المرور</dt><dd>••••••••</dd></dl>')
    + sec('بيانات المتجر', 2, '<div class="row" style="align-items:flex-start;gap:14px">' + storeLogo(r, 'lg') + '<div class="stack-sm grow"><b>' + esc(r.name) + '</b><div class="chips">' + r.activities.map(function(a){ return pill(esc(a), 'brand'); }).join('') + '</div><div class="chips">' + r.services.map(function(a){ return pill(esc(a), 'neutral'); }).join('') + '</div><p class="muted small">' + esc(r.desc || 'لم يُضف وصف') + '</p></div></div>')
    + sec('العنوان والموقع', 2, '<p>' + esc(r.city) + '، ' + esc(r.district) + (r.street ? '، ' + esc(r.street) : '') + '</p>' + fakeMap({pin:r.pin, h:150}))
    + sec('ساعات العمل', 2, '<table class="hours-tbl">' + r.hours.map(function(h){ return '<tr><td>' + h.d + '</td><td>' + (h.open ? h.from + ' – ' + h.to : 'إجازة') + '</td></tr>'; }).join('') + '</table><p class="muted small">' + openDays.length + ' أيام عمل أسبوعياً</p>')
    + sec('التواصل', 2, '<dl class="kv"><dt>الرقم الأساسي</dt><dd class="tnum">' + esc(r.phone) + '</dd><dt>أرقام إضافية</dt><dd class="tnum">' + esc(r.phones.filter(Boolean).join('، ') || '—') + '</dd><dt>واتساب</dt><dd class="tnum">' + esc(r.whatsapp || '—') + '</dd><dt>الموقع الإلكتروني</dt><dd>' + esc(r.website || '—') + '</dd></dl>')
    + note('neutral', 'بعد الإرسال يراجع فريق وصلة الطلب خلال يومي عمل. تُمنح <b>50 نقطة مجانية</b> عند اعتماد الحساب، مرة واحدة فقط لكل حساب.', 'coins')
    + '<div class="form-actions"><button class="btn btn-outline btn-lg" data-act="regStep" data-v="2">' + ic('chevR') + ' السابق</button><button class="btn btn-ghost btn-lg" data-act="regStep" data-v="1">' + ic('edit') + ' تعديل البيانات</button><button class="btn btn-primary btn-lg" data-act="regSubmit">' + ic('send') + ' إرسال طلب التسجيل</button></div></div>';
}
ACT.regStep = function(el){ S.reg.step = Number(el.getAttribute('data-v')); S.err = {}; render(); window.scrollTo(0, 0); };
ACT.regDemo = function(){ var keep = S.reg && S.reg.verified; S.reg = demoReg(); S.reg.verified = keep; S.err = {}; render(); toast('عُبّئت بيانات تجريبية لمركز إطارات', 'info'); };
ACT.regNext1 = function(){
  var r = S.reg, e = {};
  if (String(r.owner).trim().length < 3) e['reg-owner'] = 'أدخل اسم التاجر أو المنشأة';
  if (!/^05\d{8}$/.test(r.accPhone)) e['reg-phone'] = 'أدخل رقم جوال سعودي يبدأ بـ 05 ويتكون من 10 أرقام';
  else if (r.accPhone === D.store.phone) e['reg-phone'] = 'هذا الرقم مرتبط بحساب تاجر قائم. سجّل الدخول أو استعد كلمة المرور.';
  if (!/^\S+@\S+\.\S+$/.test(r.email)) e['reg-email'] = 'صيغة البريد الإلكتروني غير صحيحة';
  if (r.cr && !/^\d{10}$/.test(r.cr)) e['reg-cr'] = 'رقم السجل التجاري يتكون من 10 أرقام';
  if (!(r.pw.length >= 8 && /[A-Za-z؀-ۿ]/.test(r.pw) && /\d/.test(r.pw))) e['reg-pw'] = 'كلمة المرور 8 أحرف على الأقل وتحتوي على حروف وأرقام';
  if (r.pw !== r.pw2) e['reg-pw2'] = 'كلمتا المرور غير متطابقتين';
  if (!r.terms) e['reg-terms'] = 'يلزم الموافقة على الشروط والأحكام';
  if (!r.privacy) e['reg-privacy'] = 'يلزم الموافقة على سياسة الخصوصية';
  S.err = e;
  if (Object.keys(e).length){ render(); var f = document.querySelector('.has-err input'); if (f) f.focus(); return; }
  if (!r.phone) r.phone = r.accPhone;
  if (r.verified){ r.step = 2; render(); window.scrollTo(0, 0); return; }
  S.otp = '';
  openModal(modalHead('تأكيد رقم الجوال', 'أرسلنا رمزاً من 4 أرقام إلى ' + maskPhone(r.accPhone)) + '<form data-act="regOtp" novalidate><div class="modal-body">' + F({id:'otp', label:'رمز التحقق', bind:'S.otp', attrs:'inputmode="numeric" maxlength="4" autocomplete="one-time-code" autofocus', hint:'للتجربة: أي 4 أرقام. نتحقق من البريد الإلكتروني برابط يُرسل إليه بعد التسجيل.'}) + '</div><div class="modal-foot"><button class="btn btn-primary" type="submit">تأكيد الرقم</button><button type="button" class="btn btn-ghost" data-act="closeModal">تعديل الرقم</button></div></form>');
};
ACT.regOtp = function(){
  if (!/^\d{4}$/.test(S.otp || '')){ var f = $('#otp'); if (f){ f.closest('.field').classList.add('has-err'); f.closest('.field').querySelector('.err').textContent = 'الرمز يتكون من 4 أرقام'; } return; }
  S.reg.verified = true; S.reg.step = 2; closeModal(); render(); window.scrollTo(0, 0); toast('تم توثيق رقم الجوال');
};
ACT.regNext2 = function(){
  var e = validateStore(S.reg); S.err = e;
  if (Object.keys(e).length){ render(); var f = document.querySelector('.has-err'); if (f) f.scrollIntoView({block:'center'}); toast('راجع الحقول المظللة باللون الأحمر', 'bad'); return; }
  S.reg.step = 3; render(); window.scrollTo(0, 0);
};
ACT.regSubmit = function(){
  var r = S.reg;
  D.admin.merchants.unshift({id:'M' + (D.admin.merchants.length + 1), name:r.name, owner:r.owner, city:r.city, phone:r.accPhone, cr:r.cr, activity:r.activities.join('، '), status:'pending', at:TODAY, bonus:false, fromReg:true});
  S.acctView = 'pending'; S.regName = r.name;
  go('regDone');
  toast('تم استلام طلب التسجيل');
};

/* ===== account status ===== */
M.regDone = function(){ return M.accountStatus(true); };
M.accountStatus = function(fromReg){
  var v = S.acctView || 'pending', name = S.regName || D.store.name;
  var views = {
    pending:{icon:'clock', tone:'warn', title:'طلبك قيد المراجعة', text:'استلمنا طلب تسجيل «' + esc(name) + '». يراجع فريق وصلة البيانات خلال يومي عمل، وسنرسل لك إشعاراً ورسالة نصية فور اتخاذ القرار.', actions:'<button class="btn btn-outline" data-go="role">العودة للبداية</button>'},
    approved:{icon:'check', tone:'ok', title:'تم اعتماد حسابك', text:'أصبح متجرك ظاهراً للعملاء، وأُضيفت <b>50 نقطة مجانية</b> إلى محفظتك لاستخدامها في الترويج.', actions:'<button class="btn btn-primary btn-lg" data-act="enterApp">الدخول إلى لوحة التاجر ' + ic('chevL') + '</button>'},
    rejected:{icon:'x', tone:'bad', title:'تعذّر اعتماد الطلب', text:'السبب: السجل التجاري المرفق منتهي الصلاحية. حدّث السجل التجاري ثم قدّم طلباً جديداً.', actions:'<button class="btn btn-primary" data-act="startReg">تقديم طلب جديد</button><button class="btn btn-outline" data-act="supportModal">التواصل مع الدعم</button>'},
    needs_info:{icon:'edit', tone:'info', title:'يحتاج طلبك إلى استكمال بيانات', text:'طلب فريق المراجعة استكمال ما يلي قبل اعتماد الحساب:<ul style="margin:8px 0 0;padding-inline-start:20px"><li>صورة واضحة لواجهة المحل</li><li>تصحيح موقع المحل على الخريطة</li></ul>', actions:'<button class="btn btn-primary" data-act="completeReg">استكمال البيانات</button>'},
    suspended:{icon:'lock', tone:'bad', title:'الحساب موقوف مؤقتاً', text:'أوقفت إدارة وصلة الحساب مؤقتاً لمراجعة بلاغات متعلقة بالمحتوى. تواصل مع الدعم لمعرفة التفاصيل.', actions:'<button class="btn btn-outline" data-act="supportModal">التواصل مع الدعم</button>'}
  };
  var x = views[v] || views.pending;
  var cur = v === 'approved' ? 3 : v === 'pending' ? 2 : 2;
  var tl = [['استلام الطلب', 'تم إرسال الطلب وتوثيق رقم الجوال'], ['مراجعة الإدارة', 'التحقق من السجل التجاري وبيانات المتجر'], ['اعتماد الحساب', 'تفعيل المتجر ومنح 50 نقطة مجانية']];
  return '<section class="auth-card"><div class="auth-top"><button class="link-back" data-go="role">' + ic('chevR') + ' البداية</button><span class="faint small">حالة الحساب</span></div>'
    + '<div class="stack" style="align-items:center;text-align:center"><span class="list-ic tone-' + x.tone + '" style="width:64px;height:64px;border-radius:20px">' + ic(x.icon) + '</span>' + st('acct', v) + '<h1 style="font-size:24px">' + x.title + '</h1><div class="muted" style="max-width:52ch">' + x.text + '</div><div class="row" style="justify-content:center">' + x.actions + '</div></div>'
    + '<div class="card"><div class="timeline">' + tl.map(function(t, i){ var n = i + 1, cls = (v === 'approved' || n < cur) ? 'done' : n === cur ? 'cur' : ''; if ((v === 'rejected' || v === 'needs_info' || v === 'suspended') && n === 2) cls = 'cur'; return '<div class="tl-item ' + cls + '"><span class="tl-dot">' + ic(cls === 'done' ? 'check' : cls === 'cur' ? 'clock' : 'chevL') + '</span><div><b>' + t[0] + '</b><small>' + t[1] + '</small></div></div>'; }).join('') + '</div></div>'
    + '<div class="demo-box"><b>معاينة حالات الحساب</b><div class="chips">' + ['pending','approved','needs_info','rejected','suspended'].map(function(k){ return '<button class="chip' + (k === v ? ' on' : '') + '" data-act="setv" data-path="S.acctView" data-v="' + k + '">' + ST.acct[k][0] + '</button>'; }).join('') + '</div></div>'
    + '</section>';
};
ACT.completeReg = function(){ if (!S.reg) S.reg = demoReg(); S.reg.step = 2; S.reg.verified = true; go('register'); };
ACT.supportModal = function(){
  openModal(modalHead('التواصل مع دعم وصلة') + '<div class="modal-body"><p class="muted">فريق الدعم متاح من الأحد إلى الخميس، 9 صباحاً حتى 9 مساءً.</p><dl class="kv"><dt>الهاتف</dt><dd class="tnum" style="user-select:all">920000000</dd><dt>البريد</dt><dd style="user-select:all">support@wasla.example</dd></dl><p class="faint xs">بيانات تواصل توضيحية.</p></div><div class="modal-foot"><button class="btn btn-primary" data-act="copy" data-v="920000000" data-msg="تم نسخ رقم الدعم">' + ic('copy') + ' نسخ الرقم</button><button class="btn btn-ghost" data-act="closeModal">إغلاق</button></div>');
};
