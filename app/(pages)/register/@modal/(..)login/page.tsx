import LoginForm from '@/(pages)/login/LoginForm'
import ModalAwareLink from '@/_components/ModalAwareLink'
import ModalTitleBar from '@/_components/ModalTitleBar'
import PageModal from '@/_components/PageModal'

export default function Page(): JSX.Element {
  return (
    <PageModal>
      <ModalTitleBar className="absolute right-8 top-8">
        <></>
      </ModalTitleBar>
      <div className="p-2 rounded-lg flex items-center flex-col gap-4 w-[30ch] xs:w-[35ch] sm:w-[45ch]">
        <h1 className="text-2xl xs:text-3xl font-semibold">Welcome back!</h1>

        <div className="text-gray-500 text-sm">
          Don't have an account?{' '}
          <ModalAwareLink href="/register" className="underline text-blue-600">
            Register
          </ModalAwareLink>{' '}
          today!
        </div>

        <LoginForm />
      </div>
    </PageModal>
  )
}
