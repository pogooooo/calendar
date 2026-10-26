fn main() {
    // NDK r26 is used by the current release toolchain. Android's 16 KB
    // devices need ELF alignment as well as Gradle's ZIP alignment.
    if matches!(std::env::var("CARGO_CFG_TARGET_OS").as_deref(), Ok("android")) {
        println!("cargo:rustc-link-arg=-Wl,-z,max-page-size=16384");
        println!("cargo:rustc-link-arg=-Wl,-z,common-page-size=16384");
    }
    tauri_build::build()
}
