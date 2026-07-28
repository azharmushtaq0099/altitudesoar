/**
 * Zelrova Preloader — drop-in agency signature
 * Works with or without GSAP. Uses CSS animations as fallback.
 * Usage: <script src="/zelrova-preloader.js"></script> in <head>
 */
(function () {
  'use strict';

  var HOLD_MS   = 1800;  // min display time
  var MAX_MS    = 3500;  // hard kill — always exits even if GSAP never loads

  // ── 1. Inject overlay immediately ────────────────────────────────────────
  var CSS = [
    '#zlv{position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;pointer-events:all;overflow:hidden}',
    '#zlv-a,#zlv-b{position:absolute;left:0;width:100%;height:50%;background:#0a0a0a;transition:transform 0.85s cubic-bezier(0.76,0,0.24,1)}',
    '#zlv-a{top:0}#zlv-b{bottom:0}',
    '#zlv-c{position:absolute;top:50%;left:50%;transform:translate(-50%,-54%);text-align:center;z-index:2;user-select:none}',
    '#zlv-w{display:flex;justify-content:center;align-items:flex-end;overflow:visible}',
    '.zlv-lw{overflow:hidden;display:inline-block;line-height:0.85}',
    /* CSS fallback entrance — letters rise up */
    '@keyframes zlv-in{from{transform:translateY(115%)}to{transform:translateY(0%)}}',
    '@keyframes zlv-line-in{from{transform:scaleX(0)}to{transform:scaleX(1)}}',
    '@keyframes zlv-fade-in{from{opacity:0}to{opacity:1}}',
    '.zlv-l{display:inline-block;font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Helvetica,Arial,sans-serif;',
    'font-size:clamp(64px,11vw,144px);font-weight:800;letter-spacing:0.06em;color:#fff;',
    'text-transform:uppercase;will-change:transform;-webkit-font-smoothing:antialiased;',
    'animation:zlv-in 1.1s cubic-bezier(0.16,1,0.3,1) both}',
    '#zlv-line{margin:1.4rem auto 0;height:1px;width:clamp(180px,36vw,480px);background:rgba(255,255,255,0.15);transform-origin:left;',
    'animation:zlv-line-in 1.0s cubic-bezier(0.16,1,0.3,1) 0.35s both}',
    '#zlv-tag{margin-top:1.1rem;font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Helvetica,Arial,sans-serif;',
    'font-size:clamp(9px,1vw,11px);letter-spacing:0.38em;color:rgba(255,255,255,0.35);',
    'text-transform:uppercase;animation:zlv-fade-in 0.7s ease 0.65s both}',
    /* Exit state via class */
    '#zlv.zlv-exit #zlv-a{transform:translateY(-100%)}',
    '#zlv.zlv-exit #zlv-b{transform:translateY(100%)}',
    '#zlv.zlv-exit .zlv-l{animation:none;transform:translateY(-25%);opacity:0;transition:transform 0.5s ease,opacity 0.5s ease}',
    '#zlv.zlv-exit #zlv-line,#zlv.zlv-exit #zlv-tag{opacity:0;transition:opacity 0.3s ease}'
  ].join('');

  var letters = 'ZELROVA'.split('').map(function (l, i) {
    return '<span class="zlv-lw"><span class="zlv-l" style="animation-delay:' + (i * 0.055) + 's">' + l + '</span></span>';
  }).join('');

  var overlay = document.createElement('div');
  overlay.id = 'zlv';
  overlay.innerHTML =
    '<div id="zlv-a"></div>' +
    '<div id="zlv-b"></div>' +
    '<div id="zlv-c">' +
      '<div id="zlv-w">' + letters + '</div>' +
      '<div id="zlv-line"></div>' +
      '<div id="zlv-tag">Real Estate &middot; Design &middot; Intelligence</div>' +
    '</div>';

  var sEl = document.createElement('style');
  sEl.textContent = CSS;

  function inject() {
    document.head.appendChild(sEl);
    if (document.body) {
      document.body.insertBefore(overlay, document.body.firstChild);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        document.body.insertBefore(overlay, document.body.firstChild);
      });
    }
  }
  inject();

  // ── 2. Exit function ─────────────────────────────────────────────────────
  var exited = false;
  function exit() {
    if (exited) return;
    exited = true;

    if (typeof gsap !== 'undefined') {
      // GSAP exit — smooth letter fly-up + panel split
      var lEls = Array.from(overlay.querySelectorAll('.zlv-l'));
      var panA = overlay.querySelector('#zlv-a');
      var panB = overlay.querySelector('#zlv-b');
      var line = overlay.querySelector('#zlv-line');
      var tag  = overlay.querySelector('#zlv-tag');

      // Cancel CSS animations first
      lEls.forEach(function (el) {
        var cur = getComputedStyle(el).transform;
        el.style.animation = 'none';
        el.style.transform = cur;
      });

      var ex = gsap.timeline({
        onComplete: function () { overlay.parentNode && overlay.parentNode.removeChild(overlay); sEl.parentNode && sEl.parentNode.removeChild(sEl); }
      });
      ex.to(lEls, { y: '-25%', opacity: 0, duration: 0.5, stagger: 0.025, ease: 'power3.in' }, 0);
      ex.to([line, tag], { opacity: 0, duration: 0.3 }, 0);
      ex.to(panA, { y: '-100%', duration: 0.85, ease: 'expo.inOut' }, 0.1);
      ex.to(panB, { y: '100%',  duration: 0.85, ease: 'expo.inOut' }, 0.1);
    } else {
      // CSS-only exit — add class, remove after transition
      overlay.classList.add('zlv-exit');
      setTimeout(function () {
        overlay.parentNode && overlay.parentNode.removeChild(overlay);
        sEl.parentNode    && sEl.parentNode.removeChild(sEl);
      }, 950);
    }
  }

  // ── 3. Trigger logic ────────────────────────────────────────────────────
  var startTime = Date.now();

  // Hard kill at MAX_MS no matter what
  var hardTimer = setTimeout(exit, MAX_MS);

  window.addEventListener('load', function () {
    clearTimeout(hardTimer);
    var elapsed = Date.now() - startTime;
    setTimeout(exit, Math.max(0, HOLD_MS - elapsed));
  });

}());
