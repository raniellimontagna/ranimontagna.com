'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Send, Github, Linkedin, Download } from 'lucide-react'

export function Contact() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-white py-20 lg:py-32 dark:bg-slate-900"
    >
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1e293b08_1px,transparent_1px),linear-gradient(-45deg,#64748b08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 right-32 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-700/20"></div>
        <div className="absolute bottom-32 left-32 h-80 w-80 rounded-full bg-purple-300/10 blur-3xl dark:bg-purple-600/10"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div
            className={`mb-6 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-1000 dark:bg-slate-800 dark:text-slate-300 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <Mail className="mr-2 h-4 w-4" />
            Entre em contato
          </div>

          <h2
            className={`mb-6 text-4xl font-bold text-slate-900 transition-all delay-200 duration-1000 sm:text-5xl lg:text-6xl dark:text-slate-100 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            Vamos trabalhar{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              juntos
            </span>
          </h2>
          <p
            className={`mx-auto max-w-3xl text-xl text-slate-600 transition-all delay-400 duration-1000 dark:text-slate-300 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            Tenho interesse em oportunidades freelance ou full-time. Se você tem um projeto em mente
            ou apenas quer bater um papo, ficarei feliz em conversar.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <div
            className={`transition-all delay-600 duration-1000 ${
              mounted ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
            }`}
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-slate-200 opacity-20 blur transition duration-1000 dark:bg-slate-700"></div>
              <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <h3 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">
                  Informações de Contato
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Email</p>
                      <a
                        href="mailto:raniellimontagna@hotmail.com"
                        className="text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                      >
                        raniellimontagna@hotmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Telefone</p>
                      <a
                        href="tel:+5554999790871"
                        className="text-slate-600 transition-colors hover:text-green-600 dark:text-slate-300 dark:hover:text-green-400"
                      >
                        +55 (54) 99979-0871
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Localização</p>
                      <p className="text-slate-600 dark:text-slate-300">
                        Paraí, Rio Grande do Sul, Brasil
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                    Me encontre nas redes
                  </h4>
                  <div className="flex space-x-4">
                    <a
                      href="https://github.com/ranimontagna"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 transition-all duration-300 hover:scale-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                    >
                      <Github className="h-6 w-6 text-slate-600 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white" />
                    </a>
                    <a
                      href="https://linkedin.com/in/ranimontagna"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 transition-all duration-300 hover:scale-105 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
                    >
                      <Linkedin className="h-6 w-6 text-blue-600 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300" />
                    </a>
                  </div>
                </div>

                <div className="mt-8">
                  <a
                    href="/cv_en.pdf"
                    download
                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Baixar Currículo
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`transition-all delay-800 duration-1000 ${
              mounted ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
            }`}
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-slate-200 opacity-20 blur transition duration-1000 dark:bg-slate-700"></div>
              <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <h3 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">
                  Envie uma mensagem
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Nome
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-all duration-300 focus:scale-105 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      placeholder="Seu nome"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-all duration-300 focus:scale-105 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Assunto
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-all duration-300 focus:scale-105 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      placeholder="Assunto da mensagem"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Mensagem
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-all duration-300 focus:scale-105 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      placeholder="Conte-me sobre seu projeto ou ideia..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Enviar Mensagem
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
