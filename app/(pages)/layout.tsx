import AppBar from '@/_components/AppBar'
import Footer from '@/_components/Footer'

export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      <AppBar />
      <div className="h-28"></div>
      {modal}
      {children}
      <Footer />
    </>
  )
}
