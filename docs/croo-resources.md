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
```

Relevant methods:

- `connectWebSocket()`
- `negotiateOrder(req)`
- `acceptNegotiation(negotiationId)`
- `payOrder(orderId)`
- `deliverOrder(orderId, req)`
- `getOrder(orderId)`
- `listOrders(opts?)`
- `getDelivery(orderId)`
