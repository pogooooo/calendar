package com.cronos.todoapp.widget

import android.content.Context
import android.graphics.Canvas
import android.graphics.RectF
import android.graphics.Typeface

/** Quiet home-screen defaults. All geometry and hit targets remain WidgetPainter's. */
class SimpleStyle(context: Context, density: Float, family: String) : WidgetStyle(context, density) {
    private val ornament = WidgetStyle.of(context, family, density)
    override val display: Typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
    override val numeral: Typeface = display
    override val titleSpacing = 0.015f

    override fun frame(c: Canvas, w: Float, h: Float, pal: Palette, alphaPct: Int) {
        val rect = plate(w, h)
        val r = dp(16f)
        c.drawRoundRect(rect, r, r, fill(Palette.withAlpha(pal.bg, alphaPct / 100f)))
        c.drawRoundRect(rect, r, r, stroke(Palette.withAlpha(pal.ink, if (pal.dark) .22f else .16f), .7f))
        // One short material signature, outside the title, date and row hit areas.
        c.drawLine(dp(16f), dp(5f), (w - dp(16f)).coerceAtLeast(dp(16f)), dp(5f),
            stroke(Palette.withAlpha(pal.gold, .75f), 1.3f))
    }
    override fun bullet(c: Canvas, cx: Float, cy: Float, rDp: Float, color: Int, filled: Boolean, strokeDp: Float) {
        c.drawCircle(cx, cy, dp(rDp), if (filled) fill(color) else stroke(color, strokeDp))
    }
    override fun glyph(c: Canvas, x: Float, cy: Float, sizeDp: Float, color: Int): Float =
        ornament.glyph(c, x, cy, sizeDp, color)
    override fun todayMark(c: Canvas, cx: Float, cy: Float, rDp: Float, pal: Palette) {
        val r = dp(rDp)
        c.drawRoundRect(RectF(cx-r, cy-r, cx+r, cy+r), dp(5f), dp(5f), fill(Palette.withAlpha(pal.gold, .13f)))
        c.drawLine(cx-r*.65f, cy+r, cx+r*.65f, cy+r, stroke(pal.goldText, 1.5f))
    }
    override fun gaugeBase(c: Canvas, cx: Float, cy: Float, r: Float, pal: Palette): Int {
        c.drawArc(RectF(cx-r,cy-r,cx+r,cy+r),180f,180f,false,stroke(Palette.withAlpha(pal.ink,.18f),1f))
        return pal.muted
    }
    override fun dayArrow(c: Canvas, cx: Float, cy: Float, sizeDp: Float, color: Int, right: Boolean) =
        ornament.dayArrow(c, cx, cy, sizeDp, color, right)
}
