/**
 * backToTop.js — floating button with a circular scroll-progress ring.
 */

import { $, rafThrottle, scrollToTarget } from '../utils/dom.js';

const RING_LENGTH = 131.95; // 2πr for r = 21 (see index.html)

export function initBackToTop() {
  const btn = $('#to-top');
  const bar = $('#to-top-bar');
  if (!btn) return;

  const update = rafThrottle(() => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    btn.classList.toggle('is-visible', y > window.innerHeight * 0.8);
    if (bar && max > 0) bar.style.strokeDashoffset = String(RING_LENGTH * (1 - y / max));
  });

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  btn.addEventListener('click', () => {
    scrollToTarget(document.body);
    document.getElementById('main')?.focus?.({ preventScroll: true });
  });
}
