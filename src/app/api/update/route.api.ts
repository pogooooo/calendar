import { NextRequest, NextResponse } from "next/server";

import { fetchUpdaterManifest } from "@/lib/githubRelease";

/**
 * 자동 업데이트가 읽는 자리 (`tauri.conf.json` 의 updater.endpoints).
 *
 * 릴리스의 latest.json 을 서버가 토큰으로 읽어, 파일 주소만 우리 쪽(`/api/download/<파일>`)으로
 * 바꿔 돌려준다. 앱은 GitHub 를 직접 부르지 않으므로 계정이 플래그돼 있어도 업데이트가 된다.
 * 서명은 그대로 넘긴다 — 검증은 앱이 제 공개키로 한다.
 *
 * 업데이트가 없으면 204 — 업데이터가 "새 판 없음" 으로 읽는 약속이다.
 */
export async function GET(req: NextRequest) {
    try {
        const manifest = await fetchUpdaterManifest();
        if (!manifest?.platforms) return new NextResponse(null, { status: 204 });

        const origin = req.nextUrl.origin;
        const platforms: Record<string, { signature: string; url: string }> = {};

        for (const [key, value] of Object.entries(manifest.platforms)) {
            const name = value.url.split("/").pop();
            if (!name) continue;
            platforms[key] = { signature: value.signature, url: `${origin}/api/download/${encodeURIComponent(name)}` };
        }

        return NextResponse.json({ ...manifest, platforms }, {
            headers: { "Cache-Control": "public, max-age=300" },
        });
    } catch (error) {
        console.error("[UPDATE_FEED_ERROR]", error);
        return new NextResponse(null, { status: 204 });
    }
}
