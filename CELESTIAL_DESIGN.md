# Celestial Design System

## 개요

Celestial은 황금색 포인트와 클래식한 타이포그래피를 기반으로 한 테마입니다. 천문학적이고 고풍스러운 분위기를 통해 고급스러운 느낌을 줍니다. 라이트 / 다크 두 가지 모드를 지원합니다.

---

## 색상 팔레트

### Light 모드

| 역할 | 토큰 | 값 |
|---|---|---|
| Background | `colors.background` | `#FFFFFF` |
| Surface | `colors.surface` | `#F9F9F9` |
| Primary (Gold) | `colors.primary` | `#D4AF37` |
| Accent | `colors.accent` | `#FAE7B5` |
| Text | `colors.text` | `#2E2E2E` |
| Text Secondary | `colors.textSecondary` | `#7A7A7A` |
| Border | `colors.border` | `#EAEAEA` |
| Success | `colors.success` | `#4E8A6D` |
| Error | `colors.error` | `#A13D4B` |

### Dark 모드

| 역할 | 토큰 | 값 |
|---|---|---|
| Background | `colors.background` | `#111111` |
| Surface | `colors.surface` | `#1A1A1A` |
| Primary (Gold) | `colors.primary` | `#D4AF37` |
| Accent | `colors.accent` | `#FAE7B5` |
| Text | `colors.text` | `#E8E8E8` |
| Text Secondary | `colors.textSecondary` | `#888888` |
| Border | `colors.border` | `#2A2A2A` |
| Success | `colors.success` | `#4E8A6D` |
| Error | `colors.error` | `#A13D4B` |

> Primary 골드(`#D4AF37`)는 라이트/다크 모두 동일합니다.

---

## 타이포그래피

| 역할 | 폰트 | 토큰 |
|---|---|---|
| 제목, 레이블, 버튼 | Orbit (serif) | `fonts.celestial` |
| 본문, 입력, 설명 | Inter (sans-serif) | `fonts.body` |

### 자간 (letter-spacing)

- 페이지 헤더: `3px`
- 섹션 제목: `2px`
- 네비게이션 타이틀: `2.5px`
- 버튼 텍스트: `1.5px`
- 테마 레이블: `1px`
- 폼 레이블: `0.3px`

---

## 테두리 & 모서리

### 원칙

Celestial은 **직각(0px border-radius)**을 기본으로 합니다. 모든 컨테이너, 버튼, 입력창은 모서리를 자르지 않습니다.

```
SectionTitle: border-radius 없음
SectionBody:  border-radius 없음
FormInput:    border-radius 없음
FormButton:   border-radius 없음
ThemeCard:    border-radius 없음
CheckMark:    border-radius 없음
```

### 테두리 색상

모든 선에는 `colors.primary` (골드)를 사용합니다. 강도 변형은 알파값으로 표현합니다.

```
기본 선:     colors.primary          (100%)
반투명 선:   colors.primary + "55"  (33%)
호버 배경:   colors.primary + "1A"  (10%)
선택 배경:   colors.primary + "12"  (7%)
```

---

## 레이아웃 패턴

### 섹션 구조

섹션 제목과 본문은 분리된 박스로, 제목의 하단 테두리가 제거되어 시각적으로 연결됩니다.

```
┌─────────────────────────┐  ← SectionTitle: border 1px solid gold, border-bottom: none
│  SECTION TITLE          │    font: Orbit, letter-spacing: 2px
└─────────────────────────┘
┌─────────────────────────┐  ← SectionBody: border 1px solid gold
│  내용                    │    padding: 20px 24px
└─────────────────────────┘
```

### 페이지 헤더

제목 텍스트 옆에 골드 수평선이 뻗어나가는 패턴입니다.

```
TITLE ────────────────────────
       ← hr: border-top 1px solid gold, flex: 1
```

### 구분선 (DateHeader / InfoRow)

콘텐츠 사이 구분은 `border-bottom: 1px solid colors.primary`로 처리합니다. 마지막 항목은 `&:last-child { border-bottom: none }`.

---

## 컴포넌트

### 버튼 (FormButton)

```
border:      1px solid colors.primary
background:  transparent
font-family: Orbit
letter-spacing: 1.5px
border-radius: 없음

hover: background colors.primary + "15"
disabled: opacity 0.35
```

