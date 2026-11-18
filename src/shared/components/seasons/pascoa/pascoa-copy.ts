/** Easter texts in the site's three languages. `{name}` marks a value to fill in. */
export type PascoaCopy = {
  /** `{n}` and `{total}`: every egg gets its own name for screen readers. */
  eggHidden: string
  eggFound: string
  found: string
  sound: string
  openEgg: string
  eggLabel: string
  cardTitle: string
  cardBody: string
  shareText: string
  share: string
  linkCopied: string
  close: string
  oneDay: string
  /** `{n}` days to Easter Sunday. */
  manyDays: string
  easter: string
}

const COPY: Record<'pt' | 'en' | 'es', PascoaCopy> = {
  pt: {
    eggHidden: 'Ovo escondido ({n} de {total})',
    eggFound: 'Ovo encontrado ({n} de {total})',
    found: 'ovos encontrados',
    sound: 'Som de Páscoa',
    openEgg: 'Abrir o ovo de chocolate',
    eggLabel: 'Um ovo de chocolate aberto, com uma estrela dourada dentro',
    cardTitle: 'Feliz Páscoa!',
    cardBody:
      'Você achou os 5 ovos. Que a Páscoa traga recomeço, chocolate e tempo para o que importa.',
    shareText: 'Achei os 5 ovos escondidos no site do Ranielli.',
    share: 'Compartilhar',
    linkCopied: 'Link copiado',
    close: 'Fechar',
    oneDay: 'Falta 1 dia para a Páscoa',
    manyDays: 'Faltam {n} dias para a Páscoa',
    easter: 'Feliz Páscoa',
  },
  en: {
    eggHidden: 'Hidden egg ({n} of {total})',
    eggFound: 'Egg found ({n} of {total})',
    found: 'eggs found',
    sound: 'Easter sound',
    openEgg: 'Open the chocolate egg',
    eggLabel: 'An open chocolate egg with a gold star inside',
    cardTitle: 'Happy Easter!',
    cardBody:
      'You found all 5 eggs. May Easter bring a fresh start, chocolate and time for what matters.',
    shareText: "I found the 5 eggs hidden on Ranielli's site.",
    share: 'Share',
    linkCopied: 'Link copied',
    close: 'Close',
    oneDay: '1 day to Easter',
    manyDays: '{n} days to Easter',
    easter: 'Happy Easter',
  },
  es: {
    eggHidden: 'Huevo escondido ({n} de {total})',
    eggFound: 'Huevo encontrado ({n} de {total})',
    found: 'huevos encontrados',
    sound: 'Sonido de Pascua',
    openEgg: 'Abrir el huevo de chocolate',
    eggLabel: 'Un huevo de chocolate abierto, con una estrella dorada dentro',
    cardTitle: '¡Feliz Pascua!',
    cardBody:
      'Encontraste los 5 huevos. Que la Pascua traiga un nuevo comienzo, chocolate y tiempo para lo que importa.',
    shareText: 'Encontré los 5 huevos escondidos en el sitio de Ranielli.',
    share: 'Compartir',
    linkCopied: 'Enlace copiado',
    close: 'Cerrar',
    oneDay: 'Falta 1 día para Pascua',
    manyDays: 'Faltan {n} días para Pascua',
    easter: 'Feliz Pascua',
  },
}

export function getPascoaCopy(locale: string): PascoaCopy {
  return COPY[locale as keyof typeof COPY] ?? COPY.pt
}
