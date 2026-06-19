import type { PaginatedData } from '@/types/api'
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api'

export interface Journal {
  id: number
  title: string
  content: string
  date: string | null
  userId: number
  user?: {
    id: number
    email: string
    fullname: string | null
  }
  createdAt: string
  updatedAt: string
}

export interface CreateJournalData {
  title: string
  content: string
  date?: string | null
}

export const getJournals = (params?: {
  page?: number
  limit?: number
  search?: string
  sort?: string
  direction?: string
  paginated?: boolean
}) => {
  return apiGet<PaginatedData<Journal> | Array<Journal>>('/api/journals', { params })
}

export const getJournal = (id: number) => {
  return apiGet<Journal>(`/api/journals/${id}`)
}

export const createJournal = (data: CreateJournalData) => {
  return apiPost<Journal>('/api/journals', data)
}

export const updateJournal = (id: number, data: Partial<CreateJournalData>) => {
  return apiPatch<Journal>(`/api/journals/${id}`, data)
}

export const deleteJournal = (id: number) => {
  return apiDelete<void>(`/api/journals/${id}`)
}
