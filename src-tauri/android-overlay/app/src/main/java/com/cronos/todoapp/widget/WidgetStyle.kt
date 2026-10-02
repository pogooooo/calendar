package com.cronos.todoapp.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.BitmapShader
import android.graphics.Canvas
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PorterDuff
import android.graphics.PorterDuffColorFilter
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface

/**
 * 위젯 화가(WidgetPainter)가 쓰는 붓 한 벌 — 테마 갈래마다 하나.
 *
 * 위젯의 짜임(줄 목록·주간 띠·월간 격자·게이지)은 갈래가 달라도 같다. 다른 것은 글꼴과 장식이다:
 * Celestial 은 Orbit 글꼴에 마름모·금빛 실선, Maple 은 고운바탕에 잎·먹 하이라인·종이결.
 * 그래서 짜임은 화가 하나가 그리고, 장식은 이 붓이 그린다. 웹의 "공용 View + 갈래별 styles" 와 같은 나눔.
 *
 * 치수는 dp 로 받고, density 는 화가가 만든 붓에 들어 있다.
 */
abstract class WidgetStyle(protected val context: Context, protected val density: Float) {
    /** 제목·머리글 글꼴 */
    abstract val display: Typeface
    /** 숫자만 있는 글(D-12, 눈금 끝 숫자) 글꼴 */
    abstract val numeral: Typeface
    /** 제목의 자간(em). 라틴 대문자 글꼴은 벌리고, 한글 세리프는 좁힌다 */
    abstract val titleSpacing: Float

    protected fun dp(v: Float): Float = v * density

    protected fun stroke(color: Int, widthDp: Float) = Paint(Paint.ANTI_ALIAS_FLAG).apply { this.color = color; style = Paint.Style.STROKE; strokeWidth = dp(widthDp) }
    protected fun fill(color: Int) = Paint(Paint.ANTI_ALIAS_FLAG).apply { this.color = color; style = Paint.Style.FILL }

    /** 바탕: 둥근 네모와 테두리. alphaPct 는 위젯 설정의 바탕 불투명도(20..100) */
    abstract fun frame(c: Canvas, w: Float, h: Float, pal: Palette, alphaPct: Int)
    /** 줄 앞 표식·실선 끝 표식. Celestial 은 마름모, Maple 은 잎 */
    abstract fun bullet(c: Canvas, cx: Float, cy: Float, rDp: Float, color: Int, filled: Boolean, strokeDp: Float = 1f)
    /** ✦ 자리의 작은 문장. 왼쪽 x 와 세로 가운데를 받고, 그린 폭을 돌려준다 */
    abstract fun glyph(c: Canvas, x: Float, cy: Float, sizeDp: Float, color: Int): Float
    /** 오늘 칸 표시 (주간·월간). 숫자 뒤·둘레에 그린다 */
    abstract fun todayMark(c: Canvas, cx: Float, cy: Float, rDp: Float, pal: Palette)
    /** 월 게이지의 바탕 반원 (눈금·바늘은 화가가 얹는다). 눈금 색을 돌려준다 */
    abstract fun gaugeBase(c: Canvas, cx: Float, cy: Float, r: Float, pal: Palette): Int
    /** 날짜 넘김 화살. cx 는 화살 끝(바깥쪽), right 면 오른쪽을 가리킨다 */
    abstract fun dayArrow(c: Canvas, cx: Float, cy: Float, sizeDp: Float, color: Int, right: Boolean)

    companion object {
        fun of(context: Context, family: String, density: Float): WidgetStyle =
            when (family) {
                "maple" -> MapleStyle(context, density)
                "ocean" -> OceanStyle(context, density)
                else -> CelestialStyle(context, density)
            }
    }
}

/** Celestial — 금빛 실선 위의 별자리 */
open class CelestialStyle(context: Context, density: Float) : WidgetStyle(context, density) {
    override val display: Typeface = Fonts.orbit(context)
    override val numeral: Typeface = display
    override val titleSpacing = 0.2f

    override fun frame(c: Canvas, w: Float, h: Float, pal: Palette, alphaPct: Int) {
        val r = dp(WidgetPainter.RADIUS.toFloat())
        val inset = dp(0.5f)
        val rect = RectF(inset, inset, w - inset, h - inset)
        c.drawRoundRect(rect, r, r, fill(Palette.withAlpha(pal.bg, alphaPct / 100f)))
        c.drawRoundRect(rect, r, r, stroke(pal.line, 1f))
        // 귀퉁이 표식 — 앱의 알림 패널과 같은 말
        c.save()
        c.clipPath(Path().apply { addRoundRect(rect, r, r, Path.Direction.CW) })
        c.drawLine(dp(1f), dp(13f), dp(13f), dp(1f), stroke(Palette.withAlpha(pal.gold, 0.9f), 1f))
        c.restore()
    }

