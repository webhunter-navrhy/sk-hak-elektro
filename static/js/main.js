// HaK – elektro revízie Nitra: menu, odhaľovanie sekcií, objednávka revízie (protokol), formulár v ukážkovom režime.
document.documentElement.classList.add('js');

(function () {
  // menu na mobile
  var burger = document.querySelector('.burger'), menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var o = menu.classList.toggle('otvorene');
      burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { menu.classList.remove('otvorene'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  // odhaľovanie pri scrolle
  var ciele = document.querySelectorAll('.riadok, .praca, details');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (zaznamy) {
      zaznamy.forEach(function (z) { if (z.isIntersecting) { z.target.classList.add('je'); io.unobserve(z.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    ciele.forEach(function (el) { el.classList.add('odhal'); io.observe(el); });
  }

  // objednávka revízie: formulár -> hárok s pečiatkou
  var form = document.getElementById('formular');
  var harok = document.getElementById('harok');
  function hodnoty() {
    var predmet = [].map.call(form.querySelectorAll('input[name=predmet]:checked'), function (i) { return i.value; });
    var r = function (n) { var i = form.querySelector('input[name=' + n + ']:checked'); return i ? i.value : ''; };
    var t = function (n) { return form.elements[n].value.trim(); };
    return { objekt: r('objekt'), predmet: predmet.join(', '), dovod: r('dovod'), obec: t('obec'), termin: t('termin'), meno: t('meno'), pozn: t('pozn') };
  }
  function chyba(h) {
    var c = [];
    if (!h.objekt) c.push('objekt');
    if (!h.predmet) c.push('predmet');
    if (!h.dovod) c.push('dôvod');
    return c;
  }
  if (form && harok) {
    var stav = document.getElementById('harok-stav'), peciatka = harok.querySelector('.pripravene'), predtym = {};
    var prekresli = function () {
      var h = hodnoty();
      harok.querySelectorAll('[data-pole]').forEach(function (dd) {
        var k = dd.getAttribute('data-pole');
        if (dd.textContent !== h[k]) {
          dd.textContent = h[k];
          if (h[k] && h[k].length > (predtym[k] || '').length && ['objekt', 'predmet', 'dovod'].indexOf(k) > -1) {
            dd.classList.remove('pise'); void dd.offsetWidth; dd.classList.add('pise');
          }
        }
      });
      predtym = h;
      var c = chyba(h);
      peciatka.classList.toggle('je', !c.length);
      stav.textContent = c.length ? 'Ešte vyplňte: ' + c.join(', ') + '.' : 'Objednávka je pripravená. Doplňte kontakt a odošlite ju.';
      form.querySelectorAll('.volby.chyba').forEach(function (f) { if (f.querySelector('input:checked')) f.classList.remove('chyba'); });
    };
    form.addEventListener('change', prekresli);
    form.addEventListener('input', prekresli);
    prekresli();
  }

  // názov vybranej fotky
  document.querySelectorAll('.subor-tl input').forEach(function (i) {
    i.addEventListener('change', function () {
      var m = i.parentNode.querySelector('.subor-meno');
      m.textContent = i.files.length ? i.files[0].name : m.getAttribute('data-prazdne');
    });
  });

  // formulár: kontrola a v návrhu sa nič neodosiela
  if (form) {
    var s = form.querySelector('.formular-stav');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('.past input').value) return;
      var h = hodnoty(), c = chyba(h), prve = null;
      form.querySelectorAll('.volby').forEach(function (f) {
        var zle = !f.querySelector('input:checked');
        f.classList.toggle('chyba', zle);
        if (zle && !prve) prve = f.querySelector('input');
      });
      ['meno', 'email'].forEach(function (n) {
        var i = form.elements[n], zle = !i.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(i.value.trim()));
        i.setAttribute('aria-invalid', zle ? 'true' : 'false');
        if (zle) { c.push(n === 'meno' ? 'meno' : 'e-mail'); if (!prve) prve = i; }
      });
      if (c.length) { s.textContent = 'Ešte vyplňte: ' + c.join(', ') + '.'; if (prve) prve.focus(); return; }
      var endpoint = form.getAttribute('data-endpoint');
      if (form.getAttribute('data-demo') === '1' || !endpoint) {
        s.textContent = 'Toto je ukážka webu, objednávka sa neodoslala. Po spustení budú chodiť priamo na ' + form.getAttribute('data-email') + '.';
        return;
      }
      s.textContent = 'Odosielam…';
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); s.textContent = 'Ďakujeme, objednávka bola odoslaná. Ozveme sa.'; })
        .catch(function () { s.textContent = 'Odoslanie sa nepodarilo. Napíšte nám, prosím, e-mail.'; });
    });
  }
})();
