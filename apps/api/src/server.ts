import 'dotenv/config'
import { app } from './app'
import { logger } from './lib/logger'

const PORT = parseInt(process.env['PORT'] ?? '4000', 10)

app.listen(PORT, () => {
  logger.info(`API running on http://localhost:${PORT}`)
})
