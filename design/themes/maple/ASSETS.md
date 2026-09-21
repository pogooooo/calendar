# Maple 테마 — 에셋 발주서

> 새 테마 **Maple** (단풍). 빈티지 가을. 오래된 식물도감 한 장을 넘기는 느낌 —
> 낡은 크림빛 종이, 먹선 위에 옅은 수채, 눌러 말린 단풍잎, 놋쇠 장식.
> 이 문서는 **다른 채팅에서 이미지 모델로 하나씩 뽑기 위한 발주서**다. 항목마다 그대로 붙여 넣을 프롬프트가 있다.

- 갈래 이름: `maple` (코드) · 표시 이름 **Maple** · 설명 "Pressed maple leaves on aged paper"
- 벌(모드) 둘: **Maple** (낮 · 크림 종이) / **Maple Dark** (밤 · 호두나무 빛 종이, 등불 빛)
- 에셋 수: 48개 (선택 3개 포함). 개수보다 **서로 한 손에서 나온 것처럼 보이는가**가 중요하다 → §2 를 먼저 읽을 것
- 넘겨 주는 곳: `design/themes/maple/raw/` 에 `ID_이름.png` 로 (§6). 변환(WebP·투명·마스크)과 코드 삽입은 내가 한다

---

## 1. 방향

### 1.1 한 줄 컨셉
**"1950년대 식물도감에 끼워 둔 단풍잎."** 종이는 낡았고, 선은 손으로 그었고, 색은 바랬다.
화려한 가을 사진이 아니라 **눌러 말린 잎, 먹, 놋쇠**의 세계. Celestial 이 "금빛 실선 위의 별자리" 라면 Maple 은 "종이 위의 잎맥".

### 1.2 색 (코드의 `theme.ts` 토큰 — 그림도 이 색 안에서 논다)

| 토큰 | Maple (낮) | Maple Dark (밤) | 쓰임 |
|---|---|---|---|
| `background` | `#F4EADB` 크림 종이 | `#1F1612` 호두나무 | 바탕 |
| `surface` | `#ECDFC9` | `#2A1E18` | 패널·카드 |
| `primary` | `#B5432B` 단풍 붉음 | `#D8703F` 잉걸 주황 | 실선·강조·제목 |
| `accent` | `#E4B26A` 황토 | `#E8B45C` | 일정 막대·하이라이트 |
| `text` | `#3B2A20` 먹 | `#EFE3D0` | 본문 |
| `textSecondary` | `#7C6656` | `#A08C78` | 보조 글 |
| `border` | `#C8702A` 탄 주황 | `#D8703F` | 테두리 |
| `success` | `#6E8B5B` 바랜 세이지 | `#8FA57A` | 완료 |
| `error` | `#9E3B2E` | `#C9584A` | 오류 |
| `weekend` | `#A24A5B` 오디빛 | `#D98A8E` | 주말 |

그림에 쓰는 **팔레트 6색** (프롬프트에 그대로 들어간다):
`maple red #B5432B` · `burnt orange #C8702A` · `ochre #D9A441` · `walnut brown #5B3A29` · `faded sage #7F8C6B` · `cream paper #F3E9D6`

### 1.3 글꼴 (그림이 아니라 내려받는 것 — Google Fonts, 전부 OFL)
- 표시(display): **Gowun Batang** (고운바탕) — 제목·숫자·머리글. 앱 설정의 글꼴 목록에 이미 있다
- 본문(body): **Noto Sans KR** — 본문은 산세리프여야 작은 글이 읽힌다
- 라틴 숫자·시각: **Cormorant Garamond** (tabular 숫자로) — 위젯·달력의 시각에

### 1.4 어디에 어떻게 쓰이나 (코드 관점)
Celestial 은 그림 파일이 하나도 없다 — 전부 SVG/CSS/캔버스로 그린다. Maple 은 **손그림 질감이 핵심**이라 그림 파일을 쓴다.
그림은 `public/themes/maple/` 에 WebP 로 들어가고, 아래 자리들이 그걸 읽는다.

