import { describe, expect, it } from "vitest";
import { scoreCredit } from "../src/credit/score.js";

describe("scoreCredit", () => {
  it("scores a live high-history CROO agent as eligible", () => {
    const score = scoreCredit(
      { agentId: "agent_top", currentPaidOrders: 2 },
      {
        agentId: "agent_top",
        walletAddress: "0x83e3821f79Ef3e2F9462FF43Bd71887c42Ef44f1",
        completedOrders: 100,
        totalVolumeUsdc: 10,
        completionRate: 99,
        onlineStatus: "online",
      },
    );

    expect(score.decision).toBe("eligible");
    expect(score.grade).not.toBe("E");
    expect(score.source).toBe("croo_public_agent");
    expect(score.warnings).not.toContain("agent_offline");
  });

  it("warns when caller-supplied metrics have thin history", () => {
    const score = scoreCredit({
      completedOrders: 1,
      failedOrders: 1,
      totalVolumeUsdc: 0,
      onlineStatus: "offline",
    });

    expect(score.decision).toBe("decline");
    expect(score.warnings).toContain("agent_offline");
    expect(score.warnings).toContain("limited_order_history");
    expect(score.source).toBe("caller_supplied_metrics");
  });
});
