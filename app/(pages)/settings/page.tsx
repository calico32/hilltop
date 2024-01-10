import HiddenTaxId from '@/(pages)/applications/[id]/HiddenTaxId'
import PasskeyList from '@/(pages)/settings/PasskeyList'
import server from '@/_api/server'
import { fullName } from '@/_lib/format'
import { notFound } from 'next/navigation'
import RegisterPasskeyButton from './RegisterPasskey'
import styles from './page.module.css'

export const metadata = {
  robots: { index: false, follow: false },
}

export default async function Page(): Promise<JSX.Element> {
  const user = await server.users.get()
  if (!user) {
    return notFound()
  }
  const sensitive = (await server.users.getSensitiveData())!
  const passkeys = await server.passkeys.getAll()

  return (
    <>
      <h1 className="mb-8 text-3xl font-semibold">Settings</h1>

      <div className={styles.settings}>
        <h2 className="text-2xl font-semibold">Profile</h2>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            Name
            <span className="text-gray-500">{fullName(user)}</span>
          </div>
          <div className="flex items-baseline gap-2">
            Bio
            <span className="text-gray-500">{user.bio}</span>
          </div>
          <div className="flex items-baseline gap-2">
            Address
            <div className="flex flex-col">
              <span className="text-gray-500">{user.address1}</span>
              <span className="text-gray-500">{user.address2}</span>
              <span className="text-gray-500">
                {user.city}, {user.state} {user.zip}
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            Phone
            <span className="text-gray-500">{user.phone}</span>
          </div>
          <div className="flex items-baseline gap-2">
            Birthday
            <span className="text-gray-500">{new Date(sensitive.dob).toLocaleDateString()}</span>
          </div>
          <div className="flex items-baseline gap-2">
            Tax ID
            <span className="text-gray-500">
              <HiddenTaxId taxId={sensitive.taxId} />
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        <h2 className="text-2xl font-semibold">Account</h2>
        <div className="flex items-baseline gap-2">
          Email
          <span className="text-gray-500">{user.email}</span>
        </div>

        <div className={styles.divider} />

        <h2 className="text-2xl font-semibold">Password</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-gray-500">********</span>
        </div>

        <div className={styles.divider} />

        <div className="flex flex-col items-start gap-4">
          <h2 className="text-2xl font-semibold">Passkeys</h2>

          <p className="text-gray-500">
            Passkeys let you sign in to websites without a password, using a physical device like a
            security key or your phone.
          </p>

          <RegisterPasskeyButton />
        </div>
        <div className="">
          <PasskeyList initialData={passkeys} />
        </div>
      </div>
    </>
  )
}
