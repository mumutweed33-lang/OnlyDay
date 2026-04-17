import { NextResponse } from 'next/server'
import { env } from '@/lib/config/env'
import type { CreatePixPaymentInput } from '@/lib/payments/contracts'

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export async function POST(request: Request) {
  if (env.paymentsProvider !== 'mercado_pago') {
    return NextResponse.json(
      {
        error:
          'O provider de pagamentos real ainda nao foi ativado. Configure NEXT_PUBLIC_PAYMENTS_PROVIDER=mercado_pago.',
      },
      { status: 501 }
    )
  }

  if (!env.mercadoPagoAccessToken) {
    return NextResponse.json(
      {
        error:
          'Falta MERCADO_PAGO_ACCESS_TOKEN no servidor. Sem isso nao da para gerar PIX real.',
      },
      { status: 501 }
    )
  }

  const body = (await request.json()) as Partial<CreatePixPaymentInput>

  if (!body.amount || body.amount <= 0) return badRequest('Valor invalido para o PIX.')
  if (!body.payerEmail) return badRequest('E-mail do pagador obrigatorio.')
  if (!body.payerName) return badRequest('Nome do pagador obrigatorio.')
  if (!body.payerCpf) return badRequest('CPF do pagador obrigatorio.')
  if (!body.description) return badRequest('Descricao obrigatoria.')

  const [firstName, ...restName] = body.payerName.trim().split(' ')

  const mercadoPagoResponse = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.mercadoPagoAccessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify({
      transaction_amount: Number(body.amount),
      description: body.description,
      payment_method_id: 'pix',
      notification_url: env.mercadoPagoWebhookUrl,
      external_reference: body.externalReference,
      payer: {
        email: body.payerEmail,
        first_name: firstName,
        last_name: restName.join(' ') || firstName,
        identification: {
          type: 'CPF',
          number: body.payerCpf.replace(/\D/g, ''),
        },
      },
    }),
  })

  const payment = await mercadoPagoResponse.json()

  if (!mercadoPagoResponse.ok) {
    return NextResponse.json(
      {
        error:
          payment?.message ||
          'Nao foi possivel criar o PIX no Mercado Pago com as credenciais atuais.',
        details: payment,
      },
      { status: mercadoPagoResponse.status }
    )
  }

  return NextResponse.json({
    paymentId: String(payment.id),
    provider: 'mercado_pago',
    status: payment.status,
    qrCode: payment?.point_of_interaction?.transaction_data?.qr_code,
    qrCodeBase64: payment?.point_of_interaction?.transaction_data?.qr_code_base64,
    ticketUrl: payment?.point_of_interaction?.transaction_data?.ticket_url,
  })
}
