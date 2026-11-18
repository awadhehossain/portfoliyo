/**
 * quality.js — picks a rendering tier for the device so the 3D scene stays
 * smooth on phones and laptops alike. experience.js can step further down
 * at runtime if the frame rate drops.
 */

export function detectQuality() {
  const dpr = window.devicePixelRatio || 1;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4; // Chromium only; others default to 4
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 700;

  let tier = 'high';
  if (coarse || smallScreen || cores <= 4 || memory <= 4) tier = 'medium';
  if (cores <= 2 || memory <= 2 || (coarse && cores <= 4)) tier = 'low';

  const presets = {
    high: { pixelRatio: Math.min(dpr, 1.75), stars: 3200, galaxy: 16000, antialias: dpr < 2 },
    medium: { pixelRatio: Math.min(dpr, 1.5), stars: 2200, galaxy: 11000, antialias: false },
    low: { pixelRatio: Math.min(dpr, 1), stars: 1300, galaxy: 6500, antialias: false },
  };

  return { tier, ...presets[tier] };
}
