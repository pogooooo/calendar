export const crystalVertex = /* glsl */ `
varying vec3 vLocal;
varying vec3 vNormal;
varying vec3 vEye;
varying vec3 vSide;
varying vec3 vUp;

void main() {
    mat4 model = modelViewMatrix;
    #ifdef USE_INSTANCING
        model = model * instanceMatrix;
    #endif
    mat3 basis = mat3(model);
    // Each row maps a view-space axis into crystal space, including nonuniform instance scale.
    mat3 inverseBasis = transpose(mat3(
        basis[0] / dot(basis[0], basis[0]),
        basis[1] / dot(basis[1], basis[1]),
        basis[2] / dot(basis[2], basis[2])
    ));
    vEye = normalize(inverseBasis * vec3(0., 0., 1.));
    vSide = normalize(inverseBasis * vec3(1., 0., 0.));
    vUp = normalize(inverseBasis * vec3(0., 1., 0.));
    vLocal = position;
    vNormal = normal;
    gl_Position = projectionMatrix * model * vec4(position, 1.);
}
`;

export const crystalFragment = /* glsl */ `
uniform vec4 uPlanes[PLANE_COUNT];
uniform vec3 uAmethyst;
uniform vec3 uPearl;
uniform vec3 uWell;
uniform float uSheen;
uniform float uLightHeight;
uniform float uFlash;
uniform float uDark;
uniform float uRail;
varying vec3 vLocal;
varying vec3 vNormal;
varying vec3 vEye;
varying vec3 vSide;
varying vec3 vUp;

// Rectangular studio lights remain crisp in the crystal and broaden on grazing faces.
float beam(float distance) {
    return exp(-distance * distance);
}

vec3 reflectedLight(vec3 ray) {
    vec3 r = vec3(dot(ray, vSide), dot(ray, vUp), dot(ray, vEye));
    float white = beam((r.y - .46 - .5 * r.x + .49 * uSheen - .3 * uLightHeight) * 16.)
        * smoothstep(-.95, -.52, r.x) * (1. - smoothstep(.42, .87, r.x));
    float warm = beam((r.x + .7 + .21 * r.y - .55 * uSheen) * 22.)
        * smoothstep(-.88, -.22, r.y);
    float pale = beam((r.y + .6 + .29 * r.x) * 5.8) * .38;
    float rimLight = beam((r.x - .6 + r.y * .18 - .24 * uSheen) * 18.) * .67;
    return vec3(1., .89, .97) * white + vec3(1., .69, .41) * warm * .72
        + vec3(.72, .44, .86) * pale + vec3(1., .91, .76) * rimLight;
}

float inclusionNoise(vec3 p) {
    vec3 cell = floor(p);
    vec3 f = fract(p);
    f *= f * (3. - 2. * f);
    float seed = dot(cell, vec3(1., 57., 113.));
    vec4 lower = fract(sin(seed + vec4(0., 1., 57., 58.)) * 43758.5453);
    vec4 upper = fract(sin(seed + vec4(113., 114., 170., 171.)) * 43758.5453);
    vec4 values = mix(lower, upper, f.z);
    return mix(mix(values.x, values.y, f.x), mix(values.z, values.w, f.x), f.y);
}

vec4 exitFace(vec3 origin, vec3 ray) {
    float closest = 100.;
    vec3 normal = vec3(0., 0., 1.);
    for (int i = 0; i < PLANE_COUNT; i++) {
        vec4 plane = uPlanes[i];
        float toward = dot(plane.xyz, ray);
        float t = (plane.w - dot(plane.xyz, origin)) / max(toward, .0001);
        if (toward > .0001 && t > .0003 && t < closest) {
            closest = t;
            normal = plane.xyz;
        }
    }
    return vec4(normal, closest);
}

float facetRim(vec3 point, vec3 normal) {
    float edge = 1.;
    for (int i = 0; i < PLANE_COUNT; i++) {
        vec4 plane = uPlanes[i];
        if (dot(plane.xyz, normal) < .985) {
            edge = min(edge, abs(plane.w - dot(plane.xyz, point)));
        }
    }
    return 1. - smoothstep(.003, .025, edge);
}

void main() {
    const float quartzIor = 1.55;
    vec3 n = normalize(vNormal);
    vec3 eye = normalize(vEye);
    float facing = clamp(dot(n, eye), 0., 1.);
    float fresnel = .047 + .953 * pow(1. - facing, 5.);
    vec3 ray = refract(-eye, n, 1. / quartzIor);
    vec3 origin = vLocal + ray * .001;
    vec3 transmitted = vec3(0.);
    float path = 0.;

    // Follow the light inside the solid to reveal different faces behind the crown.
    for (int bounce = 0; bounce < 3; bounce++) {
        vec4 face = exitFace(origin, ray);
        path += min(face.w, 5.);
        vec3 escaped = refract(ray, -face.xyz, quartzIor);
        if (dot(escaped, escaped) > .01) {
            transmitted = reflectedLight(escaped);
            break;
        }
        origin += ray * face.w - face.xyz * .002;
        ray = reflect(ray, face.xyz);
    }

    vec3 core = vLocal + ray * .72;
    float cloud = inclusionNoise(core * vec3(2., 2.2, 1.7));
    float band = smoothstep(.18, .84, cloud + .17 * inclusionNoise(core * 5.8));
    float inclusion = inclusionNoise((core + vec3(0., 0., band * .18)) * vec3(16., 14., 23.));
    float stain = clamp(path * .22 + band * .35 + uRail * .53 + uDark * .14, .0, .99);
    vec3 body = mix(uPearl, uAmethyst, stain);
    body = mix(body, uWell, smoothstep(1.7, 5.4, path) * .69);
    body *= .65 + facing * .28;
    body += uPearl * smoothstep(.69, .87, inclusion) * band * .09;
    vec3 surface = reflectedLight(reflect(-eye, n));
    vec3 color = body + transmitted * exp(-.18 * path) * (.29 + .4 * uFlash);
    color = mix(color, color * .32 + surface * .72 + uAmethyst * .1, fresnel);
    color += surface * (.34 + uFlash * .71);
    float polish = dot(normalize(vec3(-.29 + uSheen * .37, .48, .88)), n);
    float streak = beam((core.y + core.x * .37 - core.z * .5 + .2 - uSheen * 1.35) * 11.);
    float edge = facetRim(vLocal, n);
    color += vec3(1., .84, .93) * pow(max(polish, 0.), 9.) * (streak * (.32 + uFlash) + edge * .21);
    float facetLight = max(dot(normalize(vec3(-.32 + uSheen * .27, .55 - uLightHeight * .32, .85)), n), 0.);
    color += vec3(1., .83, .66) * pow(facetLight, 15.) * edge * (.39 + .47 * uFlash);
    // Keep the reading side of the calendar dark, with stronger highlights on the rail.
    float ceiling = mix(.22, .91, uRail);
    if (uDark > .5) color = min(color, vec3(ceiling, ceiling * .8, ceiling));
    gl_FragColor = vec4(color, 1.);
    #include <colorspace_fragment>
}
`;

// A small diffraction highlight, attached to a cut edge and oriented with the studio light.
export const glintVertex = /* glsl */ `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
`;

export const glintFragment = /* glsl */ `
uniform float uLight;
uniform float uAngle;
varying vec2 vUv;
void main() {
    vec2 p = vUv * 2. - 1.;
    float c = cos(uAngle), s = sin(uAngle);
    p = mat2(c, -s, s, c) * p;
    float core = exp(-dot(p, p) * 540.);
    float spill = exp(-dot(p, p) * 48.) * .23;
    float longRay = exp(-abs(p.x) * 6. - abs(p.y) * 164.);
    float shortRay = exp(-abs(p.y) * 9. - abs(p.x) * 133.) * .57;
    float light = clamp((core + spill + longRay + shortRay) * uLight, 0., 1.);
    gl_FragColor = vec4(mix(vec3(1., .69, .43), vec3(1., .99, .99), core), light);
    #include <colorspace_fragment>
}
`;
