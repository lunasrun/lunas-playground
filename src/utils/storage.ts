export type BlveFiles = {
  filename: string
  content: string
}[]

const FILES_KEY = 'files'

export function saveFilesToLocalStorage(files: BlveFiles) {
  localStorage.setItem(FILES_KEY, JSON.stringify(files))
}

export function loadFilesFromLocalStorage(): BlveFiles | null {
  const files = localStorage.getItem(FILES_KEY)
  if (!files) {
    return null
  }
  const parsedFile = JSON.parse(files)
  if (!Array.isArray(parsedFile)) {
    return null
  }
  return parsedFile
}
