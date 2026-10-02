package com.cronos.todoapp.widget

import android.graphics.Color

/**
 * 위젯이 쓰는 색 한 벌. 앱 테마(스냅샷의 theme)와 위젯 설정(벌 강제)으로 정한다.
 *
 * Celestial 의 값이 기본이다. 스냅샷에 테마 색이 있으면 그걸 우선 쓴다 —
 * 그래서 앱 쪽에서 테마 색을 바꾸면 위젯도 따라온다. 갈래(family)는 붓(WidgetStyle)을 고른다.
 */
class Palette(
    /** 테마 갈래 — 붓(WidgetStyle)을 고른다 */
    val family: String,
    val dark: Boolean,
    val bg: Int,
    val ink: Int,
    val muted: Int,
    val gold: Int,
    /** 작은 글씨용 금색 — 밝은 바탕에서는 조금 어둡게 눌러야 읽힌다 */
    val goldText: Int,
    val weekend: Int,
) {
    /** 실선·테두리. Celestial 은 금색 55%, Maple 은 먹 35% */
    val line: Int get() = if (family == "maple") withAlpha(ink, 0.35f) else withAlpha(gold, 0.55f)

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
            val gold = c["primary"] ?: (if (dark) 0xFFD9BD78.toInt() else 0xFFD4AF37.toInt())
            return if (dark) Palette(
                family = "celestial",
                dark = true,
                bg = c["background"] ?: 0xFF121725.toInt(),
                ink = c["text"] ?: 0xFFF0EDE5.toInt(),
                muted = c["textSecondary"] ?: 0xFFA5AABD.toInt(),
                gold = gold,
                goldText = gold,
                weekend = c["weekend"] ?: 0xFFD98A8E.toInt(),
            ) else Palette(
                family = "celestial",
                dark = false,
                bg = c["background"] ?: 0xFFFAF8F2.toInt(),
                ink = c["text"] ?: 0xFF292D3B.toInt(),
                muted = c["textSecondary"] ?: 0xFF626577.toInt(),
                gold = gold,
                goldText = blend(gold, Color.BLACK, 0.14f),
                weekend = c["weekend"] ?: 0xFFC4696E.toInt(),
            )
        }

        /** Maple — 앱의 Maple 팔레트와 같은 색. 여기서 gold 는 "강조색" 자리이고 값은 단풍 붉음이다 */
        fun maple(dark: Boolean, spec: Snapshot.ThemeSpec?): Palette {
            val c = if (spec != null && (spec.mode == "dark") == dark) spec.colors else emptyMap()
            val red = c["primary"] ?: (if (dark) 0xFFD8703F.toInt() else 0xFFB5432B.toInt())
            return if (dark) Palette(
                family = "maple",
                dark = true,
                bg = c["background"] ?: 0xFF1F1612.toInt(),
                ink = c["text"] ?: 0xFFEFE3D0.toInt(),
                muted = c["textSecondary"] ?: 0xFFA08C78.toInt(),
                gold = red,
                goldText = red,
                weekend = c["weekend"] ?: 0xFFD98A8E.toInt(),
            ) else Palette(
                family = "maple",
                dark = false,
                bg = c["background"] ?: 0xFFF4EADB.toInt(),
                ink = c["text"] ?: 0xFF3B2A20.toInt(),
                muted = c["textSecondary"] ?: 0xFF7C6656.toInt(),
                gold = red,
                goldText = red,
                weekend = c["weekend"] ?: 0xFFA24A5B.toInt(),
            )
        }

        /** 스냅샷의 갈래로 색 벌을 고른다 */
        fun of(family: String?, dark: Boolean, spec: Snapshot.ThemeSpec?): Palette =
            when (family) {
                "maple" -> maple(dark, spec)
                "ocean" -> ocean(dark, spec)
                else -> celestial(dark, spec)
            }

        fun ocean(dark: Boolean, spec: Snapshot.ThemeSpec?): Palette {
            val c = if (spec != null && (spec.mode == "dark") == dark) spec.colors else emptyMap()
            val accent = c["primary"] ?: if (dark) 0xFF70D9D0.toInt() else 0xFF147F87.toInt()
            return Palette(
                family = "ocean", dark = dark,
                bg = c["background"] ?: if (dark) 0xFF081F2C.toInt() else 0xFFEEF7F6.toInt(),
                ink = c["text"] ?: if (dark) 0xFFE4F6F5.toInt() else 0xFF183E4B.toInt(),
                muted = c["textSecondary"] ?: if (dark) 0xFF96C0CA.toInt() else 0xFF52717E.toInt(),
                gold = accent, goldText = accent,
                weekend = c["weekend"] ?: if (dark) 0xFFEF9D88.toInt() else 0xFFBD6767.toInt(),
            )
        }

        /** 위젯 설정의 벌(app/light/dark)과 스냅샷의 테마로 색을 고른다 */
        fun resolve(spec: Snapshot.ThemeSpec?, mode: String): Palette {
            val dark = when (mode) {
                "light" -> false
                "dark" -> true
                else -> spec?.mode == "dark"
            }
            return of(spec?.family, dark, spec)
        }
    }
}
