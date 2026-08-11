use tauri::{Manager, WebviewWindowBuilder, WebviewUrl};
use std::sync::{Arc, Mutex};
use std::collections::HashSet;

#[cfg(debug_assertions)]
const BASE_URL: &str = "http://localhost:3000";

const WIDGET_KINDS: &[&str] = &[
    "daily", "weekly", "monthly",
    "today", "upcoming", "stats", "challenge",
    "projectboard", "projectdetail", "projecttimeline",
    "memo", "quicktask", "sticker", "category",
];

fn widget_size(kind: &str) -> (f64, f64) {
    match kind {
        "weekly"    => (900.0, 300.0),
        "monthly"   => (420.0, 500.0),
        "daily"     => (400.0, 640.0),
        "today"     => (340.0, 460.0),
        "upcoming"  => (340.0, 420.0),
        "stats"     => (320.0, 360.0),
        "projectboard"  => (620.0, 420.0),
        "projectdetail" => (360.0, 480.0),
        "projecttimeline" => (760.0, 400.0),
        "challenge" => (340.0, 400.0),
        "memo"      => (380.0, 300.0),
        "quicktask" => (340.0, 430.0),
        "sticker"   => (430.0, 480.0),
        "category"  => (340.0, 330.0),
        _           => (400.0, 640.0),
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
    pub const GWLP_HWNDPARENT: i32 = -8;

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
        pub fn GetDesktopWindow() -> HWND;
        // ✅ 바탕화면(Progman)을 찾기 위한 API 추가
        pub fn FindWindowW(lpClassName: *const u16, lpWindowName: *const u16) -> HWND;
    }

    #[cfg(target_pointer_width = "64")]
    #[link(name = "user32")]
    extern "system" {
        pub fn SetWindowLongPtrW(hWnd: HWND, nIndex: i32, dwNewLong: isize) -> isize;
    }

    #[link(name = "dwmapi")]
    extern "system" {
        pub fn DwmSetWindowAttribute(
            hwnd: HWND, dwAttribute: u32,
            pvAttribute: *const std::ffi::c_void, cbAttribute: u32,
        ) -> i32;
    }

    pub type HKEY = *mut c_void;
    pub const HKEY_CURRENT_USER: HKEY = 0x80000001usize as _;
    pub const KEY_READ: u32 = 0x20019;
    pub const KEY_WRITE: u32 = 0x20006;

    #[link(name = "advapi32")]
    extern "system" {
        pub fn RegOpenKeyExW(
            hKey: HKEY, lpSubKey: *const u16,
            ulOptions: u32, samDesired: u32, phkResult: *mut HKEY,
        ) -> i32;
        pub fn RegQueryValueExW(
            hKey: HKEY, lpValueName: *const u16,
            lpReserved: *mut u32, lpType: *mut u32,
            lpData: *mut u8, lpcbData: *mut u32,
        ) -> i32;
        pub fn RegSetValueExW(
            hKey: HKEY, lpValueName: *const u16,
            Reserved: u32, dwType: u32,
            lpData: *const u8, cbData: u32,
        ) -> i32;
        pub fn RegDeleteValueW(
            hKey: HKEY, lpValueName: *const u16,
        ) -> i32;
        pub fn RegCloseKey(hKey: HKEY) -> i32;
    }

    pub unsafe fn write_reg_sz(subkey: &str, value: &str, data: &str) -> bool {
        use std::ffi::OsStr;
        use std::os::windows::ffi::OsStrExt;

        let sk: Vec<u16> = OsStr::new(subkey).encode_wide().chain(Some(0)).collect();
        let vn: Vec<u16> = OsStr::new(value).encode_wide().chain(Some(0)).collect();
        let dt: Vec<u16> = OsStr::new(data).encode_wide().chain(Some(0)).collect();
        let dt_bytes: Vec<u8> = dt.iter().flat_map(|&w| w.to_le_bytes()).collect();

        let mut hk: HKEY = std::ptr::null_mut();
        if RegOpenKeyExW(HKEY_CURRENT_USER, sk.as_ptr(), 0, KEY_READ | KEY_WRITE, &mut hk) != 0 {
            return false;
        }
        let ret = RegSetValueExW(hk, vn.as_ptr(), 0, 1, dt_bytes.as_ptr(), dt_bytes.len() as u32);
        RegCloseKey(hk);
        ret == 0
    }

    pub unsafe fn delete_reg_value(subkey: &str, value: &str) -> bool {
        use std::ffi::OsStr;
        use std::os::windows::ffi::OsStrExt;

        let sk: Vec<u16> = OsStr::new(subkey).encode_wide().chain(Some(0)).collect();
        let vn: Vec<u16> = OsStr::new(value).encode_wide().chain(Some(0)).collect();

        let mut hk: HKEY = std::ptr::null_mut();
        if RegOpenKeyExW(HKEY_CURRENT_USER, sk.as_ptr(), 0, KEY_READ | KEY_WRITE, &mut hk) != 0 {
            return false;
        }
        let ret = RegDeleteValueW(hk, vn.as_ptr());
        RegCloseKey(hk);
        ret == 0
    }

    pub unsafe fn read_reg_sz(subkey: &str, value: &str) -> Option<String> {
        use std::ffi::OsStr;
        use std::os::windows::ffi::OsStrExt;

        let sk: Vec<u16> = OsStr::new(subkey).encode_wide().chain(Some(0)).collect();
        let vn: Vec<u16> = OsStr::new(value).encode_wide().chain(Some(0)).collect();

        let mut hk: HKEY = std::ptr::null_mut();
        if RegOpenKeyExW(HKEY_CURRENT_USER, sk.as_ptr(), 0, KEY_READ, &mut hk) != 0 {
            return None;
        }

        let mut sz: u32 = 0;
        RegQueryValueExW(hk, vn.as_ptr(), std::ptr::null_mut(), std::ptr::null_mut(), std::ptr::null_mut(), &mut sz);

        let mut buf: Vec<u8> = vec![0u8; sz as usize];
        let ret = RegQueryValueExW(hk, vn.as_ptr(), std::ptr::null_mut(), std::ptr::null_mut(), buf.as_mut_ptr(), &mut sz);
        RegCloseKey(hk);

        if ret != 0 || sz < 2 { return None; }

        let u16s: Vec<u16> = buf.chunks_exact(2)
            .map(|c| u16::from_le_bytes([c[0], c[1]]))
            .collect();
        let len = u16s.iter().position(|&c| c == 0).unwrap_or(u16s.len());
        String::from_utf16(&u16s[..len]).ok()
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

    pub const WM_WINDOWPOSCHANGING: u32 = 0x0046;
    pub const SWP_NOZORDER: u32 = 0x0004;
    const PIN_BOTTOM_ID: usize = 0xC1105;

    #[repr(C)]
    pub struct WINDOWPOS {
        pub hwnd: HWND,
        pub hwnd_insert_after: HWND,
        pub x: i32,
        pub y: i32,
        pub cx: i32,
        pub cy: i32,
        pub flags: u32,
    }

    pub type SubclassProc = unsafe extern "system" fn(HWND, u32, usize, isize, usize, usize) -> isize;

    #[link(name = "comctl32")]
    extern "system" {
        pub fn SetWindowSubclass(hWnd: HWND, pfnSubclass: SubclassProc, uIdSubclass: usize, dwRefData: usize) -> i32;
        pub fn RemoveWindowSubclass(hWnd: HWND, pfnSubclass: SubclassProc, uIdSubclass: usize) -> i32;
        pub fn DefSubclassProc(hWnd: HWND, uMsg: u32, wParam: usize, lParam: isize) -> isize;
    }

    // 창을 위로 올리려는 시도만 맨 아래로 바꿔치기한다.
    // 이동·크기 변경(SWP_NOZORDER)은 그대로 통과시켜야 한다.
    // 드래그 중에도 z순서를 강제하면 매 프레임 재배치가 일어나 심하게 깜빡인다.
    unsafe extern "system" fn pin_bottom_proc(
        hwnd: HWND, msg: u32, wparam: usize, lparam: isize,
        _id: usize, _data: usize,
    ) -> isize {
        if msg == WM_WINDOWPOSCHANGING && lparam != 0 {
            let wp = lparam as *mut WINDOWPOS;
            if (*wp).flags & SWP_NOZORDER == 0 {
                (*wp).hwnd_insert_after = HWND_BOTTOM;
            }
        }
        DefSubclassProc(hwnd, msg, wparam, lparam)
    }

    pub unsafe fn set_pin_bottom(hwnd: isize, enable: bool) {
        if enable {
            SetWindowSubclass(hwnd as HWND, pin_bottom_proc, PIN_BOTTOM_ID, 0);
            SetWindowPos(hwnd as HWND, HWND_BOTTOM, 0, 0, 0, 0, SWP_POS_FLAGS);
        } else {
            RemoveWindowSubclass(hwnd as HWND, pin_bottom_proc, PIN_BOTTOM_ID);
        }
    }

    pub unsafe fn remove_shadow_and_border(hwnd: isize) {
        set_attr(hwnd, 33, 1);
        set_attr(hwnd, DWMWA_BORDER_COLOR, DWMWA_COLOR_NONE);
        set_attr(hwnd, DWMWA_TRANSITIONS_FORCEDISABLED, 1);
        set_attr(hwnd, DWMWA_DISALLOW_PEEK, 1);
    }

    // ✅ Progman을 찾아 소유권을 넘겨 Win+D를 무시하게 만드는 핵심 로직
    pub unsafe fn bypass_win_d(hwnd: isize, enable: bool) {
        let owner = if enable {
            // "Progman" 이라는 진짜 윈도우 바탕화면 클래스 찾기
            let progman_class = [ 'P' as u16, 'r' as u16, 'o' as u16, 'g' as u16, 'm' as u16, 'a' as u16, 'n' as u16, 0 ];
            let mut p = FindWindowW(progman_class.as_ptr(), std::ptr::null());
            if p.is_null() {
                p = GetDesktopWindow(); // 최후의 보루
            }
            p
        } else {
            std::ptr::null_mut() // 우선순위가 바뀌면 다시 독립된 창으로 복귀
        };

        #[cfg(target_pointer_width = "64")]
        SetWindowLongPtrW(hwnd as HWND, GWLP_HWNDPARENT, owner as isize);

        #[cfg(target_pointer_width = "32")]
        SetWindowLongW(hwnd as HWND, GWLP_HWNDPARENT, owner as i32);
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
fn get_wallpaper_style() -> String {
    #[cfg(target_os = "windows")]
    unsafe {
        let tile = win32::read_reg_sz("Control Panel\\Desktop", "TileWallpaper")
            .unwrap_or_default();
        if tile.trim() == "1" {
            return "tile".into();
        }
        let style = win32::read_reg_sz("Control Panel\\Desktop", "WallpaperStyle")
            .unwrap_or_default();
        return match style.trim() {
            "0"  => "center",
            "2"  => "stretch",
            "6"  => "fit",
            "10" => "fill",
            "22" => "span",
            _    => "fill",
        }.into();
    }
    #[cfg(not(target_os = "windows"))]
    "fill".into()
}

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
fn get_autostart(app: tauri::AppHandle) -> bool {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch().is_enabled().unwrap_or(false)
}

#[tauri::command]
fn set_autostart(app: tauri::AppHandle, enabled: bool) -> bool {
    use tauri_plugin_autostart::ManagerExt;
    let autolaunch = app.autolaunch();
    if enabled {
        autolaunch.enable().is_ok()
    } else {
        autolaunch.disable().is_ok()
    }
}

#[tauri::command]
async fn open_widget(
    app: tauri::AppHandle,
    kind: String,
    x: Option<f64>,
    y: Option<f64>,
    w: Option<f64>,
    h: Option<f64>,
) -> Result<(), String> {
    let label = format!("widget-{kind}");

    if let Some(win) = app.get_webview_window(&label) {
        let _ = win.set_focus();
        return Ok(());
    }

    let (dw, dh) = widget_size(&kind);
    let (w, h) = (w.unwrap_or(dw), h.unwrap_or(dh));

    #[cfg(debug_assertions)]
    let webview_url = {
        let url_str = format!("{BASE_URL}/widget/{kind}");
        let parsed = url_str.parse::<url::Url>().map_err(|e| e.to_string())?;
        WebviewUrl::External(parsed)
    };

    #[cfg(not(debug_assertions))]
    let webview_url = WebviewUrl::App(format!("widget/{kind}/").into());

    let app2 = app.clone();
    app.run_on_main_thread(move || {
        // 로딩 중 위젯이 화면을 가리지 않도록 맨 아래에서 시작한다.
        // 실제 우선순위는 로드 후 set_widget_priority 가 다시 적용한다.
        let mut builder = WebviewWindowBuilder::new(&app2, &label, webview_url)
            .title("")
            .transparent(true)
            .shadow(false)
            .decorations(false)
            .always_on_top(false)
            .skip_taskbar(true)
            .resizable(true)
            .visible(true)
            .inner_size(w, h);

        if let (Some(px), Some(py)) = (x, y) {
            builder = builder.position(px, py);
        }

        match builder.build()
        {
            Ok(win)  => {
                let _ = win.show();
                #[cfg(target_os = "windows")]
                if let Some(hwnd) = get_hwnd(&win) {
                    unsafe {
                        win32::remove_shadow_and_border(hwnd);
                        win32::bypass_win_d(hwnd, true); // 생성 시 바탕화면 고정 켜기
                        win32::set_noactivate(hwnd, true);
                        win32::set_pin_bottom(hwnd, true);
                    }
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
                    win.run_on_main_thread(move || unsafe {
                        win32::set_pin_bottom(hwnd, false);
                        win32::bypass_win_d(hwnd, false);
                        win32::set_noactivate(hwnd, false);
                    }).map_err(|e| e.to_string())?;
                }
            }
            "bottom" => {
                win.set_always_on_top(false).map_err(|e| e.to_string())?;
                #[cfg(target_os = "windows")]
                if let Some(hwnd) = get_hwnd(&win) {
                    win.run_on_main_thread(move || unsafe {
                        win32::bypass_win_d(hwnd, true); // 바탕화면일 때만 켜기
                        win32::set_noactivate(hwnd, true);
                        win32::set_pin_bottom(hwnd, true);
                    }).map_err(|e| e.to_string())?;
                }
            }
            _ => {
                win.set_always_on_top(false).map_err(|e| e.to_string())?;
                #[cfg(target_os = "windows")]
                if let Some(hwnd) = get_hwnd(&win) {
                    win.run_on_main_thread(move || unsafe {
                        win32::set_pin_bottom(hwnd, false);
                        win32::bypass_win_d(hwnd, false);
                        win32::set_noactivate(hwnd, false);
                    }).map_err(|e| e.to_string())?;
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

fn widget_state_path(app: &tauri::AppHandle) -> Option<std::path::PathBuf> {
    app.path().app_config_dir().ok().map(|d| d.join("widget-state.json"))
}

#[tauri::command]
fn load_widget_state(app: tauri::AppHandle) -> String {
    widget_state_path(&app)
        .and_then(|p| std::fs::read_to_string(p).ok())
        .unwrap_or_else(|| "{}".to_string())
}

#[tauri::command]
fn save_widget_state(app: tauri::AppHandle, state: String) -> bool {
    let Some(path) = widget_state_path(&app) else { return false };
    if let Some(dir) = path.parent() {
        let _ = std::fs::create_dir_all(dir);
    }
    std::fs::write(path, state).is_ok()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let bottom_widgets = BottomWidgets(Arc::new(Mutex::new(HashSet::new())));

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .manage(bottom_widgets.clone())
        .invoke_handler(tauri::generate_handler![
            open_widget,
            close_widget,
            list_open_widgets,
            set_widget_priority,
            set_widget_locked,
            get_wallpaper_path,
            get_wallpaper_style,
            get_autostart,
            set_autostart,
            load_widget_state,
            save_widget_state,
        ])
        .setup(move |app| {
            {
                let app_handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    loop {
                        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

                        for &kind in WIDGET_KINDS {
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

                    }
                });
            }

            if let Some(win) = app.get_webview_window("main") {
                let _ = win.show();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .unwrap();
}