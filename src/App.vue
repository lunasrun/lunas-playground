<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import MonacoEditor from 'monaco-editor-vue3'
import { compile } from './wasm'
import { copyText } from './utils/copy'
import './utils/monaco'
import axios from 'axios'
import { primaryColor } from './utils/colors'
import { options, readOnlyOptions } from './utils/monaco'
import { decodeFiles, encodeFiles } from './utils/encode'
import { loadFilesFromLocalStorage, saveFilesToLocalStorage, type ModuleFiles } from './utils/storage'
import { sampleItems, type SampleItem } from './utils/samples'
import runtimeModule from './runtime/index.ts?tsraw'
import inlineModule from './runtime/inline-module.js?raw'
import { computed } from 'vue'

const text = ref<ModuleFiles>([
  {
    filename: 'App',
    content: '',
    isBlveFile: true
  }
])

const activeFile = ref(0)
const codePreviewJs = ref('')
const browserPreviewJs = ref('')
const previewCss = ref('')
const previewScreenTab = ref(0)
const errMsg = ref('')
const isErr = ref(false)
const dialog = ref(false)
const iframe = ref<HTMLIFrameElement | null>(null)

watch(
  text,
  async () => {
    saveFilesToLocalStorage(text.value)

    // preview compile
    const { js } = blve_compile(text.value[activeFile.value].content)
    codePreviewJs.value = js as string
    browserPreviewJs.value = ''
    previewCss.value = ''

    // clone text.value and add runtime file
    const modules = text.value.slice().concat([{ filename: 'runtime', content: runtimeModule, isBlveFile: false }])

    for (let i in modules) {
      const file = modules[i]
      try {
        if (file.isBlveFile) {
          const runtimeCompile = compile(file.content, '#runtime')
          // eslint-disable-next-line no-useless-escape
          browserPreviewJs.value += `<script type="inline-module" id="${file.filename}">${runtimeCompile.js}<\/script>` + '\n'
          // reolace "./{}.blv" to "#{}"
          browserPreviewJs.value = browserPreviewJs.value.replace(/"\.\/(.*?)\.blv"/g, '"#$1"')
          if (runtimeCompile.css) {
            previewCss.value += (runtimeCompile.css as string) + '\n'
          } else {
            previewCss.value += ''
          }
          errMsg.value = ''
          isErr.value = false
        } else {
          // eslint-disable-next-line no-useless-escape
          browserPreviewJs.value += `<script type="inline-module" id="${file.filename}">${file.content}<\/script>` + '\n'
        }
      } catch (e) {
        errMsg.value = 'Error occured in "' + file.filename + '.blv"\n\n' + e
        isErr.value = true
        return
      }
    }
    // eslint-disable-next-line no-useless-escape
    browserPreviewJs.value += `<script>${inlineModule}<\/script><script type="module">import App from '#App';const app = document.querySelector('#app');App().mount(app)<\/script>`
  },
  { deep: true }
)

