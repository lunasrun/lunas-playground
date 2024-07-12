import type { ModuleFiles } from "./storage";

export function encodeFiles(files: ModuleFiles) {
  const encodedFiles = encodeURIComponent(
    window.btoa(unescape(encodeURIComponent(JSON.stringify(files))))
  );

  return encodedFiles;
}

export function decodeFiles(encodedFiles: string): ModuleFiles {
  return JSON.parse(
    decodeURIComponent(escape(window.atob(decodeURIComponent(encodedFiles))))
  ) as ModuleFiles;
}
