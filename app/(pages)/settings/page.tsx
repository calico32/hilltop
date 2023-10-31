import PasskeyList from '@/(pages)/settings/PasskeyList'
import RegisterPasskeyButton from './RegisterPasskey'

export default async function Page(): Promise<JSX.Element> {
  return (
    <>
      <h1 className="text-3xl font-semibold">Settings</h1>

      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-semibold">Passkeys</h2>
        <RegisterPasskeyButton />
      </div>
      <hr className="my-3 border-gray-600" />
      <PasskeyList />
    </>
  )
}
