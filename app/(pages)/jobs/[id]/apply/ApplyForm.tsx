'use client'

import ApplyFormStep1 from '@/(pages)/jobs/[id]/apply/ApplyFormStep1'
import ApplyFormStep2 from '@/(pages)/jobs/[id]/apply/ApplyFormStep2'
import ApplyFormStep3 from '@/(pages)/jobs/[id]/apply/ApplyFormStep3'
import ApplyFormStep4 from '@/(pages)/jobs/[id]/apply/ApplyFormStep4'
import { JobListing } from '@prisma/client'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

interface ApplyFormProps {
  listing: JobListing
}

interface ApplyFormValues {}

export default function ApplyForm({ listing }: ApplyFormProps): JSX.Element {
  const form = useForm<ApplyFormValues>()
  const onSubmit = async (data: ApplyFormValues) => {
    console.log(data)
  }

  const [step, setStep] = useState(0)

  const {} = form

  const steps = [
    {
      name: 'Personal Information',
      component: ApplyFormStep1,
    },
    {
      name: 'Upload Resume',
      component: ApplyFormStep2,
    },
    {
      name: 'Additional Questions',
      component: ApplyFormStep3,
    },
    {
      name: 'Review and Submit',
      component: ApplyFormStep4,
    },
  ]

  const StepComponent = steps[step].component

  const navContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!navContainer.current) return

    const listener: ResizeObserverCallback = (entries) => {
      const nav = entries[0].target as HTMLDivElement
      const navWidth = nav.offsetWidth
      const navHeight = nav.offsetHeight

      const navChildren = nav.children
      const navChildrenCount = navChildren.length

      const navChildWidth = navWidth / navChildrenCount
      const navChildHeight = navHeight

      for (let i = 0; i < navChildrenCount; i++) {
        const navChild = navChildren[i] as HTMLDivElement
        const svg = navChild.children[0] as SVGElement
        svg.setAttribute('viewBox', `0 0 ${navChildWidth} ${navChildHeight}`)
      }
    }

    const observer = new ResizeObserver(listener)
    observer.observe(navContainer.current)
    return () => observer.disconnect()
  }, [navContainer])

  return (
    <>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="!mb-0 mt-4 flex h-20 w-full text-center" ref={navContainer}>
            {steps.map(({ name }, index) => (
              <div className="relative flex-1" key={index}>
                <svg
                  preserveAspectRatio="none"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute h-full w-full"
                  viewBox="0 0 204 80"
                >
                  <rect
                    width="50%"
                    height="5%"
                    y="50%"
                    className={clsx(
                      'transition-colors',
                      index <= step ? 'fill-emeraldgreen-0' : 'fill-gray-300',
                    )}
                    stroke="none"
                  />
                  <rect
                    width="50%"
                    height="5%"
                    x="50%"
                    y="50%"
                    className={clsx(
                      'transition-colors',
                      index < step ? 'fill-emeraldgreen-0' : 'fill-gray-300',
                    )}
                    stroke="none"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="25"
                    className={clsx(
                      'circle transition-colors',
                      index <= step ? 'fill-emeraldgreen-0' : 'fill-gray-300',
                    )}
                    stroke="none"
                  />
                  <text
                    x="50%"
                    y="59%"
                    textAnchor="middle"
                    className={clsx(
                      'text-2xl font-semibold transition-colors',
                      index <= step ? 'fill-emerald-50' : 'fill-black',
                    )}
                  >
                    {index + 1}
                  </text>
                </svg>
              </div>
            ))}
          </div>
          <div className="relative !mt-0 flex w-full">
            {steps.map(({ name }, index) => {
              const style = {
                left: index <= steps.length / 2 ? `${(index / steps.length) * 100}%` : undefined,
                right:
                  index > steps.length / 2
                    ? `${((steps.length - 1 - index) / steps.length) * 100}%`
                    : undefined,
              }
              const className = clsx(
                'flex-1 text-center',
                index !== step
                  ? 'hidden sm:block sm:!left-0'
                  : 'absolute w-max sm:relative font-bold sm:!left-0',
              )
              console.log(
                `index=${index} step=${step} className=${className} style=${JSON.stringify(style)}`,
              )
              return (
                <span key={index} className={className} style={style}>
                  {name}
                </span>
              )
            })}
          </div>
          <StepComponent
            listing={listing}
            previousStep={step !== 0 ? () => setStep(step - 1) : undefined}
            nextStep={
              step !== steps.length - 1
                ? () => setStep(step + 1)
                : () => {
                    // TODO
                    return
                  }
            }
            goToStep={(step) => setStep(step)}
          />
        </form>
      </FormProvider>
    </>
  )
}
