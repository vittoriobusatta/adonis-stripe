[![npm version](https://badge.fury.io/js/@vbusatta%2Fadonis-stripe.svg)](https://www.npmjs.com/package/@vbusatta/adonis-stripe)

# AdonisJS 6 Stripe Integration

Seamlessly integrate the Stripe SDK with AdonisJS 6 for secure and efficient payment handling.

## Features

- Plug-and-play configuration of the Stripe SDK in AdonisJS.
- Middleware for secure webhook signature validation.
- Fully customizable to fit your Stripe integration needs.

---

## Getting Started

Install the package:

```bash
node ace add @vbusatta/adonis-stripe
```

Then, configure the package by running:

```bash
node ace configure @vbusatta/adonisjs-stripe
```

## Configuration

A configuration file `config/stripe.ts` will be created automatically. Make sure to include your Stripe credentials in `.env` file, as the latest API version is already set by default.

### Example .env configuration:

```ts
STRIPE_API_KEY = ''
STRIPE_WEBHOOK_SECRET = ''
STRIPE_API_VERSION = ''
```

## Usage

### Middleware

After configuration, a named middleware is automatically created:

```ts
/start/kernel.ts

export const middleware = router.named({
  verifyStripeWebhook: () => import('@vbusatta/adonis-stripe/middleware'),
})
```

In your webhook route, add the middleware to filter events and validate the signature:

```ts
/start/routes.ts

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
const PaymentsController = () => import('#controllers/payments/payments_controller')

router
  .post('stripe/webhook', [PaymentsController, 'handleWebhook'])
  .use(middleware.verifyStripeWebhook())
```

### Stripe Service

The package registers a StripeService in the IoC Container, giving you direct access to the Stripe SDK via the `api` property.

```ts
import { StripeService } from '@vbusatta/adonisjs-stripe'
import { inject } from '@adonisjs/core'

@inject()
class PaymentService {
  constructor(private stripe: StripeService) {}

  async createPaymentIntent() {
    return await this.stripe.api.paymentIntents.create({
      amount: 1000,
      currency: 'usd',
    })
  }
}
```

### Event Handling

You can manage events using the handleEvent method, which filters and processes events, or the onEvent method, which links handlers to specific events.

```ts
import { StripeService } from '@vbusatta/adonisjs-stripe'
import { inject } from '@adonisjs/core'

@inject()
class PaymentService {
  constructor(private stripe: StripeService) {
    this.stripe.onEvent('charge.succeeded', this.chargeSucceeded)
  }

  async chargeSucceeded(event: Stripe.Event) {
    const charge = event.data.object as Stripe.Charge
    console.log(`Charge succeeded for ${charge.amount / 100} ${charge.currency}`)
  }
}
```

### Extracting the Event from the Context

The middleware automatically parses and validates the event, making it available in the HTTP context:

```ts
import type { HttpContext } from '@adonisjs/core/http'

export default class PaymentsController {
  async handleWebhook({ event }: HttpContext) {
    console.log(event)
    // event: charge.succeeded
  }
}
```
