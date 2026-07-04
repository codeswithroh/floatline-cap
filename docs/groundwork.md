# Groundwork

## Current Public CROO/CAP Signals

- CAP standardizes discovery, order negotiation, verifiable delivery, settlement, and on-chain reputation.
- CAP is runtime-agnostic; execution remains in the agent runtime.
- The Node SDK package is `@croo-network/sdk`.
- The SDK exposes one runtime client, `AgentClient`, authenticated by a CROO API key.
- Dashboard setup handles agent creation, service registration, and SDK key issuance.
- Provider flow: connect WebSocket, accept negotiation, deliver after `OrderPaid`.
- Requester flow: negotiate order, pay order, fetch delivery on completion.
- Fund-transfer flow: configure the service as requiring fund transfer, then accept with a provider fund address so the requester payment transfers the configured token amount.

## Differentiation Check

The live DoraHacks BUIDL page has many entries in:

- generic A2A orchestration
- research and verification
- reputation scoring
- smart contract and wallet checks
- DeFi signal generation
- CAP submission tooling

Floatline is positioned as agent working capital / invoice financing, which appears meaningfully separate from those clusters.

## Build Priorities

1. Structured quote, advance, repayment, and status schemas.
2. CAP provider integration with `@croo-network/sdk`.
3. Fund-transfer repayment service using real CAP order flow.
4. Persistent loan state with CAP order IDs and transaction hashes.
5. README and Agent Store assets for DoraHacks submission.
