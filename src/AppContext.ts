import { createContext, useContext } from 'react';
import type { PlayerState } from './usePlayer';

export interface Toast {
  id: number;
  message: string;
  kind: 'info' | 'success' | 'warn';
}

export interface AppContextValue {
  view: string;
  setView: (v: string) => void;
  player: ReturnType<typeof import('./usePlayer').usePlayer>;
  toasts: Toast[];
  pushToast: (message: string, kind?: Toast['kind']) => void;
  dismissToast: (id: number) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export type { PlayerState };
