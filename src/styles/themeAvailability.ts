/** Preview builds can select Gem without advertising it in the public theme picker. */
export const GEM_THEME_AVAILABLE = process.env.NODE_ENV === "development"
    || process.env.NEXT_PUBLIC_CRONOS_GEM_PREVIEW === "1";

export const isGemTheme = (name: string): boolean => name === "gem" || name.startsWith("gem-");

export function availableThemeName(name: string): string {
    if (!isGemTheme(name)) return name;
    if (name === "gem-dark") return GEM_THEME_AVAILABLE ? name : "celestial-dark";
    return GEM_THEME_AVAILABLE ? "gem" : "celestial";
}
