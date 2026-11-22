import React from 'react';
import { motion } from 'motion/react';
import { soundEngine } from '../utils/soundEngine';

interface Stage2IntroProps {
  onNext: () => void;
}

export const Stage2Intro: React.FC<Stage2IntroProps> = ({ onNext }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="coquette-card rounded-3xl p-6 flex flex-col items-center text-center will-change-transform"
    >
      {/* Floating Pastel Coquette Gift Box with Satin Ribbon & Sparkles */}
      <div className="relative w-36 h-32 flex items-center justify-center mb-4 select-none animate-float-slow">
        <svg
          viewBox="0 0 150 132"
          className="w-full h-full overflow-visible drop-shadow-[0_12px_20px_rgba(212,88,135,0.26)]"
          aria-hidden="true"
        >
          {/* Floating sparkles & mini hearts popping above box */}
          <text x="26" y="34" fontSize="15" className="animate-twinkle">
            ✨
          </text>
          <text x="112" y="30" fontSize="15" className="animate-twinkle">
            ✨
          </text>
          <path
            d="M75 26 C75 26, 65 18, 65 12 C65 8.5, 68 6.5, 71 7.8 C73 8.5, 74.3 10.2, 75 11.4 C75.7 10.2, 77 8.5, 79 7.8 C82 6.5, 85 8.5, 85 12 C85 18, 75 26, 75 26 Z"
            fill="#FF82B2"
            stroke="#FFFDF9"
            strokeWidth="1.5"
          />

          {/* Soft ground shadow */}
          <ellipse cx="75" cy="119" rx="44" ry="7" fill="#EB7CA4" fillOpacity="0.18" />

          {/* Gift Box Base */}
          <rect
            x="33"
            y="62"
            width="84"
            height="54"
            rx="12"
            fill="#FFE3EE"
            stroke="#EB7CA4"
            strokeWidth="2.4"
          />
          {/* Subtle polka dots on box */}
          <circle cx="46" cy="79" r="2.2" fill="#FFFFFF" fillOpacity="0.85" />
          <circle cx="54" cy="98" r="2.2" fill="#FFFFFF" fillOpacity="0.85" />
          <circle cx="96" cy="80" r="2.2" fill="#FFFFFF" fillOpacity="0.85" />
          <circle cx="104" cy="100" r="2.2" fill="#FFFFFF" fillOpacity="0.85" />

          {/* Vertical Satin Ribbon on Box */}
          <rect
            x="67"
            y="62"
            width="16"
            height="54"
            fill="#EB7CA4"
            stroke="#FFFDF9"
            strokeWidth="1.4"
          />

          {/* Gift Box Lid */}
          <rect
            x="27"
            y="46"
            width="96"
            height="19"
            rx="8"
            fill="#FFC2D8"
            stroke="#D45887"
            strokeWidth="2.4"
          />
          <rect
            x="67"
            y="46"
            width="16"
            height="19"
            fill="#D45887"
            stroke="#FFFDF9"
            strokeWidth="1.4"
          />

          {/* Big Satin Bow on Top of Lid */}
          <path
            d="M73 45 C58 26, 36 28, 38 41 C40 50, 58 49, 73 46 Z"
            fill="#FF96BE"
            stroke="#FFFDF9"
            strokeWidth="1.8"
          />
          <path
            d="M77 45 C92 26, 114 28, 112 41 C110 50, 92 49, 77 46 Z"
            fill="#FF96BE"
            stroke="#FFFDF9"
            strokeWidth="1.8"
          />
          <circle cx="75" cy="45" r="7" fill="#D45887" stroke="#FFFDF9" strokeWidth="1.8" />
        </svg>
      </div>

      <h2 className="font-serif-coquette text-[30px] leading-tight font-semibold text-[#4A2334] text-balance">
        Happy 15th Birthday, Thenumi! ✨
      </h2>

      <p className="mt-3 text-sm leading-relaxed text-[#6E3D52] max-w-[310px]">
        I put together a small, cozy birthday surprise just for you today—hope
        it brings a big smile to your face!
      </p>

      <div className="w-full h-px bg-[#FFC2D8]/50 my-5" />

      <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#9E5270] mb-5">
        <span>A sweet note</span>
        <span aria-hidden="true">·</span>
        <span>Birthday cake</span>
        <span aria-hidden="true">·</span>
        <span>Polaroid cam</span>
      </div>

      <button
        type="button"
        onClick={() => {
          soundEngine.unlockAudio();
          soundEngine.playTransition();
          onNext();
        }}
        className="btn-spring w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-[#EB7CA4] to-[#D45887] hover:brightness-105 text-white font-semibold text-base shadow-[0_10px_24px_-8px_rgba(212,88,135,0.55)] flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>Let&apos;s Go 🎀</span>
      </button>
    </motion.div>
  );
};
