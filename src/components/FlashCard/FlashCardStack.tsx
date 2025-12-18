import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FlashCard } from './FlashCard'
import { useFlashcardStore } from '../../store/flashcardStore'
import { useNavigationStore } from '../../store/navigationStore'
import { Button } from '../UI/Button'
import type { FlashcardDeck } from '../../types'

interface FlashCardStackProps {
  deck: FlashcardDeck;
}

export function FlashCardStack({ deck }: FlashCardStackProps) {
  const {
    currentCardIndex,
    nextCard,
    prevCard,
    resetCardState,
  } = useFlashcardStore()
  const { navigate } = useNavigationStore()

  const currentCard = deck.cards[currentCardIndex]
  const hasNext = currentCardIndex < deck.cards.length - 1
  const hasPrev = currentCardIndex > 0

  const handleNext = useCallback(() => {
    if (currentCard) {
      // Reset current card state before navigating
      resetCardState(currentCard.id)
    }
    nextCard()
  }, [currentCard, resetCardState, nextCard])

  const handlePrev = useCallback(() => {
    if (currentCard) {
      // Reset current card state before navigating
      resetCardState(currentCard.id)
    }
    prevCard()
  }, [currentCard, resetCardState, prevCard])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' && hasNext) {
      handleNext()
    } else if (e.key === 'ArrowLeft' && hasPrev) {
      handlePrev()
    }
  }, [hasNext, hasPrev, handleNext, handlePrev])

  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
          No cards in this deck
        </p>
        <Button onClick={() => navigate('home')} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center gap-8 outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Progress indicator */}
      <div className="flex items-center gap-4" style={{ color: 'var(--color-text-muted)' }}>
        <span className="text-sm">
          Card {currentCardIndex + 1} of {deck.cards.length}
        </span>
        <div
          className="w-48 h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <motion.div
            className="h-full"
            style={{ backgroundColor: 'var(--color-primary)' }}
            initial={false}
            animate={{
              width: `${((currentCardIndex + 1) / deck.cards.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card container */}
      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FlashCard card={currentCard} deckId={deck.id} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={handlePrev}
          disabled={!hasPrev}
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </span>
        </Button>

        <Button
          onClick={handleNext}
          disabled={!hasNext}
        >
          <span className="flex items-center gap-2">
            Next
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Button>
      </div>

      {/* Keyboard hint */}
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Use{' '}
        <kbd
          className="px-2 py-1 rounded text-xs"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          ←
        </kbd>{' '}
        <kbd
          className="px-2 py-1 rounded text-xs"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          →
        </kbd>{' '}
        arrow keys to navigate
      </p>
    </div>
  )
}