| 자리 | Celestial 의 지금 | Maple 에서 쓸 에셋 |
|---|---|---|
| 로그인 패널 (`components/auth`) | 별자리 고리 SVG 애니메이션 | E1·E2 큰 그림 + B6 떨어지는 잎 |
| 사이드바 그림 (`assets/sidebarDesign`) | 궤도 SVG | E6 단풍 가지(hover 에 살짝 흔들림) |
| 홈 월 게이지 (`components/home`) | 반원 눈금 SVG | E3 놋쇠 해시계 반원 + 바늘은 코드 |
| 달력 배경 분위기 (`assets/celestial/CalendarAmbience`) | 떠다니는 빛 점 | B6 잎 스프라이트 (캔버스로 떨어짐) |
| 오늘 칸 (`DayCellDecor`) | 금빛 원반 | F3 눌러 말린 잎 |
| 챌린지 스티커 (`ChallengeStickers`) | 초승달→보름 | C11·C12 잎 윤곽 → 채운 잎 |
| 기념일 아이콘 (`AnniversaryIcons`, 8종) | 별·달·케이크… 선화 | D2 잉크 아이콘 8종 |
| 내비 아이콘 (사이드바·폰 탭바) | lucide | D1 잉크 아이콘 12종 |
| 구분선·머리글 장식 (`✦`, 실선) | 유니코드 ✦ + 1px 선 | C1~C4 마스크 |
| 할 일 줄 앞 (◇/◆) | CSS 마름모 | C5·C6 잎 마스크 |
| 설정의 테마 카드 | 색 견본 | E5 미리보기 |
| 데스크톱 위젯 바탕 (`WidgetShell`) | 반투명 단색 | G1·G2 종이 타일 |
| 안드로이드 홈 위젯 | 검정+금 | 별도 — `MapleWidgetPainter` 가 G 타일과 C 마스크로 그린다 |
| 빈 화면 문구 4곳 | 글만 | E4a~d 작은 선화 |

---

## 2. 뽑을 때 지킬 것 (여기가 제일 중요하다)

### 2.1 일관성 — "스타일 키"부터
따로따로 뽑으면 그림마다 손이 달라진다. 순서:
1. **먼저 `B1 hero-branch` 를 뽑는다.** 마음에 드는 한 장이 나올 때까지. 이게 **스타일 키**다.
2. 그 다음부터는 **모든 프롬프트에 그 그림을 참조로 붙인다.**
   - Midjourney: `--sref <B1 이미지 URL> --sw 200` (버전 6 이상), 필요하면 `--seed` 도 고정
   - ChatGPT(이미지 생성)·Gemini: B1 을 첨부하고 "이 그림과 같은 화풍·종이·선·팔레트로" 라고 앞에 쓴다
   - Flux / Stable Diffusion: IP-Adapter 또는 style reference 에 B1, 같은 seed
3. 한 그룹(예: D1 아이콘 12개)은 **한 장(시트)으로 한 번에** 뽑는다. 낱장으로 뽑으면 굵기가 제각각이 된다. 자르는 건 내가 한다.

### 2.2 스타일 블록 — 프롬프트 맨 앞에 붙이는 공통 문장
아래 셋 중 하나가 항목마다 `[STYLE-…]` 로 표시돼 있다. 그 자리에 그대로 넣는다.

**`[STYLE-PAPER]`** (낮 벌 · 색 그림)
```
vintage autumn field-guide illustration, hand-drawn ink linework with soft watercolor wash, printed on aged cream paper (#F3E9D6), muted palette only: maple red #B5432B, burnt orange #C8702A, ochre #D9A441, walnut brown #5B3A29, faded sage #7F8C6B; fine paper grain, slight ink bleed, 1950s botanical plate feel, restrained and elegant, matte, no gloss
```

**`[STYLE-NIGHT]`** (밤 벌 · 색 그림)
```
vintage autumn field-guide illustration, hand-drawn ink linework with soft watercolor wash, printed on deep walnut-black paper (#1F1612) under warm lantern light, muted palette only: ember orange #D8703F, ochre #E8B45C, maple red #B5432B, faded sage #8FA57A, cream ink #EFE3D0; fine paper grain, slight ink bleed, 1950s botanical plate feel, restrained, matte, no gloss, no neon
```

**`[STYLE-MASK]`** (단색 실루엣 — 코드에서 색을 입힌다)
```
single-color solid black ink drawing on pure white background (#FFFFFF), no shading, no gradients, no gray tones, no color, crisp clean edges, centered with generous empty margin, flat 2D, vintage woodcut-stamp feel
```

**공통 부정 프롬프트** (모델이 negative 를 받으면 넣고, 아니면 프롬프트 끝에 "no …" 로)
```
text, letters, words, numbers, watermark, signature, logo, frame, border, photo, photorealistic, 3D render, glossy, neon, oversaturated, blurry, cropped, collage, multiple panels, people, faces, hands, animals
```

### 2.3 투명 배경 — 모델은 못 만든다
- 대부분의 모델은 진짜 투명 PNG 를 못 준다. **"isolated on pure white background, no cast shadow"** 로 뽑고 흰 배경은 내가 뺀다.
- 그래서 **색 그림에서 흰색이 그림 안에 있으면 안 된다** (잎맥 하이라이트를 흰색으로 그리면 같이 뚫린다). 하이라이트는 크림 `#F3E9D6` 으로.
- `[STYLE-MASK]` 는 흰 바탕 + 검정만. 그걸 알파 마스크로 바꿔 CSS `mask-image` 로 씌우면 **한 파일로 낮·밤 둘 다** 색을 입힌다. 장식류를 마스크로 뽑는 이유다.

