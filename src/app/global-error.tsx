"use client";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
    return (
        <html lang="ko">
        <body style={{ margin: 0, padding: 24, background: "#0b0e14", color: "#e6e6e6", fontFamily: "monospace" }}>
            <h2 style={{ color: "#D4AF37", fontWeight: 400, letterSpacing: 2 }}>오류가 발생했습니다</h2>
            <p style={{ fontSize: 13 }}>아래 내용을 개발자에게 전달해주세요.</p>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, lineHeight: 1.6, border: "1px solid #D4AF3755", padding: 16 }}>
                {error.message}
                {"\n\n"}
                {error.stack}
            </pre>
        </body>
        </html>
    );
}
