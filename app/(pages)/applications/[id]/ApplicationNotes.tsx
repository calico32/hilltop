'use client'

import { FullApplication } from '@/_api/applications'
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
  const { data: notes, isLoading } = api.$use('getApplicationNotes', applicationId)
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
    [notes, sort, isLoading, initialData]
  )

  return (
    <>
      <div className="flex items-center">
        <h2 className="mt-4 mb-2 font-bold text-2xl flex gap-4 items-center">
          Application Notes
          {isLoading && <Loader2 size={20} strokeWidth={1.5} className="animate-spin" />}
        </h2>
        <div className="flex-grow" />

        <Button
          color="neutral"
          small
          className="flex items-center gap-1 shadow-none bg-opacity-50"
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
      <div className="grid sm:grid-cols-2 gap-4 grid-flow-dense">
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
              <div className="flex flex-col items-start gap-2 p-4 border border-gray-300 rounded-lg bg-white h-max">
                <div className="flex items-center gap-2 w-full">
                  <Image
                    src={avatar(note.author)}
                    alt=""
                    width={24}
                    height={24}
                    className="float-left w-6 h-6 mt-px rounded-full"
                  />
                  <Link
                    className="font-semibold hover:underline flex-1"
                    href={'/profile/' + note.authorId}
                  >
                    {fullName(note.author)}
                  </Link>
                  {currentUser.id === note.authorId && (
                    <button
                      className="text-gray-500 hover:text-red-700 hover-subject"
                      onClick={async () => {
                        setIsDeleting(true)
                        await api.deleteApplicationNote(note.id)
                        setIsDeleting(false)
                        api.$mutate(
                          'getApplicationNotes',
                          [note.applicationId],
                          sortedNotes.filter((n) => n.id !== note.id)
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
                <span className="text-sm text-gray-500 mb-1">
                  {formatDistanceToNow(note.created, { addSuffix: true })}
                </span>
                <Markdown className="prose max-w-none">{note.body}</Markdown>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form
        className="flex gap-4 mt-6 relative h-max"
        onSubmit={handleSubmit(async (data) => {
          const note = await api.addApplicationNote(applicationId, data.note)
          if (!note.ok) {
            toast.error(note.error)
            return
          }
          reset()
          api.$mutate(
            'getApplicationNotes',
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
            ]
          )
        })}
      >
        <div className="flex flex-col flex-1 h-max">
          <input
            type="text"
            className="border border-gray-400 rounded-lg pl-12 h-[50px]"
            placeholder="New note..."
            {...register('note', {
              required: "Note can't be empty",
            })}
          />
          <span
            className={clsx(
              'text-red-600 text-sm mt-1',
              errors.note ? 'visible' : 'invisible pointer-events-none'
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
          className="absolute ml-2 rounded-full top-3 left-1"
        />
        <Button
          className="!px-5 h-[50px]"
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
