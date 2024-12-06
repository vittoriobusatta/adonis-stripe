import type { ApplicationService } from '@adonisjs/core/types'
import type { StripeConfig } from '../src/types/main.js'
import StripeService from '../src/stripe.js'

export default class StripeProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('stripe', async () => {
      const config = this.app.config.get<StripeConfig>('stripe')
      const logger = await this.app.container.make('logger')

      return new StripeService(logger, config)
    })
  }
}
