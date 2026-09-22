# Maple 테마 — 2차 발주서 (조작부·틀)

> 1차(ASSETS.md)로 큰 그림(로그인·게이지·잎·스티커·종이)이 들어갔다.
> 2차는 **손이 닿는 것들** — 단추·탭·입력칸·스크롤·아바타 틀 — 을 먹 마스크로 바꾸기 위한 것이다.
> 지금은 전부 CSS 로 대신 그려 두었다(먹 하이라인 네모, 잎 마스크). 그림이 오면 `scripts/maple-assets.mjs` 에 한 줄씩 더하고
> `styles/maple/ink.ts` 의 조각(`stampButton`·`paperTab`·…)에 mask-border 로 끼우면 된다 — 화면 코드는 안 바뀐다.
>
> 스타일 블록·부정 프롬프트·검수 기준은 1차 발주서 §2 그대로. **전부 `[STYLE-MASK]`** (검정 먹 + 흰 바탕, 회색 없음).
> 1차에서 D1·D2 가 회색 채움·흐림으로 나왔으니, 이번엔 프롬프트 끝에 아래 한 줄을 꼭 붙인다:
> `pure black lines on pure white, no gray, no fill except where stated, no shading, no blur, sharp edges`

---

## 1. 다시 뽑는 것 (1차에서 못 쓴 것)

**D1 · nav-icons-sheet** — 사이드바·폰 탭바 12종 · 3:4 (1536×2048) · 마스크 시트 **정확히 4열 × 3행**
```
[STYLE-MASK] an icon sheet of exactly 12 hand-inked LINE icons in a clean 4 columns by 3 rows grid, equal spacing, identical stroke weight, outline only, no filled shapes, in this order left to right, top to bottom: (1) a small house, (2) a calendar page with one leaf marker, (3) three vertical kanban columns, (4) a trophy cup with a leaf, (5) a slice of cake with a candle, (6) three stacked layers, (7) a gear, (8) an arrow pointing down into a tray, (9) a plus sign, (10) a check mark, (11) a pocket watch, (12) three dots in a row; black outline on white, no labels, no grid lines, no extra icons
```
1차 결과: 20칸·회색 채움·엉뚱한 아이콘. `exactly 12` `4 columns by 3 rows` `outline only` 가 핵심.

**D2 · anniversary-icons-sheet** — 기념일 아이콘 8종 · 2:1 (2048×1024) · 마스크 시트 4열 × 2행
```
[STYLE-MASK] an icon sheet of exactly 8 hand-inked line icons in a clean 4 columns by 2 rows grid, identical thick stroke weight, sharp and high contrast, in this order: (1) a four-point star, (2) a crescent moon, (3) a layered cake, (4) a ring with a small stone, (5) a heart, (6) a single flower head with five petals, (7) a candle with flame, (8) a wrapped gift box with ribbon; black outline on white, no labels, no grid lines
```
1차 결과: 흐리고 달·꽃이 빠짐(연필·불꽃이 대신). 안 되면 8장을 **낱장으로**(각 1:1 512) 뽑아도 된다 — 시트로 못 붙이면 내가 모은다.

---

## 2. 새로 뽑는 것 — 조작부

**J1 · stamp-frame** — 단추의 틀 (mask-border 9조각) · 4:1 (2048×512) · 마스크
```
[STYLE-MASK] an empty rectangular rubber-stamp frame, one thick ink border line with slightly rough, unevenly inked edges like a stamp pressed on paper, rounded corners very small, interior completely white, centered with margin
```
쓰는 곳: 도장 단추(`stampButton`) 전부 — 저장·삭제·오늘·추가·설정의 모든 단추. 지금은 1px 먹선.

**J2 · stamp-frame-square** — 아이콘 단추·체크 상자 · 1:1 512 · 마스크
```
[STYLE-MASK] an empty square rubber-stamp frame, thick ink border with rough stamped edges, interior white, centered with margin
```
쓰는 곳: + 단추, 체크 상자(카테고리 할 일 카드), 닫기 단추.

**J3 · brush-underline** — 밑줄 붓 자국 3종 · 8:1 (2048×256) · 마스크 3장 (`-a` `-b` `-c`)
```
[STYLE-MASK] a single horizontal dry-brush ink stroke, thin, tapering at both ends, slightly uneven pressure, black on white, centered
```
쓰는 곳: 마우스를 올린 메뉴 줄·고른 탭의 밑줄(`paperTab`), 셋째 단추의 밑줄. 지금은 2px 실선.

**J4 · paper-tab** — 종이 탭(색인 탭) · 2:1 (1024×512) · 마스크
```
[STYLE-MASK] the silhouette of a single index-card tab seen from the front: a wide rounded-top tab shape with a slightly torn bottom edge, solid black silhouette, centered
```
쓰는 곳: 설정 목차의 고른 줄, 프로젝트의 보드·타임라인 탭, 폰 탭바의 고른 탭 뒤. 지금은 밑줄 + 잎.

**J5 · bookmark-ribbon** — 책갈피 리본 · 1:5 (410×2048) · 마스크
```
[STYLE-MASK] a vertical bookmark ribbon silhouette with a forked (swallowtail) bottom end, solid black, centered
```
쓰는 곳: 달력 오른쪽 눈금자(RulerScroll)의 현재 자리 표시, 주간 띠의 오늘. 지금은 붉은 깃발 네모.

**J6 · torn-edge** — 찢은 종이 가장자리 · 8:1 (2048×256) · 마스크 (가로로 이어 붙임)
```
[STYLE-MASK] a horizontal strip whose top edge is a torn, deckled paper edge with fine fibers and the rest solid black below, tileable left to right, black on white
```
쓰는 곳: 폰에서 아래에서 올라오는 시트(할 일 창·더보기)의 위 가장자리, 테이프 막대의 양끝.

