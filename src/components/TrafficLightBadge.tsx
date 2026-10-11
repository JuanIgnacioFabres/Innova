import React from 'react';
import type { ExpirationStatus } from '../types/smartTag';
import { CheckCircle2, AlertTriangle, AlertOctagon, XCircle } from 'lucide-react';

interface Props {
  status: ExpirationStatus;
  percent: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TrafficLightBadge: React.FC<Props> = ({
  status,
  percent,
  showIcon = true,
  size = 'md',
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'safe':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
          label: 'Seguro',
          subLabel: '> 40% vida útil',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          icon: AlertTriangle,
          label: 'Consumir Pronto',
          subLabel: '15% - 40% vida útil',
        };
      case 'danger':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200 ring-2 ring-rose-300 ring-offset-1',
          dot: 'bg-rose-500 animate-ping-slow',
          icon: AlertOctagon,
          label: 'Peligro Crítico',
          subLabel: '< 15% vida útil',
        };
      case 'expired':
      default:
        return {
          bg: 'bg-red-100 text-red-900 border-red-300 ring-2 ring-red-400',
          dot: 'bg-red-600',
          icon: XCircle,
          label: 'Caducado',
          subLabel: 'Riesgo microbiológico severo',
        };
    }
  };

  const config = getBadgeConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all duration-300 shadow-sm ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {showIcon && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      <span>{config.label}</span>
      <span className="opacity-80 font-mono font-bold">({percent}%)</span>
    </span>
  );
};
