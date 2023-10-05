import Image from 'next/image'

interface PlaceholderProps {
  className?: string
  size?: `${number}x${number}`
}

export default function Placeholder({
  className,
  size = '800x600',
}: PlaceholderProps): JSX.Element {
  return (
    <div className={className}>
      <Image
        src={`https://picsum.photos/${size.replace('x', '/')}`}
        alt=""
        width={parseInt(size.split('x')[0])}
        height={parseInt(size.split('x')[1])}
        className="object-cover w-full h-full"
      />
    </div>
  )
}
