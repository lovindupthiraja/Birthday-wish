export type Stage = 1 | 2 | 3 | 4 | 5 | 6;

export type AvatarExpression =
  | 'mystery'
  | 'skeptical'
  | 'happy'
  | 'wink'
  | 'excited'
  | 'warm';

export type AvatarMode = 'silhouette' | 'reveal';

export type FilterId =
  | 'normal'
  | 'pixel'
  | 'vector'
  | 'softpink'
  | 'y2k'
  | 'bw'
  | 'peachglow'
  | 'fairydust'
  | 'glitch';

export type FrameStyleId =
  | 'classic'
  | 'blush'
  | 'gingham'
  | 'holo'
  | 'y2kblack'
  | 'polka';

export type StickerId = 'bows' | 'sparkles' | '15th' | 'iconic';

export interface PlacedEmoji {
  id: string;
  emoji: string;
  xPct: number; // 0..100 inside photo container
  yPct: number; // 0..100 inside photo container
  scale: number;
  rotation: number;
}