### 2.4 크기·비율
- **기본 2048px 긴 변**, 항목에 비율이 적혀 있다 (`1:1`, `2:1`, `9:16` …). Midjourney 는 `--ar`, 다른 모델은 그 비율의 캔버스.
- 타일(질감)은 **`--tile`** (Midjourney) 또는 "seamless tileable, edges wrap" 문구. 타일은 1024×1024 로 충분.
- 잘리면 안 되는 것(잎·아이콘)은 **여백을 넉넉히** — 프롬프트에 이미 넣어 두었다.

### 2.5 검수 기준 (뽑은 걸 고를 때)
1. 팔레트 밖 색이 없는가 (파랑·보라·형광이 섞이면 탈락)
2. 글자·서명·테두리가 끼어들지 않았는가 (모델이 자주 넣는다)
3. 스타일 키(B1)와 같은 손인가 — 선 굵기·번짐·종이결
4. 마스크류는 **검정과 흰색 둘뿐**인가 (회색 그라데이션 있으면 탈락)
5. 타일은 이어 붙였을 때 이음새·밝기 차가 없는가 (모델의 tile 결과도 한 번 의심할 것)
6. 잎은 **단풍(maple)** 인가 — 모델이 은근히 참나무·플라타너스 잎을 준다. 손바닥 모양 5~7갈래, 톱니 가장자리

### 2.6 파일 이름과 내는 법
- `design/themes/maple/raw/<ID>_<이름>.png` — 예: `B1_hero-branch.png`, `C1_divider-vine.png`, `D1_nav-icons-sheet.png`
- 낮·밤 둘 다 있는 건 `-light` / `-dark` 를 붙인다: `A1_paper-light.png`, `A2_paper-dark.png`
- 후보가 여럿이면 `_v1`, `_v2` 로 다 넣어도 된다. 고르는 건 같이 하면 된다
- 나머지(WebP 변환, 배경 제거, 마스크 변환, 스프라이트 자르기, `public/themes/maple/` 배치, 코드)는 내 몫

---

## 3. 에셋 목록

표기: **ID · 이름** — 쓰이는 곳 · 비율/크기 · 형식 · 벌
그 아래 `프롬프트` 블록은 그대로 복사한다. `[STYLE-…]` 자리에 §2.2 의 문장을 넣는다.

### A. 바탕·질감 (6)

**A1 · paper-light** — 앱 전체 바탕(낮) · 1:1 1024 · 타일(이어 붙임) · 낮
```
[STYLE-PAPER] seamless tileable texture of aged cream paper, faint fiber grain, very subtle foxing spots and soft uneven toning, no distinct objects, no folds, no edges, even lighting, edges wrap perfectly, extremely subtle so text stays readable on top --tile
```
검수: 밝기 차이가 거의 없어야 한다 (본문 글이 위에 올라간다). 얼룩이 눈에 띄면 탈락.

**A2 · paper-dark** — 앱 전체 바탕(밤) · 1:1 1024 · 타일 · 밤
```
[STYLE-NIGHT] seamless tileable texture of deep walnut-black paper (#1F1612), faint fiber grain, whisper of warm ochre mottling as if lit by a distant lantern, no distinct objects, no folds, even lighting, edges wrap perfectly, extremely subtle --tile
```

**A3 · wash-band-light / A3 · wash-band-dark** — 달력 머리글·섹션 머리글 뒤에 깔리는 옅은 수채 띠 · 8:1 (2048×256) · 가로로 이어 붙임 · 낮/밤 각 1장
```
[STYLE-PAPER] a horizontal seamless band of translucent watercolor wash in ochre and burnt orange fading to the paper at top and bottom, soft pigment blooms, no objects, no leaves, tileable left to right, very light and airy
```
밤은 `[STYLE-NIGHT]` 로, 색은 `ember orange and ochre glow`.

**A4 · tape-tile** — 달력의 일정 막대 질감(반투명 마스킹테이프) · 4:1 (1024×256) · 타일 · 공용(마스크로 씀)
```
[STYLE-MASK] seamless horizontal strip texture of washi masking tape seen from above, faint torn fiber edges top and bottom, subtle uneven translucency rendered as fine black stipple on white, no pattern, no print, tileable left to right
```
검수: 위아래 가장자리가 살짝 거칠어야 테이프처럼 보인다. 가운데는 거의 흰색.

**A5 · card-frame** — 프로젝트 카드·모달 틀(9-slice 로 늘려 씀) · 1:1 1024 · 투명(흰 바탕) · 공용(마스크)
```
[STYLE-MASK] an empty rectangular index-card frame with slightly deckled hand-torn edges, thin double ink rule inset from the edge, the four corners have tiny maple-leaf flourishes, interior completely white and empty, symmetrical, centered with margin
```

### B. 단풍 그림 (6)

