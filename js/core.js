/* ===== state ===== */
let D = seed();
function freshState(){
  return {
    surface:'merchant',
    m:{screen:'role', params:{}, authed:false},
    a:{screen:'overview', params:{}},
    c:{view:'app'},
    ui:{drawer:false},
    err:{}, q:{}, tab:{},
    login:{method:'phone', id:'0551234567', pw:'Wasla@2026', remember:true, showPw:false, error:''},
    fp:null, reg:null, pf:null, prod:null, of:null, pn:null, ch:null, inv:null, ai:null, conv:'V1', draftMsg:''
  };
}
const S = freshState();
const M = {}, A = {}, ACT = {}, INPUT = {};

/* ===== helpers ===== */
const $ = function(s, r){ return (r || document).querySelector(s); };
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function num(n){ return Number(n || 0).toLocaleString('en-US'); }
function round2(n){ return Math.round((Number(n) || 0) * 100) / 100; }
function amt(n){ return Number(n || 0).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function money(n){ return amt(n) + ' ر.س'; }
const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
function pd(s){ if (!s) return null; var p = String(s).split(/[-T:]/).map(Number); return new Date(p[0], (p[1] || 1) - 1, p[2] || 1, p[3] || 0, p[4] || 0); }
function fmtDate(s){ var d = pd(s); return d ? d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() : '—'; }
function fmtShort(s){ var d = pd(s); return d ? d.getDate() + ' ' + MONTHS[d.getMonth()] : '—'; }
function fmtTime(s){ var d = pd(s); return d ? String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0') : ''; }
function fmtDT(s){ return fmtDate(s) + '، ' + fmtTime(s); }
function daysBetween(a, b){ return Math.round((pd(b) - pd(a)) / 86400000); }
function nowStamp(){ var d = new Date(); var p = function(n){ return String(n).padStart(2,'0'); }; return d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes()); }
function addDays(s, n){ var d = pd(s); d.setDate(d.getDate() + n); var p = function(x){ return String(x).padStart(2,'0'); }; return d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate()); }
function rid(prefix, len){ var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < (len || 6); i++) s += c[Math.floor(Math.random() * c.length)]; return prefix + s; }
function uuid(){ try { if (crypto.randomUUID) return crypto.randomUUID(); } catch(e) {} return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){ var r = Math.random()*16|0; return (c === 'x' ? r : (r&3|8)).toString(16); }); }
function norm(s){ return String(s || '').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/\s+/g,' ').trim(); }
function getPath(path){ if (!path) return undefined; var ps = path.split('.'), o = ps[0] === 'D' ? D : S; for (var i = 1; i < ps.length; i++){ if (o == null) return undefined; o = o[ps[i]]; } return o; }
function setPath(path, v){ var ps = path.split('.'), o = ps[0] === 'D' ? D : S; for (var i = 1; i < ps.length - 1; i++){ if (o[ps[i]] == null) o[ps[i]] = {}; o = o[ps[i]]; } o[ps[ps.length - 1]] = v; }
function byId(arr, id){ return arr.find(function(x){ return x.id === id; }); }
function maskPhone(p){ p = String(p || ''); return p.length > 4 ? p.slice(0, 2) + '•••••' + p.slice(-3) : p; }

/* ===== status vocab ===== */
const ST = {
  offer:{active:['نشط','ok'], review:['قيد المراجعة','warn'], rejected:['مرفوض','bad'], expired:['منتهي','neutral'], paused:['موقوف','info'], draft:['مسودة','neutral']},
  camp:{draft:['مسودة','neutral'], review:['قيد المراجعة','warn'], approved:['مقبولة','info'], active:['نشطة','ok'], rejected:['مرفوضة','bad'], completed:['مكتملة','neutral'], paused:['متوقفة','info']},
  charge:{pending:['قيد الدفع','warn'], success:['ناجحة','ok'], failed:['فاشلة','bad'], refunded:['مستردة','info']},
  acct:{pending:['قيد المراجعة','warn'], approved:['معتمد','ok'], rejected:['مرفوض','bad'], needs_info:['يحتاج استكمال بيانات','info'], suspended:['موقوف','bad']},
  inv:{draft:['مسودة','neutral'], queued:['بانتظار الإبلاغ للهيئة','warn'], reported:['مُبلّغة للهيئة','ok'], cleared:['معتمدة من الهيئة','ok'], failed:['تعذّر الإرسال','bad']},
  ai:{approved:['معتمد','ok'], review:['بانتظار مراجعتك','warn'], failed:['فشل تقني، لم تُخصم نقاط','bad']},
  ledger:{done:['مكتملة','ok'], held:['محجوزة','warn']},
  reward:{earned:['مكتسبة','ok'], pending:['معلقة للمراجعة','warn'], rejected:['غير مؤهلة','bad'], none:['بدون مكافأة','neutral']}
};
function pill(t, tone, icon){ return '<span class="pill pill-' + (tone || 'neutral') + '">' + (icon ? ic(icon) : '') + t + '</span>'; }
function st(k, s){ var x = (ST[k] && ST[k][s]) || [s, 'neutral']; return pill(x[0], x[1]); }
const KIND = {image:'صورة أو عرض', video:'فيديو'};
const INV_KIND = {simplified:['فاتورة ضريبية مبسطة','Simplified Tax Invoice'], tax:['فاتورة ضريبية','Tax Invoice'], credit:['إشعار دائن','Credit Note'], debit:['إشعار مدين','Debit Note']};
const MOVE = {sale:['بيع','bad'], purchase:['شراء','ok'], return:['مرتجع','info'], adjust:['تسوية','warn'], ai:['مساعد ذكي','brand'], supreturn:['مرتجع للمورد','bad']};

