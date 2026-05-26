#[tauri::command]
pub fn get_initial_args() -> Vec<String> {
    std::env::args_os()
        .map(|arg| arg.to_string_lossy().to_string())
        .collect()
}