**B1 · hero-branch** ★ 스타일 키 — 로그인 패널·설정 미리보기의 주인공 · 9:16 (1152×2048) · 흰 바탕(투명 처리) · 낮
```
[STYLE-PAPER] a single maple branch with seven leaves in different stages of autumn — two still sage green, three burnt orange, two deep maple red — drawn as a botanical plate specimen, leaves palmate with 5 to 7 lobes and serrated edges, delicate ink veins, a few samaras (maple seed keys) hanging, composition vertical and airy, isolated on pure white background, no cast shadow, no vase, no text
```
검수: 잎이 단풍인가, 색이 여섯 팔레트 안인가, 흰 하이라이트가 없는가.

**B2 · leaf-red · B3 · leaf-orange · B4 · leaf-yellow · B5 · leaf-brown** — 단독 잎 4장 (빈 화면·기념일 카드·위젯 장식) · 1:1 1024 · 흰 바탕 · 낮 (밤에서는 살짝 어둡게 코드에서 처리)
```
[STYLE-PAPER] a single pressed maple leaf, palmate with 5 lobes and serrated edges, {COLOR}, fine ink veins, a short stem, slightly curled dry edge on one lobe, specimen-style top-down view, isolated on pure white background, no cast shadow, centered, generous margin
```
`{COLOR}` 를 바꿔 넷: `deep maple red #B5432B` / `burnt orange #C8702A` / `ochre yellow #D9A441` / `dry walnut brown #5B3A29 with cracked texture`

**B6 · leaf-sprites** — 떨어지는 잎 애니메이션(달력 분위기·로그인) · 2:1 (2048×1024) · 시트(4×2 = 8장) · 흰 바탕
```
[STYLE-PAPER] a sprite sheet of 8 small maple leaves arranged in a clean 4 by 2 grid with equal spacing, each leaf a different angle and curl (some seen edge-on, some flat, one folded), colors varying across maple red, burnt orange, ochre and one sage green, simple and small, isolated on pure white background, no cast shadow, no grid lines, no numbers
```
검수: 여덟 장이 서로 겹치지 않고 격자에 놓였는가 (자르기 편하게).

### C. 장식·마스크 (12) — 전부 `[STYLE-MASK]`, 한 파일로 낮·밤에 색을 입힌다

**C1 · divider-vine** — 섹션 머리글 옆 가로 구분선 (지금의 `——` 자리) · 8:1 (2048×256) · 마스크
```
[STYLE-MASK] a long thin horizontal ornamental rule: a single hand-drawn ink line with a small maple leaf and a curling tendril at the exact center, tapering to hairline at both ends, symmetrical, black on white, centered
```

**C2 · divider-short** — 모달·카드 안의 짧은 구분 · 4:1 (1024×256) · 마스크
```
[STYLE-MASK] a short horizontal ornamental rule: hairline ink line with three tiny maple seed keys (samaras) at the center, symmetrical, black on white
```

**C3 · corner-flourish** — 패널·모달 귀퉁이 (왼쪽 위 하나, 코드에서 뒤집어 넷) · 1:1 512 · 마스크
```
[STYLE-MASK] a small corner ornament for the top-left corner: one thin ink stroke turning the corner with a tiny maple leaf and one curl of vine, delicate, black on white, placed in the top-left of the canvas with the rest empty
```

**C4 · crest** — 홈의 `✦` 자리(섹션 문장) · 1:1 512 · 마스크
```
[STYLE-MASK] a tiny emblem: a single maple leaf inside a thin circle, woodcut stamp style, bold enough to read at 16 pixels, black on white, centered
```

**C5 · bullet-outline · C6 · bullet-filled** — 할 일 줄 앞 (◇ 할 일 / ◆ 끝낸 일) · 1:1 256 · 마스크 · 2장
```
[STYLE-MASK] a very small simplified maple leaf icon, {FILL}, readable at 12 pixels, symmetrical, black on white, centered
```
`{FILL}`: C5 = `outline only, single clean stroke` / C6 = `solid filled silhouette`

**C7 · check-stamp** — 완료 체크 (체크박스·챌린지 오늘 완료) · 1:1 256 · 마스크
```
[STYLE-MASK] a small rubber-stamp style check mark with slightly rough inked edges, like a stamp pressed on paper, black on white, centered
```

**C8 · spinner-leaf** — 로딩·처리 중 (코드에서 회전) · 1:1 256 · 마스크
```
[STYLE-MASK] a single maple seed key (samara) with its wing, drawn simply, pointing up, black on white, centered — it will be rotated to spin like a falling seed
```

**C9 · ribbon-banner** — D-day·챌린지 완료 띠 · 3:1 (1536×512) · 마스크
```
[STYLE-MASK] a vintage ribbon banner with forked ends, gently curved, empty interior for text, single ink outline with a thin inner line, black on white, centered
```

**C10 · label-frame** — 카테고리 이름표 틀 · 2:1 (1024×512) · 마스크
```
[STYLE-MASK] an empty vintage oval label frame like a jam-jar label, thin double ink line, tiny leaf sprigs at left and right, interior white and empty, black on white, centered
```