**J7 · wreath-frame** — 잎 화환 고리 · 1:1 1024 · 마스크
```
[STYLE-MASK] a circular wreath frame made of small maple leaves and seed keys, thin and delicate, empty white center, black on white, centered
```
쓰는 곳: 사이드바 사람 사진·기본 얼굴, 카테고리 엠블럼, 참여자 메달의 틀. 지금은 먹 고리 하나.

**J8 · ink-arrows** — 앞·뒤 화살 · 3:1 (1536×512) · 마스크 2장 (`-left` `-right`)
```
[STYLE-MASK] a single hand-drawn ink arrow pointing left, long slightly wavy shaft, small open arrowhead, a tiny maple leaf at the tail end, black on white, centered
```
쓰는 곳: 주간·월간 달력의 이전·다음, 날짜 고르기의 달 넘김. 지금은 코드로 그린 SVG(assets/maple/MapleArrow).

**J9 · check-box-frame** — 빈 체크 상자 · 1:1 256 · 마스크
```
[STYLE-MASK] a small hand-drawn square box, single ink line, corners not quite meeting, interior white, centered
```
쓰는 곳: 체크 상자의 빈 상태(체크는 C7). J2 로 대신할 수 있으면 생략.

**J10 · leaf-chips** — 카테고리 칩용 잎 실루엣 3종 · 1:1 256 · 마스크 3장
```
[STYLE-MASK] a small simplified maple leaf silhouette, solid filled, {SHAPE}, readable at 12 pixels, centered
```
`{SHAPE}`: `five lobes` / `three lobes, narrow` / `seven lobes, wide`. 쓰는 곳: 카테고리마다 다른 잎(지금은 C6 하나를 색만 바꿔 쓴다).

---

## 3. 우선순위

| 차수 | 항목 | 이걸로 되는 것 |
|---|---|---|
| 1 | **J1 · J2 · J3** | 단추·체크·밑줄 — 화면 어디서나 보이는 것 |
| 2 | **D1 · D2** 다시 | 내비 아이콘·기념일 아이콘 |
| 3 | J4 · J5 · J7 · J8 | 탭·책갈피·화환·화살 |
| 4 | J6 · J9 · J10 | 찢은 가장자리·빈 상자·잎 3종 |

## 4. 받으면 내가 하는 일
`raw/` 에 넣어 주면 → `scripts/maple-assets.mjs` 에 `mask(...)` 한 줄씩 → `public/themes/maple/` → `styles/maple/ink.ts` 의 조각을 mask-border 로 바꾼다.
화면 코드(`*.styles.ts`)는 조각을 통해 쓰므로 손댈 곳이 없다.

## 5. 받은 뒤 — 어떻게 됐나 (2026-09-22)

18장 + 다시 뽑은 D1·D2 가 왔다(`raw/README.md` 의 2차 항목). 전부 임계 128 이진화라 마스크로 바로 굽는다. 1차 마스크(C·E4·F4·A4·A5)도 같은 판으로 다시 와서 통째로 바꿨다(옛 판은 `raw/_v1-2026-09-16/`).

| 항목 | 결과 | 어디에 |
|---|---|---|
| D1 nav-icons | ✅ 4×3 정확 (낱장 뽑아 코드로 합침) | 사이드바·폰 탭바 아이콘 (`assets/NavIcon`) |
| D2 anniversary-icons | ✅ 4×2 정확 | 기념일 아이콘 (`assets/AnniversaryIcon`) |
| J1 stamp-frame | ✅ 코드로 그린 굵은 틀 + 모델이 그린 가는 틀(`J1.png`) 둘 다 옴 | 굵은 틀을 도장 단추 전부에 (`stampButton`). 가는 틀은 작은 단추에서 번져 보여 예비 |
| J2 stamp-frame-square | ✅ | 주간 달력 칸의 + |
| J3 brush-underline ×3 | ✅ (a 가 둘 온 건 같은 파일) | a: 종이 탭 밑줄, b: 셋째 단추 hover, c: 예비 |
| J4 paper-tab | ❌ 실루엣이 아니라 윤곽 + 검은 찢김 띠 | 안 씀 — 탭은 J3 로 충분 |
| J5 bookmark-ribbon | ✅ 코드로 그린 제비꼬리(모델 것 `J5.png` 은 연필 꼴) | 눈금자 막대 |
| J6 torn-edge | ✅ 코드로 그린 것(모델 것 `J6.png` 은 가는 선) | 폰 시트(창·더보기)의 위 가장자리 |
| J7 wreath-frame | ✅ | 사이드바 쪽지 얼굴, 카테고리·기념일 엠블럼 |
| J8 ink-arrows | ✅ 다만 방향이 반대(left 파일이 오른쪽을 가리킴) → 굽을 때 이름을 바꿈 | 주간·월간 달력 앞·뒤 |
| J9 check-box-frame | ✅ | 체크 칸 전부 (+ C7 도장) |
| J10 leaf-chips ×3 | ✅ | 카테고리마다 다른 잎 (색 해시) |
| B5 · C5 (1차에 안 온 것) | ✅ B5 는 설정 바탕·챌린지 귀퉁이. C5 는 해칭 스케치라 표식으론 못 씀(`leaf-sketch` 로 굽기만) | |

굽는 법은 §4 대로 됐다: `maskSheet`(시트 자르기)·`stampFill`(틀 안 채우기)이 `scripts/maple-assets.mjs` 에 더해졌고, 조각은 `ink.ts` 의 `stampButton`·`paperTab`·`inkCheckbox`·`wreathFrame`·`tornTop`·`bookmark`·`leafChip`.
