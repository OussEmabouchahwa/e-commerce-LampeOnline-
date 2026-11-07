import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../app'

describe('LampeOnline API', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })

  it('GET /api/products returns paginated products', async () => {
    const res = await request(app).get('/api/products?pageSize=5')
    expect(res.status).toBe(200)
    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
    expect(res.body.total).toBeGreaterThanOrEqual(20)
  })

  it('GET /api/products/:slug returns 404 for unknown slug', async () => {
    const res = await request(app).get('/api/products/produit-inexistant-xyz')
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('POST /api/auth/login rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fake@example.com', password: 'WrongPassword123' })
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('POST /api/auth/login rejects blocked users', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'client3@example.com', password: 'Client@123456' })
    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('USER_BLOCKED')
  })

  it('POST /api/auth/login succeeds for valid client', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'client1@example.com', password: 'Client@123456' })
    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('client1@example.com')
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('GET /api/orders without cookie returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/orders')
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('POST /api/analytics/visit records anonymous visit without error', async () => {
    const res = await request(app)
      .post('/api/analytics/visit')
      .send({ path: '/products' })
    expect(res.status).toBe(204)
  })
})
