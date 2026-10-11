export interface BromatologicalProfile {
  food_name: string;
  category: string; // 'Proteína' | 'Lácteo' | 'Almidón' | 'Verdura' | 'Legumbre' | 'Pescado/Marisco' | 'Postre' | 'Mixto';
  t0_hours: number; // Base shelf life at 4°C in hours (e.g. 72 for meat/rice, 120 for veg soups)
  q10_factor: number; // Deterioration acceleration factor per 10°C increase (default 2.0 - 2.5)
  t_ref: number; // Standard reference temperature: 4.0 °C
  critical_hazard: string; // Main pathogen of concern (e.g. "Bacillus cereus / Salmonella")
  conservation_tip: string; // Storage / reheating tip
  ingredients?: string[]; // Key perishable ingredients extracted by AI
}

export interface ThermalLog {
  id: string;
  timestamp: number;
  duration_hours: number; // Elapsed hours in this thermal exposure
  temp_celsius: number; // Temperature during this period in °C
  label: string; // e.g. "Refrigeración inicial", "Olvido en mesón"
  consumed_hours: number; // Effective hours deducted in this interval
  remaining_hours_after: number; // Effective hours remaining after this interval
  remaining_percent_after: number; // Percentage remaining after this interval
}

export interface SmartTag {
  id: string; // e.g. "Tag #01"
  nfcUid: string; // e.g. "04:5A:21:8B:10"
  profile: BromatologicalProfile;
  createdAt: number; // Timestamp of tag association
  logs: ThermalLog[];
  source: 'ai_gemini' | 'offline_fallback';
}

export type ExpirationStatus = 'safe' | 'warning' | 'danger' | 'expired';

export interface KineticCalculationResult {
  consumed_hours: number;
  remaining_hours: number;
  remaining_percent: number;
  status: ExpirationStatus;
  current_temp: number;
  current_rate: number; // r(T) instant rate
}
