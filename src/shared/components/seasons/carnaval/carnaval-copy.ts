/** Carnival texts in the site's three languages. `{name}` marks a value to fill in. */
export type CarnavalCopy = {
  oneDay: string
  /** `{n}` days to the Saturday of Carnival. */
  manyDays: string
  carnaval: string
  ashes: string
  sound: string
  title: string
  intro: string
  draw: string
  drawAgain: string
  /** `{year}`: the year on the banner. */
  founded: string
  /** `{name}`: the bloco just drawn. */
  drawn: string
  waiting: string
  share: string
  linkCopied: string
  /** `{name}`: the visitor's bloco. */
  shareText: string
  names: readonly string[]
}

const COPY: Record<'pt' | 'en' | 'es', CarnavalCopy> = {
  pt: {
    oneDay: 'Falta 1 dia para o Carnaval',
    manyDays: 'Faltam {n} dias para o Carnaval',
    carnaval: 'É Carnaval!',
    ashes: 'Quarta-feira de Cinzas: de volta ao código',
    sound: 'Som de Carnaval',
    title: 'Batize seu bloco',
    intro: 'Todo bloco que se preze tem um nome bom. Sorteie o seu.',
    draw: 'Sortear nome',
    drawAgain: 'Sortear outro',
    founded: 'desde {year}',
    drawn: 'Seu bloco: {name}',
    waiting: 'O estandarte espera o nome do seu bloco.',
    share: 'Compartilhar',
    linkCopied: 'Link copiado',
    shareText: 'Meu bloco de Carnaval é o {name}. Batize o seu no site do Ranielli.',
    names: [
      'Unidos do Merge Conflict',
      'Bloco Deploy na Sexta',
      'Cordão do Bug em Produção',
      'Acadêmicos do Ponto e Vírgula',
      'Banda do Café Sem Açúcar',
      'Bloco Funciona na Minha Máquina',
      'Império do Código Legado',
      'Bloco da Daily Que Podia Ser um E-mail',
      'Unidos da Sprint Sem Fim',
      'Grêmio Recreativo Hotfix das Cinco',
      'Bloco do Commit Sem Mensagem',
      'Cordão do Cache Limpo',
      'Acadêmicos do Stack Overflow',
      'Bloco Pull Request Aprovado',
      'Banda do Modo Escuro',
      'Unidos do Erro 404',
      'Bloco do Teste Que Só Passa Local',
      'Mocidade Independente do Undefined',
      'Bloco Tela Azul da Alegria',
      'Cordão da Variável Global',
      'Bloco Quem Revisa Sou Eu',
      'Unidos do Ctrl+Z',
      'Bloco do Tab Contra Espaço',
      'Acadêmicos do Rebase Interativo',
    ],
  },
  en: {
    oneDay: '1 day to Carnival',
    manyDays: '{n} days to Carnival',
    carnaval: "It's Carnival!",
    ashes: 'Ash Wednesday: back to the code',
    sound: 'Carnival sound',
    title: 'Name your bloco',
    intro: 'Every Brazilian carnival street band, a bloco, needs a good name. Draw yours.',
    draw: 'Draw a name',
    drawAgain: 'Draw another',
    founded: 'since {year}',
    drawn: 'Your bloco: {name}',
    waiting: 'The banner is waiting for your bloco’s name.',
    share: 'Share',
    linkCopied: 'Link copied',
    shareText: "My carnival bloco is {name}. Name yours on Ranielli's site.",
    names: [
      'United Merge Conflict Samba School',
      'Friday Deploy Street Band',
      'Production Bug Parade',
      'Semicolon Academy',
      'Black Coffee Brass Band',
      'Works on My Machine Bloco',
      'Legacy Code Empire',
      'The Meeting That Could Have Been an Email Bloco',
      'Endless Sprint United',
      'Five O’Clock Hotfix Social Club',
      'Empty Commit Message Bloco',
      'Cleared Cache Parade',
      'Stack Overflow Academy',
      'Approved Pull Request Bloco',
      'Dark Mode Brass Band',
      'United 404',
      'Passes Only Locally Bloco',
      'Independent Undefined',
      'Blue Screen of Joy Bloco',
      'Global Variable Parade',
      'I Review It Myself Bloco',
      'United Ctrl+Z',
      'Tabs Versus Spaces Bloco',
      'Interactive Rebase Academy',
    ],
  },
  es: {
    oneDay: 'Falta 1 día para el Carnaval',
    manyDays: 'Faltan {n} días para el Carnaval',
    carnaval: '¡Es Carnaval!',
    ashes: 'Miércoles de Ceniza: de vuelta al código',
    sound: 'Sonido de Carnaval',
    title: 'Bautiza tu comparsa',
    intro: 'Toda comparsa que se precie tiene un buen nombre. Sortea el tuyo.',
    draw: 'Sortear nombre',
    drawAgain: 'Sortear otro',
    founded: 'desde {year}',
    drawn: 'Tu comparsa: {name}',
    waiting: 'El estandarte espera el nombre de tu comparsa.',
    share: 'Compartir',
    linkCopied: 'Enlace copiado',
    shareText: 'Mi comparsa de Carnaval es {name}. Bautiza la tuya en el sitio de Ranielli.',
    names: [
      'Unidos del Merge Conflict',
      'Comparsa Deploy en Viernes',
      'Cordón del Bug en Producción',
      'Académicos del Punto y Coma',
      'Banda del Café Sin Azúcar',
      'Comparsa Funciona en Mi Máquina',
      'Imperio del Código Legado',
      'Comparsa de la Daily Que Pudo Ser un Correo',
      'Unidos del Sprint Sin Fin',
      'Gremio Recreativo Hotfix de las Cinco',
      'Comparsa del Commit Sin Mensaje',
      'Cordón del Caché Limpio',
      'Académicos del Stack Overflow',
      'Comparsa Pull Request Aprobado',
      'Banda del Modo Oscuro',
      'Unidos del Error 404',
      'Comparsa del Test Que Solo Pasa en Local',
      'Independientes del Undefined',
      'Comparsa Pantallazo Azul de la Alegría',
      'Cordón de la Variable Global',
      'Comparsa Quien Revisa Soy Yo',
      'Unidos del Ctrl+Z',
      'Comparsa Tab Contra Espacio',
      'Académicos del Rebase Interactivo',
    ],
  },
}

export function getCarnavalCopy(locale: string): CarnavalCopy {
  return COPY[locale as keyof typeof COPY] ?? COPY.pt
}
