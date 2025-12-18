import { create } from 'zustand'
import type { AppView } from '../types'

interface NavigationState {
  currentView: AppView;
  selectedDeckId: string | null;
  navigate: (view: AppView, deckId?: string) => void;
  goBack: () => void;
  history: AppView[];
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentView: 'home',
  selectedDeckId: null,
  history: ['home'],

  navigate: (view, deckId) =>
    set((state) => ({
      currentView: view,
      selectedDeckId: deckId ?? state.selectedDeckId,
      history: [...state.history, view],
    })),

  goBack: () => {
    const { history } = get()
    if (history.length > 1) {
      const newHistory = history.slice(0, -1)
      set({
        currentView: newHistory[newHistory.length - 1],
        history: newHistory,
      })
    }
  },
}))
