import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const signIn = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (signInError) throw signInError
      user.value = data.user
    } catch (err) {
      error.value = err.message
      console.error('Sign in error:', err)
    } finally {
      loading.value = false
    }
  }

  const signUp = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      })
      if (signUpError) throw signUpError
      user.value = data.user
    } catch (err) {
      error.value = err.message
      console.error('Sign up error:', err)
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    try {
      await supabase.auth.signOut()
      user.value = null
    } catch (err) {
      error.value = err.message
      console.error('Sign out error:', err)
    } finally {
      loading.value = false
    }
  }

  const initialize = async () => {
    loading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        user.value = session.user
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user || null
      })
    } catch (err) {
      error.value = err.message
      console.error('Initialize error:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    initialize
  }
})
