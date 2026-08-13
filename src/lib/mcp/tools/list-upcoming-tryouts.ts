import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_upcoming_tryouts",
  title: "List upcoming tryouts",
  description: "List published Vault tryout events that have not started yet, with date, age group, location and price.",
  inputSchema: {
    limit: z.number().int().optional().describe("Maximum number of events to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const max = Math.min(Math.max(limit ?? 20, 1), 50);
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("tryout_events")
      .select("id, name, age_group, starts_at, ends_at, location_name, address, price_cents, capacity, description, status")
      .eq("status", "published")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(max);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { tryouts: data ?? [] },
    };
  },
});