Danger 변형:
```
border: 1px solid #e57373
color:  #e57373
hover:  background #e5737318
```

### 입력창 (FormInput)

```
border:        1px solid colors.primary
background:    transparent
border-radius: 없음
padding:       9px 12px

focus: box-shadow 0 0 0 2px colors.primary + "30"
```

### 체크마크 (CheckMark)

```
width:            18px
height:           18px
border-radius:    없음 (정사각형)
background:       colors.primary
color:            colors.surface
border:           1px solid colors.primary
```

### 상태 메시지 (StatusMessage)

성공/에러 메시지는 왼쪽 2px 골드/레드 라인으로 표시합니다. 배경색 없음.

```
success: border-left 2px solid #4caf50
error:   border-left 2px solid #e57373
```

### 모드 토글 버튼 그룹 (ModeButtonGroup)

버튼들을 `border: 1px solid primary`로 감싼 인라인 그룹. 활성 버튼은 배경이 primary로 채워지고 텍스트는 surface색.

```
그룹: border 1px solid primary, display flex
버튼: 구분선 border-right 1px solid primary, 마지막 제거
활성: background primary, color surface
비활성: background transparent, color primary
```

### 리사이저 핸들

패널 분할선은 3px 두께의 골드 반투명 선으로, 호버 시 불투명해집니다.

```
.handle:        width/height 3px, background primary + "55"
.handle:hover:  background primary
```

---

## 글래스모피즘 (위젯)

위젯 패널은 배경 이미지 위에 반투명 레이어로 표현됩니다.

- `backdrop-filter: blur(Npx)` — 블러 강도 조절 가능
- `background: rgba(R,G,B, opacity)` — 배경색 + 투명도 조절 가능
- 광택(Gloss): `::before` 위 반투명 흰 그라디언트 오버레이
- 텍스트 자동 색상: 배경 밝기를 계산해 흰/검 자동 전환

---

## 네비게이션 사이드바 (NavItem)

활성 항목은 왼쪽 2px 골드 라인 + 골드 텍스트. 비활성은 투명 라인 + secondary 텍스트.

```
border-left: 2px solid (active ? primary : transparent)
color:        (active ? primary : textSecondary)
font-size:    0.8rem
```

---

## 다크 모드 전환

테마 이름이 `celestial-dark`이면 다크 팔레트를 적용합니다. Primary 골드는 동일하게 유지되어 라이트/다크 모두 황금색 포인트를 유지합니다.

```ts
if (themeName.startsWith('celestial')) // celestial, celestial-dark 모두 해당
```

---

## 스크롤바

모든 Celestial 컴포넌트에서 통일된 골드 스크롤바를 사용합니다.

```
width:            4px
thumb background: colors.primary + "80"  (50% opacity)
border-radius:    2px
track:            transparent
```

---

## 글로우 이펙트

컴포넌트별로 `filter: drop-shadow` 또는 `box-shadow`로 골드 발광 효과를 줍니다.

| 위치 | 스타일 |
|---|---|
| 오늘 날짜 숫자 (타임라인) | `filter: drop-shadow(0 0 4px primary80)` |
| 오늘 열 강조 (주간 달력) | `box-shadow: 0 0 5px 0.5px primary` |
| 화살표 버튼 호버 | `filter: drop-shadow(0 0 3px primary)` |
| 완료 TodoBar | `box-shadow: 0 0 5px 1px primary` |
| FormInput 포커스 | `box-shadow: 0 0 0 2px primary30` |
| 인라인 팝업 모달 | `box-shadow: 0 8px 30px rgba(0,0,0,0.15), 0 0 20px primary22` |

---

## 캘린더 공통 패턴

### 헤더 코너 데코레이터

주간/월간 캘린더 그리드 헤더 좌상단에 골드 대각선 삼각형을 `::after`로 그립니다.

```css
Header::after {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 25px; height: 25px;
  background: linear-gradient(315deg,
    transparent 49%,
    colors.primary 50%,
    transparent 51%
  );
}
```

### 오늘 강조 — 주간 달력 (열 전체)

