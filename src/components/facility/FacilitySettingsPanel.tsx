import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useFacilityHours, useFacilitySettings, useUpdateHours, useUpdateSettings } from "@/hooks/useFacilitySchedule";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const FacilitySettingsPanel = () => {
  const { data: hours = [] } = useFacilityHours();
  const { data: settings } = useFacilitySettings();
  const updateHours = useUpdateHours();
  const updateSettings = useUpdateSettings();

  const [local, setLocal] = useState(settings);
  useEffect(() => setLocal(settings), [settings]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display text-foreground">FACILITY HOURS</h2>
        <p className="text-xs text-muted-foreground mb-3">Set when the facility is open for bookings.</p>
        <div className="space-y-2">
          {hours.map((h) => (
            <div key={h.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
              <div className="w-24 text-sm font-medium text-foreground">{DAYS[h.day_of_week]}</div>
              <Switch
                checked={!h.is_closed}
                onCheckedChange={(v) => updateHours.mutate({ ...h, is_closed: !v })}
              />
              <span className="text-xs text-muted-foreground w-12">{h.is_closed ? "Closed" : "Open"}</span>
              <Input
                type="time"
                disabled={h.is_closed}
                value={h.open_time.slice(0, 5)}
                onChange={(e) => updateHours.mutate({ ...h, open_time: e.target.value })}
                className="w-32"
              />
              <span className="text-muted-foreground">→</span>
              <Input
                type="time"
                disabled={h.is_closed}
                value={h.close_time.slice(0, 5)}
                onChange={(e) => updateHours.mutate({ ...h, close_time: e.target.value })}
                className="w-32"
              />
            </div>
          ))}
        </div>
      </div>

      {local && (
        <div>
          <h2 className="text-lg font-display text-foreground">BOOKING RULES</h2>
          <p className="text-xs text-muted-foreground mb-3">Configure the rules engine for reservations.</p>
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min booking length (min)</Label>
                <Input type="number" value={local.min_booking_minutes} onChange={(e) => setLocal({ ...local, min_booking_minutes: parseInt(e.target.value) || 30 })} />
              </div>
              <div>
                <Label>Max booking length (min)</Label>
                <Input type="number" value={local.max_booking_minutes} onChange={(e) => setLocal({ ...local, max_booking_minutes: parseInt(e.target.value) || 240 })} />
              </div>
              <div>
                <Label>Slot size (min)</Label>
                <Input type="number" value={local.slot_size_minutes} onChange={(e) => setLocal({ ...local, slot_size_minutes: parseInt(e.target.value) || 30 })} />
              </div>
              <div>
                <Label>Advance booking window (days)</Label>
                <Input type="number" value={local.advance_booking_days} onChange={(e) => setLocal({ ...local, advance_booking_days: parseInt(e.target.value) || 60 })} />
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <Label>Enforce facility hours</Label>
                <Switch checked={local.enforce_hours} onCheckedChange={(v) => setLocal({ ...local, enforce_hours: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Enforce max length</Label>
                <Switch checked={local.enforce_max_length} onCheckedChange={(v) => setLocal({ ...local, enforce_max_length: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Enforce advance window</Label>
                <Switch checked={local.enforce_advance_window} onCheckedChange={(v) => setLocal({ ...local, enforce_advance_window: v })} />
              </div>
            </div>
            <Button onClick={() => updateSettings.mutate(local)} disabled={updateSettings.isPending}>Save Rules</Button>
          </div>
        </div>
      )}
    </div>
  );
};
