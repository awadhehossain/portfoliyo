/**
 * shaders.js — GLSL for the starfield and the galaxy.
 * Fragment shaders end with <colorspace_fragment> so colours authored as
 * THREE.Color (linear) are output correctly in sRGB.
 *
 * Every material has a `uLight` uniform: 0 in dark mode (additive, glowing
 * points on a night sky), 1 in light mode (ink-coloured points on paper).
 */

/* ---------------------------------------------------------------- */
/*  Starfield: crisp, twinkling pin-points in three tints            */
/* ---------------------------------------------------------------- */
export const starVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uLight;

  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  attribute vec3 aInk;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;

    float depth = -mv.z;
    float size = aSize * uPixelRatio * (0.7 + 6.0 / depth);
    gl_PointSize = clamp(size, 1.0, 9.0 * uPixelRatio);

    float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aPhase * 1.6) + aPhase * 40.0);
    vAlpha = twinkle * smoothstep(80.0, 30.0, depth);
    vColor = mix(aColor, aInk, uLight);
  }
`;

export const starFragment = /* glsl */ `
  uniform float uLight;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.05, d);
    float a = pow(core, mix(1.6, 1.8, uLight)) * vAlpha * mix(1.0, 0.9, uLight);
    if (a < 0.003) discard;
    gl_FragColor = vec4(vColor, a);
    #include <colorspace_fragment>
  }
`;

/* ---------------------------------------------------------------- */
/*  Galaxy                                                           */
/*  position = the particle's place in the tidy spiral.              */
/*  uChaos 0 → spiral, 1 → a turbulent, unravelled swirl.            */
/*  The pointer pushes particles aside; a click sends a shockwave.   */
/* ---------------------------------------------------------------- */
export const galaxyVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSpin;
  uniform float uChaos;
  uniform float uPixelRatio;
  uniform float uPointScale;
  uniform float uSizeBoost;
  uniform float uLight;
  uniform float uOpacity;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  uniform vec2 uWaveOrigin;
  uniform float uWaveAge;

  attribute float aSize;
  attribute float aSeed;
  attribute float aBright;
  attribute float aFlare;
  attribute float aCore;
  attribute vec3 aColor;
  attribute vec3 aInk;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vFlare;
  varying float vGlow;

  vec2 rot(vec2 p, float a) {
    float c = cos(a), s = sin(a);
    return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  }

  void main() {
    vec3 p = position;
    float r = length(p.xy);

    /* --- chaos: twist by radius, then push along a flowing noise field --- */
    float twist = uChaos * (1.4 * sin(aSeed * 6.2831 + r * 5.0) + 2.4 * (1.1 - r));
    p.xy = rot(p.xy, twist);
    vec3 flow = vec3(
      sin(p.y * 3.3 + aSeed * 12.0 + uTime * 0.35),
      cos(p.x * 2.9 - aSeed * 9.0 + uTime * 0.3),
      sin((p.x + p.y) * 2.1 + aSeed * 5.0)
    );
    p += flow * uChaos * (0.16 + 0.3 * r);
    p.z += uChaos * (aSeed - 0.5) * 0.9;

    /* --- slow rigid rotation + a gentle per-star wobble --- */
    p.xy = rot(p.xy, uTime * uSpin);
    p.xy += vec2(sin(uTime * 0.6 + aSeed * 40.0), cos(uTime * 0.5 + aSeed * 31.0)) * 0.004;

    /* --- pointer: stars part around the cursor --- */
    vec2 toP = p.xy - uPointer;
    float dist = length(toP);
    float push = uPointerStrength * smoothstep(0.32, 0.0, dist);
    p.xy += (toP / max(dist, 1e-4)) * push * 0.085;

    /* --- click: an expanding shockwave --- */
    vec2 toW = p.xy - uWaveOrigin;
    float wd = length(toW);
    float wave = exp(-pow((wd - uWaveAge * 1.15) * 6.5, 2.0)) * smoothstep(1.8, 0.0, uWaveAge);
    p.xy += (toW / max(wd, 1e-4)) * wave * 0.07;
    p.z += wave * 0.05;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float glow = push * 0.9 + wave * 1.3;
    float size = aSize * uSizeBoost * uPointScale * uPixelRatio * (1.0 + glow * 0.8) * (1.0 + uChaos * 0.25) * (1.0 + 0.3 * uLight);
    gl_PointSize = clamp(size, 1.0, 80.0 * uPixelRatio);

    float twinkle = 0.78 + 0.22 * sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 60.0);
    float lightAlpha = mix(1.0, 0.5, aCore);
    vAlpha = aBright * twinkle * uOpacity * mix(1.0, lightAlpha, uLight);
    vColor = mix(aColor, aInk, uLight);
    vFlare = aFlare;
    vGlow = glow;
  }
`;

export const galaxyFragment = /* glsl */ `
  uniform float uLight;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vFlare;
  varying float vGlow;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a;
    vec3 col = vColor;

    if (vFlare > 0.5) {
      // bright star with diffraction spikes
      float core = smoothstep(mix(0.1, 0.07, uLight), 0.0, d);
      float halo = pow(smoothstep(0.5, 0.0, d), 5.0) * mix(0.55, 0.12, uLight);
      float spikes = (exp(-abs(c.y) * 160.0) + exp(-abs(c.x) * 160.0)) * smoothstep(0.5, 0.05, d) * mix(0.85, 0.45, uLight);
      a = core + halo + spikes;
      col = mix(col, vec3(1.0), core * (1.0 - uLight));
    } else {
      a = pow(smoothstep(0.5, 0.0, d), mix(1.7, 1.45, uLight));
    }

    col *= 1.0 + vGlow * (1.0 - uLight) * 0.8;
    float alpha = a * vAlpha;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

/* ---------------------------------------------------------------- */
/*  Soft glowing nucleus behind the galaxy core                      */
/* ---------------------------------------------------------------- */
export const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const glowFragment = /* glsl */ `
  uniform vec3 uInner;
  uniform vec3 uOuter;
  uniform float uIntensity;
  uniform float uLight;
  varying vec2 vUv;

  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float core = pow(smoothstep(0.28, 0.0, d), 2.0);
    float halo = pow(smoothstep(1.0, 0.0, d), 2.6);
    vec3 col = mix(uOuter, uInner, core);
    float a = (core * mix(0.9, 0.0, uLight) + halo * mix(0.42, 0.28, uLight)) * uIntensity;
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;
