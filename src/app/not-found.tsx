'use client'

import { Home } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-gray-950">
        <div className="text-center">
          <span className="mb-8 block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text font-mono text-[120px] leading-none font-bold text-transparent sm:text-[150px]">
            404
          </span>

          <h1 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            Page not found
          </h1>

          <p className="mb-8 text-slate-600 dark:text-slate-400">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl"
          >
            <Home className="h-5 w-5" />
            Back to home
          </Link>
        </div>
      </body>
    </html>
  )
}
