import { CreditQuoteRequestSchema } from "../src/credit/schema.js";
import { quoteCredit } from "../src/credit/quote.js";

const request = CreditQuoteRequestSchema.parse({
  borrowerAgentId: "agent_demo_borrower",
  parentOrderId: "order_parent_001",
  requestedAdvanceUsdc: 1,
  expectedSettlementUsdc: 4,
  completedOrders: 12,
  failedOrders: 1,
  currentPaidOrders: 1,
});

console.log(JSON.stringify({ request, quote: quoteCredit(request) }, null, 2));
