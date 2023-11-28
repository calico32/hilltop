export function truncate(str: string | null | undefined, len: number): string {
  if (!str) return ''
  if (str.length <= len) return str
  return `${str.slice(0, len - 3)}…`
}
