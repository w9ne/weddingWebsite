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

  // --- Timeline line fill ---
  // Calculates how far the user has scrolled through the #story section
  // and maps that to a 0–100% height on the decorative vertical line.
  const storyRect    = storySection.getBoundingClientRect();
  const storyHeight  = storySection.offsetHeight;
  const scrolledPast = Math.max(0, -storyRect.top);
  const lastDot = document.querySelector('.timeline-item--final .timeline-dot');
  const storyTop = storySection.getBoundingClientRect().top + window.scrollY;
  const dotCenter = lastDot.getBoundingClientRect().top + window.scrollY + (lastDot.offsetHeight / 2);
  const maxFill = ((dotCenter - storyTop) / storyHeight) * 100;
  const fillPercent = Math.min(maxFill, (scrolledPast / (storyHeight - viewportHeight)) * 100);


  trackFill.style.height = fillPercent + '%';

  // --- Chapter visibility ---
  // An item becomes "visible" (full opacity, no vertical offset)
  // when its vertical midpoint falls within the middle 80% of the viewport.
  timelineItems.forEach(item => {
    const rect      = item.getBoundingClientRect();
    const midpoint  = rect.top + rect.height / 2;
    const inView    = midpoint > viewportHeight * 0.1 && midpoint < viewportHeight * 0.9;

    item.classList.toggle('visible', inView);
  });
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
