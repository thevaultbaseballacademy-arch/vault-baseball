import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Radar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeviceCard } from "@/components/metrics/DeviceCard";
import { ManualMetricEntry } from "@/components/metrics/ManualMetricEntry";
import { CSVUploader } from "@/components/metrics/CSVUploader";
import { MetricsDashboard } from "@/components/metrics/MetricsDashboard";
import { ShareMetricsDialog } from "@/components/metrics/ShareMetricsDialog";
import { useDeviceIntegrations, useAddDeviceIntegration } from "@/hooks/useDeviceMetrics";
import { DEVICE_CONFIG, type DeviceType } from "@/types/deviceMetrics";
import { toast } from "sonner";

const DeviceMetrics = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: integrations = [] } = useDeviceIntegrations(userId || undefined);
  const addIntegration = useAddDeviceIntegration();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });
  }, [navigate]);

  const handleConnect = async (deviceType: DeviceType) => {
    if (!userId) return;
    await addIntegration.mutateAsync({ userId, deviceType });
    toast.info(`${DEVICE_CONFIG[deviceType].name} added. Use CSV import or manual entry to add data.`);
  };

  const handleManage = (deviceType: DeviceType) => {
    toast.info("API integration management coming soon.");
  };

  if (!userId) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Radar className="w-8 h-8 text-primary" />
                <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wider">
                  Device Metrics
                </h1>
              </div>
              <p className="text-muted-foreground">
                Track data from Rapsodo, HitTrax, Blast Motion, Trackman & Pocket Radar
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <ManualMetricEntry userId={userId} />
              <CSVUploader userId={userId} />
              <ShareMetricsDialog userId={userId} />
            </div>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="bg-secondary">
              <TabsTrigger value="dashboard" className="gap-2">
                <Activity className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="devices" className="gap-2">
                <Radar className="w-4 h-4" />
                Devices
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <MetricsDashboard userId={userId} />
            </TabsContent>

            <TabsContent value="devices">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Object.keys(DEVICE_CONFIG) as DeviceType[]).map((deviceType) => (
                  <DeviceCard
                    key={deviceType}
                    deviceType={deviceType}
                    integration={integrations.find((i) => i.device_type === deviceType)}
                    onConnect={handleConnect}
                    onManage={handleManage}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default DeviceMetrics;
