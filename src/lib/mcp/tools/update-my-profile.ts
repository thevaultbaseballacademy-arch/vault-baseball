import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_my_profile",
  title: "Update my athlete profile",
  description: "Update fields on the signed-in user's Vault athlete profile. Only the fields provided are changed.",
  inputSchema: {
    position: z.string().optional().describe("Primary position."),
    graduation_year: z.number().int().optional().describe("High school graduation year."),
    height_inches: z.number().int().optional(),
    weight_lbs: z.number().int().optional(),
    throwing_arm: z.string().optional().describe("R or L."),
    batting_side: z.string().optional().describe("R, L or S."),
    academic_gpa: z.number().optional(),
    intended_major: z.string().optional(),
    division_target: z.string().optional().describe("Target level, e.g. D1, D2, D3, NAIA, JUCO."),
    target_schools: z.array(z.string()).optional().describe("List of target school names."),
    bio: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const patch = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== undefined && v !== null)
    );
    if (Object.keys(patch).length === 0) {
      return { content: [{ type: "text", text: "No fields provided to update." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("user_id", ctx.getUserId() ?? "")
      .select("display_name, position, graduation_year, height_inches, weight_lbs, throwing_arm, batting_side, academic_gpa, intended_major, division_target, target_schools, bio");

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data?.[0] ?? {}, null, 2) }],
      structuredContent: { profile: data?.[0] ?? null },
    };
  },
});
