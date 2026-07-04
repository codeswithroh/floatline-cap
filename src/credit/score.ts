import type { CreditScore, CreditScoreRequest } from "./schema.js";

export interface PublicAgentCreditMetrics {
  agentId: string;
  walletAddress?: string;
  completedOrders: number;
  totalVolumeUsdc: number;
  completionRate: number;
  onlineStatus: "online" | "offline";
}

export function scoreCredit(input: CreditScoreRequest, publicMetrics?: PublicAgentCreditMetrics): CreditScore {
  const metrics = publicMetrics ?? {
    agentId: input.agentId ?? undefined,
    walletAddress: input.walletAddress ?? undefined,
    completedOrders: input.completedOrders ?? 0,
    totalVolumeUsdc: input.totalVolumeUsdc ?? 0,
    completionRate: input.completionRate ?? inferCompletionRate(input),
    onlineStatus: input.onlineStatus ?? "offline",
  };

  const completedOrders = metrics.completedOrders;
  const completionRate = metrics.completionRate;
  const totalVolumeUsdc = metrics.totalVolumeUsdc;
  const currentPaidOrders = input.currentPaidOrders ?? 0;

  const liveScore = metrics.onlineStatus === "online" ? 20 : 0;
  const completionScore = Math.round(Math.max(0, Math.min(35, completionRate * 0.35)));
  const historyScore = Math.round(Math.min(25, Math.log10(completedOrders + 1) * 8));
  const volumeScore = Math.round(Math.min(15, Math.log10(totalVolumeUsdc + 1) * 4));
  const paidOrderScore = Math.min(5, currentPaidOrders * 2);
  const score = clampScore(liveScore + completionScore + historyScore + volumeScore + paidOrderScore);

  const warnings: string[] = [];
  if (metrics.onlineStatus !== "online") warnings.push("agent_offline");
  if (completedOrders < 5) warnings.push("limited_order_history");
  if (completionRate < 90) warnings.push("completion_rate_below_90");
  if (totalVolumeUsdc === 0) warnings.push("no_recorded_volume");

  const signals = [
    `online_status=${metrics.onlineStatus}`,
    `completion_rate=${round2(completionRate)}%`,
    `completed_orders=${completedOrders}`,
    `total_volume_usdc=${round2(totalVolumeUsdc)}`,
    `current_paid_orders=${currentPaidOrders}`,
  ];

  return {
    agentId: metrics.agentId,
    walletAddress: metrics.walletAddress,
    score,
    grade: gradeForScore(score),
    maxRecommendedExposureUsdc: maxExposure(score, completedOrders, totalVolumeUsdc),
    decision: decisionForScore(score, warnings),
    signals,
    warnings,
    source: publicMetrics ? "croo_public_agent" : "caller_supplied_metrics",
  };
}

function inferCompletionRate(input: CreditScoreRequest): number {
  const completedOrders = input.completedOrders ?? 0;
  const failedOrders = input.failedOrders ?? 0;
  const totalOrders = completedOrders + failedOrders;

  if (totalOrders === 0) return 0;
  return (completedOrders / totalOrders) * 100;
}

function decisionForScore(score: number, warnings: string[]): CreditScore["decision"] {
  if (score >= 65 && !warnings.includes("agent_offline")) return "eligible";
  if (score >= 40) return "watch";
  return "decline";
}

function gradeForScore(score: number): CreditScore["grade"] {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "E";
}

function maxExposure(score: number, completedOrders: number, totalVolumeUsdc: number): number {
  if (score < 40) return 0;

  const historyCap = Math.min(10, completedOrders * 0.25);
  const volumeCap = totalVolumeUsdc > 0 ? Math.min(25, totalVolumeUsdc * 0.02) : 0;
  const scoreCap = score >= 85 ? 25 : score >= 70 ? 10 : score >= 55 ? 3 : 1;

  return round2(Math.max(0.5, Math.min(historyCap + volumeCap, scoreCap)));
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