    override fun bullet(c: Canvas, cx: Float, cy: Float, rDp: Float, color: Int, filled: Boolean, strokeDp: Float) {
        val r = dp(rDp)
        val path = Path().apply { moveTo(cx, cy - r); lineTo(cx + r, cy); lineTo(cx, cy + r); lineTo(cx - r, cy); close() }
        c.drawPath(path, if (filled) fill(color) else stroke(color, strokeDp))
    }

    override fun glyph(c: Canvas, x: Float, cy: Float, sizeDp: Float, color: Int): Float {
        val p = Paint(Paint.ANTI_ALIAS_FLAG).apply { textSize = dp(sizeDp); this.color = color }
        val fm = p.fontMetrics
        c.drawText("✦", x, cy - (fm.ascent + fm.descent) / 2f, p)
        return p.measureText("✦")
    }

    override fun todayMark(c: Canvas, cx: Float, cy: Float, rDp: Float, pal: Palette) {
        c.drawCircle(cx, cy, dp(rDp), stroke(pal.gold, 1f))
    }

    override fun dayArrow(c: Canvas, cx: Float, cy: Float, sizeDp: Float, color: Int, right: Boolean) {
        // 가는 꺾쇠 하나 — 앱의 달력 앞·뒤와 같은 말
        val s = dp(sizeDp)
        val dir = if (right) -1f else 1f
        val p = stroke(color, 1.2f).apply { strokeCap = Paint.Cap.ROUND; strokeJoin = Paint.Join.ROUND }
        c.drawPath(Path().apply {
            moveTo(cx + dir * s * 0.5f, cy - s * 0.5f)
            lineTo(cx - dir * s * 0.1f, cy)
            lineTo(cx + dir * s * 0.5f, cy + s * 0.5f)
        }, p)
    }

    override fun gaugeBase(c: Canvas, cx: Float, cy: Float, r: Float, pal: Palette): Int {
        val outer = RectF(cx - r, cy - r, cx + r, cy + r)
        c.drawArc(outer, 180f, 180f, false, stroke(Palette.withAlpha(pal.gold, if (pal.dark) 0.5f else 0.7f), 1f))
        val r2 = r * 0.56f
        c.drawArc(RectF(cx - r2, cy - r2, cx + r2, cy + r2), 180f, 180f, false, stroke(Palette.withAlpha(pal.gold, if (pal.dark) 0.28f else 0.4f), 1f))
        return pal.gold
    }
}

/** Maple — 낡은 종이 위의 먹과 잎. 그림은 res/drawable-nodpi 의 maple_* (scripts/maple-assets.mjs 가 굽는다) */
class MapleStyle(context: Context, density: Float) : WidgetStyle(context, density) {
    override val display: Typeface = Fonts.gowun(context)
    override val numeral: Typeface = Fonts.cormorant(context)
    override val titleSpacing = 0.06f

    private fun bmp(name: String): Bitmap? = try {
        val id = context.resources.getIdentifier(name, "drawable", context.packageName)
        if (id == 0) null else BitmapFactory.decodeResource(context.resources, id)
    } catch (e: Throwable) { null }

    private val leafFilled by lazy { bmp("maple_bullet_filled") }
    private val arrowLeft by lazy { bmp("maple_ink_arrow_left") }
    private val arrowRight by lazy { bmp("maple_ink_arrow_right") }
    private val leafOutline by lazy { bmp("maple_bullet_outline") }
    private val crest by lazy { bmp("maple_crest") }
    private val todayLeaf by lazy { bmp("maple_today_marker") }
    private val dial by lazy { bmp("maple_gauge_dial") }
    private val paperLight by lazy { bmp("maple_widget_paper_light") }
    private val paperDark by lazy { bmp("maple_widget_paper_dark") }

