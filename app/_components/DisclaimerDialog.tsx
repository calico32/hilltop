'use client'

import Button from '@/_components/Button'
import Modal from '@/_components/Modal'
import { useEffect, useState } from 'react'

export default function DisclaimerDialog(): JSX.Element {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const disclaimer = localStorage.getItem('disclaimer')

    if (disclaimer === 'true') {
      setOpen(false)
    } else {
      setOpen(true)
    }
  })

  return (
    <Modal open={open} onClose={() => {}} className="max-w-xl">
      <h1 className="text-2xl font-semibold">Hilltop Disclaimer</h1>

      <p className="rounded-md border border-amber-600 bg-amber-100 p-4 text-lg text-amber-950">
        <strong>Hilltop is not a real hiring platform. </strong>
        This is a student project for an{' '}
        <a
          href="https://www.fbla.org/divisions/fbla/"
          className="text-blue-600 underline"
          target="_blank"
        >
          FBLA
        </a>{' '}
        competition and does not represent any company or organization. All data is fictional and
        does not represent real job offerings.
      </p>

      <p>
        <strong>
          Hilltop is not affiliated with Lantern Hill, a senior living community in New Providence,
          NJ; Erickson Senior Living, a network of senior living communities across the United
          States; or any other company or organization.
        </strong>
      </p>

      <p>
        If you are looking for the actual Erickson Senior Living career page, you can find it{' '}
        <a
          href="https://erickson.wd5.myworkdayjobs.com/External"
          className="text-blue-600 underline"
        >
          here
        </a>
        .
      </p>

      <p>
        By clicking "I understand", you agree to the above statements and understand that this is
        not a real job search platform. Hilltop is not responsible for losses or damages caused by
        misuse of this website.
      </p>

      <p>
        If you do not agree to the above statements, please close this page and do not use this
        website.
      </p>

      <Button
        onClick={() => {
          localStorage.setItem('disclaimer', 'true')
          setOpen(false)
        }}
      >
        I understand, continue to site
      </Button>
    </Modal>
  )
}
