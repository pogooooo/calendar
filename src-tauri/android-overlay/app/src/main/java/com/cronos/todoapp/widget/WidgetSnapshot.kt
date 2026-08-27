package com.cronos.todoapp.widget

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.os.Handler
import android.os.Looper
import android.webkit.WebView
import android.webkit.WebViewClient

/**
 * 홈 위젯은 WebView 를 담을 수 없고 이미지만 받는다.
 * 그래서 앱 프로세스에서 화면 밖 WebView 에 위젯 라우트를 그려 비트맵으로 뜬 뒤 그 그림을 넘긴다.
 * 이렇게 하면 위젯 UI 를 네이티브로 다시 그리지 않아도 앱과 완전히 같은 화면이 나온다.
 */
object WidgetSnapshot {

    fun render(
        context: Context,
        url: String,
        widthPx: Int,
        heightPx: Int,
        settleMs: Long = 1200L,
        onReady: (Bitmap?) -> Unit,
    ) {
        Handler(Looper.getMainLooper()).post {
            val web = WebView(context)

            web.settings.javaScriptEnabled = true
            web.settings.domStorageEnabled = true
            web.settings.databaseEnabled = true
            web.settings.loadWithOverviewMode = false
            web.settings.useWideViewPort = false
            web.setBackgroundColor(android.graphics.Color.TRANSPARENT)

            web.layout(0, 0, widthPx, heightPx)
            web.measure(
                android.view.View.MeasureSpec.makeMeasureSpec(widthPx, android.view.View.MeasureSpec.EXACTLY),
                android.view.View.MeasureSpec.makeMeasureSpec(heightPx, android.view.View.MeasureSpec.EXACTLY),
            )

            web.webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView, finishedUrl: String) {
                    // 데이터를 받아 그리는 데 시간이 걸리므로 한 박자 쉬고 찍는다
                    Handler(Looper.getMainLooper()).postDelayed({
                        val bitmap = try {
                            Bitmap.createBitmap(widthPx, heightPx, Bitmap.Config.ARGB_8888).also {
                                view.draw(Canvas(it))
                            }
                        } catch (e: Throwable) {
                            null
                        }

                        view.destroy()
                        onReady(bitmap)
                    }, settleMs)
                }
            }

            web.loadUrl(url)
        }
    }
}
