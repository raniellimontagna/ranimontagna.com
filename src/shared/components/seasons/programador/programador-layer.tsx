'use client'

import { TokensCanvas } from './tokens-canvas'
import './programador.css'

/** Everything Programmer's Day adds on top of the site. Downloaded only in season. */
export function ProgramadorLayer(_props: { locale: string }) {
  return <TokensCanvas />
}
