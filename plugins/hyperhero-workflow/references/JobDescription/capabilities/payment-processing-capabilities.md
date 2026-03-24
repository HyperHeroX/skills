# Payment Processing Technical Capabilities Reference

> Source: `sample/payment-processing/agents/payment-integration.md`

## Payment Gateway Integration

### Major Providers
- **Stripe**: Checkout, Elements, Billing, Connect
- **PayPal**: Standard, Express, Adaptive Payments
- **Square**: Point of Sale, Online APIs
- **Braintree**: Drop-in UI, Vault, Subscriptions
- **Adyen**: Multi-currency, Global reach
- **Authorize.net**: Traditional merchant processing

### Integration Patterns
- **Server-side SDKs**: Official libraries for all major languages
- **Client-side tokenization**: Secure card collection
- **Embedded checkout**: iframe and redirect flows
- **Mobile SDKs**: iOS, Android native integrations

## Checkout Implementation

### Payment Flows
- **One-time payments**: Single purchase transactions
- **Guest checkout**: No account required
- **Saved payment methods**: Tokenized cards on file
- **Cart abandonment recovery**: Incomplete checkout handling

### Form Design
- **Stripe Elements**: Pre-built, PCI-compliant inputs
- **PayPal Smart Buttons**: Dynamic payment selection
- **Custom forms**: Validation, error messaging
- **Accessibility**: Screen reader support, keyboard navigation

## Subscription & Recurring Billing

### Subscription Management
- **Plans & pricing**: Tiered pricing, metered billing
- **Billing cycles**: Monthly, annual, custom intervals
- **Proration**: Mid-cycle plan changes
- **Trials**: Free trials, trial-to-paid conversion

### Lifecycle Events
- **Renewals**: Automatic billing, reminders
- **Failed payments**: Retry logic, dunning management
- **Upgrades/downgrades**: Plan migration
- **Cancellation**: Graceful handling, win-back flows

## Webhook Handling (Critical)

### Security Requirements
- **Signature verification**: HMAC validation, never skip
- **Raw body preservation**: No JSON middleware before verification
- **Idempotency**: Event ID storage, duplicate prevention
- **Quick response**: Return 2xx within 200ms

### Event Processing
- **Async handling**: Background job queues
- **Server validation**: Always re-fetch from API
- **Error handling**: Graceful failure, retry logic
- **Monitoring**: Webhook delivery tracking, alerts

## PCI Compliance

### Card Data Handling
- **Tokenization**: Never handle raw card numbers
- **Provider iframes**: Stripe Elements, PayPal SDK
- **Server-side validation**: Direct API verification
- **Logging restrictions**: Never log sensitive data

### Environment Separation
- **Test vs Production**: Separate API keys
- **Test card blocking**: Prevent test cards in production
- **Credential management**: Secure storage, rotation

### SAQ Levels
- **SAQ A**: Redirect only, simplest compliance
- **SAQ A-EP**: JavaScript/direct post forms
- **SAQ D**: Full card handling (avoid if possible)

## Error Handling & Edge Cases

### Payment Failures
- **Insufficient funds**: User notification, retry options
- **Expired cards**: Update prompts, saved card management
- **Authentication required**: 3D Secure flows
- **Network errors**: Timeout handling, retry logic

### Disputes & Refunds
- **Chargebacks**: Evidence collection, response workflows
- **Partial refunds**: Amount calculation, accounting
- **Refund policies**: Time limits, eligibility rules

### Fraud Prevention
- **Velocity checks**: Transaction limits
- **Address verification (AVS)**: Mismatch handling
- **CVV verification**: Required for card-not-present
- **3D Secure**: Strong Customer Authentication (SCA)

## Database Schema

### Essential Tables
- **payments**: Transaction records, status tracking
- **customers**: Payment method tokens, billing info
- **subscriptions**: Plan details, billing cycles
- **invoices**: Line items, totals, tax
- **webhooks**: Event logs, processing status

### Idempotency
- **Request keys**: Client-provided idempotency keys
- **Event deduplication**: Provider event ID storage
- **Atomic operations**: Database transactions

## Testing Strategy

### Test Modes
- **Test API keys**: Sandbox environment
- **Test card numbers**: Stripe/PayPal test cards
- **Scenario simulation**: Decline codes, errors

### Edge Case Testing
- **Network failures**: Timeout handling
- **Webhook delays**: Out-of-order events
- **Currency conversion**: Multi-currency flows
- **Tax calculation**: Regional tax rules

## Compliance & Security

### Regulatory
- **PCI DSS**: Data security standards
- **GDPR**: Customer data handling
- **PSD2/SCA**: European payment regulations
- **Local regulations**: Regional payment laws

### Security Practices
- **HTTPS only**: All payment endpoints
- **Encryption**: At rest and in transit
- **Access control**: Role-based payment admin
- **Audit logging**: Transaction history, admin actions
