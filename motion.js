/* Motion enhances the reading experience; content and links never depend on it. */
(() => {
  const root = document.documentElement;
  const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia?.('(hover: hover) and (pointer: fine)');
  const activeMain = document.querySelector('main:not([hidden])');
  if (!activeMain) return;
  const running = new Set();
  const seen = new WeakSet();
  const bound = new WeakSet();
  const motionAllowed = () => !media?.matches;
  const easing = 'cubic-bezier(.16,1,.3,1)';

  function play(element, keyframes, options = {}) {
    if (!motionAllowed() || !element?.animate) return;
    const animation = element.animate(keyframes, {duration: 780, easing, ...options});
    running.add(animation);
    animation.addEventListener?.('finish', () => running.delete(animation), {once: true});
    animation.addEventListener?.('cancel', () => running.delete(animation), {once: true});
    return animation;
  }

  function reveal(element, delay = 0) {
    if (seen.has(element)) return;
    seen.add(element);
    play(element, [
      {opacity: 0, transform: 'translateY(30px) scale(.985)'},
      {opacity: 1, transform: 'translateY(0) scale(1)'}
    ], {delay, fill: 'backwards'});
  }

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting);
    visible.forEach((entry, index) => {
      reveal(entry.target, Math.min(index, 3) * 65);
      observer.unobserve(entry.target);
    });
  }, {threshold: .07, rootMargin: '0px 0px -24px 0px'}) : null;

  function bindDepth(surface, target) {
    if (!target || bound.has(surface)) return;
    bound.add(surface);
    target.classList.add('depth-surface');
    let frame = 0, x = 0, y = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      target.style.removeProperty('--depth-x');
      target.style.removeProperty('--depth-y');
    };
    surface.addEventListener('pointermove', event => {
      if (!motionAllowed() || !pointer?.matches || event.pointerType === 'touch') return;
      const bounds = surface.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      x = (event.clientX - bounds.left) / bounds.width - .5;
      y = (event.clientY - bounds.top) / bounds.height - .5;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        target.style.setProperty('--depth-x', `${(-y * 5).toFixed(2)}deg`);
        target.style.setProperty('--depth-y', `${(x * 5).toFixed(2)}deg`);
        frame = 0;
      });
    }, {passive: true});
    surface.addEventListener('pointerleave', reset);
    surface.addEventListener('pointercancel', reset);
  }

  function prepare(scope) {
    scope.querySelectorAll('.section-heading,.section>h2,.project-card,.skills-grid article,.leadership-card,.photo-card,.record,.document-card,.education-row,.contact-row,.detail-section>h2').forEach(element => {
      if (!seen.has(element) && motionAllowed()) observer?.observe(element);
    });
    scope.querySelectorAll('.project-card').forEach(card => bindDepth(card, card.querySelector('.project-visual')));
    scope.querySelectorAll('.photo-card').forEach(card => bindDepth(card, card.querySelector(':scope > img')));
  }

  prepare(activeMain);
  const hero = activeMain.querySelector('.hero');
  const heroPhoto = hero?.querySelector('.hero-photo');
  if (hero && !location.hash) {
    hero.querySelectorAll(':scope > div > .eyebrow,.hero-line,.slash,.hero-intro,.hero-domains,.resume-actions,.speedrun').forEach((element, index) => {
      play(element, [
        {opacity: 0, transform: 'translateY(24px)', filter: 'blur(4px)'},
        {opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)'}
      ], {duration: 850, delay: Math.min(index * 55, 440), fill: 'backwards'});
    });
    play(heroPhoto, [
      {opacity: 0, transform: 'perspective(1200px) translateY(35px) rotateY(-7deg) scale(.95)'},
      {opacity: 1, transform: 'perspective(1200px) translateY(0) rotateY(0deg) scale(1)'}
    ], {duration: 1100, delay: 160, fill: 'backwards'});
  }
  if (heroPhoto) bindDepth(heroPhoto, heroPhoto);
  if (activeMain.id === 'detail-page') {
    activeMain.querySelectorAll(':scope > .eyebrow,:scope > h1,:scope > .intro,:scope > .detail-meta,.detail-body').forEach((element, index) => reveal(element, index * 60));
  }

  const grid = activeMain.querySelector('#project-grid');
  if (grid && 'MutationObserver' in window) {
    new MutationObserver(() => prepare(grid)).observe(grid, {childList: true});
  }

  const fieldwork = activeMain.querySelector('.fieldwork-grid');
  const fieldImages = fieldwork ? [...fieldwork.querySelectorAll('.photo-card > img')] : [];
  let scrollFrame = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  function updateScroll() {
    scrollFrame = 0;
    const range = Math.max(1, root.scrollHeight - window.innerHeight);
    root.style.setProperty('--reading-progress', clamp(window.scrollY / range));
    if (!motionAllowed()) return;
    if (heroPhoto && window.innerWidth > 760) {
      const rect = hero.getBoundingClientRect();
      heroPhoto.style.setProperty('--scroll-lift', `${Math.min(20, Math.max(0, -rect.top * .045))}px`);
    }
    if (fieldwork && window.innerWidth > 760) {
      const rect = fieldwork.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
        fieldImages.forEach((img, index) => img.style.setProperty('--photo-scale', (1.035 + progress * (index === 1 ? .025 : .045)).toFixed(3)));
      }
    }
  }
  function queueScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
  addEventListener('scroll', queueScroll, {passive: true});
  addEventListener('resize', queueScroll, {passive: true});
  addEventListener('pageshow', queueScroll);
  updateScroll();

  document.addEventListener('pointerdown', event => {
    if (event.button > 0) return;
    const control = event.target.closest('.pill,.icon-button,.filters a,.text-link,.speedrun');
    if (control) play(control, [{scale: '1'}, {scale: '.96'}, {scale: '1'}], {duration: 260});
  });

  media?.addEventListener?.('change', () => {
    if (media.matches) {
      running.forEach(animation => { try { animation.cancel(); } catch {} });
      running.clear();
      observer?.disconnect();
      document.querySelectorAll('.depth-surface').forEach(element => {
        ['--depth-x','--depth-y','--scroll-lift','--photo-scale'].forEach(property => element.style.removeProperty(property));
      });
    } else prepare(activeMain);
    queueScroll();
  });
})();
