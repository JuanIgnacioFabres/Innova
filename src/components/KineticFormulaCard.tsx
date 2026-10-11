import React, { useState } from 'react';
import { calculateDeteriorationRate } from '../services/kineticModel';
import { Calculator, Flame, Snowflake, Info } from 'lucide-react';

interface Props {
  q10Factor?: number;
  tRef?: number;
}

export const KineticFormulaCard: React.FC<Props> = ({ q10Factor = 2.2, tRef = 4.0 }) => {
  const [testTemp, setTestTemp] = useState<number>(22);
  const rate = calculateDeteriorationRate(testTemp, q10Factor, tRef);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 shadow-xl border border-slate-700/60 relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-500/20 text-teal-300 rounded-lg">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-white flex items-center gap-2">
              Modelo Microbiológico Determinista
              <span className="text-[10px] tracking-wide uppercase px-2 py-0.5 bg-teal-950 text-teal-300 border border-teal-700/50 rounded-full">
                Frontend Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Tasa de deterioro instantáneo basada en cinética $Q_{10}$
            </p>
          </div>
        </div>
      </div>

      {/* Formula Display */}
      <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 mb-4 font-mono text-center">
        <div className="text-xs text-slate-400 mb-1">Ecuación cinética predictiva:</div>
        <div className="text-sm sm:text-base text-teal-300 font-bold tracking-wider">
          r(T) = Q₁₀^((T - T_ref) / 10)
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex justify-center gap-4">
          <span>Q₁₀ = {q10Factor.toFixed(1)}</span>
          <span>•</span>
          <span>T_ref = {tRef.toFixed(1)} °C (Refrigeración estándar)</span>
        </div>
      </div>

      {/* Interactive live test slider */}
      <div className="space-y-3 bg-slate-800/40 rounded-xl p-3 border border-slate-700/40">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            {testTemp <= 4 ? (
              <Snowflake className="w-4 h-4 text-cyan-400" />
            ) : (
              <Flame className="w-4 h-4 text-amber-400" />
            )}
            Probar Temperatura de Simulación:
          </span>
          <span className="font-mono text-base font-bold text-white px-2.5 py-0.5 rounded bg-slate-700/80">
            {testTemp > 0 ? `+${testTemp}` : testTemp} °C
          </span>
        </div>

        <input
          type="range"
          min="-5"
          max="35"
          step="1"
          value={testTemp}
          onChange={(e) => setTestTemp(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>-5 °C (Freezer)</span>
          <span>4 °C (Óptimo)</span>
          <span>15 °C (Templado)</span>
          <span>22 °C (Mesón)</span>
          <span>35 °C (Calor)</span>
        </div>

        {/* Live Calculation Output */}
        <div className="pt-2 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-baseline gap-2">
            <span className="text-slate-400">Tasa de deterioro r(T):</span>
            <span
              className={`font-mono font-extrabold text-lg ${
                rate > 3
                  ? 'text-rose-400'
                  : rate > 1.2
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {rate.toFixed(2)}x
            </span>
          </div>

          <div className="text-[11px] text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700/60 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>
              1 hora real a {testTemp} °C descuenta{' '}
              <strong className="text-teal-300 font-mono">{rate.toFixed(2)} h</strong> de
              refrigeración base.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
