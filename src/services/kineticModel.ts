import type {
  BromatologicalProfile,
  ExpirationStatus,
  KineticCalculationResult,
  ThermalLog,
} from '../types/smartTag';

/**
 * Calculates the instantaneous relative deterioration rate r(T)
 * r(T) = q10_factor ** ((T - t_ref) / 10)
 */
export function calculateDeteriorationRate(
  tempCelsius: number,
  q10Factor: number,
  tRef: number = 4.0
): number {
  const exponent = (tempCelsius - tRef) / 10;
  return Math.pow(q10Factor, exponent);
}

/**
 * Calculates consumed effective hours for a specific thermal exposure block
 */
export function calculateIntervalDeduction(
  durationHours: number,
  tempCelsius: number,
  q10Factor: number,
  tRef: number = 4.0
): number {
  const rate = calculateDeteriorationRate(tempCelsius, q10Factor, tRef);
  return Number((rate * durationHours).toFixed(2));
}

/**
 * Determines expiration status based on remaining life percentage
 * Green: Seguro > 40%
 * Yellow: Consumir pronto 15% - 40%
 * Red: Peligro < 15%
 * Expired: <= 0%
 */
export function getExpirationStatus(remainingPercent: number): ExpirationStatus {
  if (remainingPercent <= 0) return 'expired';
  if (remainingPercent < 15) return 'danger';
  if (remainingPercent <= 40) return 'warning';
  return 'safe';
}

/**
 * Evaluates the full kinetic state of a Smart Tag from its thermal logs
 */
export function calculateTagKinetics(
  profile: BromatologicalProfile,
  logs: ThermalLog[]
): KineticCalculationResult {
  const tRef = profile.t_ref || 4.0;
  const q10 = profile.q10_factor || 2.2;
  const t0 = profile.t0_hours || 72;

  let totalConsumed = 0;
  let lastTemp = 4.0;

  for (const log of logs) {
    const rate = calculateDeteriorationRate(log.temp_celsius, q10, tRef);
    totalConsumed += rate * log.duration_hours;
    lastTemp = log.temp_celsius;
  }

  const remainingHours = Math.max(0, t0 - totalConsumed);
  const remainingPercent = Math.max(0, Math.min(100, (remainingHours / t0) * 100));
  const currentRate = calculateDeteriorationRate(lastTemp, q10, tRef);

  return {
    consumed_hours: Number(totalConsumed.toFixed(2)),
    remaining_hours: Number(remainingHours.toFixed(2)),
    remaining_percent: Number(remainingPercent.toFixed(1)),
    status: getExpirationStatus(remainingPercent),
    current_temp: lastTemp,
    current_rate: Number(currentRate.toFixed(2)),
  };
}

/**
 * Helper to build a new ThermalLog with correct recalculated state
 */
export function createThermalLog(
  durationHours: number,
  tempCelsius: number,
  label: string,
  profile: BromatologicalProfile,
  existingLogs: ThermalLog[]
): ThermalLog {
  const tRef = profile.t_ref || 4.0;
  const q10 = profile.q10_factor || 2.2;
  const t0 = profile.t0_hours || 72;

  // Calculate previously consumed
  let previousConsumed = 0;
  for (const log of existingLogs) {
    const r = calculateDeteriorationRate(log.temp_celsius, q10, tRef);
    previousConsumed += r * log.duration_hours;
  }

  const rate = calculateDeteriorationRate(tempCelsius, q10, tRef);
  const thisConsumed = rate * durationHours;
  const totalConsumed = previousConsumed + thisConsumed;

  const remainingHours = Math.max(0, t0 - totalConsumed);
  const remainingPercent = Math.max(0, Math.min(100, (remainingHours / t0) * 100));

  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    duration_hours: durationHours,
    temp_celsius: tempCelsius,
    label,
    consumed_hours: Number(thisConsumed.toFixed(1)),
    remaining_hours_after: Number(remainingHours.toFixed(1)),
    remaining_percent_after: Number(remainingPercent.toFixed(1)),
  };
}
