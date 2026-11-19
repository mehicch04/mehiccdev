import * as THREE from "three";

export type StoneOpts = {
  color: string;
  masonry: number;
  course?: number;
  uplight: number;
  reach?: number;
  vertexColors?: boolean;
  roughness?: number;
};

const NOISE = /* glsl */ `
varying vec3 vSW;
varying vec3 vSN;
uniform float uMasonry;
uniform float uCourse;
uniform float uUp;
uniform float uReach;
float sh(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float sn(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(sh(i), sh(i + vec3(1,0,0)), f.x), mix(sh(i + vec3(0,1,0)), sh(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(sh(i + vec3(0,0,1)), sh(i + vec3(1,0,1)), f.x), mix(sh(i + vec3(0,1,1)), sh(i + vec3(1,1,1)), f.x), f.y), f.z); }
float sf(vec3 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * sn(p); p *= 2.03; a *= 0.5; } return v; }
float joints(vec3 p, vec3 n){
  float h = uCourse;
  float row = floor(p.y / h);
  float fy = fract(p.y / h);
  vec3 an = abs(n);
  float u = an.x > an.z ? p.z : p.x;
  float w = h * (2.1 + sh(vec3(row, 3.1, 7.7)) * 1.4);
  float fx = fract((u + sh(vec3(row, 1.3, 2.9)) * 9.0) / w);
  float jy = smoothstep(0.0, 0.06, fy) * smoothstep(1.0, 0.94, fy);
  float jx = smoothstep(0.0, 0.025, fx) * smoothstep(1.0, 0.975, fx);
  float top = step(0.75, an.y);
  return mix(jy * jx, 1.0, top);
}
`;

export function stoneMaterial(o: StoneOpts) {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(o.color),
    roughness: o.roughness ?? 0.92,
    metalness: 0,
    vertexColors: !!o.vertexColors,
  });
  const uniforms = {
    uMasonry: { value: o.masonry },
    uCourse: { value: o.course ?? 0.46 },
    uUp: { value: o.uplight },
    uReach: { value: o.reach ?? 0 },
  };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, uniforms);
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vSW;\nvarying vec3 vSN;")
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 sw = vec4(transformed, 1.0);
        vec3 snn = objectNormal;
        #ifdef USE_INSTANCING
          sw = instanceMatrix * sw;
          snn = mat3(instanceMatrix) * snn;
        #endif
        sw = modelMatrix * sw;
        vSW = sw.xyz;
        vSN = normalize(mat3(modelMatrix) * snn);`,
      );
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", `#include <common>\n${NOISE}`)
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        vec3 sp = vSW;
        float big = sf(sp * 0.09);
        float mid = sf(sp * 0.55 + 4.0);
        float fine = sn(sp * 3.1);
        float tone = 0.8 + big * 0.28 + mid * 0.14 + fine * 0.06;
        float jt = mix(1.0, mix(0.72, 1.0, joints(sp, vSN)), uMasonry);
        float block = mix(1.0, 0.9 + 0.2 * sh(floor(vec3(sp.x / 1.1, sp.y / uCourse, sp.z / 1.1))), uMasonry);
        diffuseColor.rgb *= tone * jt * block;
        float wet = 1.0 - smoothstep(0.0, 1.6, sp.y);
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.42, 0.45, 0.44), wet * 0.85);
        diffuseColor.rgb *= mix(0.55, 1.0, smoothstep(-3.0, 0.4, sp.y));`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
        {
          vec3 q = vSW * 2.2;
          float e = 0.06;
          float b0 = sn(q);
          vec3 g = vec3(sn(q + vec3(e,0,0)) - b0, sn(q + vec3(0,e,0)) - b0, sn(q + vec3(0,0,e)) - b0) / e;
          vec3 gv = (viewMatrix * vec4(g, 0.0)).xyz;
          normal = normalize(normal - gv * 0.035);
        }`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          float h = max(vSW.y, 0.0);
          float fall = exp(-h / 17.0) * 0.75 + 0.25 * smoothstep(34.0, 6.0, h);
          float face = 0.38 + 0.62 * clamp(-vSN.y, 0.0, 1.0) + 0.42 * clamp(vSN.z, 0.0, 1.0);
          float near = uReach > 0.0 ? exp(-dot(vSW.xz, vSW.xz) / (uReach * uReach)) : 1.0;
          float below = smoothstep(-1.5, 0.6, vSW.y);
          vec3 gold = vec3(1.0, 0.62, 0.3);
          totalEmissiveRadiance += gold * diffuseColor.rgb * uUp * fall * face * near * below;
        }`,
      );
  };
  m.customProgramCacheKey = () => `stone${o.vertexColors ? 1 : 0}`;
  return m;
}
