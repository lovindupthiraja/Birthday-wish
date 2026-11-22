import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { PixelAvatar } from './PixelAvatar';
import { soundEngine } from '../utils/soundEngine';

interface Stage6ByeProps {
  onReplay: () => void;
}

export const Stage6Bye: React.FC<Stage6ByeProps> = ({ onReplay }) => {
  return (
    <motion.div
      key="bye-screen"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="coquette-card rounded-[32px] p-6 flex flex-col items-center text-center relative overflow-hidden will-change-transform"
    >
      {/* Zero-blur gentle pastel halo */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-60 h-32 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(255,214,230,0.65) 0%, rgba(255,214,230,0) 70%)',
        }}
      />

      {/* Big Avatar centerpiece */}
      <div className="relative mb-2.5 mt-1 animate-float-slow">
        <div className="rounded-3xl p-2 bg-white border-2 border-[#FFC2D8] shadow-[0_14px_32px_-10px_rgba(212,88,135,0.34)]">
          <div className="rounded-2xl overflow-hidden">
            <PixelAvatar expression="warm" mode="reveal" size={96} />
          </div>
        </div>
        <span className="absolute -top-2 -right-2 text-2xl select-none drop-shadow">
          🎀
        </span>
        <span className="absolute -bottom-2 -left-2 text-xl select-none animate-twinkle">
          ✨
        </span>
      </div>

      <p className="text-xs font-bold tracking-[0.16em] text-[#B84574] mb-2.5">
        (BOOCHI)
      </p>

      <h2 className="font-serif-coquette text-[32px] leading-tight font-semibold text-[#4A2334] text-balance">
        Bye for now, Thenumi! 🎀
      </h2>

      <p className="mt-3 text-sm leading-relaxed text-[#6E3D52] max-w-[305px]">
        Happy 15th once again, Thenumi! Hope today feels as bright, cozy, and
        special as you are—wishing you endless happiness, big smiles, and the
        sweetest year ahead. ✨
      </p>

      <div className="w-full h-px bg-[#FFC2D8]/55 my-5" />

      <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#9E5270] mb-5">
        <span>15th Birthday Edition</span>
        <span aria-hidden="true">·</span>
        <span>Keep shining ✨</span>
      </div>

      <button
        type="button"
        onClick={() => {
          soundEngine.playConfetti();
          onReplay();
        }}
        className="btn-spring w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-[#EB7CA4] to-[#D45887] hover:brightness-105 text-white font-semibold text-base shadow-[0_10px_24px_-8px_rgba(212,88,135,0.55)] flex items-center justify-center gap-2 cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Replay Surprise</span>
        <Sparkles className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
