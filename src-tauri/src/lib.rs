use tauri::{Manager, WebviewWindowBuilder, WebviewUrl};
use std::sync::{Arc, Mutex};
use std::collections::HashSet;

#[cfg(debug_assertions)]
const BASE_URL: &str = "http://localhost:3000";
#[cfg(not(debug_assertions))]
const BASE_URL: &str = "http://127.0.0.1:3457";

fn widget_size(kind: &str) -> (f64, f64) {
    match kind {
        "weekly"  => (900.0, 560.0),
        "monthly" => (420.0, 500.0),
        _         => (400.0, 640.0),
    }
}

#[cfg(target_os = "windows")]
mod win32 {
    use std::ffi::c_void;
    pub type HWND = *mut c_void;

    pub const HWND_BOTTOM: HWND = 1usize as HWND;
    pub const SWP_POS_FLAGS: u32 = 0x0002 | 0x0001 | 0x0010;
    pub const GWL_EXSTYLE: i32 = -20;
    pub const WS_EX_NOACTIVATE: i32 = 0x0800_0000_u32 as i32;
    pub const DWMWA_TRANSITIONS_FORCEDISABLED: u32 = 3;
    pub const DWMWA_BORDER_COLOR: u32 = 34;
    pub const DWMWA_COLOR_NONE: u32 = 0xFFFF_FFFE;
    pub const DWMWA_COLOR_DEFAULT: u32 = 0xFFFF_FFFF;
    pub const DWMWA_DISALLOW_PEEK: u32 = 11;

    #[link(name = "user32")]
    extern "system" {
        pub fn SetWindowPos(
            hWnd: HWND, hWndInsertAfter: HWND,
            X: i32, Y: i32, cx: i32, cy: i32, uFlags: u32,
        ) -> i32;
        pub fn GetWindowLongW(hWnd: HWND, nIndex: i32) -> i32;
        pub fn SetWindowLongW(hWnd: HWND, nIndex: i32, dwNewLong: i32) -> i32;
        pub fn ShowWindow(hWnd: HWND, nCmdShow: i32) -> i32;
        pub fn IsIconic(hWnd: HWND) -> i32;
        pub fn IsWindowVisible(hWnd: HWND) -> i32;
        pub fn SystemParametersInfoW(
            uiAction: u32,
            uiParam: u32,
            pvParam: *mut std::ffi::c_void,
            fWinIni: u32,
        ) -> i32;
    }

    #[link(name = "dwmapi")]
    extern "system" {
        pub fn DwmSetWindowAttribute(
            hwnd: HWND, dwAttribute: u32,
            pvAttribute: *const std::ffi::c_void, cbAttribute: u32,
        ) -> i32;
    }

    pub const SW_SHOWNOACTIVATE: i32 = 4;

    pub unsafe fn set_attr(hwnd: isize, attr: u32, val: u32) {
        DwmSetWindowAttribute(
            hwnd as HWND, attr,
            &val as *const u32 as *const _,
            std::mem::size_of::<u32>() as u32,
        );
    }

    pub unsafe fn set_noactivate(hwnd: isize, enable: bool) {
        let current = GetWindowLongW(hwnd as HWND, GWL_EXSTYLE);
        let new_style = if enable {
            current | WS_EX_NOACTIVATE
        } else {
            current & !WS_EX_NOACTIVATE
        };
        SetWindowLongW(hwnd as HWND, GWL_EXSTYLE, new_style);
    }

    pub unsafe fn remove_shadow_and_border(hwnd: isize) {
        set_attr(hwnd, 33, 1);
        set_attr(hwnd, DWMWA_BORDER_COLOR, DWMWA_COLOR_NONE);
        set_attr(hwnd, DWMWA_TRANSITIONS_FORCEDISABLED, 1);
        set_attr(hwnd, DWMWA_DISALLOW_PEEK, 1);
    }

    pub unsafe fn set_dwm_border(hwnd: isize, show: bool) {
        let color: u32 = if show { DWMWA_COLOR_DEFAULT } else { DWMWA_COLOR_NONE };
        DwmSetWindowAttribute(
            hwnd as HWND, DWMWA_BORDER_COLOR,
            &color as *const u32 as *const _,
            std::mem::size_of::<u32>() as u32,
        );
    }
}

