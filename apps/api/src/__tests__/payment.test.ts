import { describe, it, expect } from 'vitest'
import { MockPaymentProvider, CashOnDeliveryProvider } from '../services/payment.service'

describe('Payment Providers', () => {
  it('MockPaymentProvider: succeeds with 4242... card', async () => {
    const provider = new MockPaymentProvider()
    const result = await provider.createPayment({
      orderId: 'test-order-1',
      amountMillimes: 189000,
      cardNumber: '4242 4242 4242 4242',
    })
    expect(result.success).toBe(true)
    expect(result.reference).toMatch(/^MOCK-/)
  })

  it('MockPaymentProvider: declines with 4000...02 card', async () => {
    const provider = new MockPaymentProvider()
    const result = await provider.createPayment({
      orderId: 'test-order-2',
      amountMillimes: 95000,
      cardNumber: '4000 0000 0000 0002',
    })
    expect(result.success).toBe(false)
    expect(result.message).toContain('declined')
  })

  it('CashOnDeliveryProvider: succeeds for any order', async () => {
    const provider = new CashOnDeliveryProvider()
    const result = await provider.createPayment({
      orderId: 'order-12345678',
      amountMillimes: 50000,
    })
    expect(result.success).toBe(true)
    expect(result.reference).toContain('COD-')
  })
})
