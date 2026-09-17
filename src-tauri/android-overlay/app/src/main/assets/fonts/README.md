# 위젯에 동봉한 글꼴 (전부 SIL OFL 1.1)

| 파일 | 쓰는 곳 | 비고 |
|---|---|---|
| Orbit-Regular.ttf | Celestial 위젯의 제목·숫자 | Google Fonts 원본 그대로 |
| GowunBatang-Regular.ttf | Maple 위젯의 제목 | **부분집합**: KS X 1001 한글 2,350자 + 라틴 + 문장 부호. 원본(8.4MB)은 APK 에 싣기 커서 `subset-font`(harfbuzz) 로 1.4MB 로 줄였다. 위젯은 머리글·숫자만 그리므로 빠진 글자는 시스템 글꼴로 떨어진다 |
| CormorantGaramond.ttf | Maple 위젯의 D-day·눈금 숫자 | 가변 글꼴에서 라틴만 남긴 부분집합 (120KB) |

부분집합을 다시 만들려면: 원본 TTF 를 `github.com/google/fonts` 의 `ofl/gowunbatang`·`ofl/cormorantgaramond` 에서 받아
`subset-font` 로 같은 글자 집합(라틴 0x20~0x7E, 호환 자모 0x3131~0x318E, EUC-KR B0A1~C8FE 의 한글)을 남긴다.
