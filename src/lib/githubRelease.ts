/**
 * GitHub 릴리스 읽기 — 내려받기와 자동 업데이트가 함께 쓴다.
 *
 * 계정이 플래그되면 저장소·릴리스·자산이 **익명에게는 404** 다 (저장소 페이지까지).
 * 그래서 서버(Worker)가 토큰으로 읽어 사용자에게 흘려보낸다. 사용자는 GitHub 를 직접 부르지 않는다.
 * 토큰(`GITHUB_TOKEN`, Worker 시크릿)이 없으면 예전처럼 익명으로 시도한다 — 로컬 개발용.
 */

export const REPO = process.env.GITHUB_REPO ?? "pogooooo/calendar";
const API = `https://api.github.com/repos/${REPO}`;
const UA = "cronos-download";

export type Asset = { id: number; name: string; browser_download_url: string; size: number };
export type Release = { tag_name?: string; body?: string; assets?: Asset[] };

/** 업데이터가 읽는 파일의 모양 (tauri-plugin-updater 의 static JSON) */
export type UpdaterManifest = {
    version: string;
    notes?: string;
    pub_date?: string;
    platforms?: Record<string, { signature: string; url: string }>;
};

const token = () => process.env.GITHUB_TOKEN;

const ghHeaders = (accept: string): Record<string, string> => {
    const h: Record<string, string> = { Accept: accept, "User-Agent": UA };
    const t = token();
    if (t) h.Authorization = `Bearer ${t}`;
    return h;
};

export async function fetchLatestRelease(): Promise<Release | null> {
    const res = await fetch(`${API}/releases/latest`, {
        headers: ghHeaders("application/vnd.github+json"),
        cf: { cacheTtl: 600, cacheEverything: true },
    } as RequestInit);
    if (!res.ok) return null;
    return await res.json() as Release;
}

export const findAsset = (release: Release | null, name: string): Asset | null =>
    release?.assets?.find((a) => a.name === name) ?? null;

/**
 * 자산 하나를 받아 온다.
 *
 * 토큰이 있으면 API 로 받는다 — 플래그된 저장소도 열린다. 이때 GitHub 는 서명된 S3 주소로 302 를 준다.
 * 그 주소에 Authorization 을 같이 보내면 "Only one auth mechanism allowed" 로 400 이 나므로,
 * 리디렉트를 손수 따라가며 토큰을 뗀다.
 */
export async function fetchAsset(asset: Asset): Promise<Response | null> {
    const t = token();
    if (!t) {
        const res = await fetch(asset.browser_download_url, { headers: { "User-Agent": UA }, redirect: "follow" });
        return res.ok && res.body ? res : null;
    }

    const first = await fetch(`${API}/releases/assets/${asset.id}`, {
        headers: ghHeaders("application/octet-stream"),
        redirect: "manual",
    });

    if (first.status >= 300 && first.status < 400) {
        const location = first.headers.get("location");
        if (!location) return null;
        const res = await fetch(location, { headers: { "User-Agent": UA }, redirect: "follow" });
        return res.ok && res.body ? res : null;
    }

    return first.ok && first.body ? first : null;
}

/** 릴리스에 올라 있는 latest.json (업데이터가 읽는 파일) */
export async function fetchUpdaterManifest(): Promise<UpdaterManifest | null> {
    const release = await fetchLatestRelease();
    const asset = findAsset(release, "latest.json");
    if (!asset) return null;
    const res = await fetchAsset(asset);
    if (!res) return null;
    try {
        return await res.json() as UpdaterManifest;
    } catch {
        return null;
    }
}

/** 자산을 그대로 흘려보내는 응답 */
export function assetResponse(asset: Asset, upstream: Response): Response {
    const headers = new Headers({
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${asset.name}"`,
        "Cache-Control": "public, max-age=3600",
    });
    const length = upstream.headers.get("content-length");
    if (length) headers.set("Content-Length", length);
    return new Response(upstream.body, { headers });
}
