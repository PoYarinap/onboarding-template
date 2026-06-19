import { createCrudModalStore } from './create-crud-modal-store'
import type { Journal } from '@/lib/services/journal.service'

export const useJournalsUiStore = createCrudModalStore<Journal>(['form'])
