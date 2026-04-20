'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Loader2, ShieldAlert } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Confirmando seu e-mail...')

  useEffect(() => {
    let cancelled = false

    async function confirmSession() {
      try {
        const supabase = getSupabaseBrowserClient()
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        } else {
          const { data, error } = await supabase.auth.getSession()
          if (error) throw error
          if (!data.session) {
            throw new Error('Link invalido ou expirado. Tente reenviar a confirmacao.')
          }
        }

        if (cancelled) return
        setStatus('success')
        setMessage('E-mail confirmado. Sua conta OnlyDay esta pronta para entrar.')
        window.setTimeout(() => {
          window.location.replace('/')
        }, 1600)
      } catch (error) {
        if (cancelled) return
        setStatus('error')
        setMessage(
          error instanceof Error
            ? error.message
            : 'Nao foi possivel confirmar seu e-mail agora.'
        )
      }
    }

    void confirmSession()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-dark px-5 text-white">
      <section className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-500/15">
          {status === 'loading' && <Loader2 className="h-8 w-8 animate-spin text-violet-300" />}
          {status === 'success' && <CheckCircle className="h-8 w-8 text-emerald-300" />}
          {status === 'error' && <ShieldAlert className="h-8 w-8 text-rose-300" />}
        </div>
        <h1 className="mb-3 text-2xl font-black">Confirmacao de e-mail</h1>
        <p className="text-sm leading-6 text-white/60">{message}</p>
        {status !== 'loading' && (
          <Link
            href="/"
            className="mt-6 inline-flex rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-500"
          >
            Voltar para o OnlyDay
          </Link>
        )}
      </section>
    </main>
  )
}
