/**
 * tilt.js — subtle 3D tilt and pointer spotlight for [data-tilt] cards.
 * Uses event delegation, so cards rendered later are handled automatically.
 * Writes only CSS custom properties; the transform lives in CSS.
 */

import { hasFinePointer, prefersReducedMotion } from '../utils/dom.js';

const MAX_TILT = 6; // degrees

export function initTilt() {
  if (!hasFinePointer()) return;
  const animateTilt = !prefersReducedMotion();

  let active = null;
  let frame = 0;
  let last = null;

  const apply = () => {
    frame = 0;
    if (!active || !last) return;
    const rect = active.getBoundingClientRect();
    const x = (last.clientX - rect.left) / rect.width; // 0..1
    const y = (last.clientY - rect.top) / rect.height;

    active.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    active.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);

    if (animateTilt) {
      active.style.setProperty('--ry', `${((x - 0.5) * MAX_TILT * 2).toFixed(2)}deg`);
      active.style.setProperty('--rx', `${((0.5 - y) * MAX_TILT * 2).toFixed(2)}deg`);
      active.style.setProperty('--px', ((x - 0.5) * 2).toFixed(3));
      active.style.setProperty('--py', ((y - 0.5) * 2).toFixed(3));
    }
  };

  const reset = (el) => {
    ['--rx', '--ry'].forEach((p) => el.style.setProperty(p, '0deg'));
    ['--px', '--py'].forEach((p) => el.style.setProperty(p, '0'));
  };

  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      const card = e.target.closest?.('[data-tilt]');
      if (card !== active) {
        if (active) reset(active);
        active = card;
      }
      if (!active) return;
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    },
    { passive: true }
  );

  document.documentElement.addEventListener('pointerleave', () => {
    if (active) reset(active);
    active = null;
  });

  /* Magnetic buttons: CTA buttons drift slightly toward the pointer */
  if (!animateTilt) return;
  let magnet = null;

  const release = () => {
    if (!magnet) return;
    magnet.style.setProperty('--tx', '0px');
    magnet.style.setProperty('--ty', '0px');
    magnet = null;
  };

  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      const btn = e.target.closest?.('[data-magnetic]');
      if (btn !== magnet) release();
      if (!btn) return;
      magnet = btn;
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.setProperty('--tx', `${(dx * 0.18).toFixed(1)}px`);
      btn.style.setProperty('--ty', `${(dy * 0.28).toFixed(1)}px`);
    },
    { passive: true }
  );
}
