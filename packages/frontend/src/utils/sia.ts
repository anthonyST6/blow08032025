// SIA (Security, Integrity, Accuracy) utility functions and constants

export type SIAMetricType = 'security' | 'integrity' | 'accuracy';

export const SIA_COLORS = {
  security: {
    text: 'text-vanguard-security',
    bg: 'bg-vanguard-security',
    border: 'border-vanguard-security',
    glow: 'shadow-glow-blue',
    hex: '#3B82F6', // blue-500
  },
  integrity: {
    text: 'text-vanguard-integrity',
    bg: 'bg-vanguard-integrity',
    border: 'border-vanguard-integrity',
    glow: 'shadow-glow-red',
    hex: '#EF4444', // red-500
  },
  accuracy: {
    text: 'text-vanguard-accuracy',
    bg: 'bg-vanguard-accuracy',
    border: 'border-vanguard-accuracy',
    glow: 'shadow-glow-green',
    hex: '#10B981', // green-500
  },
};

export const SIA_COMPONENT_STYLES = {
  card: {
    security: 'bg-vanguard-security/10 border-vanguard-security/30 hover:border-vanguard-security/50 hover:shadow-glow-blue',
    integrity: 'bg-vanguard-integrity/10 border-vanguard-integrity/30 hover:border-vanguard-integrity/50 hover:shadow-glow-red',
    accuracy: 'bg-vanguard-accuracy/10 border-vanguard-accuracy/30 hover:border-vanguard-accuracy/50 hover:shadow-glow-green',
  },
  badge: {
    security: 'bg-vanguard-security/20 text-vanguard-security border-vanguard-security/30',
    integrity: 'bg-vanguard-integrity/20 text-vanguard-integrity border-vanguard-integrity/30',
    accuracy: 'bg-vanguard-accuracy/20 text-vanguard-accuracy border-vanguard-accuracy/30',
  },
  indicator: {
    security: 'bg-vanguard-security animate-pulse-blue',
    integrity: 'bg-vanguard-integrity animate-pulse-red',
    accuracy: 'bg-vanguard-accuracy animate-pulse-green',
  },
};

export function getSIAClass(metric: SIAMetricType, type: 'text' | 'bg' | 'border' | 'glow'): string {
  return SIA_COLORS[metric][type];
}

export function getSIAComponentClass(metric: SIAMetricType, component: 'card' | 'badge' | 'indicator'): string {
  return SIA_COMPONENT_STYLES[component][metric];
}

export function getSIAStatus(value: number): 'optimal' | 'warning' | 'critical' {
  if (value >= 90) return 'optimal';
  if (value >= 70) return 'warning';
  return 'critical';
}

export function getSIAStatusColor(status: 'optimal' | 'warning' | 'critical'): string {
  switch (status) {
    case 'optimal':
      return 'text-green-400';
    case 'warning':
      return 'text-yellow-400';
    case 'critical':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

export function formatSIAValue(value: number, decimals: number = 0): string {
  return value.toFixed(decimals) + '%';
}

export function calculateOverallSIA(security: number, integrity: number, accuracy: number): number {
  // Weighted average: Security (40%), Integrity (35%), Accuracy (25%)
  return (security * 0.4) + (integrity * 0.35) + (accuracy * 0.25);
}

export function getSIAGradient(metric: SIAMetricType): string {
  switch (metric) {
    case 'security':
      return 'from-blue-600 to-blue-400';
    case 'integrity':
      return 'from-red-600 to-red-400';
    case 'accuracy':
      return 'from-green-600 to-green-400';
    default:
      return 'from-gray-600 to-gray-400';
  }
}

export function getSIAIcon(metric: SIAMetricType): string {
  switch (metric) {
    case 'security':
      return 'ShieldCheckIcon';
    case 'integrity':
      return 'LockClosedIcon';
    case 'accuracy':
      return 'BeakerIcon';
    default:
      return 'QuestionMarkCircleIcon';
  }
}

// Animation classes for SIA metrics
export const SIA_ANIMATIONS = {
  pulse: {
    security: 'animate-pulse-blue',
    integrity: 'animate-pulse-red',
    accuracy: 'animate-pulse-green',
  },
  glow: {
    security: 'animate-glow-blue',
    integrity: 'animate-glow-red',
    accuracy: 'animate-glow-green',
  },
  float: {
    security: 'animate-float-blue',
    integrity: 'animate-float-red',
    accuracy: 'animate-float-green',
  },
};

export function getSIAAnimation(metric: SIAMetricType, animation: 'pulse' | 'glow' | 'float'): string {
  return SIA_ANIMATIONS[animation][metric];
}