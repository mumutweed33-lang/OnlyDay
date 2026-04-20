import Link from 'next/link'
import { MailCheck } from 'lucide-react'

type VerifyEmailPageProps = {
  searchParams?: Promise<{ email?: string }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams
  const email = params?.email

  return (
    <main className="flex min-h-screen items-center justify-center bg-dark px-5 text-white">
      <section className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-500/15">
          <MailCheck className="h-8 w-8 text-violet-300" />
        </div>
        <p className="mb-2 text-xs uppercase tracking-[0.24em] text-violet-200/70">
          Verificacao obrigatoria
        </p>
        <h1 className="mb-3 text-2xl font-black">Confirme seu e-mail</h1>
        <p className="text-sm leading-6 text-white/60">
          Enviamos um link de confirmacao{email ? ` para ${email}` : ''}. A conta so
          entra no OnlyDay depois que esse link for aberto.
        </p>
        <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-5 text-white/45">
          Se nao aparecer, olhe spam/lixeira. Em teste com muitas pessoas, o Supabase
          precisa estar com SMTP proprio configurado para nao travar limite de envio.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-500"
        >
          Voltar para entrar
        </Link>
      </section>
    </main>
  )
}
