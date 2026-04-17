'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BrandLockup } from '@/components/ui/BrandLogo'

interface PublicInfoShellProps {
  title: string
  eyebrow?: string
  description: string
  children: React.ReactNode
}

export function PublicInfoShell({
  title,
  eyebrow = 'OnlyDay',
  description,
  children,
}: PublicInfoShellProps) {
  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(192,132,252,0.14),_transparent_32%),radial-gradient(circle_at_20%_80%,_rgba(59,130,246,0.10),_transparent_28%)]" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-8">
        <div className="mb-10 flex items-center justify-between rounded-[24px] border border-white/8 bg-black/20 px-4 py-3 backdrop-blur-2xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          <BrandLockup subtitle="premium social commerce" subtitleClassName="text-[11px] uppercase tracking-[0.18em] text-white/30" />
        </div>

        <div className="mb-8 rounded-[32px] border border-white/8 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">{eyebrow}</div>
          <h1 className="mb-4 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">{title}</h1>
          <p className="max-w-3xl text-base leading-relaxed text-white/62">{description}</p>
        </div>

        <div className="rounded-[32px] border border-white/8 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
          <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-white/70 prose-li:text-white/70 prose-strong:text-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
