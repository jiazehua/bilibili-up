import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { VueClipboard } from '@soerenmartius/vue3-clipboard'

createApp(App).use(ElementPlus).use(VueClipboard).mount('#app')
