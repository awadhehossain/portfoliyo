/**
 * cursor.js — custom glowing cursor for desktop pointers.
 * Disabled on touch devices and when reduced motion is requested, so the
 * native cursor is always used there.
 */

import { $, hasFinePointer, prefersReducedMotion, lerp } from '../utils/dom.js';

const INTERACTIVE = 'a, button, [data-cursor], label, .filter, .chip, input, textarea';

export function initCursor() {
  const cursor = $('.cursor');
  if (!cursor || !hasFinePointer() || prefersReducedMotion()) return;

  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');
  document.documentElement.classList.add('has-cursor');

  const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const ringPos = { ...target };
  let visible = false;

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = target.x;
        ringPos.y = target.y;
        cursor.classList.add('is-visible');
      }
    },
    { passive: true }
  );

  document.addEventListener('pointerover', (e) => {
    cursor.classList.toggle('is-hover', Boolean(e.target.closest?.(INTERACTIVE)));
  });

  document.documentElement.addEventListener('mouseleave', () => {
    visible = false;
    cursor.classList.remove('is-visible');
  });

  window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

  const tick = () => {
    ringPos.x = lerp(ringPos.x, target.x, 0.18);
    ringPos.y = lerp(ringPos.y, target.y, 0.18);
    dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
    ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
