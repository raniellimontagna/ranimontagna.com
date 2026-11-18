/** Halloween texts in the site's three languages. `{name}` marks a value to fill in. */
export type HalloweenCopy = {
  /** `{n}` and `{total}`: every bug has its own name for screen readers. */
  bugHidden: string
  bugFixed: string
  fixed: string
  sound: string
  openCard: string
  cardTitle: string
  cardBody: string
  report: readonly [string, string, string]
  shareText: string
  share: string
  linkCopied: string
  close: string
  oneDay: string
  /** `{n}` days to 31 October. */
  manyDays: string
  halloween: string
  after: string
}

const COPY: Record<'pt' | 'en' | 'es', HalloweenCopy> = {
  pt: {
    bugHidden: 'Bug escondido ({n} de {total})',
    bugFixed: 'Bug corrigido ({n} de {total})',
    fixed: 'bugs corrigidos',
    sound: 'Som de Halloween',
    openCard: 'Ver o relatório',
    cardTitle: 'Zero bugs em produção',
    cardBody:
      'Você esmagou os 5 bugs escondidos. O deploy passou, os testes estão verdes e a noite pode ser só de doces. Feliz Halloween!',
    report: ['5 bugs corrigidos', 'testes verdes', 'deploy sem susto'],
    shareText: 'Esmaguei os 5 bugs escondidos no site do Ranielli. Zero bugs em produção!',
    share: 'Compartilhar',
    linkCopied: 'Link copiado',
    close: 'Fechar',
    oneDay: 'Falta 1 dia para o Halloween',
    manyDays: 'Faltam {n} dias para o Halloween',
    halloween: 'Feliz Halloween',
    after: 'Até o ano que vem. Buu!',
  },
  en: {
    bugHidden: 'Hidden bug ({n} of {total})',
    bugFixed: 'Bug fixed ({n} of {total})',
    fixed: 'bugs fixed',
    sound: 'Halloween sound',
    openCard: 'See the report',
    cardTitle: 'Zero bugs in production',
    cardBody:
      'You squashed all 5 hidden bugs. The deploy went through, the tests are green and the night can be all treats. Happy Halloween!',
    report: ['5 bugs fixed', 'tests green', 'a deploy with no scares'],
    shareText: "I squashed the 5 bugs hidden on Ranielli's site. Zero bugs in production!",
    share: 'Share',
    linkCopied: 'Link copied',
    close: 'Close',
    oneDay: '1 day to Halloween',
    manyDays: '{n} days to Halloween',
    halloween: 'Happy Halloween',
    after: 'See you next year. Boo!',
  },
  es: {
    bugHidden: 'Bug escondido ({n} de {total})',
    bugFixed: 'Bug corregido ({n} de {total})',
    fixed: 'bugs corregidos',
    sound: 'Sonido de Halloween',
    openCard: 'Ver el informe',
    cardTitle: 'Cero bugs en producción',
    cardBody:
      'Aplastaste los 5 bugs escondidos. El deploy pasó, los tests están en verde y la noche puede ser solo de dulces. ¡Feliz Halloween!',
    report: ['5 bugs corregidos', 'tests en verde', 'un deploy sin sustos'],
    shareText: 'Aplasté los 5 bugs escondidos en el sitio de Ranielli. ¡Cero bugs en producción!',
    share: 'Compartir',
    linkCopied: 'Enlace copiado',
    close: 'Cerrar',
    oneDay: 'Falta 1 día para Halloween',
    manyDays: 'Faltan {n} días para Halloween',
    halloween: 'Feliz Halloween',
    after: 'Hasta el año que viene. ¡Bu!',
  },
}

export function getHalloweenCopy(locale: string): HalloweenCopy {
  return COPY[locale as keyof typeof COPY] ?? COPY.pt
}
