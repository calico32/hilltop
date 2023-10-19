import AppBar from '@/_components/AppBar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppBar />
      <div className="h-28"></div>

      {children}
    </>
  )
}
