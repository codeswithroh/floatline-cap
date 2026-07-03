# Groundwork

## Current Public CROO/CAP Signals

- CAP standardizes discovery, order negotiation, verifiable delivery, settlement, and on-chain reputation.
- CAP is runtime-agnostic; execution remains in the agent runtime.
- The Node SDK package is `@croo-network/sdk`.
- The SDK exposes one runtime client, `AgentClient`, authenticated by `CROO_SDK_KEY`.
- Dashboard setup handles agent creation, service registration, and SDK key issuance.
- Provider flow: connect WebSocket, accept negotiation, deliver after `OrderPaid`.
- Requester flow: negotiate order, pay order, fetch delivery on completion.

## Differentiation Check

The live DoraHacks BUIDL page has many entries in:

- generic A2A orchestration
- research and verification
- reputation scoring
- smart contract and wallet checks
- DeFi signal generation
- CAP submission tooling

AgentCredit is positioned as agent working capital / invoice financing, which appears meaningfully separate from those clusters.

## Build Priorities

1. Deterministic local credit scoring.
2. Structured quote, advance, and repayment schemas.
3. Local demo showing a borrower agent financing downstream CAP calls.
4. CAP provider integration with `@croo-network/sdk`.
5. README and demo assets for DoraHacks submission.
