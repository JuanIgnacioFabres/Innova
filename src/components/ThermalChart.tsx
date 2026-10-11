import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { BromatologicalProfile, ThermalLog } from '../types/smartTag';
import { calculateDeteriorationRate } from '../services/kineticModel';

interface Props {
  profile: BromatologicalProfile;
  logs: ThermalLog[];
}

export const ThermalChart: React.FC<Props> = ({ profile, logs }) => {
  // Build time-series points
  const q10 = profile.q10_factor || 2.2;
  const tRef = profile.t_ref || 4.0;
  const t0 = profile.t0_hours || 72;

  // Initial t=0 point
  const chartData = [
    {
      hour: 0,
      hourLabel: 'Inicio',
      temp: 4.0,
      remainingPercent: 100,
      remainingHours: t0,
      rate: 1.0,
      label: 'Preparación / Enfriamiento',
    },
  ];

  let cumulativeHours = 0;
  let cumulativeConsumed = 0;

  logs.forEach((log, index) => {
    cumulativeHours += log.duration_hours;
    const rate = calculateDeteriorationRate(log.temp_celsius, q10, tRef);
    const intervalConsumed = rate * log.duration_hours;
    cumulativeConsumed += intervalConsumed;
    const remainingHours = Math.max(0, t0 - cumulativeConsumed);
    const remainingPercent = Math.max(0, Math.min(100, (remainingHours / t0) * 100));

    chartData.push({
      hour: Number(cumulativeHours.toFixed(1)),
      hourLabel: `+${cumulativeHours.toFixed(1)}h`,
      temp: log.temp_celsius,
      remainingPercent: Number(remainingPercent.toFixed(1)),
      remainingHours: Number(remainingHours.toFixed(1)),
      rate: Number(rate.toFixed(2)),
      label: log.label || `Intervalo #${index + 1}`,
    });
  });

  return (
    <div className="w-full bg-slate-900 rounded-xl p-4 border border-slate-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-slate-200">
            Curva de Desgaste Microbiológico vs. Temperatura
          </h4>
          <p className="text-[11px] text-slate-400">
            Evolución de la vida útil restante según el perfil de temperatura registrado
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-teal-300">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> Vida Útil (%)
          </span>
          <span className="flex items-center gap-1.5 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Temperatura (°C)
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="remainingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
            <XAxis
              dataKey="hourLabel"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
            />
            {/* Left Y Axis for Remaining % */}
            <YAxis
              yAxisId="left"
              domain={[0, 100]}
              stroke="#14b8a6"
              fontSize={11}
              tickFormatter={(v) => `${v}%`}
            />
            {/* Right Y Axis for Temperature in °C */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[-5, 30]}
              stroke="#f59e0b"
              fontSize={11}
              tickFormatter={(v) => `${v}°`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-xl text-xs text-white max-w-xs">
                      <div className="font-bold text-teal-300 mb-1 border-b border-slate-800 pb-1">
                        {data.label} ({data.hourLabel})
                      </div>
                      <div className="space-y-1 font-mono text-[11px]">
                        <div className="flex justify-between text-amber-300">
                          <span>Temperatura:</span>
                          <span className="font-bold">{data.temp} °C</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Tasa cinética r(T):</span>
                          <span>{data.rate}x</span>
                        </div>
                        <div className="flex justify-between text-teal-300 pt-1 border-t border-slate-800">
                          <span>Vida Útil Restante:</span>
                          <span className="font-bold">
                            {data.remainingPercent}% ({data.remainingHours}h)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend verticalAlign="top" height={0} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="remainingPercent"
              name="Vida Útil Restante"
              stroke="#14b8a6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#remainingGrad)"
            />
            <Line
              yAxisId="right"
              type="stepAfter"
              dataKey="temp"
              name="Temperatura (°C)"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 4, fill: '#f59e0b' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
