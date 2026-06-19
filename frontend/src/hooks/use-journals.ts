import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { getRouteApi } from '@tanstack/react-router'
import { useAppMutation } from './use-mutations'
import { useExportExcel } from './use-export-excel'
import type { JournalFormData } from '@/lib/schemas/journals'
import type { Journal } from '@/lib/services/journal.service'
import type { PaginatedData } from '@/types/api'
import { useConfirmation } from '@/hooks/use-confirmation'
import { useUserPermission } from '@/hooks/use-permissions'
import { useDataTable } from '@/components/templates/datatable'
import {
  createJournal,
  deleteJournal,
  getJournals,
  updateJournal,
} from '@/lib/services/journal.service'
import { getColumns } from '@/components/features/journals/columns'
import { useJournalsUiStore } from '@/lib/stores/journals-ui.store'

const routeApi = getRouteApi('/(journals)/journals')

export const useJournals = () => {
  const { page, limit, search, sort, direction } = routeApi.useSearch()

  return useQuery({
    queryKey: ['journals', { page, limit, search, sort, direction }],
    queryFn: () =>
      getJournals({
        page: page || 1,
        limit: limit || 10,
        search: search || '',
        sort: sort || 'createdAt',
        direction: direction || 'desc',
        paginated: true,
      }) as Promise<PaginatedData<Journal>>,
    placeholderData: keepPreviousData,
  })
}

export const useJournalPage = () => {
  const tableState = useDataTable(routeApi)
  const { data, isLoading } = useJournals()
  const { hasPermission } = useUserPermission()
  const { confirm } = useConfirmation()

  const ui = useJournalsUiStore(
    useShallow((s) => ({
      open: s.open,
      close: s.close,
      onOpenChange: s.onOpenChange,
      isReadOnly: s.isReadOnly,
      formOpen: s.modals.form.isOpen,
      formEntity: s.modals.form.entity,
    })),
  )
  const editingJournal = ui.formEntity

  const createMutation = useAppMutation({
    mutationFn: createJournal,
    invalidateKeys: ['journals'],
    successMessage: 'Journal created successfully',
    onSuccess: () => ui.close('form'),
  })

  const updateMutation = useAppMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<JournalFormData> }) =>
      updateJournal(id, data),
    invalidateKeys: ['journals'],
    successMessage: 'Journal updated successfully',
    onSuccess: () => ui.close('form'),
  })

  const deleteMutation = useAppMutation({
    mutationFn: deleteJournal,
    invalidateKeys: ['journals'],
    successMessage: 'Journal deleted successfully',
  })

  const handleCreate = () => ui.open('form', null)
  const handleView = (journal: Journal) => ui.open('form', journal, { readOnly: true })
  const handleEdit = (journal: Journal) => ui.open('form', journal)

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Delete Journal',
      message: 'Are you sure you want to delete this journal entry?',
      color: 'danger',
    })
    if (isConfirmed) deleteMutation.mutate(id)
  }

  const onSubmit = (data: JournalFormData) => {
    if (editingJournal) {
      updateMutation.mutate({ id: editingJournal.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const columns = getColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    hasPermission,
  })

  const { onExport, isExporting } = useExportExcel({
    filename: 'Journals',
    sheetName: 'Journals',
    columns,
    fetchAll: async () => {
      const res = await getJournals({ paginated: false })
      return Array.isArray(res) ? res : res?.data || []
    },
  })

  return {
    tableProps: {
      data,
      columns,
      isLoading,
      onCreate: hasPermission('journals.create') ? handleCreate : undefined,
      onExport,
      isExporting,
      ...tableState,
      initialSearch: tableState.search,
    },
    modalProps: {
      isOpen: ui.formOpen,
      onOpenChange: ui.onOpenChange('form'),
      editingJournal,
      onSubmit,
      isLoading: createMutation.isPending || updateMutation.isPending,
      isReadOnly: ui.isReadOnly,
    },
  }
}
