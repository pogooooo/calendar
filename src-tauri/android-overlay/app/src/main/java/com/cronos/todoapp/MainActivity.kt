package com.cronos.todoapp

import android.content.Intent
import android.os.Bundle
import android.os.FileObserver
import android.util.Log
import androidx.activity.enableEdgeToEdge
import com.cronos.todoapp.widget.CronosWidgetProvider
import com.cronos.todoapp.widget.WidgetRefresh
import java.io.File

class MainActivity : TauriActivity() {
  private var snapshotWatcher: FileObserver? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    watchWidgetSnapshot()
    stashDeepLink(intent)
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
    super.onDestroy()
  }
}
