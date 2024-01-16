import CareerAnimation from '@/_components/CareerAnimation'
import Image from 'next/image'
import Link from 'next/link'

const imageWidth = 1200
const imageHeight = Math.round(imageWidth * (21 / 32))

export default async function Home() {
  return (
    <>
      <Image
        src={(await import('@/_assets/senior2.png')).default}
        width={imageWidth}
        height={imageHeight}
        priority
        alt=""
        className="bleed-full pointer-events-none absolute -z-10 h-[400px] w-full object-cover object-center blur-sm brightness-75"
      />

      <div className="bleed-full pointer-events-none absolute -z-10 h-[400px] w-full bg-black/50 object-cover object-center brightness-75"></div>

      <div className="!bleed-half flex h-[320px] flex-col justify-center pb-8 font-serif text-4xl font-semibold text-white drop-shadow-lg sm:text-5xl lg:text-6xl xl:text-7xl">
        <div className="flex flex-col items-center text-center">
          <div>Jumpstart your</div>
          <CareerAnimation />
          <div>career at Lantern Hill.</div>
        </div>
      </div>

      <div className="mt-8 font-serif">
        <h1 className="text-center text-5xl">Welcome to Lantern Hill</h1>
        <h2 className="mt-1 text-center text-3xl text-emeraldgreen-1">Senior Living Community</h2>
        <p className="ml-8 mr-8 pb-2">
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
