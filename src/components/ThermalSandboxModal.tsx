import React, { useState } from 'react';
import type { SmartTag } from '../types/smartTag';
import {
  calculateTagKinetics,
  calculateDeteriorationRate,
  createThermalLog,
} from '../services/kineticModel';
import { TrafficLightBadge } from './TrafficLightBadge';
import { ThermalChart } from './ThermalChart';
import {
  X,
  Flame,
  Snowflake,
  ZapOff,
  DoorOpen,
  RotateCcw,
  Undo2,
  Sliders,
  ShieldAlert,
  Info,
  Clock,
  Thermometer,
  ListOrdered,
  PlusCircle,
  Radio,
  Sparkles,
} from 'lucide-react';

interface Props {
  tag: SmartTag | null;
  onClose: () => void;
  onUpdateTag: (updatedTag: SmartTag) => void;
  onDeleteTag: (tagId: string) => void;
}

export const ThermalSandboxModal: React.FC<Props> = ({
  tag,
  onClose,
  onUpdateTag,
  onDeleteTag,
}) => {
  if (!tag) return null;

  const kinetics = calculateTagKinetics(tag.profile, tag.logs);
  const { remaining_percent, remaining_hours, consumed_hours, status, current_temp } = kinetics;

  // Manual injector state
  const [customHours, setCustomHours] = useState<number>(3);
  const [customTemp, setCustomTemp] = useState<number>(18);
  const [customLabel, setCustomLabel] = useState<string>('Exposición manual en tránsito');

  // Slider for real-time live r(T) preview
  const [liveTestTemp, setLiveTestTemp] = useState<number>(current_temp || 4.0);
  const liveRate = calculateDeteriorationRate(
    liveTestTemp,
    tag.profile.q10_factor,
    tag.profile.t_ref
  );

  // Apply scenario helper
  const applyExposure = (durationHours: number, tempCelsius: number, label: string) => {
    const newLog = createThermalLog(
      durationHours,
      tempCelsius,
      label,
      tag.profile,
      tag.logs
    );
    const updatedTag: SmartTag = {
      ...tag,
      logs: [...tag.logs, newLog],
    };
    onUpdateTag(updatedTag);
  };

  // Reset to initial t=0 state
  const resetLogs = () => {
    const updatedTag: SmartTag = {
      ...tag,
      logs: [],
    };
    onUpdateTag(updatedTag);
  };

  // Undo last simulated event
  const undoLastLog = () => {
    if (tag.logs.length === 0) return;
    const updatedTag: SmartTag = {
      ...tag,
      logs: tag.logs.slice(0, -1),
    };
    onUpdateTag(updatedTag);
  };

  // Immediate sensor temperature switch without advancing clock hours
  const setSensorTempInstant = (tempCelsius: number, label: string) => {
    const newLog = createThermalLog(
      0.001,
      tempCelsius,
      label,
      tag.profile,
      tag.logs
    );
    const updatedTag: SmartTag = {
      ...tag,
      logs: [...tag.logs, newLog],
    };
    onUpdateTag(updatedTag);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-bold border border-slate-700">
                  {tag.id}
                </span>
                <span className="text-xs text-slate-400 font-mono">UID: {tag.nfcUid}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                {tag.profile.food_name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrafficLightBadge status={status} percent={remaining_percent} size="md" />
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Vida Útil Restante
              </div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {remaining_hours}h <span className="text-xs text-slate-400 font-normal">/ {tag.profile.t0_hours}h</span>
              </div>
              <div className="text-[10px] text-teal-600 font-medium mt-0.5">
                {remaining_percent}% disponible
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-1">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                Desgaste Acumulado
              </div>
              <div className="text-lg font-bold font-mono text-rose-700">
                {consumed_hours}h
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Descontadas por temperatura
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                Última Temperatura
              </div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {current_temp.toFixed(1)} °C
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Sensor No-Loss Tag
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-1">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                Factor Cinético Q₁₀
              </div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {tag.profile.q10_factor.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                T_ref: {tag.profile.t_ref} °C
              </div>
            </div>
          </div>

          {/* Section 1: AI Bromatological Profile Sheet */}
          <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Ficha Técnica Bromatológica (Directrices USDA / FDA)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                Categoría: {tag.profile.category}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-rose-700">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  Riesgo Patógeno Crítico:
                </div>
                <div className="text-slate-800 font-medium">
                  {tag.profile.critical_hazard}
                </div>
                <p className="text-[11px] text-slate-500">
                  Microorganismo de referencia para la estimación de la cinética de degradación.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-teal-800">
                  <Info className="w-4 h-4 text-teal-600 shrink-0" />
                  Consejo Práctico de Conservación:
                </div>
                <div className="text-slate-800 font-medium">
                  {tag.profile.conservation_tip}
                </div>
              </div>
            </div>

            {tag.profile.ingredients && tag.profile.ingredients.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Ingredientes perecibles analizados por la IA:
                </span>
                <div className="flex flex-wrap gap-1">
                  {tag.profile.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-medium"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Real-time kinetic rate slider */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-400" />
                  Simulador Cinético Instantáneo r(T)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Mueve el control deslizante para calcular la tasa de aceleración de este plato en tiempo real
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-300">Temp:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {liveTestTemp > 0 ? `+${liveTestTemp}` : liveTestTemp} °C
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-300">Tasa:</span>
                <span className="font-mono font-bold text-teal-300 text-sm">
                  {liveRate.toFixed(2)}x
                </span>
              </div>
            </div>

            <input
              type="range"
              min="-2"
              max="30"
              step="1"
              value={liveTestTemp}
              onChange={(e) => setLiveTestTemp(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 mb-2"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-3">
              <span>-2 °C (Congelador)</span>
              <span>4 °C (Refrigeración estándar)</span>
              <span>12 °C (Alza leve)</span>
              <span>22 °C (Mesón de cocina)</span>
              <span>30 °C (Verano)</span>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs text-slate-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-400 shrink-0" />
              <span>
                Con un factor Q₁₀ = {tag.profile.q10_factor.toFixed(2)}, cada 1 hora a{' '}
                <strong className="text-white">{liveTestTemp} °C</strong> equivale a{' '}
                <strong className="text-teal-300">{liveRate.toFixed(2)} horas</strong> de envejecimiento dentro del refrigerador normal (4 °C).
              </span>
            </div>
          </div>

          {/* Section 2.5: Immediate Location Switcher (No time advance) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Thermometer className="w-4 h-4 text-teal-600" />
                Ubicación Actual del Táper (Cambio Inmediato de Temperatura)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Sensor actual: <strong className="text-slate-900">{current_temp.toFixed(1)} °C</strong>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Cambia dónde se encuentra el alimento ahora mismo sin forzar el paso de horas ficticias:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSensorTempInstant(4.0, 'Ubicado dentro del refrigerador (4.0 °C)')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  current_temp <= 4.5
                    ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Snowflake className="w-3.5 h-3.5" />
                En Refrigerador (4.0 °C)
              </button>
              <button
                type="button"
                onClick={() => setSensorTempInstant(22.0, 'Dejado en el mesón de cocina (22.0 °C)')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  current_temp >= 20
                    ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                En el Mesón (22.0 °C)
              </button>
              <button
                type="button"
                onClick={() => setSensorTempInstant(12.0, 'Zona templada / Corte de energía (12.0 °C)')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  current_temp > 4.5 && current_temp < 20
                    ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <DoorOpen className="w-3.5 h-3.5" />
                Zona Templada (12.0 °C)
              </button>
            </div>
          </div>

          {/* Section 3: Quick simulation buttons (Time advancing scenarios) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Simular Paso del Tiempo en el Reloj (Avances de Horas)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Simula que transcurren bloques adicionales de tiempo para evaluar el desgaste futuro:
                </p>
              </div>
              <div className="flex items-center gap-3">
                {tag.logs.length > 0 && (
                  <button
                    type="button"
                    onClick={undoLastLog}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold hover:underline"
                    title="Deshace el último evento térmico registrado"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    Deshacer último evento
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetLogs}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium hover:underline"
                  title="Elimina todos los logs y devuelve la vida útil al 100%"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reiniciar a t=0
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Scenario 1: Olvido en mesón */}
              <button
                type="button"
                onClick={() =>
                  applyExposure(
                    2.0,
                    22.0,
                    'Se quedó 2 horas en el mesón de cocina (22 °C)'
                  )
                }
                className="flex flex-col p-3 rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/90 text-left transition-all active:scale-95 group"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-amber-900 mb-1">
                  <Flame className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                  Pasar 2h en Mesón
                </div>
                <div className="text-[11px] text-amber-800 font-mono font-semibold">
                  Avanzar 2h a 22 °C
                </div>
                <div className="text-[10px] text-amber-700 mt-1">
                  Envejece ~{(2.0 * calculateDeteriorationRate(22, tag.profile.q10_factor)).toFixed(1)}h efectivas
                </div>
              </button>

              {/* Scenario 2: Corte de luz */}
              <button
                type="button"
                onClick={() =>
                  applyExposure(
                    6.0,
                    10.0,
                    'Corte de energía / Alza a 10 °C por 6 horas'
                  )
                }
                className="flex flex-col p-3 rounded-2xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/90 text-left transition-all active:scale-95 group"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-rose-900 mb-1">
                  <ZapOff className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
                  Pasar 6h Corte Luz
                </div>
                <div className="text-[11px] text-rose-800 font-mono font-semibold">
                  Avanzar 6h a 10 °C
                </div>
                <div className="text-[10px] text-rose-700 mt-1">
                  Envejece ~{(6.0 * calculateDeteriorationRate(10, tag.profile.q10_factor)).toFixed(1)}h efectivas
                </div>
              </button>

              {/* Scenario 3: Almacenado en refri */}
              <button
                type="button"
                onClick={() =>
                  applyExposure(
                    12.0,
                    3.0,
                    'Almacenado 12 horas dentro del refrigerador a 3 °C'
                  )
                }
                className="flex flex-col p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/90 text-left transition-all active:scale-95 group"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 mb-1">
                  <Snowflake className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  Pasar 12h en Refri
                </div>
                <div className="text-[11px] text-emerald-800 font-mono font-semibold">
                  Avanzar 12h a 3 °C
                </div>
                <div className="text-[10px] text-emerald-700 mt-1">
                  Envejece ~{(12.0 * calculateDeteriorationRate(3, tag.profile.q10_factor)).toFixed(1)}h (conservación ideal)
                </div>
              </button>

              {/* Scenario 4: Puerta abierta */}
              <button
                type="button"
                onClick={() =>
                  applyExposure(
                    3.0,
                    15.0,
                    'Puerta abierta o almacenamiento en puerta (15 °C por 3h)'
                  )
                }
                className="flex flex-col p-3 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/90 text-left transition-all active:scale-95 group"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-blue-900 mb-1">
                  <DoorOpen className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  Pasar 3h Puerta Abierta
                </div>
                <div className="text-[11px] text-blue-800 font-mono font-semibold">
                  Avanzar 3h a 15 °C
                </div>
                <div className="text-[10px] text-blue-700 mt-1">
                  Envejece ~{(3.0 * calculateDeteriorationRate(15, tag.profile.q10_factor)).toFixed(1)}h efectivas
                </div>
              </button>
            </div>

            {/* Educational reminder */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Principio de Seguridad Alimentaria:</strong> El frío del refrigerador <u>frena la velocidad de deterioro futuro</u> ($r(4) = 1.0\times$), pero <u>no rejuvenece ni recupera</u> la vida útil ya consumida por proliferación bacteriana previa.
              </div>
            </div>
          </div>

          {/* Section 4: Custom exposure injector */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-teal-600" />
              Inyección Térmica Personalizada
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Horas de exposición (Δt)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="48"
                  step="0.5"
                  value={customHours}
                  onChange={(e) => setCustomHours(parseFloat(e.target.value) || 1)}
                  className="w-full text-xs rounded-xl border-slate-300 p-2 border bg-white focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Temperatura (°C)
                </label>
                <input
                  type="number"
                  min="-10"
                  max="40"
                  step="0.5"
                  value={customTemp}
                  onChange={(e) => setCustomTemp(parseFloat(e.target.value) || 4)}
                  className="w-full text-xs rounded-xl border-slate-300 p-2 border bg-white focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Descripción del evento
                </label>
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Ej: Viaje en auto"
                  className="w-full text-xs rounded-xl border-slate-300 p-2 border bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <button
                  onClick={() => {
                    applyExposure(customHours, customTemp, customLabel);
                    setCustomLabel('Exposición térmica manual');
                  }}
                  className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                >
                  Aplicar al Sensor
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Recharts Interactive Curve */}
          <div>
            <ThermalChart profile={tag.profile} logs={tag.logs} />
          </div>

          {/* Section 6: Thermal Logs History Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-slate-600" />
                Historial de Registro Térmico del Sensor ({tag.logs.length} eventos)
              </h4>
              <span className="text-[11px] text-slate-500">
                Total acumulado: {tag.logs.reduce((acc, l) => acc + l.duration_hours, 0)} horas reales
              </span>
            </div>

            {tag.logs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No hay eventos registrados. La comida está en su estado fresco inicial (100%).
              </div>
            ) : (
              <div className="overflow-x-auto max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Evento</th>
                      <th className="p-2.5">Duración (Δt)</th>
                      <th className="p-2.5">Temp</th>
                      <th className="p-2.5">Tasa r(T)</th>
                      <th className="p-2.5">Consumo</th>
                      <th className="p-2.5">Vida Restante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {tag.logs.map((log, idx) => {
                      const r = calculateDeteriorationRate(
                        log.temp_celsius,
                        tag.profile.q10_factor,
                        tag.profile.t_ref
                      );
                      return (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-sans font-medium text-slate-800 max-w-[180px] truncate">
                            {log.label}
                          </td>
                          <td className="p-2.5 text-slate-700">{log.duration_hours} h</td>
                          <td className="p-2.5">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold ${
                                log.temp_celsius > 15
                                  ? 'bg-rose-100 text-rose-800'
                                  : log.temp_celsius > 6
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {log.temp_celsius} °C
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-600">{r.toFixed(2)}x</td>
                          <td className="p-2.5 text-rose-600 font-bold">
                            -{log.consumed_hours} h
                          </td>
                          <td className="p-2.5 text-teal-700 font-bold">
                            {log.remaining_percent_after}% ({log.remaining_hours_after}h)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm(`¿Seguro que deseas desvincular y eliminar el ${tag.id}?`)) {
                onDeleteTag(tag.id);
                onClose();
              }
            }}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors"
          >
            Desvincular No-Loss Tag
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
