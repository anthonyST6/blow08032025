import React from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  BeakerIcon, 
  CubeTransparentIcon,
  LightBulbIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

export const PremiumEffectsShowcase: React.FC = () => {
  return (
    <div className="p-8 space-y-12 bg-seraphim-black">
      <h2 className="text-3xl font-bold text-seraphim-gold mb-8">Premium Effects Showcase</h2>

      {/* Glow Effects */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-seraphim-text mb-4">Glow Effects</h3>
        <div className="grid grid-cols-4 gap-6">
          <div className="p-6 bg-background-card rounded-lg shadow-glow-gold animate-glow-gold">
            <SparklesIcon className="w-8 h-8 text-seraphim-gold mb-2" />
            <p className="text-seraphim-text">Gold Glow</p>
          </div>
          <div className="p-6 bg-background-card rounded-lg shadow-glow-blue animate-glow-blue">
            <BeakerIcon className="w-8 h-8 text-vanguard-security mb-2" />
            <p className="text-seraphim-text">Security Glow</p>
          </div>
          <div className="p-6 bg-background-card rounded-lg shadow-glow-red animate-glow-red">
            <FireIcon className="w-8 h-8 text-vanguard-integrity mb-2" />
            <p className="text-seraphim-text">Integrity Glow</p>
          </div>
          <div className="p-6 bg-background-card rounded-lg shadow-glow-green animate-glow-green">
            <BoltIcon className="w-8 h-8 text-vanguard-accuracy mb-2" />
            <p className="text-seraphim-text">Accuracy Glow</p>
          </div>
        </div>
      </section>

      {/* Gradient Effects */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-seraphim-text mb-4">Gradient Effects</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-gold rounded-lg text-seraphim-black">
            <h4 className="font-semibold">Gold Gradient</h4>
            <p className="text-sm opacity-80">Premium metallic finish</p>
          </div>
          <div className="p-6 bg-gradient-security rounded-lg text-white">
            <h4 className="font-semibold">Security Gradient</h4>
            <p className="text-sm opacity-80">Vanguard blue spectrum</p>
          </div>
          <div className="p-6 bg-gradient-shift rounded-lg text-white animate-gradient-shift bg-[length:200%_200%]">
            <h4 className="font-semibold">Shifting Gradient</h4>
            <p className="text-sm opacity-80">Dynamic color flow</p>
          </div>
        </div>
      </section>

      {/* Glass Morphism */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-seraphim-text mb-4">Glass Morphism</h3>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-vanguard-security to-vanguard-accuracy opacity-50 blur-xl"></div>
          <div className="relative grid grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg">
              <CubeTransparentIcon className="w-8 h-8 text-seraphim-gold mb-2" />
              <h4 className="font-semibold text-seraphim-text">Light Glass</h4>
              <p className="text-sm text-seraphim-text-dim">Subtle transparency</p>
            </div>
            <div className="p-6 bg-black/20 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg">
              <LightBulbIcon className="w-8 h-8 text-seraphim-gold mb-2" />
              <h4 className="font-semibold text-seraphim-text">Dark Glass</h4>
              <p className="text-sm text-seraphim-text-dim">Deep transparency</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pulse Effects */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-seraphim-text mb-4">Pulse Effects</h3>
        <div className="flex gap-6">
          <button className="px-6 py-3 bg-seraphim-gold text-seraphim-black rounded-lg font-semibold animate-pulse-gold">
            Gold Pulse
          </button>
          <button className="px-6 py-3 bg-vanguard-security text-white rounded-lg font-semibold animate-pulse-blue">
            Security Pulse
          </button>
          <button className="px-6 py-3 bg-vanguard-integrity text-white rounded-lg font-semibold animate-pulse-red">
            Integrity Pulse
          </button>
          <button className="px-6 py-3 bg-vanguard-accuracy text-white rounded-lg font-semibold animate-pulse-green">
            Accuracy Pulse
          </button>
        </div>
      </section>

      {/* Float & Shimmer */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-seraphim-text mb-4">Animation Effects</h3>
        <div className="grid grid-cols-3 gap-6">
          <motion.div 
            className="p-6 bg-background-card rounded-lg border border-seraphim-gold/20 animate-float"
          >
            <h4 className="font-semibold text-seraphim-text">Floating Card</h4>
            <p className="text-sm text-seraphim-text-dim">Gentle hover effect</p>
          </motion.div>
          <div className="p-6 bg-background-card rounded-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            <h4 className="font-semibold text-seraphim-text relative z-10">Shimmer Effect</h4>
            <p className="text-sm text-seraphim-text-dim relative z-10">Metallic shine</p>
          </div>
          <div className="p-6 bg-gradient-metallic rounded-lg border border-white/10">
            <h4 className="font-semibold text-seraphim-text">Metallic Surface</h4>
            <p className="text-sm text-seraphim-text-dim">Premium finish</p>
          </div>
        </div>
      </section>

      {/* Combined Effects */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-seraphim-text mb-4">Combined Premium Effects</h3>
        <div className="grid grid-cols-2 gap-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-8 bg-gradient-gold rounded-xl shadow-glow-gold-lg animate-pulse-gold relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            <div className="relative z-10">
              <SparklesIcon className="w-12 h-12 text-seraphim-black mb-3" />
              <h4 className="text-xl font-bold text-seraphim-black">Premium Gold Card</h4>
              <p className="text-seraphim-black/80">Multiple effects combined</p>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-8 bg-black/20 backdrop-blur-lg border border-vanguard-security/30 rounded-xl shadow-glow-blue-lg relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-shift animate-gradient-shift opacity-10 bg-[length:200%_200%]"></div>
            <div className="relative z-10">
              <CubeTransparentIcon className="w-12 h-12 text-vanguard-security mb-3" />
              <h4 className="text-xl font-bold text-seraphim-text">Glass Security Card</h4>
              <p className="text-seraphim-text-dim">Glass with dynamic gradient</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};