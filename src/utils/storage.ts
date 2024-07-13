export type BlveModuleFile = {
  filename: string;
  content: string;
};

export type EsModuleFile = {
  filename: string;
  content: string;
  isBlveFile: boolean;
};

const FILES_KEY = "files";

export function saveFilesToLocalStorage(files: BlveModuleFile[]) {
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
}

export function loadFilesFromLocalStorage(): BlveModuleFile[] | null {
  const files = localStorage.getItem(FILES_KEY);
  if (!files) {
    return null;
  }
  const parsedFile = JSON.parse(files);
  if (!Array.isArray(parsedFile)) {
    return null;
  }
  return parsedFile;
}