    /** 먹 마스크(검정+알파)에 색을 입혀 그린다 */
    private fun tinted(c: Canvas, b: Bitmap?, dst: RectF, color: Int) {
        if (b == null) return
        val p = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG).apply { colorFilter = PorterDuffColorFilter(color, PorterDuff.Mode.SRC_IN) }
        c.drawBitmap(b, null, dst, p)
    }

    override fun frame(c: Canvas, w: Float, h: Float, pal: Palette, alphaPct: Int) {
        // 모서리는 Celestial 과 같이 둔다 — 런처가 위젯을 제 둥근 모서리로 자르므로 더 각지게 그리면 테두리가 잘린다
        val r = dp(WidgetPainter.RADIUS.toFloat())
        val inset = dp(0.5f)
        val rect = RectF(inset, inset, w - inset, h - inset)
        val paper = if (pal.dark) paperDark else paperLight
        // 종이색을 먼저 깔고 그 위에 결(G1·G2)을 얹는다. 밝은 벌의 크라프트 타일은 앱의 크림보다 짙어 70% 만 섞는다
        c.drawRoundRect(rect, r, r, fill(Palette.withAlpha(pal.bg, alphaPct / 100f)))
        if (paper != null) {
            val shader = BitmapShader(paper, Shader.TileMode.MIRROR, Shader.TileMode.MIRROR)
            // 종이 타일은 384px 결을 2배로 구운 768px — 화면 밀도에 맞춰 원래 크기로 깐다
            shader.setLocalMatrix(Matrix().apply { setScale(density / 2f, density / 2f) })
            val mix = if (pal.dark) 1f else 0.7f
            c.drawRoundRect(rect, r, r, Paint(Paint.ANTI_ALIAS_FLAG).apply { this.shader = shader; alpha = (alphaPct * 255 / 100 * mix).toInt().coerceIn(0, 255) })
        }
        // 먹 하이라인 테두리와 그 안쪽의 옅은 선 — 색인 카드의 이중 괘선
        c.drawRoundRect(rect, r, r, stroke(pal.line, 1f))
        val inner = RectF(rect.left + dp(3f), rect.top + dp(3f), rect.right - dp(3f), rect.bottom - dp(3f))
        c.drawRoundRect(inner, r - dp(3f), r - dp(3f), stroke(Palette.withAlpha(pal.ink, 0.12f), 1f))
    }

    override fun bullet(c: Canvas, cx: Float, cy: Float, rDp: Float, color: Int, filled: Boolean, strokeDp: Float) {
        val r = dp(rDp) * 1.35f
        tinted(c, if (filled) leafFilled else leafOutline, RectF(cx - r, cy - r, cx + r, cy + r), color)
    }

    override fun glyph(c: Canvas, x: Float, cy: Float, sizeDp: Float, color: Int): Float {
        val s = dp(sizeDp)
        tinted(c, crest, RectF(x, cy - s / 2f, x + s, cy + s / 2f), color)
        return s
    }

    override fun todayMark(c: Canvas, cx: Float, cy: Float, rDp: Float, pal: Palette) {
        val r = dp(rDp) * 1.5f
        val p = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG).apply { alpha = if (pal.dark) 170 else 255 }
        val b = todayLeaf ?: return c.drawCircle(cx, cy, dp(rDp), stroke(pal.gold, 1f))
        c.drawBitmap(b, null, RectF(cx - r, cy - r, cx + r, cy + r), p)
    }

    override fun dayArrow(c: Canvas, cx: Float, cy: Float, sizeDp: Float, color: Int, right: Boolean) {
        // 먹 화살(J8) — 그림은 가로로 길다(384×91). 자리는 꺾쇠와 같은 폭(sizeDp*2)이라 높이는 비율대로 낮다
        val w = dp(sizeDp) * 2f
        val h = w * 91f / 384f
        val left = if (right) cx - w else cx
        tinted(c, if (right) arrowRight else arrowLeft, RectF(left, cy - h / 2f, left + w, cy + h / 2f), color)
    }

    override fun gaugeBase(c: Canvas, cx: Float, cy: Float, r: Float, pal: Palette): Int {
        val b = dial
        if (b == null) {
            c.drawArc(RectF(cx - r, cy - r, cx + r, cy + r), 180f, 180f, false, stroke(pal.line, 1f))
            return pal.ink
        }
        // 놋쇠판(1024×475)에서 잰 반원: 중심 (512, 452), 가로 반지름 497, 세로 437 — 화가의 반지름 r 에 맞춘다
        val k = r / 497f
        val left = cx - 512f * k
        val top = cy - 452f * k
        val dst = RectF(left, top, left + 1024f * k, top + 475f * k)
        val p = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG).apply { if (pal.dark) alpha = 215 }
        c.drawBitmap(b, null, dst, p)
        return pal.ink
    }

}
