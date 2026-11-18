/**
 * experience.js — the Three.js scene that runs behind the whole page.
 *
 * - One renderer and one full-screen canvas
 * - A starfield fills the page; the camera drifts down through it as the
 *   page scrolls, so the stars move with a gentle parallax
 * - A spiral galaxy is pinned behind the portrait in the hero. It assembles
 *   from a turbulent swirl when the page opens, parts around the cursor,
 *   ripples on click, and unravels again as the hero scrolls away
 * - Light mode re-inks everything for a pale background
 * - Pauses when the tab is hidden; lowers resolution / density if the
 *   frame rate drops
 *
 * The module only talks to the page through the canvas, the anchor element
 * and window/document events, so it stays independent of js/modules.
 */

import * as THREE from 'three';
import { detectQuality } from './quality.js';
import { createStarfield } from './starfield.js';
import { createGalaxy } from './galaxy.js';

const FOV = 45;
const CAMERA_Z = 14;
const CAMERA_TRAVEL = 26; // world units travelled from top to bottom of the page
const GALAXY_DISTANCE = 10; // distance of the galaxy in front of the camera
const GALAXY_FILL = 0.84; // galaxy radius relative to the anchor box
const INTRO_SECONDS = 3.2;

const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

export function createExperience({ canvas, anchor, hero, reducedMotion = false, theme = 'dark' }) {
  const quality = detectQuality();

  /* ---------- Renderer, scene, camera ---------- */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality.antialias,
    alpha: true,
    powerPreference: 'high-performance',
  });
  let pixelRatio = quality.pixelRatio;
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, 140);
  camera.position.set(0, 0, CAMERA_Z);
  scene.add(camera); // the galaxy hangs off the camera so it can track the layout

  /* ---------- Objects ---------- */
  const stars = createStarfield({
    count: quality.stars,
    pixelRatio,
    bounds: { x: 20, yMin: -CAMERA_TRAVEL - 18, yMax: 16, zMin: -60, zMax: 4 },
  });
  scene.add(stars.object);

  const galaxy = createGalaxy({ count: quality.galaxy, pixelRatio });
  camera.add(galaxy.root);

  /* ---------- Theme ---------- */
  let isLight = theme === 'light';
  const applyTheme = (name) => {
    isLight = name === 'light';
    stars.setTheme(isLight);
    galaxy.setTheme(isLight);
  };
  applyTheme(theme);

  /* ---------- Input ---------- */
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, ndc: new THREE.Vector2(9, 9), inside: false };
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane();
  const normal = new THREE.Vector3();
  const origin = new THREE.Vector3();
  const hit = new THREE.Vector3();

  const onPointerMove = (e) => {
    pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.targetY = -((e.clientY / window.innerHeight) * 2 - 1);
    pointer.ndc.set(pointer.targetX, pointer.targetY);
    pointer.inside = true;
  };
  const onPointerLeave = () => {
    pointer.inside = false;
    pointer.targetX = 0;
    pointer.targetY = 0;
  };

  /** Pointer position in the galaxy's own plane (local units), or null. */
  const galaxyHit = () => {
    if (!galaxy.root.visible || !pointer.inside) return null;
    raycaster.setFromCamera(pointer.ndc, camera);
    galaxy.tilt.getWorldPosition(origin);
    normal.set(0, 0, 1).transformDirection(galaxy.tilt.matrixWorld);
    plane.setFromNormalAndCoplanarPoint(normal, origin);
    if (!raycaster.ray.intersectPlane(plane, hit)) return null;
    const local = galaxy.tilt.worldToLocal(hit.clone());
    return Math.hypot(local.x, local.y) < galaxy.hitRadius * 1.15 ? local : null;
  };

  const onPointerDown = (e) => {
    onPointerMove(e);
    // ignore clicks on controls; react to clicks on the background and the portrait
    if (e.target.closest?.('a, button, input, textarea, select, label, dialog')) return;
    scene.updateMatrixWorld();
    const local = galaxyHit();
    if (local && Math.hypot(local.x, local.y) < galaxy.hitRadius) galaxy.pulse(local);
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.documentElement.addEventListener('pointerleave', onPointerLeave);

  /* ---------- Layout ---------- */
  let width = window.innerWidth;
  let height = window.innerHeight;
  let scrollMax = 1;
  let heroHeight = 1;
  const anchorBox = { x: 0, y: 0, size: 0 }; // document coordinates (centre + size)

  const measureAnchor = () => {
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    anchorBox.x = r.left + r.width / 2 + window.scrollX;
    anchorBox.y = r.top + r.height / 2 + window.scrollY;
    anchorBox.size = Math.min(r.width, r.height);
    heroHeight = Math.max(1, hero ? hero.offsetHeight : height);
  };

  const measure = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    scrollMax = Math.max(1, document.documentElement.scrollHeight - height);
    measureAnchor();
  };
  measure();

  let resizeFrame = 0;
  const onResize = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(measure);
  };
  window.addEventListener('resize', onResize);
  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(document.body);
  if (anchor) resizeObserver.observe(anchor);

  /* ---------- Galaxy placement + scroll morph ---------- */
  const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const intro = { start: document.documentElement.classList.contains('is-loaded') ? performance.now() : null, done: reducedMotion };
  document.addEventListener(
    'app:loaded',
    () => {
      intro.start = performance.now();
    },
    { once: true }
  );

  const smoothstep = (a, b, v) => {
    const t = clamp01((v - a) / (b - a));
    return t * t * (3 - 2 * t);
  };

  const placeGalaxy = (now) => {
    // 0 at the top → 1 once the visitor has scrolled a little past the hero.
    // The galaxy stays put while the portrait scrolls away, revealing its core,
    // then drifts to the centre, unravels into a swirl and fades.
    const leave = clamp01(window.scrollY / (heroHeight * 1.15));
    const visible = leave < 1 && anchorBox.size > 0;
    galaxy.root.visible = visible;
    if (!visible) return;

    // On stacked (phone/tablet) layouts the hero text sits below the portrait,
    // so there the galaxy simply travels with the portrait instead.
    const stacked = width <= 900;
    const out = reducedMotion ? 0 : leave;
    const centre = stacked ? 0 : smoothstep(0.05, 0.75, out);
    const screenX = anchorBox.x + (width / 2 - anchorBox.x) * centre;
    const screenY = reducedMotion || stacked
      ? anchorBox.y - window.scrollY
      : anchorBox.y + (height * 0.5 - anchorBox.y) * centre - window.scrollY * 0.12;

    const halfH = GALAXY_DISTANCE * tanHalfFov;
    const halfW = halfH * camera.aspect;
    const ndcX = (screenX / width) * 2 - 1;
    const ndcY = -((screenY / height) * 2 - 1);
    const baseScale = (anchorBox.size / height) * 2 * halfH * GALAXY_FILL;

    // Intro: the swirl settles into a spiral
    let introT = 1;
    if (!intro.done) {
      introT = intro.start === null ? 0 : clamp01((now - intro.start) / (INTRO_SECONDS * 1000));
      if (introT >= 1) intro.done = true;
    }
    const settle = easeOutCubic(introT);

    const unravel = smoothstep(0.22, 0.85, out);
    const chaos = Math.max(1 - settle, unravel * 0.9);
    const fade = reducedMotion ? leave : smoothstep(0.42, 0.92, leave);
    const opacity = Math.min(settle * 1.15, 1) * (1 - fade);

    galaxy.root.position.set(ndcX * halfW, ndcY * halfH, -GALAXY_DISTANCE);
    galaxy.root.scale.setScalar(baseScale * (0.82 + 0.18 * settle) * (1 + centre * 0.3 + unravel * 0.25));
    galaxy.setState({
      chaos,
      opacity,
      pointScale: THREE.MathUtils.clamp(anchorBox.size / 560, 0.62, 1.3),
    });
  };

  /* ---------- Adaptive quality ---------- */
  const perf = { frames: 0, time: 0, checks: 0, density: 1 };
  const keepQuality = /[?&]hq\b/.test(window.location.search); // ?hq disables auto-downgrade (testing)
  const monitorPerformance = (delta) => {
    if (keepQuality || perf.checks >= 3) return;
    perf.frames++;
    if (perf.frames < 30) return; // skip warm-up frames
    perf.time += delta;
    if (perf.frames < 120) return;

    const average = perf.time / (perf.frames - 30);
    perf.frames = 0;
    perf.time = 0;
    perf.checks++;
    if (average < 1 / 38) return; // fast enough

    if (pixelRatio > 1) {
      pixelRatio = Math.max(1, pixelRatio - 0.35);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      stars.setPixelRatio(pixelRatio);
      galaxy.setPixelRatio(pixelRatio);
    } else if (perf.density > 0.5) {
      perf.density -= 0.25;
      stars.setDensity(perf.density);
      galaxy.setDensity(perf.density);
    }
    document.documentElement.classList.add('low-power');
  };

  /* ---------- Render loop ---------- */
  const timer = new THREE.Timer();
  let time = 0;
  const timeScale = reducedMotion ? 0.15 : 1;
  const travel = reducedMotion ? 0 : CAMERA_TRAVEL;

  const tick = (timestamp) => {
    timer.update(timestamp);
    const delta = Math.min(timer.getDelta(), 1 / 20);
    time += delta * timeScale;
    const now = performance.now();

    const follow = reducedMotion ? 0 : 1;
    pointer.x = damp(pointer.x, pointer.targetX * follow, 3, delta);
    pointer.y = damp(pointer.y, pointer.targetY * follow, 3, delta);

    // Camera: scroll travel + pointer parallax
    const progress = clamp01(window.scrollY / scrollMax);
    camera.position.y = damp(camera.position.y, -progress * travel, 4.5, delta);
    camera.position.x = damp(camera.position.x, pointer.x * 0.5, 2.5, delta);
    camera.rotation.x = pointer.y * 0.03;
    camera.rotation.y = -pointer.x * 0.04;

    stars.update(time);

    placeGalaxy(now);
    if (galaxy.root.visible) {
      scene.updateMatrixWorld();
      galaxy.setPointerLocal(galaxyHit());
      galaxy.update(time, delta, pointer, { reducedMotion });
    }

    renderer.render(scene, camera);
    monitorPerformance(delta);
  };

  /* ---------- Start / pause ---------- */
  let running = false;
  const start = () => {
    if (running) return;
    running = true;
    timer.reset();
    renderer.setAnimationLoop(tick);
  };
  const stop = () => {
    running = false;
    renderer.setAnimationLoop(null);
  };
  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  const ready = new Promise((resolve) => {
    renderer.compile(scene, camera);
    tick();
    requestAnimationFrame(() => {
      start();
      resolve();
    });
  });

  document.addEventListener('app:loaded', () => setTimeout(measure, 50), { once: true });

  /* ---------- Public API ---------- */
  const setTheme = (name) => {
    applyTheme(name);
    renderer.render(scene, camera); // draw immediately so a view transition captures the new look
  };

  const dispose = () => {
    stop();
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerdown', onPointerDown);
    document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    resizeObserver.disconnect();
    stars.dispose();
    galaxy.dispose();
    renderer.dispose();
  };

  return { quality, ready, setTheme, dispose };
}
