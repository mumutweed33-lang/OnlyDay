'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full glass-card rounded-3xl p-8 text-center border border-white/10">
        <h2 className="text-2xl font-black mb-3">Algo deu errado</h2>
        <p className="text-white/60 mb-6">
          O app encontrou um erro inesperado. Vamos tentar recarregar essa parte.
        </p>
        <button
          onClick={reset}
          className="btn-primary px-6 py-3 rounded-2xl text-white font-semibold"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
