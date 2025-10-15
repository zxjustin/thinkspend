import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import TooltipDirective from 'primevue/tooltip'
import Aura from '@primeuix/themes/aura';
import './style.css'
import './assets/styles/notion-theme.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: 'none' // Disable automatic dark mode detection
    }
  }
})
app.use(ConfirmationService)
app.directive('tooltip', TooltipDirective)
app.use(router)

app.mount('#app')
