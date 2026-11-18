/**
 * main.js — application entry point.
 *
 * 1. Renders all content from js/data/portfolio.js
 * 2. Starts the UI modules (navigation, cursor, reveals, projects, form …)
 * 3. Lazily loads the Three.js experience from js/three/ — kept completely
 *    separate so the site still works if WebGL is unavailable.
 */

import * as content from './data/portfolio.js';
import { $, prefersReducedMotion } from './utils/dom.js';
import { createLoader } from './modules/loader.js';
import {
  renderHero,
  renderAbout,
  renderSkills,
  renderTimeline,
  renderSocialRow,
  renderContactList,
} from './modules/render.js';
import { initNavigation } from './modules/navigation.js';
import { initHero } from './modules/hero.js';
import { initCursor } from './modules/cursor.js';
import { observeReveals } from './modules/reveal.js';
import { initTilt } from './modules/tilt.js';
import { initProjects } from './modules/projects.js';
import { initTimeline } from './modules/timeline.js';
import { initContact } from './modules/contact.js';
import { initBackToTop } from './modules/backToTop.js';
import { initTheme, getTheme } from './modules/theme.js';
import { initContactFab } from './modules/contactFab.js';

window.__APP_READY__ = true; // tells the inline fallback in index.html that modules are running

const loader = createLoader();

/* ---------- 0. Theme (the 3D scene subscribes once it exists) ---------- */
let experience = null;
initTheme({ onChange: (theme) => experience?.setTheme(theme) });

/* ---------- 1. Content ---------- */
renderHero(content.profile);
renderSocialRow($('#hero-social'), content.socials);
renderSocialRow($('#contact-social'), content.socials);
renderSocialRow($('#footer-social'), content.socials);
renderAbout(content.about);
renderSkills(content.skillGroups);
renderTimeline(content.education);
renderContactList(content.contact, content.socials);

const year = $('#year');
if (year) year.textContent = String(new Date().getFullYear());

loader.track(Promise.resolve(), 1);

/* ---------- 2. UI modules ---------- */
initNavigation();
initHero(content.profile);
initProjects(content.projects, content.projectFilters);
initTimeline();
initContact(content.contact);
initBackToTop();
initContactFab();
initTilt();
initCursor();
observeReveals();

loader.track(document.fonts?.ready ?? Promise.resolve(), 1);

/* ---------- 3. 3D experience (lazy, isolated) ---------- */
function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
}

async function startExperience() {
  const root = document.documentElement;
  if (!supportsWebGL()) {
    root.classList.add('no-webgl');
    return;
  }
  try {
    const { createExperience } = await import('./three/experience.js');
    experience = createExperience({
      canvas: $('#webgl'),
      anchor: $('#hero-visual'),
      hero: $('#home'),
      reducedMotion: prefersReducedMotion(),
      theme: getTheme(),
    });
    if (experience.quality.tier === 'low') root.classList.add('low-power');
    await experience.ready;
    root.classList.add('has-webgl');
  } catch (error) {
    console.warn('[portfolio] 3D scene unavailable, using the CSS background instead.', error);
    root.classList.add('no-webgl');
  }
}

loader.track(startExperience(), 2);

/* ---------- Done ---------- */
loader.finish().then(() => {
  document.dispatchEvent(new CustomEvent('app:loaded'));
});
