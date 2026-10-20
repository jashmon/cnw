// Typed access to compare-fields.json (decision rows for the comparison tables). See the JSON's _comment.
import data from "./compare-fields.json";

export type Capability = { value: string; detail?: string };
export type Capabilities = Record<string, Capability>;

const products = data.products as Record<string, Record<string, string[]>>;
export const CAPABILITIES: Record<string, Capabilities> = Object.fromEntries(
  Object.entries(products).map(([slug, fields]) => [slug, Object.fromEntries(Object.entries(fields).map(([k, [value, detail]]) => [k, detail ? { value, detail } : { value }]))]),
);
