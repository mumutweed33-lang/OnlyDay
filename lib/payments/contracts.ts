export interface CreatePixPaymentInput {
  amount: number
  description: string
  payerEmail: string
  payerName: string
  payerCpf: string
  externalReference: string
}

export interface PixPaymentData {
  paymentId: string
  provider: 'mercado_pago'
  status: string
  qrCode?: string
  qrCodeBase64?: string
  ticketUrl?: string
}
