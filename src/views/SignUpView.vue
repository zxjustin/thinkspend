<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
    <Card class="w-1/4 md:w-full shadow-2xl">
      <template #header>
        <div class="flex flex-col items-center pt-6 pb-4">
          <!-- Logo -->
          <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <span class="text-white font-bold text-3xl">TS</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-800">Create Account</h1>
          <p class="text-sm text-gray-500 mt-1">Join ThinkSpend today</p>
        </div>
      </template>

      <template #content>
        <div class="space-y-4 px-6 pb-6">
          <!-- Email Input -->
          <div class="w-full flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Email</label>
            <InputText
              v-model="email"
              type="email"
              placeholder="you@example.com"
              fluid
              class="w-full"
            />
          </div>

          <!-- Password Input -->
          <div class="w-full flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Password</label>
            <Password
              v-model="password"
              placeholder="••••••••"
              :feedback="true"
              toggleMask
              fluid
              class="w-full"
            />
            <small class="text-gray-500">At least 6 characters</small>
          </div>

          <!-- Error Message -->
          <Message v-if="errorMessage" severity="error" :closable="false">
            {{ errorMessage }}
          </Message>

          <!-- Success Message -->
          <Message v-if="successMessage" severity="success" :closable="false">
            {{ successMessage }}
          </Message>

          <!-- Buttons -->
          <div class="space-y-2 pt-2">
            <Button
              label="Create Account"
              @click="handleSignUp"
              :loading="loading"
              class="w-full bg-gradient-to-r from-blue-600 to-purple-600 border-0"
            />
          </div>

          <!-- Sign In Link -->
          <div class="text-center text-sm text-gray-600 mt-4 pt-4 border-t border-gray-200">
            Already have an account?
            <router-link to="/login" class="text-blue-600 hover:text-blue-700 font-medium">
              Sign In
            </router-link>
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
const successMessage = ref('')

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePassword(password) {
  return password.length >= 6
}

async function handleSignUp() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter email and password'
    return
  }

  if (!validateEmail(email.value)) {
    errorMessage.value = 'Please enter a valid email address'
    return
  }

  if (!validatePassword(password.value)) {
    errorMessage.value = 'Password must be at least 6 characters long'
    return
  }

  loading.value = true

  try {
    await authStore.signUp(email.value, password.value)
    successMessage.value = 'Account created successfully!'
    setTimeout(() => {
      router.push('/notes')
    }, 1000)
  } catch (error) {
    if (error.message.includes('confirm your account')) {
      successMessage.value = 'Please check your email to confirm your account'
    } else {
      errorMessage.value = error.message || 'Could not create account'
    }
  } finally {
    loading.value = false
  }
}
</script>
