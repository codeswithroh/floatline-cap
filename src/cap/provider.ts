import "dotenv/config";
import { AgentClient, DeliverableType, EventType } from "@croo-network/sdk";
import { CreditQuoteRequestSchema } from "../credit/schema.js";
import { quoteCredit } from "../credit/quote.js";

const apiUrl = process.env.CROO_API_URL ?? "https://api.croo.network";
const wsUrl = process.env.CROO_WS_URL ?? "wss://api.croo.network/ws";
const sdkKey = process.env.CROO_SDK_KEY ?? process.env.CROO_API_KEY;
const fundAddress = process.env.FLOATLINE_FUND_ADDRESS;

if (!sdkKey) {
  throw new Error("CROO_SDK_KEY is required");
}

const client = new AgentClient({ baseURL: apiUrl, wsURL: wsUrl }, sdkKey);
const stream = await client.connectWebSocket();

stream.on(EventType.NegotiationCreated, async (event) => {
  if (!event.negotiation_id) return;

  const negotiation = await client.getNegotiation(event.negotiation_id);

  if (negotiation.fundAmount && negotiation.fundToken) {
    if (!fundAddress) {
      await client.rejectNegotiation(event.negotiation_id, "FLOATLINE_FUND_ADDRESS is required for fund-transfer services");
      return;
    }

    await client.acceptNegotiationWithFundAddress(event.negotiation_id, fundAddress);
    return;
  }

  await client.acceptNegotiation(event.negotiation_id);
});

stream.on(EventType.OrderPaid, async (event) => {
  if (!event.order_id) return;

  const order = await client.getOrder(event.order_id);
  const requirements = readRequirements(order);
  const request = CreditQuoteRequestSchema.parse(JSON.parse(requirements));
  const quote = quoteCredit(request);

  await client.deliverOrder(event.order_id, {
    deliverableType: DeliverableType.Text,
    deliverableText: JSON.stringify(quote),
  });
});

process.on("SIGINT", () => {
  stream.close();
  process.exit(0);
});

function readRequirements(order: unknown): string {
  const candidate = order as { requirements?: unknown; order?: { requirements?: unknown } };
  const requirements = candidate.requirements ?? candidate.order?.requirements;

  if (typeof requirements !== "string") {
    throw new Error("Order requirements must be a JSON string");
  }

  return requirements;
}
