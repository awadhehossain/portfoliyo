/**
 * theme.js — light / dark mode.
 *
 * The theme is stored on <html data-theme>. An inline script in index.html
 * sets it before the first paint (saved choice, otherwise dark), so the page
 * never flashes the wrong colours. The toggle in the navigation switches it
 * with a circular reveal where the browser supports view transitions.
 */

import { $, prefersReducedMotion } from '../utils/dom.js';

const STORAGE_KEY = 'awadhe-theme';
const THEME_COLORS = { dark: '#04050d', light: '#f3f5fb' };

export const getTheme = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

export function initTheme({ onChange } = {}) {
  const root = document.documentElement;
  const button = $('#theme-toggle');
  const meta = document.querySelector('meta[name="theme-color"]');

  const sync = (theme) => {
    if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
    if (!button) return;
    const next = theme === 'light' ? 'dark' : 'light';
    button.setAttribute('aria-label', `Switch to ${next} mode`);
    button.setAttribute('title', `Switch to ${next} mode`);
  };

  const apply = (theme) => {
    root.dataset.theme = theme;
    sync(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage can be unavailable (private mode, sandboxed viewers) */
    }
    onChange?.(theme);
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  };

  sync(getTheme());
  if (!button) return;

  button.addEventListener('click', () => {
    const next = getTheme() === 'light' ? 'dark' : 'light';

    if (typeof document.startViewTransition !== 'function' || prefersReducedMotion()) {
      apply(next);
      return;
    }

    // Circular reveal that grows from the toggle button
    const r = button.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    root.classList.add('theme-switching');
    let transition;
    try {
      transition = document.startViewTransition(() => apply(next));
    } catch {
      apply(next);
      root.classList.remove('theme-switching');
      return;
    }
    transition.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      })
      .catch(() => {});
    transition.finished.finally(() => root.classList.remove('theme-switching'));
  });
}
