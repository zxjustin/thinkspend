<template>
  <AppLayout>
    <ResizableLayoutContainer storage-key="expenses-view-layout" :show-right-panel="currentNote">
      <template #left>
        <!-- Categories Sidebar -->
        <div class="px-3 py-2.5 border-b flex-shrink-0" style="border-color: var(--notion-border);">
          <div class="text-xs font-semibold notion-text-secondary uppercase tracking-wider">Expenses Summary</div>
        </div>
        <div class="flex-1 overflow-y-auto p-3">
          <!-- Total Spending Card -->
          <div class="mb-4 notion-bg-secondary rounded-lg p-3">
            <p class="text-xs notion-text-secondary mb-1">Total Spending</p>
            <p class="text-lg font-bold notion-text-primary">${{ totalAmount.toFixed(2) }}</p>
          </div>

          <!-- Quick Stats -->
          <div class="space-y-2 mb-4">
            <div class="flex justify-between items-center px-2 py-1.5">
              <span class="text-xs notion-text-secondary">Transactions</span>
              <span class="text-xs font-semibold notion-text-primary">{{ filteredExpenses.length }}</span>
            </div>
            <div class="flex justify-between items-center px-2 py-1.5">
              <span class="text-xs notion-text-secondary">Months</span>
              <span class="text-xs font-semibold notion-text-primary">{{ expensesByMonth.length }}</span>
            </div>
          </div>

          <!-- Category Breakdown -->
          <div class="border-t" style="border-color: var(--notion-border);">
            <p class="text-xs font-semibold notion-text-secondary px-2 py-2 mt-2 mb-1">By Category</p>
            <div class="space-y-1.5">
              <div
                v-for="category in categoryBreakdown"
                :key="category.name"
                class="px-2 py-1.5 rounded cursor-pointer transition-all duration-200 hover:notion-bg-hover"
              >
                <div class="flex justify-between items-center mb-1">
                  <span class="text-xs notion-text-primary font-medium">{{ category.name || 'Uncategorized' }}</span>
                  <span class="text-xs font-semibold notion-text-secondary">${{ category.total.toFixed(2) }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5" style="background-color: var(--notion-bg-secondary);">
                  <div
                    class="h-1.5 rounded-full"
                    :style="{
                      width: `${(category.total / totalAmount) * 100}%`,
                      backgroundColor: category.color
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #main>
        <div class="flex-1 overflow-y-auto px-8 py-6">
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
          <p class="text-sm notion-text-secondary">{{ filteredExpenses.length }} expense{{ filteredExpenses.length !== 1 ? 's' : '' }} tracked across {{ expensesByMonth.length }} month{{ expensesByMonth.length !== 1 ? 's' : '' }}</p>
        </div>

        <!-- Date Filter Section -->
        <div class="mb-6 notion-bg border rounded-lg p-5" style="border-color: var(--notion-border);">
          <div class="flex flex-wrap items-center gap-5">
            <!-- Quick Filter Buttons -->
            <div class="flex gap-3">
              <button
                @click="setQuickFilter('all')"
                class="filter-button px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
                :class="dateFilter === 'all' ? 'filter-button-active' : 'filter-button-inactive'"
                title="View all expenses"
              >
                All Time
              </button>
              <button
                @click="setQuickFilter('custom')"
                class="filter-button px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
                :class="dateFilter === 'custom' ? 'filter-button-active' : 'filter-button-inactive'"
                title="Set custom date range"
              >
                Custom Range
              </button>
            </div>

            <!-- Custom Date Range Inputs (shown when custom is selected) -->
            <div v-if="dateFilter === 'custom'" class="flex items-center gap-2 ml-auto">
              <div class="flex items-center gap-2">
                <label class="text-xs notion-text-secondary">From:</label>
                <input
                  type="date"
                  v-model="customStartDate"
                  class="px-2 py-1 text-sm rounded border notion-bg notion-text-primary"
                  style="border-color: var(--notion-border);"
                />
              </div>
              <div class="flex items-center gap-2">
                <label class="text-xs notion-text-secondary">To:</label>
                <input
                  type="date"
                  v-model="customEndDate"
                  class="px-2 py-1 text-sm rounded border notion-bg notion-text-primary"
                  style="border-color: var(--notion-border);"
                />
              </div>
            </div>

            <!-- Current Filter Display -->
            <div v-if="dateFilter !== 'all'" class="ml-auto text-xs notion-text-secondary">
              {{ getFilterDescription() }}
            </div>
          </div>
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
                  <span
                    class="text-xs font-medium px-2 py-1 rounded-md transition-all"
                    :style="{
                      color: getDateColor(expense.date).color,
                      backgroundColor: getDateColor(expense.date).color + '15'
                    }"
                    :title="getDateColor(expense.date).label"
                  >
                    {{ formatDate(expense.date) }}
                  </span>
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

        <!-- Tips & Help Section -->
        <div class="mt-12 mb-6">
          <div class="notion-bg border rounded-lg p-6" style="border-color: var(--notion-border);">
            <div class="flex items-center gap-2 mb-4">
              <i class="pi pi-lightbulb" style="font-size: 20px; color: var(--notion-accent);"></i>
              <h3 class="text-lg font-semibold notion-text-primary">Tips & Help</h3>
            </div>
            <div class="space-y-3">
              <div class="px-3 py-2 rounded" style="background-color: var(--notion-bg-secondary);">
                <div class="flex items-start gap-2">
                  <i class="pi pi-check-circle text-green-500" style="font-size: 14px; margin-top: 2px; flex-shrink: 0;"></i>
                  <div>
                    <p class="text-xs font-medium notion-text-primary">Expense Tracking</p>
                    <p class="text-xs notion-text-secondary mt-1">Add expenses in your notes with the format: <span style="color: var(--accent-green); font-weight: 500;">$25 Lunch [Food]</span></p>
                  </div>
                </div>
              </div>
              <div class="px-3 py-2 rounded" style="background-color: var(--notion-bg-secondary);">
                <div class="flex items-start gap-2">
                  <i class="pi pi-check-circle text-blue-500" style="font-size: 14px; margin-top: 2px; flex-shrink: 0;"></i>
                  <div>
                    <p class="text-xs font-medium notion-text-primary">Automatic Detection</p>
                    <p class="text-xs notion-text-secondary mt-1">Expenses are automatically detected from your notes and categorized by type</p>
                  </div>
                </div>
              </div>
              <div class="px-3 py-2 rounded" style="background-color: var(--notion-bg-secondary);">
                <div class="flex items-start gap-2">
                  <i class="pi pi-check-circle text-purple-500" style="font-size: 14px; margin-top: 2px; flex-shrink: 0;"></i>
                  <div>
                    <p class="text-xs font-medium notion-text-primary">Filter & Analyze</p>
                    <p class="text-xs notion-text-secondary mt-1">Use the filter buttons to view expenses by time period and analyze spending patterns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      </template>

      <template #right>
        <div class="px-4 py-3 border-b" style="border-color: var(--notion-border);">
          <div class="text-xs font-semibold notion-text-secondary uppercase tracking-wider">Related</div>
        </div>
        <div class="flex-1 overflow-y-auto p-3">
          <p class="text-xs notion-text-secondary">No related notes</p>
        </div>
      </template>
    </ResizableLayoutContainer>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import AppLayout from '@/components/common/AppLayout.vue'
