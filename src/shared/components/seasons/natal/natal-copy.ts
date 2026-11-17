/** Christmas texts in the site's three languages. */
export type NatalCopy = {
  giftClosed: string
  giftOpened: string
  found: string
  soundOn: string
  soundOff: string
  openGlobe: string
  cardTitle: string
  cardBody: string
  shareText: string
  shake: string
  shakePhone: string
  share: string
  linkCopied: string
  close: string
  globeLabel: string
}

const COPY: Record<'pt' | 'en' | 'es', NatalCopy> = {
  pt: {
    giftClosed: 'Abrir presente escondido',
    giftOpened: 'Presente aberto',
    found: 'presentes encontrados',
    soundOn: 'Desligar o som de Natal',
    soundOff: 'Ligar o som de Natal',
    openGlobe: 'Abrir o globo de neve',
    cardTitle: 'Boas festas!',
    cardBody:
      'Você achou os 5 presentes. Obrigado por explorar o site com tanta curiosidade: que o fim de ano seja leve e que 2027 chegue cheio de coisa boa para construir.',
    shareText: 'Achei os 5 presentes escondidos no site do Ranielli.',
    shake: 'Sacudir',
    shakePhone: 'Sacudir o celular',
    share: 'Compartilhar',
    linkCopied: 'Link copiado',
    close: 'Fechar',
    globeLabel: 'Globo de neve com o retrato do Ranielli de gorro de Papai Noel',
  },
  en: {
    giftClosed: 'Open hidden gift',
    giftOpened: 'Gift opened',
    found: 'gifts found',
    soundOn: 'Turn the Christmas sound off',
    soundOff: 'Turn the Christmas sound on',
    openGlobe: 'Open the snow globe',
    cardTitle: 'Happy holidays!',
    cardBody:
      'You found all 5 gifts. Thanks for exploring the site with so much curiosity: may your year end gently, and may 2027 bring plenty of good things to build.',
    shareText: "I found the 5 gifts hidden on Ranielli's site.",
    shake: 'Shake',
    shakePhone: 'Shake your phone',
    share: 'Share',
    linkCopied: 'Link copied',
    close: 'Close',
    globeLabel: 'Snow globe with a portrait of Ranielli in a Santa hat',
  },
  es: {
    giftClosed: 'Abrir regalo escondido',
    giftOpened: 'Regalo abierto',
    found: 'regalos encontrados',
    soundOn: 'Apagar el sonido de Navidad',
    soundOff: 'Encender el sonido de Navidad',
    openGlobe: 'Abrir la bola de nieve',
    cardTitle: '¡Felices fiestas!',
    cardBody:
      'Encontraste los 5 regalos. Gracias por explorar el sitio con tanta curiosidad: que el fin de año sea tranquilo y que 2027 llegue lleno de cosas buenas para construir.',
    shareText: 'Encontré los 5 regalos escondidos en el sitio de Ranielli.',
    shake: 'Agitar',
    shakePhone: 'Agitar el móvil',
    share: 'Compartir',
    linkCopied: 'Enlace copiado',
    close: 'Cerrar',
    globeLabel: 'Bola de nieve con un retrato de Ranielli con gorro de Papá Noel',
  },
}

export function getNatalCopy(locale: string): NatalCopy {
  return COPY[locale as keyof typeof COPY] ?? COPY.pt
}
