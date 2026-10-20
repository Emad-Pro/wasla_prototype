/* ===== screen map (index of the prototype against the requirements document) ===== */
const MAP = [
  ['تسجيل دخول التاجر', 'القسم 1', [['اختيار نوع الحساب','merchant','role'],['تسجيل الدخول بثلاث طرق','merchant','login'],['استعادة كلمة المرور','merchant','forgot','forgot']]],
  ['إنشاء حساب تاجر', 'القسم 2', [['التسجيل على ثلاث مراحل','merchant','register','reg'],['حالة الحساب بعد الإرسال','merchant','accountStatus']]],
  ['الملف الشخصي للمحل', 'القسم 3', [['الملف كما يراه العميل','merchant','profile','','profile','preview'],['تعديل الملف الشخصي','merchant','profile','','profile','edit'],['صفحة المحل في تطبيق العميل','customer','app']]],
  ['لوحة التحكم الرئيسية', 'القسم 4', [['لوحة التاجر','merchant','dashboard']]],
  ['المنتجات والخدمات', 'القسم 5', [['قائمة المنتجات والخدمات','merchant','products'],['إضافة منتج أو خدمة','merchant','productForm','product']]],
  ['العروض والإعلانات', 'القسم 6', [['العروض بحالاتها الست','merchant','offers'],['إضافة عرض جديد','merchant','offerForm','offer']]],
  ['الترويج بالنقاط', 'القسم 7', [['الحملات وتكلفة الترويج','merchant','promo'],['روّج الآن','merchant','promoNew','promo'],['تقرير حملة','merchant','campaign','camp']]],
  ['محفظة النقاط والشحن', 'القسم 8', [['الرصيد والباقات','merchant','wallet'],['شحن النقاط وبوابة الدفع','merchant','wallet','charge'],['سجل حركة النقاط','merchant','wallet','','wallet','ledger']]],
  ['باركود المحل وجذب العملاء', 'القسمان 9 و10', [['الباركود والإحصائيات والمكافآت','merchant','qr'],['صفحة الويب عند المسح','customer','web']]],
  ['الفواتير والالتزام بالهيئة', 'القسمان 10 و11', [['مركز الفواتير','merchant','invoices'],['إصدار فاتورة جديدة','merchant','invoiceNew','invoice'],['عرض فاتورة برمز QR','merchant','invoiceView'],['سجل الفواتير','merchant','invoiceLog'],['إعدادات المنشأة والربط','merchant','invoiceSettings'],['اشتراك الفواتير','merchant','invoiceSub']]],
  ['إدارة العملاء', 'القسم 12', [['قائمة العملاء والبحث','merchant','customers'],['ملف عميل وسجل فواتيره','merchant','customer']]],
  ['إدارة المخزون', 'القسم 13', [['الأصناف وتنبيهات النقص','merchant','inventory','','inv','items'],['حركات المخزون','merchant','inventory','','inv','moves'],['المشتريات والمرتجعات','merchant','inventory','','inv','purchases'],['تقارير المخزون','merchant','inventory','','inv','reports']]],
  ['المساعد الذكي', 'القسمان 14 و15', [['قراءة فاتورة مورد','merchant','ai'],['مراجعة النتائج قبل الاعتماد','merchant','ai','aiReview'],['باقة الذكاء الاصطناعي','merchant','settings','','settings','subs']]],
  ['الرسائل والإشعارات', 'القسم 16', [['مركز الإشعارات','merchant','inbox','','inbox','notes'],['المحادثات مع العملاء','merchant','inbox','','inbox','msgs']]],
  ['لوحة إدارة وصلة', 'القسم 17', [['نظرة عامة','admin','overview'],['مراجعة طلبات التجار','admin','merchants'],['مراجعة العروض والحملات','admin','moderation'],['إعدادات الترويج','admin','promoSettings'],['قواعد النقاط والمكافآت','admin','rewards'],['الحالات المشبوهة','admin','fraud'],['الباقات والأسعار','admin','packages'],['المالية والتقارير','admin','finance'],['تكلفة الذكاء الاصطناعي','admin','aiCost'],['العمليات الفاشلة','admin','ops']]],
  ['الأمان والصلاحيات', 'القسم 18', [['صلاحيات موظفي المحل','merchant','settings','','settings','staff'],['أمان حساب التاجر','merchant','settings','','settings','security'],['صلاحيات فريق الإدارة','admin','admins'],['سجل التدقيق','admin','audit']]]
];
function renderMap(){
  var journey = [['اختيار الحساب','العميل أو التاجر'],['التسجيل','3 مراحل وتوثيق الجوال'],['مراجعة الإدارة','اعتماد أو استكمال أو رفض'],['الاعتماد','50 نقطة مجانية مرة واحدة'],['الملف والمنتجات','الصور والخدمات والأسعار'],['العروض والترويج','موافقة ثم ظهور للعملاء'],['الباركود','مسح وتسجيل وزيارات ومكافآت'],['الفواتير والمخزون','إصدار وربط بالهيئة وتحديث الكميات']];
  return '<main class="map-page">'
    + '<section class="map-hero"><div class="stack"><span class="pill pill-brand" style="align-self:flex-start">نموذج واجهات تفاعلي</span><h1>وصلة: واجهة التاجر ولوحة الإدارة</h1><p>نموذج للواجهات الأمامية فقط، مبني على وثيقة المتطلبات الفنية لواجهة التاجر. كل الأزرار تعمل على بيانات توضيحية داخل المتصفح، ولا يتصل النموذج بخادم أو بوابة دفع أو هيئة الزكاة فعلياً.</p>'
    + '<div class="row"><button class="btn btn-primary btn-lg" data-act="jump" data-s="merchant" data-scr="role">ابدأ رحلة التاجر ' + ic('chevL') + '</button><button class="btn btn-outline btn-lg" data-act="jump" data-s="merchant" data-scr="dashboard">ادخل لوحة التاجر مباشرة</button></div></div>'
    + '<div class="card stack"><h3>ما الذي يحاكيه النموذج؟</h3><div class="list">' + [['credit card','بوابة الدفع: أزرار نجاح وفشل وتكرار إشعار الدفع'],['receipt','الهيئة: رمز QR حقيقي بصيغة TLV، والإبلاغ والاعتماد بمحاكاة'],['sparkles','المساعد الذكي: قراءة مستند نموذجي بنتائج تحتاج مراجعة'],['bell','الإشعارات والرسائل: تتحدث مع أفعالك في النموذج']].map(function(x){ return '<div class="list-row small"><span class="list-ic tone-neutral">' + ic(x[0] === 'credit card' ? 'wallet' : x[0]) + '</span>' + x[1] + '</div>'; }).join('') + '</div><p class="faint xs">زر «إعادة البيانات» في الشريط العلوي يعيد كل شيء لحالته الأولى.</p></div></section>'
    + '<section class="surface-cards">' + [['merchant','store','تطبيق التاجر','14 قسماً: من التسجيل إلى الفواتير والمخزون والمساعد الذكي. يعمل على الجوال والتابلت والكمبيوتر.'],['admin','shield','لوحة إدارة وصلة','اعتماد التجار، مراجعة المحتوى، أسعار النقاط والمكافآت، المالية وتكلفة الذكاء الاصطناعي.'],['customer','user','واجهة العميل','صفحة المحل داخل التطبيق، وصفحة الويب التي تظهر عند مسح الباركود دون تطبيق.']].map(function(x){ return '<button class="surface-card" data-surface="' + x[0] + '">' + ic(x[1]) + '<b>' + x[2] + '</b><small>' + x[3] + '</small></button>'; }).join('') + '</section>'
    + '<section class="stack"><h2>رحلة التاجر</h2><div class="flow">' + journey.map(function(j, i){ return '<div class="flow-step"><span class="n">' + (i + 1) + '</span><b>' + j[0] + '</b><small>' + j[1] + '</small></div>'; }).join('') + '</div></section>'
    + '<section class="stack"><h2>كل الشاشات حسب أقسام الوثيقة</h2><div class="idx">' + MAP.map(function(sec){ return '<div class="idx-sec"><h3>' + sec[0] + ' <small>' + sec[1] + '</small></h3>' + sec[2].map(function(l){ return '<button class="idx-link" data-act="jump" data-s="' + l[1] + '" data-scr="' + l[2] + '" data-setup="' + (l[3] || '') + '" data-tk="' + (l[4] || '') + '" data-tv="' + (l[5] || '') + '"><span>' + l[0] + '</span>' + ic('chevL') + '</button>'; }).join('') + '</div>'; }).join('') + '</div></section>'
    + '</main>';
}
ACT.jump = function(el){
  var s = el.getAttribute('data-s'), scr = el.getAttribute('data-scr'), setup = el.getAttribute('data-setup'), tk = el.getAttribute('data-tk'), tv = el.getAttribute('data-tv');
  if (tk) S.tab[tk] = tv;
  if (s === 'customer'){ S.c.view = scr; setSurface('customer'); return; }
  if (s === 'admin'){ S.surface = 'admin'; try { history.replaceState(null, '', '#admin'); } catch(e) {} goA(scr); return; }
  S.surface = 'merchant'; try { history.replaceState(null, '', '#merchant'); } catch(e) {}
  if (AUTH.indexOf(scr) < 0){ S.m.authed = true; if (D.store.status !== 'approved') D.store.status = 'approved'; }
  if (scr === 'accountStatus') S.acctView = 'pending';
  if (setup === 'forgot') return ACT.startForgot();
  if (setup === 'reg') return ACT.startReg();
  if (setup === 'product') return ACT.newProduct();
  if (setup === 'offer') return ACT.newOffer();
  if (setup === 'promo') return ACT.newPromo();
  if (setup === 'invoice') return ACT.newInvoice();
  if (setup === 'camp') return go('campaign', {id:'C1'});
  if (setup === 'charge'){ go('wallet'); ACT.openCharge(); return; }
  if (setup === 'aiReview'){ S.ai = aiSample(); go('ai'); return; }
  if (scr === 'invoiceView') return go('invoiceView', {id:'INV-2026-000148'});
  if (scr === 'customer') return go('customer', {id:'CU2'});
  go(scr);
};
