import CareerAnimation from '@/_components/CareerAnimation'
import Image from 'next/image'
import Link from 'next/link'

export default async function Home() {
  return (
    <>
      <Image
        src={(await import('@/_assets/senior2.png')).default}
        width={3200}
        height={2100}
        priority
        alt=""
        className="absolute -z-10 w-full brightness-75 object-cover object-center bleed-full h-[400px] pointer-events-none"
      />

      <div className="absolute -z-10 w-full brightness-75 object-cover object-center bleed-full h-[400px] pointer-events-none bg-black/50"></div>

      <div className="h-[320px] text-white xl:text-7xl lg:text-6xl sm:text-5xl text-4xl font-semibold pb-8 drop-shadow-lg font-serif !bleed-half flex flex-col justify-center">
        <div className="text-center flex flex-col items-center">
          <div>Jumpstart your</div>
          <CareerAnimation />
          <div>career at Lantern Hill.</div>
        </div>
      </div>

      <div className="font-serif mt-8">
        <h1 className="text-5xl text-center">Welcome to Lantern Hill</h1>
        <h2 className="text-3xl mt-1 text-emeraldgreen-1 text-center">Senior Living Community</h2>
        <p className="pb-2 ml-8 mr-8">
          Latern Hill Senior Living Community provides modern apartments for our tenets. We strive
          to provide the best experience we can. We do more than provide excellent customer service,
          we provide a great employee experience. Workers can expect health insurance, dental
          insurance, scholarships, and more.{' '}
          <Link className="text-emeraldgreen-1" href="/register">
            <u>Join our team today!</u>
          </Link>
        </p>
      </div>

      {/* <div className="relative z-10">
        <h1 className="text-5xl font-bold">Hilltop</h1>
        <p className="text-xl">The best way to find a job in the mountains.</p>
      </div> */}
    </>
  )
}
