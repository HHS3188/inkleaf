export function getAssetsDirectoryName(documentPath: string): string {
  const fileName = documentPath.split(/[\\/]/).pop() ?? 'document'
  const stem = fileName.replace(/\.[^.]+$/, '') || fileName
  return `${stem}.assets`
}

export function makeAssetRelativePath(documentPath: string, fileName: string): string {
  return `./${getAssetsDirectoryName(documentPath)}/${fileName}`.replace(/\\/g, '/')
}
