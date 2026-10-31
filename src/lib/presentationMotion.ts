export type MotionLevel='full'|'gentle'|'off';

/** Rich decoration is a platform policy, not an animation preference. */
export function resolveThemeMotion(requested:MotionLevel,mobileApp:boolean,osReduced:boolean,overrideOs:boolean):MotionLevel {
    if(osReduced&&!overrideOs)return 'off';
    return mobileApp&&requested==='full'?'gentle':requested;
}
