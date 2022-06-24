import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import jQuery from "jquery";
const $ = jQuery;
window.$ = $;

createApp(App).use(ElementPlus).mount('#app')
