/**
 * Premium UI Effects Utilities
 * Provides advanced visual effects for the Seraphim Vanguards platform
 */

import { type ClassValue } from 'clsx';

/**
 * Glow Effects
 */
export const glowEffects = {
  // Seraphim Gold Glow
  gold: {
    sm: 'shadow-[0_0_10px_rgba(212,175,55,0.5)]',
    md: 'shadow-[0_0_20px_rgba(212,175,55,0.6)]',
    lg: 'shadow-[0_0_30px_rgba(212,175,55,0.7)]',
    xl: 'shadow-[0_0_40px_rgba(212,175,55,0.8)]',
  },
  // Vanguard Blue Glow
  blue: {
    sm: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]',
    md: 'shadow-[0_0_20px_rgba(59,130,246,0.6)]',
    lg: 'shadow-[0_0_30px_rgba(59,130,246,0.7)]',
    xl: 'shadow-[0_0_40px_rgba(59,130,246,0.8)]',
  },
  // Vanguard Red Glow
  red: {
    sm: 'shadow-[0_0_10px_rgba(239,68,68,0.5)]',
    md: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]',
    lg: 'shadow-[0_0_30px_rgba(239,68,68,0.7)]',
    xl: 'shadow-[0_0_40px_rgba(239,68,68,0.8)]',
  },
  // Vanguard Green Glow
  green: {
    sm: 'shadow-[0_0_10px_rgba(16,185,129,0.5)]',
    md: 'shadow-[0_0_20px_rgba(16,185,129,0.6)]',
    lg: 'shadow-[0_0_30px_rgba(16,185,129,0.7)]',
    xl: 'shadow-[0_0_40px_rgba(16,185,129,0.8)]',
  },
  // Multi-color SIA Glow
  sia: 'shadow-[0_0_20px_rgba(59,130,246,0.4),0_0_20px_rgba(239,68,68,0.4),0_0_20px_rgba(16,185,129,0.4)]',
};

/**
 * Gradient Effects
 */
export const gradientEffects = {
  // Metallic Gradients
  goldMetallic: 'bg-gradient-to-br from-yellow-300 via-seraphim-gold to-yellow-700',
  silverMetallic: 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600',
  bronzeMetallic: 'bg-gradient-to-br from-orange-400 via-orange-600 to-orange-800',
  
  // SIA Gradients
  siaHorizontal: 'bg-gradient-to-r from-vanguard-blue via-vanguard-red to-vanguard-green',
  siaVertical: 'bg-gradient-to-b from-vanguard-blue via-vanguard-red to-vanguard-green',
  siaDiagonal: 'bg-gradient-to-br from-vanguard-blue via-vanguard-red to-vanguard-green',
  siaRadial: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-vanguard-blue via-vanguard-red to-vanguard-green',
  
  // Premium Background Gradients
  darkGold: 'bg-gradient-to-br from-seraphim-black via-gray-900 to-seraphim-gold/20',
  darkBlue: 'bg-gradient-to-br from-seraphim-black via-gray-900 to-vanguard-blue/20',
  darkRed: 'bg-gradient-to-br from-seraphim-black via-gray-900 to-vanguard-red/20',
  darkGreen: 'bg-gradient-to-br from-seraphim-black via-gray-900 to-vanguard-green/20',
  
  // Text Gradients
  textGold: 'bg-gradient-to-r from-yellow-300 to-seraphim-gold bg-clip-text text-transparent',
  textSIA: 'bg-gradient-to-r from-vanguard-blue via-vanguard-red to-vanguard-green bg-clip-text text-transparent',
};

/**
 * Glass Morphism Effects
 */
export const glassEffects = {
  light: 'backdrop-blur-sm bg-white/10 border border-white/20',
  medium: 'backdrop-blur-md bg-white/10 border border-white/20',
  heavy: 'backdrop-blur-lg bg-white/10 border border-white/20',
  dark: 'backdrop-blur-md bg-black/30 border border-white/10',
  colored: {
    gold: 'backdrop-blur-md bg-seraphim-gold/10 border border-seraphim-gold/20',
    blue: 'backdrop-blur-md bg-vanguard-blue/10 border border-vanguard-blue/20',
    red: 'backdrop-blur-md bg-vanguard-red/10 border border-vanguard-red/20',
    green: 'backdrop-blur-md bg-vanguard-green/10 border border-vanguard-green/20',
  },
};

/**
 * Metallic Surface Effects
 */
export const metallicEffects = {
  gold: 'bg-gradient-to-br from-yellow-300/90 via-seraphim-gold to-yellow-700/90 shadow-inner',
  silver: 'bg-gradient-to-br from-gray-300/90 via-gray-400 to-gray-600/90 shadow-inner',
  bronze: 'bg-gradient-to-br from-orange-400/90 via-orange-600 to-orange-800/90 shadow-inner',
  platinum: 'bg-gradient-to-br from-gray-100/90 via-gray-200 to-gray-400/90 shadow-inner',
};

/**
 * Animation Classes
 */
