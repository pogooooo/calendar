/** RGB persistence, readability and native-widget handoff. No network or user storage is used. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function sourceModule(relative, overrides = {}, cache = new Map()) {
    const filename = path.resolve(relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const loaded = { exports: {} };
    cache.set(filename, loaded);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText;
    const localRequire = id => {
        if (id in overrides) return overrides[id];
        if (id.startsWith('@/') || id.startsWith('.')) {
            const base = id.startsWith('@/') ? path.resolve('src', id.slice(2)) : path.resolve(path.dirname(filename), id);
            const resolved = [base, `${base}.ts`, `${base}.tsx`].find(file => fs.existsSync(file) && fs.statSync(file).isFile());
            if (resolved) return sourceModule(resolved, overrides, cache);
        }
        return require(id);
    };
    new Function('require', 'module', 'exports', code)(localRequire, loaded, loaded.exports);
    return loaded.exports;
}

const palette = sourceModule('src/styles/gem/palette.ts');
const { normalizeGemColor, DEFAULT_GEM_COLOR, hexToRgb, rgbToHex, applyGemColor, gemWidgetColors, gemContrastRatio } = palette;
assert.equal(normalizeGemColor(' #aabbcc '), '#AABBCC');
for (const bad of [null, undefined, '#FFF', '#12345678', 'red', 'rgb(1,2,3)', 42, {}]) {
    assert.equal(normalizeGemColor(bad), DEFAULT_GEM_COLOR);
}
assert.equal(rgbToHex({ r: -15, g: 256.7, b: 12.6 }), '#00FF0D');
assert.equal(rgbToHex({ r: NaN, g: Infinity, b: -Infinity }), '#000000');
const colors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#9268C4', '#D989A4', '#57AFC5'];
for (let r = 0; r <= 255; r += 51) for (let g = 0; g <= 255; g += 51) for (let b = 0; b <= 255; b += 51) colors.push(rgbToHex({ r, g, b }));

const { themes, listThemes } = sourceModule('src/styles/theme.ts');
const { inkOnFill } = sourceModule('src/styles/color.ts');
assert.deepEqual(listThemes().find(theme => theme.id === 'gem').options, ['light', 'dark']);
for (const mode of ['light', 'dark']) for (const color of colors) {
    const base = themes[mode === 'dark' ? 'gem-dark' : 'gem'];
    const theme = applyGemColor(base, color);
    assert.equal(theme.gemColor, color, 'Stone color must remain the exact user RGB.');
    assert.equal(base.gemColor, DEFAULT_GEM_COLOR, 'Changing color must not mutate a base theme.');
    for (const surface of [theme.colors.background, theme.colors.surface]) {
        for (const ink of [theme.colors.primary, theme.colors.text, theme.colors.textSecondary, theme.colors.error, theme.colors.success]) {
            assert.ok(gemContrastRatio(ink, surface) >= 4.5, `${mode} ${color}: ${ink} on ${surface}`);
        }
    }
    for (const fill of [theme.colors.primary, theme.colors.error, theme.colors.success]) {
        assert.ok(gemContrastRatio(inkOnFill(fill), fill) >= 4.5, `${mode} ${color}: button text on ${fill}`);
    }
    assert.equal(rgbToHex(hexToRgb(color)), color);
}
assert.equal(applyGemColor(themes.ocean, '#FF0000'), themes.ocean, 'Other themes keep their original palette.');

// App brightness and desktop backdrop brightness are independent. Check controls,
// labels and status colors across black, white, mid-gray and saturated widget backgrounds.
const widgetBackgrounds = ['#000000', '#FFFFFF', '#1A160E', '#555555', '#757575', '#777777', '#999999', '#FF0000', '#00FF00', '#0000FF'];
const widgetInkKeys = ['primary', 'accent', 'text', 'textSecondary', 'success', 'error', 'weekend'];
const strongWidgetInkKeys = ['primary', 'accent', 'text', 'success', 'error', 'weekend'];
for (const mode of ['gem', 'gem-dark']) for (const color of colors) {
    const theme = applyGemColor(themes[mode], color);
    for (const background of widgetBackgrounds) {
        const widgetColors = gemWidgetColors(theme, background);
        assert.equal(widgetColors.border, theme.colors.border, 'Decorative separators retain their subtle original color.');
        for (const key of widgetInkKeys) {
            assert.ok(gemContrastRatio(widgetColors[key], background) >= 4.5, `${mode} ${color}: widget ${key} on ${background}`);
        }
        const availableContrast = Math.max(gemContrastRatio('#000000', background), gemContrastRatio('#FFFFFF', background));
        if (availableContrast >= 5.5) for (const key of strongWidgetInkKeys) {
            assert.ok(gemContrastRatio(widgetColors[key], background) >= 5.5, `${mode} ${color}: compact widget ${key} needs contrast headroom on ${background}`);
        }
        if (background === '#1A160E' || background === '#FFFFFF') {
            assert.ok(gemContrastRatio(widgetColors.text, background) >= 12, 'Body text starts with a clear light/dark ink, not a minimum-contrast gray.');
        }
    }
    assert.equal(theme.gemColor, color, 'Widget contrast must preserve the decorative stone RGB.');
    for (const sampledLuminance of [0, .03, .1, .178, .179, .18, .3, .5, 1]) {
        const widgetColors = gemWidgetColors(theme, '#FFFFFF', sampledLuminance);
        for (const key of widgetInkKeys) {
            // contrast against black gives the foreground luminance, without duplicating the color conversion.
            const foregroundLuminance = (gemContrastRatio(widgetColors[key], '#000000') - 1) * .05;
            const contrast = (Math.max(foregroundLuminance, sampledLuminance) + .05) / (Math.min(foregroundLuminance, sampledLuminance) + .05);
            assert.ok(contrast >= 4.5, `${mode} ${color}: sampled widget ${key} at luminance ${sampledLuminance}`);
            const availableContrast = Math.max((sampledLuminance + .05) / .05, 1.05 / (sampledLuminance + .05));
            if (availableContrast >= 5.5 && strongWidgetInkKeys.includes(key)) {
                assert.ok(contrast >= 5.5, `${mode} ${color}: sampled compact widget ${key} needs contrast headroom`);
            }
        }
    }
}
assert.equal(gemWidgetColors(themes.ocean, '#FFFFFF'), themes.ocean.colors, 'Widget contrast does not change other themes.');

// A real Zustand persist store backed by an isolated in-memory Storage object.
const savedStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const storage = new Map();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
} });
const storeMocks = {
    '@/styles/gem/palette': palette,
    '@/lib/fetchOnce': { coalesce: async (_key, _ttl, callback) => callback(), READ_TTL: 0 },
    '@/lib/saveError': { reportSaveFailure() {} },
    '@/lib/timezone': { DEFAULT_TIMEZONE: 'Asia/Seoul', detectTimeZone: () => 'Asia/Seoul', isValidTimeZone: () => true },
};
try {
    let store = sourceModule('src/store/useSettingStore.ts', storeMocks).default;
    assert.equal(store.getState().gemColor, DEFAULT_GEM_COLOR);
    store.getState().setGemColor('#123abc');
    assert.equal(JSON.parse(storage.get('setting-store')).state.gemColor, '#123ABC');
    store = sourceModule('src/store/useSettingStore.ts', storeMocks).default;
    assert.equal(store.getState().gemColor, '#123ABC', 'RGB survives reopening the store.');
    storage.set('setting-store', JSON.stringify({ state: { theme: 'gem', themeOptions: { gem: 'dark' }, gemColor: 'broken' }, version: 0 }));
    await store.persist.rehydrate();
    assert.equal(store.getState().gemColor, DEFAULT_GEM_COLOR);
    assert.equal(store.getState().theme, 'gem');
    assert.equal(store.getState().themeOptions.gem, 'dark');
    store.getState().setGemColor('#57afc5');
    assert.equal(store.getState().gemColor, '#57AFC5');
    store.getState().setGemColor('invalid');
    assert.equal(store.getState().gemColor, DEFAULT_GEM_COLOR);
} finally {
    if (savedStorage) Object.defineProperty(globalThis, 'localStorage', savedStorage);
    else delete globalThis.localStorage;
}

const policySource = ts.transpileModule(fs.readFileSync('src/styles/themeAvailability.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
function themePolicy(mode) {
    const module = { exports: {} };
    new Function('module', 'exports', 'process', policySource)(module, module.exports, { env: { NODE_ENV: mode } });
    return module.exports;
}
for (const mode of ['development', 'production']) {
    const policy = themePolicy(mode);
    const catalog = sourceModule('src/styles/theme.ts', { './themeAvailability': policy }).listThemes();
    assert.equal(catalog.some(theme => theme.id === 'gem'), mode === 'development');
    assert.equal(policy.availableThemeName('gem'), mode === 'development' ? 'gem' : 'celestial');
    assert.equal(policy.availableThemeName('gem-dark'), mode === 'development' ? 'gem-dark' : 'celestial-dark');
    assert.equal(policy.availableThemeName('ocean-dark'), 'ocean-dark');
}
const prepaintTemplate = fs.readFileSync('src/app/layout.tsx', 'utf8').match(/const PRE_PAINT = `([\s\S]*?)`;/)?.[1];
const prepaint = prepaintTemplate?.replace('${DEVELOPMENT_THEMES_ENABLED}', 'true');
assert.ok(prepaint, 'Pre-paint background script is present.');
for (const mode of ['light', 'dark']) for (const color of ['#000000', '#FFFFFF', '#57AFC5', DEFAULT_GEM_COLOR]) {
    const root = { style: {}, setAttribute() {} };
    vm.runInNewContext(prepaint, {
        location: { pathname: '/' }, document: { documentElement: root }, window: {},
        localStorage: { getItem: () => JSON.stringify({ state: { theme: 'gem', themeOptions: { gem: mode }, gemColor: color } }) },
    });
    assert.equal(root.style.backgroundColor.toUpperCase(), applyGemColor(themes[mode === 'dark' ? 'gem-dark' : 'gem'], color).colors.background);
}

for (const mode of ['light', 'dark']) {
    const root = { style: {}, setAttribute() {} };
    vm.runInNewContext(prepaintTemplate.replace('${DEVELOPMENT_THEMES_ENABLED}', 'false'), {
        location: { pathname: '/' }, document: { documentElement: root }, window: {},
        localStorage: { getItem: () => JSON.stringify({ state: { theme: 'gem', themeOptions: { gem: mode } } }) },
    });
    assert.equal(root.style.backgroundColor, themes[mode === 'dark' ? 'celestial-dark' : 'celestial'].colors.background);
}

const snapshotMocks = { '@/store/useSettingStore': { default: { getState: () => ({ timezone: 'Asia/Seoul' }) } } };
const { buildWidgetSnapshot } = sourceModule('src/lib/widgetSnapshot.ts', snapshotMocks);
const translations = sourceModule('src/i18n/ko.ts').default;
const makeSnapshot = theme => buildWidgetSnapshot({
    todos: [], categories: [], challenges: [], anniversaries: [], projects: [], memo: '',
    t: translations, locale: 'ko', theme, now: new Date('2026-10-26T12:00:00+09:00'),
});
const custom = applyGemColor(themes['gem-dark'], '#57AFC5');
const snapshot = makeSnapshot(custom);
assert.equal(snapshot.theme.family, 'gem');
assert.equal(snapshot.theme.gemColor, '#57AFC5');
assert.deepEqual(snapshot.theme.colors, custom.colors);
assert.equal('gemColor' in makeSnapshot(themes.celestial).theme, false);
console.log(`Gem checks passed: ${colors.length * 2} RGB palettes, widget contrast ≥4.5 (compact controls ≥5.5 where possible), 10 backdrops and 9 wallpaper luminances, local persistence/recovery, pre-paint and Android snapshot.`);
