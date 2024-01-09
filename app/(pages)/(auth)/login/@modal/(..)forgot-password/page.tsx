import ForgotPasswordForm from '@/(pages)/(auth)/forgot-password/ForgotPasswordForm'
import ModalTitleBar from '@/_components/ModalTitleBar'
import PageModal from '@/_components/PageModal'

export default function Page(): JSX.Element {
  return (
    <PageModal>
      <ModalTitleBar className="absolute right-8 top-8">
        <></>
      </ModalTitleBar>

      <div className="flex w-[30ch] flex-col items-center gap-4 rounded-lg p-2 xs:w-[35ch] sm:w-[45ch]">
        <h1 className="text-2xl font-semibold">Reset your Password</h1>

        <p className="">
          Enter the email address associated with your account and we'll send you a link to reset
          your password.
        </p>

        <ForgotPasswordForm />
      </div>
    </PageModal>
  )
}
