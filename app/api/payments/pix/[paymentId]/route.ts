import { NextResponse } from 'next/server'
import { env } from '@/lib/config/env'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params

  if (!env.mercadoPagoAccessToken) {
    return NextResponse.json(
      { error: 'MERCADO_PAGO_ACCESS_TOKEN nao configurado no servidor.' },
      { status: 501 }
    )
  }

  const mercadoPagoResponse = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${env.mercadoPagoAccessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  )

  const payment = await mercadoPagoResponse.json()

  if (!mercadoPagoResponse.ok) {
    return NextResponse.json(
      {
        error:
          payment?.message || 'Nao foi possivel consultar o status do pagamento PIX.',
        details: payment,
      },
      { status: mercadoPagoResponse.status }
    )
  }

  return NextResponse.json({
    paymentId: String(payment.id),
    status: payment.status,
    statusDetail: payment.status_detail,
  })
}
