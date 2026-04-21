// Animation configurations for Remi the mascot
// Each state defines different animation properties

export type RemiState = 
  | 'idle' 
  | 'happy' 
  | 'thinking' 
  | 'celebrating' 
  | 'sleeping' 
  | 'encouraging' 
  | 'streak_broken';

export interface AnimationConfig {
  scale: number;
  translateY: number;
  rotate: number;
  duration: number;
  damping: number;
  stiffness: number;
  loop?: boolean;
  delay?: number;
}

export const remiStateConfigs: Record<RemiState, AnimationConfig> = {
  idle: {
    scale: 1,
    translateY: 0,
    rotate: 0,
    duration: 2000,
    damping: 10,
    stiffness: 100,
    loop: true,
  },
  happy: {
    scale: 1.15,
    translateY: -20,
    rotate: 0,
    duration: 600,
    damping: 8,
    stiffness: 200,
    loop: false,
  },
  thinking: {
    scale: 1,
    translateY: 0,
    rotate: 15,
    duration: 1500,
    damping: 12,
    stiffness: 80,
    loop: true,
  },
  celebrating: {
    scale: 1.2,
    translateY: -30,
    rotate: 360,
    duration: 800,
    damping: 6,
    stiffness: 250,
    loop: false,
  },
  sleeping: {
    scale: 0.95,
    translateY: 5,
    rotate: 0,
    duration: 3000,
    damping: 15,
    stiffness: 60,
    loop: true,
  },
  encouraging: {
    scale: 1.05,
    translateY: -10,
    rotate: 0,
    duration: 1000,
    damping: 10,
    stiffness: 120,
    loop: true,
  },
  streak_broken: {
    scale: 0.9,
    translateY: 15,
    rotate: -5,
    duration: 1500,
    damping: 20,
    stiffness: 50,
    loop: false,
  },
};

// Eye configurations for each state
export interface EyeConfig {
  leftScaleY: number;
  rightScaleY: number;
  leftTranslateX: number;
  rightTranslateX: number;
  expression: 'normal' | 'star' | 'squint' | 'closed' | 'tear';
}

export const remiEyeConfigs: Record<RemiState, EyeConfig> = {
  idle: {
    leftScaleY: 1,
    rightScaleY: 1,
    leftTranslateX: 0,
    rightTranslateX: 0,
    expression: 'normal',
  },
  happy: {
    leftScaleY: 0.3,
    rightScaleY: 0.3,
    leftTranslateX: 0,
    rightTranslateX: 0,
    expression: 'star',
  },
  thinking: {
    leftScaleY: 1,
    rightScaleY: 0.6,
    leftTranslateX: -2,
    rightTranslateX: 2,
    expression: 'squint',
  },
  celebrating: {
    leftScaleY: 0.2,
    rightScaleY: 0.2,
    leftTranslateX: 0,
    rightTranslateX: 0,
    expression: 'star',
  },
  sleeping: {
    leftScaleY: 0.1,
    rightScaleY: 0.1,
    leftTranslateX: 0,
    rightTranslateX: 0,
    expression: 'closed',
  },
  encouraging: {
    leftScaleY: 1.1,
    rightScaleY: 1.1,
    leftTranslateX: 0,
    rightTranslateX: 0,
    expression: 'normal',
  },
  streak_broken: {
    leftScaleY: 0.8,
    rightScaleY: 0.8,
    leftTranslateX: 0,
    rightTranslateX: 0,
    expression: 'tear',
  },
};

// Puns for each state (Remi makes ONE pun per interaction)
export const remiPuns: Record<RemiState, string[]> = {
  idle: [
    "I'm just here, REMI-niscing about your last session!",
    "Don't worry, I won't ghost you! 👻",
    "I'm your cloud companion, always floating around!",
  ],
  happy: [
    "You're on a roll! Or should I say... on a stroll? 🎉",
    "That focus session was REMI-arkable!",
    "You're really getting into the flow-t of things!",
  ],
  thinking: [
    "Hmm, let me ponder this... I'm quite the deep thinker!",
    "Brainstorming... or should I say, cloud-computing? 🤔",
    "Give me a moment, my thoughts are a bit foggy!",
  ],
  celebrating: [
    "Woohoo! We're on cloud nine! 🎊",
    "That calls for a celebration! Let's make it rain... confetti!",
    "You're absolutely spec-tacular!",
  ],
  sleeping: [
    "Just catching some Z's... get it? Zzz... 💤",
    "I'm in my dream state... literally!",
    "Rest is important for us clouds too!",
  ],
  encouraging: [
    "You've got this! Don't let distractions cloud your mind!",
    "Stay focused! You're doing REMI-arkably well!",
    "Keep going! Every minute counts!",
  ],
  streak_broken: [
    "Don't worry, streaks are like weather... they change! ☁️",
    "Every cloud has a silver lining! Tomorrow's a new day!",
    "It's okay to drift sometimes. Let's get back on track!",
  ],
};

export function getRandomPun(state: RemiState): string {
  const puns = remiPuns[state];
  return puns[Math.floor(Math.random() * puns.length)];
}
