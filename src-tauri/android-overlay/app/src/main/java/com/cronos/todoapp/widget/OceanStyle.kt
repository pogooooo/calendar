package com.cronos.todoapp.widget

import android.content.Context
import android.graphics.Canvas
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Typeface

/** Android home widgets use a static coastal accent, without a battery-draining loop. */
class OceanStyle(context: Context, density: Float) : CelestialStyle(context, density) {
    override val display: Typeface = Typeface.create("sans-serif", Typeface.NORMAL)
    override val numeral: Typeface = display
    override val titleSpacing = 0.05f

    override fun frame(c: Canvas, w: Float, h: Float, pal: Palette, alphaPct: Int) {
        val inset = dp(0.5f)
        val rect = RectF(inset, inset, w-inset, h-inset)
        val r = dp(WidgetPainter.RADIUS.toFloat())
        c.drawRoundRect(rect, r, r, fill(Palette.withAlpha(pal.bg, alphaPct / 100f)))
        c.drawRoundRect(rect, r, r, stroke(Palette.withAlpha(pal.gold, 0.3f), 1f))
        val x = w-dp(34f)
        val y = h-dp(8f)
        c.drawPath(Path().apply {
            moveTo(x, y)
            quadTo(x+dp(6f), y-dp(4f), x+dp(12f), y)
            quadTo(x+dp(18f), y+dp(4f), x+dp(24f), y)
        }, stroke(Palette.withAlpha(pal.gold, 0.2f), 1f))
    }

    override fun bullet(c: Canvas, cx: Float, cy: Float, rDp: Float, color: Int, filled: Boolean, strokeDp: Float) {
        val r = dp(rDp)
        val p = Path().apply {
            moveTo(cx,cy+r)
            lineTo(cx-r,cy-r*0.25f)
            cubicTo(cx-r*1.2f,cy-r,cx+r*1.2f,cy-r,cx+r,cy-r*0.25f)
            close()
        }
        c.drawPath(p, if (filled) fill(color) else stroke(color,strokeDp))
    }

    override fun glyph(c: Canvas, x: Float, cy: Float, sizeDp: Float, color: Int): Float {
        val width = dp(sizeDp)
        bullet(c,x+width/2f,cy,sizeDp/2f,color,false,0.8f)
        c.drawLine(x+width/2f,cy-width/3f,x+width/2f,cy+width/2f,stroke(color,0.6f))
        return width
    }
}
