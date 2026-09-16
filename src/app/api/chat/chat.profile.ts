export { CHAT_CONTACT_LINKS } from '@/shared/lib/chat-links'

export type ChatLocale = 'pt' | 'en' | 'es'

type ChatExperienceBase = {
  company: string
  endDate: string | null
  location: string
  period: string
  role: string
  startDate: string
}

export type CurrentChatExperience = ChatExperienceBase & {
  current: true
  outcomes: []
  scope: string[]
}

export type PreviousChatExperience = ChatExperienceBase & {
  current: false
  outcomes: string[]
  scope: []
}

export type ChatExperience = CurrentChatExperience | PreviousChatExperience

export type ChatProject = {
  name: string
  summary: string
  technologies: string[]
}

export type ChatVenture = {
  name: string
  role: string
  summary: string
  fronts: string[]
  /** Como responder a pedidos de projeto: sempre via Atto. */
  routing: string
}

export type ChatProfile = {
  availability: string
  experienceSummary: string
  experiences: ChatExperience[]
  hobbies: string[]
  location: string
  name: string
  nationality: string
  professionalProfile: string
  projects: ChatProject[]
  technicalAreas: Array<{ label: string; items: string[] }>
  venture: ChatVenture
}

export const CHAT_PROFILE_BY_LOCALE = {
  pt: {
    availability:
      'Trabalho na Lemon Energia como PJ em um compromisso não exclusivo e sou sócio-fundador da Atto. Para projetos, orçamentos e parcerias há dois caminhos: a Atto, para trabalho com escopo, prazo e preço fechados, ou falar direto comigo pelo recado do chat ou LinkedIn; posso avaliar dependendo da proposta, do escopo, da compatibilidade e da minha disponibilidade. Conversas sobre engenharia, carreira e comunidade: aqui ou no LinkedIn.',
    experienceSummary: '5+ anos em software e 10 anos de trajetória profissional',
    experiences: [
      {
        company: 'Lemon Energia',
        current: true,
        endDate: null,
        location: 'Remoto',
        outcomes: [],
        period: 'Jul 2026 - Presente',
        role: 'Engenheiro de Software',
        scope: [
          'Atuo na ponte entre negócio e tecnologia, investigando problemas operacionais e transformando regras complexas da jornada de energia em soluções full stack',
          'Conduzo discovery contínuo e documento decisões, requisitos e trade-offs entre produto e tecnologia',
          'Uso IA com revisão crítica para acelerar prototipação e entregas confiáveis e escaláveis',
        ],
        startDate: '2026-07',
      },
      {
        company: 'Luizalabs',
        current: false,
        endDate: '2026-06',
        location: 'Remoto',
        outcomes: [
          'Atuei em aplicações web e mobile para operações de lojas físicas do Magalu',
          'Desenvolvi e mantive APIs REST, integrações, micro frontends e soluções backend',
          'Contribuí para produtos usados em estoque e logística em 1.000+ lojas e por 1.000+ estoquistas',
        ],
        period: 'Out 2023 - Jun 2026',
        role: 'Desenvolvedor Pleno',
        scope: [],
        startDate: '2023-10',
      },
      {
        company: 'Smarten',
        current: false,
        endDate: '2023-09',
        location: 'Remoto',
        outcomes: [
          'Liderei uma equipe de desenvolvimento frontend',
          'Criei e mantive um Design System corporativo adotado em múltiplos produtos',
          'Implementei CI/CD e monitoramento',
        ],
        period: 'Mai 2022 - Set 2023',
        role: 'Tech Lead Front-end',
        scope: [],
        startDate: '2022-05',
      },
      {
        company: 'SBSistemas',
        current: false,
        endDate: '2022-05',
        location: 'Presencial',
        outcomes: [
          'Iniciei minha experiência profissional em tecnologia e consolidei minha base técnica',
        ],
        period: 'Mai 2021 - Mai 2022',
        role: 'Desenvolvedor Front-end',
        scope: [],
        startDate: '2021-05',
      },
    ],
    hobbies: ['jogos', 'tecnologia', 'explorar novas stacks'],
    location: 'Paraí, Rio Grande do Sul, Brasil',
    name: 'Ranielli Montagna',
    nationality: 'Brasileiro',
    professionalProfile:
      'Engenheiro de software na Lemon Energia e sócio-fundador da Atto (software sob medida e marketing)',
    projects: [
      {
        name: 'NaN Solutions (Atto)',
        summary:
          'Site institucional de loja de tecnologia em Papanduva/SC, foco em loja física e e-commerce, Lighthouse 100 nas quatro notas',
        technologies: ['Astro', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Cloudflare Pages'],
      },
      {
        name: 'Fronteira Sul Drones (Atto)',
        summary:
          'E-commerce agrícola de drones e peças com catálogo, carrinho consultivo e checkout no WhatsApp',
        technologies: ['React', 'TypeScript', 'Vite', 'Cloudflare Workers', 'R2'],
      },
      {
        name: 'TALA Drone Partners (Atto)',
        summary:
          'Plataforma de parceiros para expansão regional de drones agrícolas: dashboard, CRM, rastreamento e comissões',
        technologies: ['React', 'TypeScript', 'Vite', 'TanStack Router', 'GSAP'],
      },
      {
        name: 'Quadralize (Atto)',
        summary: 'Gestão de quadras esportivas: agendamento, CRM, PDV, pagamentos e financeiro',
        technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      },
      {
        name: 'Mobile Estoquista Magalu',
        summary: 'Superapp para estoquistas do Magalu',
        technologies: ['React Native', 'TypeScript', 'Micro-frontend'],
      },
      {
        name: 'Pratio',
        summary: 'PDV para restaurantes com NFC-e e cardápio digital',
        technologies: ['React', 'Electron', 'TypeScript'],
      },
    ],
    technicalAreas: [
      {
        label: 'Frontend e mobile',
        items: [
          'React',
          'Next.js',
          'TypeScript',
          'Tailwind CSS',
          'React Native',
          'Micro Frontends',
          'Design Systems',
        ],
      },
      {
        label: 'Backend e APIs',
        items: ['Node.js', 'Fastify', 'PostgreSQL', 'Prisma', 'JWT', 'REST APIs'],
      },
      {
        label: 'Engenharia',
        items: ['Git', 'Docker', 'CI/CD', 'testes', 'acessibilidade', 'monitoramento'],
      },
      {
        label: 'IA e automação',
        items: ['LLMs', 'automação de processos', 'agentes', 'Model Context Protocol (MCP)'],
      },
      {
        label: 'Marketing e aquisição (Atto)',
        items: ['Meta Ads', 'WhatsApp Cloud API', 'funil e mensuração', 'SEO e busca por IA'],
      },
    ],
    venture: {
      name: 'Atto',
      role: 'Sócio-fundador (com Juliano Paludo)',
      summary:
        'Software house e marketing: produtos digitais sob medida, integrações, automação com IA e campanhas que trazem cliente, com escopo, prazo e preço fechados antes de começar.',
      fronts: [
        'Sites, sistemas e e-commerce (React, Next.js, Astro)',
        'Apps mobile (React Native)',
        'Integrações e IA (APIs, WhatsApp, ERPs, automação)',
        'Marketing e aquisição (tráfego pago, presença digital, funil no WhatsApp)',
      ],
      routing:
        'Pedidos de projeto, orçamento, prazo ou parceria: apresentar a Atto (attodev.com.br) para trabalho com escopo e preço fechados e também oferecer o recado direto pelo chat; a escolha é do visitante.',
    },
  },
  en: {
    availability:
      'I work at Lemon Energia as a contractor in a non-exclusive engagement and I am co-founder of Atto. For projects, quotes and partnerships there are two paths: Atto, for work with scope, timeline and price agreed upfront, or reaching me directly through the chat message or LinkedIn; I can evaluate them depending on the proposal, scope, fit, and my availability. Engineering, career and community conversations: here or on LinkedIn.',
    experienceSummary: '5+ years in software and 10 years of professional experience',
    experiences: [
      {
        company: 'Lemon Energia',
        current: true,
        endDate: null,
        location: 'Remote',
        outcomes: [],
        period: 'Jul 2026 - Present',
        role: 'Software Engineer',
        scope: [
          'I bridge business and technology, investigating operational problems and turning complex energy-journey rules into full-stack solutions',
          'I lead continuous discovery and document decisions, requirements, and product-technology trade-offs',
          'I use AI with critical review to accelerate reliable and scalable prototyping and delivery',
        ],
        startDate: '2026-07',
      },
      {
        company: 'Luizalabs',
        current: false,
        endDate: '2026-06',
        location: 'Remote',
        outcomes: [
          'I worked on web and mobile applications for Magalu physical store operations',
          'I developed and maintained REST APIs, integrations, micro frontends, and backend solutions',
          'I contributed to products used in inventory and logistics across 1,000+ stores and by 1,000+ stock clerks',
        ],
        period: 'Oct 2023 - Jun 2026',
        role: 'Mid-Level Developer',
        scope: [],
        startDate: '2023-10',
      },
      {
        company: 'Smarten',
        current: false,
        endDate: '2023-09',
        location: 'Remote',
        outcomes: [
          'I led a frontend development team',
          'I created and maintained a corporate Design System adopted across multiple products',
          'I implemented CI/CD and monitoring',
        ],
        period: 'May 2022 - Sep 2023',
        role: 'Front-end Tech Lead',
        scope: [],
        startDate: '2022-05',
      },
      {
        company: 'SBSistemas',
        current: false,
        endDate: '2022-05',
        location: 'On-site',
        outcomes: [
          'I began my professional technology career and built a solid technical foundation',
        ],
        period: 'May 2021 - May 2022',
        role: 'Front-end Developer',
        scope: [],
        startDate: '2021-05',
      },
    ],
    hobbies: ['games', 'technology', 'exploring new stacks'],
    location: 'Paraí, Rio Grande do Sul, Brazil',
    name: 'Ranielli Montagna',
    nationality: 'Brazilian',
    professionalProfile:
      'Software engineer at Lemon Energia and co-founder of Atto (custom software and marketing)',
    projects: [
      {
        name: 'NaN Solutions (Atto)',
        summary:
          'Website for a tech store in Papanduva/SC focused on the physical store and e-commerce, Lighthouse 100 across the board',
        technologies: ['Astro', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Cloudflare Pages'],
      },
      {
        name: 'Fronteira Sul Drones (Atto)',
        summary:
          'Agricultural e-commerce for drones and parts with catalog, consultative cart and WhatsApp checkout',
        technologies: ['React', 'TypeScript', 'Vite', 'Cloudflare Workers', 'R2'],
      },
      {
        name: 'TALA Drone Partners (Atto)',
        summary:
          'Partner platform for regional expansion of agricultural drones: dashboard, CRM, tracking and commissions',
        technologies: ['React', 'TypeScript', 'Vite', 'TanStack Router', 'GSAP'],
      },
      {
        name: 'Quadralize (Atto)',
        summary: 'Sports court management: bookings, CRM, POS, payments and finance',
        technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      },
      {
        name: 'Mobile Estoquista Magalu',
        summary: 'Superapp for Magalu stock clerks',
        technologies: ['React Native', 'TypeScript', 'Micro-frontend'],
      },
      {
        name: 'Pratio',
        summary: 'Restaurant POS with NFC-e and digital menu',
        technologies: ['React', 'Electron', 'TypeScript'],
      },
    ],
    technicalAreas: [
      {
        label: 'Frontend and mobile',
        items: [
          'React',
          'Next.js',
          'TypeScript',
          'Tailwind CSS',
          'React Native',
          'Micro Frontends',
          'Design Systems',
        ],
      },
      {
        label: 'Backend and APIs',
        items: ['Node.js', 'Fastify', 'PostgreSQL', 'Prisma', 'JWT', 'REST APIs'],
      },
      {
        label: 'Engineering',
        items: ['Git', 'Docker', 'CI/CD', 'testing', 'accessibility', 'monitoring'],
      },
      {
        label: 'AI and automation',
        items: ['LLMs', 'process automation', 'agents', 'Model Context Protocol (MCP)'],
      },
      {
        label: 'Marketing and acquisition (Atto)',
        items: ['Meta Ads', 'WhatsApp Cloud API', 'funnel and measurement', 'SEO and AI search'],
      },
    ],
    venture: {
      name: 'Atto',
      role: 'Co-founder (with Juliano Paludo)',
      summary:
        'Software house and marketing studio: custom digital products, integrations, AI automation and campaigns that bring customers, with scope, timeline and price agreed before we start.',
      fronts: [
        'Websites, systems and e-commerce (React, Next.js, Astro)',
        'Mobile apps (React Native)',
        'Integrations and AI (APIs, WhatsApp, ERPs, automation)',
        'Marketing and acquisition (paid traffic, digital presence, WhatsApp funnel)',
      ],
      routing:
        'Project, quote, timeline or partnership requests: introduce Atto (attodev.com.br) for work with agreed scope and price, and also offer the direct message through the chat; the visitor chooses.',
    },
  },
  es: {
    availability:
      'Trabajo en Lemon Energia como contratista en un compromiso no exclusivo y soy cofundador de Atto. Para proyectos, presupuestos y colaboraciones hay dos caminos: Atto, para trabajo con alcance, plazo y precio cerrados, o hablar directamente conmigo por el mensaje del chat o LinkedIn; puedo evaluarlos según la propuesta, el alcance, la compatibilidad y mi disponibilidad. Conversaciones sobre ingeniería, carrera y comunidad: aquí o en LinkedIn.',
    experienceSummary: '5+ años en software y 10 años de trayectoria profesional',
    experiences: [
      {
        company: 'Lemon Energia',
        current: true,
        endDate: null,
        location: 'Remoto',
        outcomes: [],
        period: 'Jul 2026 - Presente',
        role: 'Ingeniero de Software',
        scope: [
          'Actúo como puente entre negocio y tecnología, investigando problemas operativos y transformando reglas complejas del recorrido energético en soluciones full stack',
          'Conduzco discovery continuo y documento decisiones, requisitos y trade-offs entre producto y tecnología',
          'Uso IA con revisión crítica para acelerar prototipos y entregas confiables y escalables',
        ],
        startDate: '2026-07',
      },
      {
        company: 'Luizalabs',
        current: false,
        endDate: '2026-06',
        location: 'Remoto',
        outcomes: [
          'Trabajé en aplicaciones web y móviles para operaciones de tiendas físicas de Magalu',
          'Desarrollé y mantuve APIs REST, integraciones, micro frontends y soluciones backend',
          'Contribuí a productos usados en inventario y logística en 1.000+ tiendas y por 1.000+ almacenistas',
        ],
        period: 'Oct 2023 - Jun 2026',
        role: 'Desarrollador Pleno',
        scope: [],
        startDate: '2023-10',
      },
      {
        company: 'Smarten',
        current: false,
        endDate: '2023-09',
        location: 'Remoto',
        outcomes: [
          'Lideré un equipo de desarrollo frontend',
          'Creé y mantuve un Design System corporativo adoptado en múltiples productos',
          'Implementé CI/CD y monitoreo',
        ],
        period: 'May 2022 - Sep 2023',
        role: 'Tech Lead Front-end',
        scope: [],
        startDate: '2022-05',
      },
      {
        company: 'SBSistemas',
        current: false,
        endDate: '2022-05',
        location: 'Presencial',
        outcomes: ['Inicié mi experiencia profesional en tecnología y consolidé mi base técnica'],
        period: 'May 2021 - May 2022',
        role: 'Desarrollador Front-end',
        scope: [],
        startDate: '2021-05',
      },
    ],
    hobbies: ['juegos', 'tecnología', 'explorar nuevas herramientas'],
    location: 'Paraí, Rio Grande do Sul, Brasil',
    name: 'Ranielli Montagna',
    nationality: 'Brasileño',
    professionalProfile:
      'Ingeniero de software en Lemon Energia y cofundador de Atto (software a medida y marketing)',
    projects: [
      {
        name: 'NaN Solutions (Atto)',
        summary:
          'Sitio de una tienda de tecnología en Papanduva/SC enfocado en la tienda física y el e-commerce, Lighthouse 100 en las cuatro notas',
        technologies: ['Astro', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Cloudflare Pages'],
      },
      {
        name: 'Fronteira Sul Drones (Atto)',
        summary:
          'E-commerce agrícola de drones y piezas con catálogo, carrito consultivo y checkout por WhatsApp',
        technologies: ['React', 'TypeScript', 'Vite', 'Cloudflare Workers', 'R2'],
      },
      {
        name: 'TALA Drone Partners (Atto)',
        summary:
          'Plataforma de socios para la expansión regional de drones agrícolas: dashboard, CRM, seguimiento y comisiones',
        technologies: ['React', 'TypeScript', 'Vite', 'TanStack Router', 'GSAP'],
      },
      {
        name: 'Quadralize (Atto)',
        summary: 'Gestión de canchas deportivas: reservas, CRM, punto de venta, pagos y finanzas',
        technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      },
      {
        name: 'Mobile Estoquista Magalu',
        summary: 'Superapp para almacenistas de Magalu',
        technologies: ['React Native', 'TypeScript', 'Micro-frontend'],
      },
      {
        name: 'Pratio',
        summary: 'Punto de venta para restaurantes con NFC-e y menú digital',
        technologies: ['React', 'Electron', 'TypeScript'],
      },
    ],
    technicalAreas: [
      {
        label: 'Frontend y mobile',
        items: [
          'React',
          'Next.js',
          'TypeScript',
          'Tailwind CSS',
          'React Native',
          'Micro Frontends',
          'Design Systems',
        ],
      },
      {
        label: 'Backend y APIs',
        items: ['Node.js', 'Fastify', 'PostgreSQL', 'Prisma', 'JWT', 'REST APIs'],
      },
      {
        label: 'Ingeniería',
        items: ['Git', 'Docker', 'CI/CD', 'pruebas', 'accesibilidad', 'monitoreo'],
      },
      {
        label: 'IA y automatización',
        items: ['LLMs', 'automatización de procesos', 'agentes', 'Model Context Protocol (MCP)'],
      },
      {
        label: 'Marketing y adquisición (Atto)',
        items: ['Meta Ads', 'WhatsApp Cloud API', 'embudo y medición', 'SEO y búsqueda por IA'],
      },
    ],
    venture: {
      name: 'Atto',
      role: 'Cofundador (con Juliano Paludo)',
      summary:
        'Software house y marketing: productos digitales a medida, integraciones, automatización con IA y campañas que traen clientes, con alcance, plazo y precio cerrados antes de empezar.',
      fronts: [
        'Sitios, sistemas y e-commerce (React, Next.js, Astro)',
        'Apps móviles (React Native)',
        'Integraciones e IA (APIs, WhatsApp, ERPs, automatización)',
        'Marketing y adquisición (tráfico pago, presencia digital, embudo en WhatsApp)',
      ],
      routing:
        'Pedidos de proyecto, presupuesto, plazo o colaboración: presentar Atto (attodev.com.br) para trabajo con alcance y precio cerrados y también ofrecer el mensaje directo por el chat; el visitante elige.',
    },
  },
} satisfies Record<ChatLocale, ChatProfile>