**C11 · sticker-leaf-outline · C12 · sticker-leaf-filled** — 챌린지 스티커 (지금의 초승달→보름달 자리; 안 한 날 윤곽, 한 날 채움) · 1:1 512 · 마스크 · 2장
```
[STYLE-MASK] a round sticker: a maple leaf centered inside a circle of tiny dots like a perforated stamp edge, {FILL}, black on white, centered
```
`{FILL}`: C11 = `leaf as outline only` / C12 = `leaf solid filled`. **둘의 원 크기와 잎 위치가 같아야** 코드에서 모핑이 된다 → 같은 seed, 같은 프롬프트에서 `{FILL}` 만 바꿀 것.

### D. 아이콘 시트 (2) — `[STYLE-MASK]`, 시트로 한 번에

**D1 · nav-icons-sheet** — 사이드바·폰 탭바 12종 (lucide 대신) · 3:4 (1536×2048) · 마스크 시트 (4열 × 3행)
```
[STYLE-MASK] an icon sheet of 12 hand-inked line icons arranged in a clean 4 by 3 grid with equal spacing and identical stroke weight, vintage engraving feel but simple and readable at 24 pixels, in this order left to right, top to bottom: (1) a small house, (2) a calendar page with one leaf marker, (3) three vertical kanban columns, (4) a trophy cup with a leaf, (5) a slice of cake with a candle, (6) three stacked layers, (7) a gear, (8) an arrow pointing down into a tray, (9) a plus sign, (10) a check mark, (11) a pocket watch, (12) three dots in a row; black on white, no labels, no grid lines
```
검수: 12개가 격자에 정확히 놓였는가, 선 굵기가 같은가, 순서가 맞는가.

**D2 · anniversary-icons-sheet** — 기념일 아이콘 8종 (지금 키 그대로: star, moon, cake, ring, heart, flower, candle, gift) · 2:1 (2048×1024) · 마스크 시트 (4열 × 2행)
```
[STYLE-MASK] an icon sheet of 8 hand-inked icons in a clean 4 by 2 grid, equal spacing, identical stroke weight, vintage engraving feel, readable at 20 pixels, in this order: (1) a four-point star, (2) a crescent moon, (3) a layered cake, (4) a ring with a small stone, (5) a heart, (6) a single flower head, (7) a candle with flame, (8) a wrapped gift box with ribbon; black on white, no labels, no grid lines
```

### E. 화면 그림 (11)

**E1 · auth-panel-light** — 로그인·가입 왼쪽 패널 (데스크톱 폭 약 520px, 세로 꽉) · 9:16 (1152×2048) · 낮 · 불투명
```
[STYLE-PAPER] a full-page botanical plate: a large maple branch sweeping in from the top-right corner across aged cream paper, leaves in sage, orange and red, a few maple seed keys drifting down, lower-left third of the page left almost empty (only paper), soft vignette of paper toning at the edges, no text, no title, no frame
```
검수: **왼쪽 아래 1/3 이 비어 있는가** — 거기에 앱 이름이 올라간다.

**E2 · auth-panel-dark** — 같은 자리, 밤 · 9:16 · 밤 · 불투명
```
[STYLE-NIGHT] a full-page botanical plate on deep walnut-black paper: a large maple branch sweeping in from the top-right, leaves in ember orange and maple red catching warm lantern light from the lower left, a few seed keys drifting, lower-left third of the page left almost empty, no text, no frame
```

**E3 · gauge-dial** — 홈 위의 월 게이지 바탕 (지금의 반원 눈금 자리; 바늘·눈금 숫자는 코드) · 2:1 (2048×1024) · 흰 바탕(투명 처리) · 공용(낮·밤 코드로 톤 조절)
```
[STYLE-PAPER] an antique brass sundial in half-circle shape seen straight from above, engraved tick marks along the outer arc (30 small ticks, every 5th longer), the brass gently aged with warm patina, a small maple leaf engraved at the center bottom, no needle, no numbers, no text, isolated on pure white background, no cast shadow, the flat bottom edge of the half circle aligned to the bottom
```
검수: 눈금이 **30개**쯤 균등하게 있는가 (한 달), 숫자·글자가 없는가.

**E4a · empty-todos · E4b · empty-projects · E4c · empty-challenges · E4d · empty-anniversaries** — 빈 화면 4곳의 작은 선화 · 1:1 1024 · 마스크 4장
```
[STYLE-MASK] a small vignette line drawing, {SCENE}, simple and calm, single stroke weight, black on white, centered with generous margin
```
`{SCENE}`:
- E4a `a single maple leaf resting on an empty park bench`
- E4b `an empty open notebook with one leaf as a bookmark`
- E4c `an empty jar with a tiny sprout and one fallen leaf beside it`
- E4d `an empty vintage photo frame with a pressed leaf tucked in one corner`

