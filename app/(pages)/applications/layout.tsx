export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal?: boolean
}): JSX.Element {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
