import app from '@adonisjs/core/services/app'
import StripeService from '../src/stripe.js'

let stripe: StripeService

/**
 * Returns a singleton instance of the stripe service
 * from the container
 */
await app.booted(async () => {
  stripe = await app.container.make('stripe')
})

export { stripe as default }
