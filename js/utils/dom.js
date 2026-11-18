/**
 * dom.js — small DOM and math helpers shared across modules.
 */

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const lerp = (a, b, t) => a + (b - a) * t;

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

/** True when the visitor asked the OS for reduced motion. */
export const prefersReducedMotion = () => reducedMotionQuery.matches;

/** True on devices with a precise, hover-capable pointer (mouse/trackpad). */
export const hasFinePointer = () => finePointerQuery.matches;

/** Escape user-editable content before inserting it as HTML. */
export function escapeHTML(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Markup for an icon from the inline SVG sprite in index.html. */
export const icon = (name, className = 'icon') =>
  `<svg class="${className}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;

/** Run a callback at most once per animation frame. */
export function rafThrottle(callback) {
  let frame = 0;
  let lastArgs;
  return (...args) => {
    lastArgs = args;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      callback(...lastArgs);
    });
  };
}

/** Smooth-scroll to an element (or the top), respecting reduced motion. */
export function scrollToTarget(target) {
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
  if (!target || target === document.body) {
    window.scrollTo({ top: 0, behavior });
    return;
  }
  target.scrollIntoView({ behavior, block: 'start' });
}

/** Brief status message at the bottom of the screen. */
let toastTimer = 0;
export function showToast(message, duration = 2800) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), duration);
}

/** Copy text to the clipboard, with a fallback for older browsers. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.append(helper);
    helper.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    helper.remove();
    return ok;
  }
}