export const animationClasses = {
  // Pulse Effects
  pulseSlow: 'animate-pulse-slow',
  pulseGold: 'animate-pulse-gold',
  pulseBlue: 'animate-pulse-blue',
  pulseRed: 'animate-pulse-red',
  pulseGreen: 'animate-pulse-green',
  
  // Glow Animations
  glowPulse: 'animate-glow-pulse',
  glowRotate: 'animate-glow-rotate',
  
  // Float Effects
  floatSlow: 'animate-float-slow',
  floatMedium: 'animate-float-medium',
  floatFast: 'animate-float-fast',
  
  // Shimmer Effects
  shimmer: 'animate-shimmer',
  shimmerGold: 'animate-shimmer-gold',
};

/**
 * Border Effects
 */
export const borderEffects = {
  // Gradient Borders
  gradientGold: 'border-2 border-transparent bg-gradient-to-r from-yellow-300 to-seraphim-gold bg-clip-border',
  gradientSIA: 'border-2 border-transparent bg-gradient-to-r from-vanguard-blue via-vanguard-red to-vanguard-green bg-clip-border',
  
  // Animated Borders
  animatedGold: 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-seraphim-gold before:to-transparent before:animate-border-slide',
  animatedSIA: 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-vanguard-blue before:via-vanguard-red before:to-vanguard-green before:animate-border-slide',
};

/**
 * Hover Effects
 */
export const hoverEffects = {
  // Scale Effects
  scaleSmall: 'hover:scale-105 transition-transform duration-200',
  scaleMedium: 'hover:scale-110 transition-transform duration-200',
  scaleLarge: 'hover:scale-125 transition-transform duration-200',
  
  // Glow on Hover
  glowGold: 'hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] transition-shadow duration-300',
  glowBlue: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-shadow duration-300',
  glowRed: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-shadow duration-300',
  glowGreen: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-shadow duration-300',
  
  // Lift Effect
  lift: 'hover:-translate-y-1 hover:shadow-xl transition-all duration-200',
  liftGlow: 'hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(212,175,55,0.3)] transition-all duration-200',
};

/**
 * Composite Effect Builders
 */
export const createPremiumCard = (variant: 'gold' | 'blue' | 'red' | 'green' = 'gold'): string => {
  const baseClasses = 'rounded-lg p-6 transition-all duration-300';
  const glassEffect = glassEffects.colored[variant];
  const glowEffect = glowEffects[variant].md;
  const hoverEffect = hoverEffects.lift;
  
  return `${baseClasses} ${glassEffect} ${glowEffect} ${hoverEffect}`;
};

export const createMetallicButton = (variant: 'gold' | 'silver' | 'bronze' = 'gold'): string => {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-all duration-200';
  const metallicEffect = metallicEffects[variant];
  const hoverEffect = 'hover:brightness-110 hover:scale-105';
  const activeEffect = 'active:scale-95';
  
  return `${baseClasses} ${metallicEffect} ${hoverEffect} ${activeEffect}`;
};

export const createGlowingBadge = (color: 'gold' | 'blue' | 'red' | 'green'): string => {
  const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold';
  const glowEffect = glowEffects[color].sm;
  const bgColor = {
    gold: 'bg-seraphim-gold/20 text-seraphim-gold',
    blue: 'bg-vanguard-blue/20 text-vanguard-blue',
    red: 'bg-vanguard-red/20 text-vanguard-red',
    green: 'bg-vanguard-green/20 text-vanguard-green',
  }[color];
  
  return `${baseClasses} ${bgColor} ${glowEffect}`;
};

/**
 * Advanced Composite Effects
 */
export const premiumEffects = {
  // Hero Section Effect
  heroGradient: 'bg-gradient-to-br from-seraphim-black via-gray-900 to-seraphim-black bg-[length:400%_400%] animate-gradient-shift',
  
  // Premium Card with All Effects
  premiumCard: 'backdrop-blur-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/20 shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] hover:-translate-y-1 transition-all duration-300',
  
  // Holographic Effect
  holographic: 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 bg-[length:200%_200%] animate-gradient-shift opacity-80',
  
  // Matrix Rain Effect (for backgrounds)
  matrixRain: 'relative overflow-hidden before:absolute before:inset-0 before:bg-[url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Ctext x="0" y="15" font-family="monospace" font-size="10" fill="%2310B981" opacity="0.1"%3E0%3C/text%3E%3C/svg%3E")] before:animate-matrix-rain',
};

/**
 * Utility function to combine effects
 */
export const combineEffects = (...effects: (string | undefined | false)[]): string => {
  return effects.filter(Boolean).join(' ');
};

/**
 * Get effect by SIA metric
 */
export const getSIAEffect = (metric: 'security' | 'integrity' | 'accuracy', type: 'glow' | 'gradient' | 'glass' = 'glow') => {
  const colorMap = {
    security: 'blue',
    integrity: 'red',
    accuracy: 'green',
  } as const;
  
  const color = colorMap[metric];
  
  switch (type) {
    case 'glow':
      return glowEffects[color].md;
    case 'gradient':
      return gradientEffects[`dark${color.charAt(0).toUpperCase() + color.slice(1)}` as keyof typeof gradientEffects];
    case 'glass':
      return glassEffects.colored[color];
    default:
      return '';
  }
};