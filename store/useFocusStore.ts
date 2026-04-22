import { create } from 'zustand';

export interface FocusSession {
  id: string;
  name: string;
  duration: number; // in minutes
  rating: number; // 1-5
  note?: string;
  date: string;
  coinsEarned: number;
  type: 'pomodoro' | 'deepWork' | 'quickBurst' | 'windDown';
}

interface FocusState {
  sessions: FocusSession[];
  currentSession: FocusSession | null;
  isActive: boolean;
  timeRemaining: number; // in seconds
  totalCoins: number;
  
  // Actions
  startSession: (name: string, duration: number, type: FocusSession['type']) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: (rating: number, note?: string) => void;
  cancelSession: () => void;
  tick: () => void;
  getTodaySessions: () => FocusSession[];
  getTotalFocusHours: () => number;
}

const calculateCoins = (duration: number, streakMultiplier: number = 1): number => {
  const baseCoins = Math.floor(duration / 25) * 10;
  return Math.floor(baseCoins * streakMultiplier);
};

export const useFocusStore = create<FocusState>((set, get) => ({
      sessions: [],
      currentSession: null,
      isActive: false,
      timeRemaining: 0,
      totalCoins: 0,

      startSession: (name, duration, type) => {
        const session: FocusSession = {
          id: Date.now().toString(),
          name,
          duration,
          rating: 0,
          date: new Date().toISOString(),
          coinsEarned: 0,
          type,
        };
        
        set({
          currentSession: session,
          isActive: true,
          timeRemaining: duration * 60,
        });
      },

      pauseSession: () => {
        set({ isActive: false });
      },

      resumeSession: () => {
        set({ isActive: true });
      },

      completeSession: (rating, note) => {
        const { currentSession, sessions, totalCoins } = get();
        if (!currentSession) return;

        const coinsEarned = calculateCoins(currentSession.duration);
        const completedSession: FocusSession = {
          ...currentSession,
          rating,
          note,
          coinsEarned,
        };

        set({
          sessions: [completedSession, ...sessions],
          totalCoins: totalCoins + coinsEarned,
          currentSession: null,
          isActive: false,
          timeRemaining: 0,
        });
      },

      cancelSession: () => {
        set({
          currentSession: null,
          isActive: false,
          timeRemaining: 0,
        });
      },

      tick: () => {
        const { isActive, timeRemaining } = get();
        if (isActive && timeRemaining > 0) {
          set({ timeRemaining: timeRemaining - 1 });
        } else if (isActive && timeRemaining === 0) {
          // Session completed automatically
          get().completeSession(3);
        }
      },

      getTodaySessions: () => {
        const { sessions } = get();
        const today = new Date().toDateString();
        return sessions.filter(s => new Date(s.date).toDateString() === today);
      },

      getTotalFocusHours: () => {
        const { sessions } = get();
        const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
        return Math.floor(totalMinutes / 60);
      },
}));
