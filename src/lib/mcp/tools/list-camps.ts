import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_camps",
  title: "List camps",
  description: "List Vault camps with pricing and registration windows.",
  inputSchema: {
    limit: z.number().int().optional().describe("Maximum number of camps to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const max = Math.min(Math.max(limit ?? 20, 1), 50);
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("camps")
      .select("id, name, description, weekly_price_cents, full_pass_price_cents, status, registration_opens_at, registration_closes_at")
      .order("registration_opens_at", { ascending: true, nullsFirst: false })
      .limit(max);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { camps: data ?? [] },
    };
  },
});