오늘 날짜 열은 `::before`로 헤더를 포함한 전체 높이를 덮어씌운 후 골드 광선을 추가합니다.

```css
DayNameBox[isToday]::before {
  content: '';
  position: absolute;
  left: -1px;
  width: calc(100% + 2px);
  height: calc(100% + 182px);
  background: colors.primary + "0D";
  box-shadow: 0 0 5px 0.5px colors.primary;
  pointer-events: none;
}
```

### 오늘 강조 — 월간 달력 (셀 내부 테두리)

오늘 날짜 셀에 안쪽에서 밀고 들어오는 골드 테두리를 `::after`로 표현합니다.

```css
DayCell[isToday]::after {
  content: '';
  position: absolute; inset: 0;
  box-shadow: inset 0 0 0 2px colors.primary;
  pointer-events: none;
}
```

### StickerSlot (스티커 행)

오늘 날짜 슬롯은 아주 연한 골드 배경으로 구분합니다.

```
StickerSlot[isToday]: background colors.primary + "0D"
StickerSlot 기본:     background transparent
```

### 화살표 버튼 호버

좌우 이동 화살표에 호버 시 골드 drop-shadow를 적용합니다.

```
ArrowWrapper:hover { filter: drop-shadow(0 0 3px colors.primary) }
```

### AnimatedDateText (날짜 텍스트 애니메이션)

날짜 텍스트를 문자 단위로 나눠 개별 애니메이션을 적용합니다. 각 문자는 `DateCharWrapper`로 감싸며 고정 폭을 가집니다.

```
DateCharWrapper: display inline-block
일반 문자:       width 0.65em (정렬 일관성 유지)
공백/점/대시:    width auto
```

---

## 일간 달력 (DayCalendar)

### BaseCard

카드 형태 패널의 기본 구조입니다.

```
border:              1px solid colors.primary
.card-header:        border-bottom 1px solid colors.primary
.card-header 타이포: font-family Orbit, letter-spacing 1.5px
```

### TimeRow 슬롯 그리드

시간대 구분선은 점선으로 처리합니다.

```
.slot-box (시간 슬롯): border-right 1px dashed primary40
.slot-bar-container:   padding 2px 4px, overflow hidden
```

### SlotTodoItem (시간 배정 할 일)

골드로 채운 할 일 블록.

```
background: colors.primary
color:      colors.surface
```

### TaskItem 체크박스

```
width:  16px; height: 16px
border: 1px solid colors.primary
border-radius: 3px

done: background colors.primary, color colors.surface
```

### TaskForm 입력창 (인라인 추가)

```
border:        1px solid primary55
border-radius: 4px
focus:         border-color primary (100%)
```

### 리사이저 점 패턴 (Dots)

패널 분할 리사이저에 4px 원형 점들을 배치합니다. (기존 문서의 3px 선 패턴과 별개)

```css
span {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: colors.primary + "50";
}
span:hover { transform: scale(1.3) }
```

### AddTodoButton (할 일 추가 버튼)

기본 숨김 상태, 부모 호버 시 표시됩니다.

```
border-radius: 20%
opacity:       0 (기본)
parent:hover → opacity 1
:hover        → transform scale(1.1)
```

---

## 할 일 바 (Todo Bar)

### 일간 달력 — 전체 테두리

```
border:     1px solid colors.primary (상하좌우 모두)
background: transparent
```

### 월간 달력 — 상하 테두리만

멀티데이 이벤트가 셀 경계를 넘어 이어지므로 좌우 테두리 없이 표현합니다.

```
border-top:    1px solid colors.primary
border-bottom: 1px solid colors.primary
border-left:   none (이어지는 경우)
border-right:  none (이어지는 경우)
background:    transparent

시작 셀: border-left 1px solid colors.primary
끝 셀:   border-right 1px solid colors.primary
완료:     box-shadow 0 0 5px 1px colors.primary (glow, clip-path로 범위 한정)
```

---

## 모달 시스템

### Overlay

```
background:      rgba(0, 0, 0, 0.45)
backdrop-filter: blur(4px)
```

### BaseModal Container

```
border-radius: 5px
border:        1px solid colors.primary
box-shadow:    0 10px 30px rgba(0, 0, 0, 0.5)
background:    colors.surface
```

