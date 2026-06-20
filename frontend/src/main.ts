import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/store/auth.js'
import './assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

const pinia = createPinia()
const authStore = useAuthStore(pinia)

authStore.restoreSession()
await authStore.validateSession()

const app = createApp(App)
app.use(pinia)
app.use(router)
await router.isReady()
app.mount('#app')
