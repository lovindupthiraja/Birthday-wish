import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Volume2 } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface IntroSplashProps {
  onStart: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onStart }) => {
  return (
    <motion.div
      key="intro-splash"
      initial={{ opacity: 0, scale: 0.97, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="coquette-card rounded-[32px] p-7 flex flex-col items-center text-center relative overflow-hidden will-change-transform"
    >
      {/* Zero-blur soft top ribbon glow */}
      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-60 h-32 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(255,194,216,0.55) 0%, rgba(255,194,216,0) 70%)',
        }}
      />

      {/* Circular Portrait Crest featuring Thenumi's uploaded photo */}
      <div className="relative mb-6 mt-2 animate-float-slow">
        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-b from-[#FFFDF9] to-[#FFE3EE] border-2 border-[#FFC2D8] shadow-[0_14px_34px_-10px_rgba(212,88,135,0.38)]">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#FFE8F1]">
            <img
              src="./assets/aistudio/image_ab3e6ff3.png"
              alt="Thenumi"
              decoding="async"
              className="w-full h-full object-cover object-[52%_36%] scale-[1.24]"
            />
          </div>
        </div>

        <span className="absolute -top-1 -right-2 text-xl select-none animate-twinkle">
          ✨
        </span>
        <span className="absolute bottom-1 -left-2 text-lg select-none animate-twinkle">
          🌸
        </span>
      </div>

      <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#B84574]">
        Fifteenth Chapter
      </p>

      <h1 className="font-serif-coquette text-[34px] leading-[1.08] font-semibold text-[#4A2334] mt-1.5 text-balance">
        A Little Surprise for Thenumi
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-[#6E3D52] max-w-[295px]">
        Take a breath, tap open your keepsake, and enjoy a cozy little 15th
        birthday moment made just for you, Thenumi.
      </p>

      <div className="w-full h-px bg-[#FFC2D8]/55 my-5" />

      <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#9E5270] mb-5">
        <Volume2 className="w-3.5 h-3.5 text-[#D45887]" />
        <span>Smooth calm jazz plays softly inside</span>
      </div>

      <button
        type="button"
        onClick={() => {
          soundEngine.unlockAudio();
          soundEngine.playTransition();
          onStart();
        }}
        className="btn-spring w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-[#EB7CA4] to-[#D45887] hover:brightness-105 text-white font-semibold text-base shadow-[0_12px_28px_-8px_rgba(212,88,135,0.58)] flex items-center justify-center gap-2 cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        <span>Open Your Surprise 🎀</span>
      </button>
    </motion.div>
  );
};
