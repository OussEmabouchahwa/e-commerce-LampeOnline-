import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

type Target = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      const details = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      res.status(422).json({
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details },
      })
      return
    }
    // Replace the target with parsed (coerced) data
    if (target === 'body') req.body = result.data
    else if (target === 'query') req.query = result.data as Record<string, string>
    next()
  }
}
