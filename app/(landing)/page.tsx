import Image from 'next/image'
import Link from 'next/link'

export default async function Home() {
  return (
    <>
      <Image
        src={(await import('@/_assets/header.png')).default}
        width={3200}
        height={2100}
        alt=""
        className="absolute -z-10 w-full brightness-75 object-cover bleed-full h-[400px]"
      />

      <div className="font-serif">
        <h1 className="text-5xl mt-[22rem]">Welcome to Lantern Hill</h1>
        <h2 className="text-3xl mt-1 ml-4 text-emeraldgreen-1">Senior Living Community</h2>
        <p>
          Latern Hill Senior Living Community provides modern apartments for our tenets. We strive
          to provide the best experience we can. We do more than provide excellent customer service,
          we provide a great employee experience. Workers can expect health insurance, dental
          insurance, scholarships, and more. Join our team today!
        </p>
        <Link href="jobs/">Join Here</Link>
      </div>
      {/* <div className="relative z-10">
        <h1 className="text-5xl font-bold">Hilltop</h1>
        <p className="text-xl">The best way to find a job in the mountains.</p>
      </div> */}
    </>
  )
}
