package com.cronos.todoapp.widget

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RadialGradient
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin

/** A quiet mineral surface with cut edges and champagne settings, drawn at the widget's real size. */
class GemStyle(context: Context, density: Float) : WidgetStyle(context, density) {
    override val display: Typeface = Fonts.gowun(context)
    override val numeral: Typeface = Typeface.create("serif", Typeface.NORMAL)
    override val titleSpacing = 0.03f

    private fun cut(cx: Float, cy: Float, rx: Float, ry: Float) = Path().apply {
        moveTo(cx - rx * .5f, cy - ry); lineTo(cx + rx * .5f, cy - ry)
        lineTo(cx + rx, cy - ry * .45f); lineTo(cx + rx, cy + ry * .45f)
        lineTo(cx + rx * .5f, cy + ry); lineTo(cx - rx * .5f, cy + ry)
        lineTo(cx - rx, cy + ry * .45f); lineTo(cx - rx, cy - ry * .45f); close()
    }

    override fun frame(c: Canvas, w: Float, h: Float, pal: Palette, alphaPct: Int) {
        val rect = plate(w, h)
        val radius = dp(WidgetPainter.RADIUS.toFloat())
        val alpha = alphaPct / 100f
        c.drawRoundRect(rect, radius, radius, fill(Palette.withAlpha(pal.bg, alpha)))
        c.save(); c.clipPath(rounded(rect, radius))
        val glow = fill(Color.WHITE).apply {
            shader = RadialGradient(w * .94f, h * .12f, maxOf(w, h) * .8f,
                Palette.withAlpha(pal.gemColor, .22f * alpha), Color.TRANSPARENT, Shader.TileMode.CLAMP)
        }
        c.drawRect(rect, glow)
        // Mineral ribbons stay at the edge, leaving dense monthly/weekly data clear.
        val ribbon = Path().apply {
            moveTo(w * .76f, -dp(8f)); cubicTo(w * .54f, h * .28f, w * 1.14f, h * .42f, w * .83f, h * .72f)
            cubicTo(w * .71f, h * .86f, w * .92f, h * .98f, w * .84f, h + dp(6f))
        }
        c.drawPath(ribbon, stroke(Palette.withAlpha(pal.gemColor, (if (busy) .04f else .09f) * alpha), 22f))
        c.drawPath(ribbon, stroke(Palette.withAlpha(pal.metal, (if (busy) .10f else .22f) * alpha), .7f))
        c.restore()
        c.drawRoundRect(rect, radius, radius, stroke(Palette.withAlpha(pal.metal, .5f), .8f))
        val inset = dp(4f)
        c.drawRoundRect(RectF(rect.left + inset, rect.top + inset, rect.right - inset, rect.bottom - inset),
            radius - inset, radius - inset, stroke(Palette.withAlpha(pal.metal, .15f), .6f))
        if (w > dp(120f)) stone(c, w / 2, dp(5f), dp(3.2f), pal.gemColor, pal.metal)
    }

    private fun stone(c: Canvas, cx: Float, cy: Float, r: Float, color: Int, metal: Int) {
        val shape = cut(cx, cy, r * .72f, r)
        val body = fill(color).apply {
            shader = LinearGradient(cx - r, cy - r, cx + r, cy + r,
                intArrayOf(Color.WHITE, color, Palette.withAlpha(Color.BLACK, .7f)), floatArrayOf(0f, .42f, 1f), Shader.TileMode.CLAMP)
        }
        c.drawPath(shape, body)
        c.drawPath(shape, stroke(metal, .65f))
        c.drawPath(cut(cx, cy, r * .33f, r * .47f), stroke(Palette.withAlpha(Color.WHITE, .45f), .45f))
    }

    override fun bullet(c: Canvas, cx: Float, cy: Float, rDp: Float, color: Int, filled: Boolean, strokeDp: Float) {
        val r = dp(rDp)
        c.drawPath(cut(cx, cy, r * .72f, r), if (filled) fill(color) else stroke(color, strokeDp))
    }

    override fun glyph(c: Canvas, x: Float, cy: Float, sizeDp: Float, color: Int): Float {
        val size = dp(sizeDp)
        stone(c, x + size / 2, cy, size / 2, color, color)
        return size
    }

    override fun todayMark(c: Canvas, cx: Float, cy: Float, rDp: Float, pal: Palette) {
        val r = dp(rDp)
        // Monthly cells reserve the row below the numeral for event dots or a title.
        val ry = if (kind == "month") min(r, dp(7.2f)) else r
        val bezel = cut(cx, cy, r * .92f, ry)
        c.drawPath(bezel, fill(Palette.withAlpha(pal.gemColor, .13f)))
        c.drawPath(bezel, stroke(Palette.withAlpha(pal.metal, .85f), .85f))
        // Keep the setting inside the date bezel: the monthly event dots sit at cy + 10dp.
        // A lower pendant occupied that same row and looked like an extra calendar event.
        val glint = Path().apply {
            moveTo(cx - r * .92f, cy - ry * .45f)
            lineTo(cx - r * .46f, cy - ry)
            lineTo(cx, cy - ry)
        }
        c.drawPath(glint, stroke(pal.metal, 1.2f).apply {
            strokeCap = Paint.Cap.ROUND
            strokeJoin = Paint.Join.ROUND
        })
    }

    override fun gaugeBase(c: Canvas, cx: Float, cy: Float, r: Float, pal: Palette): Int {
        c.drawArc(RectF(cx - r, cy - r, cx + r, cy + r), 180f, 180f, false, stroke(Palette.withAlpha(pal.metal, .45f), .8f))
        for (i in 0..8) {
            val angle = PI + PI * i / 8
            val x = cx + cos(angle).toFloat() * r
            val y = cy + sin(angle).toFloat() * r
            stone(c, x, y, min(dp(2.3f), r * .03f), pal.gemColor, pal.metal)
        }
        return pal.gold
    }

    override fun dayArrow(c: Canvas, cx: Float, cy: Float, sizeDp: Float, color: Int, right: Boolean) {
        val size = dp(sizeDp); val direction = if (right) -1f else 1f
        c.drawPath(Path().apply {
            moveTo(cx + direction * size * .55f, cy - size * .45f)
            lineTo(cx, cy); lineTo(cx + direction * size * .55f, cy + size * .45f)
        }, stroke(color, 1.1f).apply { strokeCap = Paint.Cap.ROUND; strokeJoin = Paint.Join.ROUND })
    }
}
