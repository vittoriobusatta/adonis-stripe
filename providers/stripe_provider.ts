import type { ApplicationService } from '@adonisjs/core/types'
import type { StripeConfig } from '../src/types/main.js'

import { StripeService } from '../src/stripe.js'

export default class StripeProvider {
  #stripe: StripeService | null = null

  constructor(protected app: ApplicationService) {}

  async boot() {
    const config = this.app.config.get<StripeConfig>('stripe')
    const logger = await this.app.container.make('logger')

    this.app.container.bind(StripeService, async () => {
      this.#stripe = new StripeService(logger, config)
      return this.#stripe
    })
  }
}
