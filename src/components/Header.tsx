import React from 'react';
import {
  Refrigerator,
  Radio,
  Thermometer,
  ShieldAlert,
  RotateCcw,
  Play,
  Pause,
} from 'lucide-react';

interface Props {
  totalTags: number;
  criticalCount: number;
  onOpenNewTagModal: () => void;
  onResetSeedData: () => void;
  isSimRunning: boolean;
  onToggleSim: () => void;
  simSpeed: number;
  onChangeSimSpeed: (speed: number) => void;
}

export const Header: React.FC<Props> = ({
  totalTags,
  criticalCount,
  onOpenNewTagModal,
  onResetSeedData,
  isSimRunning,
  onToggleSim,
  simSpeed,
  onChangeSimSpeed,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-teal-600 to-cyan-500 text-white rounded-2xl shadow-md shadow-teal-500/20">
              <Refrigerator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight my-0">
                  No-Loss <span className="text-teal-600">Tag</span>
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                  v2.0 Híbrido
                </span>
              </div>
              <p className="text-xs text-slate-500">
                IA Bromatológica (LLM) + Cinética Predictiva en Cliente ($Q_{10}$)
              </p>
            </div>
          </div>

          {/* Quick Metrics, Simulator Clock & Actions */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
            {/* Live Simulation Clock Widget */}
            <div
              className={`flex items-center gap-1.5 p-1 rounded-xl border transition-all ${
                isSimRunning
                  ? 'bg-teal-50/70 border-teal-200'
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={onToggleSim}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 ${
                  isSimRunning
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
                title={
                  isSimRunning
                    ? 'Pausar avance continuo de tiempo'
                    : 'Reanudar avance continuo de tiempo'
                }
              >
                {isSimRunning ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                    <Pause className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-mono">En Vivo</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span className="text-[11px] font-mono">Pausado</span>
                  </>
                )}
              </button>

              <select
                value={simSpeed}
                onChange={(e) => onChangeSimSpeed(Number(e.target.value))}
                className="bg-transparent text-[11px] font-mono font-bold text-slate-700 border-none focus:ring-0 cursor-pointer pr-1 py-1"
                title="Velocidad de paso del tiempo simulado"
              >
                <option value={1}>1x (Real)</option>
                <option value={60}>60x (1s = 1m)</option>
                <option value={180}>180x (1s = 3m)</option>
                <option value={600}>600x (1s = 10m)</option>
                <option value={3600}>3600x (1s = 1h)</option>
              </select>
            </div>

            {/* Active Tags Badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-semibold border border-slate-200"
              title="Total de No-Loss Tags activos en el refrigerador"
            >
              <span>{totalTags} Tápers</span>
            </div>

            {/* Fridge Temp Indicator */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-semibold border border-slate-200"
              title="Temperatura nominal del refrigerador"
            >
              <Thermometer className="w-3.5 h-3.5 text-cyan-600" />
              <span>4.0 °C</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Critical alert pill if any */}
            {criticalCount > 0 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 animate-pulse"
                title="Platos con vida útil menor al 15%"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>{criticalCount} en riesgo</span>
              </div>
            )}

            {/* Reset data demo button */}
            <button
              onClick={onResetSeedData}
              title="Restablecer datos demo iniciales"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Primary Action: Simular Toque NFC */}
            <button
              onClick={onOpenNewTagModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-700/20 transition-all active:scale-95"
            >
              <Radio className="w-4 h-4 text-teal-200 animate-pulse" />
              <span>Toque NFC (+ Nuevo Tag)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
