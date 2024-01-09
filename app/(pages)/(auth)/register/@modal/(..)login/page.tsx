import LoginForm from '@/(pages)/(auth)/login/LoginForm'
import ModalAwareLink from '@/_components/ModalAwareLink'
import ModalTitleBar from '@/_components/ModalTitleBar'
import PageModal from '@/_components/PageModal'

export default function Page(): JSX.Element {
  return (
    <PageModal>
      <ModalTitleBar className="absolute right-8 top-8">
        <></>
      </ModalTitleBar>
      <div className="flex w-[30ch] flex-col items-center gap-4 rounded-lg p-2 xs:w-[35ch] sm:w-[45ch]">
        <h1 className="text-2xl font-semibold xs:text-3xl">Welcome back!</h1>

        <div className="text-sm text-gray-500">
          Don't have an account?{' '}
          <ModalAwareLink href="/register" className="text-blue-600 underline">
            Register
          </ModalAwareLink>{' '}
          today!
        </div>

        <LoginForm />
      </div>
    </PageModal>
  )
}
