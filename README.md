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

Advances a small USDC amount when the quote is accepted.

Outputs:

- advance receipt
- tx hash or simulated receipt in local mode
- repayment terms

### `credit.repay`

Records repayment and produces a structured repayment receipt.

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

## CROO Resources

- CAP site: https://cap.croo.network/
- Docs: https://docs.croo.network/
- Node SDK: https://github.com/CROO-Network/node-sdk
- Agent Store: https://agent.croo.network/

## Status

Initial groundwork. Implementation will start with deterministic local credit scoring and receipts, then wire the provider to `@croo-network/sdk`.
