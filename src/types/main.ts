import { Stripe as StripeSDK } from 'stripe'

export interface StripeConfig extends Omit<StripeSDK.StripeConfig, 'apiVersion'> {
  apiKey: string
  webhookSecret?: string
  apiVersion?: StripeSDK.StripeConfig['apiVersion']
  timeout?: StripeSDK.StripeConfig['timeout']
  host?: StripeSDK.StripeConfig['host']
  port?: StripeSDK.StripeConfig['port']
  protocol?: StripeSDK.StripeConfig['protocol']
  maxNetworkRetries?: StripeSDK.StripeConfig['maxNetworkRetries']
  httpClient?: StripeSDK.StripeConfig['httpClient']
  httpAgent?: StripeSDK.StripeConfig['httpAgent']
  telemetry?: StripeSDK.StripeConfig['telemetry']
  appInfo?: StripeSDK.StripeConfig['appInfo']
  stripeAccount?: StripeSDK.StripeConfig['stripeAccount']
}

export type EventHandlerFn = (event: StripeSDK.Event) => void | Promise<void>
export type StripeEventHandler<T extends StripeSDK.Event['type']> = (
  event: StripeSDK.Event & { type: T }
) => void | Promise<void>
