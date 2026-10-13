// ============================================================================
// SKANDA ENTERPRISE GRC: BILLING & STRIPE WEBHOOK REST API
// Path: server/billingRoutes.ts
//
// Mounts Stripe Webhook endpoint with HMAC signature validation and
// tenant entitlement status inquiry.
// ============================================================================

import { Router, Request, Response } from 'express';
import { billingEntitlementsService } from './services/BillingEntitlementsService.js';

export const billingRouter = Router();

// POST /api/v1/billing/webhook (Stripe Webhook Ingestion)
billingRouter.post('/webhook', (req: Request, res: Response) => {
  const signatureHeader = req.headers['stripe-signature'] as string;
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  // In production or test with signature, verify HMAC signature
  if (signatureHeader) {
    const isValid = billingEntitlementsService.verifyStripeWebhookSignature(rawBody, signatureHeader);
    if (!isValid) {
      res.status(400).json({ error: 'Invalid Stripe webhook signature' });
      return;
    }
  }

  const event = req.body;
  if (!event || !event.type) {
    res.status(400).json({ error: 'Invalid event payload structure' });
    return;
  }

  const result = billingEntitlementsService.handleStripeWebhookEvent(event);
  res.status(200).json({ received: true, ...result });
});

// GET /api/v1/billing/entitlements
billingRouter.get('/entitlements', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || (req.headers['x-tenant-id'] as string) || 'tenant-acme-corp';
  const billing = billingEntitlementsService.getTenantBilling(tenantId);
  if (!billing) {
    res.status(404).json({ error: `Billing record not found for tenant "${tenantId}"` });
    return;
  }
  res.json({ success: true, data: billing });
});
