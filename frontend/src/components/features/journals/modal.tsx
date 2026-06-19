import { useEffect } from 'react'
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@heroui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen, Calendar } from 'lucide-react'
import type { JournalFormData } from '@/lib/schemas/journals'
import type { Journal } from '@/lib/services/journal.service'
import { journalSchema } from '@/lib/schemas/journals'

interface JournalFormModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingJournal: Journal | null
  onSubmit: (data: JournalFormData) => void
  isLoading?: boolean
  isReadOnly?: boolean
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 px-4 rounded-xl bg-default-50 border border-default-100">
      <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest leading-none">
        {label}
      </span>
      <span className="text-sm font-medium text-default-700 whitespace-pre-wrap">
        {value || 'N/A'}
      </span>
    </div>
  )
}

export function JournalFormModal({
  isOpen,
  onOpenChange,
  editingJournal,
  onSubmit,
  isLoading = false,
  isReadOnly = false,
}: JournalFormModalProps) {
  const isEditing = !!editingJournal

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        title: editingJournal?.title ?? '',
        content: editingJournal?.content ?? '',
        date: editingJournal?.date ? editingJournal.date.slice(0, 10) : '',
      })
    }
  }, [isOpen, editingJournal, reset])

  const title = isReadOnly
    ? 'Journal Details'
    : isEditing
      ? 'Edit Journal'
      : 'New Journal Entry'

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex gap-2 items-center">
              <BookOpen size={20} className="text-primary" />
              <span>{title}</span>
            </ModalHeader>

            <ModalBody className="pb-6">
              {isReadOnly ? (
                <div className="flex flex-col gap-3">
                  <DetailRow label="Title" value={editingJournal?.title} />
                  <DetailRow label="Content" value={editingJournal?.content} />
                  <DetailRow
                    label="Date"
                    value={
                      editingJournal?.date
                        ? new Date(editingJournal.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : null
                    }
                  />
                </div>
              ) : (
                <form
                  id="journal-form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <Input
                    label="Title"
                    placeholder="Enter journal title"
                    isInvalid={!!errors.title}
                    errorMessage={errors.title?.message}
                    {...register('title')}
                  />
                  <Textarea
                    label="Content"
                    placeholder="Write your journal entry here..."
                    minRows={5}
                    isInvalid={!!errors.content}
                    errorMessage={errors.content?.message}
                    {...register('content')}
                  />
                  <Input
                    label="Date"
                    type="date"
                    placeholder="Select date"
                    startContent={<Calendar size={16} className="text-default-400" />}
                    isInvalid={!!errors.date}
                    errorMessage={errors.date?.message}
                    {...register('date')}
                  />
                </form>
              )}
            </ModalBody>

            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                {isReadOnly ? 'Close' : 'Cancel'}
              </Button>
              {!isReadOnly && (
                <Button
                  color="primary"
                  type="submit"
                  form="journal-form"
                  isLoading={isLoading}
                >
                  {isEditing ? 'Save Changes' : 'Create Journal'}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
