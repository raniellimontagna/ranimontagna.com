/** Fills the `{name}` marks of a text. */
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (mark, name: string) =>
    name in values ? String(values[name]) : mark,
  )
}
