import facetLustre from "@/features/gem/materials/cut-neutral.webp";
import { normalizeGemColor } from "@/features/gem/color";
import { easeOut, hex, type Effect, type FxContext, type FxModule } from "../engine";
import type { FxEvent } from "@/lib/fx";

const vertex = `
    varying vec2 vUv;
    varying vec3 vFacet;
    void main() {
        vUv = uv;
        vFacet = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragment = `
    varying vec2 vUv;
    varying vec3 vFacet;
    uniform sampler2D uMaterial;
    uniform vec3 uStone;
    uniform float uOpacity;
    uniform float uSweep;
    uniform vec2 uSpot;
    uniform vec2 uCrop;
    uniform float uShade;
    void main() {
        vec2 cut = uSpot + (vUv - .5) * uCrop + vec2(vFacet.x * .035 + uSweep, 0.0);
        vec3 board = texture2D(uMaterial, clamp(cut, vec2(.0), vec2(1.0))).rgb;
        float luminance = dot(board, vec3(.2126, .7152, .0722));
        float reflection = smoothstep(.73, .96, luminance);
        float shoulder = smoothstep(.34, .69, luminance) * (1.0 - reflection);
        vec2 edge = smoothstep(vec2(.0), vec2(.19, .30), min(vUv, 1.0 - vUv));
        float alpha = (reflection + shoulder * .47) * edge.x * edge.y * uOpacity;
        // Deepen the adjoining facet so the source's white reflection reads on pale stone too.
        vec3 stone = mix(mix(board * uShade, uStone, .15), board, reflection);
        gl_FragColor = vec4(stone, alpha);
    }
`;

/** Each view has one travelling reflection. Rapid taps replace the previous one. */
const active = new WeakMap<FxContext["scene"], Effect>();

function reflection(image: HTMLImageElement, ctx: FxContext, event: FxEvent): Effect | null {
    if (ctx.hasRect && (ctx.rect.w < 10 || ctx.rect.h < 10)) return null;

    const { THREE, scene } = ctx;
    const direction = event.direction ?? 1;
    const width = ctx.hasRect
        ? Math.min(ctx.rect.w * .86, 142)
        : 90;
    const height = Math.min(24, ctx.hasRect ? ctx.rect.h : 24);
    const travel = ctx.hasRect
        ? Math.min(ctx.rect.w - width, 58)
        : 32;
    const start = ctx.hasRect
        ? ctx.rect.x + width / 2 + (direction < 0 ? travel : 0)
        : ctx.x - travel / 2;
    const top = Math.max(height / 2, ctx.hasRect ? ctx.rect.y : ctx.y - 14);
    if (top >= ctx.H || start < -width || start > ctx.W + width) return null;

    const materialMap = ctx.texture("gem-cut-reflection", (canvas, size) => {
        canvas.drawImage(image, 0, 0, size, size);
    }, 256);
    const color = normalizeGemColor(document.documentElement.style.getPropertyValue("--gem-stone").trim());
    const cropWidth = .76;
    const uniforms = {
        uMaterial: { value: materialMap },
        uStone: { value: new THREE.Vector3(...hex(color)) },
        uOpacity: { value: 0 },
        uSweep: { value: 0 },
        uSpot: { value: new THREE.Vector2(.45, .47) },
        uCrop: { value: new THREE.Vector2(cropWidth, Math.min(.82, cropWidth * image.naturalWidth / image.naturalHeight * height / width)) },
        uShade: { value: ctx.dark ? .94 : .68 },
    };

    // Fold the plane into adjacent cut faces so each surface samples the actual board at a different angle.
    const plane = new THREE.PlaneGeometry(1, 1, 4, 1);
    const geometry = plane.toNonIndexed();
    plane.dispose();
    const positions = geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        positions.setZ(i, Math.abs(x) === .25 ? .13 : .015);
    }
    geometry.computeVertexNormals();
    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        depthTest: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(width, height, 10);
    scene.add(mesh);

    let elapsed = 0;
    let disposed = false;
    const life = ctx.gentle ? .20 : .46;
    const strength = ctx.gentle ? .52 : .98;
    const effect: Effect = {
        update(dt) {
            if (disposed) return false;
            elapsed += dt;
            if (elapsed >= life) return false;
            const progress = elapsed / life;
            const offset = easeOut(progress);
            mesh.position.set(start + direction * travel * offset, ctx.H - top, 0);
            mesh.rotation.y = direction * (.28 - .52 * progress);
            uniforms.uOpacity.value = strength * Math.min(1, progress / .16, (1 - progress) / .38);
            uniforms.uSweep.value = direction * (progress - .5) * .13;
            return true;
        },
        dispose() {
            if (disposed) return;
            disposed = true;
            if (active.get(scene) === effect) active.delete(scene);
            scene.remove(mesh);
            geometry.dispose();
            material.dispose();
        },
    };
    active.get(scene)?.dispose();
    active.set(scene, effect);
    return effect;
}

export async function loadGemFx(): Promise<FxModule> {
    const loadImage = async (src: string) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = src;
        await image.decode();
        return image;
    };
    const image = await loadImage(facetLustre.src);
    const polish = (ctx: FxContext, event: FxEvent) => reflection(image, ctx, event);
    return {
        effects: {
            "complete": polish,
            "saved": polish,
            "sticker": polish,
            "advance": polish,
            "project-done": polish,
            "drop": polish,
        },
    };
}
