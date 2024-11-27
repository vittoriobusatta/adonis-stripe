import ConfigureCommand from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

export async function configure(command: ConfigureCommand) {
  const codemods = await command.createCodemods()

  /**
   * Publish config file
   */
  await codemods.makeUsingStub(stubsRoot, 'config/stripe.stub', {})

  /**
   * Define environment variables
   */
  await codemods.defineEnvVariables({
    STRIPE_API_KEY: '',
    STRIPE_WEBHOOK_SECRET: '',
    STRIPE_API_VERSION: '',
  })

  /**
   * Define environment variables validations
   */
  await codemods.defineEnvValidations({
    variables: {
      STRIPE_API_KEY: 'Env.schema.string()',
      STRIPE_WEBHOOK: 'Env.schema.string.optional()',
      STRIPE_API_VERSION: 'Env.schema.string.optional()',
    },
    leadingComment: 'Variables for @vbusatta/adonis-stripe',
  })

  /**
   * Register named middleware
   */
  await codemods.registerMiddleware('named', [
    {
      name: 'verifyStripeWebhook',
      path: '@vbusatta/adonis-stripe/middleware',
      position: 'after',
    },
  ])

  /**
   * Register provider
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('@vbusatta/adonis-stripe/provider')
  })
}
