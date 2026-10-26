/** Run against a running local Next server: npm run check:ssr-styles -- http://localhost:3000 */
import assert from "node:assert/strict";

const base = new URL(process.argv[2] ?? "http://localhost:3000");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Use a local test server");

for (const route of ["/download", "/signIn", "/calendar"]) {
    const response = await fetch(new URL(route, base), { signal: AbortSignal.timeout(30_000) });
    assert.equal(response.status, 200, `${route}: page response`);
    const html = await response.text();
    const css = Array.from(html.matchAll(/<style\b[^>]*\bdata-styled=[^>]*>([\s\S]*?)<\/style>/g), match => match[1]).join("\n");
    const skyTag = html.match(/<div\b[^>]*\bdata-ambient="celestial"[^>]*>/)?.[0];
    assert.ok(skyTag, `${route}: initial Celestial background is server rendered`);
    const classes = skyTag.match(/\bclass="([^"]+)"/)?.[1].split(/\s+/);
    assert.ok(classes?.length, `${route}: background has generated classes`);
    for (const className of classes) {
        assert.ok(css.includes(className), `${route}: missing server CSS for ${className}; registry must wrap the theme provider`);
    }
    console.log(`${route}: server CSS includes the background classes`);
}
