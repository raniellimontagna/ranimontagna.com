"use client";

import { useEffect, useState } from "react";
import { Menu, X, Download, Mail, Github, Linkedin } from "lucide-react";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { name: "Início", href: "#start" },
    { name: "Sobre", href: "#about" },
    { name: "Experiência", href: "#experience" },
    { name: "Projetos", href: "#projects" },
    { name: "Contato", href: "#contact" },
  ];

  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/RanielliMontagna",
      icon: Github,
      external: true,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/in/ranimontagna",
      icon: Linkedin,
      external: true,
    },
    {
      name: "Email",
      href: "mailto:raniellimontagna@hotmail.com",
      icon: Mail,
      external: false,
    },
  ];

  const scrollToSection = (href: string) => {
    const targetId = href.substring(1);
    const element = targetId ? document.getElementById(targetId) : null;

    if (href === "#start") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMenuOpen(false);
  };

  const hasBackground = isScrolled || isMenuOpen;

  if (!mounted) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        hasBackground
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex-shrink-0">
            <button
              onClick={() => scrollToSection("#start")}
              className="group flex items-center space-x-3 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">RM</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                  Ranielli Montagna
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors duration-300">
                  Desenvolvedor Full Stack
                </p>
              </div>
            </button>
          </div>

          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors duration-300 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 dark:bg-slate-100 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target={social.external ? "_blank" : undefined}
                    rel={social.external ? "noopener noreferrer" : undefined}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-300"
                    aria-label={social.name}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>

            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>

            <a
              href="/curriculo-ranielli-montagna.pdf"
              download="Curriculo-Ranielli-Montagna.pdf"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Currículo
            </a>
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-colors duration-300"
              aria-label="Toggle menu"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <Menu
                className={`w-6 h-6 transition-transform duration-300 ease-in-out ${
                  isMenuOpen ? "rotate-90 scale-0" : "rotate-0 scale-100"
                }`}
              />
              <X
                className={`w-6 h-6 absolute top-2 left-2 transition-transform duration-300 ease-in-out ${
                  isMenuOpen ? "rotate-0 scale-100" : "-rotate-90 scale-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={`lg:hidden grid transition-all duration-500 ease-in-out ${
            isMenuOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="pt-2 pb-4 space-y-2 border-t border-slate-200 dark:border-slate-700">
              {navigation.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-all duration-300"
                  style={{
                    transitionDelay: `${isMenuOpen ? index * 50 + 100 : 0}ms`,
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen
                      ? "translateY(0)"
                      : "translateY(-10px)",
                  }}
                >
                  {item.name}
                </button>
              ))}

              <div
                className="pt-4 border-t border-slate-200 dark:border-slate-700 transition-all duration-300"
                style={{
                  transitionDelay: `${
                    isMenuOpen ? navigation.length * 50 + 150 : 0
                  }ms`,
                  opacity: isMenuOpen ? 1 : 0,
                }}
              >
                <div className="flex items-center justify-center space-x-4 mb-4">
                  {socialLinks.map((social) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.href}
                        target={social.external ? "_blank" : undefined}
                        rel={
                          social.external ? "noopener noreferrer" : undefined
                        }
                        className="p-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-300"
                        aria-label={social.name}
                      >
                        <IconComponent className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>

                <a
                  href="/curriculo-ranielli-montagna.pdf"
                  download="Curriculo-Ranielli-Montagna.pdf"
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 rounded-lg transition-all duration-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Currículo
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
