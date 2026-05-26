use chrono::Local;
use encoding_rs::GBK;
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

#[derive(Serialize)]
pub struct ReadTextFileResult {
    pub path: String,
    pub file_name: String,
    pub extension: String,
    pub size: u64,
    pub modified_ms: Option<u128>,
    pub encoding: String,
    pub content: String,
}

#[derive(Serialize)]
pub struct FileMetadataResult {
    pub path: String,
    pub exists: bool,
    pub is_file: bool,
    pub size: Option<u64>,
    pub extension: Option<String>,
}

#[derive(Serialize)]
pub struct CopiedAssetResult {
    pub absolute_path: String,
    pub relative_path: String,
    pub file_name: String,
}

#[tauri::command]
pub async fn read_text_file(path: String) -> Result<ReadTextFileResult, String> {
    let canonical = canonical_file_path(&path)?;
    let metadata =
        fs::metadata(&canonical).map_err(|err| format!("无法读取文件元数据: {err}"))?;

    if !metadata.is_file() {
        return Err("目标路径不是普通文件".to_string());
    }

    let bytes = fs::read(&canonical).map_err(|err| format!("无法读取文件内容: {err}"))?;
    let (content, encoding) = decode_text(bytes)?;
    let file_name = canonical
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_string();
    let extension = canonical
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();
    let modified_ms = metadata
        .modified()
        .ok()
        .and_then(|modified| modified.duration_since(UNIX_EPOCH).ok())
        .map(|duration| duration.as_millis());

    Ok(ReadTextFileResult {
        path: canonical.to_string_lossy().to_string(),
        file_name,
        extension,
        size: metadata.len(),
        modified_ms,
        encoding,
        content,
    })
}

#[tauri::command]
pub async fn get_file_metadata(path: String) -> Result<FileMetadataResult, String> {
    let input = PathBuf::from(&path);
    let exists = input.exists();
    let metadata = fs::metadata(&input).ok();
    let canonical = if exists {
        match input.canonicalize() {
            Ok(path) => path,
            Err(_) => input,
        }
    } else {
        input
    };
    let extension = canonical
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| value.to_ascii_lowercase());

    Ok(FileMetadataResult {
        path: canonical.to_string_lossy().to_string(),
        exists,
        is_file: metadata.as_ref().is_some_and(|value| value.is_file()),
        size: metadata.map(|value| value.len()),
        extension,
    })
}

#[tauri::command]
pub async fn write_text_file(path: String, content: String) -> Result<(), String> {
    let input = PathBuf::from(&path);
    let parent = input
        .parent()
        .ok_or_else(|| "保存失败：目标路径缺少父目录".to_string())?;
    let canonical_parent = parent
        .canonicalize()
        .map_err(|err| format!("保存失败：无法规范化父目录 `{}`: {err}", parent.display()))?;

    if !canonical_parent.is_dir() {
        return Err("保存失败：目标父路径不是目录".to_string());
    }

    if input.exists() {
        let metadata =
            fs::metadata(&input).map_err(|err| format!("保存失败：无法读取目标文件信息: {err}"))?;
        if !metadata.is_file() {
            return Err("保存失败：目标路径不是普通文件".to_string());
        }
    }

    fs::write(&input, content.as_bytes()).map_err(|err| format!("保存失败：写入文件失败: {err}"))
}

#[tauri::command]
pub async fn copy_image_to_assets(
    document_path: String,
    image_path: String,
) -> Result<CopiedAssetResult, String> {
    let document = canonical_file_path(&document_path)?;
    let image = canonical_file_path(&image_path)?;
    let image_metadata =
        fs::metadata(&image).map_err(|err| format!("复制图片失败：无法读取源图片信息: {err}"))?;

    if !image_metadata.is_file() {
        return Err("复制图片失败：源路径不是普通文件".to_string());
    }

    let extension = image
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| value.to_ascii_lowercase())
        .ok_or_else(|| "复制图片失败：源图片没有扩展名".to_string())?;

    if !is_supported_image_extension(&extension) {
        return Err(format!("复制图片失败：不支持的图片扩展名 `{extension}`"));
    }

    let document_parent = document
        .parent()
        .ok_or_else(|| "复制图片失败：文档路径缺少父目录".to_string())?;
    let document_stem = document
        .file_stem()
        .and_then(|value| value.to_str())
        .ok_or_else(|| "复制图片失败：无法读取文档文件名".to_string())?;
    let assets_dir_name = format!("{document_stem}.assets");
    let assets_dir = document_parent.join(&assets_dir_name);
    fs::create_dir_all(&assets_dir).map_err(|err| format!("复制图片失败：无法创建资源目录: {err}"))?;

    let timestamp = Local::now().format("%Y%m%d-%H%M%S").to_string();
    let target_file_name = next_asset_file_name(&assets_dir, &timestamp, &extension)?;
    let target = assets_dir.join(&target_file_name);

    fs::copy(&image, &target).map_err(|err| format!("复制图片失败：复制文件失败: {err}"))?;

    Ok(CopiedAssetResult {
        absolute_path: target.to_string_lossy().to_string(),
        relative_path: format!("./{assets_dir_name}/{target_file_name}"),
        file_name: target_file_name,
    })
}

#[tauri::command]
pub async fn open_in_file_manager(path: String) -> Result<(), String> {
    let canonical = canonical_file_path(&path)?;

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg("/select,")
            .arg(canonical.as_os_str())
            .spawn()
            .map_err(|err| format!("无法打开资源管理器: {err}"))?;
        return Ok(());
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg("-R")
            .arg(canonical.as_os_str())
            .spawn()
            .map_err(|err| format!("无法打开 Finder: {err}"))?;
        return Ok(());
    }

    #[cfg(all(not(target_os = "windows"), not(target_os = "macos")))]
    {
        let target = canonical.parent().unwrap_or(canonical.as_path());
        std::process::Command::new("xdg-open")
            .arg(target.as_os_str())
            .spawn()
            .map_err(|err| format!("无法打开文件管理器: {err}"))?;
        Ok(())
    }
}

fn canonical_file_path(path: &str) -> Result<PathBuf, String> {
    let input = Path::new(path);
    input
        .canonicalize()
        .map_err(|err| format!("无法规范化文件路径 `{path}`: {err}"))
}

fn decode_text(bytes: Vec<u8>) -> Result<(String, String), String> {
    match String::from_utf8(bytes) {
        Ok(content) => Ok((content, "utf-8".to_string())),
        Err(err) => {
            let bytes = err.into_bytes();
            let (decoded, _, had_errors) = GBK.decode(&bytes);
            if had_errors {
                Err("文件不是有效 UTF-8，且 GBK/GB18030 兼容解码失败".to_string())
            } else {
                Ok((decoded.into_owned(), "gbk".to_string()))
            }
        }
    }
}

fn is_supported_image_extension(extension: &str) -> bool {
    matches!(
        extension,
        "png" | "jpg" | "jpeg" | "gif" | "webp" | "bmp" | "svg"
    )
}

fn next_asset_file_name(
    assets_dir: &Path,
    timestamp: &str,
    extension: &str,
) -> Result<String, String> {
    for index in 0..1000 {
        let suffix = if index == 0 {
            String::new()
        } else {
            format!("-{}", index + 1)
        };
        let file_name = format!("image-{timestamp}{suffix}.{extension}");
        if !assets_dir.join(&file_name).exists() {
            return Ok(file_name);
        }
    }

    Err("复制图片失败：无法生成不冲突的资源文件名".to_string())
}
