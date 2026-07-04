import "dotenv/config";
import { AgentClient, DeliverableType, EventType } from "@croo-network/sdk";
import type { Order } from "@croo-network/sdk";
import { CreditQuoteRequestSchema, CreditScoreRequestSchema } from "../credit/schema.js";
import { quoteCredit } from "../credit/quote.js";
import { scoreCredit } from "../credit/score.js";
import type { PublicAgentCreditMetrics } from "../credit/score.js";
import { parseJsonRequirements } from "./requirements.js";

const apiUrl = process.env.CROO_API_URL ?? "https://api.croo.network";
const wsUrl = process.env.CROO_WS_URL ?? "wss://api.croo.network/ws";
const sdkKey = process.env.CROO_SDK_KEY ?? process.env.CROO_API_KEY;
const fundAddress = process.env.FLOATLINE_FUND_ADDRESS;
const scoreServiceId = process.env.CROO_FLOATLINE_SCORE_SERVICE_ID;
const quoteServiceId = process.env.CROO_FLOATLINE_QUOTE_SERVICE_ID;
const advanceQuoteServiceId = process.env.CROO_FLOATLINE_ADVANCE_QUOTE_SERVICE_ID;

if (!sdkKey) {
  throw new Error("CROO_SDK_KEY is required");
}

const client = new AgentClient({ baseURL: apiUrl, wsURL: wsUrl, logger: createRedactingLogger() }, sdkKey);
const stream = await client.connectWebSocket();
const keepAlive = setInterval(() => {
  console.log("Floatline provider heartbeat", { at: new Date().toISOString() });
}, 5_000);

console.log("Floatline provider connected to CROO", { apiUrl, wsUrl });

stream.on(EventType.NegotiationCreated, async (event) => {
  if (!event.negotiation_id) return;

  try {
    const negotiation = await client.getNegotiation(event.negotiation_id);

    if (negotiation.fundAmount && negotiation.fundToken) {
      if (!fundAddress) {
        await client.rejectNegotiation(event.negotiation_id, "FLOATLINE_FUND_ADDRESS is required for fund-transfer services");
        return;
      }

      await client.acceptNegotiationWithFundAddress(event.negotiation_id, fundAddress);
      console.log("Accepted fund-transfer negotiation", { negotiationId: event.negotiation_id });
      return;
    }

    const result = await client.acceptNegotiation(event.negotiation_id);
    console.log("Accepted negotiation", {
      negotiationId: event.negotiation_id,
      orderId: result.order.orderId,
      serviceId: result.order.serviceId,
    });
  } catch (error) {
    console.error("Failed to accept negotiation", { negotiationId: event.negotiation_id, error });
  }
});

stream.on(EventType.OrderPaid, async (event) => {
  if (!event.order_id) return;

  try {
    const order = await client.getOrder(event.order_id);
    const requirements = await readRequirements(order);
    const deliverable = await buildDeliverable(order, requirements);

    const result = await client.deliverOrder(event.order_id, {
      deliverableType: DeliverableType.Text,
      deliverableText: JSON.stringify(deliverable.body),
    });

    console.log("Delivered Floatline service", {
      orderId: event.order_id,
      txHash: result.txHash,
      service: deliverable.service,
    });
  } catch (error) {
    console.error("Failed to deliver Floatline service", { orderId: event.order_id, error });

    await client.deliverOrder(event.order_id, {
      deliverableType: DeliverableType.Text,
      deliverableText: JSON.stringify({
        approved: false,
        error: "INVALID_REQUIREMENTS",
        message: error instanceof Error ? error.message : "Unable to parse quote requirements",
      }),
    });
  }
});

stream.on("close", () => {
  console.error("CROO WebSocket stream closed");
});

stream.on("error", (error) => {
  console.error("CROO WebSocket stream error", { error });
});

process.on("SIGINT", () => {
  clearInterval(keepAlive);
  stream.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  clearInterval(keepAlive);
  stream.close();
  process.exit(0);
});

async function readRequirements(order: Order): Promise<string> {
  const negotiation = await client.getNegotiation(order.negotiationId);
  const requirements = negotiation.requirements;

  if (typeof requirements !== "string") {
    throw new Error("Order requirements must be a JSON string");
  }

  return requirements;
}

async function buildDeliverable(order: Order, requirements: string) {
  const parsedRequirements = parseJsonRequirements(requirements);

  if (isScoreService(order.serviceId)) {
    const request = CreditScoreRequestSchema.parse(parsedRequirements);
    const publicMetrics = request.agentId ? await fetchPublicAgentCreditMetrics(request.agentId) : undefined;
    return {
      service: "floatline.score",
      body: scoreCredit(request, publicMetrics),
    };
  }

  if (isAdvanceQuoteService(order.serviceId)) {
    const request = CreditQuoteRequestSchema.parse(parsedRequirements);
    return {
      service: "floatline.advance.quote",
      body: quoteCredit(request),
    };
  }

  throw new Error(`Unsupported Floatline service id: ${order.serviceId}`);
}

function isScoreService(serviceId: string): boolean {
  return Boolean(scoreServiceId && serviceId === scoreServiceId);
}

function isAdvanceQuoteService(serviceId: string): boolean {
  return [quoteServiceId, advanceQuoteServiceId].filter(Boolean).includes(serviceId);
}

async function fetchPublicAgentCreditMetrics(agentId: string): Promise<PublicAgentCreditMetrics> {
  const response = await fetch(`${apiUrl}/backend/v1/public/agents/${agentId}`);

  if (!response.ok) {
    throw new Error(`Unable to fetch CROO public agent metrics: HTTP ${response.status}`);
  }

  const payload = await response.json() as {
    agent?: {
      agentId?: string;
      walletAddress?: string;
      completedOrders?: string;
      totalVolume?: string;
      completionRate?: number;
      onlineStatus?: "online" | "offline";
    };
  };

  if (!payload.agent?.agentId) {
    throw new Error("CROO public agent response did not include agent metrics");
  }

  return {
    agentId: payload.agent.agentId,
    walletAddress: payload.agent.walletAddress,
    completedOrders: Number(payload.agent.completedOrders ?? 0),
    totalVolumeUsdc: Number(payload.agent.totalVolume ?? 0) / 1_000_000,
    completionRate: payload.agent.completionRate ?? 0,
    onlineStatus: payload.agent.onlineStatus ?? "offline",
  };
}

function createRedactingLogger() {
  return {
    info: logWithRedaction(console.info),
    warn: logWithRedaction(console.warn),
    error: logWithRedaction(console.error),
    debug: logWithRedaction(console.debug),
  };
}

function logWithRedaction(log: (...args: unknown[]) => void) {
  return (message: string, ...args: unknown[]) => {
    log(redactSecret(message), ...args.map(redactValue));
  };
}

function redactValue(value: unknown): unknown {
  if (typeof value === "string") return redactSecret(value);
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, redactValue(entry)]));
  }

  return value;
}

function redactSecret(value: string): string {
  return value.replace(/croo_sk_[A-Za-z0-9]+/g, "croo_sk_***");
}
