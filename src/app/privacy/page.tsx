import type { Metadata } from "next";

/**
 * 개인정보처리방침 — 구글 플레이가 요구하는 공개 주소(https://…/privacy).
 *
 * 갈래(테마)를 타지 않는 공개 문서라 styled-components 없이 소박한 HTML 로 둔다.
 * 내용은 prisma/schema.prisma 에 실제로 저장되는 것만 적는다 — 없는 것을 적으면 거짓이 된다.
 */

/** 문의처. 비우면 문의 줄이 나오지 않는다. */
const CONTACT_EMAIL = "cronos.support@gmail.com";

export const metadata: Metadata = {
    title: "개인정보처리방침 · CRONOS",
    description: "CRONOS 가 모으는 정보와 쓰임, 보관과 삭제에 대한 안내",
};

const UPDATED = "2026-09-30";

export default function PrivacyPage() {
    return (
        <main className="doc">
            <style>{CSS}</style>

            <h1>개인정보처리방침</h1>
            <p className="meta">최종 수정일 {UPDATED} · CRONOS (com.cronos.todoapp)</p>

            <h2>1. 모으는 정보</h2>
            <ul>
                <li><b>계정</b> — 이름, 이메일 주소, 비밀번호(되돌릴 수 없는 형태로 저장), 프로필 사진(올린 경우).
                    구글 계정으로 로그인하면 구글이 알려 주는 계정 식별자·이름·이메일을 같은 자리에 둡니다.</li>
                <li><b>사용자가 적은 것</b> — 카테고리, 할 일(제목·메모·시간·장소·반복), 완료 기록, 하루 할 일과 메모,
                    기념일(월·일·아이콘), 프로젝트와 작업, 챌린지와 달성 기록.</li>
                <li><b>설정</b> — 고른 테마, 위젯 배치 같은 앱 설정.</li>
                <li><b>로그인 유지</b> — 다시 로그인하지 않아도 되도록 기기에 토큰을 둡니다.</li>
            </ul>
            <p>광고 식별자, 위치, 연락처, 사진첩, 통화 기록, 기기 식별자는 모으지 않습니다.
                앱에는 광고도, 이용자 행동을 추적하는 분석 도구도 들어 있지 않습니다.
                안드로이드 앱이 요구하는 권한은 인터넷 연결 하나뿐입니다.</p>

            <h2>1-1. 함께 쓰기</h2>
            <p>카테고리를 다른 사람과 함께 쓰거나 프로젝트 작업을 맡기면, 그 사람들에게 <b>이름과 이메일 주소</b>가 보이고
                함께 쓰는 카테고리에 적은 내용도 보입니다. 초대는 이메일 주소로만 이루어지며, 초대한 사람은 참여자를 다시 내보낼 수 있습니다.</p>

            <h2>2. 쓰는 곳</h2>
            <p>모은 정보는 오직 서비스를 제공하기 위해 씁니다 — 계정 확인과 로그인 유지, 적어 둔 일정·할 일을 기기 사이에서 맞추기,
                비밀번호 재설정 메일 보내기. 다른 목적으로 쓰지 않으며, 팔거나 광고에 쓰지 않습니다.</p>

            <h2>3. 맡기는 곳</h2>
            <ul>
                <li><b>Cloudflare</b> — 서버와 데이터베이스를 여기에 둡니다(저장·전송).</li>
                <li><b>메일 발송 서비스</b> — 비밀번호 재설정·가입 확인 메일을 보낼 때 이메일 주소가 전달됩니다.</li>
                <li><b>Google</b> — 구글 계정으로 로그인할 때에 한해 구글과 인증 정보를 주고받습니다.</li>
            </ul>
            <p>그 밖의 제3자에게 제공하지 않습니다. 법이 요구하는 경우에만 예외입니다.</p>

            <h2 id="delete">4. 얼마나 두는가 · 계정과 자료를 지우는 법</h2>
            <p>계정이 살아 있는 동안 보관하고, 계정을 지우면 적어 둔 것까지 함께 지웁니다.
                앱의 <b>설정 &gt; 계정 &gt; 회원 탈퇴</b> 에서 바로 지울 수 있고, 지운 자료는 되돌릴 수 없습니다.
                로그인 유지 토큰은 30일 동안 접속이 없으면 스스로 만료됩니다.</p>

            <h2>5. 안전하게 지키는 방법</h2>
            <p>모든 통신은 HTTPS 로 암호화합니다. 비밀번호는 되돌릴 수 없는 형태(해시)로만 저장하며 원문을 알 수 없습니다.
                자료는 계정마다 나뉘어 있어 다른 사람의 것을 볼 수 없습니다.</p>

            <h2>6. 어린이</h2>
            <p>이 앱은 어린이를 겨냥해 만들지 않았으며, 만 14세 미만의 정보를 일부러 모으지 않습니다.</p>

            <h2>7. 바뀔 때</h2>
            <p>방침이 바뀌면 이 페이지의 최종 수정일을 고치고, 중요한 변경은 앱 안에서 알립니다.</p>

            {CONTACT_EMAIL && (
                <>
                    <h2>8. 문의</h2>
                    <p><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
                </>
            )}

            <hr />

            <h1 id="en">Privacy Policy</h1>
            <p className="meta">Last updated {UPDATED} · CRONOS (com.cronos.todoapp)</p>

            <h2>1. What we collect</h2>
            <ul>
                <li><b>Account</b> — name, email address, password (stored only as a one-way hash), profile picture if you upload one.
                    If you sign in with Google, we store the account identifier, name and email Google gives us.</li>
                <li><b>What you write</b> — categories, to-dos (title, memo, time, place, repeat), completion records, daily tasks and memos,
                    anniversaries (month, day, icon), projects and tasks, challenges and their completions.</li>
                <li><b>Settings</b> — the theme you chose and other app preferences.</li>
                <li><b>Staying signed in</b> — a token kept on your device so you do not have to sign in again.</li>
            </ul>
            <p>We do not collect advertising identifiers, location, contacts, photos, call logs or device identifiers.
                The app contains no ads and no behavioural analytics. The Android app requests a single permission: internet access.</p>

            <h2>1-1. Sharing</h2>
            <p>If you share a category with someone or assign them a project task, they can see your <b>name and email address</b>
                and everything written in the shared category. Invitations are made by email address, and the owner can remove a participant at any time.</p>

            <h2>2. How we use it</h2>
            <p>Only to run the service — verifying your account and keeping you signed in, syncing what you wrote across your devices,
                and sending password-reset email. We never sell your data or use it for advertising.</p>

            <h2>3. Processors</h2>
            <ul>
                <li><b>Cloudflare</b> — hosting and database.</li>
                <li><b>Email delivery provider</b> — receives your email address when we send password-reset or verification mail.</li>
                <li><b>Google</b> — only when you choose to sign in with a Google account.</li>
            </ul>
            <p>We share your data with no one else, except where the law requires it.</p>

            <h2 id="delete-en">4. Retention and account deletion</h2>
            <p>We keep your data while your account exists. Deleting your account deletes everything you wrote with it.
                You can do this yourself in <b>Settings &gt; Account &gt; Delete account</b>; deleted data cannot be restored.
                Sign-in tokens expire by themselves after 30 days without use.</p>

            <h2>5. Security</h2>
            <p>All traffic is encrypted with HTTPS. Passwords are stored only as one-way hashes. Data is separated per account.</p>

            <h2>6. Children</h2>
            <p>This app is not directed at children and we do not knowingly collect data from children under 14.</p>

            <h2>7. Changes</h2>
            <p>If this policy changes we update the date at the top of this page, and announce significant changes inside the app.</p>

            {CONTACT_EMAIL && (
                <>
                    <h2>8. Contact</h2>
                    <p><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
                </>
            )}
        </main>
    );
}

const CSS = `
.doc {
    max-width: 720px;
    margin: 0 auto;
    padding: 56px 22px 96px;
    color: #232323;
    background: #ffffff;
    font-family: system-ui, -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
    line-height: 1.75;
    font-size: 16px;
}
.doc h1 { font-size: 1.7rem; margin: 0 0 6px; letter-spacing: -0.01em; }
.doc h2 { font-size: 1.06rem; margin: 34px 0 8px; }
.doc p, .doc li { color: #3c3c3c; }
.doc ul { padding-left: 20px; }
.doc li { margin: 6px 0; }
.doc .meta { color: #767676; font-size: 0.9rem; margin: 0 0 8px; }
.doc hr { margin: 56px 0 40px; border: none; border-top: 1px solid #e3e3e3; }
.doc a { color: #1a5fb4; }
@media (prefers-color-scheme: dark) {
    .doc { color: #e9e9e9; background: #121212; }
    .doc p, .doc li { color: #cfcfcf; }
    .doc .meta { color: #9a9a9a; }
    .doc hr { border-top-color: #2e2e2e; }
    .doc a { color: #8ab4f8; }
}
`;
