import { NextRequest, NextResponse } from "next/server";

import { Asset, assetResponse, fetchAsset, findInReleases } from "@/lib/githubRelease";

type PlatformKey = "windows" | "macos" | "linux" | "android";

const MATCHERS: Record<PlatformKey, RegExp[]> = {
    windows: [/\.exe$/i, /\.msi$/i],
    macos: [/\.dmg$/i, /\.app\.tar\.gz$/i],
    linux: [/\.AppImage$/i, /\.deb$/i, /\.rpm$/i],
    android: [/\.apk$/i],
};

/** 그 운영체제의 설치 파일이 있는 가장 최신 릴리스. 판이 어긋나도 (윈도우만 새 판이어도) 끊기지 않는다 */
async function pick(platform: PlatformKey) {
    for (const rule of MATCHERS[platform]) {
        const hit = await findInReleases((a: Asset) => rule.test(a.name));
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
        const hit = await pick(platform);

        if (checkOnly) {
            return NextResponse.json({
                available: Boolean(hit),
                name: hit?.asset.name ?? null,
                size: hit?.asset.size ?? null,
                version: hit?.release.tag_name?.replace(/^v/, "") ?? null,
            });
        }

        if (!hit) {
            return fail("unreleased", "이 운영체제용 설치 파일이 아직 없습니다.", 404);
        }

        const upstream = await fetchAsset(hit.asset);

        if (!upstream) {
            return fail("upstream", "파일을 가져오지 못했습니다.", 502);
        }

        return assetResponse(hit.asset, upstream);
    } catch (error) {
        console.error("[DOWNLOAD_ERROR]", error);
        return fail("error", "다운로드 중 오류가 발생했습니다.", 500);
    }
}
