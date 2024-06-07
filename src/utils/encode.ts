import type { BlveFiles } from './storage'

export function encodeFiles(files: BlveFiles) {
  const encodedFiles = encodeURIComponent(
    window.btoa(unescape(encodeURIComponent(JSON.stringify(files))))
  )

  return encodedFiles
}

export function decodeFiles(encodedFiles: string): BlveFiles {
  return JSON.parse(
    decodeURIComponent(escape(window.atob(decodeURIComponent(encodedFiles))))
  ) as BlveFiles
}
