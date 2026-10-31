import type { Metadata } from "next";
import BackLink from "./BackLink";

/**
 * 개인정보처리방침 — 구글 플레이가 요구하는 공개 주소(https://…/privacy)이자 개인정보보호법 제30조의 처리방침.
 * 가입·로그인·설정·내려받기 화면에서 링크한다(쉽게 확인할 수 있게 — 시행령 제31조).
 *
 * 갈래(테마)를 타지 않는 공개 문서라 styled-components 없이 소박한 HTML 로 둔다.
 * 내용은 실제로 하는 것만 적는다 — prisma/schema.prisma 의 저장 항목, src/lib 의 보관·파기(emailVerification·categoryInvite·
 * rateLimiter·jwt), 처리 위탁·국외 이전(Cloudflare D1 은 아시아·태평양 지역, 메일은 Gmail SMTP). 바뀌면 여기도 고친다.
 * 법이 정한 항목(제30조 제1항): 목적·항목·보유 기간·파기·제3자 제공·위탁·국외 이전(제28조의8)·권리 행사·보호책임자·
 * 자동 수집 장치·안전성 확보조치·변경.
 */

/** 문의처 겸 개인정보 보호책임자 연락처 */
const CONTACT_EMAIL = "cronos.support@gmail.com";
/** 운영자 — 구글 플레이 개발자 계정 이름 */
const OPERATOR = "HaluStudio";

export const metadata: Metadata = {
    title: "개인정보처리방침 · CRONOS",
    description: "CRONOS 가 처리하는 개인정보의 항목·목적·보관과 파기·위탁·국외 이전·권리 행사 방법 안내",
};

const UPDATED = "2026-10-31";
const PREVIOUS = "2026-10-27";

