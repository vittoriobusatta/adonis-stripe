[![npm version](https://badge.fury.io/js/@vbusatta%2Fadonis-stripe.svg)](https://www.npmjs.com/package/@vbusatta/adonis-stripe)
[![npm downloads](https://img.shields.io/npm/dm/@vbusatta/adonis-stripe.svg)](https://www.npmjs.com/package/@vbusatta/adonis-stripe)
[![License](https://img.shields.io/github/license/vittoriobusatta/adonis-stripe.svg)](https://github.com/vittoriobusatta/adonis-stripe/blob/main/LICENSE)

# AdonisJS 6 Stripe Integration

Seamlessly integrate the Stripe SDK with AdonisJS 6 for secure and efficient payment handling.

## Features

- Easy setup and integration of the Stripe SDK in AdonisJS.
- Middleware for secure webhook signature validation.
- Centralized event handling with custom handlers.
- Direct access to the Stripe SDK via the `api` property.

---

## Getting Started

Install the package:

```bash
node ace add @vbusatta/adonis-stripe
```

Then, configure the package by running:

```bash
node ace configure @vbusatta/adonis-stripe
```

## Configuration

A `config/stripe.ts` file will be generated. Add your Stripe credentials to the `.env` file. Specify an API version if needed, or leave it empty to use the latest.

### Example .env configuration:

```ts
STRIPE_API_KEY = ''
STRIPE_WEBHOOK_SECRET = ''
STRIPE_API_VERSION = ''
```

## Usage

### Stripe Service

The `stripe` service simplifies working with Stripe by exposing a direct `api` property, offering full access to the Stripe SDK:

```ts
// /services/payment_service.ts

import stripe from '@vbusatta/adonis-stripe/services/main'

export default class PaymentService {
  async createPaymentIntent() {
    return await stripe.api.paymentIntents.create({
      amount: 1000,
      currency: 'usd',
    })
  }
}
```

### Middleware

The middleware automatically validates Stripe webhook requests by checking the signature, ensuring secure communication.

After configuration, a named middleware is created:

```ts
// /start/kernel.ts

export const middleware = router.named({
  verifyStripeWebhook: () => import('@vbusatta/adonis-stripe/middleware'),
})
```

Add this middleware to your webhook route to validate events:

```ts
// /start/routes.ts

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
const PaymentsController = () => import('#controllers/payments/payments_controller')

router
  .post('stripe/webhook', [PaymentsController, 'handleWebhook'])
  .use(middleware.verifyStripeWebhook())
```

### Event Handling

Stripe emits events for various actions (e.g., successful payments, failed charges). You can register custom handlers to process these events using the `onEvent` method:

```ts
// /services/payment_service.ts

import { Stripe } from 'stripe'
import stripe from '@vbusatta/adonis-stripe/services/main'

export default class PaymentService {
  constructor() {
    stripe.onEvent('charge.succeeded', this.chargeSucceeded.bind(this))
  }

  private async chargeSucceeded(event: Stripe.Event) {
    const charge = event.data.object as Stripe.Charge
    console.log(`Charge ${charge.id} was successful`)
  }
}
```

### Webhook

Webhook requests are validated by the middleware, and the business logic is handled directly by the `stripe` service. Your webhook controller only needs to acknowledge the request:

```ts
// /controllers/payments_controller.ts

import type { HttpContext } from '@adonisjs/core/http'

export default class PaymentsController {
  async handleWebhook({ response }: HttpContext) {
    return response.ok({ received: true })
  }
}
```
