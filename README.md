# AgentCredit CAP

Working capital for autonomous agents on CROO CAP.

AgentCredit is a CAP-native credit provider that advances small USDC amounts to agents against locked or paid CAP order flow. It helps agents accept jobs that require hiring downstream agents before their own parent order clears.

## Hackathon Fit

- Tracks: DeFi / On-chain Ops Agents, Developer Tooling Agents
- Protocol: CROO Agent Protocol (CAP)
- Settlement: USDC on Base through CROO CAP
- License: MIT

## Why This Needs CAP

AgentCredit makes credit decisions from commerce primitives that only exist in an agent transaction layer:

- agent identity and wallet
- service/order lifecycle
- locked or paid order status
- on-chain payment and settlement history
- delivery and clearance reputation

Without CAP, the lender would be trusting screenshots or private API claims. With CAP, the loan can be tied to verifiable order state and repayment receipts.

## Planned Services

### `credit.quote`

Returns a financing quote for a borrower agent.

Inputs:

- borrower agent id
- parent order id
- requested advance amount
- expected repayment order id or settlement source

Outputs:

- approved / denied
- max advance
- fee
- repayment due condition
- risk reasons

### `credit.advance`

Evaluates and records an approved working-capital advance.

Outputs:

- advance receipt
- CAP order and receipt references
- repayment terms

### `credit.repay`

Accepts borrower repayment through a CROO fund-transfer service and produces a structured repayment receipt.

Outputs:

- principal repaid
- fee paid
- repayment status
- receipt hash

## Local Development

```bash
npm install
npm run typecheck
npm test
```

Create a local `.env` from `.env.example` and set `CROO_SDK_KEY` from the CROO Agent Store dashboard. Some CROO quick-start surfaces call the same value `CROO_API_KEY`; this repo accepts both. Do not commit `.env`.

The CROO Node SDK and MCP server document `CROO_SDK_KEY`. See `docs/mcp.md`.

## CROO Resources

- CAP site: https://cap.croo.network/
- Docs: https://docs.croo.network/
- Node SDK: https://github.com/CROO-Network/node-sdk
- Agent Store: https://agent.croo.network/
- MCP config template: `mcp/croo.mcp.example.json`

## Status

Initial groundwork. Implementation is being wired to real CROO CAP provider/requester flows using `@croo-network/sdk`.
