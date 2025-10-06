<template>
  <div class="login-container">
    <Card style="width: 400px">
      <template #title>ThinkSpend Login</template>
      <template #content>
        <div class="p-fluid">
          <InputText v-model="email" placeholder="Email" />
          <Password v-model="password" placeholder="Password" />
          <Button label="Sign In" @click="signIn" />
          <Button label="Sign Up" @click="signUp" class="p-button-secondary" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const auth = useAuthStore()
const email = ref('')
const password = ref('')

const signIn = () => auth.signIn(email.value, password.value)
const signUp = () => auth.signUp(email.value, password.value)
</script>