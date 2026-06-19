import { zodValidator } from '@tanstack/zod-adapter'
import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/templates/datatable'
import { useJournalPage } from '@/hooks/use-journals'
import { journalSearchSchema } from '@/lib/schemas/journals'
import { JournalFormModal } from '@/components/features/journals/modal'
import { PageHeader } from '@/components/templates/page-header'
import { TableSkeleton } from '@/components/templates/skeletons'

export const Route = createFileRoute('/(journals)/journals')({
  validateSearch: zodValidator(journalSearchSchema),
  component: JournalsPage,
})

function JournalsPage() {
  const { tableProps, modalProps } = useJournalPage()

  return (
    <div>
      <PageHeader
        title="Journals"
        breadcrumbs={[{ label: 'Journals', isCurrent: true }]}
      />

      {tableProps.isLoading ? (
        <TableSkeleton rows={8} columns={5} />
      ) : (
        <DataTable {...tableProps} />
      )}

      <JournalFormModal {...modalProps} />
    </div>
  )
}

export default JournalsPage
