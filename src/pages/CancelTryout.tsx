import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const FN_URL = `${SUPABASE_URL}/functions/v1/cancel-tryout-registration`;

type State =
  | { kind: "loading" }
  | { kind: "invalid"; message: string }
  | { kind: "ready"; player: string; event: string; date: string }
  | { kind: "already" }
  | { kind: "submitting" }
  | { kind: "done" };

const CancelTryout = () => {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) { setState({ kind: "invalid", message: "No token provided." }); return; }
    fetch(`${FN_URL}?token=${encodeURIComponent(token)}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok || !d.valid) { setState({ kind: "invalid", message: d.error ?? "Invalid link." }); return; }
        if (d.already_cancelled) { setState({ kind: "already" }); return; }
        setState({
          kind: "ready",
          player: d.player_name,
          event: d.event_name ?? "your tryout",
          date: d.event_date ? new Date(d.event_date).toLocaleString(undefined, { weekday: "long", month: "long", day: "numeric" }) : "",
        });
      })
      .catch(() => setState({ kind: "invalid", message: "Could not load registration." }));
  }, [token]);

  const confirm = async () => {
    setState({ kind: "submitting" });
    try {
      const r = await fetch(FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({ token }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Failed");
      setState({ kind: "done" });
    } catch {
      setState({ kind: "invalid", message: "Could not cancel — please contact us." });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          {state.kind === "loading" && <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />}

          {state.kind === "invalid" && (
            <>
              <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
              <h1 className="text-xl font-bold">Link not valid</h1>
              <p className="text-sm text-muted-foreground">{state.message}</p>
              <Button asChild variant="outline"><Link to="/tryouts"><ArrowLeft className="w-4 h-4 mr-2" />Back to tryouts</Link></Button>
            </>
          )}

          {state.kind === "already" && (
            <>
              <CheckCircle2 className="w-12 h-12 mx-auto text-primary" />
              <h1 className="text-xl font-bold">Already cancelled</h1>
              <p className="text-sm text-muted-foreground">This registration has already been released.</p>
              <Button asChild variant="outline"><Link to="/tryouts">Back to tryouts</Link></Button>
            </>
          )}

          {state.kind === "ready" && (
            <>
              <h1 className="text-2xl font-bold">Cancel registration?</h1>
              <p className="text-sm text-muted-foreground">
                You're about to release <strong>{state.player}</strong>'s spot for{" "}
                <strong>{state.event}</strong>{state.date && <> on <strong>{state.date}</strong></>}.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <Button asChild variant="outline"><Link to="/tryouts">Keep my spot</Link></Button>
                <Button variant="destructive" onClick={confirm}>Yes, cancel</Button>
              </div>
            </>
          )}

          {state.kind === "submitting" && <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />}

          {state.kind === "done" && (
            <>
              <CheckCircle2 className="w-12 h-12 mx-auto text-primary" />
              <h1 className="text-xl font-bold">Spot released</h1>
              <p className="text-sm text-muted-foreground">Thanks for letting us know. A confirmation email is on the way.</p>
              <Button asChild variant="outline"><Link to="/tryouts">Back to tryouts</Link></Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CancelTryout;
