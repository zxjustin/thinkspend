<template>
  <AppLayout>
    <div class="max-w-3xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <i class="pi pi-spin pi-spinner notion-text-tertiary" style="font-size: 32px;"></i>
      </div>

      <!-- Empty State -->
      <div v-else-if="expenses.length === 0" class="text-center py-12">
        <div class="w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-4" style="background-color: var(--notion-bg-secondary);">
          <i class="pi pi-wallet notion-text-tertiary" style="font-size: 40px;"></i>
        </div>
        <p class="text-base font-medium notion-text-primary mb-2">No expenses yet</p>
        <p class="text-sm notion-text-secondary" style="line-height: 1.5;">
          Add expenses by typing them in your notes like: $25 Lunch [Food]
        </p>
      </div>

      <!-- Expenses List - Grouped by Month -->
      <div v-else>
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold notion-text-primary mb-2">All Expenses</h1>
          <p class="text-sm notion-text-secondary">{{ expenses.length }} expense{{ expenses.length !== 1 ? 's' : '' }} tracked across {{ expensesByMonth.length }} month{{ expensesByMonth.length !== 1 ? 's' : '' }}</p>
        </div>

        <!-- Total Card (at top for prominence) -->
        <div class="mb-8 notion-bg border rounded-lg p-6" style="border-color: var(--notion-border); box-shadow: var(--shadow-md);">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm notion-text-secondary mb-1">Total Spending</p>
              <p class="text-4xl font-bold notion-text-primary">${{ totalAmount.toFixed(2) }}</p>
            </div>
            <div class="w-16 h-16 rounded-lg flex items-center justify-center" style="background-color: var(--accent-green-bg);">
              <i class="pi pi-chart-line" style="font-size: 32px; color: var(--accent-green);"></i>
            </div>
          </div>
        </div>

        <!-- Expenses Grouped by Month -->
        <div class="space-y-8">
          <div v-for="month in expensesByMonth" :key="month.key">
            <!-- Month Header -->
            <div class="mb-4">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold notion-text-primary">{{ month.name }}</h2>
                <div class="text-lg font-semibold" style="color: var(--accent-green);">
                  ${{ month.total.toFixed(2) }}
                </div>
              </div>
              <div class="h-px mt-2" style="background-color: var(--notion-border);"></div>
            </div>

            <!-- Month's Expenses Table -->
            <div class="notion-bg border rounded-lg overflow-hidden" style="border-color: var(--notion-border);">
              <!-- Table Header -->
              <div class="grid grid-cols-12 gap-4 px-6 py-3 border-b" style="background-color: var(--notion-bg-secondary); border-color: var(--notion-border);">
                <div class="col-span-2 text-xs font-semibold notion-text-secondary uppercase tracking-wide">Amount</div>
                <div class="col-span-4 text-xs font-semibold notion-text-secondary uppercase tracking-wide">Description</div>
                <div class="col-span-2 text-xs font-semibold notion-text-secondary uppercase tracking-wide">Category</div>
                <div class="col-span-2 text-xs font-semibold notion-text-secondary uppercase tracking-wide">Date</div>
                <div class="col-span-2 text-xs font-semibold notion-text-secondary uppercase tracking-wide">Source</div>
              </div>

              <!-- Table Rows -->
              <div
                v-for="(expense, index) in month.expenses"
                :key="expense.id"
                class="grid grid-cols-12 gap-4 px-6 py-4 border-b hover:notion-bg-hover transition-colors"
                :style="{ borderColor: 'var(--notion-border)', backgroundColor: index % 2 === 0 ? 'var(--notion-bg)' : 'var(--notion-bg-secondary)' }"
              >
                <div class="col-span-2 flex items-center">
                  <span class="text-lg font-bold notion-text-primary">${{ expense.amount.toFixed(2) }}</span>
                </div>
                <div class="col-span-4 flex items-center">
                  <span class="text-sm notion-text-primary">{{ expense.description }}</span>
                </div>
                <div class="col-span-2 flex items-center">
                  <span class="notion-pill notion-pill-green text-xs">{{ expense.category }}</span>
                </div>
                <div class="col-span-2 flex items-center">
                  <span class="text-xs notion-text-secondary">{{ formatDate(expense.date) }}</span>
                </div>
                <div class="col-span-2 flex items-center">
                  <span v-if="expense.detection_method === 'inline'" class="notion-pill notion-pill-purple text-xs flex items-center gap-1">
                    <i class="pi pi-link" style="font-size: 8px;"></i>
                    <span>Note</span>
                  </span>
                  <span v-else class="notion-pill text-xs">Manual</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import AppLayout from '@/components/common/AppLayout.vue'

const expensesStore = useExpensesStore()
const loading = ref(true)

// Get unique expenses (remove duplicates based on amount, description, category, date)
const uniqueExpenses = computed(() => {
  const seen = new Set()
  return expensesStore.expenses.filter(exp => {
    const key = `${exp.amount}-${exp.description}-${exp.category}-${exp.date}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
})

// Group expenses by month
const expensesByMonth = computed(() => {
  const grouped = {}

  uniqueExpenses.value.forEach(expense => {
    const date = new Date(expense.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    if (!grouped[monthKey]) {
      grouped[monthKey] = {
        name: monthName,
        expenses: [],
        total: 0
      }
    }

    grouped[monthKey].expenses.push(expense)
    grouped[monthKey].total += parseFloat(expense.amount)
  })

  // Sort by month (newest first)
  return Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, data]) => ({ key, ...data }))
})

const expenses = computed(() => uniqueExpenses.value)

const totalAmount = computed(() => {
  return uniqueExpenses.value.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
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