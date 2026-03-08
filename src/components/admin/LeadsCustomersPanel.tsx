import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, ShoppingCart, UserPlus, Search, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/productPricing";

interface Lead {
  id: string;
  athlete_name: string;
  parent_name: string | null;
  email: string;
  athlete_age: number | null;
  primary_position: string | null;
  lead_source: string | null;
  created_at: string;
}

interface Purchase {
  id: string;
  user_id: string;
  product_key: string;
  amount_cents: number;
  purchased_at: string;
  status: string;
  expires_at: string | null;
}

interface OnboardingEntry {
  id: string;
  user_id: string | null;
  email: string;
  athlete_goals: string | null;
  current_level: string | null;
  position: string | null;
  current_velocity: string | null;
  exit_velo: string | null;
  social_handle: string | null;
  product_purchased: string | null;
  created_at: string;
}

const LeadsCustomersPanel = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, purchasesRes, onboardingRes] = await Promise.all([
        supabase.from("lead_captures").select("*").order("created_at", { ascending: false }),
        supabase.rpc("list_all_purchases_for_admin"),
        supabase.from("athlete_onboarding").select("*").order("created_at", { ascending: false }),
      ]);

      if (leadsRes.data) setLeads(leadsRes.data);
      if (purchasesRes.data) setPurchases(purchasesRes.data as Purchase[]);
      if (onboardingRes.data) setOnboarding(onboardingRes.data as OnboardingEntry[]);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(l =>
    l.athlete_name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Total Leads</span>
          </div>
          <p className="text-2xl font-display text-foreground">{leads.length}</p>
        </div>
        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Purchases</span>
          </div>
          <p className="text-2xl font-display text-foreground">{purchases.length}</p>
        </div>
        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">Onboarded</span>
          </div>
          <p className="text-2xl font-display text-foreground">{onboarding.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 bg-secondary border border-border text-foreground placeholder:text-muted-foreground w-full"
        />
      </div>

      <Tabs defaultValue="leads">
        <TabsList>
          <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="purchases">Purchases ({purchases.length})</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding ({onboarding.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="mt-4">
          <div className="bg-card border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-muted-foreground">Athlete</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Parent</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Age</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Position</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Source</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-muted/30">
                      <td className="p-3 text-foreground font-medium">{lead.athlete_name}</td>
                      <td className="p-3 text-muted-foreground">{lead.parent_name || "—"}</td>
                      <td className="p-3 text-muted-foreground">{lead.email}</td>
                      <td className="p-3 text-muted-foreground">{lead.athlete_age || "—"}</td>
                      <td className="p-3 text-muted-foreground capitalize">{lead.primary_position || "—"}</td>
                      <td className="p-3"><span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 text-xs">{lead.lead_source}</span></td>
                      <td className="p-3 text-muted-foreground text-xs">{new Date(lead.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No leads yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="purchases" className="mt-4">
          <div className="bg-card border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-muted-foreground">User ID</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="p-3 text-muted-foreground text-xs font-mono">{p.user_id?.slice(0, 8)}...</td>
                      <td className="p-3 text-foreground font-medium">{p.product_key}</td>
                      <td className="p-3 text-foreground">{formatPrice(p.amount_cents)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-xs ${p.status === "completed" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{new Date(p.purchased_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {purchases.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No purchases yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="onboarding" className="mt-4">
          <div className="bg-card border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Level</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Position</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Velo</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Goals</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {onboarding.map((o) => (
                    <tr key={o.id} className="hover:bg-muted/30">
                      <td className="p-3 text-foreground">{o.email}</td>
                      <td className="p-3 text-muted-foreground capitalize">{o.current_level?.replace("_", " ") || "—"}</td>
                      <td className="p-3 text-muted-foreground capitalize">{o.position || "—"}</td>
                      <td className="p-3 text-muted-foreground">{o.current_velocity || "—"}</td>
                      <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">{o.athlete_goals || "—"}</td>
                      <td className="p-3 text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {onboarding.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No onboarding entries yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadsCustomersPanel;
