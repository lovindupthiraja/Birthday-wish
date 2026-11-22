import React from 'react';
import { motion } from 'motion/react';
import { Camera, ArrowRight } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface StagePicPromptProps {
  onYesSnap: () => void;
  onSkipToBye: () => void;
}

export const StagePicPrompt: React.FC<StagePicPromptProps> = ({
  onYesSnap,
  onSkipToBye,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="coquette-card rounded-3xl p-6 flex flex-col items-center text-center will-change-transform"
    >
      {/* Cute Pastel Digicam Illustration */}
      <motion.div
        initial={{ scale: 0.9, rotate: -3 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-32 h-24 rounded-[24px] bg-gradient-to-b from-[#FFE6F0] to-[#FFC2D8] border-2 border-white shadow-[0_14px_28px_-10px_rgba(212,88,135,0.34)] flex items-center justify-center mb-5 will-change-transform"
      >
        <div className="absolute -top-2 right-5 w-6 h-2.5 rounded-t-md bg-[#EB7CA4] border border-white" />
        <div className="absolute top-2.5 left-3.5 w-5 h-3 rounded-md bg-white/85 border border-[#EB7CA4]/40" />
        <div className="absolute top-2.5 right-3.5 w-2.5 h-2.5 rounded-full bg-[#D45887]" />
        <div className="w-14 h-14 rounded-full bg-white border-2 border-[#EB7CA4] shadow-inner flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4A2334] to-[#2A1324] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#FFC2D8]/80 -translate-x-1 -translate-y-1" />
          </div>
        </div>
        <span className="absolute -bottom-2 -right-2 text-2xl select-none drop-shadow">
          🎀
        </span>
      </motion.div>

      <h2 className="font-serif-coquette text-[30px] leading-tight font-semibold text-[#4A2334] text-balance">
        Wanna take a birthday pic? 📸
      </h2>

      <p className="mt-3 text-sm leading-relaxed text-[#6E3D52] max-w-[305px]">
        Strike a pose with the soft-pink Polaroid cam—pick girly filters, face
        stickers, and custom frames to save straight to your phone!
      </p>

      <p className="mt-2.5 text-[11px] font-semibold text-[#9E5270]">
        🔒 100% private — stays only on your phone
      </p>

      <div className="w-full mt-5 space-y-2.5">
        <button
          type="button"
          onClick={() => {
            soundEngine.playTransition();
            onYesSnap();
          }}
          className="btn-spring w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-[#EB7CA4] to-[#D45887] hover:brightness-105 text-white font-semibold text-base shadow-[0_10px_24px_-8px_rgba(212,88,135,0.55)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Yes, Let&apos;s Snap! 📸</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playTransition();
            onSkipToBye();
          }}
          className="btn-spring w-full min-h-[44px] rounded-2xl bg-white/90 hover:bg-white border border-[#FFC2D8] text-xs font-semibold text-[#8C566B] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Maybe later — Continue</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#D45887]" />
        </button>
      </div>
    </motion.div>
  );
};
