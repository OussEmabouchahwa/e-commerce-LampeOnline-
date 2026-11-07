import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import { userRepository } from '../repositories/user.repository'
import { Errors } from '../lib/errors'
import type { RegisterInput, LoginInput } from '@lampe/shared'

const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL = '7d'

function signAccess(userId: string, role: string): string {
  const secret = process.env['JWT_SECRET']
  if (!secret) throw new Error('JWT_SECRET not configured')
  return jwt.sign({ userId, role }, secret, { expiresIn: ACCESS_TOKEN_TTL })
}

function signRefresh(userId: string): string {
  const secret = process.env['JWT_REFRESH_SECRET']
  if (!secret) throw new Error('JWT_REFRESH_SECRET not configured')
  return jwt.sign({ userId }, secret, { expiresIn: REFRESH_TOKEN_TTL })
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email)
    if (existing) throw Errors.Conflict('An account with this email already exists.')

    const passwordHash = await argon2.hash(input.password)
    const user = await userRepository.create({ email: input.email, name: input.name, passwordHash })
    return { user, accessToken: signAccess(user.id, user.role), refreshToken: signRefresh(user.id) }
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email)
    if (!user || !user.passwordHash) throw Errors.Unauthorized('Invalid email or password.')
    if (user.status === 'BLOCKED') throw Errors.Blocked()

    const valid = await argon2.verify(user.passwordHash, input.password)
    if (!valid) throw Errors.Unauthorized('Invalid email or password.')

    return { user, accessToken: signAccess(user.id, user.role), refreshToken: signRefresh(user.id) }
  },

  async googleAuth(idToken: string, mock = false) {
    if (mock) {
      if (process.env['NODE_ENV'] === 'production') throw Errors.Forbidden('Mock Google auth is disabled in production.')
      // Create/return a dev mock user
      const mockEmail = 'dev-google@example.com'
      let user = await userRepository.findByEmail(mockEmail)
      if (!user) {
        user = await userRepository.create({
          email: mockEmail,
          name: 'Dev Google User',
          googleId: 'dev-google-id',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev',
        })
      }
      return { user, accessToken: signAccess(user.id, user.role), refreshToken: signRefresh(user.id) }
    }

    const clientId = process.env['GOOGLE_CLIENT_ID']
    if (!clientId) throw Errors.BadRequest('Google sign-in is not configured.')

    const client = new OAuth2Client(clientId)
    const ticket = await client.verifyIdToken({ idToken, audience: clientId }).catch(() => {
      throw Errors.Unauthorized('Invalid Google token.')
    })
    const payload = ticket.getPayload()
    if (!payload?.email) throw Errors.Unauthorized('Invalid Google token payload.')

    let user = await userRepository.findByGoogleId(payload.sub!)
    if (!user) {
      user = await userRepository.findByEmail(payload.email)
      if (user) {
        // Link google to existing account
        user = await userRepository.update(user.id, { googleId: payload.sub } as Parameters<typeof userRepository.update>[1])
      } else {
        user = await userRepository.create({
          email: payload.email,
          name: payload.name ?? 'Google User',
          googleId: payload.sub,
          avatarUrl: payload.picture,
        })
      }
    }
    if (!user) throw Errors.InternalError('Failed to create user')
    if (user.status === 'BLOCKED') throw Errors.Blocked()

    return { user, accessToken: signAccess(user.id, user.role), refreshToken: signRefresh(user.id) }
  },

  async refresh(refreshToken: string) {
    const secret = process.env['JWT_REFRESH_SECRET']
    if (!secret) throw new Error('JWT_REFRESH_SECRET not configured')
    let payload: { userId: string }
    try {
      payload = jwt.verify(refreshToken, secret) as { userId: string }
    } catch {
      throw Errors.Unauthorized('Invalid refresh token.')
    }
    const user = await userRepository.findById(payload.userId)
    if (!user) throw Errors.Unauthorized('User not found.')
    if (user.status === 'BLOCKED') throw Errors.Blocked()

    return { accessToken: signAccess(user.id, user.role), refreshToken: signRefresh(user.id) }
  },
}
