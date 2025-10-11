<template>
  <div class="flex justify-center items-center min-h-screen">
    <Card class="w-full max-w-md shadow-lg">
      <template #title>
        <h2 class="text-2xl font-bold text-center">ThinkSpend Login</h2>
      </template>
      <template #content>
        <div class="flex flex-col gap-4">
          <div v-if="auth.error" class="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200">
            ❌ {{ auth.error }}
          </div>
          <div v-if="auth.user" class="bg-green-50 text-green-600 p-3 rounded-lg border border-green-200">
            ✅ Logged in as {{ auth.user.email }}
          </div>
          <InputText v-model="email" placeholder="Email" class="w-full" />
          <Password v-model="password" placeholder="Password" class="w-full" toggleMask />
          <Button label="Sign In" @click="signIn" :loading="auth.loading" class="w-full" />
          <Button label="Sign Up" @click="signUp" severity="secondary" :loading="auth.loading" class="w-full" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')

const signIn = async () => {
  await auth.signIn(email.value, password.value)
  if (auth.user) {
    router.push('/notes')
  }
}

const signUp = async () => {
  await auth.signUp(email.value, password.value)
  if (auth.user) {
    router.push('/notes')
  }
}
</script>

<style scoped>
</style>