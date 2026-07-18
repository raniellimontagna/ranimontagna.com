export const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform vec3 uAccent;
  uniform vec3 uIce;
  uniform float uIntensity;
  uniform float uMotionScale;
  uniform float uDetail;
  uniform float uDark;

  float hash(vec2 position) {
    vec3 p3 = fract(vec3(position.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise(vec2 position) {
    vec2 cell = floor(position);
    vec2 local = fract(position);
    vec2 eased = local * local * (3.0 - 2.0 * local);

    float bottom = mix(hash(cell), hash(cell + vec2(1.0, 0.0)), eased.x);
    float top = mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0)), eased.x);
    return mix(bottom, top, eased.y);
  }

  float fbm(vec2 position) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int octave = 0; octave < 3; octave++) {
      if (float(octave) >= uDetail) break;
      value += amplitude * noise(position);
      position = position * 2.03 + vec2(17.1, 9.2);
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 centered = vUv - 0.5;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    centered.x *= aspect;

    float time = uTime * (0.035 + 0.045 * uMotionScale);
    vec2 pointerForce = uPointer * vec2(0.11, 0.075) * uMotionScale;
    vec2 broadPosition = centered * vec2(1.15, 1.55) - pointerForce;

    float warpOne = fbm(broadPosition * 1.12 + vec2(time, -time * 0.66));
    float warpTwo = fbm(
      broadPosition.yx * vec2(0.92, 1.18) + vec2(-time * 0.72, time * 0.48) + 8.7
    );
    vec2 warp = vec2(warpOne - 0.5, warpTwo - 0.5);

    float fieldOne = fbm(broadPosition * 0.72 + warp * 0.76 + vec2(time * 0.5, 2.1));
    float fieldTwo = fbm(
      broadPosition.yx * 0.64 - warp.yx * 0.62 + vec2(4.2, -time * 0.42)
    );

    float membrane = smoothstep(0.18, 0.82, fieldOne * 0.68 + fieldTwo * 0.48);
    float fold = 1.0 - smoothstep(0.1, 0.48, abs(fieldOne - fieldTwo));
    float broadVeil = clamp(membrane * 0.76 + fold * 0.24, 0.0, 1.0);

    float centerDistance = length(centered * vec2(0.74, 1.0));
    float calmCenter = smoothstep(0.08, 0.62, centerDistance);
    broadVeil *= mix(0.32, 1.0, calmCenter);

    vec2 edgeDistance = min(vUv, 1.0 - vUv);
    float edgeSoftness = smoothstep(0.0, 0.18, min(edgeDistance.x, edgeDistance.y));
    float luminanceLift = mix(0.9, 1.12, uDark);
    vec3 veilColor = mix(uAccent, uIce, smoothstep(0.18, 0.86, fieldTwo));
    veilColor *= luminanceLift;

    float grain = (hash(gl_FragCoord.xy + floor(uTime * 7.0)) - 0.5) * 0.018;
    veilColor = max(vec3(0.0), veilColor + grain);

    float alpha = broadVeil * edgeSoftness * uIntensity * mix(0.2, 0.34, uDark);
    gl_FragColor = vec4(veilColor * alpha, alpha);
  }
`
