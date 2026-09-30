import { NextRequest, NextResponse } from "next/server";

import { Asset, assetResponse, fetchAsset, fetchLatestRelease } from "@/lib/githubRelease";

type PlatformKey = "windows" | "macos" | "linux" | "android";

const MATCHERS: Record<PlatformKey, RegExp[]> = {
    windows: [/\.exe$/i, /\.msi$/i],
    macos: [/\.dmg$/i, /\.app\.tar\.gz$/i],
    linux: [/\.AppImage$/i, /\.deb$/i, /\.rpm$/i],
    android: [/\.apk$/i],
};

function pickAsset(assets: Asset[], platform: PlatformKey): Asset | null {
    for (const rule of MATCHERS[platform]) {
        const hit = assets.find(a => rule.test(a.name));
        if (hit) return hit;
    }
    return null;
}

export async function GET(req: NextRequest) {
    const platform = req.nextUrl.searchParams.get("platform") as PlatformKey | null;
    const checkOnly = req.nextUrl.searchParams.get("check") === "1";

    const fail = (reason: string, message: string, status: number) => {
        if (checkOnly) return NextResponse.json({ message }, { status });
        const back = new URL("/download", req.nextUrl.origin);
        back.searchParams.set("dl", reason);
        return NextResponse.redirect(back, 303);
    };

    if (!platform || !(platform in MATCHERS)) {
        return fail("platform", "지원하지 않는 플랫폼입니다.", 400);
    }

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
            return fail("unreleased", "아직 배포된 설치 파일이 없습니다.", 404);
        }

        const asset = pickAsset(assets, platform);

        if (!asset) {
            return fail("unreleased", "이 운영체제용 설치 파일이 아직 없습니다.", 404);
        }

        const upstream = await fetchAsset(asset);

        if (!upstream) {
            return fail("upstream", "파일을 가져오지 못했습니다.", 502);
        }

        return assetResponse(asset, upstream);
    } catch (error) {
        console.error("[DOWNLOAD_ERROR]", error);
        return fail("error", "다운로드 중 오류가 발생했습니다.", 500);
    }
}
