import Button, { ButtonProps } from '@/_components/Button'

function variant<const K extends keyof ButtonProps<'button'>>(
  key: K,
  values: ButtonProps<'button'>[K][]
) {
  return values.map((value) => ({
    [key]: value,
  })) as { [key in K]: ButtonProps<'button'>[K] }[]
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

export default function Page(): JSX.Element {
  const color = variant('color', ['primary', 'accent', 'danger', 'warning', 'neutral'])
  const minimal = variant('minimal', [false, true])
  const loading = variant('loading', [false, true])
  const small = variant('small', [false, true])
  const variants = [color, minimal, small, loading]

  const c = Array.from(combinations(variants))

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        {c.map((props, i) => (
          <div key={i}>
            <Button {...props}>Button</Button>
          </div>
        ))}
      </div>
    </>
  )
}
