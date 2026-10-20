/* ===== customer-facing store page ===== */
function openNow(st){
  var js = new Date().getDay(), idx = (js + 1) % 7, h = st.hours[idx];
  if (!h || !h.open) return {open:false, idx:idx};
  var d = new Date(), cur = d.getHours() * 60 + d.getMinutes();
  var f = h.from.split(':'), t = h.to.split(':');
  return {open:cur >= (+f[0]) * 60 + (+f[1]) && cur < (+t[0]) * 60 + (+t[1]), idx:idx, h:h};
}
function stars(n){ var s = ''; for (var i = 1; i <= 5; i++) s += ic('star', i <= Math.round(n) ? 'st-on' : 'st-off'); return '<span class="stars" role="img" aria-label="' + n + ' من 5">' + s + '</span>'; }
function storePublic(st, o){
  o = o || {};
  var on = openNow(st), t = curTab('sp', 'overview');
  var offers = D.offers.filter(function(x){ return x.status === 'active'; });
  var items = D.products.filter(function(p){ return !p.hidden; });
  var body = '';
  if (t === 'overview'){
    body = '<div class="sp-sec"><h4>عن المحل</h4><p class="small muted">' + esc(st.desc) + '</p></div>'
      + '<div class="sp-sec"><h4>الخدمات</h4><div class="chips">' + st.services.map(function(s){ return pill(esc(s), 'neutral'); }).join('') + '</div></div>'
      + (st.gallery && st.gallery.length ? '<div class="sp-sec"><h4>صور المحل</h4><div class="gallery">' + st.gallery.map(function(g){ return '<div class="thumb"><img src="' + g + '" alt=""></div>'; }).join('') + '</div></div>' : '')
      + '<div class="sp-sec"><h4>أوقات العمل</h4><table class="hours-tbl">' + st.hours.map(function(h, i){ return '<tr class="' + (i === on.idx ? 'today' : '') + '"><td>' + h.d + (i === on.idx ? ' (اليوم)' : '') + '</td><td>' + (h.open ? h.from + ' – ' + h.to : 'إجازة') + '</td></tr>'; }).join('') + '</table></div>'
      + '<div class="sp-sec"><h4>الموقع</h4>' + fakeMap({pin:st.pin, h:150, coords:false}) + '<p class="small muted" style="margin-top:6px">' + ic('pin') + ' ' + esc(st.city + '، ' + st.district + (st.street ? '، ' + st.street : '')) + ' · يبعد ' + st.distance + '</p></div>'
      + '<div class="sp-sec"><h4>التواصل</h4><dl class="kv"><dt>الهاتف</dt><dd class="tnum" style="user-select:all">' + st.phone + '</dd>' + (st.phones || []).filter(Boolean).map(function(p){ return '<dt>رقم إضافي</dt><dd class="tnum" style="user-select:all">' + p + '</dd>'; }).join('') + (st.whatsapp ? '<dt>واتساب</dt><dd class="tnum">' + st.whatsapp + '</dd>' : '') + (st.website ? '<dt>الموقع</dt><dd>' + esc(st.website) + '</dd>' : '') + '</dl></div>'
      + '<p class="faint xs">' + ic('eye') + ' زار ' + num(st.visits30) + ' شخصاً صفحة المحل خلال آخر 30 يوماً</p>';
  } else if (t === 'prices'){
    body = '<div class="stack-sm">' + items.map(function(p){ var inv = p.inv ? invItem(p.inv) : null, av = p.type === 'product' ? inv && inv.qty > 0 : p.avail; return '<div class="row" style="flex-wrap:nowrap;padding:8px 0;border-bottom:1px solid var(--line)">' + thumb(p, 'thumb-sm') + '<div class="grow"><b class="small">' + esc(p.name) + '</b><div class="faint xs">' + esc(p.cat) + (av ? '' : ' · <span class="negv">غير متوفر حالياً</span>') + '</div></div><div class="price" style="flex-direction:column;align-items:flex-end;gap:0"><b class="tnum" style="font-size:16px">' + amt(p.sale || p.price) + '</b>' + (p.sale ? '<s class="tnum" style="font-size:12px">' + amt(p.price) + '</s>' : '') + '</div></div>'; }).join('') + '</div><p class="faint xs">الأسعار بالريال السعودي شاملة الضريبة.</p>';
  } else if (t === 'offers'){
    body = offers.length ? '<div class="stack">' + offers.map(function(x){ var left = daysBetween(TODAY, x.end); return '<div class="item">' + '<div class="item-media">' + thumb(x, 'thumb-wide') + '<span class="off tnum">-' + offerPct(x) + '%</span></div><div class="item-body"><b>' + esc(x.title) + '</b><div class="price"><b class="tnum">' + amt(offerFinal(x)) + '</b><span class="muted small">ر.س</span><s class="tnum">' + amt(x.price) + '</s></div><div class="item-meta"><span>' + ic('clock') + 'ينتهي خلال ' + left + ' يوماً · ' + fmtDate(x.end) + '</span></div></div></div>'; }).join('') + '</div>' : empty('tag', 'لا توجد عروض حالياً', '');
  } else {
    body = '<div class="row" style="align-items:center;gap:16px"><div style="text-align:center"><div style="font-family:var(--font-display);font-size:40px;font-weight:600;line-height:1">' + st.rating + '</div>' + stars(st.rating) + '<div class="faint xs">' + st.reviews + ' تقييماً</div></div><div class="grow">' + [[5,78],[4,32],[3,10],[2,5],[1,3]].map(function(r){ return '<div class="hbar" style="grid-template-columns:20px 1fr 30px;padding:2px 0"><span class="tnum">' + r[0] + '</span><div class="meter"><span style="width:' + (r[1] / 128 * 100) + '%;background:var(--warn)"></span></div><span class="tnum faint xs">' + r[1] + '</span></div>'; }).join('') + '</div></div>'
      + [['فهد ق.', 5, 'فحص دقيق وشرح واضح للأعطال، والسعر مثل العرض بالضبط.', '3 أيام'],['سارة د.', 4, 'خدمة سريعة. التأخير كان بسيطاً بسبب الزحام.', 'أسبوع'],['محمد ع.', 5, 'أفضل ورشة تعاملت معها في العليا.', 'أسبوعين']].map(function(r){ return '<div class="review"><div class="row-between"><b class="small">' + r[0] + '</b>' + stars(r[1]) + '</div><p class="small">' + r[2] + '</p><span class="faint xs">منذ ' + r[3] + ' · زيارة موثّقة بفاتورة</span></div>'; }).join('');
  }
  return '<div class="sp">' + '<div class="sp-cover">' + (st.gallery && st.gallery[0] ? '<img src="' + st.gallery[0] + '" alt="">' : ic('wrench')) + '</div>'
    + '<div class="sp-head">' + storeLogo(st, 'xl') + '<h2>' + esc(st.name) + '</h2><div class="chips">' + st.activities.map(function(a){ return pill(esc(a), 'brand'); }).join('') + '</div><div class="meta-line">' + stars(st.rating) + '<b>' + st.rating + '</b><span class="faint">(' + st.reviews + ')</span><span class="faint">·</span>' + ic('pin') + st.distance + '<span class="faint">·</span>' + (on.open ? pill('مفتوح الآن', 'ok') : pill('مغلق الآن', 'bad')) + '</div></div>'
    + '<div class="sp-actions"><button data-act="custCall">' + ic('phone') + 'اتصال</button><button data-act="custWa">' + ic('whatsapp') + 'واتساب</button><button data-act="soon" data-msg="يفتح تطبيق الخرائط على موقع المحل">' + ic('route') + 'الاتجاهات</button><button data-act="copy" data-v="' + storeLink() + '" data-msg="تم نسخ رابط المحل">' + ic('share') + 'مشاركة</button></div>'
    + '<div class="sp-body">' + tabs('sp', [['overview','نظرة عامة'],['prices','الخدمات والأسعار'],['offers','العروض',null,offers.length],['reviews','التقييمات']], 'overview') + body + '</div></div>';
}
ACT.custCall = function(){ openModal(modalHead('الاتصال بالمحل') + '<div class="modal-body"><p class="muted small">انسخ الرقم أو اضغط عليه من جوالك.</p><div class="row-between card card-tight"><b class="tnum" style="font-size:20px;user-select:all">' + D.store.phone + '</b><button class="btn btn-outline btn-sm" data-act="copy" data-v="' + D.store.phone + '" data-msg="تم نسخ الرقم">' + ic('copy') + ' نسخ</button></div><a class="btn btn-primary" href="tel:' + D.store.phone + '">' + ic('phone') + ' اتصال</a></div>'); };
ACT.custWa = function(){ var n = '966' + D.store.whatsapp.slice(1); openModal(modalHead('مراسلة عبر واتساب') + '<div class="modal-body"><div class="row-between card card-tight"><b class="tnum" style="font-size:20px;user-select:all">' + D.store.whatsapp + '</b><button class="btn btn-outline btn-sm" data-act="copy" data-v="' + D.store.whatsapp + '" data-msg="تم نسخ الرقم">' + ic('copy') + ' نسخ</button></div><a class="btn btn-primary" href="https://wa.me/' + n + '" target="_blank" rel="noopener">' + ic('whatsapp') + ' فتح واتساب</a><p class="faint xs">أو راسل المحل من صندوق الوارد في تطبيق وصلة لتبقى المحادثة محفوظة.</p></div>'); };

