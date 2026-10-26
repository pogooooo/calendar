import type { InteractionMotion } from '../interactionMotion';

export const press: InteractionMotion = {
    frames: [{ scale: '1' }, { scale: '.94', offset: .22 }, { scale: '1.025', offset: .58 }, { scale: '1' }],
    duration: 400,
    easing: 'cubic-bezier(.2, .7, .3, 1)',
};
