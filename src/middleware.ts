/**
 * Middleware to validate and handle incoming Stripe webhook events.
 *
 * This middleware verifies the signature of the webhook request to ensure
 * that it comes from Stripe. If the signature is valid, the event is attached
 * to the context and processed by the appropriate handler in the `StripeService`.
 *
 * @see https://stripe.com/docs/webhooks
 */

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { StripeService } from './stripe.js'
import { Stripe as StripeSDK } from 'stripe'

export default class InitializeStripeWebhookMiddleware {
  constructor(private stripe: StripeService) {}

  async handle(ctx: HttpContext, next: NextFn) {
    const sig = ctx.request.header('stripe-signature')
    const rawBody = ctx.request.raw()

    if (!sig || !rawBody) {
      ctx.logger.warn('Invalid Stripe webhook request')
      return ctx.response.status(400).send('Invalid webhook request')
    }

    try {
      const event = this.stripe.verifyWebhookSignature(Buffer.from(rawBody), sig)
      await this.stripe.handleEvent(event)

      ctx.event = event
    } catch (error) {
      ctx.logger.error(`Webhook signature verification failed: ${error.message}`)
      return ctx.response.status(400).send('Webhook signature is missing')
    }

    await next()
  }
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    event: StripeSDK.Event
  }
}
