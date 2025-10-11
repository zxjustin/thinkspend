<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
    <Card class="w-full max-w-md shadow-2xl">
      <template #header>
        <div class="flex flex-col items-center pt-6 pb-4">
          <!-- Logo -->
          <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <span class="text-white font-bold text-3xl">TS</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-800">ThinkSpend</h1>
          <p class="text-sm text-gray-500 mt-1">Personal Knowledge Management + Expenses</p>
        </div>
      </template>

      <template #content>
        <div class="space-y-4 px-6 pb-6">
          <!-- Email Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <InputText 
              v-model="email" 
              type="email"
              placeholder="you@example.com"
              class="w-full"
            />
          </div>

          <!-- Password Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <Password 
              v-model="password" 
              placeholder="••••••••"
              :feedback="false"
              toggleMask
              class="w-full"
            />
          </div>

          <!-- Error Message -->
          <Message v-if="errorMessage" severity="error" :closable="false">
            {{ errorMessage }}
          </Message>

          <!-- Buttons -->
          <div class="space-y-2 pt-2">
            <Button 
              label="Sign In" 
              @click="handleSignIn"
              :loading="loading"
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 border-0"
            />
            <Button 
              label="Create Account" 
              @click="handleSignUp"
              :loading="loading"
              severity="secondary"
              outlined
              class="w-full"
            />
          </div>

          <!-- Info -->
          <div class="text-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
            Use any email/password to create an account
          </div>
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
import Message from 'primevue/message'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleSignIn() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter email and password'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await authStore.signIn(email.value, password.value)
    router.push('/notes')
  } catch (error) {
    errorMessage.value = error.message || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}

async function handleSignUp() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter email and password'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await authStore.signUp(email.value, password.value)
    router.push('/notes')
  } catch (error) {
    errorMessage.value = error.message || 'Could not create account'
  } finally {
    loading.value = false
  }
}
</script>