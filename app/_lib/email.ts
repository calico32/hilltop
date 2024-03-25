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

export async function sendEmail<P extends {}, T extends React.ComponentType<P>>(
  component: T,
  options: EmailOptions<P, T>,
): Result.Async<void, Error> {
  const html = render(React.createElement(component, options.props))
  const text = render(React.createElement(component, options.props), { plainText: true })

  // await transport.sendMail({
  //   from: options.from ?? process.env.EMAIL_FROM ?? 'noreply@hilltop.works',
  //   replyTo: options.replyTo ?? process.env.EMAIL_REPLY_TO,
  //   subject: options.subject,
  //   to: options.to,
  //   html,
  //   text,
  //   attachments: [{}],
  // })

  return Result.ok()
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

// export async function sendEmail<P extends {}, T extends React.ComponentType<P>>(
//   component: T,
//   options: EmailOptions<P, T>,
// ): Result.Async<void, Error> {
//   const html = render(React.createElement(component, options.props))
//   const text = render(React.createElement(component, options.props), { plainText: true })

//   const resend = new Resend(process.env.RESEND_API_KEY!);

//   const o = {
//     from: options.from ?? process.env.EMAIL_FROM ?? 'noreply@hilltop.works',
//     reply_to: options.replyTo ?? process.env.EMAIL_REPLY_TO,
//     subject: options.subject,
//     to: options.to,
//     html,
//     text,
//   }

//   console.log(o)

//   await resend.emails.send(o)

//   return Result.ok()
// }
