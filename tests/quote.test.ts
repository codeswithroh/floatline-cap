import { describe, expect, it } from "vitest";
import { quoteCredit } from "../src/credit/quote.js";

describe("quoteCredit", () => {
  it("approves a small advance against sufficient settlement and history", () => {
    const quote = quoteCredit({
      borrowerAgentId: "agent_a",
      parentOrderId: "order_1",
      requestedAdvanceUsdc: 1,
      expectedSettlementUsdc: 4,
      completedOrders: 12,
      failedOrders: 1,
      currentPaidOrders: 1,
    });

    expect(quote.approved).toBe(true);
    expect(quote.repayUsdc).toBe(1.05);
  });

  it("denies advances above the capped limit", () => {
    const quote = quoteCredit({
      borrowerAgentId: "agent_a",
      parentOrderId: "order_1",
      requestedAdvanceUsdc: 4,
      expectedSettlementUsdc: 4,
      completedOrders: 12,
      failedOrders: 1,
      currentPaidOrders: 1,
    });

    expect(quote.approved).toBe(false);
    expect(quote.reasons).toContain("requested_advance_exceeds_limit");
  });
});
