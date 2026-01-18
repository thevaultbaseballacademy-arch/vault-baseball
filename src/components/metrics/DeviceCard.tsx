import { motion } from "framer-motion";
import { Check, Link2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEVICE_CONFIG, type DeviceType, type DeviceIntegration } from "@/types/deviceMetrics";

interface DeviceCardProps {
  deviceType: DeviceType;
  integration?: DeviceIntegration;
  onConnect: (deviceType: DeviceType) => void;
  onManage: (deviceType: DeviceType) => void;
}

export function DeviceCard({ deviceType, integration, onConnect, onManage }: DeviceCardProps) {
  const config = DEVICE_CONFIG[deviceType];
  const isConnected = integration?.is_connected;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-card border border-border p-6 group hover:border-primary/50 transition-all"
    >
      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        {isConnected ? (
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
            <Check className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            Not Connected
          </Badge>
        )}
      </div>
      
      {/* Device info */}
      <div className="flex items-start gap-4 mb-4">
        <div 
          className="w-12 h-12 flex items-center justify-center text-2xl bg-secondary"
          style={{ borderLeft: `3px solid ${config.color}` }}
        >
          {config.logo}
        </div>
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-foreground">
            {config.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {config.description}
          </p>
        </div>
      </div>
      
      {/* Capabilities */}
      <div className="flex gap-2 mb-4">
        {config.capabilities.map((cap) => (
          <Badge 
            key={cap} 
            variant="secondary" 
            className="text-xs uppercase tracking-wider"
          >
            {cap}
          </Badge>
        ))}
      </div>
      
      {/* Last sync */}
      {integration?.last_sync_at && (
        <p className="text-xs text-muted-foreground mb-4">
          Last synced: {new Date(integration.last_sync_at).toLocaleDateString()}
        </p>
      )}
      
      {/* Actions */}
      <div className="flex gap-2">
        {isConnected ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onManage(deviceType)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => onConnect(deviceType)}
          >
            <Link2 className="w-4 h-4 mr-2" />
            Connect
          </Button>
        )}
      </div>
    </motion.div>
  );
}
