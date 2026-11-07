import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/auth.service'
import { userRepository } from '../repositories/user.repository'
import { Errors } from '../lib/errors'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

function setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('access_token', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
  res.cookie('refresh_token', refreshToken, COOKIE_OPTS)
}

function formatUser(user: { id: string; email: string; name: string; avatarUrl: string | null; phone: string | null; role: string; status: string; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  }
}

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body)
      setTokenCookies(res, accessToken, refreshToken)
      res.status(201).json({ user: formatUser(user) })
    } catch (err) { next(err) }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.login(req.body)
      setTokenCookies(res, accessToken, refreshToken)
      res.json({ user: formatUser(user) })
    } catch (err) { next(err) }
  },

  async google(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken, mock } = req.body as { idToken: string; mock?: boolean }
      const { user, accessToken, refreshToken } = await authService.googleAuth(idToken, mock)
      setTokenCookies(res, accessToken, refreshToken)
      res.json({ user: formatUser(user) })
    } catch (err) { next(err) }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies['refresh_token'] as string | undefined
      if (!refreshToken) throw Errors.Unauthorized('No refresh token')
      const { accessToken, refreshToken: newRefresh } = await authService.refresh(refreshToken)
      setTokenCookies(res, accessToken, newRefresh)
      res.json({ ok: true })
    } catch (err) { next(err) }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    res.json({ ok: true })
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw Errors.Unauthorized()
      const user = await userRepository.findById(req.user.id)
      if (!user) throw Errors.NotFound('User')
      res.json({ user: formatUser(user) })
    } catch (err) { next(err) }
  },
}
