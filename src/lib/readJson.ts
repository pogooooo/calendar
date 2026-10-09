import { NextResponse } from "next/server";

/**
 * 요청 몸통을 JSON 으로 읽는다. 읽지 못하면 undefined — 예전엔 JSON.parse 가 던져 "서버 오류"(500)로 떨어졌다.
 * (올바른 JSON 은 undefined 가 될 수 없으므로 실패와 섞이지 않는다)
 */
export async function readJson(request: Request): ReturnType<Request["json"]> {
    try {
        return await request.json();
    } catch {
        return undefined;
    }
}

/** 몸통이 JSON 이 아닐 때의 응답 */
export const badJson = () => NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
