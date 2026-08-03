import { NextRequest, NextResponse } from "next/server";

const REPO = "pogooooo/calendar";
const RELEASE_API = `https://api.github.com/repos/${REPO}/releases/latest`;

type PlatformKey = "windows" | "macos" | "linux";

// 릴리스 자산 이름에서 플랫폼을 골라내는 규칙. 앞쪽 확장자를 우선한다.
const MATCHERS: Record<PlatformKey, RegExp[]> = {
    windows: [/\.exe$/i, /\.msi$/i],
    macos: [/\.dmg$/i, /\.app\.tar\.gz$/i],
    linux: [/\.AppImage$/i, /\.deb$/i, /\.rpm$/i],
};

type Asset = { name: string; browser_download_url: string; size: number };

async function fetchLatestAssets(): Promise<Asset[] | null> {
    const res = await fetch(RELEASE_API, {
        headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "cronos-download",
        },
        // 릴리스 정보는 10분간 캐시해 GitHub API 호출을 아낀다.
        cf: { cacheTtl: 600, cacheEverything: true },
    } as RequestInit);

    if (!res.ok) return null;
    const data = await res.json() as { assets?: Asset[] };
    return data.assets ?? [];
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

    // check=1 이면 파일을 흘려보내지 않고 있는지만 알려준다.
    const checkOnly = req.nextUrl.searchParams.get("check") === "1";

    try {
        const assets = await fetchLatestAssets();

        if (checkOnly) {
            const asset = assets ? pickAsset(assets, platform) : null;
            return NextResponse.json({
                available: Boolean(asset),
                name: asset?.name ?? null,
                size: asset?.size ?? null,
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

        // 사용자를 깃허브로 보내지 않고 이 도메인에서 그대로 내려준다.
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
