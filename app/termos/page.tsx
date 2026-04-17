import { PublicInfoShell } from '@/components/marketing/PublicInfoShell'

export default function TermosPage() {
  return (
    <PublicInfoShell
      eyebrow="Legal"
      title="Termos de Uso"
      description="Base pública inicial dos termos de uso da OnlyDay para a fase de lançamento. Este texto organiza as regras operacionais da plataforma e pode ser refinado com revisão jurídica antes da abertura comercial ampla."
    >
      <h2>1. Uso da plataforma</h2>
      <p>
        A OnlyDay é uma plataforma de social commerce premium voltada para relacionamento, conteúdo
        exclusivo, experiências pagas, assinaturas e interações entre criadores e fãs.
      </p>
      <p>
        Ao utilizar a plataforma, o usuário declara que possui capacidade civil e idade mínima legal
        para contratação e acesso aos recursos disponibilizados.
      </p>

      <h2>2. Conta e responsabilidade</h2>
      <ul>
        <li>O usuário é responsável pela veracidade dos dados enviados no cadastro.</li>
        <li>A conta é pessoal e intransferível.</li>
        <li>É proibido utilizar identidade falsa ou se passar por terceiros.</li>
      </ul>

      <h2>3. Conteúdo e monetização</h2>
      <ul>
        <li>O criador é responsável pelo conteúdo publicado e pelas ofertas que disponibiliza.</li>
        <li>A plataforma pode remover conteúdo que viole políticas internas, legislação ou segurança.</li>
        <li>Valores, regras de desbloqueio e planos devem ser apresentados de forma clara.</li>
      </ul>

      <h2>4. Condutas proibidas</h2>
      <ul>
        <li>Fraude, spam, uso de bots, compra de engajamento ou manipulação de pagamentos.</li>
        <li>Conteúdo sem consentimento, envolvendo menores ou violando direitos de terceiros.</li>
        <li>Exposição de dados pessoais sensíveis sem base legal ou autorização adequada.</li>
      </ul>

      <h2>5. Suspensão e encerramento</h2>
      <p>
        A OnlyDay pode limitar, suspender ou encerrar contas que violem estes termos, regras de
        segurança, compliance, meios de pagamento ou legislação aplicável.
      </p>

      <h2>6. Atualizações</h2>
      <p>
        Estes termos podem ser atualizados para refletir novas funcionalidades, exigências legais ou
        melhorias operacionais. A versão vigente será sempre publicada nesta página.
      </p>
    </PublicInfoShell>
  )
}
