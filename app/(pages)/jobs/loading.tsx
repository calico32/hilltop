export default function Loading(): JSX.Element {
  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">Explore Jobs</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="skeleton">
          <div>Loading...</div>
        </div>
        <div className="skeleton">
          <div>Loading...</div>
        </div>
        <div className="skeleton">
          <div>Loading...</div>
        </div>
        <div className="skeleton">
          <div>Loading...</div>
        </div>
      </div>
    </>
  )
}
