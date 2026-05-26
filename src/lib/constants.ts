export const LARGE_TEXT_FILE_BYTES = 5 * 1024 * 1024
export const WYSIWYG_DISABLED_BYTES = 2 * 1024 * 1024

export const SUPPORTED_IMAGE_EXTENSIONS = [
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'bmp',
  'svg',
] as const

export type SupportedImageExtension = (typeof SUPPORTED_IMAGE_EXTENSIONS)[number]