### 인라인 팝업 모달 (주간 달력 "더보기")

작은 이벤트 목록 팝업. 골드 glow 포함.

```
border-radius: 12px
border:        1px solid primary80
box-shadow:    0 8px 30px rgba(0,0,0,0.15), 0 0 20px primary22
background:    colors.surface
```

### ModalHeader (모달 헤더 영역)

```
background:    colors.primary + "0D"
border-bottom: 1px solid primary33
```

### CloseButton (모달 닫기)

```
기본:   background transparent
hover:  background primary22, border-radius 50%
```

---

## 투두 모달 (TodoModal)

### Accent 색상 하위 시스템

TodoModal은 필드 경계에 `colors.primary` 대신 `colors.accent`를 사용합니다.

| 상태 | 색상 |
|---|---|
| 기본 테두리 | `accent33` |
| 호버 테두리 | `accent40` |
| 선택/포커스 테두리 | `accent66` |
| 배경 틴트 | `accent11` |
| 활성화 요소 | `colors.primary` |

### ToggleSwitch

```
border-radius: 24px  (알약 형태)
background:    colors.accent  (비활성)
              → colors.primary  (활성)
transition:    background 0.2s
```

### RepeatConditionBox (반복 조건 박스)

```
background: colors.accent + "11"
border:     1px solid accent33
```

### 숫자 입력창 (반복 횟수 등)

```
border-bottom: 1px solid primary66  (밑줄 스타일만)
border-radius: 없음
background:    transparent
text-align:    center
```

### Footer

```
border-top: 1px solid accent40
```

---

## 프로젝트 타임라인 (ProjectTimeline)

### SectionTitle

섹션 제목 행에 연한 골드 배경을 줍니다.

```
background:  colors.primary + "11"
font-family: Orbit
```

### 수직 기준선 (TimelineVerticalLine)

```
border-right: 1px dashed primary22
```

### 오늘 날짜 숫자 (DateNumber)

```
[isToday]: filter: drop-shadow(0 0 4px primary80)
```

### TaskNode 상태

| 상태 | 스타일 |
|---|---|
| 활성 | `background primary99; border 1px solid primary; color background; cursor grab` |
| 완료 | `background primary33; border 1px solid primary66; color textSecondary; text-decoration line-through` |
| 호버 | `background primary (완전 채움)` |

### TaskResizeHandle

```
기본:   background transparent
hover:  background rgba(255,255,255,0.4)
```

### DependencyLine (의존성 연결선 SVG)

```
stroke:       colors.primary
stroke-width: 1.5
opacity:      0.8
```

---

## 드롭다운 (Dropdown)

### 헤더 테두리

```
border:      1px solid primary55
hover:       border-color primary (100%)
font-family: Orbit
```

### 선택된 항목

NavItem과 동일한 왼쪽 2px 라인 패턴을 사용합니다.

```
selected: background primary22; border-left 2px solid primary
기본:     border-left 2px solid transparent
```

---

## 챌린지 리스트 (ChallengeList)

### ProgressBar (진행률 바)

```
track: background primary33; border-radius 3px
fill:  background catColor (카테고리 색상); border-radius 3px
```

### 메타 정보 (.meta)

챌린지 행의 날짜/반복 횟수 등 보조 정보는 Orbit 폰트를 사용합니다.

```
font-family: Orbit
font-size:   0.75rem
color:       colors.textSecondary
```

---

## border-radius 예외 목록

Celestial은 기본적으로 직각을 원칙으로 하지만, 아래 경우에만 예외를 둡니다.

| 컴포넌트 | 값 | 이유 |
|---|---|---|
| BaseModal Container | `5px` | 모달 외곽 softening |
| 인라인 팝업 모달 | `12px` | 작은 floating UI |
| ToggleSwitch | `24px` | 알약 형태 필수 |
| TaskItem 체크박스 | `3px` | 체크박스 미세 softening |
| TaskForm 입력창 | `4px` | 인라인 폼 |
| ProgressBar | `3px` | 바 형태 |
| ResizeDots span | `50%` | 원형 점 |
| CloseButton hover | `50%` | 원형 호버 영역 |
| 스크롤바 thumb | `2px` | OS 스타일 유지 |