**E5 · theme-preview-light · E5 · theme-preview-dark** — 설정 > 테마 카드 미리보기 (작게 보임) · 16:10 (1600×1000) · 낮/밤 2장
```
[STYLE-PAPER] a small still life for a thumbnail: three pressed maple leaves (red, orange, ochre) and a brass pocket watch laid on aged cream paper, top-down, calm, lots of empty paper on the left half, no text
```
밤: `[STYLE-NIGHT]` 로, `a brass pocket watch glowing under lantern light`.

**E6 · sidebar-branch** — 사이드바 위쪽 그림 (지금의 궤도 애니메이션 자리; 폭 240px 안팎, hover 에 잎이 살짝 흔들리게 코드로 나눔) · 1:1 1024 · 흰 바탕(투명 처리) · 공용
```
[STYLE-PAPER] a slender maple twig entering from the top-left with four leaves (two orange, one red, one sage) and two hanging seed keys, elegant and sparse, each leaf clearly separated so it can be cut apart, isolated on pure white background, no cast shadow
```
검수: 잎이 서로 안 겹쳐야 한다 (한 장씩 잘라 따로 흔든다).

### F. 배지·표식 (6)

**F1 · wax-seal** — 챌린지 목표 달성·프로젝트 완료 도장 · 1:1 1024 · 흰 바탕(투명 처리) · 공용(색 그림)
```
[STYLE-PAPER] a wax seal in deep maple red, slightly irregular edge, embossed with a single maple leaf, matte wax with soft highlights in cream (not white), isolated on pure white background, no cast shadow, centered
```

**F2a · medal-empty · F2b · medal-half · F2c · medal-full** — 챌린지 진행 배지 3단계 · 1:1 1024 · 흰 바탕 · 공용 · 3장 (같은 seed)
```
[STYLE-PAPER] a small round brass medallion with a thin engraved rim and a maple leaf in the center, {STATE}, matte antique brass, isolated on pure white background, no cast shadow, centered
```
`{STATE}`: F2a `the leaf only engraved as an outline, brass dull` / F2b `the leaf half filled with red enamel from the bottom` / F2c `the leaf fully filled with deep red enamel and the rim polished`

**F3 · today-marker** — 달력의 오늘 칸 뒤 · 1:1 512 · 흰 바탕(투명 처리) · 공용
```
[STYLE-PAPER] a single small pressed maple leaf in soft ochre, very light and translucent as if faded, flat, top-down, isolated on pure white background, no cast shadow, centered — it sits behind a number so it must be pale
```
검수: **연해야** 한다. 위에 날짜 숫자가 올라간다.

**F4 · acorn** — 프로젝트 타임라인 이정표 · 1:1 256 · 마스크
```
[STYLE-MASK] a tiny acorn with its cap, simple, readable at 12 pixels, black on white, centered
```

### G. 위젯 바탕 (2)

**G1 · widget-paper-light · G2 · widget-paper-dark** — 데스크톱 위젯·안드로이드 홈 위젯의 바탕 (A1/A2 보다 살짝 더 결이 보여도 된다, 작게 보이니까) · 1:1 512 · 타일 · 낮/밤
```
[STYLE-PAPER] seamless tileable texture of kraft-toned aged paper with visible fiber grain, slightly warmer and more textured than plain cream paper, no objects, even lighting, edges wrap perfectly --tile
```
밤: `[STYLE-NIGHT]` + `dark walnut paper with faint warm grain`.

### H. 선택 (3) — 없어도 테마는 된다

**H1 · app-icon-maple** — 계절 아이콘(설정에서 고르게 할 수도) · 1:1 1024 · 불투명
```
[STYLE-PAPER] an app icon: a single deep red maple leaf pressed on aged cream paper inside a thin brass circle, flat, centered, simple enough to read at 48 pixels, no text
```

**H2 · landing-hero** — 웹 다운로드 페이지 머리 그림 · 16:9 (2048×1152) · 낮
```
[STYLE-PAPER] a wide botanical plate: maple branches from both upper corners framing a large empty center of aged cream paper, a few seed keys drifting, no text
```

**H3 · splash** — 안드로이드 시작 화면 · 9:19.5 (1080×2340) · 낮/밤
```
[STYLE-PAPER] a mostly empty aged cream paper page with one small maple leaf near the center and a faint brass circle around it, calm, no text
```

---

## 4. 우선순위 — 이 순서로 뽑으면 중간에도 테마가 성립한다

| 차수 | 항목 | 이걸로 되는 것 |
|---|---|---|
| **1차 (13)** | B1(스타일 키) · A1 · A2 · C1 · C4 · C5 · C6 · C7 · D1 · E1 · E2 · E5×2 | 로그인·바탕·머리글·할 일 줄·내비까지 — "Maple 을 골랐다" 가 눈에 보인다 |
| **2차 (14)** | E3 · E6 · B6 · F3 · C11 · C12 · D2 · A3×2 · C3 · C2 · G1 · G2 | 홈 게이지·사이드바·달력·챌린지·기념일·위젯 |
| **3차 (18)** | B2~B5 · E4a~d · F1 · F2a~c · C8 · C9 · C10 · A4 · A5 · F4 | 빈 화면·배지·프로젝트·잔장식 |
| 선택 (3) | H1 · H2 · H3 | 아이콘·랜딩·스플래시 |

