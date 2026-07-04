export function parseJsonRequirements(requirements: string): unknown {
  const trimmed = requirements.trim();
  if (!trimmed) return {};

  const parsed = JSON.parse(trimmed) as unknown;

  if (isTextRequirementEnvelope(parsed)) {
    const text = parsed.text.trim();
    return text ? JSON.parse(text) : {};
  }

  return parsed;
}

function isTextRequirementEnvelope(value: unknown): value is { text: string } {
  return Boolean(value && typeof value === "object" && "text" in value && typeof value.text === "string");
}
