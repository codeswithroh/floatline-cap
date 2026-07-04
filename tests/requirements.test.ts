import { describe, expect, it } from "vitest";
import { parseJsonRequirements } from "../src/cap/requirements.js";

describe("parseJsonRequirements", () => {
  it("parses direct JSON requirements", () => {
    expect(parseJsonRequirements('{"agentId":"agent_1"}')).toEqual({ agentId: "agent_1" });
  });

  it("unwraps CROO text requirement envelopes", () => {
    expect(parseJsonRequirements('{"text":"{ \\"agentId\\": \\"agent_1\\" }"}')).toEqual({ agentId: "agent_1" });
  });
});
