use tauri::Manager;

// ── 프로덕션 전용 헬퍼 ────────────────────────────────────────────────────────
#[cfg(not(debug_assertions))]
mod prod {
    use std::path::PathBuf;
    use std::process::{Child, Command, Stdio};

    pub const PORT: u16 = 3457;

    pub fn start_server(standalone_dir: PathBuf) -> Result<Child, String> {
        let server_js = standalone_dir.join("server.js");
        if !server_js.exists() {
            return Err(format!(
                "server.js를 찾을 수 없습니다: {}",
                server_js.display()
            ));
        }

        let child = Command::new("node")
            .arg(&server_js)
            .current_dir(&standalone_dir)
            .env("PORT", PORT.to_string())
            .env("HOSTNAME", "127.0.0.1")
            .env("NODE_ENV", "production")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| format!("node 실행 실패 (Node.js가 설치되어 있나요?): {e}"))?;

        Ok(child)
    }

    /// 서버가 올라올 때까지 최대 timeout_secs 초 대기
    pub fn wait_ready(port: u16, timeout_secs: u64) -> bool {
        let url = format!("http://127.0.0.1:{port}");
        let deadline = std::time::Instant::now()
            + std::time::Duration::from_secs(timeout_secs);

        while std::time::Instant::now() < deadline {
            if reqwest::blocking::get(&url).is_ok() {
                return true;
            }
            std::thread::sleep(std::time::Duration::from_millis(300));
        }
        false
    }
}

// ── 앱 엔트리포인트 ──────────────────────────────────────────────────────────
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // ── 프로덕션: standalone Next.js 서버 실행 ──────────────────
            #[cfg(not(debug_assertions))]
            {
                use prod::*;
                use std::sync::{Arc, Mutex};

                let resource_dir = app
                    .path()
                    .resource_dir()
                    .expect("리소스 디렉터리를 찾을 수 없습니다");
                let standalone_dir = resource_dir.join("standalone");

                match start_server(standalone_dir) {
                    Ok(child) => {
                        // 앱 종료 시 자식 프로세스 정리
                        let child = Arc::new(Mutex::new(child));
                        app.on_window_event({
                            let child = child.clone();
                            move |_win, event| {
                                if matches!(event, tauri::WindowEvent::Destroyed) {
                                    if let Ok(mut c) = child.lock() {
                                        let _ = c.kill();
                                    }
                                }
                            }
                        });

                        // 준비 대기
                        if !wait_ready(PORT, 15) {
                            eprintln!("⚠ 서버가 응답하지 않습니다 (15s 초과)");
                        }
                    }
                    Err(e) => {
                        eprintln!("서버 시작 실패: {e}");
                        std::process::exit(1);
                    }
                }

                // 창 URL을 로컬 서버로 설정 후 표시
                if let Some(win) = app.get_webview_window("main") {
                    win.navigate(
                        format!("http://127.0.0.1:{PORT}")
                            .parse()
                            .expect("URL 파싱 실패"),
                    )?;
                    win.show()?;
                }
            }

            // ── 개발: devUrl(localhost:3000)로 바로 표시 ─────────────────
            #[cfg(debug_assertions)]
            {
                if let Some(win) = app.get_webview_window("main") {
                    win.show()?;
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("CRONOS 실행 오류");
}
