import { PublicInfoShell } from '@/components/marketing/PublicInfoShell'

export default function PrivacidadePage() {
  return (
    <PublicInfoShell
      eyebrow="LGPD"
      title="Política de Privacidade"
      description="Visão pública inicial sobre como a OnlyDay trata dados pessoais, autenticação, segurança da conta e sinais operacionais da plataforma. Antes da abertura comercial ampla, este texto deve passar por validação jurídica específica."
    >
      <h2>1. Dados coletados</h2>
      <ul>
        <li>Dados de cadastro, como nome, e-mail, username e perfil.</li>
        <li>Dados de uso, como interações, navegação, sinais de descoberta e segurança.</li>
        <li>Dados de verificação de conta, quando exigidos para ativação de recursos avançados.</li>
      </ul>

      <h2>2. Finalidades</h2>
      <ul>
        <li>Autenticar usuários e proteger contas.</li>
        <li>Permitir pagamentos, desbloqueios, assinatura e relacionamento entre criadores e fãs.</li>
        <li>Melhorar ranking, descoberta, prevenção a fraude e experiência do produto.</li>
      </ul>

      <h2>3. Base legal e retenção</h2>
      <p>
        A OnlyDay trata dados conforme bases legais aplicáveis, como execução contratual, prevenção
        a fraude, segurança, obrigação legal e consentimento quando necessário.
      </p>
      <p>
        Os dados são retidos pelo período necessário para operação da conta, atendimento legal,
        defesa de direitos e segurança da plataforma.
      </p>

      <h2>4. Compartilhamento</h2>
      <p>
        Dados podem ser compartilhados com provedores de infraestrutura, autenticação, pagamentos e
        segurança, sempre limitados ao necessário para a execução do serviço.
      </p>

      <h2>5. Direitos do titular</h2>
      <ul>
        <li>Confirmação de tratamento e acesso aos dados.</li>
        <li>Correção, atualização e, quando cabível, exclusão.</li>
        <li>Informações sobre compartilhamento e revisão de consentimento.</li>
      </ul>

      <h2>6. Segurança</h2>
      <p>
        A plataforma adota medidas técnicas e organizacionais para proteger dados, prevenir fraude,
        reforçar autenticação e reduzir acesso indevido.
      </p>
    </PublicInfoShell>
  )
}
