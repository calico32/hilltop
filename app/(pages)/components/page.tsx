import Button, { ButtonProps } from '@/_components/Button'

function variant<K extends keyof ButtonProps>(
  key: K,
  values: ButtonProps[K][]
): Partial<ButtonProps>[]
function variant(values: Partial<ButtonProps>[]): Partial<ButtonProps>[]
function variant(key: string | Partial<ButtonProps>[], values?: any): Partial<ButtonProps>[] {
  if (Array.isArray(key)) {
    return key
  }
  return values.map((value: any) => ({
    [key]: value,
  }))
}

function chunks<E extends unknown>(arr: E[], size: number): E[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )
}

function* combinations(variants: { [key: string]: any }[][]): Generator<{ [key: string]: any }> {
  if (variants.length === 0) {
    yield {}
    return
  }

  const [first, ...rest] = variants

  for (const value of first) {
    for (const combination of combinations(rest)) {
      yield {
        ...combination,
        ...value,
      }
    }
  }
}

export const metadata = {
  robots: { index: false, follow: false },
}

export default function Page(): JSX.Element {
  const color = variant('color', ['primary', 'accent', 'danger', 'warning', 'neutral'])
  const style = variant([{}, { outlined: true }, { minimal: true }])
  const size = variant([{ large: true }, {}, { small: true }])
  const state = variant([{}, { loading: true }, { disabled: true }])
  const variants = [color, style, size, state]

  const grid = chunks(Array.from(combinations(variants)), 9)

  return (
    <>
      <table className="!bleed-half table-auto">
        <tbody>
          {grid.map((row, i) => (
            <tr key={i} className="">
              {row.map((props, j) => (
                <td key={j} className="py-2 align-middle">
                  <Button {...props}>Button</Button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
