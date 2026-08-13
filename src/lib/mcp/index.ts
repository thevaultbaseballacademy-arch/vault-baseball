import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listUpcomingTryouts from "./tools/list-upcoming-tryouts";
import listCamps from "./tools/list-camps";
import getMyProfile from "./tools/get-my-profile";
import updateMyProfile from "./tools/update-my-profile";
import listMyTeamRegistrations from "./tools/list-my-team-registrations";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "vault-os",
  title: "VAULT OS",
  version: "0.1.0",
  instructions:
    "Tools for VAULT OS, a baseball and softball athlete development platform. Use `list_upcoming_tryouts` and `list_camps` for open events, `get_my_profile` / `update_my_profile` for the signed-in athlete's profile, and `list_my_team_registrations` for the family's team registrations and payment status.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listUpcomingTryouts, listCamps, getMyProfile, updateMyProfile, listMyTeamRegistrations],
});
