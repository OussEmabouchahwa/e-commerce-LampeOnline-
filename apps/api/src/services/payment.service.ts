export interface PaymentResult {
  success: boolean
  reference: string
  message?: string
  requiresVerification?: boolean
}

export interface PaymentProvider {
  createPayment(params: { orderId: string; amountMillimes: number; cardNumber?: string }): Promise<PaymentResult>
}

// Mock card outcomes per SPEC
const MOCK_OUTCOMES: Record<string, 'success' | 'fail' | 'verify'> = {
  '4242424242424242': 'success',
  '4000000000000002': 'fail',
  '4000000000000322': 'verify',
}

export class MockPaymentProvider implements PaymentProvider {
  async createPayment(params: {
    orderId: string
    amountMillimes: number
    cardNumber?: string
  }): Promise<PaymentResult> {
    const normalized = (params.cardNumber ?? '').replace(/\s/g, '')
    const outcome = MOCK_OUTCOMES[normalized] ?? 'success'
    const reference = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    if (outcome === 'fail') {
      return { success: false, reference, message: 'Your card was declined.' }
    }

    if (outcome === 'verify') {
      await new Promise<void>((resolve) => setTimeout(resolve, 3000))
      return { success: true, reference, message: 'Extra verification passed.', requiresVerification: true }
    }

    return { success: true, reference }
  }
}

export class CashOnDeliveryProvider implements PaymentProvider {
  async createPayment(params: { orderId: string; amountMillimes: number }): Promise<PaymentResult> {
    return {
      success: true,
      reference: `COD-${params.orderId.slice(-8).toUpperCase()}`,
      message: 'Payment will be collected on delivery.',
    }
  }
}

export function getPaymentProvider(): PaymentProvider {
  const provider = process.env['PAYMENT_PROVIDER'] ?? 'mock'
  if (provider === 'cash_on_delivery') return new CashOnDeliveryProvider()
  return new MockPaymentProvider()
}
