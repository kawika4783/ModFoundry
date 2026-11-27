# Billing and payment providers

Use an entitlement policy service with plan versions, grants, quantities, effective intervals and priority. Resolve against workspace scope. Postgres transactions reserve usage before accepting projects, builds or storage uploads. Settlement, refunds and expiry are idempotent ledger entries. Define byte units and UTC billing windows at plan publication. Plan versions preserve prior terms unless customers are explicitly migrated. Seed configurable Free, Starter, Pro and Studio values from the brief. Cover trials, annual/monthly prices, upgrades/downgrades, grace periods, lifetime and manual grants, promos, credits, storage add-ons and enterprise arrangements.

Adapter contract: capabilities, createCustomer, createCheckout, getSubscription, changePlan, cancel, refund, listInvoices, openPortal, verifyWebhook and reconcile. Inputs carry tenant, provider account, environment, currency, immutable catalog mapping and idempotency key. Capability guard unsupported operations on server and UI.

| Provider | Sequence | Treatment |
|---|---|---|
| Stripe | Foundation | Checkout, Billing and portal; live readiness follows test acceptance. Tax, wallet and payment methods depend on account capability. |
| Manual | First alternative | Audited operator confirmation and internal entitlement grants. |
| PayPal, Square | Commercial expansion | Confirm recurring/one-time capabilities and supported markets before enabling each. |
| Paddle, Lemon Squeezy | Commercial expansion | Model merchant-of-record checkout, receipts, tax and refund differences explicitly. |

Webhook flow: verify raw body signature and freshness for expected account/mode; insert event once with provider/account/environment/event ID key; queue durable normalization; retrieve authoritative provider state when necessary; lock local subscription while applying normalized facts; reconcile scheduled divergences. Browser return is read-only. Checkout completion with pending funds must wait for qualifying payment or a valid trial state. Log sanitized processing and allow replay from verified inbox. Disable new checkout separately from processing renewals, cancellation, refunds and incoming webhooks.

Admin manages order/default, environments, encrypted credentials, connectivity, currencies, supported methods, plan mapping, refunds, reconciliation and pause state. Never collect card data. Public checkout exposes only configured, tested provider capabilities.

[Stripe Checkout payment lifecycle](https://docs.stripe.com/payments/existing-customers?platform=web&ui=stripe-hosted)