#[cfg(target_os = "windows")]
fn get_hwnd(win: &tauri::WebviewWindow) -> Option<isize> {
    use raw_window_handle::{HasWindowHandle, RawWindowHandle};
    win.window_handle().ok().and_then(|h| {
        if let RawWindowHandle::Win32(w) = h.as_raw() {
            Some(w.hwnd.get())
        } else {
            None
        }
    })
}

#[derive(Clone)]
pub struct BottomWidgets(pub Arc<Mutex<HashSet<String>>>);

#[tauri::command]
fn get_wallpaper_path() -> String {
    #[cfg(target_os = "windows")]
    {
        let mut path: [u16; 260] = [0; 260];
        let res = unsafe {
            win32::SystemParametersInfoW(
                0x0073,
                260,
                path.as_mut_ptr() as *mut std::ffi::c_void,
                0,
            )
        };
        if res != 0 {
            use std::os::windows::ffi::OsStringExt;
            let len = path.iter().position(|&c| c == 0).unwrap_or(260);
            let os_str = std::ffi::OsString::from_wide(&path[..len]);
            return os_str.into_string().unwrap_or_default();
        }
    }
    "".to_string()
}

#[tauri::command]
async fn open_widget(app: tauri::AppHandle, kind: String) -> Result<(), String> {
    let label = format!("widget-{kind}");

    if let Some(win) = app.get_webview_window(&label) {
        let _ = win.set_focus();
        return Ok(());
    }

    let url_str  = format!("{BASE_URL}/widget/{kind}");
    let (w, h)   = widget_size(&kind);
    let parsed      = url_str.parse::<url::Url>().map_err(|e| e.to_string())?;
    let webview_url = WebviewUrl::External(parsed);

    let app2 = app.clone();
    app.run_on_main_thread(move || {
        match WebviewWindowBuilder::new(&app2, &label, webview_url)
            .title("")
            .transparent(true)
            .shadow(false)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(true)
            .visible(true)
            .inner_size(w, h)
            .build()
        {
            Ok(win)  => {
                let _ = win.show();
                #[cfg(target_os = "windows")]
                if let Some(hwnd) = get_hwnd(&win) {
                    unsafe { win32::remove_shadow_and_border(hwnd); }
                }
            }
            Err(_) => {},
        }
    }).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn set_widget_priority(
    app: tauri::AppHandle,
    bottom_state: tauri::State<'_, BottomWidgets>,
    kind: String,
    priority: String,
) -> Result<(), String> {
    let label = format!("widget-{kind}");

    {
        let mut set = bottom_state.0.lock().unwrap();
        if priority == "bottom" {
            set.insert(kind.clone());
        } else {
            set.remove(&kind);
        }
    }

    if let Some(win) = app.get_webview_window(&label) {
        match priority.as_str() {
            "top" => {
                win.set_always_on_top(true).map_err(|e| e.to_string())?;
                #[cfg(target_os = "windows")]
                if let Some(hwnd) = get_hwnd(&win) {
                    unsafe { win32::set_noactivate(hwnd, false); }
                }
            }
            "bottom" => {
                win.set_always_on_top(false).map_err(|e| e.to_string())?;
                #[cfg(target_os = "windows")]
                if let Some(hwnd) = get_hwnd(&win) {
                    unsafe {
                        win32::set_noactivate(hwnd, true);
                        win32::SetWindowPos(
                            hwnd as _,
                            win32::HWND_BOTTOM,
                            0, 0, 0, 0,
                            win32::SWP_POS_FLAGS,
                        );
                    }
                }
            }
            _ => {
                win.set_always_on_top(false).map_err(|e| e.to_string())?;
                #[cfg(target_os = "windows")]
                if let Some(hwnd) = get_hwnd(&win) {
                    unsafe { win32::set_noactivate(hwnd, false); }
                }
            }
        }
    }
    Ok(())
}

#[tauri::command]
async fn set_widget_locked(
    app: tauri::AppHandle,
    kind: String,
    locked: bool,
) -> Result<(), String> {
    let label = format!("widget-{kind}");
    let Some(win) = app.get_webview_window(&label) else { return Ok(()); };

    #[cfg(target_os = "windows")]
    if let Some(hwnd) = get_hwnd(&win) {
        unsafe { win32::set_dwm_border(hwnd, !locked); }
    }

    let _ = win;
    let _ = locked;
    Ok(())
}

#[tauri::command]
async fn close_widget(
    app: tauri::AppHandle,
    bottom_state: tauri::State<'_, BottomWidgets>,
    kind: String,
) -> Result<(), String> {
    {
        let mut set = bottom_state.0.lock().unwrap();
        set.remove(&kind);
    }
    let label = format!("widget-{kind}");
    if let Some(win) = app.get_webview_window(&label) {
        win.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn list_open_widgets(app: tauri::AppHandle) -> Vec<String> {
    ["daily", "weekly", "monthly"]
        .iter()
        .filter(|&&k| app.get_webview_window(&format!("widget-{k}")).is_some())
        .map(|&k| k.to_string())
        .collect()
}

#[cfg(not(debug_assertions))]
mod prod {
    use std::path::PathBuf;
    use std::process::{Child, Command, Stdio};

    pub const PORT: u16 = 3457;

    pub fn start_server(standalone_dir: PathBuf) -> Result<Child, String> {
        let server_js = standalone_dir.join("server.js");
        if !server_js.exists() {
            return Err(format!("server.js 없음"));
        }
        Command::new("node")
            .arg(&server_js)
            .current_dir(&standalone_dir)
            .env("PORT", PORT.to_string())
            .env("HOSTNAME", "127.0.0.1")
            .env("NODE_ENV", "production")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| format!("{e}"))
    }

    pub fn wait_ready(port: u16, timeout_secs: u64) -> bool {
        let url = format!("http://127.0.0.1:{port}");
        let deadline = std::time::Instant::now() + std::time::Duration::from_secs(timeout_secs);
        while std::time::Instant::now() < deadline {
            if reqwest::blocking::get(&url).is_ok() {
                return true;
            }
            std::thread::sleep(std::time::Duration::from_millis(300));
        }
        false
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let bottom_widgets = BottomWidgets(Arc::new(Mutex::new(HashSet::new())));

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .manage(bottom_widgets.clone())
        .invoke_handler(tauri::generate_handler![
            open_widget,
            close_widget,
            list_open_widgets,
            set_widget_priority,
            set_widget_locked,
            get_wallpaper_path,
        ])
        .setup(move |app| {
            {
                let app_handle = app.handle().clone();
                let bw = bottom_widgets.clone();
                tauri::async_runtime::spawn(async move {
                    loop {
                        tokio::time::sleep(tokio::time::Duration::from_millis(150)).await;

                        for &kind in &["daily", "weekly", "monthly"] {
                            if let Some(win) = app_handle
                                .get_webview_window(&format!("widget-{kind}"))
                            {
                                #[cfg(target_os = "windows")]
                                if let Some(hwnd) = get_hwnd(&win) {
                                    unsafe {
                                        let minimized = win32::IsIconic(hwnd as _) != 0;
                                        let hidden    = win32::IsWindowVisible(hwnd as _) == 0;
                                        if minimized || hidden {
                                            win32::ShowWindow(hwnd as _, win32::SW_SHOWNOACTIVATE);
                                        }
                                    }
                                }
                            }
                        }

                        let bottom_kinds: Vec<String> = {
                            let set = bw.0.lock().unwrap();
                            set.iter().cloned().collect()
                        };

                        for kind in bottom_kinds {
                            if let Some(win) = app_handle
                                .get_webview_window(&format!("widget-{kind}"))
                            {
                                #[cfg(target_os = "windows")]
                                if let Some(hwnd) = get_hwnd(&win) {
                                    unsafe {
                                        win32::SetWindowPos(
                                            hwnd as _,
                                            win32::HWND_BOTTOM,
                                            0, 0, 0, 0,
                                            win32::SWP_POS_FLAGS,
                                        );
                                    }
                                }
                            }
                        }
                    }
                });
            }

            #[cfg(not(debug_assertions))]
            {
                use prod::*;
                use std::sync::{Arc, Mutex};

                let resource_dir = app.path().resource_dir().unwrap();

                match start_server(resource_dir.join("standalone")) {
                    Ok(child) => {
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
                        wait_ready(PORT, 15);
                    }
                    Err(_) => {
                        std::process::exit(1);
                    }
                }
            }

            if let Some(win) = app.get_webview_window("main") {
                let _ = win.show();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .unwrap();
}