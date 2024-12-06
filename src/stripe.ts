/**
 * Stripe Service for AdonisJS 6.
 *
 * This module provides a service for interacting with the Stripe API and handling
 * incoming webhook events. The service is designed to be used as a singleton and
 * can be registered with the AdonisJS IoC container.
 *
 * @see https://stripe.com/docs/api
 * @see https://stripe.com/docs/webhooks
 */

import type { LoggerService } from '@adonisjs/core/types'

import { Stripe as StripeSDK } from 'stripe'
import { EventHandlerFn, StripeConfig } from './types/main.js'

export default class StripeService {
  #stripe: StripeSDK
  #logger: LoggerService
  #webhookSecret: string | null
  #defaultApiVersion: StripeSDK.LatestApiVersion = '2024-11-20.acacia'
  #eventHandlers: Record<string, EventHandlerFn> = {}

  constructor(logger: LoggerService, config: StripeConfig) {
    this.#logger = logger
    this.#stripe = new StripeSDK(config.apiKey, {
      apiVersion: config.apiVersion || this.#defaultApiVersion,
    })
    this.#webhookSecret = config.webhookSecret || null
  }

  /**
   * Provides direct access to the Stripe SDK instance.
   */
  get api() {
    return this.#stripe
  }

  /**
   * Processes an incoming webhook request by verifying the signature and handling the event.
   */
  async processWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const event = this.verifyWebhookSignature(rawBody, signature)
    await this.handleEvent(event)
  }

  /**
   * Verifies the signature of a Stripe webhook request and extracts the event.
   */
  private verifyWebhookSignature(rawBody: Buffer, signature: string) {
    if (!this.#webhookSecret) {
      this.#logger.error('Stripe webhook secret is missing')
      throw new Error('Webhook secret not configured')
    }
    try {
      this.#logger.debug('Verifying Stripe webhook signature')
      return this.#stripe.webhooks.constructEvent(rawBody, signature, this.#webhookSecret)
    } catch (error) {
      this.#logger.error('Invalid Stripe webhook signature', error)
      throw new Error('Invalid webhook signature')
    }
  }

  /**
   * Processes a Stripe event by invoking the registered handler.
   */
  private async handleEvent(event: StripeSDK.Event) {
    this.#logger.debug(`Handling event type: ${event.type}`)
    const handler = this.#eventHandlers[event.type]
    if (handler) {
      try {
        await handler(event)
      } catch (error) {
        this.#logger.error(`Error while handling event ${event.type}:`, error)
      }
    } else {
      this.#logger.warn(`No handler found for event type: ${event.type}`)
    }
  }

  /**
   * Registers a handler for a specific Stripe event type.
   */
  onEvent(eventType: StripeSDK.Event['type'], handler: EventHandlerFn) {
    this.#logger.debug(`Registering handler for event type: ${eventType}`)
    this.#eventHandlers[eventType] = handler
  }
}
