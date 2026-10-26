import type { InteractionMotion } from '../interactionMotion';

export const press: InteractionMotion = {
    frames: [{ scale: '1', translate: '0 0' }, { scale: '.975', translate: '0 2px', offset: .25 }, { scale: '1', translate: '0 0' }],
    duration: 280,
    easing: 'cubic-bezier(.22, .8, .3, 1)',
};
