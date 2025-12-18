import { useEffect } from 'react'
import { useFlashcardStore } from '../../store/flashcardStore'
import { useNavigationStore } from '../../store/navigationStore'
import { FlashCardStack } from '../FlashCard/FlashCardStack'
import { Button } from '../UI/Button'

export function StudyView() {
  const { decks, currentDeckIndex, resetAllCardStates } = useFlashcardStore()
  const { navigate, selectedDeckId } = useNavigationStore()

  const deck = decks[currentDeckIndex]

  // Reset all card states when entering study mode
  useEffect(() => {
    resetAllCardStates()
  }, [selectedDeckId, resetAllCardStates])

  if (!deck) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Deck not found</h2>
        <Button onClick={() => navigate('home')}>Go Home</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate('home')}>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Decks
            </span>
          </Button>
          <h1 className="text-2xl font-bold text-white mt-2">{deck.name}</h1>
          {deck.courseCode && (
            <p className="text-slate-400 text-sm">
              {deck.courseCode} - {deck.university}
            </p>
          )}
        </div>
      </div>

      {/* Flashcard Stack */}
      <FlashCardStack deck={deck} />

      {/* Instructions */}
      <div className="mt-12 bg-slate-800/30 rounded-xl p-6">
        <h3 className="text-white font-medium mb-3">How to use</h3>
        <ul className="text-slate-400 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-400">1.</span>
            Click the card to flip and reveal the answer
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">2.</span>
            Click again for a simpler explanation (AI-powered)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">3.</span>
            Keep clicking to drill deeper until you understand
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">4.</span>
            Use "Back" button on the card to go up a level
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">5.</span>
            Navigate between cards - they'll reset to the question
          </li>
        </ul>
      </div>
    </div>
  )
}
