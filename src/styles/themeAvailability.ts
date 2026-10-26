/** Unfinished themes remain available locally while released builds use the public catalog. */
export const DEVELOPMENT_THEMES_ENABLED = process.env.NODE_ENV !== 'production';

export function isThemeAvailable(name: string): boolean {
    return DEVELOPMENT_THEMES_ENABLED || (name !== 'gem' && !name.startsWith('gem-'));
}

/** Keep saved development preferences intact, including their light/dark variant. */
export function availableThemeName(name: string): string {
    if (isThemeAvailable(name)) return name;
    return name === 'gem-dark' ? 'celestial-dark' : 'celestial';
}
