import { NextRequest, NextResponse } from "next/server";

const REPO = "pogooooo/calendar";
const RELEASE_API = `https://api.github.com/repos/${REPO}/releases/latest`;

type PlatformKey = "windows" | "macos" | "linux";

const MATCHERS: Record<PlatformKey, RegExp[]> = {
    windows: [/\.exe$/i, /\.msi$/i],
    macos: [/\.dmg$/i, /\.app\.tar\.gz$/i],
    linux: [/\.AppImage$/i, /\.deb$/i, /\.rpm$/i],
};

type Asset = { name: string; browser_download_url: string; size: number };
type Release = { tag_name?: string; assets?: Asset[] };

async function fetchLatestRelease(): Promise<Release | null> {
    const res = await fetch(RELEASE_API, {
        headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "cronos-download",
        },
        cf: { cacheTtl: 600, cacheEverything: true },
    } as RequestInit);

    if (!res.ok) return null;
    return await res.json() as Release;
}

function pickAsset(assets: Asset[], platform: PlatformKey): Asset | null {
    for (const rule of MATCHERS[platform]) {
        const hit = assets.find(a => rule.test(a.name));
        if (hit) return hit;
    }
    return null;
}

export async function GET(req: NextRequest) {
    const platform = req.nextUrl.searchParams.get("platform") as PlatformKey | null;

    if (!platform || !(platform in MATCHERS)) {
        return NextResponse.json({ message: "지원하지 않는 플랫폼입니다." }, { status: 400 });
    }

    const checkOnly = req.nextUrl.searchParams.get("check") === "1";

    try {
        const release = await fetchLatestRelease();
        const assets = release?.assets;

        if (checkOnly) {
            const asset = assets ? pickAsset(assets, platform) : null;
            return NextResponse.json({
                available: Boolean(asset),
                name: asset?.name ?? null,
                size: asset?.size ?? null,
                version: release?.tag_name?.replace(/^v/, "") ?? null,
            });
        }

        if (!assets) {
            return NextResponse.json(
                { message: "아직 배포된 설치 파일이 없습니다.", status: "unreleased" },
                { status: 404 },
            );
        }

        const asset = pickAsset(assets, platform);

        if (!asset) {
            return NextResponse.json(
                { message: "이 운영체제용 설치 파일이 아직 없습니다.", status: "unreleased" },
                { status: 404 },
            );
        }

        const file = await fetch(asset.browser_download_url, {
            headers: { "User-Agent": "cronos-download" },
            redirect: "follow",
        });

        if (!file.ok || !file.body) {
            return NextResponse.json({ message: "파일을 가져오지 못했습니다." }, { status: 502 });
        }

        return new NextResponse(file.body, {
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `attachment; filename="${asset.name}"`,
                "Content-Length": String(asset.size),
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (error) {
        console.error("[DOWNLOAD_ERROR]", error);
        return NextResponse.json({ message: "다운로드 중 오류가 발생했습니다." }, { status: 500 });
    }
}
