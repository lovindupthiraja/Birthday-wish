import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface Stage4CakeProps {
  onCelebrated?: () => void;
  onNext: () => void;
}

export const Stage4Cake: React.FC<Stage4CakeProps> = ({
  onCelebrated,
  onNext,
}) => {
  // 2 numeral candles on top of the cake: "1" and "5"
  const [litCandles, setLitCandles] = useState<[boolean, boolean]>([true, true]);
  const [allBlown, setAllBlown] = useState(false);

  // Celebrate directly on the cake card once both "1" and "5" candles are blown out
  useEffect(() => {
    if (allBlown) return;
    if (litCandles.every((lit) => !lit)) {
      const timer = setTimeout(() => {
        soundEngine.playSuccess();
        setAllBlown(true);
        onCelebrated?.();
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [litCandles, allBlown, onCelebrated]);

  const blowCandle = (index: 0 | 1) => {
    soundEngine.unlockAudio();
    setLitCandles((prev) => {
      if (!prev[index]) return prev;
      soundEngine.playCandleBlow();
      const next: [boolean, boolean] = [...prev] as [boolean, boolean];
      next[index] = false;
      return next;
    });
  };

  const remaining = litCandles.filter(Boolean).length;

  return (
    <motion.div
      key="cake-card"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="coquette-card rounded-3xl p-5 flex flex-col items-center text-center will-change-transform"
    >
      <h2 className="font-serif-coquette text-[28px] leading-tight font-semibold text-[#4A2334]">
        {allBlown ? 'Yay! Happy 15th, Thenumi! 🎂✨' : 'Birthday Cake Time'}
      </h2>
      <p className="text-xs font-medium text-[#8C566B] mt-1 mb-2">
        {allBlown
          ? 'Both 1 & 5 candles are out—party time!'
          : `${remaining} candle${remaining > 1 ? 's' : ''} left — tap the 1 & 5 flames!`}
      </p>

      {/* Interactive Cake + "1" and "5" Numeral Candles */}
      <div className="relative w-full max-w-[300px] pt-4 pb-2 flex flex-col items-center select-none">
        {/* Two Numeral Candles ("1" and "5") sitting close together and touching the cake top */}
        <div className="relative z-10 flex items-end justify-center -space-x-2 -mb-[10px]">
          {/* Candle "1" */}
          <button
            type="button"
            onClick={() => blowCandle(0)}
            aria-label={litCandles[0] ? 'Tap to put out candle 1' : 'Candle 1 out'}
            className="group relative min-w-[48px] min-h-[100px] flex flex-col items-center justify-end cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D45887] rounded-xl"
          >
            {/* Flame or Smoke above "1" */}
            <div className="relative w-8 h-9 flex items-end justify-center mb-0.5 translate-x-[2px]">
              <AnimatePresence mode="wait">
                {litCandles[0] ? (
                  <motion.div
                    key="flame-1"
                    exit={{ scale: 0, opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="relative w-6 h-8"
                  >
                    <div
                      className="absolute -inset-2.5 rounded-full pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(255,212,229,0.85) 0%, rgba(255,212,229,0) 72%)',
                      }}
                    />
                    <svg
                      viewBox="0 0 24 32"
                      className="w-6 h-8 animate-flame absolute left-1/2 bottom-0"
                    >
                      <path
                        d="M12 2C12 2 20 12 20 20C20 25.5 16.4 30 12 30C7.6 30 4 25.5 4 20C4 12 12 2 12 2Z"
                        fill="#FF9E44"
                      />
                      <path
                        d="M12 9C12 9 17 15.5 17 21C17 24.8 14.8 28 12 28C9.2 28 7 24.8 7 21C7 15.5 12 9 12 9Z"
                        fill="#FFE37E"
                      />
                      <ellipse cx="12" cy="24" rx="2.5" ry="3.2" fill="#FFF9E6" />
                    </svg>
                  </motion.div>
                ) : (
                  <motion.div
                    key="smoke-1"
                    initial={{ opacity: 0.85, y: 4, scale: 0.6 }}
                    animate={{ opacity: 0, y: -26, scale: 1.5 }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                    className="w-5 h-7 rounded-full pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(215,180,196,0.65) 0%, rgba(215,180,196,0) 72%)',
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Wick */}
            <div className="w-[2px] h-2 bg-[#4A2334] rounded-full translate-x-[2px]" />

            {/* Sculpted Number "1" Candle SVG */}
            <svg
              viewBox="0 0 46 59"
              className="w-11 h-[58px] overflow-visible drop-shadow-[0_4px_8px_rgba(212,88,135,0.28)] transition-transform group-hover:scale-105"
            >
              <defs>
                <pattern
                  id="candleStripe1"
                  width="8"
                  height="8"
                  patternTransform="rotate(35)"
                  patternUnits="userSpaceOnUse"
                >
                  <rect width="8" height="8" fill="#FFFDF9" />
                  <rect width="4" height="8" fill="#FF9EC2" />
                </pattern>
              </defs>
              <path
                d="M11 19 C11 16, 16 10, 22 6 C25 4, 30 5, 30 9 L30 50 L36 50 C38 50, 39 52, 39 54 C39 56, 38 58, 36 58 L11 58 C9 58, 8 56, 8 54 C8 52, 9 50, 11 50 L18 50 L18 20 L14 23 C12 24, 11 22, 11 19 Z"
                fill="url(#candleStripe1)"
                stroke="#D45887"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path
                d="M25 11 L25 49"
                stroke="#FFFFFF"
                strokeOpacity="0.65"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Candle "5" */}
          <button
            type="button"
            onClick={() => blowCandle(1)}
            aria-label={litCandles[1] ? 'Tap to put out candle 5' : 'Candle 5 out'}
            className="group relative min-w-[52px] min-h-[100px] flex flex-col items-center justify-end cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D45887] rounded-xl"
          >
            {/* Flame or Smoke above "5" */}
            <div className="relative w-8 h-9 flex items-end justify-center mb-0.5 -translate-x-[3px]">
              <AnimatePresence mode="wait">
                {litCandles[1] ? (
                  <motion.div
                    key="flame-5"
                    exit={{ scale: 0, opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="relative w-6 h-8"
                  >
                    <div
                      className="absolute -inset-2.5 rounded-full pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(255,212,229,0.85) 0%, rgba(255,212,229,0) 72%)',
                      }}
                    />
                    <svg
                      viewBox="0 0 24 32"
                      className="w-6 h-8 animate-flame absolute left-1/2 bottom-0"
                    >
                      <path
                        d="M12 2C12 2 20 12 20 20C20 25.5 16.4 30 12 30C7.6 30 4 25.5 4 20C4 12 12 2 12 2Z"
                        fill="#FF9E44"
                      />
                      <path
                        d="M12 9C12 9 17 15.5 17 21C17 24.8 14.8 28 12 28C9.2 28 7 24.8 7 21C7 15.5 12 9 12 9Z"
                        fill="#FFE37E"
                      />
                      <ellipse cx="12" cy="24" rx="2.5" ry="3.2" fill="#FFF9E6" />
                    </svg>
                  </motion.div>
                ) : (
                  <motion.div
                    key="smoke-5"
                    initial={{ opacity: 0.85, y: 4, scale: 0.6 }}
                    animate={{ opacity: 0, y: -26, scale: 1.5 }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                    className="w-5 h-7 rounded-full pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(215,180,196,0.65) 0%, rgba(215,180,196,0) 72%)',
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Wick */}
            <div className="w-[2px] h-2 bg-[#4A2334] rounded-full -translate-x-[3px]" />

            {/* Sculpted Number "5" Candle SVG */}
            <svg
              viewBox="0 0 52 59"
              className="w-12 h-[58px] overflow-visible drop-shadow-[0_4px_8px_rgba(212,88,135,0.28)] transition-transform group-hover:scale-105"
            >
              <defs>
                <pattern
                  id="candlePolka5"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <rect width="10" height="10" fill="#FFE3EE" />
                  <circle cx="3" cy="3" r="1.6" fill="#EB7CA4" />
                  <circle cx="8" cy="8" r="1.6" fill="#FFFFFF" />
                </pattern>
              </defs>
              <path
                d="M38 6 L16 6 C13 6, 11 8, 11 11 L9 30 C9 33, 12 35, 16 33 C20 31, 24 30, 28 31 C33 32, 35 36, 35 41 C35 46, 31 49, 25 49 C20 49, 17 47, 14 44 C12 42, 8 44, 8 47 C8 51, 15 58, 26 58 C38 58, 45 50, 45 40 C45 30, 38 23, 27 23 C23 23, 20 24, 19 25 L20 15 L38 15 C41 15, 43 13, 43 10.5 C43 8, 41 6, 38 6 Z"
                fill="url(#candlePolka5)"
                stroke="#D45887"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              <path
                d="M15 11 L37 11"
                stroke="#FFFFFF"
                strokeOpacity="0.7"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Multi-tier Soft-Pink Illustrated Cake + Scalloped White Plate */}
        <svg
          viewBox="0 42 280 143"
          className="w-full h-auto drop-shadow-[0_12px_20px_rgba(212,88,135,0.18)]"
          aria-hidden="true"
        >
          <ellipse cx="140" cy="164" rx="126" ry="16" fill="#FFFFFF" stroke="#FFD6E6" strokeWidth="2.5" />
          <ellipse cx="140" cy="161" rx="108" ry="10" fill="#FFF7FA" />

          <rect x="44" y="102" width="192" height="58" rx="16" fill="#FFC2D8" stroke="#EB7CA4" strokeWidth="2.5" />
          <path d="M45 132 Q92 140 140 132 T235 132" fill="none" stroke="#FFF7FA" strokeWidth="6" strokeLinecap="round" />
          <path
            d="M44 108 C44 98, 236 98, 236 108 L236 116 C224 126, 212 114, 200 120 C186 128, 174 114, 160 122 C146 130, 134 114, 120 122 C106 128, 92 114, 80 121 C66 128, 54 114, 44 118 Z"
            fill="#FFF7FA"
          />

          <rect x="74" y="48" width="132" height="56" rx="15" fill="#FFE3EE" stroke="#EB7CA4" strokeWidth="2.5" />
          <path
            d="M74 56 C74 44, 206 44, 206 56 L206 66 C195 76, 184 62, 172 70 C160 78, 149 63, 138 71 C126 78, 115 63, 104 70 C92 77, 83 63, 74 68 Z"
            fill="#FFFFFF"
          />

          {/* Soft icing shadow under the "1" and "5" candles */}
          <ellipse cx="140" cy="50" rx="34" ry="3.2" fill="#F4C7D8" fillOpacity="0.6" />

          {[84, 102, 120, 140, 160, 178, 196].map((cx) => (
            <circle key={`top-${cx}`} cx={cx} cy="102" r="4.5" fill="#FFFDF9" stroke="#FFC2D8" strokeWidth="1.2" />
          ))}
          {[56, 76, 96, 118, 140, 162, 184, 204, 224].map((cx) => (
            <circle key={`bot-${cx}`} cx={cx} cy="158" r="4.5" fill="#FFFDF9" stroke="#FFC2D8" strokeWidth="1.2" />
          ))}

          <g transform="translate(140, 124)">
            <path d="M0 0 C-14 -10 -24 -4 -20 4 C-16 11 -5 6 0 2 C5 6 16 11 20 4 C24 -4 14 -10 0 0 Z" fill="#EB7CA4" />
            <path d="M-2 2 L-10 18 M2 2 L10 18" stroke="#D45887" strokeWidth="3" strokeLinecap="round" />
            <circle cx="0" cy="1" r="4" fill="#FFC2D8" stroke="#D45887" strokeWidth="1.5" />
          </g>

          <circle cx="88" cy="48" r="7" fill="#EB7CA4" />
          <circle cx="192" cy="48" r="7" fill="#EB7CA4" />
        </svg>
      </div>

      {/* Bottom Action: Tap instruction while candles are lit, OR Continue button once all out */}
      <div className="mt-2 flex flex-col items-center gap-2 w-full">
        {!allBlown ? (
          <p className="text-[11px] font-semibold text-[#9E5270]">
            Tap each candle flame above to put them out ✨
          </p>
        ) : (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            onClick={() => {
              soundEngine.playTransition();
              onNext();
            }}
            className="btn-spring w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-[#EB7CA4] to-[#D45887] hover:brightness-105 text-white font-semibold text-base shadow-[0_10px_24px_-8px_rgba(212,88,135,0.55)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Continue →</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
