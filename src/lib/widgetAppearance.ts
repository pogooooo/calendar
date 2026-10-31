export type WidgetDesign = 'simple' | 'ornate';
export type WidgetEffect = 'inherit' | 'full' | 'gentle' | 'off';
export interface WidgetAppearance { design: WidgetDesign; intensity: number; effect: WidgetEffect }
export const DEFAULT_WIDGET_APPEARANCE: WidgetAppearance = {design:'ornate',intensity:1,effect:'inherit'};
export function normalizeWidgetAppearance(value?: Partial<WidgetAppearance> | null): WidgetAppearance {
    return {
        design:value?.design==='simple'?'simple':'ornate',
        intensity:typeof value?.intensity==='number'&&Number.isFinite(value.intensity)?Math.max(0,Math.min(1,value.intensity)):1,
        effect:['full','gentle','off'].includes(value?.effect??'')?value!.effect!:'inherit',
    };
}
export function resolveWidgetEffect(app:'full'|'gentle'|'off',widget:WidgetEffect):'full'|'gentle'|'off' {
    if(app==='off'||widget==='off')return 'off';
    if(widget==='inherit')return app;
    return app==='gentle'?'gentle':widget;
}
