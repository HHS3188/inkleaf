use std::path::PathBuf;

#[tauri::command]
pub async fn path_exists(path: String) -> Result<bool, String> {
    let input = PathBuf::from(&path);
    match input.canonicalize() {
        Ok(path) => Ok(path.exists()),
        Err(_) => Ok(false),
    }
}
