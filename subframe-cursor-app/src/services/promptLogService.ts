import { db } from '../lib/supabase'

export interface PromptLog {
  id?: string
  user_id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  created_at?: string
  updated_at?: string
}

export interface CreatePromptLogData {
  title: string
  content: string
  category?: string
  tags?: string[]
}

export interface UpdatePromptLogData {
  title?: string
  content?: string
  category?: string
  tags?: string[]
}

export const promptLogService = {
  // Get all prompt logs for the current user
  getAll: async (userId: string) => {
    const { data, error } = await db.query('prompt_logs', { user_id: userId })
    return { data: data as PromptLog[], error }
  },

  // Get a single prompt log by ID
  getById: async (id: string) => {
    const { data, error } = await db.query('prompt_logs', { id })
    return { data: data?.[0] as PromptLog | null, error }
  },

  // Create a new prompt log
  create: async (userId: string, promptLogData: CreatePromptLogData) => {
    const data = {
      ...promptLogData,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    const { data: result, error } = await db.insert('prompt_logs', data)
    return { data: result?.[0] as PromptLog, error }
  },

  // Update an existing prompt log
  update: async (id: string, promptLogData: UpdatePromptLogData) => {
    const data = {
      ...promptLogData,
      updated_at: new Date().toISOString(),
    }
    
    const { data: result, error } = await db.update('prompt_logs', id, data)
    return { data: result?.[0] as PromptLog, error }
  },

  // Delete a prompt log
  delete: async (id: string) => {
    const { error } = await db.delete('prompt_logs', id)
    return { error }
  },

  // Search prompt logs by title or content
  search: async (userId: string, searchTerm: string) => {
    const { data, error } = await db.query('prompt_logs', { user_id: userId })
    
    if (error) return { data: [], error }
    
    const filteredData = (data as PromptLog[]).filter(log => 
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    return { data: filteredData, error: null }
  },

  // Get prompt logs by category
  getByCategory: async (userId: string, category: string) => {
    const { data, error } = await db.query('prompt_logs', { 
      user_id: userId, 
      category 
    })
    return { data: data as PromptLog[], error }
  },

  // Get prompt logs by tags
  getByTags: async (userId: string, tags: string[]) => {
    const { data, error } = await db.query('prompt_logs', { user_id: userId })
    
    if (error) return { data: [], error }
    
    const filteredData = (data as PromptLog[]).filter(log => 
      log.tags?.some(tag => tags.includes(tag))
    )
    
    return { data: filteredData, error: null }
  }
}
