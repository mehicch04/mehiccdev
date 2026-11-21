import * as THREE from "three";

const COMMON = /* glsl */ `
varying vec3 vSW;
varying vec3 vSN;
uniform vec4 uBounds;
uniform vec3 uEdge;
uniform float uTexel;
float sh(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float sn(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(sh(i), sh(i + vec3(1,0,0)), f.x), mix(sh(i + vec3(0,1,0)), sh(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(sh(i + vec3(0,0,1)), sh(i + vec3(1,0,1)), f.x), mix(sh(i + vec3(0,1,1)), sh(i + vec3(1,1,1)), f.x), f.y), f.z); }
float tri(vec3 p, vec3 n){
  vec3 w = pow(abs(n), vec3(4.0)); w /= (w.x + w.y + w.z);
  float a = sn(vec3(p.yz, 0.0) * 3.1) * 0.6 + sn(vec3(p.yz, 1.7) * 9.3) * 0.4;
  float b = sn(vec3(p.xz, 3.3) * 3.1) * 0.6 + sn(vec3(p.xz, 5.1) * 9.3) * 0.4;
  float c = sn(vec3(p.xy, 7.9) * 3.1) * 0.6 + sn(vec3(p.xy, 2.2) * 9.3) * 0.4;
  return a * w.x + b * w.y + c * w.z;
}
float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
float scanKeep(vec3 p){
  float fx = smoothstep(uBounds.x, uBounds.x + uEdge.x, p.x) * (1.0 - smoothstep(uBounds.y - uEdge.x, uBounds.y, p.x));
  float fz = smoothstep(uBounds.z, uBounds.z + uEdge.y, p.z) * (1.0 - smoothstep(uBounds.w - uEdge.z, uBounds.w, p.z));
  return fx * fz;
}
`;

export function scanMaterial(src: THREE.MeshStandardMaterial, maxAniso: number) {
  const map = src.map;
  const nrm = src.normalMap;
  if (map) {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = maxAniso;
    map.generateMipmaps = true;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.needsUpdate = true;
  }
  if (nrm) {
    nrm.colorSpace = THREE.NoColorSpace;
    nrm.anisotropy = maxAniso;
    nrm.needsUpdate = true;
  }
  const m = new THREE.MeshStandardMaterial({
    map,
    normalMap: nrm,
    normalScale: new THREE.Vector2(1.4, 1.4),
    roughness: 0.92,
    metalness: 0.02,
    envMapIntensity: 0.05,
  });
  const uniforms = {
    uBounds: { value: new THREE.Vector4(-60, 57, -34, 62) },
    uEdge: { value: new THREE.Vector3(16, 14, 22) },
    uTexel: { value: 1 / (map?.image?.width ?? 4096) },
  };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, uniforms);
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vSW;\nvarying vec3 vSN;")
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vSW = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vSN = normalize(mat3(modelMatrix) * objectNormal);`,
      );
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", `#include <common>\n${COMMON}\nfloat gVeg;\nfloat gCon;`)
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        if (vSW.y < 3.1 && abs(vSW.x) < 10.2 && (vSW.z < -3.5 || vSW.z > 7.0)) discard;
        {
          vec3 base = diffuseColor.rgb;
          vec2 o = vec2(uTexel * 2.0, 0.0);
          float l0 = lum(base);
          float la = lum(texture2D(map, vMapUv + o.xy).rgb);
          float lb = lum(texture2D(map, vMapUv - o.xy).rgb);
          float lc = lum(texture2D(map, vMapUv + o.yx).rgb);
          float ld = lum(texture2D(map, vMapUv - o.yx).rgb);
          gCon = clamp(abs(l0 - (la + lb + lc + ld) * 0.25) / max(l0, 0.02) * 2.4, 0.0, 1.0);
          gVeg = smoothstep(0.0, 0.025, base.g - base.r * 1.05) * smoothstep(0.0, 0.025, base.g - base.b * 1.08);
          float micro = tri(vSW, vSN);
          diffuseColor.rgb *= 1.0 + (micro - 0.5) * 0.12;
          float leaf = sn(vSW * 7.3) * 0.55 + sn(vSW * 19.0 + 3.1) * 0.45;
          vec3 dusk = mix(vec3(lum(base)), base, 0.35) * vec3(0.62, 0.86, 0.7);
          dusk *= 0.45 * (0.55 + leaf * 0.9);
          diffuseColor.rgb = mix(diffuseColor.rgb, dusk, gVeg);
        }`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        roughnessFactor = mix(mix(0.86, 0.98, gCon), 1.0, gVeg);`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
        {
          vec3 q = vSW * mix(6.0, 14.0, gVeg);
          float e = 0.05;
          float b0 = sn(q);
          vec3 g = vec3(sn(q + vec3(e,0,0)) - b0, sn(q + vec3(0,e,0)) - b0, sn(q + vec3(0,0,e)) - b0) / e;
          normal = normalize(normal - (viewMatrix * vec4(g, 0.0)).xyz * mix(0.022, 0.09, gVeg));
        }`,
      )
      .replace(
        "#include <fog_fragment>",
        `#include <fog_fragment>
        #ifdef USE_FOG
          gl_FragColor.rgb = mix(fogColor * 0.35, gl_FragColor.rgb, scanKeep(vSW));
        #endif`,
      );
  };
  m.customProgramCacheKey = () => "scan-v1";
  return m;
}