/* ===== derived data ===== */
function balance(){ return D.ledger.reduce(function(a, x){ return a + x.pts; }, 0); }
function walletParts(){
  var p = {free:0, purchased:0, earned:0, used:0, refunded:0, correction:0, expired:0};
  D.ledger.forEach(function(x){ p[x.cat] = (p[x.cat] || 0) + x.pts; });
  return p;
}
function addLedger(cat, pts, reason, ref, status){
  var id = 'TX-' + (10001 + D.ledger.length);
  D.ledger.push({id:id, at:nowStamp(), cat:cat, pts:pts, reason:reason, ref:ref || '—', status:status || 'done'});
  return id;
}
function offerFinal(o){
  var p = Number(o.price) || 0;
  if (o.mode === 'fixed') return Number(o.special) || 0;
  return round2(p * (1 - (Number(o.pct) || 0) / 100));
}
function offerPct(o){ var p = Number(o.price) || 0, f = offerFinal(o); return p > 0 ? Math.round((1 - f / p) * 100) : 0; }
function lineCalc(l){
  var q = Number(l.qty) || 0, p = Number(l.price) || 0, d = Number(l.disc) || 0, r = l.vat == null || l.vat === '' ? 15 : Number(l.vat);
  var gross = q * p, net = Math.max(0, gross - d), vat = round2(net * r / 100);
  return {gross:round2(gross), disc:round2(d), net:round2(net), vat:vat, total:round2(net + vat)};
}
function invTotals(lines){
  var t = {gross:0, disc:0, net:0, vat:0, total:0};
  (lines || []).forEach(function(l){ var c = lineCalc(l); t.gross += c.gross; t.disc += c.disc; t.net += c.net; t.vat += c.vat; t.total += c.total; });
  Object.keys(t).forEach(function(k){ t[k] = round2(t[k]); });
  return t;
}
function custName(id){ var c = byId(D.customers, id); return c ? c.name : 'عميل نقدي'; }
function invItem(id){ return byId(D.inventory, id); }
function lowStock(){ return D.inventory.filter(function(i){ return i.active && i.qty <= i.min; }); }
function unreadCount(){ return D.notifications.filter(function(n){ return !n.read; }).length; }
function unreadMsgs(){ return D.convs.reduce(function(a, c){ return a + (c.unread || 0); }, 0); }

/* ZATCA phase-1 QR: TLV (tag, length, UTF-8 value) then Base64 */
function tlvBase64(values){
  var enc = new TextEncoder(), bytes = [];
  values.forEach(function(v, i){ var b = enc.encode(String(v)); bytes.push(i + 1, b.length); for (var k = 0; k < b.length; k++) bytes.push(b[k]); });
  var s = ''; bytes.forEach(function(x){ s += String.fromCharCode(x); });
  return btoa(s);
}
function zatcaQR(inv){
  var t = invTotals(inv.lines);
  var ts = (inv.at || nowStamp()) + ':00+03:00';
  var iso = new Date(ts).toISOString().replace('.000', '');
  return tlvBase64([D.invSettings.legalAr, D.invSettings.vat, iso, amt(t.total).replace(/,/g, ''), amt(t.vat).replace(/,/g, '')]);
}

