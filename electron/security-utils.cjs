const path = require('path')

function isAllowedExternalUrl(url) {
  if (typeof url !== 'string') return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const ALLOWED_ASSET_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'])

function isAllowedAssetPath(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return ALLOWED_ASSET_EXTENSIONS.has(ext)
}

module.exports = { isAllowedExternalUrl, isAllowedAssetPath }
