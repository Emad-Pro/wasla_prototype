/* Sample data for the prototype. Everything here is illustrative and resets with "إعادة البيانات". */
const TODAY = '2026-10-21';
const ACTIVITIES = ['ورش السيارات','قطع الغيار','محلات الزينة والإكسسوارات','مغاسل السيارات','الإطارات والبنشر','مراكز الصيانة وتغيير الزيوت','زجاج السيارات','كهرباء السيارات','السمكرة والدهان','الميزان وترصيص الإطارات','الخدمات المتنقلة','السطحات ونقل السيارات'];
const SERVICES = ['ميكانيكا عامة','تغيير زيت وفلاتر','فحص كمبيوتر','صيانة فرامل','كهرباء سيارات','تكييف السيارات','إطارات وبطاريات','سمكرة ودهان','ميزان وترصيص','غسيل وتلميع','تظليل وحماية','زجاج السيارات','سطحة ونقل'];
const CITIES = ['الرياض','جدة','مكة المكرمة','المدينة المنورة','الدمام','الخبر','القصيم','أبها','تبوك'];
const PCATS = ['صيانة دورية','فحص','فرامل','تكييف','فلاتر','زيوت','بطاريات','إشعال','سوائل','إكسسوارات'];
const DAYS = ['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'];

function defaultHours(){
  return DAYS.map(function(d, i){
    if (i === 6) return {d:d, open:true, from:'16:00', to:'23:00'};
    if (i === 5) return {d:d, open:true, from:'08:00', to:'23:00'};
    return {d:d, open:true, from:'08:00', to:'22:00'};
  });
}

