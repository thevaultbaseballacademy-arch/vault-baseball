export type DeviceType = 'rapsodo' | 'hittrax' | 'blast_motion' | 'trackman' | 'pocket_radar';

export interface DeviceIntegration {
  id: string;
  user_id: string;
  device_type: DeviceType;
  api_key?: string;
  is_connected: boolean;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceMetric {
  id: string;
  user_id: string;
  device_type: DeviceType;
  recorded_at: string;
  session_id?: string;
  metric_category: 'pitching' | 'hitting' | 'throwing';
  
  // Pitching metrics
  pitch_type?: string;
  velocity_mph?: number;
  spin_rate_rpm?: number;
  spin_axis?: number;
  spin_efficiency?: number;
  horizontal_break?: number;
  vertical_break?: number;
  release_height?: number;
  release_extension?: number;
  
  // Hitting metrics
  exit_velocity_mph?: number;
  launch_angle?: number;
  distance_ft?: number;
  bat_speed_mph?: number;
  attack_angle?: number;
  time_to_contact?: number;
  on_plane_efficiency?: number;
  peak_hand_speed?: number;
  connection_score?: number;
  rotation_score?: number;
  
  // Blast Motion specific
  power_index?: number;
  body_rotation?: number;
  
  // General velocity
  measured_velocity_mph?: number;
  velocity_type?: string;
  
  notes?: string;
  import_source: string;
  raw_data?: Record<string, unknown> | null;
  created_at: string;
}

export interface MetricShareToken {
  id: string;
  user_id: string;
  token: string;
  label?: string;
  is_public: boolean;
  expires_at?: string;
  recipient_email?: string;
  recipient_name?: string;
  include_pitching: boolean;
  include_hitting: boolean;
  include_throwing: boolean;
  include_trends: boolean;
  view_count: number;
  last_viewed_at?: string;
  created_at: string;
}

export type SyncStatus = 'live' | 'activating' | 'pending';

export const DEVICE_CONFIG: Record<DeviceType, {
  name: string;
  logo: string;
  color: string;
  description: string;
  capabilities: string[];
  syncStatus: SyncStatus;
  apiMethod: string;
  keyMetrics: string[];
}> = {
  trackman: {
    name: 'Trackman',
    logo: '📡',
    color: 'hsl(var(--vault-velocity))',
    description: 'Stadium V3 / Portable B1 - Real-time ball tracking',
    capabilities: ['pitching', 'hitting'],
    syncStatus: 'activating',
    apiMethod: 'REST API & WebSockets',
    keyMetrics: ['Pitch Speed', 'Spin Rate', 'Exit Velo', 'Launch Angle']
  },
  rapsodo: {
    name: 'Rapsodo',
    logo: '📊',
    color: 'hsl(var(--vault-athleticism))',
    description: 'Cloud-to-Cloud sync with OAuth 2.0',
    capabilities: ['pitching', 'hitting'],
    syncStatus: 'live',
    apiMethod: 'Cloud API (OAuth 2.0)',
    keyMetrics: ['Velocity', 'Spin Rate', 'Spin Axis', 'Break']
  },
  blast_motion: {
    name: 'Blast Motion',
    logo: '💥',
    color: 'hsl(var(--vault-utility))',
    description: 'Blast Connect API - Swing mechanics',
    capabilities: ['hitting'],
    syncStatus: 'live',
    apiMethod: 'Blast Connect API',
    keyMetrics: ['Bat Speed', 'Attack Angle', 'Plane Score', 'Rotation']
  },
  hittrax: {
    name: 'HitTrax',
    logo: '⚾',
    color: 'hsl(var(--vault-longevity))',
    description: 'StatsCenter V3 API with REV™ AI analytics',
    capabilities: ['hitting'],
    syncStatus: 'live',
    apiMethod: 'StatsCenter API',
    keyMetrics: ['Exit Velocity', 'Launch Angle', 'Distance', 'Hard Hit %']
  },
  pocket_radar: {
    name: 'Pocket Radar',
    logo: '📻',
    color: 'hsl(var(--vault-transfer))',
    description: 'Velocity measurement for arm & bat speed',
    capabilities: ['pitching', 'throwing', 'hitting'],
    syncStatus: 'pending',
    apiMethod: 'Manual / CSV Import',
    keyMetrics: ['Velocity', 'Peak Speed', 'Average Speed']
  }
};

// VAULT Power Metrics - Normalized calculations from multiple sources
export interface VaultPowerMetrics {
  vaultPowerIndex: number; // Normalized 0-100 score combining exit velo, bat speed
  vaultArmStrength: number; // Normalized 0-100 combining pitch velo, spin efficiency
  vaultExplosiveness: number; // Combined athletic metrics
  vaultConsistency: number; // Variance analysis across sessions
}

export function calculateVaultPowerIndex(metrics: DeviceMetric[]): number {
  const hittingMetrics = metrics.filter(m => m.metric_category === 'hitting');
  if (!hittingMetrics.length) return 0;
  
  const avgExitVelo = hittingMetrics.filter(m => m.exit_velocity_mph)
    .reduce((sum, m) => sum + (m.exit_velocity_mph || 0), 0) / 
    (hittingMetrics.filter(m => m.exit_velocity_mph).length || 1);
  
  const avgBatSpeed = hittingMetrics.filter(m => m.bat_speed_mph)
    .reduce((sum, m) => sum + (m.bat_speed_mph || 0), 0) / 
    (hittingMetrics.filter(m => m.bat_speed_mph).length || 1);
  
  // Normalize to 0-100: Exit Velo (60-110 range), Bat Speed (50-90 range)
  const exitVeloScore = Math.min(100, Math.max(0, ((avgExitVelo - 60) / 50) * 100));
  const batSpeedScore = Math.min(100, Math.max(0, ((avgBatSpeed - 50) / 40) * 100));
  
  return avgExitVelo && avgBatSpeed 
    ? Math.round((exitVeloScore * 0.6 + batSpeedScore * 0.4))
    : avgExitVelo ? Math.round(exitVeloScore) : Math.round(batSpeedScore);
}

export function calculateVaultArmStrength(metrics: DeviceMetric[]): number {
  const pitchingMetrics = metrics.filter(m => m.metric_category === 'pitching');
  if (!pitchingMetrics.length) return 0;
  
  const avgVelo = pitchingMetrics.filter(m => m.velocity_mph)
    .reduce((sum, m) => sum + (m.velocity_mph || 0), 0) / 
    (pitchingMetrics.filter(m => m.velocity_mph).length || 1);
  
  const avgSpinEff = pitchingMetrics.filter(m => m.spin_efficiency)
    .reduce((sum, m) => sum + (m.spin_efficiency || 0), 0) / 
    (pitchingMetrics.filter(m => m.spin_efficiency).length || 1);
  
  // Normalize: Velo (60-100 range), Spin Efficiency (0-100)
  const veloScore = Math.min(100, Math.max(0, ((avgVelo - 60) / 40) * 100));
  
  return avgSpinEff 
    ? Math.round((veloScore * 0.7 + avgSpinEff * 0.3))
    : Math.round(veloScore);
}
