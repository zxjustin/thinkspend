<template>
  <div class="h-screen flex flex-col bg-surface-50">
    <!-- Header -->
    <div class="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-surface-900">Expenses</h1>
      <div class="flex gap-2">
        <Button
          label="Notes"
          icon="pi pi-file"
          outlined
          @click="$router.push('/notes')"
        />
        <Button
          label="Expenses"
          icon="pi pi-wallet"
          @click="$router.push('/expenses')"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <i class="pi pi-spin pi-spinner text-4xl text-surface-400"></i>
      </div>

      <!-- Empty State -->
      <div v-else-if="expenses.length === 0" class="text-center py-12">
        <i class="pi pi-wallet text-6xl text-surface-300 mb-4"></i>
        <p class="text-lg text-surface-600">No expenses yet</p>
        <p class="text-sm text-surface-400 mt-2">
          Add expenses by typing them in your notes like: $25 - Lunch - Food
        </p>
      </div>

      <!-- Expenses List -->
      <div v-else class="max-w-4xl mx-auto">
        <div 
          v-for="expense in expenses" 
          :key="expense.id"
          class="bg-white rounded-lg border border-surface-200 p-4 mb-3 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <span class="text-2xl font-bold text-surface-900">
                  ${{ expense.amount.toFixed(2) }}
                </span>
                <Tag :value="expense.category" severity="info" />
              </div>
              <p class="text-surface-700 mt-2">{{ expense.description }}</p>
              <div class="flex items-center gap-2 mt-2 text-sm text-surface-500">
                <i class="pi pi-calendar"></i>
                <span>{{ formatDate(expense.date) }}</span>
                <span v-if="expense.detection_method === 'inline'" class="ml-2">
                  <i class="pi pi-link text-xs"></i>
                  Detected inline
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Total -->
        <div class="bg-primary-50 rounded-lg border border-primary-200 p-4 mt-6">
          <div class="flex items-center justify-between">
            <span class="text-lg font-semibold text-primary-900">Total</span>
            <span class="text-2xl font-bold text-primary-900">
              ${{ totalAmount.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import Tag from 'primevue/tag'
import Button from 'primevue/button'

const expensesStore = useExpensesStore()
const loading = ref(true)

const expenses = computed(() => expensesStore.expenses)

const totalAmount = computed(() => {
  return expenses.value.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
})

onMounted(async () => {
  await expensesStore.fetchExpenses()
  loading.value = false
})

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}
</script>