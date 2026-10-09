/* stub.js - minimal behaviour for the verification stub (PIPELINE role). Not the design's script. */
(function () {
  'use strict';
  /* BUILD-CONTRACT 4.5: forms are unwired - submission is stopped */
  document.addEventListener('submit', function (ev) {
    var f = ev.target;
    if (f && f.matches && f.matches('form[data-sr-unwired]')) { ev.preventDefault(); }
  });
  /* the submit buttons ship disabled (no-JS safety); enable them now that submission is intercepted */
  document.querySelectorAll('form[data-sr-unwired] [data-unwired-submit]').forEach(function (b) { b.disabled = false; });
  /* (###) ###-#### mask on [data-phone-format] */
  document.addEventListener('input', function (ev) {
    var t = ev.target;
    if (!t || !t.hasAttribute || !t.hasAttribute('data-phone-format')) return;
    var d = t.value.replace(/\D/g, '').slice(0, 10);
    t.value = d.length > 6 ? '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6) : d.length > 3 ? '(' + d.slice(0, 3) + ') ' + d.slice(3) : d;
  });
  /* conditional fields: data-show-if = {action, logic, enabled, when:[{field, operator, value}]} */
  function valuesOf(id) {
    var box = document.querySelector('[data-field="' + id + '"]');
    if (!box) return [];
    var out = [];
    box.querySelectorAll('input, select, textarea').forEach(function (el) {
      if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
      if (el.value) out.push(el.value);
    });
    return out;
  }
  function test(w) {
    var vals = valuesOf(w.field);
    var op = String(w.operator || 'is');
    if (op === 'is') return vals.indexOf(w.value) !== -1;
    if (op === 'is_not' || op === 'isnot' || op === 'not') return vals.indexOf(w.value) === -1;
    if (op === 'contains') return vals.some(function (v) { return v.indexOf(w.value) !== -1; });
    if (op === 'empty') return vals.length === 0;
    if (op === 'not_empty') return vals.length > 0;
    return false;
  }
  function applyRules() {
    document.querySelectorAll('[data-show-if]').forEach(function (el) {
      var r;
      try { r = JSON.parse(el.getAttribute('data-show-if')); } catch (e) { return; }
      if (!r || r.enabled === false) return;
      var hits = (r.when || []).map(test);
      var ok = r.logic === 'any' ? hits.some(Boolean) : hits.every(Boolean);
      var show = r.action === 'hide' ? !ok : ok;
      el.hidden = !show;
    });
  }
  document.addEventListener('change', applyRules);
  applyRules();
  /* frames "Show All" */
  document.querySelectorAll('[data-show-all]').forEach(function (b) { b.hidden = false; b.addEventListener('click', function () { b.hidden = true; }); });
  /* clickable cards (data-link) */
  document.addEventListener('click', function (ev) {
    var card = ev.target.closest && ev.target.closest('[data-link]');
    if (!card || ev.target.closest('a, button, input, select, textarea, label')) return;
    var a = card.querySelector('a[href]');
    if (a) a.click();
  });
})();