function renderCustomer(){
  var v = S.c.view;
  return '<main class="cust-wrap"><div class="seg" role="tablist" aria-label="طريقة العرض">' + [['app','صفحة المحل داخل التطبيق'],['web','صفحة الويب عند مسح الباركود']].map(function(x){ return '<button role="tab" aria-selected="' + (v === x[0]) + '" class="' + (v === x[0] ? 'on' : '') + '" data-act="setv" data-path="S.c.view" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>'
    + '<div class="phone">' + (v === 'app' ? custApp() : custWeb()) + '</div>'
    + '<p class="cust-note">' + (v === 'app' ? 'هكذا يظهر ملف المحل للعميل داخل تطبيق وصلة. أي تعديل يحفظه التاجر في «الملف الشخصي للمحل» يظهر هنا.' : 'تظهر هذه الصفحة عند مسح رمز المحل من جوال لم يُثبَّت عليه تطبيق وصلة. يُسجّل الخادم حدث المسح فقط، ولا يعدّه زيارة أو شراء.') + '</p></main>';
}
function custApp(){
  return '<div class="phone-bar"><button class="icon-btn" data-surface="merchant" aria-label="رجوع">' + ic('chevR') + '</button><h3>' + esc(D.store.name) + '</h3><button class="icon-btn" data-act="soon" data-msg="أُضيف المحل إلى المفضلة" aria-label="المفضلة">' + ic('heart') + '</button></div>'
    + storePublic(D.store)
    + '<nav class="phone-nav" aria-hidden="true"><span>' + ic('home') + 'الرئيسية</span><span class="on">' + ic('grid') + 'القائمة</span><span>' + ic('message') + 'صندوق الوارد</span><span>' + ic('user') + 'حسابي</span></nav>';
}
function custWeb(){
  var st = D.store, offers = D.offers.filter(function(o){ return o.status === 'active'; });
  if (S.webConsent == null) S.webConsent = false;
  return '<div class="browser-bar">' + ic('lock') + '<span>wasla.sa/s/' + st.id + '</span></div>'
    + '<div class="web-land"><div class="row" style="justify-content:center;gap:10px">' + logoMark().replace('class="mark"', 'class="mark" style="width:30px;height:36px"') + '<b style="font-family:var(--font-display);font-size:20px">وصلة</b></div>'
    + '<div class="card stack" style="align-items:center;text-align:center">' + storeLogo(st, 'lg') + '<h2>' + esc(st.name) + '</h2><div class="meta-line" style="justify-content:center">' + stars(st.rating) + st.rating + '<span class="faint">·</span>' + esc(st.district) + '</div><p class="small muted">' + esc(st.desc).slice(0, 140) + '…</p></div>'
    + (offers.length ? '<div class="card card-tight stack-sm"><b class="small">عروض المحل الآن</b>' + offers.map(function(o){ return '<div class="row-between small"><span>' + esc(o.title) + '</span><b class="tnum">' + amt(offerFinal(o)) + ' ر.س</b></div>'; }).join('') + '</div>' : '')
    + '<button class="btn btn-primary btn-lg btn-block" data-act="setv" data-path="S.c.view" data-v="app">افتح المحل في تطبيق وصلة</button>'
    + '<div class="store-badges"><button data-act="soon" data-msg="يفتح صفحة التطبيق في App Store">حمّل من<b>App Store</b></button><button data-act="soon" data-msg="يفتح صفحة التطبيق في Google Play">احصل عليه من<b>Google Play</b></button></div>'
    + '<div class="card card-tight stack-sm"><b class="small">لديك حساب في وصلة؟</b><label class="check"><input type="checkbox" data-bind="S.webConsent" data-rerender' + (S.webConsent ? ' checked' : '') + '><span class="small">أوافق على ربط عملية المسح بحسابي لاحتساب مزايا المحل، وفق سياسة الخصوصية.</span></label>' + (S.webConsent ? note('ok', 'سيُربط المسح بحسابك بعد تسجيل الدخول.') : '<p class="faint xs">بدون موافقتك لا يُربط المسح بأي حساب.</p>') + '</div>'
    + '<p class="faint xs" style="text-align:center">سُجّل حدث مسح للرمز. لا يُعد ذلك زيارة للمحل أو عملية شراء.</p></div>';
}
