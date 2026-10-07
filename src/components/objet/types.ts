/**
 * 오브제를 만드는 쪽(갈래 폴더의 오브제 모듈)이 지키는 약속.
 *
 * 오브제 하나 = ObjetDef. 무대(stage.ts)가 칸마다 create() 로 장면을 하나 받고,
 * 보이는 동안 update() → 그리기를 되풀이한다. 갈래 이름은 모른다 — 색은 tone 만 본다.
 */
import type * as THREE_NS from "three";

export type Three = typeof THREE_NS;

/** 테마에서 가져온 색 (모두 #RRGGBB). 오브제는 이것만 보고 칠한다 */
export interface ObjetTone {
    dark: boolean;
    primary: string;
    accent: string;
    text: string;
    surface: string;
    background: string;
}

/** 손 — update 가 프레임마다 읽는다. 끈 만큼(dragX·dragY)은 읽고 나면 무대가 0 으로 되돌린다 */
export interface ObjetInput {
    /** 커서가 올라와 있거나 부른 쪽이 active 를 켰다 ('잔잔하게'·끄기면 늘 false) */
    hover: boolean;
    /** 칸 안의 커서 자리 -1~1 (오른쪽·아래가 +) */
    x: number;
    y: number;
    dragging: boolean;
    /** 지난 프레임 뒤로 끈 거리(CSS px) */
    dragX: number;
    dragY: number;
}

export interface ObjetContext {
    THREE: Three;
    tone: ObjetTone;
    /** 무대가 한 번 구워 둔 스튜디오 반사광(PMREM) — 금속이 비칠 거리. 오브제가 dispose 하지 않는다 */
    env: THREE_NS.Texture;
    /** 부른 쪽이 넘긴 값 (오브제마다 뜻이 다르다) */
    options: Readonly<Record<string, unknown>>;
    /** 손가락 기기(폰) — 쪼갬·입자를 줄인다 */
    lite: boolean;
}

export interface ObjetInstance {
    scene: THREE_NS.Scene;
    camera: THREE_NS.PerspectiveCamera | THREE_NS.OrthographicCamera;
    /**
     * dt 초만큼 움직인다('잔잔하게'면 무대가 dt 를 줄여 준다, 끄기면 0 으로 한 번).
     * 아직 움직일 것이 남았으면 true — 늘 천천히 도는 오브제는 늘 true, 멈춘 그림이면 false.
     */
    update(dt: number, input: ObjetInput): boolean;
    /** 칸 크기가 바뀌었다(CSS px). 없으면 무대가 PerspectiveCamera 의 aspect 만 맞춘다 */
    resize?(width: number, height: number): void;
    /** 밝은 벌·어두운 벌·색이 바뀌었다. 없으면 무대가 새로 만든다 */
    setTone?(tone: ObjetTone): void;
    /** 만든 geometry·material·texture 를 모두 돌려준다 (env 는 빼고) */
    dispose(): void;
}

export interface ObjetDef {
    create(ctx: ObjetContext): ObjetInstance;
    /**
     * 손을 어떻게 받나 — 'drag': 올리면 반응하고 끌어서 돌린다(가로로 끌면 돌고, 세로는 화면 스크롤로 남긴다),
     * 'hover': 올리기만, 'none': 받지 않는다(누르는 것도 뒤로 통과). 부른 쪽이 interaction 으로 덮을 수 있다.
     */
    interaction?: "drag" | "hover" | "none";
}

export type ObjetRegistry = Record<string, ObjetDef>;
