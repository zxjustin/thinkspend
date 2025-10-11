import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useExpensesStore = defineStore('expenses', () => {
  const expenses = ref([])

  async function createExpense(expenseData) {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        amount: expenseData.amount,
        description: expenseData.description,
        category: expenseData.category,
        date: expenseData.date || new Date().toISOString().split('T')[0],
        source_note_id: expenseData.source_note_id || null,
        detection_method: expenseData.detection_method || 'inline',
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error

    expenses.value.unshift(data)
    return data
  }

  async function createNoteExpenseLink(noteId, expenseId, linkType = 'mentioned', strength = 1.0) {
    const { data, error } = await supabase
      .from('note_expense_links')
      .insert({
        note_id: noteId,
        expense_id: expenseId,
        link_type: linkType,
        strength: strength
      })
      .select()
      .single()

    if (error) {
      // Ignore duplicate key errors (link already exists)
      if (error.code === '23505') {
        console.log('Link already exists')
        return null
      }
      throw error
    }

    return data
  }

  async function fetchExpenses() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error
    expenses.value = data
  }

  async function fetchExpensesByNote(noteId) {
    const { data, error } = await supabase
      .from('note_expense_links')
      .select(`
        *,
        expense:expenses(*)
      `)
      .eq('note_id', noteId)

    if (error) throw error
    return data.map(link => ({
      ...link.expense,
      link_type: link.link_type,
      strength: link.strength
    }))
  }

  return {
    expenses,
    createExpense,
    createNoteExpenseLink,
    fetchExpenses,
    fetchExpensesByNote
  }
})