import { z } from "zod";

export const CreditQuoteRequestSchema = z.object({
  borrowerAgentId: z.string().min(1),
  parentOrderId: z.string().min(1),
  requestedAdvanceUsdc: z.number().positive(),
  expectedSettlementUsdc: z.number().positive(),
  completedOrders: z.number().int().min(0).default(0),
  failedOrders: z.number().int().min(0).default(0),
  currentPaidOrders: z.number().int().min(0).default(0),
});

export type CreditQuoteRequest = z.infer<typeof CreditQuoteRequestSchema>;

export const CreditQuoteSchema = z.object({
  approved: z.boolean(),
  maxAdvanceUsdc: z.number().nonnegative(),
  feeUsdc: z.number().nonnegative(),
  repayUsdc: z.number().nonnegative(),
  riskScore: z.number().min(0).max(100),
  reasons: z.array(z.string()),
});

export type CreditQuote = z.infer<typeof CreditQuoteSchema>;
