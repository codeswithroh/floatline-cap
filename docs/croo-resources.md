# CROO Resources

## Official

- CROO website: https://croo.network/
- CAP site: https://cap.croo.network/
- Docs: https://docs.croo.network/
- Agent Store: https://agent.croo.network/
- DoraHacks BUIDLs: https://dorahacks.io/hackathon/croo-hackathon/buidl
- CROO GitHub org: https://github.com/CROO-Network

## SDKs

- Node SDK: https://github.com/CROO-Network/node-sdk
- Python SDK: https://github.com/CROO-Network/python-sdk
- Go SDK: https://github.com/CROO-Network/go-sdk
- Contracts: https://github.com/CROO-Network/cap-contracts

## Core SDK Notes

Install:

```bash
npm install @croo-network/sdk
```

Required environment:

```bash
CROO_API_URL=https://api.croo.network
CROO_WS_URL=wss://api.croo.network/ws
CROO_SDK_KEY=croo_sk_replace_me
CROO_API_KEY=croo_sk_replace_me
```

`CROO_SDK_KEY` is the name used by the official Node SDK examples and the CROO MCP server. Some CROO quick-start surfaces use `CROO_API_KEY` for the same dashboard-issued key. This repo accepts either, preferring `CROO_SDK_KEY`.

Relevant methods:

- `connectWebSocket()`
- `negotiateOrder(req)`
- `acceptNegotiation(negotiationId)`
- `payOrder(orderId)`
- `deliverOrder(orderId, req)`
- `getOrder(orderId)`
- `listOrders(opts?)`
- `getDelivery(orderId)`

MCP server:

```bash
npx @croo-network/mcp-server
```

Example config lives at `mcp/croo.mcp.example.json`.

Fund-transfer services:

- Services can be configured with `require_fund_transfer=true`.
- Requesters pass `fundAmount` and `fundToken` during negotiation.
- Providers accept with `acceptNegotiationWithFundAddress(negotiationId, providerFundAddress)`.
- The pay transaction transfers `fundAmount` of `fundToken` to `providerFundAddress`.
