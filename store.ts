import { useSyncExternalStore } from 'react';

// ─── Backend URL ───────────────────────────────────────────────────────────────
// After deploying to Render, paste your service URL here (no trailing slash).
// Example: 'https://questifinal-backend.onrender.com'
const API_BASE_URL = 'https://YOUR_RENDER_SERVICE.onrender.com';
// ──────────────────────────────────────────────────────────────────────────────


export type TaskDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Task {
  id: number;
  title: string;
  status: string;
  progress: string;
  priority: TaskDifficulty;
  xpValue: number;
}

export type Theme = 'dark' | 'light';

interface User {
  username: string;
  uid: string;
  token: string;
}

interface GameState {
  user: User | null;
  theme: Theme;
  currentXp: number;
  nextLevelXp: number;
  level: number;
  tasks: Task[];
  lastWarmupDate: string | null;
}

interface GameActions {
  login: (username: string, uid: string, token: string) => void;
  logout: () => void;
  toggleTheme: () => void;
  addXp: (amount: number) => void;
  removeXp: (amount: number) => void;
  toggleTask: (id: number) => void;
  addTask: (taskName: string, difficulty: TaskDifficulty) => boolean;
  addFocusXp: (minutes: number, difficulty: TaskDifficulty) => void;
  checkAndRecordWarmup: () => boolean;
}

type GameStore = GameState & GameActions;

let state: GameState = {
  user: null,
  theme: 'dark',
  currentXp: 0,
  nextLevelXp: 1000,
  level: 1,
  tasks: [],
  lastWarmupDate: null,
};

const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = (): GameState => state;

const applyXpGain = (amount: number) => {
  const total = state.currentXp + amount;

  if (total >= state.nextLevelXp) {
    state = {
      ...state,
      currentXp: total - state.nextLevelXp,
      level: state.level + 1,
      nextLevelXp: state.nextLevelXp + 500,
    };
    return;
  }

  state = {
    ...state,
    currentXp: total,
  };
};

const applyXpLoss = (amount: number) => {
  state = {
    ...state,
    currentXp: Math.max(0, state.currentXp - amount),
  };
};

const DIFFICULTY_XP: Record<TaskDifficulty, number> = {
  EASY: 30,
  MEDIUM: 50,
  HARD: 100,
};

const actions: GameActions = {
  login: (username, uid, token) => {
    state = { ...state, user: { username, uid, token } };
    
    // Attempt to sync with backend
    fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ display_name: username })
    }).catch(err => console.log('Backend sync error:', err));
    
    emit();
  },

  logout: () => {
    state = { ...state, user: null };
    emit();
  },

  toggleTheme: () => {
    state = { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    emit();
  },

  addXp: (amount) => {
    applyXpGain(amount);
    emit();
  },

  removeXp: (amount) => {
    applyXpLoss(amount);
    emit();
  },

  toggleTask: (id) => {
    const taskToToggle = state.tasks.find((task) => task.id === id);
    if (!taskToToggle) return;

    const isComp = taskToToggle.status === 'COMPLETED';

    state = {
      ...state,
      tasks: state.tasks.map((task) => {
        if (task.id !== id) return task;

        return {
          ...task,
          status: isComp ? 'IN_PROGRESS' : 'COMPLETED',
          progress: isComp ? '50%' : '100%',
        };
      }),
    };

    if (!isComp) {
      applyXpGain(taskToToggle.xpValue);
    } else {
      applyXpLoss(taskToToggle.xpValue);
    }

    emit();
  },

  addTask: (taskName, difficulty) => {
    if (taskName.trim().length === 0) return false;

    // Task Limits
    const limits: Record<TaskDifficulty, number> = { EASY: 5, MEDIUM: 3, HARD: 1 };
    const activeTasksOfDifficulty = state.tasks.filter(t => t.priority === difficulty && t.status !== 'COMPLETED').length;
    
    if (activeTasksOfDifficulty >= limits[difficulty]) {
      return false;
    }

    const newTask: Task = {
      id: Date.now(),
      title: taskName.toUpperCase().replace(/\s+/g, '_'),
      status: 'PENDING',
      progress: '0%',
      priority: difficulty,
      xpValue: DIFFICULTY_XP[difficulty],
    };

    state = {
      ...state,
      tasks: [newTask, ...state.tasks],
    };

    emit();
    return true;
  },

  addFocusXp: (minutes, difficulty) => {
    const multipliers = { EASY: 1, MEDIUM: 2, HARD: 3 };
    const xpEarned = minutes * multipliers[difficulty];
    applyXpGain(xpEarned);
    emit();
  },

  checkAndRecordWarmup: () => {
    const today = new Date().toISOString().split('T')[0];
    if (state.lastWarmupDate !== today) {
      state = { ...state, lastWarmupDate: today };
      emit();
      return true;
    }
    return false;
  },
};

export const useGameStore = (): GameStore => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...snapshot,
    ...actions,
  };
};
