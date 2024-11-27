import type { StripeConfig } from './types/main.js'
import { InvalidArgumentsException } from '@poppinss/utils'

export function defineConfig<T extends StripeConfig>(config: T): T {
  if (!config.apiKey) {
    throw new InvalidArgumentsException('Missing STRIPE_API_KEY in environment variables')
  }
  if (!config.webhookSecret) {
    throw new InvalidArgumentsException('Missing STRIPE_WEBHOOK_SECRET in environment variables')
  }
  return config
}
