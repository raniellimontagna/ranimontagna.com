/** New Year texts in the site's three languages. `{name}` marks a value to fill in. */
export type ReveillonCopy = {
  /** `{n}` days and `{year}`, the year that is coming. */
  manyDays: string
  /** `{h}` hours and `{m}` minutes left on the 31st. */
  hours: string
  minutes: string
  newYear: string
  virada: string
  sound: string
  wavesTitle: string
  wavesIntro: string
  jump: string
  /** `{n}` waves jumped so far, of 7. */
  progress: string
  /** `{n}` the wave just jumped, `{wish}` its wish. */
  jumped: string
  missed: string
  done: string
  openCard: string
  cardTitle: string
  cardBody: string
  shareText: string
  share: string
  linkCopied: string
  close: string
  wishes: readonly [string, string, string, string, string, string, string]
}

const COPY: Record<'pt' | 'en' | 'es', ReveillonCopy> = {
  pt: {
    manyDays: 'Faltam {n} dias para {year}',
    hours: 'Faltam {h} h {m} min para {year}',
    minutes: 'Faltam {m} min para {year}',
    newYear: 'Feliz {year}',
    virada: 'Feliz {year}!',
    sound: 'Som de Réveillon',
    wavesTitle: 'Pule as 7 ondas',
    wavesIntro: 'Diz a tradição: na virada, pule sete ondas e faça um pedido em cada uma.',
    jump: 'Pular',
    progress: '{n} de 7 ondas',
    jumped: 'Onda {n} de 7: {wish}',
    missed: 'Essa passou. Vem outra!',
    done: 'Você pulou as 7 ondas!',
    openCard: 'Ver seus pedidos',
    cardTitle: 'Feliz {year}!',
    cardBody:
      'Você pulou as 7 ondas e fez seus 7 pedidos. Que {year} traga cada um deles, e muita coisa boa para construir.',
    shareText: 'Pulei as 7 ondas no site do Ranielli. Feliz {year}!',
    share: 'Compartilhar',
    linkCopied: 'Link copiado',
    close: 'Fechar',
    wishes: [
      'saúde',
      'paz',
      'amor',
      'viagens',
      'aprender algo novo',
      'deploy sem susto',
      'tempo com quem importa',
    ],
  },
  en: {
    manyDays: '{n} days to {year}',
    hours: '{h} h {m} min to {year}',
    minutes: '{m} min to {year}',
    newYear: 'Happy {year}',
    virada: 'Happy {year}!',
    sound: 'New Year sound',
    wavesTitle: 'Jump the 7 waves',
    wavesIntro: 'A Brazilian tradition: at midnight, jump seven waves and make a wish on each one.',
    jump: 'Jump',
    progress: '{n} of 7 waves',
    jumped: 'Wave {n} of 7: {wish}',
    missed: 'That one got away. Here comes another!',
    done: 'You jumped all 7 waves!',
    openCard: 'See your wishes',
    cardTitle: 'Happy {year}!',
    cardBody:
      'You jumped the 7 waves and made your 7 wishes. May {year} bring every one of them, and plenty of good things to build.',
    shareText: "I jumped the 7 waves on Ranielli's site. Happy {year}!",
    share: 'Share',
    linkCopied: 'Link copied',
    close: 'Close',
    wishes: [
      'health',
      'peace',
      'love',
      'travel',
      'learning something new',
      'deploys without surprises',
      'time with the people who matter',
    ],
  },
  es: {
    manyDays: 'Faltan {n} días para {year}',
    hours: 'Faltan {h} h {m} min para {year}',
    minutes: 'Faltan {m} min para {year}',
    newYear: 'Feliz {year}',
    virada: '¡Feliz {year}!',
    sound: 'Sonido de Año Nuevo',
    wavesTitle: 'Salta las 7 olas',
    wavesIntro:
      'Una tradición brasileña: a medianoche, salta siete olas y pide un deseo en cada una.',
    jump: 'Saltar',
    progress: '{n} de 7 olas',
    jumped: 'Ola {n} de 7: {wish}',
    missed: 'Esa se fue. ¡Viene otra!',
    done: '¡Saltaste las 7 olas!',
    openCard: 'Ver tus deseos',
    cardTitle: '¡Feliz {year}!',
    cardBody:
      'Saltaste las 7 olas y pediste tus 7 deseos. Que {year} traiga cada uno, y muchas cosas buenas para construir.',
    shareText: 'Salté las 7 olas en el sitio de Ranielli. ¡Feliz {year}!',
    share: 'Compartir',
    linkCopied: 'Enlace copiado',
    close: 'Cerrar',
    wishes: [
      'salud',
      'paz',
      'amor',
      'viajes',
      'aprender algo nuevo',
      'deploys sin sustos',
      'tiempo con quien importa',
    ],
  },
}

export function getReveillonCopy(locale: string): ReveillonCopy {
  return COPY[locale as keyof typeof COPY] ?? COPY.pt
}
