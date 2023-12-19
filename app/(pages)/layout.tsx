import AppBar from '@/_components/AppBar'

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
    </>
  )
}
