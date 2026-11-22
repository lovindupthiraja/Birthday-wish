import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Eye, EyeOff, Volume2, VolumeX } from 'lucide-react';
import { Stage } from '../types';

interface TopBarProps {
  stage: Stage;
  guideOpen: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onToggleGuide: () => void;
  onJumpStage: (stage: Stage) => void;
}

const STAGE_LABELS: { stage: Stage; label: string }[] = [
  { stage: 1, label: '1. Birthday Intro' },
  { stage: 2, label: '2. Ribbon Letter' },
  { stage: 3, label: '3. 15th Cake 🎂' },
  { stage: 4, label: '4. Pic Prompt 📸' },
  { stage: 5, label: '5. Polaroid Booth' },
  { stage: 6, label: '6. Bye Screen 🎀' },
];

export const TopBar: React.FC<TopBarProps> = ({
  stage,
  guideOpen,
  muted,
  onToggleMute,
  onToggleGuide,
  onJumpStage,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-30 flex items-center justify-between gap-2 px-4 pt-3 pb-2">
      {/* Top-left: Progress pill (clickable to jump between steps) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="btn-spring inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight whitespace-nowrap shrink-0 border bg-white/85 hover:bg-white border-[#FFC2D8] text-[#4A2334] shadow-sm cursor-pointer transition-colors"
          aria-expanded={menuOpen}
          aria-label="Current progress step"
        >
          <span>🎀 Step {stage} / 6</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#D45887] transition-transform duration-200 ${
              menuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Quick Jump Menu */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 mt-2 w-48 z-30 rounded-2xl bg-white border border-[#FFC2D8] shadow-xl p-1.5 will-change-transform"
              >
                <p className="px-2.5 py-1 text-[11px] font-semibold text-[#D45887]">
                  Jump to step
                </p>
                {STAGE_LABELS.map((item) => (
                  <button
                    key={item.stage}
                    type="button"
                    onClick={() => {
                      onJumpStage(item.stage);
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      stage === item.stage
                        ? 'bg-[#FFE3EE] text-[#D45887]'
                        : 'text-[#4A2334] hover:bg-[#FFF7FA]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {stage === item.stage && <span className="text-[10px]">here</span>}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Top-right: Sound Toggle + Guide ON/OFF toggle */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute music and sounds' : 'Mute music and sounds'}
          title={muted ? 'Sound OFF' : 'Smooth Jazz Music ON'}
          className="btn-spring inline-flex items-center justify-center w-[38px] h-[38px] rounded-full bg-white/85 hover:bg-white border border-[#FFC2D8] text-[#D45887] shadow-sm cursor-pointer"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onToggleGuide}
          className={`btn-spring inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 border shadow-sm cursor-pointer ${
            guideOpen
              ? 'bg-[#FFE3EE] border-[#EB7CA4] text-[#D45887]'
              : 'bg-white/85 border-[#FFC2D8] text-[#7D4B61]'
          }`}
          aria-pressed={guideOpen}
        >
          {guideOpen ? (
            <Eye className="w-3.5 h-3.5" />
          ) : (
            <EyeOff className="w-3.5 h-3.5" />
          )}
          <span>Guide: {guideOpen ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </header>
  );
};