---

## 5. 자주 나는 문제

- **잎이 단풍이 아니다** → 프롬프트에 이미 `palmate with 5 to 7 lobes and serrated edges` 가 있다. 그래도 참나무가 나오면 `Acer palmatum leaf` 를 덧붙인다.
- **글자가 낀다** → `no text` 로 안 되면 `no letters, no typography, no caption` 까지. 도감 느낌 때문에 라틴어 학명을 자꾸 넣는다.
- **테두리가 생긴다** → `no frame, no border, full-bleed` 를 넣고, 마스크류는 `[STYLE-MASK]` 의 `centered with generous empty margin` 을 유지.
- **마스크에 회색이 낀다** → `pure black and pure white only, no anti-aliasing gray, high contrast`. 그래도 남으면 내가 임계값으로 자른다 (약간 거칠어도 목판 느낌이라 괜찮다).
- **색이 튄다 (파랑·보라)** → 팔레트 문장을 프롬프트 맨 앞으로 옮기고 `limited palette, six colors only` 를 더한다.
- **타일 이음새** → `--tile` 이 없는 모델이면 그냥 뽑고 알려 달라. 내가 미러 타일링으로 잇는다 (질감엔 충분하다).

---

## 6. 받은 뒤 — 어떻게 됐나 (2026-09-17)

그림 46장이 왔다(`raw/README.md` 에 생성 기록). 안 온 것 둘, 못 쓴 것 둘:

| 항목 | 어떻게 했나 |
|---|---|
| **B5 leaf-brown** (안 옴) | 안 쓴다. 빈 화면·설정 바탕은 B2·B3·B4 석 장으로 충분했다 |
| **C5 bullet-outline** (안 옴) | C6(채운 잎)을 부풀린 것에서 깎은 것을 빼서 윤곽을 만들었다 (`scripts/maple-assets.mjs` 의 `outlineFromFilled`) |
| **D1 nav-icons-sheet** (옴, 못 씀) | 12종 순서 대신 20칸 짜리 회색 채움 아이콘이 나왔다(집·톱니·트로피 정도만 맞음). 내비 아이콘은 lucide 그대로 둔다. 다시 뽑는다면 §3 D1 프롬프트에 `exactly 12 icons, 4 columns by 3 rows, black line icons only, no fill, no gray` 를 더할 것 |
| **D2 anniversary-icons-sheet** (옴, 못 씀) | 흐릿하고 달·꽃이 빠졌다(연필·불꽃이 대신). 기념일 아이콘은 Celestial 의 선화 SVG 를 Maple 에서도 쓴다 |

나머지는 전부 들어갔다. 변환은 `node scripts/maple-assets.mjs` 한 번 — 원본 `raw/` (git 에 안 올림, 42MB) → `public/themes/maple/` WebP 50장 0.9MB.
크림 바탕 키잉(가장자리 되섞기)·먹 마스크·거울 타일·글자 자리 덮기(E1 아래 캡션)·시트 자르기(B6)가 거기 있다.
종이 네 장(A1·A2·G1·G2)은 모델이 너무 고르게 뽑아(밝기 편차 1~3/255) 결이 거의 없다 — 앱의 종이결은 CSS 잡음(`styles/maple/MapleGround.ts`)으로 얹고, 타일은 위젯 바탕에만 쓴다.

### 어디에 붙었나

