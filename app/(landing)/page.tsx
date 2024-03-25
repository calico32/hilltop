import CareerAnimation from '@/_components/CareerAnimation'
import Image from 'next/image'

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
        className="bleed-full pointer-events-none absolute -z-10 h-[400px] w-full object-cover object-center brightness-75"
      />

      <div className="bleed-full pointer-events-none absolute -z-10 h-[400px] w-full bg-black/50 object-cover object-center brightness-75"></div>

      <div className="!bleed-half flex h-[320px] flex-col justify-center pb-8 font-serif text-4xl font-semibold text-white drop-shadow-lg sm:text-5xl lg:text-6xl xl:text-7xl">
        <div className="flex flex-col items-center text-center">
          <div>Jumpstart your</div>
          <CareerAnimation />
          <div>career at Lantern Hill.</div>
        </div>
      </div>

      <div className="mt-8 space-y-16">
        <div className="space-y-4">
          <p className="font-serif text-3xl font-semibold">
            Lantern Hill is home to a diverse group of people who believe in providing the best
            possible care to our residents.
          </p>
          <p className="text-2xl">
            Join us in our mission to provide exceptional care for the community's senior citizens.
            We're looking for people who are passionate about helping others want to make a
            difference in the lives of our residents.
          </p>
        </div>

        <div>
          <Image
            className="float-right mb-4 ml-4 w-1/2 flex-1 rounded-md"
            src="https://picsum.photos/400/300?h"
            width={400}
            height={300}
            priority
            alt=""
          />
          <div className="flex-1 space-y-4">
            <h1 className="font-serif text-3xl font-semibold">Jumpstart your career.</h1>
            <p>
              We're always looking for talented, passionate people to join our team. We offer a
              variety of career opportunities in our community, including dining, housekeeping,
              maintenance, nursing, and more.
            </p>
            <p>
              <strong>Are you a student looking for a part-time job?</strong> We hire high-school
              and college students for part-time positions in our dining room. You'll get hands-on
              experience in a professional environment with flexible hours that fit your schedule.
              We also offer scholarship opportunities for students who prove themselves to be
              exceptional.
            </p>
          </div>
        </div>

        <div>
          <Image
            className="float-left mb-4 mr-4 w-1/2 flex-1 rounded-md"
            src="https://picsum.photos/400/300"
            width={400}
            height={300}
            alt=""
          />
          <div className="flex-1 space-y-4">
            <h1 className="font-serif text-3xl font-semibold">Unbeatable benefits.</h1>
            <p>
              We offer competitive pay and benefits, including medical, dental, vision, life
              insurance, 401(k) with company match, and paid time off.
            </p>
            <p>
              You'll also have access to our employee assistance program, which provides free
              counseling and support for you and your family. We also offer tuition reimbursement
              for employees who want to further their education.
            </p>
          </div>
        </div>

        <div>
          <Image
            className="float-right mb-4 ml-4 w-1/2 flex-1 rounded-md"
            src="https://picsum.photos/500/300?i"
            width={500}
            height={300}
            alt=""
          />
          <div className="space-y-4">
            <h1 className="font-serif text-3xl font-semibold">A community that cares.</h1>
            <p>
              We're committed to providing a safe and supportive environment for our employees. At
              Lantern Hill, we believe that everyone deserves to be treated with respect and
              dignity.
            </p>
            <p>
              We're proud to be an equal opportunity employer and are committed to creating a
              diverse and inclusive workplace. We believe that diversity makes us stronger and
              fosters a culture of innovation and collaboration. No matter who you are or where
              you're from, you'll be welcomed with open arms at Lantern Hill.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
