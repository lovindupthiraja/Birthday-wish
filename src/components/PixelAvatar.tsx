import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AvatarExpression, AvatarMode } from '../types';

interface PixelAvatarProps {
  expression: AvatarExpression;
  mode: AvatarMode;
  size?: number;
  className?: string;
}

/**
 * Guide avatar rendering the uploaded Chibi Boy with Glasses & Earphones illustration
 * zoomed onto his face and neck, without remounting the img node across steps.
 */
export const PixelAvatar: React.FC<PixelAvatarProps> = ({
  expression,
  mode,
  size = 68,
  className = '',
}) => {
  const isSilhouette = mode === 'silhouette';

  return (
    <motion.div
      animate={{ scale: expression === 'excited' ? 1.03 : 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`relative select-none overflow-hidden bg-white will-change-transform ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="./assets/aistudio/Chibi_Boy_with_Glasses_and_Earphones_55e6b4e6.png"
        alt="Chibi boy guide avatar"
        decoding="async"
        className={`w-full h-full object-cover object-top scale-[1.45] origin-[50%_28%] block ${
          isSilhouette ? 'brightness-0 contrast-125 opacity-80' : ''
        }`}
      />
    </motion.div>
  );
};

interface AvatarGuideProps {
  visible: boolean;
  expression: AvatarExpression;
  mode: AvatarMode;
  dialogue: string;
}

export const AvatarGuide: React.FC<AvatarGuideProps> = ({
  visible,
  expression,
  mode,
  dialogue,
}) => {
  return (
    <div
      className={`grid transition-[grid-template-rows,opacity,margin] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible ? 'grid-rows-[1fr] opacity-100 mb-3.5' : 'grid-rows-[0fr] opacity-0 mb-0 pointer-events-none'
      }`}
    >
      <div className="overflow-hidden">
        <div className="flex items-start gap-3 px-1 pt-1">
          {/* Fixed-size Guide Avatar Frame */}
          <div className="shrink-0 rounded-2xl p-1 border-2 bg-white border-[#EB7CA4] shadow-md shadow-[#EB7CA4]/25">
            <div className="rounded-xl overflow-hidden">
              <PixelAvatar expression={expression} mode={mode} size={60} />
            </div>
          </div>

          {/* Fast GPU-composited Speech Bubble */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={dialogue}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex-1 rounded-2xl rounded-tl-sm bg-white/95 border border-[#FFC2D8] px-3.5 py-2.5 shadow-[0_8px_20px_-8px_rgba(212,88,135,0.18)] will-change-transform"
            >
              <p className="text-[13.5px] leading-snug font-medium text-[#4A2334]">
                {dialogue}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
