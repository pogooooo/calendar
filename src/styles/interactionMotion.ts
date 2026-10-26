/** Small control feedback. Individual scale/translate preserve the control's own transform. */
export interface InteractionMotion {
    frames: Keyframe[];
    duration: number;
    easing: string;
}
