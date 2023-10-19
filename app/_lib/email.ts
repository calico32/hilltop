import { createTransport } from 'nodemailer'

export const transport = createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  authMethod: 'STARTTLS',
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
