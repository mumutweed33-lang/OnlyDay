import { PublicInfoShell } from '@/components/marketing/PublicInfoShell'

export default function PrecosPage() {
  return (
    <PublicInfoShell
      eyebrow="Planos"
      title="Preços e Estrutura Inicial"
      description="Página pública inicial para organizar como a OnlyDay apresenta planos, monetização e camadas premium. Os valores reais podem ser atualizados conforme a operação comercial avançar."
    >
      <h2>Comunidade</h2>
      <p>
        Entrada para fãs e usuários que desejam explorar criadores, consumir conteúdos públicos e
        descobrir experiências premium.
      </p>

      <h2>Criador Free</h2>
      <p>
        Conta com perfil público, presença no ecossistema e acesso ao dashboard inicial para começar
        a estruturar operação e audiência.
      </p>

      <h2>Criador Premium</h2>
      <p>
        Camada voltada para creators que desejam aprofundar monetização com recursos expandidos,
        ofertas premium, experiências especiais e gestão operacional mais forte.
      </p>

      <h2>Monetização</h2>
      <ul>
        <li>Assinaturas</li>
        <li>Conteúdo desbloqueável no Vault</li>
        <li>Momentos premium</li>
        <li>Chat VIP pago</li>
        <li>Leilões e experiências especiais</li>
      </ul>
    </PublicInfoShell>
  )
}