watch(activeFile, () => {
  const { js } = blve_compile(text.value[activeFile.value].content)
  codePreviewJs.value = js as string
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

function addFile() {
  const filename = prompt('Enter filename')
  if (!filename) return

  if (filename.includes('.')) {
    alert('Filename should not include "."')
    return
  }
  if (text.value.find((file) => file.filename == filename)) {
    alert('Filename already exists')
    return
  }

  text.value.push({
    filename: filename,
    content: `html:
<div class="msg">\${ message }</div>
script:
const message = "Hello Blve"
`
    , isBlveFile: false
  })
  activeFile.value = text.value.length - 1
}

onMounted(() => {
  // get query param "code" by normal javascript
  const url = new URL(window.location.href)
  const urlCode = url.searchParams.get('code')
  const localStorageCode = loadFilesFromLocalStorage()
  if (urlCode == '' || urlCode == undefined) {
    if (localStorageCode) {
      text.value = localStorageCode
    } else {
      const defaultCode = `html:
<div class="msg">\${ message }</div>
script:
const message = "Hello Blve"
style:
.msg {
color: red;
}
`
      text.value = [
        {
          filename: 'App',
          content: defaultCode,
          isBlveFile: true
        }
      ]
    }
  } else {
    text.value = decodeFiles(urlCode)
    url.searchParams.delete('code')
    window.history.replaceState({}, '', url.toString())
  }
})

const iframeDoc = computed(
  () => {
    if (!browserPreviewJs.value) return
    return `<html>
            <head>
              ${browserPreviewJs.value}
              <style>
                ${previewCss.value}
              </style>
            </head>
            <body>
              <div id='app'></div>
            </body>
          </html>`
  });

async function loadSample(sampleItem: SampleItem) {
  if (!confirm('Are you sure to load this sample?')) return
  const tmpText = []
  for (let file of sampleItem.files) {
    const loadedSample = await (await axios.get(`./samples/${file.onlinePath}`)).data
    tmpText.push({
      filename: file.filename,
      content: loadedSample,
      isBlveFile: true
    })
  }
  text.value = tmpText
  dialog.value = false
}

function reload() {
  if (iframe.value) {
    iframe.value.srcdoc += ''
  }
}

function share() {
  const url = new URL(window.location.href)
  url.searchParams.set('code', encodeFiles(text.value))
  const urlStr = url.toString()
  copyText(urlStr)
}

function deleteFile(index: number) {
  if (!confirm('Are you sure to delete the file below?\n' + text.value[index].filename)) {
    return
  }

  activeFile.value = 0
  text.value.splice(index, 1)
}

const title = import.meta.env.DEV ? 'Blve Playground (Dev)' : 'Blve Playground'
</script>

<template>
  <div class="wrapper">
    <v-toolbar :color="primaryColor">
      <v-toolbar-title>{{ title }}</v-toolbar-title>
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
        <!-- file tabs -->
        <div class="preview__tabs">
          <v-tabs v-model="activeFile" color="deep-purple-accent-4" :bg-color="primaryColor">
            <v-tab v-for="(file, index) in text" :key="file.filename" :value="index">
              {{ file.filename }}.blv
              <v-btn @click="deleteFile(index)" icon variant="text" v-if="index != 0 && activeFile == index">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-tab>
            <v-btn @click="addFile" icon variant="text">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-tabs>
        </div>
        <div class="editor__text-field">
          <MonacoEditor theme="vs" :options="options" language="blve" v-model:value="text[activeFile].content"
            width="100%" height="100%">
          </MonacoEditor>
        </div>
      </div>
      <div class="preview">
        <div class="preview__tabs">
          <v-tabs color="deep-purple-accent-4" v-model="previewScreenTab" :bg-color="primaryColor">
            <v-tab :value="0">Content Preview
              <v-btn @click="reload" v-show="previewScreenTab == 0" icon variant="text">
                <v-icon>mdi-reload</v-icon>
              </v-btn>
            </v-tab>
            <v-tab :value="1">JavaScript</v-tab>
            <v-tab :value="2">CSS</v-tab>
          </v-tabs>
        </div>
        <div v-if="isErr" class="preview__overlay">
          <span v-if="isErr" class="preview__overlay__error">
            <pre>{{ errMsg }}</pre>
          </span>
        </div>
        <iframe v-if="previewScreenTab == 0" class="preview__content" sandbox="allow-scripts" ref="iframe"
          :srcdoc="iframeDoc">
        </iframe>
        <div v-if="previewScreenTab == 1 && !isErr" class="preview__text preview__content">
          <MonacoEditor theme="vs" :options="readOnlyOptions" language="javascript" width="100%" height="100%"
            v-model:value="codePreviewJs"></MonacoEditor>
        </div>
        <div v-if="previewScreenTab == 2 && !isErr" class="preview__content">
          <MonacoEditor theme="vs" :options="readOnlyOptions" language="css" width="100%" height="100%"
            v-model:value="previewCss"></MonacoEditor>
        </div>
      </div>
    </div>
  </div>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title class="headline">Sample Codes</v-card-title>

      <v-card-text>
        <v-list-item v-for="item in sampleItems" :key="item.name" @click="loadSample(item)">
          <v-list-item-title>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item-title>
        </v-list-item>
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
  display: flex;
  flex-direction: column;
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
  width: 100% !important;
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

.editor .v-tab {
  text-transform: none !important;
}
</style>
