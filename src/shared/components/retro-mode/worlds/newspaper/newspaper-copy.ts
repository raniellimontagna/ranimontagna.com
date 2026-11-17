import { attoWhatsappHref } from '@/features/home/components/atto/atto.data'

type Classified = { title: string; text: string; cta: string; href: string }

const EMAIL = 'contato@ranimontagna.com'

const copy = {
  pt: {
    edition: 'Edição digital independente',
    motto: 'De Paraí para a World Wide Web.',
    number: 'Ano XXVIII · Nº 1.998',
    price: 'R$ 0,50',
    forecast: 'Previsão',
    weather: 'Sol com pancadas de commits',
    extra: 'EXTRA! EXTRA!',
    latest: 'Últimas',
    nextHeadline: 'Próxima manchete',
    headlines: [
      'Engenheiro de Paraí entrega produto no ar com a IA escrevendo o código',
      'Grimory leva a mesa de D&D para o português; as regras validam cada jogada',
      'Timer de speedcubing funciona sem internet, garante fonte',
      'Um comando instala as mesmas ferramentas de IA em cinco agentes',
      'Exclusivo: ele ainda responde e-mail',
    ],
    ticker: [
      'Projetos novos na seção Projetos',
      'Blog atualizado com o que ele aprende construindo com IA',
      'Café em alta pela quinta semana seguida',
      'A Atto aceita novos projetos',
      'Leitores pedem mais mundos retrô',
    ],
    classifieds: 'Classificados',
    ads: [
      {
        title: 'PROCURA-SE',
        text: 'Problema de verdade para virar produto. Tratar direto com o engenheiro.',
        cta: 'Escrever e-mail',
        href: `mailto:${EMAIL}?subject=${encodeURIComponent('Classificado da Gazeta Montagna')}`,
      },
      {
        title: 'OFERECE-SE',
        text: 'Software house com engenharia e marketing sob o mesmo teto.',
        cta: 'Chamar a Atto no WhatsApp',
        href: attoWhatsappHref('Olá! Vi o classificado na Gazeta Montagna.'),
      },
      {
        title: 'TROCA-SE',
        text: 'Café por code review. Aceito também boas ideias.',
        cta: 'Ver os projetos',
        href: '/projects',
      },
      {
        title: 'ACHADOS E PERDIDOS',
        text: 'Perdeu um texto bom sobre construir com IA? Pode estar no blog.',
        cta: 'Abrir o blog',
        href: '/blog',
      },
    ] as Classified[],
  },
  en: {
    edition: 'Independent digital edition',
    motto: 'From Paraí to the World Wide Web.',
    number: 'Vol. XXVIII · No. 1,998',
    price: '50¢',
    forecast: 'Forecast',
    weather: 'Sunny with scattered commits',
    extra: 'EXTRA! EXTRA!',
    latest: 'Latest',
    nextHeadline: 'Next headline',
    headlines: [
      'Engineer from Paraí ships products with AI writing the code',
      'Grimory brings the D&D table to Portuguese; the rules check every move',
      'Speedcubing timer works offline, source confirms',
      'One command installs the same AI tools in five agents',
      'Exclusive: he still answers email',
    ],
    ticker: [
      'New work in the Projects section',
      'Blog updated with what he learns building with AI',
      'Coffee up for the fifth week in a row',
      'Atto is taking new projects',
      'Readers ask for more retro worlds',
    ],
    classifieds: 'Classifieds',
    ads: [
      {
        title: 'WANTED',
        text: 'A real problem to turn into a product. Deal directly with the engineer.',
        cta: 'Send an email',
        href: `mailto:${EMAIL}?subject=${encodeURIComponent('Gazeta Montagna classified')}`,
      },
      {
        title: 'OFFERED',
        text: 'A software house with engineering and marketing under one roof.',
        cta: 'Message Atto on WhatsApp',
        href: attoWhatsappHref('Hi! I saw the classified in the Gazeta Montagna.'),
      },
      {
        title: 'SWAP',
        text: 'Coffee for code review. Good ideas also accepted.',
        cta: 'See the projects',
        href: '/projects',
      },
      {
        title: 'LOST AND FOUND',
        text: 'Lost a good piece on building with AI? It may be on the blog.',
        cta: 'Open the blog',
        href: '/blog',
      },
    ] as Classified[],
  },
  es: {
    edition: 'Edición digital independiente',
    motto: 'De Paraí a la World Wide Web.',
    number: 'Año XXVIII · Nº 1.998',
    price: '$ 0,50',
    forecast: 'Pronóstico',
    weather: 'Sol con chubascos de commits',
    extra: '¡EXTRA! ¡EXTRA!',
    latest: 'Últimas',
    nextHeadline: 'Siguiente titular',
    headlines: [
      'Ingeniero de Paraí entrega productos en línea con la IA escribiendo el código',
      'Grimory lleva la mesa de D&D al portugués; las reglas validan cada jugada',
      'Timer de speedcubing funciona sin internet, asegura una fuente',
      'Un comando instala las mismas herramientas de IA en cinco agentes',
      'Exclusiva: todavía responde el correo',
    ],
    ticker: [
      'Proyectos nuevos en la sección Proyectos',
      'Blog actualizado con lo que aprende construyendo con IA',
      'El café sube por quinta semana seguida',
      'Atto acepta nuevos proyectos',
      'Los lectores piden más mundos retro',
    ],
    classifieds: 'Clasificados',
    ads: [
      {
        title: 'SE BUSCA',
        text: 'Un problema real para convertir en producto. Tratar con el ingeniero.',
        cta: 'Escribir un correo',
        href: `mailto:${EMAIL}?subject=${encodeURIComponent('Clasificado de la Gazeta Montagna')}`,
      },
      {
        title: 'SE OFRECE',
        text: 'Software house con ingeniería y marketing bajo el mismo techo.',
        cta: 'Escribir a Atto por WhatsApp',
        href: attoWhatsappHref('¡Hola! Vi el clasificado en la Gazeta Montagna.'),
      },
      {
        title: 'SE CAMBIA',
        text: 'Café por code review. También se aceptan buenas ideas.',
        cta: 'Ver los proyectos',
        href: '/projects',
      },
      {
        title: 'OBJETOS PERDIDOS',
        text: '¿Perdiste un buen texto sobre construir con IA? Puede estar en el blog.',
        cta: 'Abrir el blog',
        href: '/blog',
      },
    ] as Classified[],
  },
}

export type NewspaperCopy = (typeof copy)['pt']

export function getNewspaperCopy(locale: string): NewspaperCopy {
  return copy[locale === 'en' || locale === 'es' ? locale : 'pt']
}
