import { PublicInfoShell } from '@/components/marketing/PublicInfoShell'

export default function ContatoPage() {
  return (
    <PublicInfoShell
      eyebrow="Suporte"
      title="Contato"
      description="Canal público inicial para orientar criadores e usuários enquanto a central completa de atendimento evolui."
    >
      <h2>Atendimento</h2>
      <p>
        Use esta página como referência pública inicial para suporte, dúvidas sobre cadastro,
        autenticação, verificação de conta e operação premium.
      </p>

      <h2>Assuntos prioritários</h2>
      <ul>
        <li>Acesso à conta</li>
        <li>Recuperação de senha</li>
        <li>Verificação de criador</li>
        <li>Pagamentos e desbloqueios</li>
        <li>Segurança e denúncias</li>
      </ul>

      <h2>Observação operacional</h2>
      <p>
        Na fase atual do produto, o canal de suporte público ainda está sendo consolidado. Para a
        publicação ampla, vale conectar esta página a um e-mail oficial, formulário ou help desk.
      </p>
    </PublicInfoShell>
  )
}
