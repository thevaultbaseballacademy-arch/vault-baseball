import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FloorPlanEditor } from "@/components/facility/FloorPlanEditor";
import { FacilitySettingsPanel } from "@/components/facility/FacilitySettingsPanel";

const OpsResources = () => (
  <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
    <p className="text-[11px] font-display tracking-[0.3em] text-primary mb-1">SCHEDULING OS</p>
    <h1 className="text-2xl md:text-3xl font-display mb-1">Resources</h1>
    <p className="text-sm text-muted-foreground mb-6">Spaces, floor plan, hours, and rules.</p>

    <Tabs defaultValue="spaces">
      <TabsList>
        <TabsTrigger value="spaces">Spaces & Floor Plan</TabsTrigger>
        <TabsTrigger value="hours">Hours & Rules</TabsTrigger>
      </TabsList>
      <TabsContent value="spaces" className="mt-4"><FloorPlanEditor /></TabsContent>
      <TabsContent value="hours" className="mt-4"><FacilitySettingsPanel /></TabsContent>
    </Tabs>
  </div>
);

export default OpsResources;
