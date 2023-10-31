import Image from 'next/image'

export default async function Home() {
  return (
    <>
      <Image
        src={(await import('@/_assets/header.png')).default}
        width={3200}
        height={2100}
        priority
        alt=""
        className="absolute -z-10 w-full brightness-75 object-cover bleed-full h-[400px]"
      />

      <div className="h-[320px] flex-col text-white text-4xl flex justify-center p-8 drop-shadow-md !bleed-half">
        Hello
      </div>

      <div className="font-serif mt-8">
        <h1 className="text-5xl">Welcome to Lantern Hill</h1>
        <h2 className="text-3xl mt-1 text-emeraldgreen-1">Senior Living Community</h2>
        <p className="pb-2">
          Latern Hill Senior Living Community provides modern apartments for our tenets. We strive
          to provide the best experience we can. We do more than provide excellent customer service,
          we provide a great employee experience. Workers can expect health insurance, dental
          insurance, scholarships, and more. Join our team today!
        </p>
      </div>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque a auctor nisi. Aenean
        nec ornare augue. Aliquam in lacus id augue rhoncus laoreet. Proin et urna tempor, tempus
        lorem vel, rutrum turpis. Duis egestas quam sit amet turpis sodales consequat. Donec
        sagittis arcu magna, eu condimentum magna elementum vel. Donec at ullamcorper lorem, sed
        imperdiet nulla. Vivamus sed urna sapien. Quisque consectetur nunc sed pulvinar aliquet.
      </p>
      <p>
        Quisque vitae ultricies mi. Nam euismod ornare magna id accumsan. Nullam a libero ipsum.
        Integer eu mattis arcu. Morbi pulvinar magna nec risus sagittis, ut blandit tellus interdum.
        Suspendisse aliquam eros vitae laoreet consequat. Fusce a nibh nisi. Sed scelerisque semper
        ante, ac posuere lacus commodo in. Aliquam a velit a dolor posuere iaculis ut egestas velit.
        Quisque quis luctus arcu. Suspendisse pulvinar nulla eget diam imperdiet dapibus. Quisque
        vel magna sed odio rhoncus ultrices et eget enim. Morbi sed efficitur tellus. Aliquam
        tristique arcu et venenatis placerat. Vestibulum mollis sem a elit aliquet imperdiet. Sed
        quis odio vel libero varius feugiat ac id felis.
      </p>
      <p>
        Ut suscipit nulla dolor, pellentesque egestas nunc sodales et. Maecenas pulvinar orci vel
        tincidunt pulvinar. Aliquam pharetra luctus egestas. Pellentesque ipsum orci, consectetur
        non massa non, iaculis molestie nibh. Aliquam nec purus finibus, blandit leo non, eleifend
        magna. Donec congue dolor quam, a aliquam tellus mollis ac. In nec erat quis libero mollis
        dignissim. Integer tristique eget leo non malesuada. Sed aliquet sit amet magna ac lobortis.
        Ut nisl nisi, scelerisque lobortis massa id, finibus pulvinar nibh. Sed ultrices dolor ac
        augue volutpat, eget gravida ipsum interdum. Nullam aliquam vehicula metus sit amet
        vehicula. Vestibulum eu massa in augue hendrerit ullamcorper. Nunc eget erat magna.
      </p>
      <p>
        Donec hendrerit mauris sit amet dui aliquam sodales. Vivamus tempor et elit a blandit.
        Maecenas aliquet, lectus ut pellentesque lacinia, nisi ex hendrerit dolor, a ornare massa
        elit vitae nibh. In vitae dui orci. Etiam non diam dolor. Vestibulum vel viverra leo, ac
        volutpat est. Vivamus scelerisque auctor eros, a condimentum turpis porttitor eu. Cras quis
        pretium arcu. Donec risus urna, ultrices nec nisl in, blandit auctor nisl. Vestibulum
        euismod efficitur elit.
      </p>
      <p>
        Proin sed justo et neque hendrerit dignissim id ut urna. Mauris tortor erat, facilisis quis
        nulla et, dapibus posuere massa. Proin finibus sem eget sollicitudin interdum. Aliquam erat
        volutpat. Nulla facilisi. Proin lorem felis, consectetur ut vulputate consequat, fermentum
        id nibh. Etiam scelerisque aliquam enim in ultrices.
      </p>
      {/* <div className="relative z-10">
        <h1 className="text-5xl font-bold">Hilltop</h1>
        <p className="text-xl">The best way to find a job in the mountains.</p>
      </div> */}
    </>
  )
}
