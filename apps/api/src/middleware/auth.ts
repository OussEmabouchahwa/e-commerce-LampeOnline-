import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

interface JwtPayload {
  userId: string
  role: string
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies['access_token'] as string | undefined
    if (!token) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } })
      return
    }

    const secret = process.env['JWT_SECRET']
    if (!secret) throw new Error('JWT_SECRET not configured')

    const payload = jwt.verify(token, secret) as JwtPayload
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not found' } })
      return
    }
    if (user.status === 'BLOCKED') {
      res
        .status(403)
        .json({ error: { code: 'USER_BLOCKED', message: 'Your account has been suspended.' } })
      return
    }

    req.user = { id: user.id, role: user.role, email: user.email }
    next()
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } })
      return
    }
    next(err)
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } })
      return
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } })
      return
    }
    next()
  }
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string; email: string }
    }
  }
}
