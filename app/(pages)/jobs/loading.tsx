import Spinner from '@/_components/Spinner'

export default function Loading(): JSX.Element {
  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">Explore Jobs</h1>

      <Spinner size={32} />
    </>
  )
}
