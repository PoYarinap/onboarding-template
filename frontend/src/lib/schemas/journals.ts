import { z } from 'zod'

export const journalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  date: z.string().optional().nullable(),
})

export const journalSearchSchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  sort: z.string().optional(),
  direction: z.enum(['asc', 'desc']).optional(),
})

export type JournalFormData = z.infer<typeof journalSchema>
export type JournalSearchParams = z.infer<typeof journalSearchSchema>
