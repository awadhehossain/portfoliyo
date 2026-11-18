/**
 * hero.js — hero text effects:
 *  - splits the name into letters for the staggered intro + hover glow
 *  - types and deletes the "currently" phrases
 */

import { $, $$, prefersReducedMotion } from '../utils/dom.js';

/* Gradient across all letters of the name.
   Dark mode: white → periwinkle → violet. Light mode: ink navy → blue → violet. */
const STOPS_DARK = [
  [255, 255, 255],
  [214, 218, 255],
  [184, 160, 255],
];
const STOPS_LIGHT = [
  [16, 21, 58],
  [44, 66, 196],
  [118, 66, 222],
];

function colorAt(t, stops) {
  const seg = t < 0.5 ? 0 : 1;
  const local = seg === 0 ? t / 0.5 : (t - 0.5) / 0.5;
  const a = stops[seg];
  const b = stops[seg + 1];
  const mix = a.map((v, i) => Math.round(v + (b[i] - v) * local));
  return `rgb(${mix.join(' ')})`;
}

function splitName() {
  const targets = $$('[data-split]');
  const total = targets.reduce((n, el) => n + el.textContent.trim().length, 0);
  let index = 0;

  targets.forEach((el) => {
    const text = el.textContent.trim();
    const letters = [...text]
      .map((ch) => {
        const i = index++;
        if (ch === ' ') return '<span class="char char--space"> </span>';
        const t = i / Math.max(1, total - 1);
        return `<span class="char" style="--ci:${i};--char-dark:${colorAt(t, STOPS_DARK)};--char-light:${colorAt(t, STOPS_LIGHT)}">${ch}</span>`;
      })
      .join('');
    // Screen readers get the plain text; the letter spans are decorative
    el.innerHTML = `<span class="visually-hidden">${text}</span><span aria-hidden="true">${letters}</span>`;
  });

  // After the intro finishes, letters react to hover without stagger delays
  const introLength = 150 + total * 38 + 1000;
  document.addEventListener(
    'app:loaded',
    () => setTimeout(() => document.documentElement.classList.add('intro-done'), introLength),
    { once: true }
  );
}

function startTyping(phrases) {
  const el = $('#typed-text');
  if (!el || !phrases?.length) return;

  if (prefersReducedMotion()) {
    let i = 0;
    el.textContent = phrases[0];
    setInterval(() => {
      i = (i + 1) % phrases.length;
      el.textContent = phrases[i];
    }, 3500);
    return;
  }

  let phrase = 0;
  let length = 0;
  let deleting = false;

  const step = () => {
    if (document.hidden) {
      setTimeout(step, 500);
      return;
    }
    const text = phrases[phrase];
    length += deleting ? -1 : 1;
    el.textContent = text.slice(0, length);

    let delay = deleting ? 28 : 55 + Math.random() * 45;
    if (!deleting && length === text.length) {
      deleting = true;
      delay = 1900;
    } else if (deleting && length === 0) {
      deleting = false;
      phrase = (phrase + 1) % phrases.length;
      delay = 380;
    }
    setTimeout(step, delay);
  };

  step();
}

export function initHero(profile) {
  splitName();

  // Typing starts once the loader is gone, so the first phrase is seen in full
  document.addEventListener('app:loaded', () => setTimeout(() => startTyping(profile.currently), 1200), {
    once: true,
  });

  // Hide the "move your cursor" hint after the first interaction with the core
  const visual = $('#hero-visual');
  if (visual) {
    const touched = () => visual.classList.add('is-touched');
    visual.addEventListener('pointerenter', touched, { once: true });
    visual.addEventListener('pointerdown', touched, { once: true });
  }
}
