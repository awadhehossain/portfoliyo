/**
 * starfield.js — tiny twinkling stars that fill the whole page. They sit in
 * a tall volume that the camera travels down through as the page scrolls,
 * so nearer stars drift faster than far ones (parallax).
 */

import * as THREE from 'three';
import { starVertex, starFragment } from './shaders.js';

const rand = (min, max) => min + Math.random() * (max - min);

/* Night-sky tints and their "ink" versions for light mode */
const TINTS = [
  { color: '#ffffff', ink: '#1d2550', weight: 0.56 },
  { color: '#8fb8ff', ink: '#2f4fd0', weight: 0.27 },
  { color: '#ffae6b', ink: '#c2601c', weight: 0.12 },
  { color: '#c7a6ff', ink: '#6c3fd6', weight: 0.05 },
];

function pickTint() {
  let r = Math.random();
  for (const t of TINTS) {
    if ((r -= t.weight) <= 0) return t;
  }
  return TINTS[0];
}

/**
 * @param {object} o
 * @param {number} o.count
 * @param {{x:number, yMin:number, yMax:number, zMin:number, zMax:number}} o.bounds
 * @param {number} o.pixelRatio
 */
export function createStarfield({ count, bounds, pixelRatio }) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const inks = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const c = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const z = rand(bounds.zMin, bounds.zMax);
    // spread wider when further away so the frame is always filled
    const spread = bounds.x * (1 + (-z / 40));
    positions[i * 3] = rand(-spread, spread);
    positions[i * 3 + 1] = rand(bounds.yMin, bounds.yMax);
    positions[i * 3 + 2] = z;

    const tint = pickTint();
    c.set(tint.color);
    colors.set([c.r, c.g, c.b], i * 3);
    c.set(tint.ink);
    inks.set([c.r, c.g, c.b], i * 3);

    // mostly pin-pricks, a few brighter stars
    sizes[i] = 1.1 + Math.pow(Math.random(), 6) * 3.6;
    phases[i] = Math.random();
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aInk', new THREE.BufferAttribute(inks, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uLight: { value: 0 },
    },
    vertexShader: starVertex,
    fragmentShader: starFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  return {
    object: points,
    update(time) {
      material.uniforms.uTime.value = time;
    },
    setTheme(light) {
      material.uniforms.uLight.value = light ? 1 : 0;
      material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      material.needsUpdate = true;
    },
    setPixelRatio(pr) {
      material.uniforms.uPixelRatio.value = pr;
    },
    setDensity(fraction) {
      geometry.setDrawRange(0, Math.floor(count * fraction));
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
