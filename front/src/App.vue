<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'
const text = ref('')
const compiled_js = ref('')
const compiled_css = ref('')
const previewScreen = ref(0)
const errMsg = ref('')
const isErr = ref(false)

watch(text, async () => {
  const { js, css, err } = (
    await axios.get<{
      js?: string
      css?: string
      err?: string
    }>(`http://localhost:8000/app?code=${encode(text.value)}`)
  ).data
  if (err) {
    errMsg.value = err
    isErr.value = true
  } else {
    compiled_js.value = js as string
    compiled_css.value = css as string
    errMsg.value = ''
    isErr.value = false
  }
})

function encode(inputString: string): string {
  let base64String: string
  base64String = encodeURIComponent(window.btoa(unescape(encodeURIComponent(inputString))))

  return base64String
}
</script>

<template>
  <div class="wrapper">
    <div class="editor">
      <!-- 複数行かけるテキストエディタ -->
      <textarea class="editor__text-field" v-model="text" rows="10" cols="50"></textarea>
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
                ${compiled_css}
              </style>
              <script type='module'>
                import App from 'http://localhost:8000/app.js?code=${encode(text)}'
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
      <div v-if="previewScreen == 1" class="preview__text preview__content">{{ compiled_js }}</div>
      <div v-if="previewScreen == 2" class="preview__content">{{ compiled_css }}</div>
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
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  padding: 16px;
  box-sizing: border-box;
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
