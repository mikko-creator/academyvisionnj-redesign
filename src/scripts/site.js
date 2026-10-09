/* site.js - Academy Vision "Bayside Daylight Glass" (THEME-CORE; DESIGN-SPEC §7, §9.2-9.5, R-6 R-7 R-20 R-26 R-32).
   Vanilla, no network. Everything is progressive: without this file every section is visible, the desktop menus open
   on :hover / :focus-within, the phone drawer is a plain <details>, and the motion loops show their poster only.
   features.js (THEME-TEMPLATES) is concatenated after this file. */
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionOK = !reduceMQ.matches && 'IntersectionObserver' in window;

  /* ------------------------------------------------------------------ header: frost deepens once scrolled */
  const header = document.querySelector('[data-header]');
  const setScrolled = () => { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); };
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  /* ------------------------------------------------------------------ desktop disclosure menus (R-6, R-20) */
  const menus = Array.from(document.querySelectorAll('[data-menu]'));
  const btnOf = (m) => m.querySelector(':scope > button');
  const timers = new WeakMap();
  const clearTimer = (m) => { const t = timers.get(m); if (t) { window.clearTimeout(t); timers.delete(m); } };
  /* Services mega-menu art (operator, 2026-10-09): the card images carry data-src only, so the closed menu downloads
     nothing on page load. They load on the first hover intent (before the 90 ms open delay) or when the menu opens
     (click / keyboard), and fade in when decoded (chrome.css .mega-card). */
  const primeArt = (m) => {
    m.querySelectorAll('img[data-src]').forEach((i) => {
      const done = () => i.classList.add('is-loaded');
      i.addEventListener('load', done, { once: true });
      i.src = i.getAttribute('data-src');
      i.removeAttribute('data-src');
      if (i.complete && i.naturalWidth) done();
    });
  };
  const setOpen = (m, open) => {
    clearTimer(m);
    if (open) primeArt(m);
    m.classList.toggle('is-open', open);
    const b = btnOf(m);
    if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');   /* also when opened by hover (R-6) */
  };
  const closeAll = (except) => menus.forEach((m) => { if (m !== except && m.classList.contains('is-open')) setOpen(m, false); });
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  menus.forEach((m) => {
    const b = btnOf(m);
    if (!b) return;
    /* the state is announced only where script keeps it true: without JS the panels open by CSS hover / focus-within
       and a static aria-expanded="false" was wrong while open (QA round 1, F6) */
    b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', () => {
      const open = !m.classList.contains('is-open');
      closeAll(m);
      m.classList.remove('is-dismissed');
      setOpen(m, open);
    });
    /* hover intent: open 90 ms after the pointer enters, close 260 ms after it leaves */
    m.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !finePointer.matches || m.classList.contains('is-dismissed')) return;
      primeArt(m);
      clearTimer(m);
      timers.set(m, window.setTimeout(() => { closeAll(m); setOpen(m, true); }, 90));
    });
    m.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      m.classList.remove('is-dismissed');
      clearTimer(m);
      if (!m.classList.contains('is-open') || m.contains(document.activeElement)) return;
      timers.set(m, window.setTimeout(() => { if (!m.contains(document.activeElement)) setOpen(m, false); }, 260));
    });
    m.addEventListener('focusout', (e) => {
      if (!m.contains(e.relatedTarget)) { setOpen(m, false); m.classList.remove('is-dismissed'); }
    });
  });
  document.addEventListener('pointerdown', (e) => { menus.forEach((m) => { if (!m.contains(e.target) && m.classList.contains('is-open')) setOpen(m, false); }); });

  /* ------------------------------------------------------------------ phone / tablet drawer: modal <details> (R-7, G8) */
  const mnav = document.querySelector('[data-mnav]');
  let drawerClose = null;
  if (mnav) {
    const sum = mnav.querySelector(':scope > summary');
    const panel = mnav.querySelector('.m-nav__panel');
    const scrim = mnav.querySelector('[data-mnav-scrim]');
    const outside = () => [document.querySelector('main'), document.querySelector('.site-footer')].filter(Boolean);
    const focusables = () => [sum, ...Array.from(panel.querySelectorAll('a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'))]
      .filter((el) => el && el.getClientRects().length && !el.closest('details:not([open]) > :not(summary)'));
    const label = (open) => { if (sum) sum.setAttribute('aria-label', open ? (sum.dataset.labelClose || 'Close menu') : (sum.dataset.labelOpen || 'Open menu')); };
    const onKey = (e) => {
      if (!mnav.open) return;
      if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) return;
      const i = list.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); list[list.length - 1].focus(); }
      else if (!e.shiftKey && (i === -1 || i === list.length - 1)) { e.preventDefault(); list[0].focus(); }
    };
    function opened() {
      root.style.setProperty('--sbw', Math.max(0, window.innerWidth - root.clientWidth) + 'px');
      root.classList.add('menu-open');
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-label', panel.dataset.dialogLabel || 'Menu');
      outside().forEach((el) => { el.inert = true; });
      label(true);
      document.addEventListener('keydown', onKey, true);
      const first = panel.querySelector('a[href], summary, button');
      if (first) first.focus({ preventScroll: true });
    }
    function closed(returnFocus) {
      root.classList.remove('menu-open');
      panel.removeAttribute('role'); panel.removeAttribute('aria-modal'); panel.removeAttribute('aria-label');
      outside().forEach((el) => { el.inert = false; });
      label(false);
      document.removeEventListener('keydown', onKey, true);
      if (returnFocus && sum) sum.focus({ preventScroll: true });
    }
    let returnFocus = true;
    function close(focusBack) { returnFocus = focusBack !== false; if (mnav.open) mnav.open = false; }
    drawerClose = close;
    mnav.addEventListener('toggle', () => { if (mnav.open) opened(); else { closed(returnFocus); returnFocus = true; } });
    label(mnav.open);
    if (mnav.open) opened();
    if (scrim) scrim.addEventListener('click', () => close(true));
    panel.addEventListener('click', (e) => { if (e.target.closest('a[href]')) close(false); });
    window.matchMedia('(min-width: 77.5em)').addEventListener('change', (e) => { if (e.matches) close(false); });
  }

  /* Esc: closes an open desktop panel (focus back to its trigger, hover re-open suppressed until the pointer leaves).
     Only a panel that is actually open is dismissed: Esc on a closed trigger must not block its hover-open later. */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const m = menus.find((x) => x.classList.contains('is-open'));
    if (!m) return;
    const hadFocus = m.contains(document.activeElement);
    setOpen(m, false);
    m.classList.add('is-dismissed');
    const b = btnOf(m);
    if (b && hadFocus) b.focus({ preventScroll: true });
  });

  /* ------------------------------------------------------------------ map frames: keyboard focus ring (§8, R-30)
     Keyboard focus that Tabs into the cross-origin map iframe matches neither :focus on the iframe nor :focus-within on
     its frame in Chrome (measured 2026-10-09: activeElement = IFRAME, only a window blur fires), so the frame gets
     .is-kbd-focus from that blur. A pointer click into the map (pointer over the frame) shows no ring; focus coming back
     to this document clears it. */
  const maps = Array.from(document.querySelectorAll('.map-frame'));
  if (maps.length) {
    let pointerIn = null;
    maps.forEach((m) => {
      m.addEventListener('pointerenter', () => { pointerIn = m; });
      m.addEventListener('pointerleave', () => { if (pointerIn === m) pointerIn = null; });
    });
    const clearMaps = () => maps.forEach((m) => m.classList.remove('is-kbd-focus'));
    window.addEventListener('blur', () => {
      window.setTimeout(() => {
        const a = document.activeElement;
        const m = a && a.tagName === 'IFRAME' ? a.closest('.map-frame') : null;
        clearMaps();
        if (m && m !== pointerIn) m.classList.add('is-kbd-focus');
      }, 0);
    });
    window.addEventListener('focus', clearMaps);
    document.addEventListener('focusin', clearMaps);
  }

  /* ------------------------------------------------------------------ motion loops (§7.4, R-26): <= 5 s per entry */
  const videos = Array.from(document.querySelectorAll('video[data-loop]'));
  const toggles = Array.from(document.querySelectorAll('[data-loop-toggle]'));
  if (!motionOK || !videos.length) {
    toggles.forEach((t) => { t.hidden = true; });
  } else {
    const PLAY_MS = 5000;
    const st = new Map(videos.map((v) => [v, { timer: 0, userPaused: false, visible: false, ready: false }]));
    const pick = (v) => {
      for (const s of v.querySelectorAll('source[data-src]')) {
        const m = s.getAttribute('data-media');
        if (m && !window.matchMedia(m).matches) continue;
        if (s.type && !v.canPlayType(s.type)) continue;
        return s.getAttribute('data-src');
      }
      return null;
    };
    const toggleFor = (v) => toggles.find((t) => t.getAttribute('data-loop-toggle') === v.id) || null;
    const show = (v, playing) => {
      const t = toggleFor(v);
      if (!t) return;
      t.setAttribute('data-state', playing ? 'playing' : 'paused');
      t.setAttribute('aria-label', playing ? (t.dataset.labelPause || 'Pause') : (t.dataset.labelPlay || 'Play'));
    };
    const stop = (v) => { const s = st.get(v); window.clearTimeout(s.timer); s.timer = 0; if (!v.paused) v.pause(); show(v, false); };
    const play = (v) => {
      const s = st.get(v);
      if (!s.ready) { const src = pick(v); if (!src) return; v.muted = true; v.src = src; s.ready = true; }
      window.clearTimeout(s.timer);
      const p = v.play();
      if (p && p.catch) p.catch(() => show(v, false));
      show(v, true);
      s.timer = window.setTimeout(() => stop(v), PLAY_MS);
    };
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      const v = en.target, s = st.get(v);
      s.visible = en.intersectionRatio >= 0.3;
      if (s.visible && !s.userPaused && document.visibilityState === 'visible') play(v);
      else if (!s.visible) stop(v);
    }), { threshold: [0, 0.3] });
    const start = () => videos.forEach((v) => io.observe(v));
    if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible') videos.forEach(stop); });
    toggles.forEach((t) => {
      const v = videos.find((x) => x.id === t.getAttribute('data-loop-toggle'));
      if (!v) { t.hidden = true; return; }
      t.hidden = false;
      t.addEventListener('click', () => {
        const s = st.get(v);
        if (!v.paused) { s.userPaused = true; stop(v); } else { s.userPaused = false; play(v); }
      });
    });
    reduceMQ.addEventListener('change', (e) => { if (e.matches) { videos.forEach(stop); toggles.forEach((t) => { t.hidden = true; }); } });
  }

  if (!motionOK) return;   /* reduced motion or no IntersectionObserver: static and fully visible */
  root.classList.add('js-motion');

  /* ------------------------------------------------------------------ reveals (§7.1, R-32) */
  document.querySelectorAll('[data-stagger]').forEach((g) => {
    Array.from(g.children).forEach((c, i) => c.style.setProperty('--d', (Math.min(i, 6) * 85) + 'ms'));
  });
  const pending = new Set();
  let delivered = false;
  const io = new IntersectionObserver((entries) => {
    delivered = true;
    entries.forEach((en) => { if (en.isIntersecting) release(en.target, false); });
  }, { threshold: 0, rootMargin: '0px' });
  function release(el, instant) {
    if (!pending.delete(el)) return;
    io.unobserve(el);
    if (instant) { el.classList.remove('rv'); el.removeAttribute('data-reveal'); return; }
    el.classList.add('is-in');
    const d = parseFloat(el.style.getPropertyValue('--d')) || 0;
    const hold = el.querySelector('.swoosh') ? 2100 : 1300;
    /* hand the element back to its own hover / transform rules once the entrance has played */
    window.setTimeout(() => { el.classList.remove('rv', 'is-in'); el.removeAttribute('data-reveal'); }, hold + d);
  }
  const vh0 = window.innerHeight;
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    if (el.closest('.mega, .drop, .m-nav')) return;
    const r = el.getBoundingClientRect();
    if (r.top < vh0) return;            /* only boxes entirely below the first screen are ever hidden */
    el.classList.add('rv');
    pending.add(el);
  });
  /* second look: the hidden offset can slide a gated element into view */
  pending.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < window.innerHeight && r.bottom > 0) release(el, true); });
  pending.forEach((el) => io.observe(el));
  /* keyboard focus never lands on a hidden or half-faded reveal (QA round 1, F4: a Tab onto a related card found its
     .rv ancestor at opacity 0 for up to ~1.4 s): every reveal around the focused element finishes at once */
  document.addEventListener('focusin', (e) => {
    for (let n = e.target instanceof Element ? e.target : null; n && n !== document.body; n = n.parentElement) {
      if (!n.classList.contains('rv')) continue;
      if (pending.has(n)) release(n, true);
      else { n.classList.remove('rv', 'is-in'); n.removeAttribute('data-reveal'); }
    }
  }, true);
  const sweep = () => {
    if (!pending.size) return;
    const vh = window.innerHeight;
    pending.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < vh) release(el, r.bottom < 0); });
  };
  let sweepQueued = false;
  window.addEventListener('scroll', () => {
    if (sweepQueued) return;
    sweepQueued = true;
    requestAnimationFrame(() => { sweepQueued = false; sweep(); });
  }, { passive: true });
  const sweepTimer = window.setInterval(() => { sweep(); if (!pending.size) window.clearInterval(sweepTimer); }, 1000);
  window.setTimeout(() => {
    if (!delivered && document.visibilityState === 'visible') Array.from(pending).forEach((el) => release(el, true));
  }, 3000);
  window.addEventListener('beforeprint', () => Array.from(pending).forEach((el) => release(el, true)));

  /* ------------------------------------------------------------------ restrained parallax (§6.2): translate only */
  const depthEls = Array.from(document.querySelectorAll('[data-depth]'));
  if (!depthEls.length) return;
  const pageTop = (el) => { let t = 0; for (let n = el; n; n = n.offsetParent) t += n.offsetTop; return t; };
  let bases = [];
  const measure = () => {
    bases = depthEls.map((el) => ({
      el,
      mid: pageTop(el) + el.offsetHeight / 2,
      k: parseFloat(el.dataset.depth) || 0,
      /* data-depth-from: no parallax below that viewport width (title-band cut-outs: 1024) */
      max: window.innerWidth < (parseFloat(el.dataset.depthFrom) || 0) ? 0 : (parseFloat(el.dataset.depthMax) || 40) * (window.innerWidth < 768 ? 0.5 : 1),
    }));
  };
  let raf = 0;
  const frame = () => {
    raf = 0;
    const vh = window.innerHeight;
    if (vh > 1600) { depthEls.forEach((el) => { el.style.translate = ''; }); return; }   /* a full-page capture */
    const y = window.scrollY;
    bases.forEach((b) => {
      const off = -((b.mid - y) - vh / 2) * b.k;
      const v = Math.max(-b.max, Math.min(b.max, off));
      b.el.style.translate = '0 ' + v.toFixed(1) + 'px';
    });
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(frame); };
  measure();
  frame();
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', () => { measure(); queue(); });
  window.addEventListener('load', () => { measure(); queue(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); queue(); });
  reduceMQ.addEventListener('change', (e) => { if (e.matches) { depthEls.forEach((el) => { el.style.translate = ''; }); window.removeEventListener('scroll', queue); } });
  void drawerClose;
})();
