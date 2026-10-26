import type { InteractionMotion } from '../interactionMotion';

export const gemInteractions: InteractionMotion = {
    frames: [
        { scale: '1', filter: 'brightness(1)' },
        { scale: '.97', filter: 'brightness(1.17)', offset: .24 },
        { scale: '1.005', filter: 'brightness(1.06)', offset: .65 },
        { scale: '1', filter: 'brightness(1)' },
    ],
    duration: 380,
    easing: 'cubic-bezier(.2, .8, .24, 1)',
};

export const press = gemInteractions;
