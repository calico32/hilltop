'use client'

import { taxId } from '@/_lib/format'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface HiddenTaxIdProps {
  taxId: string | null
}

export default function HiddenTaxId(props: HiddenTaxIdProps): JSX.Element {
  const [visible, setVisible] = useState(false)
  return (
    <span className="flex items-center gap-2">
      {taxId(visible ? props.taxId : props.taxId?.replaceAll(/\d/g, '*') ?? null)}
      {visible ? (
        <Eye
          size={20}
          strokeWidth={1.5}
          className="cursor-pointer select-none hover:text-gray-700"
          onClick={() => setVisible(false)}
        />
      ) : (
        <EyeOff
          size={20}
          strokeWidth={1.5}
          className="cursor-pointer select-none hover:text-gray-700"
          onClick={() => setVisible(true)}
        />
      )}
    </span>
  )
}
