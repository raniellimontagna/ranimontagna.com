/** Christmas texts in the site's three languages. */
export type NatalCopy = {
  giftClosed: string
  giftOpened: string
  found: string
  soundOn: string
  soundOff: string
  openGlobe: string
}

const COPY: Record<'pt' | 'en' | 'es', NatalCopy> = {
  pt: {
    giftClosed: 'Abrir presente escondido',
    giftOpened: 'Presente aberto',
    found: 'presentes encontrados',
    soundOn: 'Desligar o som de Natal',
    soundOff: 'Ligar o som de Natal',
    openGlobe: 'Abrir o globo de neve',
  },
  en: {
    giftClosed: 'Open hidden gift',
    giftOpened: 'Gift opened',
    found: 'gifts found',
    soundOn: 'Turn the Christmas sound off',
    soundOff: 'Turn the Christmas sound on',
    openGlobe: 'Open the snow globe',
  },
  es: {
    giftClosed: 'Abrir regalo escondido',
    giftOpened: 'Regalo abierto',
    found: 'regalos encontrados',
    soundOn: 'Apagar el sonido de Navidad',
    soundOff: 'Encender el sonido de Navidad',
    openGlobe: 'Abrir la bola de nieve',
  },
}

export function getNatalCopy(locale: string): NatalCopy {
  return COPY[locale as keyof typeof COPY] ?? COPY.pt
}