/* ===== visual atoms ===== */
const CAT_ICON = {'صيانة دورية':'wrench','فحص':'gauge','فرامل':'disc','تكييف':'snow','فلاتر':'filter','زيوت':'drop','بطاريات':'battery','إشعال':'bolt','سوائل':'drop','إكسسوارات':'car'};
const TYPE_ICON = {'تغيير زيت وفلاتر':'drop','فحص كمبيوتر':'gauge','صيانة فرامل':'disc','تكييف السيارات':'snow','إطارات وبطاريات':'battery','كهرباء سيارات':'bolt','ميكانيكا عامة':'wrench'};
const TONES = ['tone-brand','tone-sky','tone-ok','tone-warn','tone-info'];
function toneFor(s){ var h = 0; String(s).split('').forEach(function(c){ h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return TONES[h % TONES.length]; }
function thumb(o, cls){
  var src = (o.imgs && o.imgs[0]) || o.img;
  var icn = CAT_ICON[o.cat] || TYPE_ICON[o.type] || (o.kind === 'video' ? 'video' : 'tag');
  if (src) return '<div class="thumb ' + (cls || '') + '"><img src="' + src + '" alt=""></div>';
  return '<div class="thumb ' + (cls || '') + ' ' + toneFor(o.title || o.name || o.targetName || '') + '">' + ic(icn) + '</div>';
}
function storeLogo(st, size){
  return '<div class="logo-tile ' + (size || 'md') + '">' + (st && st.logo ? '<img src="' + st.logo + '" alt="شعار المحل">' : ic('wrench')) + '</div>';
}
function brandBlock(big){
  return '<div class="brand-block' + (big ? '' : ' sm') + '">' + logoMark() + '<span class="wordmark">وصلة</span><span class="wordmark-en">WASLA</span>'
    + (big ? '<span class="tagline">معاً <b>توفير</b> وأمان ' + ic('shield') + '</span>' : '') + '</div>';
}
function langPick(){ return '<button class="lang" data-act="soon" data-msg="ستتوفر اللغة الإنجليزية في النسخة الفعلية">' + ic('globe') + 'العربية ' + ic('chevD') + '</button>'; }
function fakeMap(o){
  o = o || {};
  var attrs = o.path ? ' data-act="pickMap" data-path="' + o.path + '" role="button" tabindex="0" aria-label="اضغط لتحديد موقع المحل على الخريطة"' : '';
  var pin = o.pin;
  return '<div class="map" style="height:' + (o.h || 220) + 'px"' + attrs + '>'
    + '<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
    + '<rect class="m-bg" width="400" height="220"/>'
    + '<rect class="m-block" x="18" y="16" width="96" height="62" rx="6"/><rect class="m-block" x="136" y="16" width="120" height="62" rx="6"/><rect class="m-park" x="276" y="16" width="108" height="62" rx="6"/>'
    + '<rect class="m-block" x="18" y="100" width="96" height="104" rx="6"/><rect class="m-block" x="136" y="100" width="70" height="44" rx="6"/><rect class="m-block" x="226" y="100" width="158" height="44" rx="6"/>'
    + '<rect class="m-park" x="136" y="160" width="70" height="44" rx="6"/><rect class="m-block" x="226" y="160" width="158" height="44" rx="6"/>'
    + '<path class="m-road2" d="M0 89 H400" stroke-width="12"/><path class="m-road" d="M125 0 V220" stroke-width="9"/><path class="m-road" d="M266 0 V90 M216 90 V220" stroke-width="7"/><path class="m-road" d="M0 152 H400" stroke-width="6"/>'
    + '<text class="m-label" x="392" y="86" text-anchor="end">طريق الملك فهد</text><text class="m-label" x="392" y="149" text-anchor="end">شارع العليا العام</text>'
    + '</svg>'
    + (pin ? '<span class="map-pin" style="left:' + pin.x + '%;top:' + pin.y + '%">' + ic('pin') + '</span>' : '')
    + (o.path && !pin ? '<span class="map-hint">اضغط على الخريطة لتحديد موقع المحل</span>' : '')
    + (pin && o.coords !== false ? '<span class="map-label tnum">' + coords(pin) + '</span>' : '')
    + '</div>';
}
function coords(p){ return (24.80 - p.y * 0.0012).toFixed(4) + '° ش، ' + (46.62 + p.x * 0.0015).toFixed(4) + '° ق'; }
function bars(data, o){
  o = o || {};
  var max = Math.max.apply(null, [1].concat(data.map(function(d){ return d.v; })));
  var fmt = o.fmt || num, mode = o.vals || 'all', last = data.length - 1;
  return '<div class="bars" style="--h:' + (o.h || 140) + 'px" role="img" aria-label="' + esc(o.label || 'رسم بياني') + '">' + data.map(function(d, i){
    var show = mode === 'all' || (mode === 'key' && (i === last || d.v === max));
    return '<div class="bar-col' + (i === last && o.hlLast ? ' hl' : '') + '"><span class="bar-v tnum">' + (show ? fmt(d.v) : '') + '</span><div class="bar-track"><div class="bar bar-' + (o.tone || 'brand') + '" style="height:' + Math.max(1, Math.round(d.v / max * 100)) + '%"></div></div><span class="bar-l">' + d.l + '</span></div>';
  }).join('') + '</div>';
}
function bars2(data, o){
  o = o || {};
  var max = Math.max.apply(null, [1].concat(data.map(function(d){ return Math.max(d.a, d.b); })));
  return '<div class="bars" style="--h:' + (o.h || 150) + 'px" role="img" aria-label="' + esc(o.label || 'رسم بياني') + '">' + data.map(function(d){
    return '<div class="bar-col"><span class="bar-v tnum">' + (o.fmt || num)(d.a) + '</span><div class="bar-track"><div class="bar bar-' + (o.ta || 'brand') + '" style="height:' + Math.max(1, Math.round(d.a / max * 100)) + '%"></div><div class="bar bar-' + (o.tb || 'muted') + '" style="height:' + Math.max(1, Math.round(d.b / max * 100)) + '%"></div></div><span class="bar-l">' + d.l + '</span></div>';
  }).join('') + '</div>';
}
function kpi(label, value, sub, icon, goTo, extra){
  var tag = goTo ? 'button' : 'div';
  return '<' + tag + ' class="kpi' + (icon ? '' : ' flat') + '"' + (goTo ? ' data-go="' + goTo + '"' : '') + '>' + (icon ? '<span class="kpi-ic">' + ic(icon) + '</span>' : '') + '<span class="kpi-label">' + label + '</span><span class="kpi-val tnum">' + value + '</span>' + (sub ? '<span class="kpi-sub">' + sub + '</span>' : '') + (extra || '') + '</' + tag + '>';
}
function pageHead(title, sub, actions, back){
  return '<header class="page-head">' + (back ? '<div><button class="link-back" data-go="' + back[0] + '"' + (back[2] ? ' data-id="' + back[2] + '"' : '') + '>' + ic('chevR') + ' ' + back[1] + '</button></div>' : '')
    + '<div class="ph-row"><div class="ph-text"><h1>' + title + '</h1>' + (sub ? '<p class="muted">' + sub + '</p>' : '') + '</div>' + (actions ? '<div class="ph-actions">' + actions + '</div>' : '') + '</div></header>';
}
function curTab(k, d){ return S.tab[k] || d; }
function tabs(key, items, def, cls){
  var cur = curTab(key, def);
  return '<div class="' + (cls || 'tabs') + '" role="tablist">' + items.map(function(it){
    return '<button role="tab" aria-selected="' + (cur === it[0]) + '" class="' + (cur === it[0] ? 'on' : '') + '" data-act="tab" data-k="' + key + '" data-v="' + it[0] + '">' + (it[2] ? ic(it[2]) : '') + it[1] + (it[3] != null ? ' <span class="count">' + it[3] + '</span>' : '') + '</button>';
  }).join('') + '</div>';
}
function note(tone, html, icon){ return '<div class="note note-' + tone + '">' + ic(icon || (tone === 'bad' ? 'alert' : tone === 'ok' ? 'check' : tone === 'warn' ? 'alert' : 'info')) + '<span>' + html + '</span></div>'; }
function empty(icon, title, text, btn){ return '<div class="empty">' + ic(icon) + '<h3>' + title + '</h3><p>' + (text || '') + '</p>' + (btn || '') + '</div>'; }
function searchBox(key, target, ph){
  return '<div class="input-icon grow" style="max-width:360px">' + ic('search') + '<input class="input" type="search" id="q-' + key + '" data-bind="S.q.' + key + '" data-filter="' + target + '" value="' + esc(S.q[key] || '') + '" placeholder="' + esc(ph) + '" aria-label="' + esc(ph) + '"></div>';
}

/* ===== form fields ===== */
function bindAttr(o){
  var a = '';
  if (o.bind) a += ' data-bind="' + o.bind + '"';
  if (o.num) a += ' data-num';
  if (o.rerender) a += ' data-rerender';
  if (o.oninput) a += ' data-oninput="' + o.oninput + '"';
  return a;
}
function F(o){
  var id = o.id, err = S.err[id] || '';
  var val = o.value != null ? o.value : (o.bind ? getPath(o.bind) : '');
  if (val == null) val = '';
  var input;
  if (o.type === 'textarea') input = '<textarea class="textarea" id="' + id + '"' + bindAttr(o) + ' placeholder="' + esc(o.ph || '') + '" ' + (o.attrs || '') + '>' + esc(val) + '</textarea>';
  else if (o.type === 'select') input = '<select class="select" id="' + id + '"' + bindAttr(o) + ' ' + (o.attrs || '') + '>' + o.options.map(function(op){ var v = Array.isArray(op) ? op[0] : op, t = Array.isArray(op) ? op[1] : op; return '<option value="' + esc(v) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select>';
  else input = '<input class="input' + (o.ltr ? ' ltr' : '') + (o.sm ? ' input-sm' : '') + '" id="' + id + '" type="' + (o.type || 'text') + '"' + bindAttr(o) + ' value="' + esc(val) + '" placeholder="' + esc(o.ph || '') + '" ' + (o.attrs || '') + '>';
  if (o.icon) input = '<div class="input-icon">' + ic(o.icon) + input + '</div>';
  if (o.prefix) input = '<div class="input-group">' + input + '<span class="prefix">' + o.prefix + '</span></div>';
  return '<div class="field' + (err ? ' has-err' : '') + (o.cls ? ' ' + o.cls : '') + '"><label for="' + id + '">' + o.label + (o.req ? ' <span class="req" aria-hidden="true">*</span>' : '') + (o.opt ? ' <span class="faint xs">(اختياري)</span>' : '') + '</label>' + input + (o.hint ? '<small class="hint">' + o.hint + '</small>' : '') + '<small class="err" id="' + id + '-err">' + esc(err) + '</small></div>';
}
function CB(o){
  var err = S.err[o.id] || '';
  return '<div class="field' + (err ? ' has-err' : '') + '"><label class="check"><input type="checkbox" id="' + o.id + '" data-bind="' + o.bind + '"' + (o.rerender ? ' data-rerender' : '') + (getPath(o.bind) ? ' checked' : '') + '><span>' + o.label + '</span></label><small class="err">' + esc(err) + '</small></div>';
}
function SW(o){ return '<label class="switch"><input type="checkbox" id="' + o.id + '" data-bind="' + o.bind + '"' + (o.rerender ? ' data-rerender' : '') + (getPath(o.bind) ? ' checked' : '') + (o.onchange ? ' data-onchange="' + o.onchange + '"' : '') + '><span>' + (o.label || '') + '</span></label>'; }
function chipsPicker(path, options){
  var cur = getPath(path) || [];
  return '<div class="chips" role="group">' + options.map(function(op){ var on = cur.indexOf(op) > -1; return '<button type="button" class="chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-act="toggleIn" data-path="' + path + '" data-v="' + esc(op) + '">' + (on ? ic('check') : '') + esc(op) + '</button>'; }).join('') + '</div>';
}
function uploader(path, o){
  o = o || {};
  var arr = getPath(path) || [], max = o.max || 6;
  return '<div class="uploader">' + arr.map(function(src, i){
    return '<div class="up-img"><img src="' + src + '" alt="صورة ' + (i + 1) + '">' + (i === 0 ? '<span class="cover-tag">الرئيسية</span>' : '') + '<button type="button" data-act="rmImg" data-path="' + path + '" data-i="' + i + '" aria-label="حذف الصورة">' + ic('x') + '</button></div>';
  }).join('') + (arr.length < max ?
    '<label class="up-tile">' + ic('upload') + '<span>رفع من الجهاز</span><input type="file" accept="image/*" multiple data-upload="' + path + '" data-multi data-max="' + max + '"></label>'
    + '<label class="up-tile">' + ic('camera') + '<span>تصوير صورة</span><input type="file" accept="image/*" capture="environment" data-upload="' + path + '" data-multi data-max="' + max + '"></label>'
    + '<button type="button" class="up-tile" data-act="sampleImg" data-path="' + path + '" data-title="' + esc(o.title || '') + '">' + ic('image') + '<span>صورة نموذجية</span></button>' : '') + '</div>';
}
function logoUploader(path){
  var v = getPath(path);
  return '<div class="uploader">' + (v ? '<div class="up-img"><img src="' + v + '" alt="شعار المحل"><button type="button" data-act="clearPath" data-path="' + path + '" aria-label="حذف الصورة">' + ic('x') + '</button></div>' : '')
    + '<label class="up-tile">' + ic('upload') + '<span>' + (v ? 'تغيير الصورة' : 'رفع الشعار أو الواجهة') + '</span><input type="file" accept="image/*" data-upload="' + path + '"></label>'
    + '<button type="button" class="up-tile" data-act="sampleLogo" data-path="' + path + '">' + ic('image') + '<span>شعار نموذجي</span></button></div>';
}

/* ===== canvas-made sample images ===== */
function wrapText(g, text, x, y, maxW, lh){
  var words = String(text).split(' '), line = '', lines = [];
  words.forEach(function(w){ var t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line){ lines.push(line); line = w; } else line = t; });
  if (line) lines.push(line);
  lines.slice(0, 3).forEach(function(l, i){ g.fillText(l, x, y + i * lh); });
}
function sampleImage(title, sub, n){
  var c = document.createElement('canvas'); c.width = 960; c.height = 600;
  var g = c.getContext('2d');
  var pal = [['#0F2744','#E8620E'],['#173558','#1C86D8'],['#0F2744','#0F7A55'],['#2B1607','#E8620E']][(n || 0) % 4];
  var grd = g.createLinearGradient(0, 0, 960, 600); grd.addColorStop(0, pal[0]); grd.addColorStop(1, pal[1]);
  g.fillStyle = grd; g.fillRect(0, 0, 960, 600);
  g.globalAlpha = .12; g.fillStyle = '#fff';
  g.beginPath(); g.arc(820, 110, 230, 0, 7); g.fill(); g.beginPath(); g.arc(110, 560, 190, 0, 7); g.fill();
  g.globalAlpha = 1;
  try { g.direction = 'rtl'; } catch(e) {}
  g.textAlign = 'right'; g.fillStyle = '#fff';
  g.font = '700 62px "Readex Pro","IBM Plex Sans Arabic",Tahoma,sans-serif';
  wrapText(g, title || 'عرض خاص', 900, 240, 820, 82);
  g.font = '500 32px "IBM Plex Sans Arabic",Tahoma,sans-serif'; g.fillStyle = 'rgba(255,255,255,.85)';
  g.fillText(sub || 'ورشة النخبة لصيانة السيارات · وصلة', 900, 530);
  return c.toDataURL('image/jpeg', .85);
}
function sampleLogo(){
  var c = document.createElement('canvas'); c.width = c.height = 400;
  var g = c.getContext('2d');
  g.fillStyle = '#0F2744'; g.fillRect(0, 0, 400, 400);
  g.strokeStyle = '#E8620E'; g.lineWidth = 26; g.beginPath(); g.arc(200, 200, 120, 0, 7); g.stroke();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '700 120px "Readex Pro",Tahoma,sans-serif'; g.fillText('ن', 200, 240);
  return c.toDataURL('image/png');
}
function supplierDocImage(){
  var c = document.createElement('canvas'); c.width = 900; c.height = 1180;
  var g = c.getContext('2d');
  g.fillStyle = '#F4F1EA'; g.fillRect(0, 0, 900, 1180);
  g.fillStyle = '#FFFFFF'; g.fillRect(40, 30, 820, 1120);
  try { g.direction = 'rtl'; } catch(e) {}
  g.textAlign = 'right'; g.fillStyle = '#1B2430';
  g.font = '700 40px Tahoma,sans-serif'; g.fillText('شركة الجزيرة لقطع الغيار', 820, 100);
  g.font = '24px Tahoma,sans-serif'; g.fillStyle = '#4A5563';
  g.fillText('الرقم الضريبي: 300456789100003', 820, 145); g.fillText('فاتورة ضريبية رقم: J-88407', 820, 182); g.fillText('التاريخ: 2026/10/20', 820, 219);
  g.fillStyle = '#1B2430'; g.fillRect(80, 250, 740, 3);
  g.font = '700 22px Tahoma,sans-serif'; ['الصنف','الرمز','الكمية','السعر','الإجمالي'].forEach(function(h, i){ g.fillText(h, 820 - i * 165, 290); });
  var rows = [['فلتر زيت تويوتا أصلي','FLT-TY-01','24','28.00','672.00'],['زيت موبيل 1 5W-30','OIL-MB-530','12','132.00','1584.00'],['فلتر هواء كامري 2020','FLT-CM-AIR','10','34.00','340.00'],['فلتر زيت تويوتا','','6','28.00','168.00'],['شمعات احتراق NGK','SPK-NGK-4','?','60.00','300.00']];
  g.font = '21px Tahoma,sans-serif';
  rows.forEach(function(r, ri){ r.forEach(function(v, i){ g.fillStyle = (ri === 4 && i === 2) ? '#B8B0A0' : '#2E3846'; g.fillText(v, 820 - i * 165, 340 + ri * 52); }); });
  g.fillStyle = '#1B2430'; g.fillRect(80, 620, 740, 2);
  g.font = '700 24px Tahoma,sans-serif';
  g.fillText('الإجمالي قبل الضريبة: 3,064.00', 820, 670); g.fillText('ضريبة القيمة المضافة 15%: 459.60', 820, 712); g.fillText('الإجمالي: 3,523.60 ر.س', 820, 754);
  g.globalAlpha = .08; g.fillStyle = '#000'; g.fillRect(560, 470, 260, 60); g.globalAlpha = 1;
  return c.toDataURL('image/jpeg', .8);
}
function docTile(name){
  var c = document.createElement('canvas'); c.width = 600; c.height = 800;
  var g = c.getContext('2d'); g.fillStyle = '#EEF1F5'; g.fillRect(0, 0, 600, 800);
  g.fillStyle = '#fff'; g.fillRect(90, 80, 420, 560); g.fillStyle = '#BE2F25'; g.fillRect(90, 80, 420, 70);
  g.fillStyle = '#fff'; g.font = '700 40px Tahoma,sans-serif'; g.textAlign = 'center'; g.fillText('PDF', 300, 130);
  g.fillStyle = '#536175'; g.font = '24px Tahoma,sans-serif'; g.fillText(String(name).slice(0, 34), 300, 700);
  return c.toDataURL('image/png');
}
function downscale(src){
  return new Promise(function(res){
    var img = new Image();
    img.onload = function(){
      var m = 1400, w = img.width, h = img.height, k = Math.min(1, m / Math.max(w, h));
      var c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      try { res(c.toDataURL('image/jpeg', .85)); } catch(e) { res(src); }
    };
    img.onerror = function(){ res(src); };
    img.src = src;
  });
}
function readImg(f){
  return new Promise(function(res){
    if (!f.type || f.type.indexOf('image/') !== 0){ res(docTile(f.name)); return; }
    var r = new FileReader();
    r.onload = function(){ downscale(r.result).then(res); };
    r.onerror = function(){ res(docTile(f.name)); };
    r.readAsDataURL(f);
  });
}

/* ===== QR rendering ===== */
function drawQR(el){
  var text = el.getAttribute('data-qr'), size = Number(el.getAttribute('data-size')) || 160;
  el.innerHTML = '';
  if (window.QRCode){
    try { new QRCode(el, {text:text, width:size, height:size, colorDark:'#0E1B2C', colorLight:'#FFFFFF', correctLevel:QRCode.CorrectLevel.M}); el.title = ''; return; } catch(e) {}
  }
  var c = document.createElement('canvas'); c.width = c.height = size;
  var g = c.getContext('2d'), n = 29, m = size / n, h = 7;
  g.fillStyle = '#fff'; g.fillRect(0, 0, size, size); g.fillStyle = '#0E1B2C';
  for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  for (var y = 0; y < n; y++) for (var x = 0; x < n; x++){ h = (h * 1103515245 + 12345) >>> 0; if ((h >> 16) & 1) g.fillRect(x * m, y * m, m, m); }
  [[0,0],[n-7,0],[0,n-7]].forEach(function(p){ g.fillStyle = '#0E1B2C'; g.fillRect(p[0]*m, p[1]*m, 7*m, 7*m); g.fillStyle = '#fff'; g.fillRect((p[0]+1)*m, (p[1]+1)*m, 5*m, 5*m); g.fillStyle = '#0E1B2C'; g.fillRect((p[0]+2)*m, (p[1]+2)*m, 3*m, 3*m); });
  el.appendChild(c);
}

/* ===== overlays ===== */
function openModal(html, o){
  o = o || {};
  var r = document.getElementById('modal-root');
  r.innerHTML = '<div class="modal-back" data-act="backdrop"><div class="modal' + (o.wide ? ' modal-wide' : '') + '" role="dialog" aria-modal="true" aria-labelledby="modal-title">' + html + '</div></div>';
  r.hidden = false;
  document.body.classList.add('no-scroll');
  hydrate(r);
  var f = r.querySelector('[autofocus]') || r.querySelector('.modal-body input:not([type=hidden]),.modal-body select,.modal-body textarea') || r.querySelector('.modal-x');
  if (f) f.focus();
}
function closeModal(){
  var r = document.getElementById('modal-root');
  if (!r || r.hidden) return;
  r.innerHTML = ''; r.hidden = true;
  document.body.classList.remove('no-scroll');
}
function modalHead(title, sub){ return '<header class="modal-head"><div><h2 id="modal-title">' + title + '</h2>' + (sub ? '<p class="muted small">' + sub + '</p>' : '') + '</div><button class="icon-btn modal-x" data-act="closeModal" aria-label="إغلاق">' + ic('x') + '</button></header>'; }
function confirmModal(title, text, actName, data, btnText, danger){
  var attrs = Object.keys(data || {}).map(function(k){ return ' data-' + k + '="' + esc(data[k]) + '"'; }).join('');
  openModal(modalHead(title) + '<div class="modal-body"><p>' + text + '</p></div><div class="modal-foot"><button class="btn ' + (danger ? 'btn-danger' : 'btn-primary') + '" data-act="' + actName + '"' + attrs + '>' + btnText + '</button><button class="btn btn-ghost" data-act="closeModal">تراجع</button></div>');
}
function toast(msg, tone){
  tone = tone || 'ok';
  var r = document.getElementById('toast-root'), el = document.createElement('div');
  el.className = 'toast toast-' + tone; el.setAttribute('role', 'status');
  el.innerHTML = ic(tone === 'bad' ? 'alert' : tone === 'info' ? 'info' : 'check') + '<span>' + msg + '</span>';
  r.appendChild(el);
  setTimeout(function(){ el.classList.add('out'); setTimeout(function(){ el.remove(); }, 320); }, 3600);
}
function copyText(t, okMsg){
  var fb = function(){ openModal(modalHead('انسخ النص') + '<div class="modal-body"><input class="input ltr" id="copy-field" readonly value="' + esc(t) + '"><p class="muted small">حدّد النص وانسخه يدوياً.</p></div>'); var f = $('#copy-field'); if (f) f.select(); };
  try { navigator.clipboard.writeText(t).then(function(){ toast(okMsg || 'تم النسخ'); }, fb); } catch(e) { fb(); }
}

/* ===== routing & render ===== */
function go(screen, params){ S.m.screen = screen; S.m.params = params || {}; S.err = {}; S.ui.drawer = false; closeModal(); render(); window.scrollTo(0, 0); }
function goA(screen, params){ S.a.screen = screen; S.a.params = params || {}; S.err = {}; closeModal(); render(); window.scrollTo(0, 0); }
function setSurface(s){ S.surface = s; S.ui.drawer = false; S.err = {}; closeModal(); try { history.replaceState(null, '', '#' + s); } catch(e) {} render(); window.scrollTo(0, 0); }
function protoBar(){
  var t = [['merchant','تطبيق التاجر','store'],['admin','لوحة إدارة وصلة','shield'],['customer','واجهة العميل','user'],['map','خريطة الشاشات','map']];
  return '<header class="proto"><div class="proto-in"><div class="proto-brand">' + logoMark() + '<b>وصلة</b><span class="proto-tag">نموذج تفاعلي · بيانات توضيحية</span></div>'
    + '<nav class="proto-tabs" aria-label="أجزاء النموذج">' + t.map(function(x){ return '<button class="' + (S.surface === x[0] ? 'on' : '') + '" data-surface="' + x[0] + '"' + (S.surface === x[0] ? ' aria-current="page"' : '') + '>' + ic(x[2]) + x[1] + '</button>'; }).join('') + '</nav>'
    + '<button class="proto-reset" data-act="askReset" title="إعادة البيانات التجريبية">' + ic('refresh') + '<span>إعادة البيانات</span></button></div></header>';
}
function render(){
  var root = document.getElementById('app'), body = '';
  try {
    if (S.surface === 'merchant') body = renderMerchant();
    else if (S.surface === 'admin') body = renderAdmin();
    else if (S.surface === 'customer') body = renderCustomer();
    else body = renderMap();
  } catch(err){
    console.error(err);
    body = '<div class="content">' + note('bad', 'تعذّر عرض هذه الشاشة: ' + esc(err.message)) + '</div>';
  }
  root.innerHTML = protoBar() + body;
  hydrate(root);
}
function hydrate(root){
  root.querySelectorAll('[data-qr]').forEach(drawQR);
  root.querySelectorAll('input[data-filter]').forEach(function(el){ if (el.value) applyFilter(el); });
}
function applyFilter(el){
  var box = document.querySelector(el.getAttribute('data-filter')); if (!box) return;
  var q = norm(el.value), shown = 0;
  box.querySelectorAll('[data-q]').forEach(function(r){ var ok = !q || norm(r.getAttribute('data-q')).indexOf(q) > -1; r.hidden = !ok; if (ok) shown++; });
  var e = document.querySelector(el.getAttribute('data-filter') + '-empty'); if (e) e.hidden = shown > 0;
}

/* ===== events ===== */
function bindSet(el){
  var v = el.type === 'checkbox' ? el.checked : el.value;
  if (el.hasAttribute('data-num') && el.type !== 'checkbox') v = el.value === '' ? '' : Number(el.value);
  setPath(el.getAttribute('data-bind'), v);
  if (S.err[el.id]){
    delete S.err[el.id];
    var f = el.closest('.field'); if (f){ f.classList.remove('has-err'); var er = f.querySelector('.err'); if (er) er.textContent = ''; }
  }
}
function onFile(el){
  var files = Array.prototype.slice.call(el.files || []); if (!files.length) return;
  var path = el.getAttribute('data-upload'), multi = el.hasAttribute('data-multi'), max = Number(el.getAttribute('data-max')) || 6;
  var h = el.getAttribute('data-onchange');
  Promise.all(files.slice(0, multi ? max : 1).map(readImg)).then(function(urls){
    if (path){
      if (multi){ var arr = getPath(path) || []; setPath(path, arr.concat(urls).slice(0, max)); }
      else setPath(path, urls[0]);
    }
    if (h && INPUT[h]) INPUT[h](el, urls, files); else render();
  });
}
document.addEventListener('click', function(e){
  var t = e.target.closest('[data-go],[data-act],[data-ago],[data-surface]');
  if (!t) return;
  if (t.tagName === 'A' || t.tagName === 'BUTTON') e.preventDefault();
  if (t.hasAttribute('data-surface')){ setSurface(t.getAttribute('data-surface')); return; }
  if (t.hasAttribute('data-go')){ go(t.getAttribute('data-go'), {id:t.getAttribute('data-id')}); return; }
  if (t.hasAttribute('data-ago')){ goA(t.getAttribute('data-ago'), {id:t.getAttribute('data-id')}); return; }
  var a = ACT[t.getAttribute('data-act')];
  if (a) a(t, e); else console.warn('Missing action', t.getAttribute('data-act'));
});
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape'){ if (!document.getElementById('modal-root').hidden) closeModal(); else if (S.ui.drawer){ S.ui.drawer = false; render(); } }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-act]')){ e.preventDefault(); e.target.click(); }
});
document.addEventListener('input', function(e){
  var el = e.target;
  if (el.type === 'file') return;
  if (el.hasAttribute('data-bind')) bindSet(el);
  if (el.hasAttribute('data-filter')) applyFilter(el);
  var h = el.getAttribute('data-oninput'); if (h && INPUT[h]) INPUT[h](el, e);
});
document.addEventListener('change', function(e){
  var el = e.target;
  if (el.type === 'file'){ onFile(el); return; }
  if (el.hasAttribute('data-bind')) bindSet(el);
  if (el.hasAttribute('data-rerender')) render();
  var h = el.getAttribute('data-onchange'); if (h && INPUT[h]) INPUT[h](el, e);
});
document.addEventListener('submit', function(e){
  var f = e.target; e.preventDefault();
  var a = ACT[f.getAttribute('data-act')]; if (a) a(f, e);
});

