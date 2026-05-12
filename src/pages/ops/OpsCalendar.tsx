import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DayGridView } from "@/components/facility/DayGridView";
import { WeekView } from "@/components/facility/WeekView";
import { MultiResourceBookingWizard } from "@/components/facility/MultiResourceBookingWizard";
import { useStaffAccess } from "@/hooks/useStaffAccess";

const OpsCalendar = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { isAdmin } = useStaffAccess();

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-display tracking-[0.3em] text-primary mb-1">SCHEDULING OS</p>
          <h1 className="text-2xl md:text-3xl font-display mb-1">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "All coaches, all spaces — unified booking grid." : "Your bookings and facility availability."}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setWizardOpen(true)} className="shrink-0">
            <Plus className="w-4 h-4 mr-1" /> New Booking
          </Button>
        )}
      </div>

      <Tabs defaultValue="day">
        <TabsList>
          <TabsTrigger value="day">Day Grid</TabsTrigger>
          <TabsTrigger value="week">Week View</TabsTrigger>
        </TabsList>
        <TabsContent value="day" className="mt-4"><DayGridView /></TabsContent>
        <TabsContent value="week" className="mt-4"><WeekView /></TabsContent>
      </Tabs>

      <MultiResourceBookingWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
};

export default OpsCalendar;
