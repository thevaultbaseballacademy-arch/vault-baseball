import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_team_registrations",
  title: "List my team registrations",
  description: "List Vault team registrations tied to the signed-in user's email, including team level, payment plan and payment status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const email = ctx.getUserEmail();
    if (!email) {
      return { content: [{ type: "text", text: "No email on this account." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("team_registrations")
      .select(
        "id, team_level, tier, payment_plan, annual_tuition_cents, deposit_cents, installment_count, installment_cents, amount_paid_cents, status, player_first_name, player_last_name, player_position, created_at, paid_at"
      )
      .eq("parent_email", email)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { registrations: data ?? [] },
    };
  },
});