| 그림 | 자리 |
|---|---|
| A3 wash | 달력 요일 줄 뒤 (`MapleMonthCalendar.styles` Header::before) |
| A4 tape | 월간·일간·타임라인의 일정 막대 mask (`styles/maple/ink.ts` `tape`) |
| A5 card-frame | `ink.ts` `cardFrame` (mask-border 9조각) — 아직 붙인 화면은 없다. 카드는 `paperCard`(먹 하이라인 두 겹)로 갔다 |
| B1 hero | 예비 (로그인은 E1·E2 를 썼다) |
| B2·B3·B4 | 설정 바탕 `settings/maple/LeafField` |
| B6 sprites | 로그인 패널 떨어지는 잎, 화면 전환 `transition/maple` |
| C1·C2 | `ink.ts` `vineRule`·`shortRule` — 홈 기둥 머리, 로그인 이름 밑, 전환 |
| C3 corner | 카테고리 표본 서랍·기념일 카드·알림 창의 네 귀 (`inkMask("corner.webp")` 를 네 방향으로 뒤집어) |
| C4 crest | ✦ 자리 전부 (홈·기념일 줄·위젯) |
| C5·C6 | 할 일 줄 앞 잎 (`ink.ts` `leafBullet`), 폰 월간 칸의 표식, 설정 목차, 위젯, 사이드바 메뉴의 현재 표식, 셀렉트의 화살·체크, 눈금자 표식, 폰 탭바의 현재 표식 |
| C7 check | 카테고리 할 일 카드의 체크 (`ink.ts` `checkStamp`), 알림 창 '됐다' 문장 (`dialog/maple/MapleEmblem`) |
| C8 spinner | 예비 |
| C9 ribbon · C10 label | 예비 (2차 주문 `ASSETS-2.md` J5 책갈피 리본이 C9 를 대신할 예정) |
| C11·C12 | 챌린지 스티커 `assets/maple/MapleChallengeSticker` |
| E1·E2 | 로그인·가입 패널 `auth/MapleAuthPanel` |
| E3 dial | 홈 월 게이지 `home/maple/MapleMonthArch`, 안드로이드 월 게이지 위젯 |
| E4a~d | 빈 화면 `components/empty/maple` (홈 오늘·프로젝트·챌린지·기념일) |
| E5 | 설정 테마 카드 미리보기 (`theme.ts` FAMILY_META.preview) |
| E6 | 사이드바 옆선 `assets/sidebarDesign/MapleSidebarDesign` |
| F1 seal | 알림 창 '위험' 문장 (`dialog/maple/MapleEmblem` — 지우기·되돌릴 수 없는 일) |
| F2 medals | 챌린지 줄의 진행 메달(빈·반·가득, `challenge/maple` ProgressBar), 카테고리 표본의 메달 |
| F4 acorn | 알림 창 '물음' 문장 (`dialog/maple/MapleEmblem`) |
| F3 today | 달력 오늘 칸 뒤, 위젯 오늘 칸 뒤 |
| G1·G2 | 데스크톱 위젯 바탕(`theme.paper`), 안드로이드 위젯 바탕 |
| H1 icon · H2 hero · H3 splash | 예비 (`public/themes/maple/app-icon.webp`·`landing-hero.webp`; H3 는 안 굽었다) |

### 코드 짜임

- 화면은 갈래 공용 View(`XView.tsx`) 하나에 모양만 `celestial/`·`maple/` 의 *.styles.ts — `usePickTheme(STYLES)`. Maple 의 styles 는 Celestial 것을 `export *` 로 받고 다른 것만 `styled(C.X)` 로 덮어쓴다 (`scripts/check-theme-styles.mjs` 가 규칙을 지킨다)
- 조작부의 말은 `styles/maple/ink.ts` 한 곳에: `stampButton`(도장 단추 — 네모, 그림자 없음, 누르면 1px 내려앉음), `inkInput`(먹선 칸), `paperTab`(종이 탭 — 현재 것만 먹 밑줄), `paperCard`(먹 하이라인 두 겹 카드), `paperToggle`, `inkChip`, `formHeader/Row/Footer`(창 서식). 단추·입력·셀렉트·드롭다운·날짜/시간 고르개·창·알림 창·설정·사이드바·탭바·눈금자가 전부 이걸로 그려져서, 갈래를 바꾸면 조작부 하나하나가 다른 물건이 된다
- 틀의 먹 색은 `theme.line`(스크롤바·제목 줄) — Celestial 은 primary 그대로
- 갈래마다 아예 다른 그림은 picker 로: 로그인 패널·사이드바 옆선·홈 게이지(`home/parts/MonthArch`)·달력 칸 꾸밈·챌린지 스티커·설정 바탕·화면 전환·빈 화면 선화
- 안드로이드 위젯은 화가 하나(`WidgetPainter`)에 붓(`WidgetStyle`: Celestial/Maple)이 글꼴·표식·바탕·문장을 그린다. 고운바탕(KS X 1001 2,350자 부분집합 1.4MB)·Cormorant Garamond 를 동봉
- 글꼴: 앱은 고운바탕·Cormorant 를 Google Fonts 에서 켤 때 받는다(`lib/fonts.ts` THEME_FONTS)

## 7. 남은 것 (2026-09-21)

- 자리 못 찾은 그림: A5 카드 틀, C8 스피너, C9 리본, C10 이름표, H2·H3(랜딩 큰 그림·스플래시). 그림은 굽혀 있다(H3 빼고)
- 2차 주문서 `ASSETS-2.md` — 조작부를 그림으로 더 밀 수 있는 것들(도장 테두리·붓 밑줄·종이 탭·책갈피 리본·찢은 종이·화환 틀·먹 화살·체크 칸·잎 칩)과 D1·D2 다시 뽑기. 지금 조작부는 전부 CSS(먹선·하이라인)로 그려 놓아서 그림이 와야만 되는 건 없다
- 안드로이드 위젯 고르기 화면의 미리보기 PNG(res/drawable-nodpi/widget_preview_*)는 Celestial 로 찍힌 것 그대로 (놓기 전 설정 화면의 미리보기는 실제 화가가 그리므로 Maple 로 나온다)
- H3 스플래시(안드로이드 시작 화면)는 안 붙였다
