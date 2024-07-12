import * as monaco from "monaco-editor";

const blveHighlightingRules = {
  keywords: ["if", "while", "for", "return", "@input", "@use"],
  typeKeywords: ["string", "number", "boolean"],
  jsKeywords: [
    "var",
    "let",
    "const",
    "function",
    "return",
    "if",
    "else",
    "while",
    "for",
    "switch",
    "case",
    "default",
    "break",
    "continue",
  ],
  operators: [
    "=",
    ">",
    "<",
    "==",
    "!=",
    "===",
    "!==",
    "<=",
    ">=",
    "+",
    "-",
    "*",
    "/",
    "&&",
    "||",
    "!",
    "++",
    "--",
  ],

  tokenizer: {
    root: [
      // Embed HTML
      [/^html:\s*$/, { token: "keyword.embed.html", next: "@html" }],
      // Embed JavaScript
      [/^script:\s*$/, { token: "keyword.embed.js", next: "@javascript" }],
      // Embed CSS
      [/^style:\s*$/, { token: "keyword.embed.css", next: "@css" }],
      // keywords
      [
        /[a-z_$][\w$]*/,
        {
          cases: {
            "@typeKeywords": "keyword.type",
            "@keywords": "keyword",
            "@default": "identifier",
          },
        },
      ],
      // strings
      [/"/, "string", "@string_double"],
      [/'/, "string", "@string_single"],
    ],

    string_double: [
      [/[^\\"]+/, "string"],
      [/"/, "string", "@pop"],
    ],

    string_single: [
      [/[^\\']+/, "string"],
      [/'/, "string", "@pop"],
    ],

    html: [
      // Exit HTML mode
      [/^(?!html:)/, { token: "@rematch", switchTo: "@root" }],
      // Simplified HTML rules
      [/<[^>]+>/, "tag"],
      [/[^<]+/, "string"],
    ],

    javascript: [
      // Exit JavaScript mode
      [/^(?!script:)/, { token: "@rematch", switchTo: "@root" }],
      // JavaScript keywords
      [
        /[a-z_$][\w$]*/,
        {
          cases: {
            "@jsKeywords": "keyword.js",
            "@default": "identifier.js",
          },
        },
      ],
      // Operators
      [
        /[=><!+\-*/&|]+/,
        {
          cases: {
            "@operators": "operator.js",
            "@default": "",
          },
        },
      ],
      // strings
      [/"/, "string.js", "@string_double_js"],
      [/'/, "string.js", "@string_single_js"],
    ],

    string_double_js: [
      [/[^\\"]+/, "string.js"],
      [/"/, "string.js", "@pop"],
    ],

    string_single_js: [
      [/[^\\']+/, "string.js"],
      [/'/, "string.js", "@pop"],
    ],

    css: [
      // Exit CSS mode
      [/^(?!style:)/, { token: "@rematch", switchTo: "@root" }],
      // CSS selectors
      [/\.?[a-zA-Z_]\w*/, "keyword.css"],
      [/\{/, "delimiter.curly", "@cssblock"],
    ],

    cssblock: [
      [/\}/, "delimiter.curly", "@pop"],
      [/:/, "delimiter"],
      [/[a-zA-Z_]\w*/, "attribute.name.css"],
      [/;/, "delimiter"],
      [/[^{}:;]+/, "value.css"],
    ],
  },
};

// Registering the new language
monaco.languages.register({ id: "blve" });

// Registering the new language's configuration
// TODO: Delte ts-ignore
// @ts-ignore
monaco.languages.setMonarchTokensProvider("blve", blveHighlightingRules);

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
