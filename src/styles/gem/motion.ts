import { EASE_IN, gentleSwap, widgetSwap, type Ease, type MotionSet } from '@/styles/motion';

/** A cut crystal turns slightly into the light and settles without elastic bouncing. */
export const GEM_EASE: Ease = [.19, 1, .26, 1];
export const GEM_SWAP_MS = 520;

export const gemMotion: MotionSet = {
    swapIn: a => {
        if (a.widget) return widgetSwap(a);
        if (a.level === 'gentle') return gentleSwap(a);
        if (a.size === 'page') return {
            pose: { opacity: 0, [a.axis]: a.dir * 34, rotateY: a.axis === 'x' ? a.dir * 2.5 : 0, perspective: 1400, scale: .985 },
            duration: GEM_SWAP_MS, ease: GEM_EASE,
        };
        return { pose: { opacity: 0, [a.axis]: a.dir * (a.size === 'line' ? 7 : 14), scale: .993 }, duration: a.size === 'line' ? 270 : 360, ease: GEM_EASE };
    },
    swapOut: a => ({
        pose: a.widget || a.level === 'gentle' ? { opacity: 0 } : { opacity: 0, [a.axis]: -a.dir * (a.size === 'page' ? 24 : 9), scale: .99 },
        duration: a.widget || a.level === 'gentle' ? 110 : 230, ease: EASE_IN,
    }),
    itemIn: level => ({ pose: level === 'gentle' ? { opacity: 0 } : { opacity: 0, y: 7, scale: .985 }, duration: level === 'gentle' ? 160 : 330, ease: GEM_EASE }),
    itemOut: level => ({ pose: level === 'gentle' ? { opacity: 0 } : { opacity: 0, y: -4, scale: .98 }, duration: level === 'gentle' ? 130 : 210, ease: EASE_IN }),
    done: level => level === 'gentle' ? null : {
        mark: [{ transform: 'scale(.82)', filter: 'brightness(1)' }, { transform: 'scale(1.12)', filter: 'brightness(1.55)', offset: .38 }, { transform: 'none', filter: 'brightness(1)' }],
        row: [{ filter: 'brightness(1)' }, { filter: 'brightness(1.07)', offset: .35 }, { filter: 'brightness(1)' }],
        duration: 460, ease: GEM_EASE,
    },
    dialogOut: level => ({ pose: level === 'gentle' ? { opacity: 0 } : { opacity: 0, scale: .975, y: 5 }, duration: level === 'gentle' ? 120 : 190, ease: EASE_IN }),
};
