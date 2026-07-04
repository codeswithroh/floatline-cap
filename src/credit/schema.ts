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

export const CreditScoreRequestSchema = z.object({
  agentId: z.string().min(1).optional(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  completedOrders: z.number().int().min(0).optional(),
  failedOrders: z.number().int().min(0).optional(),
  totalVolumeUsdc: z.number().nonnegative().optional(),
  completionRate: z.number().min(0).max(100).optional(),
  onlineStatus: z.enum(["online", "offline"]).optional(),
  currentPaidOrders: z.number().int().min(0).optional(),
}).refine((value) => value.agentId || value.walletAddress || value.completedOrders !== undefined, {
  message: "Provide agentId, walletAddress, or completedOrders",
});

export type CreditScoreRequest = z.infer<typeof CreditScoreRequestSchema>;

export const CreditScoreSchema = z.object({
  agentId: z.string().optional(),
  walletAddress: z.string().optional(),
  score: z.number().min(0).max(100),
  grade: z.enum(["A", "B", "C", "D", "E"]),
  maxRecommendedExposureUsdc: z.number().nonnegative(),
  decision: z.enum(["eligible", "watch", "decline"]),
  signals: z.array(z.string()),
  warnings: z.array(z.string()),
  source: z.enum(["croo_public_agent", "caller_supplied_metrics"]),
});

export type CreditScore = z.infer<typeof CreditScoreSchema>;
