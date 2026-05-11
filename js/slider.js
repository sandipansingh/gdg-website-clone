/**
 * slider.js — Carousel for the "Loved by your favorite companies" section
 *
 * Works with the existing HTML structure that uses Shadcn-style
 * data-slot="carousel / carousel-content / carousel-item /
 *             carousel-previous / carousel-next" attributes.
 *
 * Features:
 *  • Smooth CSS-transform sliding (one card at a time)
 *  • Prev/next buttons auto-disabled at boundaries
 *  • Keyboard navigation (← →) when carousel is focused
 *  • Touch / swipe support on mobile
 *  • Recalculates on window resize
 */

(function () {
  "use strict";

  /* ─── Per-carousel initialiser ─────────────────────────────────────────── */

  function initCarousel(carousel) {
    /* ── DOM refs ── */
    const content = carousel.querySelector('[data-slot="carousel-content"]');
    const track = content && content.querySelector(":scope > div");
    const items = Array.from(
      carousel.querySelectorAll('[data-slot="carousel-item"]'),
    );
    const prevBtn = carousel.querySelector('[data-slot="carousel-previous"]');
    const nextBtn = carousel.querySelector('[data-slot="carousel-next"]');

    if (!track || items.length === 0 || !prevBtn || !nextBtn) return;

    /* ── State ── */
    let currentIndex = 0;
    const total = items.length;

    /* Add smooth transition to the track (none was set in the HTML) */
    track.style.transition = "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)";

    /* ── Helpers ── */

    /** Width of a single carousel item including its pl-4 padding gap */
    function itemWidth() {
      return items[0].offsetWidth;
    }

    /**
     * How many whole cards are visible inside the carousel content area at once.
     * Uses the actual rendered width of the content element.
     */
    function visibleCount() {
      const w = itemWidth();
      if (w <= 0) return 1;
      return Math.max(1, Math.round(content.offsetWidth / w));
    }

    /** Highest valid index (last "page" start) */
    function maxIdx() {
      return Math.max(0, total - visibleCount());
    }

    /* ── Core navigation ── */

    function goTo(idx) {
      currentIndex = Math.max(0, Math.min(idx, maxIdx()));

      /* Translate the track */
      track.style.transform =
        "translate3d(" + -currentIndex * itemWidth() + "px, 0px, 0px)";

      /* Update button states */
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= maxIdx();

      /* ARIA live region — optional but accessible */
      carousel.setAttribute(
        "aria-label",
        "Slide " + (currentIndex + 1) + " of " + total,
      );
    }

    /* ── Button listeners ── */
    prevBtn.addEventListener("click", function () {
      goTo(currentIndex - 1);
    });
    nextBtn.addEventListener("click", function () {
      goTo(currentIndex + 1);
    });

    /* ── Keyboard navigation ── */
    carousel.setAttribute("tabindex", "0");
    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(currentIndex - 1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(currentIndex + 1);
      }
      if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      }
      if (e.key === "End") {
        e.preventDefault();
        goTo(maxIdx());
      }
    });

    /* ── Touch / swipe support ── */
    var touchStartX = 0;
    var touchStartY = 0;
    var isDragging = false;

    content.addEventListener(
      "touchstart",
      function (e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isDragging = false;
      },
      { passive: true },
    );

    content.addEventListener(
      "touchmove",
      function (e) {
        var dx = Math.abs(e.touches[0].clientX - touchStartX);
        var dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dx > dy) isDragging = true; /* horizontal swipe detected */
      },
      { passive: true },
    );

    content.addEventListener(
      "touchend",
      function (e) {
        if (!isDragging) return;
        var delta = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 50) {
          goTo(currentIndex + (delta > 0 ? 1 : -1));
        }
      },
      { passive: true },
    );

    /* ── Resize handler ── */
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        goTo(currentIndex); /* recalculate position with new widths */
      }, 100);
    });

    /* ── Initialise ── */
    goTo(0);
  }

  /* ─── Bootstrap ─────────────────────────────────────────────────────────── */

  function init() {
    document.querySelectorAll('[data-slot="carousel"]').forEach(initCarousel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
