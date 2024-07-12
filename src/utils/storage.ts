export type ModuleFiles = {
  filename: string
  content: string
  isBlveFile: boolean
}[]

const FILES_KEY = 'files'

export function saveFilesToLocalStorage(files: ModuleFiles) {
  localStorage.setItem(FILES_KEY, JSON.stringify(files))
}

export function loadFilesFromLocalStorage(): ModuleFiles | null {
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
