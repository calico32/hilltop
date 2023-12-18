import AppBar from '@/_components/AppBar'
import Footer from '@/_components/Footer'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppBar landing />
      <div className="h-[72px]"></div>
      {children}
      <Footer />
    </>
  )
}
