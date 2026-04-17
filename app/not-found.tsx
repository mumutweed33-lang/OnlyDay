import Link from 'next/link'
import { BrandLockup } from '@/components/ui/BrandLogo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050508] px-6 py-10 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-[24px] border border-white/8 bg-black/20 px-4 py-3 backdrop-blur-2xl">
        <BrandLockup subtitle="premium social commerce" subtitleClassName="text-[11px] uppercase tracking-[0.18em] text-white/30" />
        <Link href="/" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:text-white">
          Voltar para a home
        </Link>
      </div>

      <div className="mx-auto mt-20 max-w-3xl rounded-[32px] border border-white/8 bg-white/[0.04] p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/80">404</div>
        <h1 className="mb-4 text-5xl font-black tracking-[-0.04em]">Essa página saiu do fluxo.</h1>
        <p className="mx-auto max-w-xl text-white/60">
          O endereço que você tentou abrir não está disponível agora. Vamos te levar de volta para a entrada principal da OnlyDay.
        </p>
        <div className="mt-8">
          <Link href="/" className="inline-flex rounded-2xl btn-primary px-6 py-3 text-sm font-semibold text-white">
            Ir para a home
          </Link>
        </div>
      </div>
    </div>
  )
}