export default function PrivacyPage() {
    return (
        <main className="doc">
            <style>{CSS}</style>
            <BackLink label="돌아가기 · Back" />

            <h1>개인정보처리방침</h1>
            <p className="meta">시행일 {UPDATED} · 운영 {OPERATOR} · CRONOS (웹·데스크톱·안드로이드, com.cronos.todoapp)</p>
            <p>{OPERATOR}(이하 &lsquo;운영자&rsquo;)는 CRONOS 를 운영하면서 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고,
                관련 고충을 빠르게 처리하기 위해 다음과 같이 개인정보처리방침을 둡니다.</p>

            <h2>1. 처리하는 개인정보의 항목</h2>
            <ul>
                <li><b>가입·로그인(필수)</b> — 이름, 이메일 주소, 비밀번호(되돌릴 수 없는 형태로만 저장).
                    구글 계정으로 가입하면 구글이 알려 주는 계정 식별자·이름·이메일·프로필 사진 주소.</li>
                <li><b>이용자가 직접 적는 것</b> — 카테고리, 할 일(제목·메모·시간·장소·반복), 완료 기록, 하루 할 일과 메모,
                    기념일(월·일·아이콘), 프로젝트와 작업, 챌린지와 달성 기록, 테마 같은 설정.</li>
                <li><b>카테고리 초대</b> — 초대하는 사람이 적은 받는 사람의 이메일 주소(수락하거나 30일이 지날 때까지).</li>
                <li><b>Android 비공개 테스트 신청(선택)</b> — Google Play 계정 이메일, 수집·이용 동의와 신청 시각을 Google Forms와
                    연결된 응답 시트로 접수합니다. HaluStudio가 응답을 확인하여 Google Play 테스터 명단에 직접 등록하고 완료 이메일을 보냅니다.
                    다른 응답자에게 신청 이메일이나 응답 목록을 공개하지 않으며, CRONOS 서비스 데이터베이스에는 별도 신청 명단을 저장하지 않습니다.</li>
                <li><b>자동으로 생기는 것</b> — 로그인 유지 정보(토큰), 접속 IP 주소(무차별 로그인 시도를 막는 횟수 제한에만 쓰며
                    되돌릴 수 없는 형태로 바꿔 저장), 서버 접속 기록(요청 시각·주소·IP 등, Cloudflare 의 서버 기록).</li>
            </ul>
            <p>주민등록번호 같은 고유식별정보, 민감정보, 위치정보, 연락처, 사진첩, 통화 기록, 광고 식별자, 기기 식별자는 모으지 않습니다.
                앱에는 광고도, 이용자 행동을 추적하는 분석 도구도 들어 있지 않습니다.
                안드로이드 앱이 요구하는 권한은 <b>인터넷 연결</b>과 <b>진동</b>(완료할 때의 짧은 손 신호) 둘이며, 둘 다 기기에 저장된 정보에 접근하지 않습니다.</p>

            <h2>2. 처리 목적</h2>
            <ul>
                <li>회원 확인과 가입 의사 확인(이메일 인증), 로그인 유지</li>
                <li>이용자가 적은 일정·할 일을 보여 주고 기기 사이에서 맞추기, 함께 쓰는 카테고리 운영</li>
                <li>비밀번호 재설정·이메일 인증 메일 보내기</li>
                <li>선택한 Android 비공개 테스트의 신청 확인, 테스터 명단 등록과 완료 알림</li>
                <li>부정 이용(무차별 로그인 시도 등) 방지와 서비스 안정성 확보</li>
            </ul>
            <p>이 밖의 목적으로 쓰지 않으며, 팔거나 광고에 쓰지 않습니다.</p>

            <h2>3. 보유 기간</h2>
            <ul>
                <li><b>회원 정보와 적은 것</b> — 회원 탈퇴 때까지. 탈퇴하면 바로 파기합니다.</li>
                <li><b>이메일 인증을 마치지 않은 가입</b> — 마지막 인증 메일을 보낸 뒤 7일이 지나면 파기합니다.</li>
                <li><b>수락하지 않은 카테고리 초대</b> — 30일이 지나면 파기합니다.</li>
                <li><b>Android 테스트 신청 정보</b> — 비공개 테스트 종료 또는 신청 철회 시 운영자가 Google Forms 응답과 연결된 응답 시트에서 삭제합니다.
                    테스터 명단 삭제·신청 정정·철회는 아래 문의 이메일로 요청할 수 있습니다. Google 서비스의 처리에는 Google 개인정보처리방침도 적용됩니다.</li>
                <li><b>로그인 유지 토큰</b> — 30일 동안 쓰지 않으면(&lsquo;로그인 유지&rsquo;를 끄면 하루) 만료되어 파기합니다.
                    비밀번호 재설정 링크는 1시간, 이메일 인증 링크는 24시간만 씁니다.</li>
                <li><b>시도 횟수 제한 기록</b>(바꿔 저장한 IP) — 제한 시간(최대 1시간)이 끝나면 파기합니다.</li>
                <li><b>서버 접속 기록</b> — 최대 7일.</li>
                <li><b>데이터베이스 백업</b>(장애 복구용) — 최대 30일 뒤 자동으로 지워집니다. 탈퇴한 정보도 이 기간 동안 백업에 남을 수 있으나 복구 말고는 쓰지 않습니다.</li>
                <li><b>메일 발송 사본</b> — 보낸 메일의 사본은 발송 계정에서 주기적으로 지워 최대 60일 안에 없앱니다.</li>
            </ul>

            <h2>4. 파기 절차와 방법</h2>
            <p>보유 기간이 끝났거나 처리 목적을 이룬 개인정보는 지체 없이 파기합니다. 전자 파일은 되살릴 수 없는 방법으로 지우며,
                종이로 출력하지 않습니다. 다른 법령에 따라 따로 보존해야 하는 정보는 없습니다(유료 결제가 없습니다).</p>

            <h2>5. 제3자 제공</h2>
            <p>이용자가 선택한 아래 기능 외에는 개인정보를 제3자에게 제공하지 않습니다. 법령에 특별한 규정이 있는 경우는 예외입니다.</p>
            <p>Android 비공개 테스트 신청 시 Google Forms에서 신청 이메일과 동의를 접수하고, 운영자가 Google Play 테스터 명단에 직접 등록합니다.
                신청 접수는 등록 완료를 의미하지 않습니다. 등록 완료 이메일을 받은 뒤 같은 Google 계정으로 Google Play 테스트 참여를 선택할 수 있습니다.
                테스트 탈퇴는 Google Play 참여 화면에서, 신청 정보 삭제는 문의 이메일을 통해 요청할 수 있습니다.</p>
            <p>카테고리 함께 쓰기는 이용자가 고르는 기능입니다. 초대를 <b>수락하면</b> 그 카테고리의 참여자에게 이름·이메일·프로필 사진과
                그 카테고리에 적은 내용이 보입니다. 수락하기 전에는 참여자가 아니며 초대한 사람에게도 받는 사람의 정보가 보이지 않습니다.
                참여자는 언제든 나갈 수 있고, 카테고리를 만든 사람은 참여자를 내보낼 수 있습니다.</p>

            <h2>6. 처리 위탁</h2>
            <table>
                <thead><tr><th>수탁자</th><th>맡기는 일</th></tr></thead>
                <tbody>
                    <tr><td>Cloudflare, Inc.</td><td>서비스 서버와 데이터베이스 운영(저장·전송), 서버 접속 기록 보관</td></tr>
                    <tr><td>Google LLC</td><td>비밀번호 재설정·이메일 인증 메일 발송(Gmail), 선택한 비공개 테스트 신청 접수·응답 보관(Google Forms·Sheets)</td></tr>
                </tbody>
            </table>
            <p>구글 계정 로그인은 이용자가 고르는 로그인 수단으로, 고른 경우에만 구글과 인증 정보를 주고받습니다.</p>

            <h2>7. 국외 이전</h2>
            <p>서비스를 제공하기 위해(계약 이행) 아래와 같이 개인정보를 국외에 보관·처리합니다(개인정보 보호법 제28조의8).</p>
            <table>
                <thead><tr><th>이전받는 자 (연락처)</th><th>이전 국가</th><th>항목</th><th>시기와 방법</th><th>목적과 보유 기간</th></tr></thead>
                <tbody>
                    <tr>
                        <td>Cloudflare, Inc. (www.cloudflare.com/privacypolicy)</td>
                        <td>아시아·태평양 지역의 데이터센터(데이터베이스), 이용자와 가까운 데이터센터(요청 처리) — 미국 법인</td>
                        <td>CRONOS 계정과 앱 저장 항목(테스터 신청 폼 응답 제외)</td>
                        <td>서비스를 쓸 때마다 네트워크(HTTPS)로 전송·저장</td>
                        <td>서비스 운영 · 3의 보유 기간과 같음</td>
                    </tr>
                    <tr>
                        <td>Google LLC (policies.google.com/privacy)</td>
                        <td>미국 등 Google 데이터센터가 있는 나라</td>
                        <td>이메일 주소, 메일 내용(재설정·인증 링크)</td>
                        <td>메일을 보낼 때 네트워크(TLS)로 전송</td>
                        <td>메일 발송 · 사본 최대 60일</td>
                    </tr>
                    <tr>
                        <td>Google LLC (policies.google.com/privacy)</td>
                        <td>미국 등 Google 데이터센터가 있는 나라</td>
                        <td>선택한 테스트 신청 이메일, 수집·이용 동의, 접수 시각</td>
                        <td>신청자가 Google Forms를 제출할 때 HTTPS로 전송·저장</td>
                        <td>신청 접수·테스터 등록·안내 · 비공개 테스트 종료 또는 철회 시 삭제</td>
                    </tr>
                </tbody>
            </table>
            <p><b>거부하는 방법과 그 결과</b> — 국외 이전은 서비스 제공에 꼭 필요해 따로 거부할 수 없으며, 원하지 않으면 가입하지 않거나
                회원 탈퇴를 하면 됩니다. 이 경우 서비스를 쓸 수 없습니다. 메일 발송만 원하지 않으면 구글 계정으로 가입·로그인하면 됩니다.</p>
            <p>비공개 테스트 신청은 선택사항입니다. 신청 정보 제공에 동의하지 않으면 신청서를 제출하지 않을 수 있으며,
                웹·데스크톱의 기존 이용에는 영향을 주지 않습니다. 신청 철회·삭제는 {CONTACT_EMAIL}로 요청해 주세요.</p>

            <h2 id="delete">8. 이용자의 권리와 행사 방법</h2>
            <p>이용자는 언제든지 자신의 개인정보를 열람·정정·삭제하거나 처리 정지를 요구할 수 있고, 동의를 철회할 수 있습니다.</p>
            <ul>
                <li><b>앱에서 바로</b> — 적은 것의 열람·수정·삭제, 이름·비밀번호 변경(<b>설정 &gt; 계정</b>), 카테고리 나가기,
                    회원 탈퇴(<b>설정 &gt; 계정 &gt; 회원 탈퇴</b> — 바로 지우며 되돌릴 수 없습니다).</li>
                <li><b>메일로</b> — 아래 보호책임자에게 가입한 이메일 주소로 요청하면 10일 안에 처리하고 결과를 알려 드립니다.
                    법정대리인이나 위임받은 사람도 요청할 수 있습니다(위임장 필요).</li>
            </ul>
            <p>만 14세 미만은 가입할 수 없습니다. 가입할 때 만 14세 이상인지 확인합니다.</p>

            <h2>9. 자동 수집 장치(쿠키 등)</h2>
            <p>웹에서는 로그인 유지를 위해 &lsquo;refreshToken&rsquo; 쿠키(스크립트가 읽을 수 없는 HttpOnly)와 브라우저 저장소(로그인 상태·화면 설정)를 씁니다.
                광고나 추적을 위한 쿠키는 쓰지 않습니다. 브라우저 설정에서 쿠키 저장을 막을 수 있으며, 막으면 로그인 유지가 되지 않습니다.</p>

            <h2>10. 안전성 확보 조치</h2>
            <ul>
                <li>비밀번호는 되돌릴 수 없는 일방향 암호화(bcrypt)로만 저장합니다.</li>
                <li>로그인 유지 토큰·비밀번호 재설정 링크·이메일 인증 링크는 해시로만 저장하고, 시도 횟수 제한에 쓰는 IP 는 되돌릴 수 없게 바꿔 저장합니다.</li>
                <li>모든 통신은 HTTPS(TLS)로 암호화합니다.</li>
                <li>계정마다 접근을 나누어 다른 사람의 정보를 볼 수 없게 하고, 로그인·가입·재설정 시도 횟수를 제한합니다.</li>
                <li>가입한 이메일 주소의 주인인지 메일로 확인한 뒤에만 쓸 수 있게 합니다.</li>
            </ul>

            <h2>11. 개인정보 보호책임자</h2>
            <p>개인정보 처리에 관한 문의·불만·피해 구제는 아래로 연락해 주세요. 빠르게 답하고 처리하겠습니다.</p>
            <ul>
                <li>개인정보 보호책임자: {OPERATOR} 대표</li>
                <li>연락처: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
            </ul>

            <h2>12. 권익 침해 구제 방법</h2>
            <p>개인정보 침해로 인한 구제를 받으려면 아래 기관에 분쟁 조정이나 상담을 신청할 수 있습니다.</p>
            <ul>
                <li>개인정보분쟁조정위원회: 1833-6972 (www.kopico.go.kr)</li>
                <li>개인정보침해신고센터: 118 (privacy.kisa.or.kr)</li>
                <li>대검찰청: 1301 (www.spo.go.kr)</li>
                <li>경찰청: 182 (ecrm.police.go.kr)</li>
            </ul>

            <h2>13. 방침의 변경</h2>
            <p>이 방침은 {UPDATED} 부터 시행합니다(이전 방침: {PREVIOUS} 시행). 바뀌면 이 페이지의 시행일을 고치고, 중요한 변경은 앱 안에서 미리 알립니다.</p>

            <hr />

            <h1 id="en">Privacy Policy</h1>
            <p className="meta">Effective {UPDATED} · Operated by {OPERATOR} · CRONOS (web, desktop, Android — com.cronos.todoapp)</p>

            <h2>1. What we collect</h2>
            <ul>
                <li><b>Account (required)</b> — name, email address, password (stored only as a one-way hash). If you sign up with Google:
                    the account identifier, name, email and profile picture URL Google provides.</li>
                <li><b>What you write</b> — categories, to-dos (title, memo, time, place, repeat), completion records, daily tasks and memos,
                    anniversaries (month, day, icon), projects and tasks, challenges and completions, preferences such as the theme.</li>
                <li><b>Category invitations</b> — the invitee’s email address typed by the inviter (until accepted or for up to 30 days).</li>
                <li><b>Generated automatically</b> — sign-in tokens; your IP address, used only to rate-limit sign-in attempts and stored in a
                    non-reversible form; server access logs kept by Cloudflare (time, URL, IP and similar).</li>
            </ul>
            <p>We do not collect resident registration numbers or other unique identifiers, sensitive data, location, contacts, photos, call logs,
                advertising IDs or device identifiers. There are no ads and no behavioural analytics. The Android app requests two permissions:
                <b> internet</b> and <b>vibration</b>; neither reads data stored on your device.</p>

            <h2>2. Why we use it</h2>
            <p>To verify your account and email address and keep you signed in; to show and sync what you write across your devices and run shared
                categories; to send password-reset and verification email; and to prevent abuse such as brute-force sign-in. Nothing else — we never
                sell your data or use it for advertising.</p>

            <h2>3. How long we keep it</h2>
            <ul>
                <li>Account data and what you wrote — until you delete your account; deleted immediately.</li>
                <li>Sign-ups that never verify their email — deleted 7 days after the last verification email.</li>
                <li>Invitations that are not accepted — deleted after 30 days.</li>
                <li>Sign-in tokens — expire after 30 days without use (1 day if “keep me signed in” is off). Reset links last 1 hour, verification links 24 hours.</li>
                <li>Rate-limit records (transformed IP) — deleted when the limit window ends (at most 1 hour).</li>
                <li>Server access logs — up to 7 days. Database backups (for disaster recovery) — automatically deleted after at most 30 days.</li>
                <li>Copies of sent email — removed from the sending account periodically, within 60 days.</li>
            </ul>

            <h2>4. Deletion</h2>
            <p>When data is no longer needed it is deleted without delay, by methods that make it unrecoverable. No law requires us to keep
                anything longer (there are no paid features).</p>

            <h2>5. Sharing</h2>
            <p>We do not provide your data to third parties, except where the law requires it. Sharing a category is your choice: once you
                <b> accept</b> an invitation, the category’s members can see your name, email, profile picture and what is written in that category.
                Before you accept, you are not a member and the inviter cannot see your information. Members can leave at any time and the owner can remove members.</p>

            <h2>6. Processors</h2>
            <ul>
                <li><b>Cloudflare, Inc.</b> — servers and database (storage and transfer), server access logs.</li>
                <li><b>Google LLC</b> — sending password-reset and verification email (Gmail).</li>
            </ul>
            <p>Signing in with Google is a sign-in method you choose; we exchange authentication data with Google only when you use it.</p>

            <h2>7. Transfers outside Korea</h2>
            <ul>
                <li><b>Cloudflare, Inc.</b> (www.cloudflare.com/privacypolicy) — all items in section 1; stored in Cloudflare’s Asia-Pacific region
                    (database) and processed in the data center nearest you; US company; transferred over HTTPS whenever you use the service; kept as in section 3.</li>
                <li><b>Google LLC</b> (policies.google.com/privacy) — your email address and the email content (reset/verification links); United States and
                    other countries with Google data centers; transferred over TLS when we send the email; sent copies kept up to 60 days.</li>
            </ul>
            <p>These transfers are necessary to provide the service and cannot be refused separately; to refuse, do not sign up or delete your account
                (you will not be able to use the service). To avoid email entirely, sign up and sign in with Google.</p>

            <h2 id="delete-en">8. Your rights</h2>
            <p>You can access, correct or delete your data, ask us to stop processing it, or withdraw consent at any time — directly in the app
                (edit or delete what you wrote, change your name or password in <b>Settings &gt; Account</b>, leave categories, or delete your account in
                <b> Settings &gt; Account &gt; Delete account</b>, which is immediate and irreversible), or by emailing the contact below from your account
                email; we respond within 10 days. A legal representative or authorised agent may also make requests. People under 14 cannot sign up;
                we confirm your age when you sign up.</p>

            <h2>9. Cookies</h2>
            <p>On the web we use a “refreshToken” cookie (HttpOnly) and browser storage to keep you signed in and remember screen settings — no
                advertising or tracking cookies. You can block cookies in your browser; you will then not stay signed in.</p>

            <h2>10. Security</h2>
            <p>Passwords are stored only as one-way bcrypt hashes; sign-in tokens, reset links and verification links are stored only as hashes; IP
                addresses used for rate limiting are stored in non-reversible form; all traffic uses HTTPS/TLS; data is separated per account; sign-in,
                sign-up and reset attempts are rate-limited; accounts can be used only after the email address is verified.</p>

            <h2>11. Privacy officer and contact</h2>
            <p>Privacy officer: Representative of {OPERATOR} — <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                In Korea you may also contact the Personal Information Dispute Mediation Committee (1833-6972), the Privacy Infringement Report Center (118),
                the Supreme Prosecutors’ Office (1301) or the National Police Agency (182).</p>

            <h2>12. Changes</h2>
            <p>This policy is effective from {UPDATED} (previous version effective {PREVIOUS}). If it changes we update the date above and announce
                significant changes in the app in advance.</p>
        </main>
    );
}

const CSS = `
.doc {
    max-width: 760px;
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
.doc .back { margin: 0 0 18px; font-size: 0.9rem; }
.doc hr { margin: 56px 0 40px; border: none; border-top: 1px solid #e3e3e3; }
.doc a { color: #1a5fb4; }
.doc table { width: 100%; border-collapse: collapse; font-size: 0.86rem; margin: 10px 0 6px; display: block; overflow-x: auto; }
.doc th, .doc td { border: 1px solid #e3e3e3; padding: 7px 9px; text-align: left; vertical-align: top; color: #3c3c3c; }
.doc th { background: #f6f6f4; font-weight: 600; white-space: nowrap; }
@media (prefers-color-scheme: dark) {
    .doc { color: #e9e9e9; background: #121212; }
    .doc p, .doc li, .doc td { color: #cfcfcf; }
    .doc .meta { color: #9a9a9a; }
    .doc hr { border-top-color: #2e2e2e; }
    .doc th, .doc td { border-color: #2e2e2e; }
    .doc th { background: #1c1c1c; color: #e9e9e9; }
    .doc a { color: #8ab4f8; }
}
`;
