"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Monitor,
  Server,
  Palette,
  Settings,
  Download,
  MessageCircle,
  User,
  CheckCircle,
} from "lucide-react";

export function About() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { number: "3+", label: "Anos de experiência" },
    { number: "20+", label: "Projetos concluídos" },
    { number: "100%", label: "Dedicação" },
  ];

  const skills = [
    {
      category: "Frontend",
      technologies: [
        "React",
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "React Native",
      ],
      icon: Monitor,
    },
    {
      category: "Backend",
      technologies: ["Node.js", "Express", "PostgreSQL", "Prisma", "JWT"],
      icon: Server,
    },
    {
      category: "Design",
      technologies: ["Figma", "UI/UX", "Prototipagem", "Design System"],
      icon: Palette,
    },
    {
      category: "Ferramentas",
      technologies: ["Git", "Docker", "VS Code", "Postman", "Vercel"],
      icon: Settings,
    },
  ];

  return (
    <section
      id="about"
      className="relative py-20 lg:py-32 bg-slate-50 dark:bg-slate-900 overflow-hidden"
    >
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
            <User className="w-4 h-4 mr-2" />
            Conheça mais sobre mim
          </div>

          <h2
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6 transition-all duration-1000 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Sobre{" "}
            <span className="text-slate-600 dark:text-slate-400">Mim</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div
            className={`relative transition-all duration-1000 delay-400 ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-slate-200 dark:bg-slate-700 rounded-2xl blur opacity-20 transition duration-1000"></div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-slate-300/30 dark:bg-slate-600/30 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-slate-400/20 dark:bg-slate-500/20 rounded-full"></div>

              <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                <Image
                  src="/photo.webp"
                  alt="Ranielli Montagna"
                  width={400}
                  height={400}
                  className="w-full  object-cover rounded-xl"
                  priority
                />
              </div>
            </div>
          </div>

          <div
            className={`space-y-6 transition-all duration-1000 delay-600 ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="space-y-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Olá! Sou{" "}
                <strong className="text-slate-900 dark:text-slate-100">
                  Ranielli Montagna
                </strong>
                , um desenvolvedor full stack apaixonado por transformar ideias
                em soluções digitais inovadoras. Com mais de 3 anos de
                experiência, especializo-me em criar aplicações web e mobile que
                combinam funcionalidade excepcional com design intuitivo.
              </p>

              <p>
                Minha jornada começou com curiosidade sobre como as coisas
                funcionam na web, e desde então venho desenvolvendo projetos que
                impactam positivamente a vida das pessoas. Acredito que a
                tecnologia deve ser acessível e fazer a diferença.
              </p>

              <p>
                Quando não estou codando, você pode me encontrar explorando
                novas tecnologias, contribuindo para projetos open source, ou
                planejando minha próxima aventura de desenvolvimento.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <a
                href="/curriculo-ranielli-montagna.pdf"
                download="Curriculo-Ranielli-Montagna.pdf"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white transition-all duration-300 bg-slate-900 dark:bg-slate-700 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
              >
                <Download className="mr-2 w-5 h-5" />
                Baixar Currículo
              </a>

              <a
                href="#contato"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-slate-700 dark:text-slate-300 transition-all duration-300 bg-transparent border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                Vamos conversar
              </a>
            </div>
          </div>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 transition-all duration-1000 delay-800 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center group"
              style={{ animationDelay: `${800 + index * 200}ms` }}
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 group-hover:scale-105">
                <div className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`transition-all duration-1000 delay-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100 mb-12">
            Minhas principais competências
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map((skill, index) => {
              const IconComponent = skill.icon;
              return (
                <div
                  key={skill.category}
                  className="group bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:scale-105"
                  style={{ animationDelay: `${1000 + index * 150}ms` }}
                >
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    {skill.category}
                  </h4>
                  <ul className="space-y-2">
                    {skill.technologies.map((tech) => (
                      <li
                        key={tech}
                        className="text-sm text-slate-600 dark:text-slate-400 flex items-center"
                      >
                        <CheckCircle className="w-3 h-3 text-slate-400 dark:text-slate-500 mr-2" />
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
