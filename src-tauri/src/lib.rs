mod commands;

use commands::assets::path_exists;
use commands::file_io::{
    copy_image_to_assets, get_file_metadata, open_in_file_manager, read_text_file, write_text_file,
};
use commands::shell::get_initial_args;
use tauri::{Emitter, Manager};

#[derive(Clone, serde::Serialize)]
struct SingleInstancePayload {
    args: Vec<String>,
    cwd: String,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            let payload = SingleInstancePayload { args, cwd };

            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
            }

            let _ = app.emit("open-file-from-args", payload);
        }));
    }

    builder
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            read_text_file,
            write_text_file,
            get_file_metadata,
            copy_image_to_assets,
            open_in_file_manager,
            get_initial_args,
            path_exists
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
