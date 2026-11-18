/** Festa Junina texts in the site's three languages. `{name}` marks a value to fill in. */
export type Prize = { name: string; line: string }

export type JuninaCopy = {
  oneDay: string
  /** `{n}` days to São João (24 June). */
  manyDays: string
  saoJoao: string
  arraia: string
  sound: string
  title: string
  intro: string
  /** `{n}` and `{total}`: every fish has its own name for screen readers. */
  fish: string
  /** `{prize}` just won. */
  won: string
  prizesLabel: string
  /** `{n}` of `{total}`. */
  progress: string
  stopFish: string
  openCard: string
  cardTitle: string
  cardBody: string
  shareText: string
  share: string
  linkCopied: string
  close: string
  /** The prizes: Ranielli's projects that are live. */
  prizes: readonly [Prize, Prize, Prize, Prize, Prize]
}

const COPY: Record<'pt' | 'en' | 'es', JuninaCopy> = {
  pt: {
    oneDay: 'Falta 1 dia para o São João',
    manyDays: 'Faltam {n} dias para o São João',
    saoJoao: 'Viva São João!',
    arraia: 'Arraiá até o fim do mês',
    sound: 'Som de festa junina',
    title: 'Pescaria',
    intro: 'Fisgue os peixinhos do laguinho: cada um traz uma prenda.',
    fish: 'Peixinho {n} de {total}',
    won: 'Fisgou! Prenda: {prize}',
    prizesLabel: 'Suas prendas',
    progress: '{n} de {total} fisgados',
    stopFish: 'Parar os peixinhos',
    openCard: 'Ver suas prendas',
    cardTitle: 'Arraiá do Ranielli',
    cardBody: 'Você fisgou os 5 peixinhos. As prendas são coisas que ele colocou no ar:',
    shareText: 'Fisguei os 5 peixinhos na pescaria do site do Ranielli. Arraiá!',
    share: 'Compartilhar',
    linkCopied: 'Link copiado',
    close: 'Fechar',
    prizes: [
      { name: 'Grimory', line: 'mesa de D&D em português' },
      { name: 'Klick', line: 'timer de speedcubing offline-first' },
      { name: 'agent-toolkit', line: 'as mesmas skills de IA em cinco agentes' },
      { name: 'Argus', line: 'hub de dados pessoal' },
      { name: 'Atto Read', line: 'o leitor pessoal da Atto' },
    ],
  },
  en: {
    oneDay: '1 day to São João',
    manyDays: '{n} days to São João',
    saoJoao: 'Viva São João!',
    arraia: 'Arraiá till the end of the month',
    sound: 'June festival sound',
    title: 'Fishing booth',
    intro: 'A Festa Junina classic: hook the little fish in the pond, each one brings a prize.',
    fish: 'Little fish {n} of {total}',
    won: 'Hooked! Prize: {prize}',
    prizesLabel: 'Your prizes',
    progress: '{n} of {total} hooked',
    stopFish: 'Stop the fish',
    openCard: 'See your prizes',
    cardTitle: "Ranielli's Arraiá",
    cardBody: 'You hooked all 5 little fish. The prizes are things he has shipped:',
    shareText: "I hooked all 5 fish at the June festival on Ranielli's site. Arraiá!",
    share: 'Share',
    linkCopied: 'Link copied',
    close: 'Close',
    prizes: [
      { name: 'Grimory', line: 'a D&D table in Portuguese' },
      { name: 'Klick', line: 'an offline-first speedcubing timer' },
      { name: 'agent-toolkit', line: 'the same AI skills in five agents' },
      { name: 'Argus', line: 'a personal data hub' },
      { name: 'Atto Read', line: "Atto's personal reader" },
    ],
  },
  es: {
    oneDay: 'Falta 1 día para San Juan',
    manyDays: 'Faltan {n} días para San Juan',
    saoJoao: '¡Viva San Juan!',
    arraia: 'Fiesta junina hasta fin de mes',
    sound: 'Sonido de fiesta junina',
    title: 'Pesca',
    intro:
      'Un clásico de la fiesta junina: pesca los pececitos del estanque, cada uno trae un premio.',
    fish: 'Pececito {n} de {total}',
    won: '¡Pescado! Premio: {prize}',
    prizesLabel: 'Tus premios',
    progress: '{n} de {total} pescados',
    stopFish: 'Parar los pececitos',
    openCard: 'Ver tus premios',
    cardTitle: 'La fiesta de Ranielli',
    cardBody: 'Pescaste los 5 pececitos. Los premios son cosas que él puso en línea:',
    shareText: 'Pesqué los 5 pececitos en la fiesta junina del sitio de Ranielli.',
    share: 'Compartir',
    linkCopied: 'Enlace copiado',
    close: 'Cerrar',
    prizes: [
      { name: 'Grimory', line: 'una mesa de D&D en portugués' },
      { name: 'Klick', line: 'un timer de speedcubing offline-first' },
      { name: 'agent-toolkit', line: 'las mismas skills de IA en cinco agentes' },
      { name: 'Argus', line: 'un hub de datos personal' },
      { name: 'Atto Read', line: 'el lector personal de Atto' },
    ],
  },
}

export function getJuninaCopy(locale: string): JuninaCopy {
  return COPY[locale as keyof typeof COPY] ?? COPY.pt
}
