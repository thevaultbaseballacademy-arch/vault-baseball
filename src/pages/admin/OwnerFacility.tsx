import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FloorPlanEditor } from "@/components/facility/FloorPlanEditor";
import { DayGridView } from "@/components/facility/DayGridView";
import { WeekView } from "@/components/facility/WeekView";
import { FacilitySettingsPanel } from "@/components/facility/FacilitySettingsPanel";
import { MultiResourceBookingWizard } from "@/components/facility/MultiResourceBookingWizard";

const OwnerFacility = () => {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display text-foreground">FACILITY SCHEDULE</h1>
          <p className="text-sm text-muted-foreground">Manage your facility layout, bookings, hours, and rules.</p>
        </div>
        <Button onClick={() => setWizardOpen(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-1" /> New Booking
        </Button>
      </div>

      <Tabs defaultValue="day">
        <TabsList>
          <TabsTrigger value="day">Day Grid</TabsTrigger>
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="floor">Floor Plan</TabsTrigger>
          <TabsTrigger value="settings">Hours & Rules</TabsTrigger>
        </TabsList>
        <TabsContent value="day" className="mt-4"><DayGridView /></TabsContent>
        <TabsContent value="week" className="mt-4"><WeekView /></TabsContent>
        <TabsContent value="floor" className="mt-4"><FloorPlanEditor /></TabsContent>
        <TabsContent value="settings" className="mt-4"><FacilitySettingsPanel /></TabsContent>
      </Tabs>

      <MultiResourceBookingWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
};

export default OwnerFacility;
