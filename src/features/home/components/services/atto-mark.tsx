import type { SVGProps } from 'react'

/** Marca "A" da Atto (mesmo traço do favicon de attodev.com.br). */
export function AttoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="14 26 72 62" fill="none" aria-hidden="true" {...props}>
      <path
        d="M22 80 L44 34 L56 34 L78 80"
        stroke="currentColor"
        strokeWidth="13"
        strokeLinejoin="miter"
        strokeLinecap="round"
      />
      <circle cx="50" cy="63" r="6.6" fill="currentColor" />
    </svg>
  )
}
