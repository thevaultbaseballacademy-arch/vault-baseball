import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FloorPlanEditor } from "@/components/facility/FloorPlanEditor";
import { DayGridView } from "@/components/facility/DayGridView";
import { WeekView } from "@/components/facility/WeekView";
import { FacilitySettingsPanel } from "@/components/facility/FacilitySettingsPanel";

const OwnerFacility = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display text-foreground">FACILITY SCHEDULE</h1>
        <p className="text-sm text-muted-foreground">Manage your facility layout, bookings, hours, and rules.</p>
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
    </div>
  );
};

export default OwnerFacility;
