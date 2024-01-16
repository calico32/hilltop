import { render } from '@react-email/components'
import { Result } from 'kiyoi'
import { createTransport } from 'nodemailer'
import React from 'react'
import 'server-only'

export const transport = createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export interface EmailData {
  subject: string
  html: string
  text: string
  from?: string
  replyTo?: string
}

export async function sendMail(to: string, data: EmailData): Promise<void> {
  await transport.sendMail({
    from: data.from ?? process.env.EMAIL_FROM,
    to,
    replyTo: data.replyTo ?? process.env.EMAIL_REPLY_TO,
    subject: data.subject,
    html: data.html,
    text: data.text,
  })
}

// export const sendConfirmationEmail = async (registration: Registration): Promise<void> => {
//   const html = render(React.createElement(Confirmation, { registration }))
//   const text = render(React.createElement(Confirmation, { registration }), { plainText: true })

//   await transport.sendMail({
//     from: process.env.EMAIL_FROM,
//     replyTo: process.env.EMAIL_REPLY_TO,
//     to: registration.contactEmail,
//     subject: 'Your HackUC Registration is Pending',
//     html,
//     text,
//   })
// }

interface EmailOptions<P extends {}, T extends React.ComponentType<P>> {
  props: P

  subject: string
  to: string
  from?: string
  replyTo?: string
}

export async function sendEmail<P extends {}, T extends React.ComponentType<P>>(
  component: T,
  options: EmailOptions<P, T>,
): Result.Async<void, Error> {
  const html = render(React.createElement(component, options.props))
  const text = render(React.createElement(component, options.props), { plainText: true })

  await transport.sendMail({
    from: options.from ?? process.env.EMAIL_FROM,
    replyTo: options.replyTo ?? process.env.EMAIL_REPLY_TO,
    to: options.to,
    subject: options.subject,
    html,
    text,
  })

  return Result.ok()
}
