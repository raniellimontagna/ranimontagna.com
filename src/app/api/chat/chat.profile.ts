export type ChatLocale = 'pt' | 'en' | 'es'

export type ChatExperience = {
  company: string
  current: boolean
  location: string
  outcomes: string[]
  period: string
  role: string
  scope: string[]
}

export type ChatProject = {
  name: string
  summary: string
  technologies: string[]
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
}

export const CHAT_CONTACT_LINKS = {
  github: 'https://github.com/RanielliMontagna',
  linkedin: 'https://www.linkedin.com/in/rannimontagna',
  website: 'https://ranimontagna.com',
} as const

export const CHAT_PROFILE_BY_LOCALE = {
  pt: {
    availability:
      'Atualmente trabalho na Lemon Energia e estou aberto a parcerias e conversas relevantes.',
    experienceSummary: '5+ anos em software e 10 anos de trajetória profissional',
    experiences: [
      {
        company: 'Lemon Energia',
        current: true,
        location: 'Remoto',
        outcomes: [],
        period: 'Jul 2026 - Presente',
        role: 'Engenheiro de Software',
        scope: [
          'Atuo na ponte entre negócio e tecnologia, investigando problemas operacionais e transformando regras complexas da jornada de energia em soluções full stack',
          'Conduzo discovery contínuo e documento decisões, requisitos e trade-offs entre produto e tecnologia',
          'Uso IA com revisão crítica para acelerar prototipação e entregas confiáveis e escaláveis',
        ],
      },
      {
        company: 'Luizalabs',
        current: false,
        location: 'Remoto',
        outcomes: [
          'Atuei em aplicações web e mobile para operações de lojas físicas do Magalu',
          'Desenvolvi e mantive APIs REST, integrações, micro frontends e soluções backend',
          'Contribuí para produtos usados em estoque e logística em 1.000+ lojas e por 1.000+ estoquistas',
        ],
        period: 'Out 2023 - Jun 2026',
        role: 'Desenvolvedor Pleno',
        scope: [],
      },
      {
        company: 'Smarten',
        current: false,
        location: 'Remoto',
        outcomes: [
          'Liderei uma equipe de desenvolvimento frontend',
          'Criei e mantive um Design System corporativo adotado em múltiplos produtos',
          'Implementei CI/CD e monitoramento',
        ],
        period: 'Mai 2022 - Set 2023',
        role: 'Tech Lead Front-end',
        scope: [],
      },
      {
        company: 'SBSistemas',
        current: false,
        location: 'Presencial',
        outcomes: [
          'Iniciei minha experiência profissional em tecnologia e consolidei minha base técnica',
        ],
        period: 'Mai 2021 - Mai 2022',
        role: 'Desenvolvedor Front-end',
        scope: [],
      },
    ],
    hobbies: ['jogos', 'tecnologia', 'explorar novas stacks'],
    location: 'Paraí, Rio Grande do Sul, Brasil',
    name: 'Ranielli Montagna',
    nationality: 'Brasileiro',
    professionalProfile: 'Engenheiro de Software Full Stack',
    projects: [
      {
        name: 'North Clinic',
        summary: 'Sistema de gestão para clínicas',
        technologies: ['JavaScript', 'Go', 'REST API'],
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
    ],
  },
  en: {
    availability:
      'I currently work at Lemon Energia and am open to partnerships and relevant conversations.',
    experienceSummary: '5+ years in software and 10 years of professional experience',
    experiences: [
      {
        company: 'Lemon Energia',
        current: true,
        location: 'Remote',
        outcomes: [],
        period: 'Jul 2026 - Present',
        role: 'Software Engineer',
        scope: [
          'I bridge business and technology, investigating operational problems and turning complex energy-journey rules into full-stack solutions',
          'I lead continuous discovery and document decisions, requirements, and product-technology trade-offs',
          'I use AI with critical review to accelerate reliable and scalable prototyping and delivery',
        ],
      },
      {
        company: 'Luizalabs',
        current: false,
        location: 'Remote',
        outcomes: [
          'I worked on web and mobile applications for Magalu physical store operations',
          'I developed and maintained REST APIs, integrations, micro frontends, and backend solutions',
          'I contributed to products used in inventory and logistics across 1,000+ stores and by 1,000+ stock clerks',
        ],
        period: 'Oct 2023 - Jun 2026',
        role: 'Mid-Level Developer',
        scope: [],
      },
      {
        company: 'Smarten',
        current: false,
        location: 'Remote',
        outcomes: [
          'I led a frontend development team',
          'I created and maintained a corporate Design System adopted across multiple products',
          'I implemented CI/CD and monitoring',
        ],
        period: 'May 2022 - Sep 2023',
        role: 'Front-end Tech Lead',
        scope: [],
      },
      {
        company: 'SBSistemas',
        current: false,
        location: 'On-site',
        outcomes: [
          'I began my professional technology career and built a solid technical foundation',
        ],
        period: 'May 2021 - May 2022',
        role: 'Front-end Developer',
        scope: [],
      },
    ],
    hobbies: ['games', 'technology', 'exploring new stacks'],
    location: 'Paraí, Rio Grande do Sul, Brazil',
    name: 'Ranielli Montagna',
    nationality: 'Brazilian',
    professionalProfile: 'Full Stack Software Engineer',
    projects: [
      {
        name: 'North Clinic',
        summary: 'Clinic management system',
        technologies: ['JavaScript', 'Go', 'REST API'],
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
    ],
  },
  es: {
    availability:
      'Actualmente trabajo en Lemon Energia y estoy abierto a colaboraciones y conversaciones relevantes.',
    experienceSummary: '5+ años en software y 10 años de trayectoria profesional',
    experiences: [
      {
        company: 'Lemon Energia',
        current: true,
        location: 'Remoto',
        outcomes: [],
        period: 'Jul 2026 - Presente',
        role: 'Ingeniero de Software',
        scope: [
          'Actúo como puente entre negocio y tecnología, investigando problemas operativos y transformando reglas complejas del recorrido energético en soluciones full stack',
          'Conduzco discovery continuo y documento decisiones, requisitos y trade-offs entre producto y tecnología',
          'Uso IA con revisión crítica para acelerar prototipos y entregas confiables y escalables',
        ],
      },
      {
        company: 'Luizalabs',
        current: false,
        location: 'Remoto',
        outcomes: [
          'Trabajé en aplicaciones web y móviles para operaciones de tiendas físicas de Magalu',
          'Desarrollé y mantuve APIs REST, integraciones, micro frontends y soluciones backend',
          'Contribuí a productos usados en inventario y logística en 1.000+ tiendas y por 1.000+ almacenistas',
        ],
        period: 'Oct 2023 - Jun 2026',
        role: 'Desarrollador Pleno',
        scope: [],
      },
      {
        company: 'Smarten',
        current: false,
        location: 'Remoto',
        outcomes: [
          'Lideré un equipo de desarrollo frontend',
          'Creé y mantuve un Design System corporativo adoptado en múltiples productos',
          'Implementé CI/CD y monitoreo',
        ],
        period: 'May 2022 - Sep 2023',
        role: 'Tech Lead Front-end',
        scope: [],
      },
      {
        company: 'SBSistemas',
        current: false,
        location: 'Presencial',
        outcomes: ['Inicié mi experiencia profesional en tecnología y consolidé mi base técnica'],
        period: 'May 2021 - May 2022',
        role: 'Desarrollador Front-end',
        scope: [],
      },
    ],
    hobbies: ['juegos', 'tecnología', 'explorar nuevas herramientas'],
    location: 'Paraí, Rio Grande do Sul, Brasil',
    name: 'Ranielli Montagna',
    nationality: 'Brasileño',
    professionalProfile: 'Ingeniero de Software Full Stack',
    projects: [
      {
        name: 'North Clinic',
        summary: 'Sistema de gestión para clínicas',
        technologies: ['JavaScript', 'Go', 'REST API'],
      },
      {
        name: 'Mobile Estoquista Magalu',
        summary: 'Superapp para almacenistas de Magalu',
        technologies: ['React Native', 'TypeScript', 'Micro-frontend'],
      },
      {
        name: 'Pratio',
        summary: 'PDV para restaurantes con NFC-e y menú digital',
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
    ],
  },
} satisfies Record<ChatLocale, ChatProfile>
