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
  raw_data?: unknown;
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

export const DEVICE_CONFIG: Record<DeviceType, {
  name: string;
  logo: string;
  color: string;
  description: string;
  capabilities: string[];
}> = {
  rapsodo: {
    name: 'Rapsodo',
    logo: '📊',
    color: 'hsl(var(--vault-velocity))',
    description: 'Pitching & hitting analytics with spin metrics',
    capabilities: ['pitching', 'hitting']
  },
  hittrax: {
    name: 'HitTrax',
    logo: '⚾',
    color: 'hsl(var(--vault-athleticism))',
    description: 'Batting simulator with exit velocity & distance',
    capabilities: ['hitting']
  },
  blast_motion: {
    name: 'Blast Motion',
    logo: '💥',
    color: 'hsl(var(--vault-utility))',
    description: 'Swing sensor with bat speed & connection metrics',
    capabilities: ['hitting']
  },
  trackman: {
    name: 'Trackman',
    logo: '📡',
    color: 'hsl(var(--vault-longevity))',
    description: 'Professional ball flight tracking system',
    capabilities: ['pitching', 'hitting']
  },
  pocket_radar: {
    name: 'Pocket Radar',
    logo: '📻',
    color: 'hsl(var(--vault-transfer))',
    description: 'Velocity measurement for arm & bat speed',
    capabilities: ['pitching', 'throwing', 'hitting']
  }
};
