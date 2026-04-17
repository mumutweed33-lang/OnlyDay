import { PublicInfoShell } from '@/components/marketing/PublicInfoShell'

export default function FAQPage() {
  return (
    <PublicInfoShell
      eyebrow="Ajuda"
      title="Perguntas Frequentes"
      description="Guia público inicial com as perguntas mais importantes para quem está conhecendo a OnlyDay."
    >
      <h2>Quem pode usar a OnlyDay?</h2>
      <p>
        Usuários e criadores que atendam à idade mínima e às regras de cadastro, segurança e
        conformidade da plataforma.
      </p>

      <h2>Preciso de outra conta para virar criador?</h2>
      <p>
        Não. A mesma conta pode evoluir para modo criador. Quando os recursos de criador forem
        desativados, a conta continua existindo como conta de comunidade.
      </p>

      <h2>Como funcionam os momentos?</h2>
      <p>
        Os primeiros momentos liberados de um criador podem ser gratuitos, e os seguintes podem ser
        desbloqueados por um período definido pela experiência premium daquele criador.
      </p>

      <h2>Como funcionam os conteúdos premium?</h2>
      <p>
        Conteúdos premium podem ser vendidos individualmente, por recorrência ou por mecanismos como
        Vault, chat ou ofertas especiais.
      </p>

      <h2>Como recuperar minha senha?</h2>
      <p>
        Na tela de login, use a opção de recuperação informando seu e-mail para receber o link de
        redefinição quando esse fluxo estiver configurado no ambiente de autenticação.
      </p>
    </PublicInfoShell>
  )
}
