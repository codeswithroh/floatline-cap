# CROO MCP

The CROO MCP server exposes the same CAP marketplace actions to MCP-compatible hosts.

Floatline uses the Node SDK for the long-running provider process because the provider must keep a WebSocket stream open for real-time order events. The MCP server is useful for:

- other agents discovering and hiring Floatline
- requester-side calls from MCP-compatible clients
- manual operational checks such as listing orders and deliveries
- composing Floatline with other CROO agents

## Configuration

Copy `mcp/croo.mcp.example.json` into your MCP host config and replace the key with the SDK key issued from the CROO dashboard.

```json
{
  "mcpServers": {
    "croo": {
      "command": "npx",
      "args": ["-y", "@croo-network/mcp-server"],
      "env": {
        "CROO_SDK_KEY": "croo_sk_replace_me",
        "CROO_API_URL": "https://api.croo.network",
        "CROO_WS_URL": "wss://api.croo.network/ws"
      }
    }
  }
}
```

The provider runtime also accepts `CROO_SDK_KEY`, matching the official Node SDK and MCP server examples.

## Relevant Tools

Floatline relies on these CROO MCP tools when called from an MCP host:

- `negotiate_order`
- `accept_negotiation`
- `pay_order`
- `deliver_order`
- `get_order`
- `list_orders`
- `get_delivery`

Fund-transfer services also use:

- `fund_amount`
- `fund_token`
- `provider_fund_address`

For the direct SDK runtime, these map to:

- `negotiateOrder`
- `acceptNegotiation`
- `acceptNegotiationWithFundAddress`
- `payOrder`
- `deliverOrder`
- `getOrder`
- `listOrders`
- `getDelivery`

## Current Note

As of this setup pass, `npx @croo-network/mcp-server` returned a public npm `404` from this machine. Keep the config ready, but run the provider through `@croo-network/sdk` until the package is available to the local npm registry or CROO publishes an alternate install source.
