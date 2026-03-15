// ===== TRAILER PLAYER =====
const trailerCards = document.querySelectorAll('.trailer-card');
const trailerPlayer = document.getElementById('trailerPlayer');
const mainVideo     = document.getElementById('mainVideo');
const mainVideoSrc  = document.getElementById('mainVideoSrc');
const playerTitle   = document.getElementById('playerTitle');
const playerClose   = document.getElementById('playerClose');

trailerCards.forEach(card => {
  card.addEventListener('click', () => {
    const src   = card.dataset.video;
    const title = card.dataset.title;

    // Actualizar activo
    trailerCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');

    // Cargar video
    mainVideoSrc.src = src;
    playerTitle.textContent = title;
    mainVideo.load();
    mainVideo.play();

    // Mostrar player y hacer scroll suave
    trailerPlayer.classList.add('visible');
    setTimeout(() => {
      trailerPlayer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  });
});

playerClose?.addEventListener('click', () => {
  mainVideo.pause();
  trailerPlayer.classList.remove('visible');
});

// ===== SUBNAV ACTIVE ON SCROLL =====
const subnavLinks = document.querySelectorAll('.dest-subnav a');
const sections    = document.querySelectorAll('.dest-section');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      subnavLinks.forEach(a => {
        a.style.color = '';
        a.style.borderBottomColor = '';
        if (a.getAttribute('href') === `#${id}`) {
          a.style.color = 'var(--accent)';
          a.style.borderBottomColor = 'var(--accent)';
        }
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => sectionObserver.observe(s));

// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll(
  '.news-card, .trailer-card, .rating-row, .top5-item, .reco-card'
);

const revealObs = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, 60 * (Array.from(revealEls).indexOf(entry.target) % 6));
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  revealObs.observe(el);
});

// ===== TOP 5 BAR ANIMATION on scroll =====
const barObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      barObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.top5-progress').forEach(bar => {
  bar.style.animationPlayState = 'paused';
  barObs.observe(bar);
});