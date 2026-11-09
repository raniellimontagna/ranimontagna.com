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
  outcomes: string[]
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
  /** Facts published on the site (cases, AI section, Vega); safe to repeat. */
  siteFacts: string[]
  technicalAreas: Array<{ label: string; items: string[] }>
  venture: ChatVenture
}

export const CHAT_PROFILE_BY_LOCALE = {
  pt: {
    availability:
      'Ele trabalha na Lemon Energia como PJ, num compromisso não exclusivo, e é sócio-fundador da Atto. Para projetos, orçamentos e parcerias há dois caminhos: a Atto, para trabalho com escopo, prazo e preço fechados (seção Atto deste site, com WhatsApp), ou falar direto com ele pelo LinkedIn; ele avalia conforme a proposta, o escopo, a compatibilidade e a disponibilidade. Conversas sobre engenharia, carreira e comunidade: pelo LinkedIn.',
    experienceSummary: '5+ anos em software e 10 anos de trajetória profissional',
    experiences: [
      {
        company: 'Lemon Energia',
        current: true,
        endDate: null,
        location: 'Remoto',
        outcomes: [
          'Seis produtos de finanças em três meses: conciliação bancária, lotes de pagamento, fornecedores, notas fiscais e notas de débito',
          'Cada um de ponta a ponta: front em React, API em Fastify com PostgreSQL e a infraestrutura escrita em código com Pulumi',
          'Na AWS: containers no ECS Fargate, banco no Aurora (RDS), eventos com EventBridge e SQS, segredos no Secrets Manager, entrega por API Gateway e CloudFront',
          'Ritmo alto de entrega, com agentes de IA no fluxo e revisão crítica antes de ir ao ar',
        ],
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
          'Trabalhei com back-end em Go e Node.js no GCP, filas no RabbitMQ, análise de código no SonarQube e monitoramento no Grafana',
          'Passei por Black Fridays por dentro, o período mais crítico de um sistema de varejo',
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
          'Site institucional de loja de tecnologia em Papanduva/SC, foco em loja física e e-commerce, com performance e SEO no topo',
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
    siteFacts: [
      'Klick: timer de speedcubing offline-first para os 13 eventos da WCA; 428 de 429 commits com coautoria de IA',
      'Grimory: mesa de D&D 5e em português, do personagem à sessão; a IA propõe, as regras validam e o jogador decide; 2328 de 2495 commits com coautoria de IA',
      'agent-toolkit: instala as mesmas skills em 5 agentes (Claude Code, Codex, OpenCode, Gemini CLI e Antigravity)',
      'Seção de IA do site: usa Claude, Codex, Gemini, DeepSeek, OpenRouter e MCP no dia a dia, sem amarra a um modelo ou empresa; trabalha com spec-driven development (conversa, spec, plano, teste primeiro, agente codifica, revisão humana), TDD, AGENTS.md e evals; o site tem mais de 1.000 testes',
      'A Vega, esta assistente, roda em DeepSeek, e o código aceita o OpenRouter como reserva: 2 provedores',
      'Na Lemon usa React, TypeScript, Fastify, PostgreSQL, Pulumi e AWS (ECS Fargate, Aurora/RDS, EventBridge, SQS, Secrets Manager, API Gateway e CloudFront)',
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
      'He works at Lemon Energia as a contractor in a non-exclusive engagement and is co-founder of Atto. For projects, quotes and partnerships there are two paths: Atto, for work with scope, timeline and price agreed upfront (the Atto section of this site, with WhatsApp), or reaching him directly on LinkedIn; he evaluates depending on the proposal, scope, fit and availability. Engineering, career and community conversations: on LinkedIn.',
    experienceSummary: '5+ years in software and 10 years of professional experience',
    experiences: [
      {
        company: 'Lemon Energia',
        current: true,
        endDate: null,
        location: 'Remote',
        outcomes: [
          'Six finance products in three months: bank reconciliation, payment batches, suppliers, invoices and debit notes',
          'Each one end to end: React front end, Fastify API with PostgreSQL and the infrastructure written as code with Pulumi',
          'On AWS: containers on ECS Fargate, database on Aurora (RDS), events with EventBridge and SQS, secrets in Secrets Manager, delivery through API Gateway and CloudFront',
          'A fast delivery pace, with AI agents in the loop and critical review before anything goes live',
        ],
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
          'I worked with Go and Node.js back ends on GCP, RabbitMQ queues, SonarQube code analysis and Grafana monitoring',
          'I went through Black Fridays from the inside, the most critical period for a retail system',
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
          'Website for a tech store in Papanduva/SC focused on the physical store and e-commerce, with top performance and SEO',
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
    siteFacts: [
      'Klick: offline-first speedcubing timer for the 13 WCA events; 428 of 429 commits co-authored with AI',
      'Grimory: a D&D 5e table in Portuguese, from character to session; AI proposes, the rules validate and the player decides; 2328 of 2495 commits co-authored with AI',
      'agent-toolkit: installs the same skills in 5 agents (Claude Code, Codex, OpenCode, Gemini CLI and Antigravity)',
      "The site's AI section: he uses Claude, Codex, Gemini, DeepSeek, OpenRouter and MCP daily, with no lock-in to one model or company; he works with spec-driven development (conversation, spec, plan, test first, agent codes, human review), TDD, AGENTS.md and evals; the site has more than 1,000 tests",
      'Vega, this assistant, runs on DeepSeek, and the code accepts OpenRouter as a fallback: 2 providers',
      'At Lemon he uses React, TypeScript, Fastify, PostgreSQL, Pulumi and AWS (ECS Fargate, Aurora/RDS, EventBridge, SQS, Secrets Manager, API Gateway and CloudFront)',
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
      'Trabaja en Lemon Energia como contratista en un compromiso no exclusivo y es cofundador de Atto. Para proyectos, presupuestos y colaboraciones hay dos caminos: Atto, para trabajo con alcance, plazo y precio cerrados (la sección Atto de este sitio, con WhatsApp), o hablar directamente con él por LinkedIn; él evalúa según la propuesta, el alcance, la compatibilidad y la disponibilidad. Conversaciones sobre ingeniería, carrera y comunidad: por LinkedIn.',
    experienceSummary: '5+ años en software y 10 años de trayectoria profesional',
    experiences: [
      {
        company: 'Lemon Energia',
        current: true,
        endDate: null,
        location: 'Remoto',
        outcomes: [
          'Seis productos de finanzas en tres meses: conciliación bancaria, lotes de pago, proveedores, facturas y notas de débito',
          'Cada uno de punta a punta: front en React, API en Fastify con PostgreSQL y la infraestructura escrita como código con Pulumi',
          'En AWS: contenedores en ECS Fargate, base de datos en Aurora (RDS), eventos con EventBridge y SQS, secretos en Secrets Manager, entrega por API Gateway y CloudFront',
          'Ritmo alto de entrega, con agentes de IA en el flujo y revisión crítica antes de publicar',
        ],
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
          'Trabajé con back-end en Go y Node.js sobre GCP, colas en RabbitMQ, análisis de código en SonarQube y monitoreo en Grafana',
          'Viví Black Fridays desde dentro, el período más crítico de un sistema de retail',
        ],
        period: 'Oct 2023 - Jun 2026',
        role: 'Desarrollador Semi Senior',
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
          'Creé y mantuve un Design System corporativo adoptado en varios productos',
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
          'Sitio de una tienda de tecnología en Papanduva/SC enfocado en la tienda física y el e-commerce, con rendimiento y SEO en lo más alto',
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
    siteFacts: [
      'Klick: temporizador de speedcubing offline-first para los 13 eventos de la WCA; 428 de 429 commits con coautoría de IA',
      'Grimory: una mesa de D&D 5e en portugués, del personaje a la sesión; la IA propone, las reglas validan y el jugador decide; 2328 de 2495 commits con coautoría de IA',
      'agent-toolkit: instala las mismas skills en 5 agentes (Claude Code, Codex, OpenCode, Gemini CLI y Antigravity)',
      'Sección de IA del sitio: usa Claude, Codex, Gemini, DeepSeek, OpenRouter y MCP en el día a día, sin ataduras a un modelo o empresa; trabaja con spec-driven development (conversación, spec, plan, prueba primero, el agente programa, revisión humana), TDD, AGENTS.md y evals; el sitio tiene más de 1.000 pruebas',
      'Vega, esta asistente, funciona con DeepSeek, y el código acepta OpenRouter como respaldo: 2 proveedores',
      'En Lemon usa React, TypeScript, Fastify, PostgreSQL, Pulumi y AWS (ECS Fargate, Aurora/RDS, EventBridge, SQS, Secrets Manager, API Gateway y CloudFront)',
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
