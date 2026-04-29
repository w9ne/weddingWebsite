// ─────────────────────────────────────────
// WEDDING WEBSITE — script.js
// ─────────────────────────────────────────

// ── DOM REFERENCES ──────────────────────
const timelineItems = document.querySelectorAll('.timeline-item');
const trackFill     = document.getElementById('trackFill');
const storySection  = document.getElementById('story');
const heroVideo     = document.getElementById('hero-video');


// ── SCROLL HANDLER ───────────────────────
// Drives two effects on scroll:
//   1. Grows the rose gold timeline line proportionally to scroll depth
//   2. Fades each chapter in/out based on its position in the viewport

function handleScroll() {
  const viewportHeight = window.innerHeight;

  // --- Chapter visibility ---
  timelineItems.forEach(item => {
    const rect     = item.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const inView = midpoint > viewportHeight * 0.1 && midpoint < viewportHeight * 1.2;
    item.classList.toggle('visible', inView);
  });

  // --- Timeline line fill ---
  const storyTop    = storySection.getBoundingClientRect().top + window.scrollY;
  const storyHeight = storySection.offsetHeight;
  const scrolledPast = Math.max(0, -storySection.getBoundingClientRect().top);

  const ch4Dot  = document.querySelector('.timeline-item--center .timeline-dot');
  const ch5Item = document.querySelector('.timeline-item--video');
  const ch5Dot  = ch5Item ? ch5Item.querySelector('.timeline-dot') : null;
  const lastDot = document.querySelector('.timeline-item--final .timeline-dot');

  const dotToPercent = (dot) => {
    const dotCenter = dot.getBoundingClientRect().top + window.scrollY + dot.offsetHeight / 2;
    return ((dotCenter - storyTop) / storyHeight) * 100;
  };

  const ch4Pct  = ch4Dot  ? dotToPercent(ch4Dot)  : 50;
  const ch5Pct  = ch5Dot  ? dotToPercent(ch5Dot)  : 60;
  const maxFill = lastDot ? dotToPercent(lastDot)  : 100;

  const rawFill = Math.min(maxFill, (scrolledPast / (storyHeight - viewportHeight)) * 100);

  // Segment 1: top to Chapter 4 dot
  const fill1 = Math.min(ch4Pct, rawFill);
  trackFill.style.height = fill1 + '%';

  // Segment 2: Chapter 5 dot onward — only starts after scroll passes ch4
  const fill2El = document.getElementById('trackFill2');
  if (fill2El) {
    if (rawFill > ch5Pct) {
      const fill2 = Math.min(maxFill, rawFill) - ch5Pct;
      fill2El.style.top    = ch5Pct + '%';
      fill2El.style.height = fill2 + '%';
    } else {
      fill2El.style.height = '0%';
    }
  }
}


// ── VIDEO FALLBACK ────────────────────────
// If the <video> src fails to load (e.g. placeholder path still set),
// hide the element so the CSS gradient fallback shows cleanly underneath.

function handleVideoError() {
  heroVideo.style.display = 'none';
}




// ── EVENT LISTENERS ───────────────────────
window.addEventListener('scroll', handleScroll, { passive: true });
heroVideo.addEventListener('error', handleVideoError);


// ── INIT ──────────────────────────────────
// Run once on load so items already in view on page open animate in correctly.
handleScroll();
