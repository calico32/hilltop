export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}): JSX.Element {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
