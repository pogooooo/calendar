"use client";

import { useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { DEFAULT_STONE, GemButton, GemFacet, GemField, GemMaterial, GemSegments, GemSelect, GemTodayMark } from "@/features/gem/GemParts";
import parts from "@/features/gem/GemParts.module.css";
import {
    GemCalendarDate, GemMonthStep, GemSettingCorners, GemTodayJump,
} from "./calendar/GemCalendarParts";
import calendar from "./calendar/GemCalendarPreview.module.css";
import GemGalleryControls from "./GemGalleryControls";
import styles from "./GemGallery.module.css";

const SECTIONS = [
    { id: "buttons", title: "버튼과 탐색", caption: "한 번씩 눌러 동작을 확인할 수 있어요." },
    { id: "levers", title: "레버와 선택", caption: "켜기, 강도 조절, 체크, 보기 선택을 따로 비교합니다." },
    { id: "dates", title: "날짜와 작은 표식", caption: "각 날짜를 눌러 선택 표시가 어떻게 옮겨가는지 보세요." },
    { id: "events", title: "일정과 기간", caption: "시간, 완료, 기념일, 이어지는 일정의 모서리를 각각 보여줍니다." },
    { id: "fields", title: "입력과 피드백", caption: "빈 제목으로 제출하면 오류가, 제목을 입력하면 완료 문구가 표시됩니다." },
    { id: "materials", title: "재료와 세공", caption: "무드보드의 다섯 면을 확대해 보고, 금·은 세공선도 비교할 수 있어요." },
] as const;

const MATERIALS = [
    { tone: "pearl", title: "진주빛 연마면", use: "월 제목과 달력 바탕" },
    { tone: "amethyst-cut", title: "자수정 층리", use: "선택한 날의 제목" },
    { tone: "amethyst", title: "짙은 자수정 원석", use: "할 일, 이전·다음, 상세 목록" },
    { tone: "quartz", title: "석영 지오드", use: "오늘 칸과 빠른 일정 추가 영역" },
    { tone: "refraction", title: "굴절면", use: "오늘 버튼, 선택한 날짜, 입력창" },
] as const;

const DATES = [
    { day: 4, name: "일반 날짜", note: "연마면 위에 날짜 숫자만 표시" },
    { day: 8, name: "오늘", note: "석영 결정과 얇은 금테", today: true },
    { day: 18, name: "선택한 날짜", note: "은테와 굴절면으로 선택 표시" },
    { day: 21, name: "주말", note: "따뜻한 자주색 숫자로 구분", weekend: true },
    { day: 2, name: "인접한 달", note: "밝은 반투명 바탕과 월 이름으로 구분", muted: true, monthLabel: "12월" },
] as const;

const VIEW_OPTIONS = ["월", "주", "일"] as const;
const MONTH_FORMAT = new Intl.DateTimeFormat("ko-KR", { timeZone: "UTC", year: "numeric", month: "long" });

function Collection({ index, children }: { index: number; children: ReactNode }) {
    const section = SECTIONS[index];
    return <section id={section.id} aria-labelledby={`${section.id}-title`} className={styles.collection}>
        <header className={styles.collectionHeader}>
            <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div><h2 id={`${section.id}-title`}>{section.title}</h2><p>{section.caption}</p></div>
        </header>
        {children}
    </section>;
}

function Piece({ name, note, stage, children }: {
    name: string; note: string; stage?: string; children: ReactNode;
}) {
    return <figure className={styles.piece}>
        <div className={stage ? `${styles.stage} ${stage}` : styles.stage}>{children}</div>
        <figcaption><strong>{name}</strong><span>{note}</span></figcaption>
    </figure>;
}

export default function GemGallery() {
    const [monthOffset, setMonthOffset] = useState(0);
    const [view, setView] = useState<(typeof VIEW_OPTIONS)[number]>("월");
    const [selectedDate, setSelectedDate] = useState(18);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("일정");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [stone, setStone] = useState(DEFAULT_STONE);
    const titleInput = useRef<HTMLInputElement>(null);
    const customStone = stone.toUpperCase() !== DEFAULT_STONE;

    function saveSample(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const name = title.trim();
        if (!name) {
            setError("일정 제목을 입력해 주세요.");
            setMessage("");
            titleInput.current?.focus();
            return;
        }
        setTitle("");
        setError("");
        setMessage(`${category} ‘${name}’ 예시를 저장했어요.`);
    }

    return <main className={`${parts.scope} ${calendar.finish} ${styles.gallery}`}>
        <div className={styles.frame}>
            <div className={styles.masthead}>
                <span>CRONOS <i /> DESIGN LAB</span>
                <Link href="/dev/design/gem/calendar">월간 달력 시안 <ArrowUpRight size={13} aria-hidden="true" /></Link>
            </div>
            <header className={styles.hero}>
                <GemSettingCorners />
                <div className={styles.heroCopy}>
                    <span className={styles.eyebrow}><GemFacet /> AMETHYST &amp; PEARL</span>
                    <h1>보석 테마 부품 갤러리</h1>
                    <p>하나씩 꺼내 본 크로노스의 세공과 재료. 버튼을 누르고 레버를 움직여 보세요.</p>
                </div>
            </header>
            <nav className={styles.index} aria-label="부품 갤러리 목차">
                {SECTIONS.map((section, index) => <a key={section.id} href={`#${section.id}`}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{section.title}
                </a>)}
            </nav>

            <Collection index={0}>
                <div className={styles.pieces}>
                    <Piece name="이전 달" note="둥근 자수정을 감싼 얇은 은테" stage={styles.navStage}>
                        <div className={calendar.navigation}>
                            <GemMonthStep direction="previous" onClick={() => setMonthOffset(value => value - 1)} />
                        </div>
                    </Piece>
                    <Piece name="오늘로 돌아가기" note="양끝이 반원인 금테와 원본 굴절광" stage={styles.navStage}>
                        <div className={calendar.navigation}><GemTodayJump onClick={() => setMonthOffset(0)} /></div>
                    </Piece>
                    <Piece name="다음 달" note="이전 달과 한 쌍인 원형 은테" stage={styles.navStage}>
                        <div className={calendar.navigation}>
                            <GemMonthStep direction="next" onClick={() => setMonthOffset(value => value + 1)} />
                        </div>
                    </Piece>
                    <Piece name="주요 버튼" note="빛을 받는 자수정 연마면과 양끝을 감싼 금테">
                        <div className={`${calendar.editor} ${styles.actionMount}`}>
                            <GemButton onClick={() => titleInput.current?.focus()}>일정 추가</GemButton>
                        </div>
                    </Piece>
                    <Piece name="보조 버튼" note="은테 안에 연마면이 보이는 텍스트 버튼">
                        <GemButton variant="quiet" className={styles.quietAction} onClick={() => {
                            setTitle("");
                            setError("");
                            setMessage("입력 예시를 비웠어요.");
                        }}>입력 지우기</GemButton>
                    </Piece>
                    <Piece name="비활성 버튼" note="채도를 낮춘 결정면으로 조작 가능 상태와 구분">
                        <GemButton className={styles.matteAction} disabled>저장 중…</GemButton>
                    </Piece>
                </div>
                <p className={styles.readout} role="status">탐색 예시 · {MONTH_FORMAT.format(new Date(Date.UTC(2026, 10 + monthOffset, 1)))}</p>
            </Collection>

            <Collection index={1}>
                <GemGalleryControls />
                <div className={styles.viewSample}>
                    <div className={styles.segments}><GemSegments options={VIEW_OPTIONS} value={view} onChange={setView} /></div>
                    <div><strong>보기 선택</strong><span>현재 {view} 보기 · 세 구간 중 하나를 선택하는 예시</span></div>
                </div>
            </Collection>

            <Collection index={2}>
                <div className={`${styles.pieces} ${styles.datePieces}`}>
                    {DATES.map(({ day, name, note, ...variant }) => <Piece key={day} name={name} note={note} stage={styles.dateStage}>
                        <div className={`${calendar.monthGrid} ${styles.dateMount}`}>
                            <div className={`${calendar.week} ${styles.dateRow}`} style={{ "--range-lanes": 0 } as CSSProperties}>
                                <GemCalendarDate day={day} selected={selectedDate === day} aria-label={`${name} ${day}일`}
                                    onClick={() => setSelectedDate(day)} {...variant} />
                            </div>
                        </div>
                    </Piece>)}
                    <Piece name="오늘 표식" note="날짜 숫자 옆에 놓이는 작은 원형 금테">
                        <div className={`${calendar.monthGrid} ${styles.badgeMount}`}>
                            <GemTodayMark />
                        </div>
                    </Piece>
                </div>
                <p className={styles.readout} role="status">선택한 날짜 · {selectedDate}일</p>
            </Collection>

            <Collection index={3}>
                <div className={styles.pieces}>
                    <Piece name="일반 일정" note="어두운 원석과 밝은 제목" stage={styles.stoneStage}>
                        <span className={calendar.eventStone} data-state="event"><span className={calendar.stoneTitle}>디자인 검토</span></span>
                    </Piece>
                    <Piece name="기념일" note="얇은 금테와 따뜻한 글자색" stage={styles.stoneStage}>
                        <span className={calendar.eventStone} data-state="anniversary"><span className={calendar.stoneTitle}>프로젝트 기념일</span></span>
                    </Piece>
                    <Piece name="완료된 일정" note="옅은 면과 취소선으로 완료 표시" stage={styles.stoneStage}>
                        <span className={calendar.eventStone} data-state="done"><span className={calendar.stoneTitle}>자료 정리</span></span>
                    </Piece>
                    {[
                        { name: "기간 시작", note: "왼쪽 끝에 세공면", start: false, end: true },
                        { name: "기간 이어짐", note: "양쪽이 이웃 구간으로 이어짐", start: true, end: true },
                        { name: "기간 종료", note: "오른쪽 끝에 세공면", start: true, end: false },
                    ].map(({ name, note, start, end }) => <Piece key={name} name={name} note={note} stage={styles.stoneStage}>
                        <span className={`${calendar.eventStone} ${calendar.rangeStone} ${styles.rangeExample}`} data-tone="amethyst"
                            data-continues-start={start} data-continues-end={end}>
                            <span className={calendar.stoneTitle}>사용자 테스트</span>
                        </span>
                    </Piece>)}
                    <Piece name="시간과 남은 일정" note="10:00과 추가 두 건을 같은 줄에 표시" stage={styles.stoneStage}>
                        <span className={`${calendar.eventMeta} ${styles.metaMount}`}><time dateTime="10:00">10:00</time><small>+2</small></span>
                    </Piece>
                    <Piece name="상세 목록의 한 행" note="시간 열과 일정 제목 열을 따로 정렬" stage={styles.detailStage}>
                        <div className={`${calendar.agenda} ${styles.detailMount}`}>
                            <ul><li className={calendar.agendaItem}>
                                <time className={calendar.agendaTime} dateTime="13:30">13:30</time>
                                <span className={calendar.agendaTitle}>다음 분기 일정 정리</span>
                            </li></ul>
                        </div>
                    </Piece>
                </div>
            </Collection>

            <Collection index={4}>
                <div className={`${styles.pieces} ${styles.fieldPieces}`}>
                    <Piece name="제목 입력과 저장" note="입력은 둥근 은테, 저장은 밝은 자수정 연마면" stage={styles.fieldStage}>
                        <form className={`${calendar.editor} ${styles.formMount}`} onSubmit={saveSample}>
                            <GemField ref={titleInput} label="일정 제목" placeholder="예: 디자인 검토" value={title} maxLength={80}
                                error={error} onChange={event => {
                                    setTitle(event.target.value);
                                    setError("");
                                    setMessage("");
                                }} />
                            <GemButton type="submit">예시 저장</GemButton>
                        </form>
                    </Piece>
                    <Piece name="종류 선택" note="열어 일정 또는 기념일을 선택하세요." stage={styles.fieldStage}>
                        <GemSelect label="일정 종류" value={category} onChange={event => setCategory(event.target.value)}>
                            <option>일정</option><option>기념일</option>
                        </GemSelect>
                    </Piece>
                    <Piece name="값이 입력된 상태" note="입력값과 도움말을 함께 확인하는 예시" stage={styles.fieldStage}>
                        <GemField label="일정 이름 견본" defaultValue="디자인 검토" hint="제목은 80자까지 쓸 수 있어요." />
                    </Piece>
                </div>
                <p className={styles.readout} role="status">{message || "예시를 저장하면 이곳에 완료 상태가 표시됩니다."}</p>
            </Collection>

            <Collection index={5}>
                <div className={styles.materials}>
                    {MATERIALS.map(({ tone, title, use }) => <figure key={tone} className={styles.piece}>
                        <GemMaterial tone={tone} className={`${styles.swatch} ${tone === "quartz" ? styles.geodeSwatch : ""}`} />
                        <figcaption><strong>{title}</strong><span>{use}</span></figcaption>
                    </figure>)}
                </div>
                <div className={styles.finishes}>
                    <Piece name="금 세공선" note="오늘과 주요 동작의 테두리" stage={styles.finishStage}>
                        <span className={styles.goldSample} aria-hidden="true" />
                    </Piece>
                    <Piece name="은 세공선" note="이전·다음과 선택 상태의 테두리" stage={styles.finishStage}>
                        <span className={styles.silverSample} aria-hidden="true" />
                    </Piece>
                    <Piece name="모서리 각인" note="달력 제목과 상세 제목에 쓰는 가는 장식" stage={styles.finishStage}>
                        <div className={styles.cornerSample}><GemSettingCorners /></div>
                    </Piece>
                </div>
                <div className={`${parts.scope} ${styles.colorSample}`} data-custom-stone={customStone} style={{ "--stone": stone } as CSSProperties}>
                    <GemFacet />
                    <label>색상 견본 <input type="color" value={stone} onChange={event => setStone(event.target.value)} /></label>
                    <output>{stone.toUpperCase()}</output>
                    <GemButton variant="quiet" disabled={!customStone} onClick={() => setStone(DEFAULT_STONE)}>기본색</GemButton>
                </div>
            </Collection>
            <footer className={styles.footer}><GemFacet /> CRONOS GEM / COMPONENT SPECIMENS</footer>
        </div>
    </main>;
}
