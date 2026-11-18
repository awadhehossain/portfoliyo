/**
 * galaxy.js — a two-armed spiral galaxy made of glowing particles.
 *
 *   root      positioned + scaled over #hero-visual by experience.js
 *   └─ tilt   gentle inclination that follows the pointer
 *      ├─ glow    soft nucleus
 *      └─ points  bulge, arms, star clusters, dust and a trailing outer arm
 *
 * The particle layout is the tidy spiral. The shader can unravel it into a
 * turbulent swirl (uChaos), which is used for the intro and when the hero
 * scrolls away. Built at radius ~1; experience.js scales it to the layout.
 */

import * as THREE from 'three';
import { galaxyVertex, galaxyFragment, glowVertex, glowFragment } from './shaders.js';

const rand = (min, max) => min + Math.random() * (max - min);
const gauss = () => {
  // Box–Muller
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/* Star tints (night sky) paired with their ink colours (light mode) */
const ARM_TINTS = [
  { color: '#eef4ff', ink: '#1a2152', weight: 0.36 },
  { color: '#a9ccff', ink: '#2a46c2', weight: 0.28 },
  { color: '#6f9dff', ink: '#3a5df0', weight: 0.14 },
  { color: '#ffa86a', ink: '#c45d1a', weight: 0.16 },
  { color: '#fff1df', ink: '#4b3a8f', weight: 0.06 },
];
const CORE_TINTS = [
  { color: '#fff6ea', ink: '#22285e', weight: 0.6 },
  { color: '#ffe2c2', ink: '#5b3b9a', weight: 0.4 },
];

function pick(tints) {
  let r = Math.random();
  for (const t of tints) if ((r -= t.weight) <= 0) return t;
  return tints[0];
}

const ARMS = 2;
const WIND = 4.2; // how tightly the arms wind
const armAngle = (arm, r) => arm * Math.PI + WIND * Math.log(1 + 4 * r);

export function createGalaxy({ count, pixelRatio }) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const inks = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const brights = new Float32Array(count);
  const flares = new Float32Array(count);
  const cores = new Float32Array(count);
  const c = new THREE.Color();

  // Star-forming knots along the arms
  const clusters = [];
  for (let a = 0; a < ARMS; a++) {
    for (let k = 0; k < 24; k++) clusters.push({ arm: a, t: rand(0.1, 1), spread: rand(0.012, 0.034) });
  }

  const armXY = (arm, t, spread) => {
    const r = 0.06 + t * 0.94;
    const th = armAngle(arm, r);
    return [Math.cos(th) * r + gauss() * spread, Math.sin(th) * r + gauss() * spread, r];
  };

  let flareBudget = 7;
  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    let x, y, z, size, bright, tint, core = 0, flare = 0;

    if (roll < 0.1) {
      // bulge
      const r = Math.abs(gauss()) * 0.075;
      const th = Math.random() * Math.PI * 2;
      x = Math.cos(th) * r * 1.15;
      y = Math.sin(th) * r;
      z = gauss() * 0.035;
      size = rand(1.4, 2.8);
      bright = rand(0.75, 1);
      tint = pick(CORE_TINTS);
      core = 1;
    } else if (roll < 0.18) {
      // inner disc haze
      const r = Math.sqrt(Math.random()) * 0.38;
      const th = Math.random() * Math.PI * 2;
      x = Math.cos(th) * r;
      y = Math.sin(th) * r;
      z = gauss() * 0.02;
      size = rand(0.9, 1.6);
      bright = rand(0.22, 0.5);
      tint = pick(ARM_TINTS);
      core = 0.6;
    } else if (roll < 0.8) {
      // arm stars, many of them gathered into clusters
      const arm = i % ARMS;
      if (Math.random() < 0.5) {
        const k = clusters[Math.floor(Math.random() * clusters.length)];
        [x, y] = armXY(k.arm, k.t, 0.006);
        x += gauss() * k.spread;
        y += gauss() * k.spread;
        const big = Math.random() < 0.08;
        size = big ? rand(3.2, 5.8) : rand(1.3, 2.6);
        bright = rand(0.7, 1);
        if (big && flareBudget > 0 && k.t > 0.3 && Math.random() < 0.08) {
          flare = 1;
          flareBudget--;
          size = rand(20, 30);
        }
      } else {
        const t = Math.pow(Math.random(), 0.85);
        [x, y] = armXY(arm, t, 0.012 + 0.036 * t);
        size = rand(1.1, 2.3);
        bright = rand(0.6, 1);
      }
      z = gauss() * 0.018;
      tint = pick(ARM_TINTS);
    } else if (roll < 0.92) {
      // dust lanes around the arms
      const t = Math.pow(Math.random(), 0.8);
      [x, y] = armXY(i % ARMS, t, 0.07 + 0.06 * t);
      z = gauss() * 0.03;
      size = rand(0.7, 1.2);
      bright = rand(0.1, 0.22);
      tint = pick(ARM_TINTS);
    } else if (roll < 0.97) {
      // long trailing outer arm
      const t = rand(0.85, 1.45);
      [x, y] = armXY(0, t, 0.012 + 0.02 * (t - 0.85));
      z = gauss() * 0.015;
      size = rand(1, 2.2);
      bright = rand(0.45, 0.9);
      tint = pick(ARM_TINTS);
    } else {
      // sparse field stars around the disc
      const r = rand(0.2, 1.35);
      const th = Math.random() * Math.PI * 2;
      x = Math.cos(th) * r;
      y = Math.sin(th) * r;
      z = gauss() * 0.06;
      size = rand(0.9, 1.8);
      bright = rand(0.2, 0.5);
      tint = pick(ARM_TINTS);
    }

    positions.set([x, y, z], i * 3);
    c.set(tint.color);
    colors.set([c.r, c.g, c.b], i * 3);
    c.set(tint.ink);
    inks.set([c.r, c.g, c.b], i * 3);
    sizes[i] = size;
    brights[i] = bright;
    seeds[i] = Math.random();
    flares[i] = flare;
    cores[i] = core;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aInk', new THREE.BufferAttribute(inks, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute('aBright', new THREE.BufferAttribute(brights, 1));
  geometry.setAttribute('aFlare', new THREE.BufferAttribute(flares, 1));
  geometry.setAttribute('aCore', new THREE.BufferAttribute(cores, 1));

  const uniforms = {
    uTime: { value: 0 },
    uSpin: { value: 0.035 },
    uChaos: { value: 1 },
    uPixelRatio: { value: pixelRatio },
    uPointScale: { value: 1 },
    uSizeBoost: { value: 2.0 },
    uLight: { value: 0 },
    uOpacity: { value: 0 },
    uPointer: { value: new THREE.Vector2(9, 9) },
    uPointerStrength: { value: 0 },
    uWaveOrigin: { value: new THREE.Vector2(0, 0) },
    uWaveAge: { value: 99 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: galaxyVertex,
    fragmentShader: galaxyFragment,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  /* ---------- Nucleus glow ---------- */
  const glowUniforms = {
    uInner: { value: new THREE.Color('#fff4e4') },
    uOuter: { value: new THREE.Color('#5d7dff') },
    uIntensity: { value: 0 },
    uLight: { value: 0 },
  };
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: glowUniforms,
    vertexShader: glowVertex,
    fragmentShader: glowFragment,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const glowGeometry = new THREE.PlaneGeometry(1.35, 1.35);
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.renderOrder = -1;

  const root = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.add(glow, points);
  root.add(tilt);

  /* ---------- State ---------- */
  let pointerStrength = 0;
  let pointerTarget = 0;
  let waveStart = -99;
  let time = 0;
  const BASE_TILT_X = -0.38;
  const BASE_TILT_Z = 0.22;
  tilt.rotation.set(BASE_TILT_X, 0, BASE_TILT_Z);

  return {
    root,
    tilt,
    /** Radius (in local units) that counts as "on the galaxy" for clicks. */
    hitRadius: 1.25,

    setPointerLocal(local) {
      if (!local) {
        pointerTarget = 0;
        return;
      }
      uniforms.uPointer.value.set(local.x, local.y);
      pointerTarget = 1;
    },

    pulse(local) {
      uniforms.uWaveOrigin.value.set(local.x, local.y);
      waveStart = time;
    },

    /** chaos 0..1, opacity 0..1, pointScale ~1 */
    setState({ chaos, opacity, pointScale }) {
      if (chaos !== undefined) uniforms.uChaos.value = chaos;
      if (opacity !== undefined) {
        uniforms.uOpacity.value = opacity;
        glowUniforms.uIntensity.value = opacity * (1 - uniforms.uChaos.value * 0.6);
      }
      if (pointScale !== undefined) uniforms.uPointScale.value = pointScale;
    },

    update(t, delta, pointer, { reducedMotion = false } = {}) {
      time = t;
      uniforms.uTime.value = t;
      uniforms.uWaveAge.value = t - waveStart;

      pointerStrength += (pointerTarget - pointerStrength) * (1 - Math.exp(-delta * 5));
      uniforms.uPointerStrength.value = pointerStrength;

      const k = 1 - Math.exp(-delta * 2.5);
      const follow = reducedMotion ? 0 : 1;
      tilt.rotation.x += (BASE_TILT_X + pointer.y * 0.16 * follow - tilt.rotation.x) * k;
      tilt.rotation.y += (pointer.x * 0.2 * follow - tilt.rotation.y) * k;
    },

    setTheme(light) {
      uniforms.uLight.value = light ? 1 : 0;
      glowUniforms.uLight.value = light ? 1 : 0;
      glowUniforms.uOuter.value.set(light ? '#7468e8' : '#5d7dff');
      const blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      material.blending = blending;
      glowMaterial.blending = blending;
      material.needsUpdate = true;
      glowMaterial.needsUpdate = true;
    },

    setPixelRatio(pr) {
      uniforms.uPixelRatio.value = pr;
    },

    setDensity(fraction) {
      geometry.setDrawRange(0, Math.floor(count * fraction));
    },

    dispose() {
      geometry.dispose();
      material.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
    },
  };
}
