/** 서버가 준 message 를 꺼낸다. 없으면 기본 문구를 쓴다. */
export async function readError(res: Response, fallback: string): Promise<string> {
    try {
        const data = await res.json();
        if (data && typeof data.message === "string" && data.message.trim()) {
            return data.message;
        }
    } catch {}
    return fallback;
}
