(function boot(){
  document.documentElement.lang = 'ar';
  document.documentElement.dir = 'rtl';
  var h = (location.hash || '').slice(1);
  if (['merchant','admin','customer','map'].indexOf(h) > -1) S.surface = h;
  render();
  if (!window.QRCode){
    var tries = 0, t = setInterval(function(){ tries++; if (window.QRCode){ clearInterval(t); document.querySelectorAll('[data-qr]').forEach(drawQR); } if (tries > 20) clearInterval(t); }, 250);
  }
})();
