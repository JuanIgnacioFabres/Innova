import React from 'react';
import type { SmartTag } from '../types/smartTag';
import { calculateTagKinetics } from '../services/kineticModel';
import { TrafficLightBadge } from './TrafficLightBadge';
import {
  Thermometer,
  Clock,
  AlertTriangle,
  Flame,
  Snowflake,
  Radio,
  Sliders,
  Sparkles,
  Database,
} from 'lucide-react';

interface Props {
  tag: SmartTag;
  onOpenSandbox: (tag: SmartTag) => void;
  onQuickStress: (tagId: string, durationHours: number, tempCelsius: number, label: string) => void;
}

export const SmartTagCard: React.FC<Props> = ({
  tag,
  onOpenSandbox,
  onQuickStress,
}) => {
  const kinetics = calculateTagKinetics(tag.profile, tag.logs);
  const { remaining_percent, remaining_hours, status, current_temp, current_rate } = kinetics;

  // Determine progress bar gradient
  const getProgressBarColor = () => {
    if (status === 'safe') return 'from-teal-500 to-emerald-500';
    if (status === 'warning') return 'from-amber-400 to-orange-500';
    return 'from-rose-500 to-red-600';
  };

  const getBorderColor = () => {
    if (status === 'danger' || status === 'expired') {
      return 'border-rose-300 ring-2 ring-rose-200/80 shadow-rose-100';
    }
    if (status === 'warning') {
      return 'border-amber-200 shadow-amber-50';
    }
    return 'border-slate-200/90 shadow-slate-100 hover:border-teal-300';
  };

  const isCritical = status === 'danger' || status === 'expired';

  return (
    <div
      className={`bg-white rounded-2xl p-5 border transition-all duration-300 shadow-md flex flex-col justify-between relative overflow-hidden group hover:shadow-lg ${getBorderColor()}`}
    >
      {/* Top subtle highlight banner for danger */}
      {isCritical && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 animate-pulse" />
      )}

      <div>
        {/* Header: Tag ID & Traffic Light */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <Radio className="w-3.5 h-3.5 text-teal-600" />
              {tag.id}
            </span>

            {tag.source === 'ai_gemini' ? (
              <span
                title="Parámetros extraídos mediante IA (Gemini 1.5 Flash)"
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                IA
              </span>
            ) : (
              <span
                title="Bromatología certificada offline"
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200"
              >
                <Database className="w-3 h-3 text-slate-500" />
                Base
              </span>
            )}
          </div>

          <TrafficLightBadge status={status} percent={remaining_percent} size="md" />
        </div>

        {/* Food Name & Category */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
            {tag.profile.food_name}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {tag.profile.category} • Base: {tag.profile.t0_hours}h a 4 °C (Q₁₀ ={' '}
            {tag.profile.q10_factor})
          </p>
        </div>

        {/* Remaining Shelf Life Display */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Vida Útil Restante:
            </span>
            <span
              className={`text-sm font-bold font-mono ${
                status === 'safe'
                  ? 'text-teal-700'
                  : status === 'warning'
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {remaining_hours > 0 ? `${remaining_hours.toFixed(2)} hrs` : 'Expirado'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${getProgressBarColor()}`}
              style={{ width: `${Math.max(3, remaining_percent)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
            <span>0% (Peligro)</span>
            <span>15%</span>
            <span>40%</span>
            <span>100% (Óptimo)</span>
          </div>
        </div>

        {/* Badges: Pathogen & Current Temperature */}
        <div className="space-y-2 mb-4">
          {/* Critical Hazard */}
          <div className="flex items-start gap-1.5 text-xs bg-rose-50/60 border border-rose-100 rounded-lg p-2 text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-rose-700">Riesgo crítico: </span>
              <span className="text-[11px] text-rose-800">{tag.profile.critical_hazard}</span>
            </div>
          </div>

          {/* Current Temp and Kinetic Rate */}
          <div className="flex items-center justify-between text-xs bg-slate-50 rounded-lg p-2 border border-slate-200/60 font-mono">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Thermometer
                className={`w-4 h-4 ${
                  current_temp > 10 ? 'text-rose-500' : 'text-teal-500'
                }`}
              />
              Sensor: <strong className="text-slate-900">{current_temp.toFixed(1)} °C</strong>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="Monitoreo en vivo activo" />
            </span>
            <span className="text-[11px] text-slate-500">
              r(T): <strong className="text-slate-800">{current_rate.toFixed(2)}x</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-2">
          {/* Quick Location Action Button */}
          {current_temp > 6 ? (
            <button
              onClick={() =>
                onQuickStress(
                  tag.id,
                  0.001,
                  4.0,
                  'Guardado nuevamente en refrigerador (4.0 °C)'
                )
              }
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors active:scale-95"
              title="Coloca el táper a 4 °C para detener el envejecimiento acelerado"
            >
              <Snowflake className="w-3.5 h-3.5 text-teal-600" />
              Meter al Refri (4°C)
            </button>
          ) : (
            <button
              onClick={() =>
                onQuickStress(
                  tag.id,
                  2.0,
                  22.0,
                  'Simulación rápida: 2h en el mesón a 22 °C'
                )
              }
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors active:scale-95"
              title="Aplica 2 horas a 22 °C para ver el aceleramiento térmico"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              +2h Mesón (22°C)
            </button>
          )}

          {/* Open full sandbox */}
          <button
            onClick={() => onOpenSandbox(tag)}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors active:scale-95 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            Ver Sandbox
          </button>
        </div>
      </div>
    </div>
  );
};
