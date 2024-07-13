import type { BlveModuleFile } from "./storage";

export function encodeFiles(files: BlveModuleFile[]) {
  const encodedFiles = encodeURIComponent(
    window.btoa(unescape(encodeURIComponent(JSON.stringify(files))))
  );

  return encodedFiles;
}

export function decodeFiles(encodedFiles: string): BlveModuleFile[] {
  return JSON.parse(
    decodeURIComponent(escape(window.atob(decodeURIComponent(encodedFiles))))
  ) as BlveModuleFile[];
}
