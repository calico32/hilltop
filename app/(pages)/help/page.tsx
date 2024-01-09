'use client'

import { Disclosure } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

export default function Page(): JSX.Element {
  return (
    <>
      <h1 className="text-3xl font-semibold">Help &amp; Support</h1>

      <h2 className="mt-8 text-xl font-semibold">Frequently Asked Questions</h2>

      <motion.div layout className="mt-8 space-y-4 rounded-md bg-blue-50 p-2">
        <Disclosure as={motion.div} layout className="">
          <Disclosure.Button
            as={motion.button}
            layout
            className="flex w-full justify-between rounded-md bg-blue-400/30 px-5 py-3 text-left font-semibold text-blue-900"
          >
            <span>What is Hilltop?</span>
            <ChevronLeft className="transform transition duration-150 ui-open:-rotate-90" />
          </Disclosure.Button>

          <AnimatePresence>
            <Disclosure.Panel
              as={motion.div}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              Hilltop is a (fictional) hiring platform for looking for brilliant workers looking to
              join the Lantern Hill team. We're a company that values diversity, inclusion, and
              equity, and we want to make sure that our hiring process reflects that.
            </Disclosure.Panel>
          </AnimatePresence>
        </Disclosure>

        <Disclosure as={motion.div} layout className="">
          <AnimatePresence>
            <Disclosure.Button
              as={motion.button}
              layout
              className="flex w-full justify-between rounded-md bg-blue-400/30 p-4 text-left font-semibold text-blue-950"
            >
              <span>What do I need to apply?</span>
              <ChevronLeft className="transform transition duration-150 ui-open:-rotate-90" />
            </Disclosure.Button>

            <Disclosure.Panel
              as={motion.div}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 text-blue-950"
            >
              <p>
                Job applications require your name, email address, and personal details like your
                date of birth and street address. You can optionally upload a resume to your profile
                to make applying for jobs easier.
              </p>
              <p>
                Job-specific requirements are listed on the job posting. For example, some jobs may
                require prior experience or a certain level of education.
              </p>
            </Disclosure.Panel>
          </AnimatePresence>
        </Disclosure>
      </motion.div>
    </>
  )
}
