import { Tooltip } from '@heroui/react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import type { Column } from '@/components/templates/datatable'
import type { Journal } from '@/lib/services/journal.service'

interface GetColumnsParams {
  onView: (journal: Journal) => void
  onEdit: (journal: Journal) => void
  onDelete: (id: number) => void
  hasPermission: (permission: string) => boolean
}

export const getColumns = ({
  onView,
  onEdit,
  onDelete,
  hasPermission,
}: GetColumnsParams): Array<Column<Journal>> => [
  { name: 'ID', uid: 'id', sortable: true },
  {
    name: 'Title',
    uid: 'title',
    sortable: true,
    truncate: true,
    maxWidth: 220,
  },
  {
    name: 'Content',
    uid: 'content',
    truncate: true,
    maxWidth: 300,
  },
  {
    name: 'Date',
    uid: 'date',
    sortable: true,
    render: (item) =>
      item.date ? format(new Date(item.date), 'dd MMM yyyy') : '-',
    exportValue: (item) =>
      item.date ? format(new Date(item.date), 'yyyy-MM-dd') : '',
  },
  {
    name: 'Created At',
    uid: 'createdAt',
    sortable: true,
    render: (item) => format(new Date(item.createdAt), 'dd MMM yyyy HH:mm'),
    exportValue: (item) => format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm:ss'),
  },
  {
    name: 'Actions',
    uid: 'actions',
    render: (item) => (
      <div className="relative flex items-center gap-2">
        {hasPermission('journals.read') && (
          <Tooltip content="View details">
            <span
              className="text-lg text-default-400 cursor-pointer active:opacity-50"
              onClick={() => onView(item)}
            >
              <Eye size={16} />
            </span>
          </Tooltip>
        )}
        {hasPermission('journals.update') && (
          <Tooltip content="Edit journal">
            <span
              className="text-lg text-default-400 cursor-pointer active:opacity-50"
              onClick={() => onEdit(item)}
            >
              <Pencil size={16} />
            </span>
          </Tooltip>
        )}
        {hasPermission('journals.delete') && (
          <Tooltip color="danger" content="Delete journal">
            <span
              className="text-lg text-danger cursor-pointer active:opacity-50"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 size={16} />
            </span>
          </Tooltip>
        )}
      </div>
    ),
  },
]
