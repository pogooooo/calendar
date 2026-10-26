import type { InteractionMotion } from '../interactionMotion';

export const press: InteractionMotion = {
    frames: [{ scale: '1', filter: 'brightness(1)' }, { scale: '.96', filter: 'brightness(1.15)', offset: .3 }, { scale: '1', filter: 'brightness(1)' }],
    duration: 300,
    easing: 'cubic-bezier(.16, 1, .3, 1)',
};
