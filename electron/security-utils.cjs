const path = require('path')
const { pathToFileURL } = require('url')

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

async function loadAllowedAsset(requestUrl, fetchFile) {
  try {
    const parsed = new URL(requestUrl)
    if (parsed.protocol !== 'inkleaf:') {
      return new Response('Unsupported protocol', { status: 400 })
    }

    const filePath = path.resolve(decodeURIComponent(parsed.pathname.replace(/^\/+/, '')))
    if (!isAllowedAssetPath(filePath)) {
      return new Response('Forbidden asset type', { status: 403 })
    }

    return await fetchFile(pathToFileURL(filePath).toString())
  } catch {
    return new Response('Asset not found', { status: 404 })
  }
}

module.exports = { isAllowedExternalUrl, isAllowedAssetPath, loadAllowedAsset }
