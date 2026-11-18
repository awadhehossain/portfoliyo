/**
 * timeline.js — fills the education timeline line as the visitor scrolls,
 * and lights up each milestone once the line reaches it.
 */

import { $, $$, clamp, rafThrottle } from '../utils/dom.js';

export function initTimeline() {
  const timeline = $('#timeline');
  const fill = $('#timeline-fill');
  if (!timeline || !fill) return;

  const items = $$('.timeline__item', timeline);
  let active = false;

  const update = rafThrottle(() => {
    if (!active) return;
    const rect = timeline.getBoundingClientRect();
    const anchor = window.innerHeight * 0.6; // the line "draws" to 60% down the screen
    const progress = clamp((anchor - rect.top) / rect.height, 0, 1);
    fill.style.setProperty('--progress', progress.toFixed(4));

    const reached = rect.top + rect.height * progress;
    items.forEach((item) => {
      const dot = item.querySelector('.timeline__dot');
      const dotY = dot.getBoundingClientRect().top + dot.offsetHeight / 2;
      item.classList.toggle('is-passed', dotY <= reached + 1);
    });
  });

  // Only do the work while the timeline is near the viewport
  new IntersectionObserver(
    ([entry]) => {
      active = entry.isIntersecting;
      if (active) update();
    },
    { rootMargin: '20% 0px 20% 0px' }
  ).observe(timeline);

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}
