import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Upload, Radio, Zap, Shield,
  Plus, Check, Clock, FileSpreadsheet,
  Loader2, ChevronRight, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDeviceIngestion, SOURCE_KPI_PRESETS } from "@/hooks/useDeviceIngestion";
import { DataSource, SOURCE_LABELS } from "@/types/deviceMetrics";

const DeviceIngestionPage = () => {
  const navigate = useNavigate();
  const {
    registry, syncLogs, loading,
    quickManualEntry, ingestBulk, parseCSV,
  } = useDeviceIngestion();

  const [selectedSource, setSelectedSource] = useState<DataSource>("manual");
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvSource, setCsvSource] = useState<DataSource>("csv_import");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; failed: number } | null>(null);

  const presets = SOURCE_KPI_PRESETS[selectedSource] || SOURCE_KPI_PRESETS["manual"] || [];
  const activePreset = presets.find(p => p.name === selectedPreset);

  const handleQuickEntry = async () => {
    if (!activePreset || !value) return;
    setSaving(true);
    try {
      await quickManualEntry(
        activePreset.name,
        activePreset.category,
        parseFloat(value),
        activePreset.unit,
        selectedSource
      );
      setValue("");
    } finally {
      setSaving(false);
    }
  };

  const handleCSVImport = async () => {
    if (!csvText.trim()) return;
    setImporting(true);
    try {
      const parsed = parseCSV(csvText, csvSource);
      if (parsed.length === 0) {
        setImportResult({ imported: 0, failed: 0 });
        return;
      }
      const result = await ingestBulk(parsed, csvSource);
      setImportResult({ imported: result.imported, failed: result.failed });
      if (result.imported > 0) setCsvText("");
    } finally {
      setImporting(false);
    }
  };

  const statusColors: Record<string, string> = {
    live: "bg-green-500/10 text-green-600 border-green-500/20",
    api_ready: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    csv_import: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    manual: "bg-secondary text-muted-foreground border-border",
  };

  const statusLabels: Record<string, string> = {
    live: "LIVE",
    api_ready: "API READY",
    csv_import: "CSV / MANUAL",
    manual: "MANUAL ONLY",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display text-foreground mb-1">DATA INGESTION</h1>
              <p className="text-muted-foreground">
                Your athlete record is the asset. Devices are just inputs.
              </p>
            </div>

            {/* Data Principle Banner */}
            <div className="bg-card border border-border p-4 flex items-start gap-3">
              <Database className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-display text-foreground">VAULT™ OWNS THE RECORD</p>
                <p className="text-xs text-muted-foreground">
                  All data is stored device-agnostic. If any vendor disappears, your historical data stays in Vault.
                  Every reading is tagged with its source for full traceability.
                </p>
              </div>
            </div>

            <Tabs defaultValue="enter" className="space-y-6">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="enter" className="font-display text-xs">QUICK ENTRY</TabsTrigger>
                <TabsTrigger value="import" className="font-display text-xs">CSV IMPORT</TabsTrigger>
                <TabsTrigger value="devices" className="font-display text-xs">DEVICE HUB</TabsTrigger>
              </TabsList>

              {/* ── Quick Entry Tab ─────────────────────────────────── */}
              <TabsContent value="enter" className="space-y-4">
                <div className="bg-card border border-border p-6 space-y-5">
                  <h3 className="font-display text-foreground flex items-center gap-2">
                    <Radio className="w-5 h-5 text-primary" /> Quick Reading
                  </h3>

                  <div>
                    <Label className="text-xs text-muted-foreground">Data Source</Label>
                    <Select value={selectedSource} onValueChange={(v) => { setSelectedSource(v as DataSource); setSelectedPreset(""); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(SOURCE_LABELS).filter(([k]) => k !== "csv_import" && k !== "api_import").map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Metric</Label>
                    <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                      <SelectTrigger><SelectValue placeholder="Select metric..." /></SelectTrigger>
                      <SelectContent>
                        {presets.map(p => (
                          <SelectItem key={p.name} value={p.name}>
                            {p.name} ({p.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {activePreset && (
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Value ({activePreset.unit})</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          placeholder={`e.g. ${activePreset.unit === "mph" ? "87" : activePreset.unit === "rpm" ? "2200" : "0"}`}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleQuickEntry} disabled={saving || !value}>
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                          Save
                        </Button>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground">
                    Source: <span className="font-display">{SOURCE_LABELS[selectedSource]}</span> — 
                    tagged automatically for traceability
                  </p>
                </div>
              </TabsContent>

              {/* ── CSV Import Tab ──────────────────────────────────── */}
              <TabsContent value="import" className="space-y-4">
                <div className="bg-card border border-border p-6 space-y-5">
                  <h3 className="font-display text-foreground flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-primary" /> CSV Import
                  </h3>

                  <div>
                    <Label className="text-xs text-muted-foreground">Source Device</Label>
                    <Select value={csvSource} onValueChange={(v) => setCsvSource(v as DataSource)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Paste CSV data (headers: name, value, unit, category, date)
                    </Label>
                    <Textarea
                      rows={8}
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      placeholder={`name,value,unit,category,date\nFastball Velocity,87,mph,pitching,2026-03-19\nExit Velocity,92,mph,hitting,2026-03-19`}
                      className="font-mono text-xs"
                    />
                  </div>

                  <Button onClick={handleCSVImport} disabled={importing || !csvText.trim()} className="w-full">
                    {importing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                    Import Data
                  </Button>

                  {importResult && (
                    <div className={`p-3 text-sm ${importResult.failed > 0 ? "bg-amber-500/10 text-amber-600" : "bg-green-500/10 text-green-600"}`}>
                      ✓ {importResult.imported} records imported
                      {importResult.failed > 0 && ` · ${importResult.failed} failed`}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ── Device Hub Tab ──────────────────────────────────── */}
              <TabsContent value="devices" className="space-y-4">
                <div className="space-y-3">
                  {registry.map((device) => (
                    <div key={device.id} className="bg-card border border-border p-5 flex items-start gap-4">
                      <span className="text-2xl">{device.logo_emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-display text-foreground">{device.device_name}</h4>
                          <span className="text-xs text-muted-foreground">by {device.manufacturer}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{device.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] font-display ${statusColors[device.integration_status] || ""}`}>
                            {statusLabels[device.integration_status] || device.integration_status.toUpperCase()}
                          </Badge>
                          {device.capabilities.map(cap => (
                            <Badge key={cap} variant="secondary" className="text-[10px] capitalize">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {device.integration_status === "live" ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <Zap className="w-4 h-4" />
                            <span className="text-xs font-display">CONNECTED</span>
                          </div>
                        ) : device.integration_status === "api_ready" ? (
                          <Button size="sm" variant="outline" className="text-xs">
                            Connect <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Manual</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sync History */}
                {syncLogs.length > 0 && (
                  <div className="bg-card border border-border p-5">
                    <h3 className="font-display text-foreground text-sm mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> SYNC HISTORY
                    </h3>
                    <div className="space-y-2">
                      {syncLogs.slice(0, 10).map(log => (
                        <div key={log.id} className="flex items-center gap-3 p-2 bg-secondary text-xs">
                          <span className="text-muted-foreground w-24 shrink-0">
                            {new Date(log.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </span>
                          <span className="font-display text-foreground capitalize">{log.device_type.replace(/_/g, " ")}</span>
                          <span className="text-muted-foreground">{log.sync_type}</span>
                          <span className="ml-auto text-green-600">{log.records_imported} imported</span>
                          {log.records_failed > 0 && (
                            <span className="text-destructive">{log.records_failed} failed</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeviceIngestionPage;
