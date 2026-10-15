# 위젯에 동봉한 글꼴 (전부 SIL OFL 1.1)

| 파일 | 쓰는 곳 | 비고 |
|---|---|---|
| Orbit-Regular.ttf | Celestial 위젯의 제목·숫자 | Google Fonts 원본 그대로 |
| GowunBatang-Regular.ttf | Maple 위젯의 제목 (굵게는 안드로이드가 지어 낸다) | **부분집합**: KS X 1001 한글 2,350자 + 라틴 + 문장 부호. 원본(8.4MB)은 APK 에 싣기 커서 `subset-font`(harfbuzz) 로 1.4MB 로 줄였다. 위젯은 머리글·숫자만 그리므로 빠진 글자는 시스템 글꼴로 떨어진다 |

부분집합을 다시 만들려면: 원본 TTF 를 `github.com/google/fonts` 의 `ofl/gowunbatang` 에서 받아
`subset-font` 로 같은 글자 집합(라틴 0x20~0x7E, 호환 자모 0x3131~0x318E, EUC-KR B0A1~C8FE 의 한글)을 남긴다.

(Cormorant Garamond 는 2026-10-15 Maple 을 다시 그리며 뺐다 — 위젯의 숫자는 이제 시스템 산세리프 굵게.)