/* ===== generic actions ===== */
ACT.backdrop = function(el, e){ if (e.target === el) closeModal(); };
ACT.closeModal = function(){ closeModal(); };
ACT.tab = function(el){ S.tab[el.getAttribute('data-k')] = el.getAttribute('data-v'); render(); };
ACT.setv = function(el){ var v = el.getAttribute('data-v'); if (el.hasAttribute('data-num')) v = Number(v); if (v === 'true') v = true; if (v === 'false') v = false; setPath(el.getAttribute('data-path'), v); render(); };
ACT.toggleIn = function(el){ var p = el.getAttribute('data-path'), v = el.getAttribute('data-v'), arr = (getPath(p) || []).slice(), i = arr.indexOf(v); if (i > -1) arr.splice(i, 1); else arr.push(v); setPath(p, arr); render(); };
ACT.rmImg = function(el){ var p = el.getAttribute('data-path'), arr = (getPath(p) || []).slice(); arr.splice(Number(el.getAttribute('data-i')), 1); setPath(p, arr); render(); };
ACT.clearPath = function(el){ setPath(el.getAttribute('data-path'), null); render(); };
ACT.sampleImg = function(el){ var p = el.getAttribute('data-path'), arr = (getPath(p) || []).slice(); arr.push(sampleImage(el.getAttribute('data-title') || 'عرض خاص من ورشة النخبة', null, arr.length)); setPath(p, arr); render(); };
ACT.sampleLogo = function(el){ setPath(el.getAttribute('data-path'), sampleLogo()); render(); };
ACT.soon = function(el){ toast(el.getAttribute('data-msg') || 'متاحة في النسخة الفعلية', 'info'); };
ACT.copy = function(el){ copyText(el.getAttribute('data-v'), el.getAttribute('data-msg') || 'تم النسخ'); };
ACT.pickMap = function(el, e){
  var r = el.getBoundingClientRect(), x, y;
  if (e && e.clientX){ x = (e.clientX - r.left) / r.width * 100; y = (e.clientY - r.top) / r.height * 100; } else { x = 50; y = 50; }
  setPath(el.getAttribute('data-path'), {x:Math.round(Math.min(96, Math.max(4, x))), y:Math.round(Math.min(94, Math.max(14, y)))});
  delete S.err.pin;
  render();
};
ACT.askReset = function(){ confirmModal('إعادة البيانات التجريبية؟', 'تعود كل الشاشات إلى البيانات الأولية، وتُحذف أي عروض أو فواتير أو تعديلات أنشأتها أثناء التجربة.', 'doReset', {}, 'إعادة البيانات', true); };
ACT.doReset = function(){ var s = S.surface; D = seed(); Object.assign(S, freshState(), {surface:s}); closeModal(); render(); toast('أُعيدت البيانات التجريبية'); };