import ResizableLayoutContainer from '@/components/common/ResizableLayoutContainer.vue'

const expensesStore = useExpensesStore()
const loading = ref(true)
const currentNote = ref(null) // Placeholder for potential right panel content

// Date filter state
const dateFilter = ref('all')
const customStartDate = ref('')
const customEndDate = ref('')

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

// Filter expenses by date range
const filteredExpenses = computed(() => {
  if (dateFilter.value === 'all') {
    return uniqueExpenses.value
  }

  const now = new Date()
  let startDate, endDate

  switch (dateFilter.value) {
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      break
    case 'custom':
      if (!customStartDate.value || !customEndDate.value) {
        return uniqueExpenses.value
      }
      startDate = new Date(customStartDate.value)
      endDate = new Date(customEndDate.value)
      break
    default:
      return uniqueExpenses.value
  }

  return uniqueExpenses.value.filter(exp => {
    const expenseDate = new Date(exp.date)
    return expenseDate >= startDate && expenseDate <= endDate
  })
})

// Group expenses by month (using filtered expenses)
const expensesByMonth = computed(() => {
  const grouped = {}

  filteredExpenses.value.forEach(expense => {
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

const expenses = computed(() => filteredExpenses.value)

const totalAmount = computed(() => {
  return filteredExpenses.value.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
})

// Category breakdown with colors
const categoryBreakdown = computed(() => {
  const colors = {
    'Food': '#10b981',
    'Transport': '#3b82f6',
    'Entertainment': '#f59e0b',
    'Health': '#ef4444',
    'Shopping': '#8b5cf6',
    'Utilities': '#06b6d4',
    'Work': '#6366f1',
  }

  const categoryMap = {}
  filteredExpenses.value.forEach(expense => {
    const category = expense.category || 'Uncategorized'
    if (!categoryMap[category]) {
      categoryMap[category] = {
        name: category,
        total: 0,
        count: 0,
        color: colors[category] || '#9ca3af'
      }
    }
    categoryMap[category].total += parseFloat(expense.amount)
    categoryMap[category].count += 1
  })

  return Object.values(categoryMap)
    .sort((a, b) => b.total - a.total)
})

// Quick filter setter
function setQuickFilter(filter) {
  dateFilter.value = filter

  // Reset custom dates when switching away from custom
  if (filter !== 'custom') {
    customStartDate.value = ''
    customEndDate.value = ''
  }
}

// Get description of current filter
function getFilterDescription() {
  const now = new Date()

  switch (dateFilter.value) {
    case 'thisMonth':
      return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    case 'custom':
      if (customStartDate.value && customEndDate.value) {
        const start = new Date(customStartDate.value)
        const end = new Date(customEndDate.value)
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      }
      return 'Select date range'
    default:
      return ''
  }
}

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

/**
 * Get date color based on recency (inspired by Notion/Obsidian)
 * - Today: Vibrant color
 * - Yesterday to 7 days: Warm color
 * - 8-30 days: Neutral color
 * - Older: Muted color
 */
function getDateColor(dateString) {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expenseDate = new Date(dateString)
  expenseDate.setHours(0, 0, 0, 0)

  const diffTime = today - expenseDate
  const diffDays = diffTime / (1000 * 60 * 60 * 24)

  if (diffDays === 0) {
    return { color: '#10B981', label: 'Today' } // Emerald - Today
  } else if (diffDays <= 1) {
    return { color: '#F59E0B', label: 'Yesterday' } // Amber - Yesterday
  } else if (diffDays <= 7) {
    return { color: '#F97316', label: 'Recent' } // Orange - This week
  } else if (diffDays <= 30) {
    return { color: '#8B5CF6', label: 'Past month' } // Violet - Past month
  } else {
    return { color: '#6B7280', label: 'Older' } // Gray - Older
  }
}
</script>

<style scoped>
/* Filter Button Styling */
.filter-button {
  border: 1px solid transparent;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Inactive filter button state */
.filter-button-inactive {
  background-color: var(--notion-bg);
  color: var(--notion-text-secondary);
  border: 1px solid var(--notion-border);
}

.filter-button-inactive:hover {
  background-color: var(--notion-bg-hover);
  color: var(--notion-text);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.filter-button-inactive:active {
  background-color: var(--notion-bg-selected);
  transform: translateY(0);
}

/* Active filter button state - highlighted */
.filter-button-active {
  background: linear-gradient(135deg, var(--notion-accent, #0066cc) 0%, var(--notion-accent-dark, #0052a3) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.25);
  border: 1px solid var(--notion-accent-dark, #0052a3);
}

.filter-button-active:hover {
  box-shadow: 0 6px 16px rgba(0, 102, 204, 0.35);
  transform: translateY(-2px);
}

.filter-button-active:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 102, 204, 0.25);
}

/* Focus states for accessibility */
.filter-button:focus-visible {
  outline: 2px solid var(--notion-accent, #0066cc);
  outline-offset: 2px;
}

/* Tips section enhancements */
.tips-section {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>