/**
 * navigation.js — sticky glass nav, mobile menu, active-section highlight,
 * scroll progress bar and smooth in-page scrolling.
 */

import { $, $$, rafThrottle, scrollToTarget } from '../utils/dom.js';

const MOBILE_BREAKPOINT = 860;

export function initNavigation() {
  const nav = $('#nav');
  const toggle = $('#nav-toggle');
  const menu = $('#nav-menu');
  const progress = $('#scroll-progress');
  const links = $$('.nav__link');
  if (!nav || !toggle || !menu) return;

  /* ---------- Scrolled state + progress bar ---------- */
  const onScroll = rafThrottle(() => {
    const y = window.scrollY;
    nav.classList.toggle('nav--scrolled', y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const label = toggle.querySelector('.visually-hidden');

  const setOpen = (open) => {
    nav.classList.toggle('nav--open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Close menu' : 'Open menu';
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) links[0]?.focus({ preventScroll: true });
  };

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('nav--open')));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('nav--open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > MOBILE_BREAKPOINT && nav.classList.contains('nav--open')) setOpen(false);
  });

  /* ---------- Smooth scrolling for every in-page link ---------- */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : document.body;
    if (!target) return;

    e.preventDefault();
    if (nav.classList.contains('nav--open')) setOpen(false);

    const destination = id === 'home' ? document.body : target;
    scrollToTarget(destination);

    // Move keyboard focus to the section for screen-reader and keyboard users
    if (destination !== document.body) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    try {
      history.replaceState(null, '', id && id !== 'home' ? `#${id}` : location.pathname);
    } catch {
      /* some sandboxed viewers block history updates */
    }
  });

  /* ---------- Active link for the section in view ---------- */
  const sections = links
    .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((s) => observer.observe(s));

  // Clear the highlight while the hero is in view
  const hero = $('#home');
  if (hero) {
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive('');
      },
      { rootMargin: '-45% 0px -50% 0px' }
    ).observe(hero);
  }
}
