import StripeService from '../stripe.js'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    stripe: StripeService
  }
}
