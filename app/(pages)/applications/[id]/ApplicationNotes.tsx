'use client'

import { FullApplication } from '@/_api/applications/_types'

import api from '@/_api/client'
import Button from '@/_components/Button'
import { avatar, fullName } from '@/_lib/format'
import { User } from '@prisma/client'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Plus, SortAsc, SortDesc, Trash } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown'

interface ApplicationNotesProps {
  applicationId: string
  currentUser: User
  initialData: FullApplication['notes']
}

interface AddNewNoteForm {
  note: string
}

export default function ApplicationNotes({
  applicationId,
  currentUser,
  initialData,
}: ApplicationNotesProps): JSX.Element {
  const { data: notes, isLoading } = api.applications.$use('getNotes', applicationId)
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [isDeleting, setIsDeleting] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<AddNewNoteForm>()
  const sortedNotes = useMemo(
    () =>
      (notes?.length ? notes : initialData).toSorted((a, b) => {
        if (sort === 'newest') return b.created.getTime() - a.created.getTime()
        return a.created.getTime() - b.created.getTime()
      }),
    [notes, sort, isLoading, initialData],
  )

  return (
    <>
      <div className="flex items-center">
        <h2 className="mb-2 mt-4 flex items-center gap-4 text-2xl font-bold">
          Application Notes
          {isLoading && <Loader2 size={20} strokeWidth={1.5} className="animate-spin" />}
        </h2>
        <div className="flex-grow" />

        <Button
          color="neutral"
          small
          className="flex items-center gap-1 bg-opacity-50 shadow-none"
          onClick={() => setSort(sort === 'newest' ? 'oldest' : 'newest')}
        >
          {sort === 'newest' ? (
            <>
              <SortDesc size={20} strokeWidth={1.5} />
              <span>
                Newest <span className="hidden sm:inline">first</span>
              </span>
            </>
          ) : (
            <>
              <SortAsc size={20} strokeWidth={1.5} />
              <span>
                Oldest <span className="hidden sm:inline">first</span>
              </span>
            </>
          )}
        </Button>
      </div>

      {!sortedNotes.length && <p>There are no notes for this application.</p>}
      <div className="grid grid-flow-dense gap-4 sm:grid-cols-2">
        <AnimatePresence>
          {sortedNotes.map((note, i) => (
            <motion.div
              layout
              key={note.id}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              className="hover-target h-max"
            >
              <div className="flex h-max flex-col items-start gap-2 rounded-lg border border-gray-300 bg-white p-4">
                <div className="flex w-full items-center gap-2">
                  <Image
                    src={avatar(note.author)}
                    alt=""
                    width={24}
                    height={24}
                    className="float-left mt-px h-6 w-6 rounded-full"
                  />
                  <Link
                    className="flex-1 font-semibold hover:underline"
                    href={'/profile/' + note.authorId}
                  >
                    {fullName(note.author)}
                  </Link>
                  {currentUser.id === note.authorId && (
                    <button
                      className="hover-subject text-gray-500 hover:text-red-700"
                      onClick={async () => {
                        setIsDeleting(true)
                        await api.applications.deleteNote(note.id)
                        setIsDeleting(false)
                        api.applications.$mutate(
                          'getNotes',
                          [note.applicationId],
                          sortedNotes.filter((n) => n.id !== note.id),
                        )
                      }}
                    >
                      {isDeleting ? (
                        <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                      ) : (
                        <Trash size={16} strokeWidth={1.5} />
                      )}
                    </button>
                  )}
                </div>
                <span className="mb-1 text-sm text-gray-500">
                  {formatDistanceToNow(note.created, { addSuffix: true })}
                </span>
                <Markdown className="prose max-w-none">{note.body}</Markdown>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form
        className="relative mt-6 flex h-max gap-4"
        onSubmit={handleSubmit(async (data) => {
          const note = await api.applications.addNote(applicationId, data.note)
          if (!note.ok) {
            toast.error(note.error)
            return
          }
          reset()
          api.applications.$mutate(
            'getNotes',
            [applicationId],
            [
              ...(notes ?? []),
              {
                ...note.value,
                body: data.note,
                created: new Date(),
                authorId: currentUser.id,
                author: currentUser,
              },
            ],
          )
        })}
      >
        <div className="flex h-max flex-1 flex-col">
          <input
            type="text"
            className="h-[50px] rounded-lg border border-gray-400 pl-12"
            placeholder="New note..."
            {...register('note', {
              required: "Note can't be empty",
            })}
          />
          <span
            className={clsx(
              'mt-1 text-sm text-red-600',
              errors.note ? 'visible' : 'pointer-events-none invisible',
            )}
          >
            {errors.note?.message ?? 'Hi'}
          </span>
        </div>
        <Image
          src={avatar(currentUser)}
          alt=""
          width={24}
          height={24}
          className="absolute left-1 top-3 ml-2 rounded-full"
        />
        <Button
          className="h-[50px] !px-5"
          outlined
          color="accent"
          type="submit"
          loading={isSubmitting}
        >
          <div className="flex items-center">
            <Plus className="mr-2" />
            Add Note
          </div>
        </Button>
      </form>
    </>
  )
}
