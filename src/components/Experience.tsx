"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Building2, Calendar, MapPin, ChevronRight } from "lucide-react";

export default function Experience() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const experiences = [
    {
      company: "Luizalabs",
      position: "Desenvolvedor Pleno",
      period: "Outubro 2023 - Atualmente",
      location: "Remoto",
      logo: "/companies/luizalabs.webp",
      description:
        "Integro a equipe da Luizalabs, unidade de inovação tecnológica do Magalu, uma das maiores varejistas do Brasil. Desenvolvo e mantenho aplicações web e móveis para operações das lojas físicas, além de APIs e soluções backend robustas e escaláveis.",
      highlights: [
        "Desenvolvimento de aplicações para operações de varejo",
        "Manutenção de APIs e soluções backend",
        "Integração de sistemas em ambiente de alto impacto",
        "Trabalho com tecnologias modernas e escaláveis",
      ],
      technologies: ["React", "React Native", "Node.js", "Go", "APIs REST"],
      current: true,
    },
    {
      company: "Smarten",
      position: "Tech Lead Front-end",
      period: "Maio 2022 - Setembro 2023",
      location: "Remoto",
      logo: "/companies/smarten.webp",
      description:
        "Liderei uma equipe de desenvolvedores, garantindo qualidade de código e otimização de aplicações. Criei e mantive design system corporativo, implementei soluções de monitoramento e CI/CD, impulsionando eficiência e estabilidade dos produtos.",
      highlights: [
        "Liderança técnica de equipe de desenvolvedores",
        "Criação e manutenção de design system",
        "Implementação de CI/CD e monitoramento",
        "Otimização de performance e escalabilidade",
      ],
      technologies: [
        "JavaScript",
        "React",
        "Design System",
        "CI/CD",
        "Monitoramento",
      ],
      current: false,
    },
    {
      company: "SBSistemas",
      position: "Desenvolvedor Front-end",
      period: "Maio 2021 - Maio 2022",
      location: "Presencial",
      logo: "/companies/sbsistemas.svg",
      description:
        "Primeira experiência profissional na área de tecnologia, onde consolidei minha base técnica em desenvolvimento front-end. Desenvolvi aplicações utilizando tecnologias modernas e implementei boas práticas de desenvolvimento.",
      highlights: [
        "Primeira experiência profissional em tech",
        "Desenvolvimento de aplicações front-end",
        "Consolidação de base técnica sólida",
        "Implementação de boas práticas de desenvolvimento",
      ],
      technologies: [
        "React",
        "Electron",
        "TypeScript",
        "JavaScript",
        "Front-end",
      ],
      current: false,
    },
  ];

  return (
    <section className="relative py-20 lg:py-32 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1e293b08_1px,transparent_1px),linear-gradient(-45deg,#64748b08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 right-32 w-64 h-64 bg-slate-200/20 dark:bg-slate-700/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-32 w-80 h-80 bg-slate-300/10 dark:bg-slate-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div
            className={`inline-flex items-center px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium mb-6 transition-all duration-1000 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Minha jornada profissional
          </div>

          <h2
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6 transition-all duration-1000 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Experiência{" "}
            <span className="text-slate-600 dark:text-slate-400">
              Profissional
            </span>
          </h2>

          <p
            className={`text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto transition-all duration-1000 delay-400 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Mais de 3 anos construindo soluções inovadoras em empresas de
            diferentes portes e segmentos, sempre focado em entregar valor e
            crescer tecnicamente.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-8 md:left-1/2 transform md:-translate-x-px top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <div
                key={exp.company}
                className={`relative transition-all duration-1000 ${
                  mounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${600 + index * 200}ms` }}
              >
                <div className="absolute left-6 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-slate-600 dark:bg-slate-400 rounded-full border-4 border-white dark:border-slate-900 z-10">
                  {exp.current && (
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>

                <div
                  className={`ml-16 md:ml-0 ${
                    index % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"
                  } md:w-1/2 ${index % 2 === 0 ? "md:ml-0" : "md:ml-auto"}`}
                >
                  <div className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:scale-[1.02]">
                    <div
                      className={`flex items-center gap-4 mb-6 ${
                        index % 2 === 0 ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center overflow-hidden">
                          <Image
                            src={exp.logo}
                            alt={`${exp.company} logo`}
                            width={48}
                            height={48}
                            className="w-16 h-16 object-cover"
                            quality={100}
                          />
                        </div>
                      </div>

                      <div
                        className={`flex-1 ${
                          index % 2 === 0 ? "md:text-right" : ""
                        }`}
                      >
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                          {exp.position}
                        </h3>
                        <p className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {exp.company}
                        </p>

                        <div
                          className={`flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-500 ${
                            index % 2 === 0 ? "md:justify-end" : ""
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {exp.period}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {exp.location}
                          </div>
                          {exp.current && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Atual
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p
                      className={`text-slate-600 dark:text-slate-400 mb-6 leading-relaxed ${
                        index % 2 === 0 ? "md:text-right" : ""
                      }`}
                    >
                      {exp.description}
                    </p>

                    <div
                      className={`mb-6 ${
                        index % 2 === 0 ? "md:text-right" : ""
                      }`}
                    >
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Principais conquistas:
                      </h4>
                      <ul
                        className={`space-y-2 ${
                          index % 2 === 0 ? "md:text-right" : ""
                        }`}
                      >
                        {exp.highlights.map((highlight, idx) => (
                          <li
                            key={idx}
                            className={`flex items-start gap-2 ${
                              index % 2 === 0
                                ? "md:flex-row-reverse md:text-right"
                                : ""
                            }`}
                          >
                            <ChevronRight
                              className={`w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0 ${
                                index % 2 === 0 ? "md:rotate-180" : ""
                              }`}
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {highlight}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      className={`${index % 2 === 0 ? "md:text-right" : ""}`}
                    >
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Tecnologias utilizadas:
                      </h4>
                      <div
                        className={`flex flex-wrap gap-2 ${
                          index % 2 === 0 ? "md:justify-end" : ""
                        }`}
                      >
                        {exp.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`text-center mt-16 transition-all duration-1000 delay-1200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Interessado em trabalhar comigo?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Estou sempre aberto a novas oportunidades e desafios. Vamos
              conversar sobre como posso agregar valor ao seu projeto.
            </p>
            <a
              href="#contato"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white transition-all duration-300 bg-slate-900 dark:bg-slate-700 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
            >
              Vamos conversar
              <ChevronRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
