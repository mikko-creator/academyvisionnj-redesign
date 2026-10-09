/* features.js - behaviour of the interior blocks (THEME-TEMPLATES role; DESIGN-SPEC 10.18-10.23, BUILD-CONTRACT 4.5).
   Vanilla, no network, concatenated after THEME-CORE's site.js. Everything is progressive: without this file every
   review shows its full text in a scrollable list, all 26 frame brands show, photos are plain prints, and the forms
   keep their submit button disabled (an unwired form must never send its fields anywhere).
   Every UI string comes from the markup (the models' ui / messages copy); this file writes no copy of its own. */
(function () {
  'use strict';
  var doc = document;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------ review carousel (10.19): no autoplay */
  $$('[data-carousel]').forEach(function (car) {
    var viewport = car.querySelector('.carousel__viewport');
    var slides = $$('.carousel__slide', car);
    var controls = car.querySelector('.carousel__controls');
    var prev = car.querySelector('[data-prev]');
    var next = car.querySelector('[data-next]');
    var dots = $$('[data-dot]', car);
    var moreLabel = car.getAttribute('data-show-more') || '';
    if (!viewport || !slides.length) return;

    /* Show More: the full quote stays in the markup (build-verify reads it); the excerpt is shown first */
    slides.forEach(function (slide) {
      var excerpt = slide.getAttribute('data-excerpt');
      var full = slide.querySelector('.review-card__quote p');
      if (!excerpt || !full || !moreLabel) return;
      var short = doc.createElement('p');
      short.className = 'carousel__excerpt';
      short.textContent = excerpt;
      full.hidden = true;
      full.setAttribute('tabindex', '-1');
      full.parentNode.insertBefore(short, full);
      var btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'carousel__more';
      btn.textContent = moreLabel;
      full.parentNode.parentNode.insertBefore(btn, full.parentNode.nextSibling);
      btn.addEventListener('click', function () {
        full.hidden = false;
        short.remove();
        btn.remove();
        full.focus({ preventScroll: true });
      });
    });

    if (!controls) return;
    controls.hidden = false;
    var behavior = reduceMotion ? 'auto' : 'smooth';
    var gap = function () { var s = getComputedStyle(car.querySelector('.carousel__track')); return parseFloat(s.columnGap || s.gap) || 0; };
    var step = function () { return slides[0].getBoundingClientRect().width + gap(); };
    var current = function () { return Math.max(0, Math.min(slides.length - 1, Math.round(viewport.scrollLeft / Math.max(1, step())))); };
    var goTo = function (i) {
      var n = Math.max(0, Math.min(slides.length - 1, i));
      viewport.scrollTo({ left: slides[n].offsetLeft - slides[0].offsetLeft, behavior: behavior });
    };
    var sync = function () {
      var i = current();
      var max = viewport.scrollWidth - viewport.clientWidth - 8;
      if (prev) prev.setAttribute('aria-disabled', viewport.scrollLeft <= 8 ? 'true' : 'false');
      if (next) next.setAttribute('aria-disabled', viewport.scrollLeft >= max ? 'true' : 'false');
      dots.forEach(function (d, k) {
        if (k === i) { d.setAttribute('aria-current', 'true'); d.removeAttribute('tabindex'); }
        else { d.removeAttribute('aria-current'); d.setAttribute('tabindex', '-1'); }
      });
    };
    if (prev) prev.addEventListener('click', function () { if (prev.getAttribute('aria-disabled') !== 'true') goTo(current() - 1); });
    if (next) next.addEventListener('click', function () { if (next.getAttribute('aria-disabled') !== 'true') goTo(current() + 1); });
    dots.forEach(function (d, k) {
      d.addEventListener('click', function () { goTo(k); });
      /* roving focus: one Tab stop for the dot row, arrows move between dots */
      d.addEventListener('keydown', function (e) {
        var to = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = Math.min(dots.length - 1, k + 1);
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = Math.max(0, k - 1);
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = dots.length - 1;
        if (to === null) return;
        e.preventDefault();
        dots[to].removeAttribute('tabindex');
        d.setAttribute('tabindex', '-1');
        dots[to].focus();
        goTo(to);
      });
    });
    var queued = false;
    viewport.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () { queued = false; sync(); });
    }, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  /* ------------------------------------------------------------------ frames "Show All" (10.18) */
  $$('[data-show-all-root]').forEach(function (root) {
    var btn = root.querySelector('[data-show-all]');
    var count = parseInt(root.getAttribute('data-show-all-count'), 10) || 12;
    var items = $$('.chip', root);
    if (!btn || items.length <= count) return;
    root.classList.add('is-collapsed');
    btn.hidden = false;
    btn.addEventListener('click', function () {
      root.classList.remove('is-collapsed');
      btn.setAttribute('aria-expanded', 'true');
      btn.hidden = true;
      var first = items[count];
      if (first) { first.setAttribute('tabindex', '-1'); first.focus({ preventScroll: false }); }
    });
  });

  /* ------------------------------------------------------------------ practice photos: lightbox toggles (10.20) */
  $$('[data-lightbox-label]').forEach(function (list) {
    var label = list.getAttribute('data-lightbox-label');
    var openBox = null, openBtn = null;
    var close = function () {
      if (openBox) { openBox.remove(); openBox = null; }
      if (openBtn) { openBtn.setAttribute('aria-expanded', 'false'); openBtn = null; }
    };
    $$('[data-lightbox-item]', list).forEach(function (item) {
      var img = item.querySelector('img');
      if (!img) return;
      var btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'photo-fan__btn';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('aria-expanded', 'false');
      img.parentNode.insertBefore(btn, img);
      btn.appendChild(img);
      btn.addEventListener('click', function () {
        if (openBtn === btn) { close(); return; }
        close();
        var box = doc.createElement('div');
        box.className = 'lightbox';
        box.setAttribute('aria-hidden', 'true');
        var big = doc.createElement('img');
        big.alt = '';
        if (img.getAttribute('srcset')) { big.setAttribute('srcset', img.getAttribute('srcset')); big.setAttribute('sizes', '90vw'); }
        big.src = img.currentSrc || img.src;
        /* a flagged photo keeps its crop when enlarged (DESIGN-SPEC 13.5: the street view's roadside sign prints the
           second phone number, so the enlarged view is the same 1:1 crop, never the whole frame) */
        if (item.classList.contains('photo-fan__item--square')) {
          big.className = 'lightbox__img--square';
          big.style.setProperty('--pos', item.style.getPropertyValue('--pos') || '12% 50%');
        }
        box.appendChild(big);
        box.addEventListener('click', function () { close(); btn.focus({ preventScroll: true }); });
        doc.body.appendChild(box);
        openBox = box;
        openBtn = btn;
        btn.setAttribute('aria-expanded', 'true');
      });
    });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openBox) { var b = openBtn; close(); if (b) b.focus({ preventScroll: true }); } });
  });

  /* ------------------------------------------------------------------ forms (10.23): unwired, BUILD-CONTRACT 4.5 */
  var forms = $$('form[data-sr-unwired]');
  if (!forms.length) return;

  /* (###) ###-#### mask on [data-phone-format] (the source's formatter) */
  doc.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || !t.hasAttribute || !t.hasAttribute('data-phone-format')) return;
    var d = t.value.replace(/\D/g, '').slice(0, 10);
    t.value = d.length > 6 ? '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6) : d.length > 3 ? '(' + d.slice(0, 3) + ') ' + d.slice(3) : d;
  });

  forms.forEach(function (form) {
    var msg = {
      required: form.getAttribute('data-msg-required') || '',
      radio: form.getAttribute('data-msg-radio') || form.getAttribute('data-msg-required') || '',
      checkbox: form.getAttribute('data-msg-checkbox') || form.getAttribute('data-msg-required') || '',
      error: form.getAttribute('data-msg-error') || '',
    };
    var fields = $$('[data-field]', form);
    var byId = {};
    fields.forEach(function (f) { byId[f.getAttribute('data-field')] = f; });

    /* conditional fields: data-show-if = {action, logic, enabled, when:[{field, operator, value}]} */
    var valuesOf = function (id) {
      var box = byId[id];
      if (!box || box.hidden) return [];
      var out = [];
      $$('input, select, textarea', box).forEach(function (el) {
        if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
        if (el.value) out.push(el.value);
      });
      return out;
    };
    var test = function (w) {
      var vals = valuesOf(w.field);
      var op = String(w.operator || 'is');
      if (op === 'is') return vals.indexOf(w.value) !== -1;
      if (op === 'is_not' || op === 'isnot' || op === 'not') return vals.indexOf(w.value) === -1;
      if (op === 'contains') return vals.some(function (v) { return v.indexOf(w.value) !== -1; });
      if (op === 'empty') return vals.length === 0;
      if (op === 'not_empty') return vals.length > 0;
      return false;
    };
    var rules = fields.filter(function (f) { return f.hasAttribute('data-show-if'); }).map(function (f) {
      var r = null;
      try { r = JSON.parse(f.getAttribute('data-show-if')); } catch (err) { r = null; }
      return { el: f, rule: r };
    });
    var applyRules = function () {
      for (var pass = 0; pass < 3; pass++) {           /* a revealed field can itself drive a rule */
        var changed = false;
        rules.forEach(function (x) {
          var r = x.rule;
          if (!r || r.enabled === false) return;
          var hits = (r.when || []).map(test);
          var ok = r.logic === 'any' ? hits.some(Boolean) : hits.every(Boolean);
          var show = r.action === 'hide' ? !ok : ok;
          if (x.el.hidden === show) { x.el.hidden = !show; changed = true; if (!show) clearError(x.el); }
        });
        if (!changed) break;
      }
    };

    /* validation with the source's own copy (messages.validation) */
    var errEl = function (f) { return f.querySelector('.field__error'); };
    var controlsOf = function (f) { return $$('input:not([type="hidden"]), select, textarea', f); };
    function clearError(f) {
      var e = errEl(f);
      if (e) { e.hidden = true; e.textContent = ''; }
      controlsOf(f).forEach(function (c) {
        c.removeAttribute('aria-invalid');
        var ids = (c.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (id) { return id && (!e || id !== e.id); });
        if (ids.length) c.setAttribute('aria-describedby', ids.join(' ')); else c.removeAttribute('aria-describedby');
      });
    }
    var setError = function (f, text) {
      var e = errEl(f);
      if (!e) return;
      e.textContent = text;
      e.hidden = false;
      controlsOf(f).forEach(function (c) {
        c.setAttribute('aria-invalid', 'true');
        var ids = (c.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
        if (ids.indexOf(e.id) === -1) ids.push(e.id);
        c.setAttribute('aria-describedby', ids.join(' '));
      });
    };
    var problemOf = function (f) {
      if (f.hidden) return null;
      var kind = f.getAttribute('data-choice');
      if (kind) {
        var boxes = $$('input[type="' + kind + '"]', f);
        var needed = f.getAttribute('data-required') === '1' || boxes.some(function (b) { return b.required || b.hasAttribute('data-required-group'); });
        if (needed && !boxes.some(function (b) { return b.checked; })) return kind === 'radio' ? msg.radio : msg.checkbox;
        return null;
      }
      var missing = controlsOf(f).some(function (c) { return c.required && !String(c.value || '').trim(); });
      if (missing) return msg.required;
      var bad = controlsOf(f).filter(function (c) { return String(c.value || '').trim() && c.checkValidity && !c.checkValidity(); })[0];
      return bad ? bad.validationMessage : null;
    };
    var validate = function () {
      var first = null;
      fields.forEach(function (f) {
        var p = problemOf(f);
        if (p) { setError(f, p); if (!first) first = f; } else clearError(f);
      });
      return first;
    };

    form.addEventListener('change', function (e) { applyRules(); var f = e.target.closest && e.target.closest('[data-field]'); if (f && errEl(f) && !errEl(f).hidden && !problemOf(f)) clearError(f); });
    form.addEventListener('input', function (e) { var f = e.target.closest && e.target.closest('[data-field]'); if (f && errEl(f) && !errEl(f).hidden && !problemOf(f)) clearError(f); });
    applyRules();

    var notice = form.querySelector('.form__notice');
    form.addEventListener('submit', function (e) {
      e.preventDefault();                                /* unwired: nothing is ever sent */
      if (notice) notice.hidden = true;
      var bad = validate();
      if (bad) {
        var c = controlsOf(bad)[0];
        if (c) c.focus();
        return;
      }
      /* the honest notice: the source's own error copy + the scheduler and phone; never a success claim */
      if (notice) {
        var t = notice.querySelector('.form__notice-text');
        if (t) t.textContent = msg.error;
        notice.hidden = false;
        notice.focus();
      }
    });
    /* the button ships disabled (no-JS safety); submission is intercepted now, so enable it */
    $$('[data-unwired-submit]', form).forEach(function (b) { b.disabled = false; });
  });
})();
