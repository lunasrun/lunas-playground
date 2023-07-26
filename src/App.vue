<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import MonacoEditor from 'monaco-editor-vue3'
import { compile } from './wasm'
import { copyText } from './utils/copy'

const text = ref('')
const compiled_js = ref('')
const preview_js = ref('')
const preview_css = ref('')
const previewScreen = ref(0)
const errMsg = ref('')
const isErr = ref(false)
const dialog = ref(false)
const iframe = ref<HTMLIFrameElement | null>(null)

watch(text, async () => {
  const { js, err } = blve_compile(text.value)
  if (err) {
    errMsg.value = err
    isErr.value = true
  } else {
    compiled_js.value = js as string
    errMsg.value = ''
    isErr.value = false

    const runtimeCompile = compile(text.value, true, './runtime.js')
    preview_js.value = runtimeCompile.js
    preview_css.value = runtimeCompile.css as string
  }
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
  <div class="msg">\${ message }</div>
script:
  const message = "Hello Blve"
style:
  .msg {
    color: red;
  }
`
    text.value = defaultCode
  } else {
    text.value = decodeURIComponent(escape(window.atob(decodeURIComponent(code))))
    url.searchParams.delete('code')
    window.history.replaceState({}, '', url.toString())
  }
})

const items = ref([
  { name: 'Data Binding with Style', file: '6.blv' },
  { name: 'Incrementer by Dynamic Data Binding', file: '0.blv' },
  { name: 'Stopwatch', file: '1.blv' },
  { name: 'Style Attribute Binding', file: '2.blv' },
  { name: 'Value Attribute Binding', file: '3.blv' },
  { name: 'Two-way Data Binding 1', file: '4.blv' },
  { name: 'Two-way Data Binding 2', file: '5.blv' },
  { name: 'If Block 1', file: '7.blv' },
  { name: 'If Block 2', file: '8.blv' }
])

import axios from 'axios'

async function loadSample(file: string) {
  const a = await (await axios.get(`./samples/${file}`)).data
  console.log(a)
  text.value = a
  dialog.value = false
}

function reload() {
  if (iframe.value) {
    iframe.value.srcdoc += ''
  }
}

function share() {
  const url = new URL(window.location.href)
  url.searchParams.set('code', encode(text.value))
  // url to string
  const urlStr = url.toString()
  copyText(urlStr)
}
</script>

<template>
  <div class="wrapper">
    <v-toolbar color="blue-lighten-5">
      <v-toolbar-title>Blve Playground</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-share-variant</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="share">
            <v-list-item-title>Copy Link for Sharing Code</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn @click="dialog = true"> Load Samples </v-btn>
    </v-toolbar>
    <div class="content">
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
          <v-tabs color="deep-purple-accent-4" v-model="previewScreen" bg-color="blue-lighten-5">
            <v-tab :value="0"
              >Content Preview
              <v-btn @click="reload" v-show="previewScreen == 0" icon variant="text">
                <v-icon>mdi-reload</v-icon>
              </v-btn>
            </v-tab>
            <v-tab :value="1">JavaScript</v-tab>
            <v-tab :value="2">CSS</v-tab>
          </v-tabs>
        </div>
        <div v-if="isErr" class="preview__overlay">
          <span v-if="isErr" class="preview__overlay__error">Error occured<br />{{ errMsg }}</span>
        </div>
        <iframe
          v-if="previewScreen == 0"
          class="preview__content"
          sandbox="allow-scripts allow-same-origin"
          ref="iframe"
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
            language="css"
            width="100%"
            height="100%"
            v-model:value="preview_css"
          ></MonacoEditor>
        </div>
      </div>
    </div>
  </div>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title class="headline">Sample Codes</v-card-title>

      <v-card-text>
        <v-list-item-group>
          <v-list-item v-for="item in items" :key="item.name" @click="loadSample(item.file)">
            <v-list-item-content>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="dialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<style>
.wrapper {
  width: 100%;
  height: 100vh;
}
.content {
  width: 100%;
  height: calc(100% - 64px);
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
  height: 100%;
  display: flex;
  flex-direction: column;
}
.preview__tabs {
  height: 48px;
}
.preview__content {
  height: calc(100vh - 48px);
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
  height: calc(100vh - 64px);
  width: 100%;
  background-color: rgba(0, 0, 0, 0.8);
}
.preview__overlay__error {
  color: red;
}
iframe {
  border: none;
}
</style>
