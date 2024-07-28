import type { LunasModuleFile } from "./storage";

export function encodeFiles(files: LunasModuleFile[]) {
  const encodedFiles = encodeURIComponent(
    window.btoa(unescape(encodeURIComponent(JSON.stringify(files))))
  );

  return encodedFiles;
}

export function decodeFiles(encodedFiles: string): LunasModuleFile[] {
  return JSON.parse(
    decodeURIComponent(escape(window.atob(decodeURIComponent(encodedFiles))))
  ) as LunasModuleFile[];
}
