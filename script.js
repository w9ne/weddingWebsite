// ─────────────────────────────────────────
// WEDDING WEBSITE — script.js
// ─────────────────────────────────────────

// ── DOM REFERENCES ──────────────────────
const timelineItems = document.querySelectorAll('.timeline-item');
const trackFill     = document.getElementById('trackFill');
const storySection  = document.getElementById('story');
const heroVideo     = document.getElementById('hero-video');

// ── SCROLL HANDLER ───────────────────────
function handleScroll() {
  const viewportHeight = window.innerHeight;

  // --- Chapter visibility ---
  timelineItems.forEach(item => {
    const rect     = item.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    // TWEAK: lower the first value (e.g. -0.2) to trigger even earlier
    //        raise the second value (e.g. 1.5) to keep items visible longer
    const inView = midpoint > viewportHeight * -0.1 && midpoint < viewportHeight * 1.3;
    item.classList.toggle('visible', inView);
  });

  // --- Timeline line fill ---
  const storyTop     = storySection.getBoundingClientRect().top + window.scrollY;
  const storyHeight  = storySection.offsetHeight;
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
  const maxFill = lastDot ? dotToPercent(lastDot) + 3 : 100;
  const rawFill = Math.min(maxFill, (scrolledPast / (storyHeight - viewportHeight)) * 100);

  // Segment 1: top to Chapter 4 dot
  const fill1 = Math.min(ch4Pct, rawFill);
  trackFill.style.height = fill1 + '%';

  // Segment 2: Chapter 5 dot onward
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
function handleVideoError() {
  if (heroVideo) heroVideo.style.display = 'none';
}

// ── MUSIC PLAYER ─────────────────────────
(function initMusicPlayer() {
  const audio         = document.getElementById('bg-music');
  const toggleBtn     = document.getElementById('music-toggle');
  const volumeSlider  = document.getElementById('volume-slider');
  const musicIcon     = document.getElementById('music-icon');
  const musicControls = document.getElementById('music-controls');

  if (!audio) return;

  let isPlaying = false;
  let started   = false;

  audio.volume = parseFloat(volumeSlider.value);

  function fadeIn(targetVolume, duration) {
    audio.volume = 0;
    const steps    = 40;
    const stepTime = duration / steps;
    const stepSize = targetVolume / steps;
    let current    = 0;
    const interval = setInterval(() => {
      current++;
      audio.volume = Math.min(targetVolume, current * stepSize);
      if (current >= steps) clearInterval(interval);
    }, stepTime);
  }

  function tryPlay() {
    if (started) return;
    audio.play().then(() => {
      started   = true;
      isPlaying = true;
      toggleBtn.textContent   = '⏸ Pause';
      musicIcon.style.opacity = '1';
      fadeIn(parseFloat(volumeSlider.value), 2000);
    }).catch(() => {});
  }

  // Try immediately on page load
  tryPlay();

  // Try on first scroll
  window.addEventListener('scroll', tryPlay, { once: true, passive: true });

  // Fallback: any user gesture
  ['click', 'keydown', 'touchstart', 'pointerdown'].forEach(evt => {
    document.addEventListener(evt, tryPlay);
  });

  // Toggle play / pause
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      toggleBtn.textContent   = '▶ Play';
      musicIcon.style.opacity = '0.45';
    } else {
      audio.play();
      isPlaying = true;
      toggleBtn.textContent   = '⏸ Pause';
      musicIcon.style.opacity = '1';
    }
  });

  volumeSlider.addEventListener('input', () => {
    audio.volume = parseFloat(volumeSlider.value);
  });

  // Toggle controls panel on mobile (click instead of hover)
  musicIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = musicControls.style.display === 'flex';
    musicControls.style.display = isVisible ? 'none' : 'flex';
  });
})();

// ── RSVP ─────────────────────────────────
(function initRSVP() {
  const trigger    = document.getElementById('rsvp-trigger');
  const formArea   = document.getElementById('rsvp-form-area');
  const rsvpForm   = document.getElementById('rsvp-fields');
  const successEl  = document.getElementById('rsvp-success');
  const successMsg = document.getElementById('rsvp-success-text');
  const editBtn    = document.getElementById('rsvp-edit-btn');
  const nameInput  = document.getElementById('rsvp-name');
  const sealingBox = document.getElementById('rsvp-sealing');
  const partyBox   = document.getElementById('rsvp-party');
  const messageBox = document.getElementById('rsvp-message-only');

  if (!trigger || !formArea || !rsvpForm) return;

  // ── Toggle open / close ────────────────
  function openForm() {
    formArea.classList.add('open');
    formArea.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    setTimeout(() => {
      formArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  function closeForm() {
    formArea.classList.remove('open');
    formArea.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', () => {
    formArea.classList.contains('open') ? closeForm() : openForm();
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      trigger.click();
    }
  });

  // ── Success message based on checkboxes ─
  function getSuccessMessage() {
    const hasSealing = sealingBox.checked;
    const hasParty   = partyBox.checked;
    const hasMessage = messageBox.checked;

    if (hasParty) {
      return "Your RSVP has been saved. We can't wait to celebrate with you!";
    }
    if (hasSealing && !hasParty) {
      return "Your RSVP has been saved! The timing of the sealing will be sent to you soon!";
    }
    if (hasMessage && !hasSealing && !hasParty) {
      return "We are grateful for your thoughts and feelings. We are happy to include you in our celebration, even if you aren't able to be present. Much love!";
    }
    return "Your RSVP has been saved. We can't wait to celebrate with you!";
  }

  // ── Submit to Google Sheets ────────────
  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate name
    if (!nameInput.value.trim()) {
      nameInput.focus();
      nameInput.style.borderColor = 'rgba(201,100,100,0.7)';
      setTimeout(() => nameInput.style.borderColor = '', 1500);
      return;
    }

    const submitBtn = document.getElementById('rsvp-submit-btn');
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    try {
      await fetch(rsvpForm.action, {
        method: 'POST',
        body: new FormData(rsvpForm),
      }).catch(() => {}); // silently ignore CORS/network errors from GAS

      if (successMsg) successMsg.textContent = getSuccessMessage();
      rsvpForm.style.display  = 'none';
      successEl.style.display = 'flex';

    } catch (err) {
      // Only true failures (e.g. no internet) reach here
      submitBtn.textContent = 'Save my RSVP';
      submitBtn.disabled = false;
      alert('Could not submit. Please check your connection and try again.');
    }
  });

  // ── Edit button — shows form again ─────
  editBtn.addEventListener('click', () => {
    rsvpForm.style.display  = '';
    successEl.style.display = 'none';
    const submitBtn = document.getElementById('rsvp-submit-btn');
    if (submitBtn) {
      submitBtn.textContent = 'Save my RSVP';
      submitBtn.disabled = false;
    }
    nameInput.focus();
  });

})();

// ── EVENT LISTENERS ───────────────────────
window.addEventListener('scroll', handleScroll, { passive: true });
if (heroVideo) heroVideo.addEventListener('error', handleVideoError);

// ── INIT ──────────────────────────────────
handleScroll();