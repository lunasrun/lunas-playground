<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import MonacoEditor from 'monaco-editor-vue3'
import { compile } from './wasm'
// import { compile } from 'blve-test-2/dist/wasm-compiler/blve_compiler'

const text = ref('')
const compiled_js = ref('')
const preview_js = ref('')
const preview_css = ref('')
const previewScreen = ref(0)
const errMsg = ref('')
const isErr = ref(false)

watch(text, async () => {
  const { js, err } = blve_compile(text.value)
  if (err) {
    errMsg.value = err
    isErr.value = true
  } else {
    compiled_js.value = js as string
    // compiled_css.value = css as string
    errMsg.value = ''
    isErr.value = false

    const runtimeCompile = compile(text.value, true, './runtime.js')
    preview_js.value = runtimeCompile.js
    preview_css.value = runtimeCompile.css as string
  }
  setUrlParam()
})

function blve_compile(code: string): {
  js: string | undefined
  css: string | undefined
  err: string | undefined
} {
  try {
    const { js, css } = compile(code)
    return {
      js: js,
      css: css,
      err: undefined
    }
  } catch (e) {
    return {
      err: String(e),
      js: undefined,
      css: undefined
    }
  }
}

function encode(inputString: string): string {
  let base64String: string
  base64String = encodeURIComponent(window.btoa(unescape(encodeURIComponent(inputString))))

  return base64String
}

const options = {
  colorDecorators: true,
  lineHeight: 24,
  tabSize: 2,
  minimap: { enabled: false }
}

const readOnlyOptions = {
  colorDecorators: true,
  lineHeight: 24,
  tabSize: 2,
  minimap: { enabled: false },
  readOnly: true
}

onMounted(() => {
  // get query param "code" by normal javascript
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  if (code == '' || code == undefined) {
    const defaultCode = `html:
  <div>\${ message }</div>
script:
  const message = "Hello Blve"
`
    text.value = defaultCode
    setUrlParam()
  } else {
    text.value = decodeURIComponent(escape(window.atob(decodeURIComponent(code))))
  }
})

function setUrlParam() {
  const url = new URL(window.location.href)
  url.searchParams.set('code', encode(text.value))
  window.history.pushState({}, '', url.toString())
}
</script>

<template>
  <div class="wrapper">
    <div class="editor">
      <!-- 複数行かけるテキストエディタ -->
      <!-- <textarea  v-model="text" rows="10" cols="50"></textarea> -->
      <MonacoEditor
        theme="vs"
        :options="options"
        language="javascript"
        width="100%"
        height="100%"
        v-model:value="text"
      ></MonacoEditor>
    </div>
    <div class="preview">
      <div class="preview__tabs">
        <button
          @click="previewScreen = 0"
          class="preview__button"
          :class="{
            preview__button__active: previewScreen == 0
          }"
        >
          Content Preview
        </button>
        <button
          @click="previewScreen = 1"
          class="preview__button"
          :class="{
            preview__button__active: previewScreen == 1
          }"
        >
          JavaScript
        </button>
        <button
          @click="previewScreen = 2"
          class="preview__button"
          :class="{
            preview__button__active: previewScreen == 2
          }"
        >
          CSS
        </button>
      </div>
      <div v-if="isErr" class="preview__overlay">
        <span v-if="isErr" class="preview__overlay__error">Error occured<br />{{ errMsg }}</span>
      </div>
      <iframe
        v-if="previewScreen == 0"
        class="preview__content"
        sandbox="allow-scripts allow-same-origin"
        :srcdoc="`<html>
            <head>
              <style>
                ${preview_css}
              </style>
              <script type='module'>
                ${preview_js}
                const app = document.querySelector('#app')
                App(app)
              </script>
            </head>
            <body>
              <div id='app'></div>
            </body>
          </html>`"
      >
      </iframe>
      <div v-if="previewScreen == 1" class="preview__text preview__content">
        <MonacoEditor
          theme="vs"
          :options="readOnlyOptions"
          language="javascript"
          width="100%"
          height="100%"
          v-model:value="compiled_js"
        ></MonacoEditor>
      </div>
      <div v-if="previewScreen == 2" class="preview__content">
        <MonacoEditor
          theme="vs"
          :options="readOnlyOptions"
          language="javascript"
          width="100%"
          height="100%"
          v-model:value="preview_css"
        ></MonacoEditor>
      </div>
    </div>
  </div>
</template>
<style>
.wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
}
.editor {
  /* 左半分を占める */
  width: 50%;
  height: 100%;
}
.editor__text-field {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  font-size: 16px;
  font-family: 'Hiragino Kaku Gothic ProN', 'メイリオ', sans-serif;
}
.monaco-editor {
  width: 50% !important;
  height: 100% !important;
}
.monaco-editor-vue3 {
  width: 100% !important;
  height: 100% !important;
}
.preview {
  width: 50%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.preview__tabs {
  height: 44px;
}
.preview__content {
  height: calc(100vh - 44px);
  white-space: pre;
  overflow: auto;
}

/* 基本のボタンスタイル */
.preview__button {
  font-size: 16px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px 4px 0 0;
  /* 角丸は上だけ */
  background-color: #3498db;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
}

/* ホバー時のスタイル */
.preview__button:hover {
  background-color: #2980b9;
}

/* クリック時のスタイル */
.preview__button__active {
  background-color: #2471a3;
}

.preview__overlay {
  position: absolute;
  height: 100vh;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.8);
}
.preview__overlay__error {
  color: red;
}
</style>
