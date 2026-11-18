/**
 * loader.js — loading screen tied to real work.
 *
 * Each tracked promise (content render, fonts, 3D scene) adds weight to the
 * progress ring. When everything settles, or a safety timeout passes, the
 * loader fades out and `.is-loaded` is added to <html>, which starts the
 * hero intro animation.
 */

import { $ } from '../utils/dom.js';

const RING_LENGTH = 326.73; // 2πr for r = 52 (see index.html)
const MIN_VISIBLE_MS = 900; // avoid a jarring flash on fast connections
const MAX_WAIT_MS = 6000; // never trap the visitor behind the loader

export function createLoader() {
  const root = $('#loader');
  const bar = root?.querySelector('.loader__bar');
  const percentEl = $('#loader-percent');
  const start = performance.now();

  let totalWeight = 0;
  let doneWeight = 0;
  let shown = 0; // the number currently displayed
  let frame = 0;
  const pending = [];

  const animate = () => {
    const target = totalWeight ? (doneWeight / totalWeight) * 100 : 0;
    shown += (target - shown) * 0.12;
    if (Math.abs(target - shown) < 0.4) shown = target;
    if (percentEl) percentEl.textContent = String(Math.round(shown));
    if (bar) bar.style.strokeDashoffset = String(RING_LENGTH * (1 - shown / 100));
    frame = shown < 100 ? requestAnimationFrame(animate) : 0;
  };

  /** Track a task. Failures still count as "done" so the page always opens. */
  function track(task, weight = 1) {
    totalWeight += weight;
    const p = Promise.resolve(task)
      .catch(() => {})
      .finally(() => {
        doneWeight += weight;
        if (!frame) frame = requestAnimationFrame(animate);
      });
    pending.push(p);
    return p;
  }

  /** Resolves once the loader has finished and been removed. */
  function finish() {
    const allDone = Promise.all(pending);
    const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));

    return Promise.race([allDone, timeout]).then(async () => {
      doneWeight = totalWeight;
      if (!frame) frame = requestAnimationFrame(animate);

      const elapsed = performance.now() - start;
      if (elapsed < MIN_VISIBLE_MS) {
        await new Promise((r) => setTimeout(r, MIN_VISIBLE_MS - elapsed));
      }
      // Let the ring visibly reach 100%
      await new Promise((r) => setTimeout(r, 350));

      document.documentElement.classList.add('is-loaded');
      root?.addEventListener('transitionend', () => root.remove(), { once: true });
      setTimeout(() => root?.remove(), 1200); // in case transitionend never fires
    });
  }

  frame = requestAnimationFrame(animate);
  return { track, finish };
}
