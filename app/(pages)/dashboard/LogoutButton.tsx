'use client'

import Button from '@/_components/Button'
import { useRouter } from 'next/navigation'

export default function LogoutButton(): JSX.Element {
  const router = useRouter()

  return (
    <Button
      className="bg-navyblue-0 text-white w-max p-4 px-10 text-xl rounded-md shadow-md mt-2 font-semibold"
      onClick={async () => {}}
      loading
    >
      Log out
    </Button>
  )
}
