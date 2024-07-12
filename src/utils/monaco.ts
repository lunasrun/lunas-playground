import * as monaco from "monaco-editor";
import blveHighlightingRules from "../syntaxes/blve.tmLanguage.json?raw";
import blveHtmlHighlightingRules from "../syntaxes/text.html.blve.tmLanguage.json?raw";
import { createHighlighter } from "shiki";
import { shikiToMonaco } from "@shikijs/monaco";

const highlighter = await createHighlighter({
  langs: [
    JSON.parse(blveHighlightingRules),
    JSON.parse(blveHtmlHighlightingRules),
    "typescript",
    "css",
  ],
  themes: ["github-light"],
});

monaco.languages.register({ id: "blve" });

shikiToMonaco(highlighter, monaco);

// Registering the new language

// Registering the new language's configuration
// TODO: Delte ts-ignore
// @ts-ignore

// Optional: You can also add custom configuration for comments, auto-closing pairs, etc.
monaco.languages.setLanguageConfiguration("blve", {
  comments: {
    // define comment symbols if your language supports them
    lineComment: "//",
    blockComment: ["/*", "*/"],
  },
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
});

import "monaco-editor/esm/vs/basic-languages/css/css.contribution";
import "monaco-editor/esm/vs/basic-languages/xml/xml.contribution";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";

import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === "typescript" || label === "javascript") return new TsWorker();
    if (label === "json") return new JsonWorker();
    if (label === "css") return new CssWorker();
    if (label === "html") return new HtmlWorker();
    return new EditorWorker();
  },
};

export const options = {
  colorDecorators: true,
  lineHeight: 24,
  tabSize: 2,
  minimap: { enabled: false },
};

export const readOnlyOptions = {
  colorDecorators: true,
  lineHeight: 24,
  tabSize: 2,
  minimap: { enabled: false },
  readOnly: true,
};

monaco.editor.onDidCreateEditor((editor) => {
  window.addEventListener("resize", () => editor.layout());
});
