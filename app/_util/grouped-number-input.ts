export const groupedNumberOnChange =
  (groups: [number, ...number[]], separator = '-', callback: (formatted: string) => void) =>
  (e: KeyboardEvent) => {
    const totalDigits = groups.reduce((acc, curr) => acc + curr, 0)

    const value = (e.target as HTMLInputElement).value

    const numbers = value.replace(/\D/g, '').split('')

    if (numbers.length !== totalDigits) {
      return
    }

    const grouped: string[] = []
    let index = 0
    for (const group of groups) {
      grouped.push(numbers.slice(index, index + group).join(''))
      index += group
    }

    callback(grouped.join(separator))
  }

// export const groupedNumberOnKeyDown =
//   (groups: [number, ...number[]], separator = '-', callback: (formatted: string) => void) =>
//   (e: KeyboardEvent) => {
//     const value = (e.target as HTMLInputElement).value
//   }
