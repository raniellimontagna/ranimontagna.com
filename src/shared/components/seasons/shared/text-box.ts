/** The text's own box, not the full-width line block (jsdom has no Range rects). */
export function textBox(line: Element): DOMRect {
  const range = document.createRange()
  range.selectNodeContents(line)
  return typeof range.getBoundingClientRect === 'function'
    ? range.getBoundingClientRect()
    : line.getBoundingClientRect()
}
