'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-dark text-white">
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md w-full glass-card rounded-3xl p-8 text-center border border-white/10">
            <h2 className="text-2xl font-black mb-3">Erro critico na aplicacao</h2>
            <p className="text-white/60 mb-2">
              Ocorreu um problema ao carregar a interface principal.
            </p>
            <p className="text-white/40 text-sm mb-6">
              {error.message || 'Erro desconhecido'}
            </p>
            <button
              onClick={reset}
              className="btn-primary px-6 py-3 rounded-2xl text-white font-semibold"
            >
              Recarregar
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
