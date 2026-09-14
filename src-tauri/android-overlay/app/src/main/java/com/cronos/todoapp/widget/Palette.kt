package com.cronos.todoapp.widget

import android.graphics.Color

/**
 * 위젯이 쓰는 색 한 벌. 앱 테마(스냅샷의 theme)와 위젯 설정(벌 강제)으로 정한다.
 *
 * Celestial 의 값이 기본이다. 스냅샷에 테마 색이 있으면 그걸 우선 쓴다 —
 * 그래서 앱 쪽에서 테마 색을 바꾸면 위젯도 따라온다. 갈래(family)가 다르면
 * 화가(Painter)가 달라지지만, 지금은 Celestial 하나다.
 */
class Palette(
    val dark: Boolean,
    val bg: Int,
    val ink: Int,
    val muted: Int,
    val gold: Int,
    /** 작은 글씨용 금색 — 밝은 바탕에서는 조금 어둡게 눌러야 읽힌다 */
    val goldText: Int,
    val weekend: Int,
) {
    /** 실선·테두리: 금색 55% */
    val line: Int get() = withAlpha(gold, 0.55f)

    companion object {
        fun withAlpha(color: Int, a: Float): Int = (color and 0x00FFFFFF) or ((a.coerceIn(0f, 1f) * 255).toInt() shl 24)

        private fun blend(c: Int, to: Int, t: Float): Int {
            val r = Color.red(c) + (Color.red(to) - Color.red(c)) * t
            val g = Color.green(c) + (Color.green(to) - Color.green(c)) * t
            val b = Color.blue(c) + (Color.blue(to) - Color.blue(c)) * t
            return Color.rgb(r.toInt(), g.toInt(), b.toInt())
        }

        fun celestial(dark: Boolean, spec: Snapshot.ThemeSpec?): Palette {
            // 앱 테마의 색은 그 벌(밝음/어두움)일 때만 쓴다 — 위젯 설정으로 다른 벌을 강제하면 기본색으로
            val c = if (spec != null && (spec.mode == "dark") == dark) spec.colors else emptyMap()
            val gold = c["primary"] ?: 0xFFD4AF37.toInt()
            return if (dark) Palette(
                dark = true,
                bg = c["background"] ?: 0xFF111111.toInt(),
                ink = c["text"] ?: 0xFFE8E8E8.toInt(),
                muted = c["textSecondary"] ?: 0xFF8E8E8E.toInt(),
                gold = gold,
                goldText = gold,
                weekend = c["weekend"] ?: 0xFFD98A8E.toInt(),
            ) else Palette(
                dark = false,
                bg = c["background"] ?: 0xFFFFFFFF.toInt(),
                ink = c["text"] ?: 0xFF2E2E2E.toInt(),
                muted = c["textSecondary"] ?: 0xFF7A7A7A.toInt(),
                gold = gold,
                goldText = blend(gold, Color.BLACK, 0.14f),
                weekend = c["weekend"] ?: 0xFFC4696E.toInt(),
            )
        }

        /** 위젯 설정의 벌(app/light/dark)과 스냅샷의 테마로 색을 고른다 */
        fun resolve(spec: Snapshot.ThemeSpec?, mode: String): Palette {
            val dark = when (mode) {
                "light" -> false
                "dark" -> true
                else -> spec?.mode == "dark"
            }
            return celestial(dark, spec)
        }
    }
}