function seed(){
  return {
    store:{
      id:'NKB4821', name:'ورشة النخبة لصيانة السيارات', owner:'عبدالله الحربي',
      cr:'1010654321', vat:'310123456700003', phone:'0551234567', phones:['0112345678'],
      whatsapp:'0551234567', email:'info@alnokhba-auto.sa', website:'alnokhba-auto.sa',
      city:'الرياض', district:'حي العليا', street:'طريق الملك فهد، مبنى 7421',
      pin:{x:57,y:46}, activities:['ورش السيارات','قطع الغيار'],
      services:['ميكانيكا عامة','تغيير زيت وفلاتر','فحص كمبيوتر','صيانة فرامل','كهرباء سيارات','تكييف السيارات'],
      desc:'ورشة متكاملة لصيانة السيارات اليابانية والكورية منذ 2012. فحص كمبيوتر دقيق، قطع غيار أصلية بضمان، وفنيون معتمدون. نستقبل السيارات بموعد أو بدون موعد.',
      status:'approved', logo:null, gallery:[], hours:defaultHours(),
      visits30:1284, customers:342, rating:4.7, reviews:128, distance:'2.4 كم'
    },
    visits14:[64,71,58,80,92,77,69,88,95,102,84,79,110,97],
    products:[
      {id:'P1', type:'service', name:'تغيير زيت مع فلتر', cat:'صيانة دورية', desc:'زيت تخليقي بالكامل حتى 5 لتر مع فلتر أصلي وفحص السوائل.', price:220, sale:179, avail:true, hidden:false, imgs:[]},
      {id:'P2', type:'service', name:'فحص كمبيوتر شامل', cat:'فحص', desc:'قراءة أعطال جميع الأنظمة مع تقرير مطبوع.', price:150, sale:null, avail:true, hidden:false, imgs:[]},
      {id:'P3', type:'service', name:'تبديل فحمات فرامل أمامية', cat:'فرامل', desc:'شامل الأجرة وفحص الهوبات.', price:260, sale:null, avail:true, hidden:false, imgs:[]},
      {id:'P4', type:'product', name:'فلتر زيت تويوتا أصلي', cat:'فلاتر', desc:'متوافق مع كامري وكورولا وراف فور.', price:45, sale:null, avail:true, hidden:false, inv:'I1', imgs:[]},
      {id:'P5', type:'product', name:'زيت موبيل 1 ‎5W-30 (4 لتر)', cat:'زيوت', desc:'زيت تخليقي بالكامل.', price:185, sale:165, avail:true, hidden:false, inv:'I2', imgs:[]},
      {id:'P6', type:'product', name:'بطارية أمرون 70 أمبير', cat:'بطاريات', desc:'ضمان 18 شهراً مع التركيب.', price:420, sale:null, avail:false, hidden:false, inv:'I5', imgs:[]},
      {id:'P7', type:'service', name:'تعبئة فريون المكيف', cat:'تكييف', desc:'فحص تسريب وتعبئة فريون.', price:180, sale:null, avail:true, hidden:true, imgs:[]}
    ],
    inventory:[
      {id:'I1', name:'فلتر زيت تويوتا أصلي', sku:'FLT-TY-01', barcode:'6281100450012', cat:'فلاتر', qty:38, buy:28, sell:45, sup:'S1', added:'2026-03-12', min:10, active:true},
      {id:'I2', name:'زيت موبيل 1 ‎5W-30 (4 لتر)', sku:'OIL-MB-530', barcode:'6281100450029', cat:'زيوت', qty:6, buy:132, sell:185, sup:'S2', added:'2026-03-12', min:10, active:true},
      {id:'I3', name:'فحمات فرامل أمامية كامري', sku:'BRK-CM-F', barcode:'6281100450036', cat:'فرامل', qty:14, buy:95, sell:160, sup:'S1', added:'2026-04-02', min:6, active:true},
      {id:'I4', name:'شمعات احتراق NGK (طقم 4)', sku:'SPK-NGK-4', barcode:'6281100450043', cat:'إشعال', qty:22, buy:60, sell:110, sup:'S1', added:'2026-04-02', min:8, active:true},
      {id:'I5', name:'بطارية أمرون 70 أمبير', sku:'BAT-AM-70', barcode:'6281100450050', cat:'بطاريات', qty:0, buy:310, sell:420, sup:'S3', added:'2026-05-18', min:3, active:true},
      {id:'I6', name:'فلتر مكيف هيونداي', sku:'FLT-HY-AC', barcode:'6281100450067', cat:'فلاتر', qty:4, buy:22, sell:40, sup:'S1', added:'2026-06-09', min:5, active:true},
      {id:'I7', name:'سائل تبريد أحمر (4 لتر)', sku:'CLT-RD-4', barcode:'6281100450074', cat:'سوائل', qty:17, buy:35, sell:60, sup:'S2', added:'2026-06-09', min:6, active:true},
      {id:'I8', name:'مساحات زجاج بوش 24 بوصة', sku:'WPR-BS-24', barcode:'6281100450081', cat:'إكسسوارات', qty:12, buy:30, sell:55, sup:'S1', added:'2026-07-21', min:4, active:true}
    ],
    suppliers:[
      {id:'S1', name:'شركة الجزيرة لقطع الغيار', phone:'0114433221', vat:'300456789100003'},
      {id:'S2', name:'مؤسسة الوفاء للزيوت', phone:'0126677889', vat:'300112233400003'},
      {id:'S3', name:'مؤسسة الطاقة للبطاريات', phone:'0138899001', vat:''}
    ],
    moves:[
      {at:'2026-10-20T15:15', item:'I7', type:'sale', qty:-2, before:19, after:17, ref:'INV-2026-000148', by:'سعيد الشهري'},
      {at:'2026-10-19T11:10', item:'I4', type:'return', qty:1, before:21, after:22, ref:'CN-2026-000006', by:'سعيد الشهري'},
      {at:'2026-10-19T09:30', item:'I2', type:'ai', qty:12, before:6, after:18, ref:'AI-DOC-031', by:'عبدالله الحربي', note:'مساعد ذكي'},
      {at:'2026-10-19T09:31', item:'I2', type:'adjust', qty:-12, before:18, after:6, ref:'ADJ-0042', by:'عبدالله الحربي', note:'تصحيح: الشحنة لم تُستلم بعد'},
      {at:'2026-10-18T19:30', item:'I3', type:'sale', qty:-1, before:15, after:14, ref:'INV-2026-000146', by:'ياسر المالكي'},
      {at:'2026-10-16T12:05', item:'I4', type:'sale', qty:-1, before:22, after:21, ref:'INV-2026-000145', by:'ياسر المالكي'},
      {at:'2026-10-14T17:45', item:'I6', type:'sale', qty:-1, before:5, after:4, ref:'INV-2026-000144', by:'ياسر المالكي'},
      {at:'2026-10-12T10:20', item:'I1', type:'sale', qty:-3, before:41, after:38, ref:'INV-2026-000143', by:'سعيد الشهري'},
      {at:'2026-10-05T13:00', item:'I1', type:'purchase', qty:24, before:17, after:41, ref:'SUP-J-88213', by:'عبدالله الحربي'}
    ],
    offers:[
      {id:'O1', title:'خصم 20% على تغيير الزيت والفلتر', desc:'زيت تخليقي بالكامل مع فلتر أصلي وفحص مجاني للسوائل والإطارات.', type:'تغيير زيت وفلاتر', price:220, mode:'pct', pct:20, special:null, start:'2026-10-10', end:'2026-11-10', times:null, imgs:[], status:'active', views:2140, clicks:318},
      {id:'O2', title:'فحص كمبيوتر شامل بـ 99 ريال', desc:'قراءة أعطال جميع الأنظمة مع تقرير مطبوع وشرح من الفني.', type:'فحص كمبيوتر', price:150, mode:'fixed', pct:null, special:99, start:'2026-10-15', end:'2026-11-15', times:{from:'08:00', to:'16:00'}, imgs:[], status:'active', views:986, clicks:141},
      {id:'O3', title:'باقة صيانة الشتاء', desc:'فحص البطارية والتكييف والإطارات وتغيير سائل التبريد.', type:'ميكانيكا عامة', price:450, mode:'pct', pct:15, special:null, start:'2026-11-01', end:'2026-12-31', times:null, imgs:[], status:'review', submitted:'2026-10-20T16:40'},
      {id:'O4', title:'خصم على تبديل الفرامل', desc:'تبديل فحمات أمامية مع خراطة الهوبات.', type:'صيانة فرامل', price:380, mode:'pct', pct:25, special:null, start:'2026-09-25', end:'2026-10-25', times:null, imgs:[], status:'rejected', reason:'الصورة تتضمن رقم تواصل خارجي. أزل الرقم من الصورة ثم أعد إرسال العرض.'},
      {id:'O5', title:'عرض اليوم الوطني: فحص شامل', desc:'فحص 50 نقطة بسعر رمزي.', type:'فحص كمبيوتر', price:200, mode:'fixed', pct:null, special:95, start:'2026-09-20', end:'2026-09-30', times:null, imgs:[], status:'expired', views:3410, clicks:507},
      {id:'O6', title:'تعبئة فريون المكيف بـ 129 ريال', desc:'فحص تسريب وتعبئة كاملة.', type:'تكييف السيارات', price:180, mode:'fixed', pct:null, special:129, start:'2026-10-01', end:'2026-10-31', times:null, imgs:[], status:'paused', views:412, clicks:38},
      {id:'O7', title:'عرض البطاريات مع التركيب', desc:'', type:'إطارات وبطاريات', price:420, mode:'pct', pct:10, special:null, start:'', end:'', times:null, imgs:[], status:'draft'}
    ],
    campaigns:[
      {id:'C1', target:'O1', targetName:'خصم 20% على تغيير الزيت والفلتر', kind:'image', days:7, pts:15, status:'active', start:'2026-10-18', end:'2026-10-25', impressions:5320, clicks:412, visits:168, daily:[610,742,803,690,880,795,800]},
      {id:'C2', target:'O2', targetName:'فحص كمبيوتر شامل بـ 99 ريال', kind:'image', days:4, pts:10, status:'approved', start:'2026-10-23', end:'2026-10-27', impressions:0, clicks:0, visits:0},
      {id:'C3', target:'V1', targetName:'فيديو: جولة داخل الورشة', kind:'video', days:7, pts:30, status:'review', start:'2026-10-24', end:'2026-10-31', impressions:0, clicks:0, visits:0},
      {id:'C4', target:'O4', targetName:'خصم على تبديل الفرامل', kind:'image', days:4, pts:10, status:'rejected', start:'2026-09-26', end:'2026-09-30', reason:'العرض المرتبط بالحملة مرفوض، لذلك لا يمكن ترويجه.', refunded:10, impressions:0, clicks:0, visits:0},
      {id:'C5', target:'O5', targetName:'عرض اليوم الوطني: فحص شامل', kind:'image', days:7, pts:15, status:'completed', start:'2026-09-23', end:'2026-09-30', impressions:8410, clicks:603, visits:251, daily:[980,1150,1290,1240,1310,1200,1240]},
      {id:'C6', target:'P5', targetName:'زيت موبيل 1 ‎5W-30 (4 لتر)', kind:'image', days:4, pts:10, status:'paused', start:'2026-10-02', end:'2026-10-06', impressions:1210, clicks:74, visits:22, note:'أوقفها التاجر في اليوم الثاني بسبب نفاد الكمية.'},
      {id:'C7', target:'P1', targetName:'تغيير زيت مع فلتر', kind:'image', days:4, pts:10, status:'draft', start:'', end:'', impressions:0, clicks:0, visits:0}
    ],
    ledger:[
      {id:'TX-10001', at:'2026-08-02T10:00', cat:'free', pts:50, reason:'مكافأة اعتماد الحساب (مرة واحدة)', ref:'ACC-NKB4821', status:'done'},
      {id:'TX-10002', at:'2026-08-05T13:12', cat:'purchased', pts:300, reason:'شحن باقة 300 نقطة', ref:'PAY-7F3K21', status:'done'},
      {id:'TX-10003', at:'2026-08-14T17:20', cat:'earned', pts:5, reason:'تسجيل عميل جديد عبر رمز المحل', ref:'QR-EV-1192', status:'done'},
      {id:'TX-10004', at:'2026-08-14T18:02', cat:'earned', pts:5, reason:'زيارة مؤهلة', ref:'QR-EV-1197', status:'done'},
      {id:'TX-10005', at:'2026-09-10T12:40', cat:'earned', pts:5, reason:'تسجيل عميل جديد عبر رمز المحل', ref:'QR-EV-1260', status:'done'},
      {id:'TX-10006', at:'2026-09-22T09:00', cat:'used', pts:-15, reason:'حملة «عرض اليوم الوطني» لمدة 7 أيام', ref:'C5', status:'done'},
      {id:'TX-10007', at:'2026-09-25T15:30', cat:'used', pts:-10, reason:'حملة «خصم على تبديل الفرامل» لمدة 4 أيام', ref:'C4', status:'done'},
      {id:'TX-10008', at:'2026-09-26T10:05', cat:'refunded', pts:10, reason:'استرجاع: رفض الحملة C4', ref:'C4', status:'done'},
      {id:'TX-10009', at:'2026-10-01T20:15', cat:'used', pts:-10, reason:'حملة «زيت موبيل 1» لمدة 4 أيام', ref:'C6', status:'done'},
      {id:'TX-10010', at:'2026-10-05T11:00', cat:'correction', pts:-5, reason:'حركة تصحيحية: مكافأة زيارة احتُسبت مرتين (TX-10004)', ref:'TX-10004', status:'done'},
      {id:'TX-10011', at:'2026-10-12T19:44', cat:'earned', pts:5, reason:'زيارة مؤهلة', ref:'QR-EV-1318', status:'done'},
      {id:'TX-10012', at:'2026-10-17T16:20', cat:'earned', pts:5, reason:'تسجيل عميل جديد عبر رمز المحل', ref:'QR-EV-1342', status:'done'},
      {id:'TX-10013', at:'2026-10-18T08:30', cat:'used', pts:-15, reason:'حملة «خصم 20% على تغيير الزيت» لمدة 7 أيام', ref:'C1', status:'done'},
      {id:'TX-10014', at:'2026-10-19T09:30', cat:'used', pts:-2, reason:'قراءة فاتورة مورد بالمساعد الذكي', ref:'AI-DOC-031', status:'done'},
      {id:'TX-10015', at:'2026-10-20T11:15', cat:'used', pts:-10, reason:'حملة «فحص كمبيوتر بـ 99 ريال» لمدة 4 أيام', ref:'C2', status:'done'},
      {id:'TX-10016', at:'2026-10-20T21:05', cat:'used', pts:-30, reason:'حجز نقاط لحملة فيديو قيد المراجعة (تُسترجع عند الرفض)', ref:'C3', status:'held'}
    ],
    charges:[
      {ref:'PAY-7F3K21', pts:300, amount:129, method:'مدى', at:'2026-08-05T13:11', status:'success'},
      {ref:'PAY-9Q2M77', pts:100, amount:49, method:'Apple Pay', at:'2026-09-14T22:03', status:'failed', note:'رفض البنك المُصدر العملية. لم يُخصم أي مبلغ.'},
      {ref:'PAY-3C8N40', pts:100, amount:49, method:'بطاقة ائتمانية', at:'2026-09-15T09:47', status:'refunded', note:'خصم مكرر من البنك. أُعيد المبلغ ولم تُضف نقاط مرتين.'}
    ],
    qr:{scans:186, signups:4, visits:3, purchases:9, earned:25, pending:2},
    qrEvents:[
      {at:'2026-10-21T11:42', ev:'scan', who:'زائر بدون حساب', reward:'none'},
      {at:'2026-10-21T11:44', ev:'signup', who:'عميل ••• 4421', reward:'pending', note:'تحقق آلي من رقم الجوال قيد التنفيذ'},
      {at:'2026-10-20T18:05', ev:'visit', who:'عميل ••• 1187', reward:'earned'},
      {at:'2026-10-20T18:31', ev:'purchase', who:'عميل ••• 1187', reward:'none', note:'فاتورة INV-2026-000147'},
      {at:'2026-10-20T20:10', ev:'visit', who:'عميل ••• 1187', reward:'pending', note:'زيارة ثانية خلال 3 ساعات'},
      {at:'2026-10-19T13:22', ev:'scan', who:'عميل ••• 9034', reward:'none'},
      {at:'2026-10-18T16:47', ev:'signup', who:'عميل ••• 7710', reward:'rejected', note:'الحساب مسجّل مسبقاً عبر متجر آخر'}
    ],
    customers:[
      {id:'CU1', name:'محمد العتيبي', phone:'0501112233', email:'m.otaibi@example.com', vat:'', notes:'كامري 2019. يفضّل التواصل عبر واتساب.', since:'2026-08-10'},
      {id:'CU2', name:'شركة الأفق للنقليات', phone:'0114567890', email:'fleet@example.com', vat:'300987654300003', notes:'أسطول 12 سيارة. فاتورة ضريبية باسم الشركة.', since:'2026-08-22'},
      {id:'CU3', name:'فهد القحطاني', phone:'0559988776', email:'', vat:'', notes:'', since:'2026-09-03'},
      {id:'CU4', name:'سارة الدوسري', phone:'0533344556', email:'sara.d@example.com', vat:'', notes:'', since:'2026-09-17'},
      {id:'CU5', name:'مؤسسة البناء الحديث', phone:'0126655443', email:'acc@example.com', vat:'301112223300003', notes:'العنوان الوطني: جدة، حي الروضة.', since:'2026-10-01'},
      {id:'CU6', name:'خالد الزهراني', phone:'0567788990', email:'', vat:'', notes:'', since:'2026-10-11'}
    ],
    invoices:[
      {no:'INV-2026-000143', icv:143, kind:'tax', cust:'CU2', at:'2026-10-12T10:20', status:'cleared', uuid:'3f8c2a1e-6b4d-4c2f-9a7e-1d5b8c0e4a21', lines:[{name:'صيانة دورية لسيارات الأسطول', qty:3, price:450, disc:0, vat:15},{name:'فلتر زيت تويوتا أصلي', qty:3, price:45, disc:0, vat:15, inv:'I1'}]},
      {no:'INV-2026-000144', icv:144, kind:'simplified', cust:'CU1', at:'2026-10-14T17:45', status:'reported', uuid:'a91d7c3b-2e5f-4b8a-8c6d-7e2f1a9b3c45', lines:[{name:'تغيير زيت مع فلتر (عرض 20%)', qty:1, price:176, disc:0, vat:15},{name:'فلتر مكيف هيونداي', qty:1, price:40, disc:0, vat:15, inv:'I6'}]},
      {no:'INV-2026-000145', icv:145, kind:'simplified', cust:'CU3', at:'2026-10-16T12:05', status:'reported', uuid:'c47e9b2d-8f1a-4d3c-b6e5-2a9c7d1f8e63', lines:[{name:'فحص كمبيوتر شامل', qty:1, price:150, disc:51, vat:15},{name:'شمعات احتراق NGK (طقم 4)', qty:1, price:110, disc:0, vat:15, inv:'I4'}]},
      {no:'INV-2026-000146', icv:146, kind:'simplified', cust:'CU4', at:'2026-10-18T19:30', status:'reported', uuid:'e2b5d8f1-3c7a-4e9b-a1d4-6f8c2b5e9a17', lines:[{name:'تبديل فحمات فرامل أمامية', qty:1, price:260, disc:0, vat:15},{name:'فحمات فرامل أمامية كامري', qty:1, price:160, disc:0, vat:15, inv:'I3'}]},
      {no:'CN-2026-000006', icv:147, kind:'credit', ref:'INV-2026-000145', cust:'CU3', at:'2026-10-19T11:10', status:'reported', uuid:'7d1a4c9e-5b2f-4a8d-9e3c-1b6f4d8a2c59', reason:'مرتجع: شمعات غير مطابقة لموديل السيارة', lines:[{name:'شمعات احتراق NGK (طقم 4)', qty:1, price:110, disc:0, vat:15, inv:'I4'}]},
      {no:'INV-2026-000147', icv:148, kind:'simplified', cust:'CU6', at:'2026-10-20T18:31', status:'queued', uuid:'9b6e3d2a-1f8c-4b5e-8d7a-3c2e9f1b6d84', lines:[{name:'تغيير زيت مع فلتر', qty:1, price:179, disc:0, vat:15}]},
      {no:'INV-2026-000148', icv:149, kind:'tax', cust:'CU5', at:'2026-10-20T15:15', status:'cleared', uuid:'5c9f2e7b-4a1d-4c6e-b8f3-9d2a5e7c1b38', lines:[{name:'صيانة مكيف سيارة نقل', qty:2, price:380, disc:40, vat:15},{name:'سائل تبريد أحمر (4 لتر)', qty:2, price:60, disc:0, vat:15, inv:'I7'}]}
    ],
    invSeq:{inv:149, cn:7, dn:1, icv:150},
    invStats:{month:37, sales:16840, vat:2526},
    invSettings:{legalAr:'مؤسسة النخبة لصيانة السيارات', legalEn:'Al Nokhba Auto Maintenance Est.', vat:'310123456700003', cr:'1010654321', building:'7421', street:'طريق الملك فهد', district:'حي العليا', city:'الرياض', postal:'12214', addNo:'3318', lang:'ar-en', rate:15, prefix:'INV'},
    zatca:{phase2:'sandbox', checks:0},
    subs:{
      storePage:{plan:'مجانية خلال فترة الإطلاق', status:'active'},
      invoicing:{plan:'basic', status:'active', since:'2026-08-20', renews:'2026-11-20'},
      aiUsage:{month:31, limit:100}
    },
    aiDocs:[
      {id:'AI-DOC-031', supplier:'مؤسسة الوفاء للزيوت', at:'2026-10-19T09:28', items:6, status:'approved', pts:2},
      {id:'AI-DOC-030', supplier:'شركة الجزيرة لقطع الغيار', at:'2026-10-11T14:02', items:0, status:'failed', pts:0},
      {id:'AI-DOC-029', supplier:'شركة الجزيرة لقطع الغيار', at:'2026-10-20T10:15', items:5, status:'review', pts:0}
    ],
    notifications:[
      {id:'N1', kind:'offer', title:'تم قبول عرضك «فحص كمبيوتر شامل بـ 99 ريال» وأصبح ظاهراً للعملاء', at:'منذ 12 دقيقة', go:'offers', read:false},
      {id:'N2', kind:'stock', title:'انخفاض المخزون: زيت موبيل 1 (متبقٍ 6، والحد الأدنى 10)', at:'اليوم 09:10', go:'inventory', read:false},
      {id:'N3', kind:'review', title:'فاتورة مورد بانتظار مراجعتك في المساعد الذكي', at:'أمس 10:15', go:'ai', read:false},
      {id:'N4', kind:'campaign', title:'بدأت حملتك «خصم 20% على تغيير الزيت» وتنتهي في 25 أكتوبر', at:'18 أكتوبر', go:'promo', read:true},
      {id:'N5', kind:'points', title:'اكتسبت 5 نقاط: تسجيل عميل جديد عبر رمز المحل', at:'17 أكتوبر', go:'wallet', read:true},
      {id:'N6', kind:'goal', title:'اقتربت من هدف المكافآت الشهري: 4 من 20 عميلاً جديداً', at:'17 أكتوبر', go:'qr', read:true},
      {id:'N7', kind:'invoice', title:'فاتورة INV-2026-000147 بانتظار الإبلاغ للهيئة، وستُعاد المحاولة تلقائياً', at:'20 أكتوبر', go:'invoiceLog', read:true},
      {id:'N8', kind:'offer', title:'رُفض عرض «خصم على تبديل الفرامل». اطّلع على السبب وعدّل العرض.', at:'26 سبتمبر', go:'offers', read:true},
      {id:'N9', kind:'charge', title:'فشلت عملية شحن 100 نقطة. لم يُخصم أي مبلغ.', at:'14 سبتمبر', go:'wallet', read:true},
      {id:'N10', kind:'sub', title:'يتجدد اشتراك الفواتير الإلكترونية في 20 نوفمبر 2026', at:'14 سبتمبر', go:'invoiceSub', read:true},
      {id:'N11', kind:'system', title:'تحديث: يمكنك الآن إصدار الفاتورة بالعربية والإنجليزية معاً', at:'2 سبتمبر', go:'invoiceSettings', read:true},
      {id:'N12', kind:'account', title:'تم اعتماد حسابك وإضافة 50 نقطة مجانية إلى محفظتك', at:'2 أغسطس', go:'wallet', read:true}
    ],
    convs:[
      {id:'V1', name:'فهد القحطاني', unread:2, msgs:[
        {from:'c', text:'السلام عليكم، هل يتوفر فحص كمبيوتر اليوم؟', at:'10:12'},
        {from:'m', text:'وعليكم السلام، نعم متاح حتى الساعة 9 مساءً.', at:'10:15', read:true},
        {from:'c', text:'كم يستغرق الفحص تقريباً؟', at:'10:21'},
        {from:'c', text:'وهل عرض 99 ريال يشمل التقرير المطبوع؟', at:'10:22'}]},
      {id:'V2', name:'شركة الأفق للنقليات', unread:1, msgs:[
        {from:'c', text:'نحتاج فاتورة ضريبية باسم الشركة للسيارات الثلاث.', at:'أمس'}]},
      {id:'V3', name:'سارة الدوسري', unread:0, msgs:[
        {from:'m', text:'سيارتك جاهزة للاستلام. تم تبديل الفحمات الأمامية.', at:'18 أكتوبر', read:true},
        {from:'c', text:'تمام، أمرّ عليكم الساعة 5. شكراً لكم.', at:'18 أكتوبر'}]},
      {id:'V4', name:'عميل جديد عبر الباركود', unread:0, msgs:[
        {from:'c', text:'كيف أستفيد من خصم تغيير الزيت؟', at:'16 أكتوبر'},
        {from:'m', text:'اعرض العرض من صفحة المحل عند الاستقبال ويُطبّق الخصم مباشرة.', at:'16 أكتوبر', read:true}]}
    ],
    staff:[
      {id:'U1', name:'عبدالله الحربي', role:'المالك', phone:'0551234567', perms:{invoices:true, inventory:true, offers:true, points:true, messages:true, settings:true}},
      {id:'U2', name:'سعيد الشهري', role:'محاسب', phone:'0544332211', perms:{invoices:true, inventory:true, offers:false, points:false, messages:false, settings:false}},
      {id:'U3', name:'ياسر المالكي', role:'موظف استقبال', phone:'0566554433', perms:{invoices:true, inventory:false, offers:true, points:false, messages:true, settings:false}}
    ],
    settings:{
      promoPricing:[
        {id:'pp1', kind:'image', days:4, pts:10},
        {id:'pp2', kind:'image', days:7, pts:15},
        {id:'pp3', kind:'video', days:4, pts:20},
        {id:'pp4', kind:'video', days:7, pts:30}
      ],
      promoTypes:{image:true, video:true},
      promoReview:true,
      refund:'full_before_start',
      content:{offers:true, products:true, videos:true, external:false},
      rewards:{register:50, signup:5, visit:5, goalOn:true, goalTarget:20, goalBonus:25, dailyCap:10, monthlyCap:150, expiry:'none', geo:true, gap:true, gapHours:24, otp:false},
      packages:[
        {id:'pk1', pts:100, price:49, on:true, tag:''},
        {id:'pk2', pts:300, price:129, on:true, tag:'الأكثر طلباً'},
        {id:'pk3', pts:500, price:199, on:true, tag:''}
      ],
      aiCost:2, aiMonthlyLimit:100,
      plans:[
        {id:'basic', name:'الباقة الأساسية', price:79, limit:500, users:1, feats:['إدارة العملاء','المخزون الأساسي','500 فاتورة شهرياً','سجل الفواتير والإرسال والطباعة']},
        {id:'pro', name:'الباقة الاحترافية', price:149, limit:0, users:5, feats:['كل مزايا الأساسية','فواتير غير محدودة','حتى 5 مستخدمين بصلاحيات','تقارير مبيعات ومخزون متقدمة']}
      ],
      storePageFee:0
    },
    admin:{
      merchants:[
        {id:'M1', name:'ورشة النخبة لصيانة السيارات', owner:'عبدالله الحربي', city:'الرياض', phone:'0551234567', cr:'1010654321', activity:'ورش السيارات، قطع الغيار', status:'approved', at:'2026-07-30', bonus:true, self:true},
        {id:'M2', name:'مركز الإطارات الحديث', owner:'ماجد السبيعي', city:'الرياض', phone:'0503344556', cr:'1010778899', activity:'الإطارات والبنشر', status:'pending', at:'2026-10-20', bonus:false},
        {id:'M3', name:'زينة الفخامة لإكسسوارات السيارات', owner:'نواف العنزي', city:'جدة', phone:'0542211009', cr:'4030556677', activity:'محلات الزينة والإكسسوارات', status:'pending', at:'2026-10-19', bonus:false},
        {id:'M4', name:'مغسلة اللمعة', owner:'حمد الشمري', city:'الدمام', phone:'0538877665', cr:'', activity:'مغاسل السيارات', status:'needs_info', at:'2026-10-15', bonus:false, note:'لم تُرفق صورة واجهة المحل، والموقع على الخريطة غير دقيق.'},
        {id:'M5', name:'قطع غيار الشرق', owner:'سلمان الدوسري', city:'الخبر', phone:'0551199228', cr:'2051334455', activity:'قطع الغيار', status:'rejected', at:'2026-10-09', bonus:false, note:'السجل التجاري منتهي الصلاحية.'},
        {id:'M6', name:'سطحة السريع', owner:'عادل القرني', city:'الرياض', phone:'0569900112', cr:'1010443322', activity:'السطحات ونقل السيارات', status:'suspended', at:'2026-08-14', bonus:true, note:'بلاغات متكررة عن أسعار مضللة في الإعلانات.'},
        {id:'M7', name:'ورشة الأمانة للسمكرة', owner:'فيصل الحربي', city:'مكة المكرمة', phone:'0547766554', cr:'4031998877', activity:'السمكرة والدهان', status:'approved', at:'2026-09-02', bonus:true}
      ],
      queue:{
        offers:[
          {id:'X-O1', merchant:'مركز الإطارات الحديث', title:'اشترِ 3 إطارات واحصل على الرابع مجاناً', desc:'إطارات ميشلان مقاس 17 مع الترصيص.', price:1600, mode:'pct', pct:25, start:'2026-10-25', end:'2026-11-25', submitted:'2026-10-21T08:12', flag:''},
          {id:'X-O2', merchant:'زينة الفخامة لإكسسوارات السيارات', title:'تظليل حراري بخصم 60%', desc:'تظليل نانو سيراميك لكامل السيارة.', price:2500, mode:'pct', pct:60, start:'2026-10-22', end:'2026-10-30', submitted:'2026-10-20T22:40', flag:'نسبة خصم مرتفعة. تحقق من صحة السعر الأصلي.'}
        ],
        campaigns:[
          {id:'X-C1', merchant:'مغسلة اللمعة', targetName:'فيديو: غسيل بخار داخلي وخارجي', kind:'video', days:4, pts:20, start:'2026-10-23', submitted:'2026-10-21T07:55'}
        ]
      },
      fraud:[
        {id:'F-1', store:'سطحة السريع', rule:'14 تسجيلاً لعملاء جدد من جهاز واحد خلال ساعة', pts:70, sev:'high', status:'open', at:'2026-10-20T23:10'},
        {id:'F-2', store:'ورشة النخبة لصيانة السيارات', rule:'زيارتان مؤهلتان للعميل نفسه خلال 3 ساعات', pts:5, sev:'mid', status:'open', at:'2026-10-20T20:12'},
        {id:'F-3', store:'زينة الفخامة لإكسسوارات السيارات', rule:'عمليات مسح متكررة من موقع يبعد أكثر من 40 كم عن المحل', pts:25, sev:'mid', status:'open', at:'2026-10-19T15:30'},
        {id:'F-4', store:'ورشة الأمانة للسمكرة', rule:'تجاوز الحد اليومي للمكافآت (10) بمحاولة 13 مكافأة', pts:15, sev:'low', status:'open', at:'2026-10-18T21:00'}
      ],
      ops:[
        {id:'OP-1', kind:'payment', title:'إشعار دفع مكرر لنفس العملية PAY-8H2K19', detail:'تم تجاهله تلقائياً لأن الرقم المرجعي مسجّل مسبقاً. لم تُضف نقاط مرتين.', sev:'info', at:'2026-10-21T09:05', state:'resolved'},
        {id:'OP-2', kind:'zatca', title:'تعذّر إبلاغ الفاتورة INV-2026-000147 للهيئة', detail:'انتهت مهلة الاتصال بمنصة فاتورة. المحاولة التالية بعد 15 دقيقة (المحاولة 2 من 6).', sev:'warn', at:'2026-10-20T18:33', state:'retrying'},
        {id:'OP-3', kind:'ai', title:'فشل قراءة مستند AI-DOC-030', detail:'خطأ داخلي في خدمة المعالجة. لم تُخصم أي نقاط من التاجر.', sev:'bad', at:'2026-10-11T14:02', state:'resolved'},
        {id:'OP-4', kind:'sms', title:'تأخر وصول رسائل التحقق لمشغّل واحد', detail:'معدل نجاح الرسائل 96% خلال الساعة الماضية. تم التحويل إلى مزوّد احتياطي.', sev:'warn', at:'2026-10-21T07:40', state:'monitoring'}
      ],
      admins:[
        {name:'نورة السالم', role:'مدير عام', perms:[1,1,1,1,1,1]},
        {name:'تركي العمري', role:'مراجع محتوى', perms:[1,1,0,0,0,0]},
        {name:'ريم الغامدي', role:'مسؤول مالي', perms:[0,0,0,1,1,0]},
        {name:'بدر الحارثي', role:'دعم فني', perms:[0,0,0,0,0,0]}
      ],
      audit:[
        {at:'2026-10-21T09:12', who:'تركي العمري', action:'قبول عرض', target:'ورشة النخبة: فحص كمبيوتر شامل بـ 99 ريال', detail:'—'},
        {at:'2026-10-20T16:02', who:'نورة السالم', action:'تعديل تكلفة الترويج', target:'فيديو 7 أيام', detail:'25 ← 30 نقطة'},
        {at:'2026-10-19T12:30', who:'ريم الغامدي', action:'حركة تصحيحية للنقاط', target:'ورشة الأمانة للسمكرة', detail:'-10 نقاط. السبب: مكافأة مكررة'},
        {at:'2026-10-15T10:44', who:'نورة السالم', action:'طلب استكمال بيانات', target:'مغسلة اللمعة', detail:'صورة الواجهة وتصحيح الموقع'},
        {at:'2026-10-09T13:05', who:'نورة السالم', action:'رفض تاجر', target:'قطع غيار الشرق', detail:'السجل التجاري منتهي'}
      ],
      finance:{
        months:['مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر'],
        revenue:[8200,11600,15900,22400,31800,38650],
        costs:[6100,7200,8300,10100,12600,13980],
        points:18450, subs:20200, platformInvoices:18240, aiDocs:6420
      }
    }
  };
}

function freshReg(){
  return {step:1, owner:'', accPhone:'', email:'', cr:'', pw:'', pw2:'', terms:false, privacy:false,
    name:'', logo:null, activities:[], services:[], _newSvc:'', desc:'', city:'الرياض', district:'', street:'',
    pin:null, hours:defaultHours(), phone:'', phones:[], whatsapp:'', website:'', status:'pending'};
}
function demoReg(){
  var r = freshReg();
  Object.assign(r, {owner:'مؤسسة الدرع للإطارات', accPhone:'0509876543', email:'owner@aldera-tyres.example', cr:'1010112233', pw:'Wasla@2026', pw2:'Wasla@2026', terms:true, privacy:true,
    name:'مركز الدرع للإطارات', activities:['الإطارات والبنشر','الميزان وترصيص الإطارات'], services:['إطارات وبطاريات','ميزان وترصيص'],
    desc:'تركيب وترصيص الإطارات، ميزان إلكتروني، وبيع بطاريات بضمان الوكيل.', district:'حي الملقا', street:'طريق أنس بن مالك',
    pin:{x:38,y:40}, phone:'0509876543', whatsapp:'0509876543'});
  return r;
}
