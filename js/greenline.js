/**
 * greenline.js — Animated green line tracing the card border
 * in the "Intelligent assistance for your users" section.
 *
 * Uses IntersectionObserver to trigger the stroke-dashoffset animation
 * when the section scrolls into view. Loops continuously.
 * Works in both dark and light modes.
 */

(function () {
  'use strict';

  var SVG_VIEWBOX = '0 0 1004 424';

  // Card rect derived from the Lottie data:
  // transform matrix(0.9836, 0, 0, 0.9836, 500.974, 210.715)
  // inner rect ±124.43 × ±97.63, corner radius ~16
  // Actual pixel bounds: x 378–624, y 114–308, rx 16
  var RX = 16;
  var X = 378, Y = 114, W = 246, H = 194;

  // Build a rounded-rect path
  var CARD_PATH =
    'M ' + (X + RX) + ' ' + Y +
    ' L ' + (X + W - RX) + ' ' + Y +
    ' Q ' + (X + W) + ' ' + Y + ', ' + (X + W) + ' ' + (Y + RX) +
    ' L ' + (X + W) + ' ' + (Y + H - RX) +
    ' Q ' + (X + W) + ' ' + (Y + H) + ', ' + (X + W - RX) + ' ' + (Y + H) +
    ' L ' + (X + RX) + ' ' + (Y + H) +
    ' Q ' + X + ' ' + (Y + H) + ', ' + X + ' ' + (Y + H - RX) +
    ' L ' + X + ' ' + (Y + RX) +
    ' Q ' + X + ' ' + Y + ', ' + (X + RX) + ' ' + Y +
    ' Z';

  function init() {
    var container = document.getElementById('assistant-illustration');
    if (!container) return;

    container.style.position = 'relative';

    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', SVG_VIEWBOX);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;';

    // Glow filter
    var defs = document.createElementNS(svgNS, 'defs');
    var filter = document.createElementNS(svgNS, 'filter');
    filter.setAttribute('id', 'gl-glow');
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    var blur = document.createElementNS(svgNS, 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '3');
    blur.setAttribute('result', 'b');
    filter.appendChild(blur);
    var merge = document.createElementNS(svgNS, 'feMerge');
    var mn1 = document.createElementNS(svgNS, 'feMergeNode');
    mn1.setAttribute('in', 'b');
    var mn2 = document.createElementNS(svgNS, 'feMergeNode');
    mn2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(mn1);
    merge.appendChild(mn2);
    filter.appendChild(merge);
    defs.appendChild(filter);
    svg.appendChild(defs);

    // Path
    var path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', CARD_PATH);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#00DC8D');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('filter', 'url(#gl-glow)');
    path.id = 'gl-path';
    svg.appendChild(path);
    container.appendChild(svg);

    // Measure and set dash
    var len = path.getTotalLength();
    var visible = len * 0.18;
    var dash = visible + ' ' + (len - visible);
    path.style.strokeDasharray = dash;
    path.style.strokeDashoffset = len;

    // Inject CSS
    if (!document.getElementById('gl-css')) {
      var s = document.createElement('style');
      s.id = 'gl-css';
      s.textContent =
        '@keyframes gl{' +
          '0%{stroke-dashoffset:' + len + ';opacity:0}' +
          '5%{opacity:1}' +
          '90%{opacity:1}' +
          '100%{stroke-dashoffset:' + (-len) + ';opacity:0}' +
        '}' +
        '#gl-path{opacity:0;stroke-dasharray:' + dash + '}' +
        '#gl-path.on{animation:gl 2.5s cubic-bezier(.4,0,.2,1) infinite}';
      document.head.appendChild(s);
    }

    // Trigger on scroll
    var obs = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) path.classList.add('on');
    }, { threshold: 0.2 });
    obs.observe(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
