import './assets/main.css'

console.log('Hello from main.ts')

import { createApp } from 'vue'
import App from './App.vue'
import init from './wasm'

await init()

createApp(App).mount('#app')
