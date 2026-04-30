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
    const inView   = midpoint > viewportHeight * 0.1 && midpoint < viewportHeight * 1.2;
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
  heroVideo.style.display = 'none';
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
      toggleBtn.textContent  = '⏸ Pause';
      musicIcon.style.opacity = '1';
      fadeIn(parseFloat(volumeSlider.value), 2000);
    }).catch(() => {});
  }

  // Fire on ANY of these — keeping listeners active (no { once: true })
  // so Chrome has a fresh gesture context each time
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

  musicIcon.addEventListener('click', () => {
    const isVisible = musicControls.style.display === 'flex';
    musicControls.style.display = isVisible ? 'none' : 'flex';
  });
})();

(function initRSVP() {
  const trigger     = document.getElementById('rsvp-trigger');
  const formArea    = document.getElementById('rsvp-form-area');
  const fields      = document.getElementById('rsvp-fields');
  const successEl   = document.getElementById('rsvp-success');
  const submitBtn   = document.getElementById('rsvp-submit-btn');
  const editBtn     = document.getElementById('rsvp-edit-btn');
  const nameInput   = document.getElementById('rsvp-name');
  const sealingBox  = document.getElementById('rsvp-sealing');
  const partyBox    = document.getElementById('rsvp-party');
  const messageBox  = document.getElementById('rsvp-message');
 
  if (!trigger || !formArea) return;
 
  // ── Toggle open/close ──────────────────────────────────
  function openForm() {
    formArea.classList.add('open');
    formArea.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    // Smooth scroll to form after transition starts
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
    const isOpen = formArea.classList.contains('open');
    isOpen ? closeForm() : openForm();
  });
 
  // Allow keyboard activation (Enter / Space)
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      trigger.click();
    }
  });
 
  // ── Persist to localStorage ────────────────────────────
  const STORAGE_KEY = 'jared_sabrina_rsvp';
 
  function saveRSVP() {
    const data = {
      name:    nameInput.value.trim(),
      sealing: sealingBox.checked,
      party:   partyBox.checked,
      message: messageBox.value.trim(),
      savedAt: new Date().toISOString(),
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
    return data;
  }
 
  function loadRSVP() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }
 
  function populateFields(data) {
    if (!data) return;
    nameInput.value      = data.name    || '';
    sealingBox.checked   = !!data.sealing;
    partyBox.checked     = !!data.party;
    messageBox.value     = data.message || '';
  }
 
  function showSuccess() {
    fields.style.display   = 'none';
    successEl.style.display = 'flex';
  }
 
  function showFields() {
    fields.style.display   = '';
    successEl.style.display = 'none';
  }
 
  // ── Submit ─────────────────────────────────────────────
  submitBtn.addEventListener('click', () => {
    if (!nameInput.value.trim()) {
      nameInput.focus();
      nameInput.style.borderColor = 'rgba(201,100,100,0.7)';
      setTimeout(() => nameInput.style.borderColor = '', 1500);
      return;
    }
    saveRSVP();
    showSuccess();
  });
 
  // ── Edit ──────────────────────────────────────────────
  editBtn.addEventListener('click', () => {
    showFields();
    nameInput.focus();
  });
 
  // ── Restore saved data on page load ───────────────────
  const saved = loadRSVP();
  if (saved) {
    populateFields(saved);
    // Re-open form and show success state automatically
    openForm();
    showSuccess();
  }
})();


// ── EVENT LISTENERS ───────────────────────
window.addEventListener('scroll', handleScroll, { passive: true });
heroVideo.addEventListener('error', handleVideoError);

// ── INIT ──────────────────────────────────
handleScroll();