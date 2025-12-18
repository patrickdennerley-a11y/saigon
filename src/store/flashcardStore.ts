import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Flashcard, FlashcardDeck, CardViewState, ExplanationLayer } from '../types'

interface FlashcardState {
  decks: FlashcardDeck[];
  currentDeckIndex: number;
  currentCardIndex: number;
  cardViewStates: Map<string, CardViewState>;
  prefetchedLayers: Map<string, ExplanationLayer[]>;

  // Deck operations
  addDeck: (deck: FlashcardDeck) => void;
  removeDeck: (deckId: string) => void;
  getDeck: (deckId: string) => FlashcardDeck | undefined;

  // Card operations
  addCardToDeck: (deckId: string, card: Flashcard) => void;
  updateCard: (deckId: string, cardId: string, updates: Partial<Flashcard>) => void;

  // Navigation
  setCurrentDeck: (deckId: string) => void;
  nextCard: () => void;
  prevCard: () => void;
  getCurrentCard: () => Flashcard | null;

  // Card view state (depth tracking)
  getCardViewState: (cardId: string) => CardViewState;
  setCardDepth: (cardId: string, depth: number) => void;
  resetCardState: (cardId: string) => void;
  resetAllCardStates: () => void;
  setCardLoading: (cardId: string, isLoading: boolean) => void;

  // Layer management
  addLayerToCard: (deckId: string, cardId: string, layer: ExplanationLayer) => void;
  getCardLayers: (cardId: string) => ExplanationLayer[];

  // Prefetch cache
  setPrefetchedLayers: (cardId: string, layers: ExplanationLayer[]) => void;
  getPrefetchedLayer: (cardId: string, depth: number) => ExplanationLayer | undefined;
  clearPrefetchCache: () => void;
}

export const useFlashcardStore = create<FlashcardState>()(
  persist(
    (set, get) => ({
      decks: [],
      currentDeckIndex: 0,
      currentCardIndex: 0,
      cardViewStates: new Map(),
      prefetchedLayers: new Map(),

      addDeck: (deck) =>
        set((state) => ({
          decks: [...state.decks, deck],
        })),

      removeDeck: (deckId) =>
        set((state) => ({
          decks: state.decks.filter((d) => d.id !== deckId),
        })),

      getDeck: (deckId) => get().decks.find((d) => d.id === deckId),

      addCardToDeck: (deckId, card) =>
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? { ...deck, cards: [...deck.cards, card] }
              : deck
          ),
        })),

      updateCard: (deckId, cardId, updates) =>
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  cards: deck.cards.map((card) =>
                    card.id === cardId ? { ...card, ...updates } : card
                  ),
                }
              : deck
          ),
        })),

      setCurrentDeck: (deckId) => {
        const index = get().decks.findIndex((d) => d.id === deckId)
        if (index !== -1) {
          set({ currentDeckIndex: index, currentCardIndex: 0 })
          get().resetAllCardStates()
        }
      },

      nextCard: () => {
        const { decks, currentDeckIndex, currentCardIndex } = get()
        const deck = decks[currentDeckIndex]
        if (deck && currentCardIndex < deck.cards.length - 1) {
          // Reset current card state before moving
          const currentCard = deck.cards[currentCardIndex]
          if (currentCard) {
            get().resetCardState(currentCard.id)
          }
          set({ currentCardIndex: currentCardIndex + 1 })
        }
      },

      prevCard: () => {
        const { decks, currentDeckIndex, currentCardIndex } = get()
        if (currentCardIndex > 0) {
          // Reset current card state before moving
          const deck = decks[currentDeckIndex]
          const currentCard = deck?.cards[currentCardIndex]
          if (currentCard) {
            get().resetCardState(currentCard.id)
          }
          set({ currentCardIndex: currentCardIndex - 1 })
        }
      },

      getCurrentCard: () => {
        const { decks, currentDeckIndex, currentCardIndex } = get()
        const deck = decks[currentDeckIndex]
        return deck?.cards[currentCardIndex] ?? null
      },

      getCardViewState: (cardId) => {
        const state = get().cardViewStates.get(cardId)
        return state ?? {
          cardId,
          currentDepth: 0,
          isFlipping: false,
          isLoading: false,
        }
      },

      setCardDepth: (cardId, depth) =>
        set((state) => {
          const newStates = new Map(state.cardViewStates)
          const existing = newStates.get(cardId) ?? {
            cardId,
            currentDepth: 0,
            isFlipping: false,
            isLoading: false,
          }
          newStates.set(cardId, { ...existing, currentDepth: depth })
          return { cardViewStates: newStates }
        }),

      resetCardState: (cardId) =>
        set((state) => {
          const newStates = new Map(state.cardViewStates)
          newStates.set(cardId, {
            cardId,
            currentDepth: 0,
            isFlipping: false,
            isLoading: false,
          })
          return { cardViewStates: newStates }
        }),

      resetAllCardStates: () =>
        set({ cardViewStates: new Map() }),

      setCardLoading: (cardId, isLoading) =>
        set((state) => {
          const newStates = new Map(state.cardViewStates)
          const existing = newStates.get(cardId) ?? {
            cardId,
            currentDepth: 0,
            isFlipping: false,
            isLoading: false,
          }
          newStates.set(cardId, { ...existing, isLoading })
          return { cardViewStates: newStates }
        }),

      addLayerToCard: (deckId, cardId, layer) =>
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  cards: deck.cards.map((card) =>
                    card.id === cardId
                      ? { ...card, layers: [...card.layers, layer] }
                      : card
                  ),
                }
              : deck
          ),
        })),

      getCardLayers: (cardId) => {
        const { decks } = get()
        for (const deck of decks) {
          const card = deck.cards.find((c) => c.id === cardId)
          if (card) return card.layers
        }
        return []
      },

      setPrefetchedLayers: (cardId, layers) =>
        set((state) => {
          const newPrefetch = new Map(state.prefetchedLayers)
          newPrefetch.set(cardId, layers)
          return { prefetchedLayers: newPrefetch }
        }),

      getPrefetchedLayer: (cardId, depth) => {
        const layers = get().prefetchedLayers.get(cardId)
        return layers?.find((l) => l.depth === depth)
      },

      clearPrefetchCache: () =>
        set({ prefetchedLayers: new Map() }),
    }),
    {
      name: 'flashcard-storage',
      partialize: (state) => ({
        decks: state.decks,
        currentDeckIndex: state.currentDeckIndex,
      }),
    }
  )
)
