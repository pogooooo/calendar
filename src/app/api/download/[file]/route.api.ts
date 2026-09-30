import { NextRequest, NextResponse } from "next/server";

import { assetResponse, fetchAsset, fetchLatestRelease, findAsset } from "@/lib/githubRelease";

/**
 * 릴리스 자산 하나를 이름으로 내려준다: `/api/download/CRONOS_1.1.0_x64-setup.exe`
 *
 * 자동 업데이트가 이 주소를 쓴다 (`/api/update` 가 여기로 가리킨다).
 * 끝이 진짜 파일 이름이어야 한다 — 업데이터가 확장자로 설치 방법을 고른다.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ file: string }> }) {
    const { file } = await ctx.params;
    const name = decodeURIComponent(file);

    try {
        const release = await fetchLatestRelease();
        const asset = findAsset(release, name);
        if (!asset) return NextResponse.json({ message: "그런 파일이 없습니다." }, { status: 404 });

        const upstream = await fetchAsset(asset);
        if (!upstream) return NextResponse.json({ message: "파일을 가져오지 못했습니다." }, { status: 502 });

        return assetResponse(asset, upstream);
    } catch (error) {
        console.error("[DOWNLOAD_ASSET_ERROR]", error);
        return NextResponse.json({ message: "내려받는 중 오류가 발생했습니다." }, { status: 500 });
    }
}
