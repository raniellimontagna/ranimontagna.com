/** Christmas texts in the site's three languages. `{name}` marks a value to fill in. */
export type NatalCopy = {
  /** `{n}` and `{total}`: every gift gets its own name for screen readers. */
  giftClosed: string
  giftOpened: string
  found: string
  sound: string
  openGlobe: string
  cardTitle: string
  /** `{next}`: the year that is coming. */
  cardBody: string
  shareText: string
  shake: string
  shakePhone: string
  share: string
  linkCopied: string
  close: string
  globeLabel: string
  oneDay: string
  /** `{n}` is replaced by the number of days. */
  manyDays: string
  christmas: string
  after: string
}

const COPY: Record<'pt' | 'en' | 'es', NatalCopy> = {
  pt: {
    giftClosed: 'Abrir presente escondido ({n} de {total})',
    giftOpened: 'Presente aberto ({n} de {total})',
    found: 'presentes encontrados',
    sound: 'Som de Natal',
    openGlobe: 'Abrir o globo de neve',
    cardTitle: 'Boas festas!',
    cardBody:
      'Você achou os 5 presentes. Obrigado por explorar o site com tanta curiosidade: que o fim de ano seja leve e que {next} chegue cheio de coisa boa para construir.',
    shareText: 'Achei os 5 presentes escondidos no site do Ranielli.',
    shake: 'Sacudir',
    shakePhone: 'Sacudir o celular',
    share: 'Compartilhar',
    linkCopied: 'Link copiado',
    close: 'Fechar',
    globeLabel: 'Globo de neve com o retrato do Ranielli de gorro de Papai Noel',
    oneDay: 'Falta 1 dia para o Natal',
    manyDays: 'Faltam {n} dias para o Natal',
    christmas: 'Feliz Natal',
    after: 'Boas festas',
  },
  en: {
    giftClosed: 'Open hidden gift ({n} of {total})',
    giftOpened: 'Gift opened ({n} of {total})',
    found: 'gifts found',
    sound: 'Christmas sound',
    openGlobe: 'Open the snow globe',
    cardTitle: 'Happy holidays!',
    cardBody:
      'You found all 5 gifts. Thanks for exploring the site with so much curiosity: may your year end gently, and may {next} bring plenty of good things to build.',
    shareText: "I found the 5 gifts hidden on Ranielli's site.",
    shake: 'Shake',
    shakePhone: 'Shake your phone',
    share: 'Share',
    linkCopied: 'Link copied',
    close: 'Close',
    globeLabel: 'Snow globe with a portrait of Ranielli in a Santa hat',
    oneDay: '1 day to Christmas',
    manyDays: '{n} days to Christmas',
    christmas: 'Merry Christmas',
    after: 'Happy holidays',
  },
  es: {
    giftClosed: 'Abrir regalo escondido ({n} de {total})',
    giftOpened: 'Regalo abierto ({n} de {total})',
    found: 'regalos encontrados',
    sound: 'Sonido de Navidad',
    openGlobe: 'Abrir la bola de nieve',
    cardTitle: '¡Felices fiestas!',
    cardBody:
      'Encontraste los 5 regalos. Gracias por explorar el sitio con tanta curiosidad: que el fin de año sea tranquilo y que {next} llegue lleno de cosas buenas para construir.',
    shareText: 'Encontré los 5 regalos escondidos en el sitio de Ranielli.',
    shake: 'Agitar',
    shakePhone: 'Agitar el móvil',
    share: 'Compartir',
    linkCopied: 'Enlace copiado',
    close: 'Cerrar',
    globeLabel: 'Bola de nieve con un retrato de Ranielli con gorro de Papá Noel',
    oneDay: 'Falta 1 día para Navidad',
    manyDays: 'Faltan {n} días para Navidad',
    christmas: 'Feliz Navidad',
    after: 'Felices fiestas',
  },
}

export function getNatalCopy(locale: string): NatalCopy {
  return COPY[locale as keyof typeof COPY] ?? COPY.pt
}

/** Fills the `{name}` marks of a text. */
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (mark, name: string) =>
    name in values ? String(values[name]) : mark,
  )
}
