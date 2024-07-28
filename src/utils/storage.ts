export type LunasModuleFile = {
  filename: string;
  content: string;
};

export type EsModuleFile = {
  filename: string;
  content: string;
  isLunasFile: boolean;
};

const FILES_KEY = "files";

export function saveFilesToLocalStorage(files: LunasModuleFile[]) {
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
}

export function loadFilesFromLocalStorage(): LunasModuleFile[] | null {
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
