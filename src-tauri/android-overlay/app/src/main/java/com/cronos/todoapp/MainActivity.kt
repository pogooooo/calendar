package com.cronos.todoapp

import android.content.Intent
import android.os.Bundle
import android.os.FileObserver
import android.util.Log
import android.view.ViewGroup
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.core.graphics.Insets
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.webkit.ScriptHandler
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import com.cronos.todoapp.widget.CronosWidgetProvider
import com.cronos.todoapp.widget.WidgetRefresh
import java.io.File
import java.util.Locale

class MainActivity : TauriActivity() {
  private var snapshotWatcher: FileObserver? = null
  private var webView: WebView? = null
  /** 지금 화면의 테두리 값을 CSS 에 넣는 JS. 웹뷰가 늦게 생기거나 새로 읽히면 이걸 다시 넣는다 */
  private var insetJs: String? = null
  private var insetScript: ScriptHandler? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    fitSystemEdges()
    watchWidgetSnapshot()
    stashDeepLink(intent)
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)
    this.webView = webView
    insetJs?.let { pushInsets(it) }
  }

  /**
   * 화면 끝까지 그리므로(enableEdgeToEdge) 시스템은 자판이 올라와도 창을 줄여 주지 않는다.
   * 그러면 자판이 웹뷰 아래쪽을 그대로 덮어, 아래에서 올라오는 시트(할 일 추가)의 입력칸과 저장 단추가 가려진다.
   * 그래서 자판 높이만큼 내용 칸 아래에 여백을 두어 웹뷰를 줄인다.
   *
   * 상태 표시줄·아래 막대 높이는 CSS 변수(--native-inset-*)로 알려 준다. 웹뷰 140 미만은
   * env(safe-area-inset-*) 이 0 이거나 틀린 값을 주어, 첫 줄이 시계에 깔리고 아래 단추가 막대에 묻혔다.
   * 웹뷰(자식)에는 자판과, 자판이 떠 있을 때의 아래 막대를 지운 테두리를 건넨다 — 이미 비켜 줬는데 또 비키지 않게.
   */
  private fun fitSystemEdges() {
    val content = findViewById<ViewGroup>(android.R.id.content)
    ViewCompat.setOnApplyWindowInsetsListener(content) { v, insets ->
      val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
      val keyboard = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
      v.setPadding(0, 0, 0, keyboard)
      // 자판이 떠 있으면 웹뷰 아래끝은 자판 위다 — 아래로 비켜 줄 막대가 없다
      val bottom = if (keyboard > 0) 0 else bars.bottom
      pushInsets(insetScriptFor(bars.top, bars.right, bottom, bars.left, keyboard > 0))

      val nav = insets.getInsets(WindowInsetsCompat.Type.navigationBars())
      val forChild = WindowInsetsCompat.Builder(insets)
        .setInsets(WindowInsetsCompat.Type.ime(), Insets.NONE)
      if (keyboard > 0) forChild.setInsets(WindowInsetsCompat.Type.navigationBars(), Insets.of(nav.left, nav.top, nav.right, 0))
      forChild.build()
    }
  }

  /** 픽셀 → CSS px(dp). 웹뷰는 device-width 로 그리므로 1 CSS px = 1 dp */
  private fun insetScriptFor(top: Int, right: Int, bottom: Int, left: Int, keyboard: Boolean): String {
    val d = resources.displayMetrics.density
    fun css(px: Int) = String.format(Locale.US, "%.2fpx", px / d)
    // 문서가 막 생겨 <html> 이 아직 없을 수 있다 — 그때는 읽기 상태가 바뀔 때 넣는다
    return """(function(){var v={top:"${css(top)}",right:"${css(right)}",bottom:"${css(bottom)}",left:"${css(left)}"};""" +
      """function put(){var r=document.documentElement;if(!r)return false;for(var k in v)r.style.setProperty("--native-inset-"+k,v[k]);""" +
      """if(${keyboard})r.setAttribute("data-keyboard","");else r.removeAttribute("data-keyboard");return true}""" +
      """if(!put())document.addEventListener("readystatechange",put,{once:true})})();"""
  }

  private fun pushInsets(js: String) {
    if (js == insetJs && insetScript != null) return
    insetJs = js
    val wv = webView ?: return
    wv.post {
      wv.evaluateJavascript(js, null)
      // 새로 읽히는 문서에도 처음부터 들어가게 (새로 고침, 화면 밖으로 나갔다 오기)
      if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
        insetScript?.remove()
        insetScript = WebViewCompat.addDocumentStartJavaScript(wv, js, setOf("*"))
      }
    }
  }

  /** 켜져 있는 앱을 위젯이 다시 부르면(singleTask) 여기로 온다 */
  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    stashDeepLink(intent)
  }

  /**
   * 위젯이 보낸 `cronos://…` 를 파일에 적어 둔다. JS(AndroidWidgetSync)가 켜질 때·다시 보일 때
   * take_pending_link 로 가져가 화면을 옮긴다. Kotlin 에서 웹뷰의 JS 를 바로 부를 길이 없어 파일로 건넨다.
   */
  private fun stashDeepLink(intent: Intent?) {
    val uri = intent?.data
    Log.i("CronosLink", "intent action=${intent?.action} data=$uri")
    if (uri == null || uri.scheme != "cronos") return
    try {
      val dir = File(applicationInfo.dataDir)
      val tmp = File(dir, "pending-link.txt.tmp")
      tmp.writeText(uri.toString())
      tmp.renameTo(File(dir, "pending-link.txt"))
    } catch (e: Throwable) { Log.w("CronosLink", "링크를 못 남겼다", e) }
    // 한 번 쓴 링크가 다음 켤 때 또 잡히지 않게
    intent.data = null
  }

  /**
   * 앱(JS)이 widget-snapshot.json 을 새로 쓰면 곧바로 홈 위젯을 다시 그린다.
   * Rust 는 임시 파일에 쓰고 rename 하므로 MOVED_TO 한 번으로 "바뀌었다" 를 안다.
   * 폴더 단위로 지켜보는 이유: 파일 단위 관찰은 rename 으로 바뀐 inode 를 놓친다.
   */
  private fun watchWidgetSnapshot() {
    val dir = File(applicationInfo.dataDir)
    @Suppress("DEPRECATION")
    snapshotWatcher = object : FileObserver(dir.absolutePath, MOVED_TO or CLOSE_WRITE) {
      override fun onEvent(event: Int, path: String?) {
        if (path == CronosWidgetProvider.SNAPSHOT_FILE) {
          WidgetRefresh.broadcast(this@MainActivity)
        }
      }
    }.also { it.startWatching() }
  }

  /**
   * 홈 위젯의 자동 갱신 주기는 최소 30분이라 앱에서 체크를 눌러도 한참 뒤에야 반영된다.
   * 앱을 벗어나는 순간이 곧 사용자가 홈 화면을 보는 순간이므로, 그때도 한 번 더 그린다.
   */
  override fun onPause() {
    super.onPause()
    WidgetRefresh.broadcast(this)
  }

  override fun onDestroy() {
    snapshotWatcher?.stopWatching()
    snapshotWatcher = null
    insetScript = null
    webView = null
    super.onDestroy()
  }
}
