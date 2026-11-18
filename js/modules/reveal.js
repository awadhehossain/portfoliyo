/**
 * reveal.js — scroll-triggered entrance animations.
 * Any element with [data-reveal] gets `.is-visible` the first time it
 * enters the viewport. Call `observeReveals()` again after rendering new
 * content to pick up the new elements.
 *
 * Masked headings (data-reveal="mask") start fully clipped, and a clipped
 * element never reports as intersecting, so their parent is observed instead.
 */

import { $$, prefersReducedMotion } from '../utils/dom.js';

let observer;
const groups = new WeakMap(); // observed trigger → elements it reveals

function markDone(el) {
  // Remove the stagger delay once the entrance has played, so hover/tilt feels instant
  const finish = () => el.classList.add('reveal-done');
  el.addEventListener('transitionend', finish, { once: true });
  setTimeout(finish, 1600);
}

export function observeReveals(root = document) {
  const elements = $$('[data-reveal]:not(.is-visible)', root);

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible', 'reveal-done'));
    return;
  }

  observer ??= new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (groups.get(entry.target) ?? []).forEach((el) => {
          el.classList.add('is-visible');
          markDone(el);
        });
        groups.delete(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );

  elements.forEach((el) => {
    const trigger = el.dataset.reveal === 'mask' ? el.parentElement : el;
    const list = groups.get(trigger) ?? [];
    list.push(el);
    groups.set(trigger, list);
    observer.observe(trigger);
  });
}
