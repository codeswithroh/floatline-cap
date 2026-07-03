import type { CreditQuote, CreditQuoteRequest } from "./schema.js";

export function quoteCredit(input: CreditQuoteRequest): CreditQuote {
  const totalOrders = input.completedOrders + input.failedOrders;
  const failureRate = totalOrders === 0 ? 0 : input.failedOrders / totalOrders;
  const repaymentCoverage = input.expectedSettlementUsdc / input.requestedAdvanceUsdc;
  const historyScore = Math.min(40, input.completedOrders * 4);
  const activeOrderScore = Math.min(20, input.currentPaidOrders * 10);
  const coverageScore = Math.min(30, Math.max(0, (repaymentCoverage - 1) * 20));
  const failurePenalty = Math.min(50, failureRate * 100);
  const riskScore = Math.round(Math.max(0, historyScore + activeOrderScore + coverageScore - failurePenalty));

  const maxAdvanceUsdc = round2(Math.min(input.expectedSettlementUsdc * 0.4, 5));
  const approved = riskScore >= 45 && input.requestedAdvanceUsdc <= maxAdvanceUsdc;
  const feeUsdc = approved ? round2(Math.max(0.01, input.requestedAdvanceUsdc * 0.05)) : 0;

  const reasons = [
    `risk_score=${riskScore}`,
    `repayment_coverage=${round2(repaymentCoverage)}x`,
    `completed_orders=${input.completedOrders}`,
    `failed_orders=${input.failedOrders}`,
  ];

  if (!approved && input.requestedAdvanceUsdc > maxAdvanceUsdc) {
    reasons.push("requested_advance_exceeds_limit");
  }

  if (!approved && riskScore < 45) {
    reasons.push("risk_score_below_threshold");
  }

  return {
    approved,
    maxAdvanceUsdc,
    feeUsdc,
    repayUsdc: approved ? round2(input.requestedAdvanceUsdc + feeUsdc) : 0,
    riskScore,
    reasons,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
