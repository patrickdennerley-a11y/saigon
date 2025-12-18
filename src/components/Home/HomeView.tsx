import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useFlashcardStore } from '../../store/flashcardStore'
import { useNavigationStore } from '../../store/navigationStore'
import { useSettingsStore } from '../../store/settingsStore'
import { SubjectInput } from '../CourseSearch/SubjectInput'
import { Button } from '../UI/Button'
import { sampleDecks } from '../../data/sampleFlashcards'

export function HomeView() {
  const { decks, setCurrentDeck, removeDeck, addDeck } = useFlashcardStore()
  const { navigate } = useNavigationStore()
  const { hasApiKey, getActiveTheme } = useSettingsStore()
  const theme = getActiveTheme()

  // Initialize with sample decks if none exist
  useEffect(() => {
    if (decks.length === 0 && sampleDecks.length > 0) {
      sampleDecks.forEach((deck) => addDeck(deck))
    }
  }, [decks.length, addDeck])

  const handleStudyDeck = (deckId: string) => {
    setCurrentDeck(deckId)
    navigate('study', deckId)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* API Key Warning */}
      {!hasApiKey() && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 mb-6"
          style={{
            backgroundColor: `color-mix(in srgb, ${theme.accent} 20%, transparent)`,
            border: `1px solid color-mix(in srgb, ${theme.accent} 50%, transparent)`,
          }}
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              style={{ color: theme.accent }}
            >
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-medium" style={{ color: theme.accent }}>
                API Key Required
              </h4>
              <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
                Add your Anthropic API key in settings to generate flashcards and use recursive explanations.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('settings')}
                className="mt-2"
                style={{ color: theme.accent }}
              >
                Go to Settings
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create New Section */}
        <div>
          <SubjectInput />
        </div>

        {/* Existing Decks Section */}
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
            Your Decks
          </h2>
          <p className="mb-6" style={{ color: theme.textMuted }}>
            {decks.length === 0
              ? 'No decks yet. Create your first one!'
              : `${decks.length} deck${decks.length === 1 ? '' : 's'} available`
            }
          </p>

          {decks.length > 0 ? (
            <div className="space-y-3">
              {decks.map((deck, index) => (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl p-4 transition-all group cursor-pointer"
                  style={{ backgroundColor: theme.surface }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.backgroundAlt
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.surface
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex-1"
                      onClick={() => handleStudyDeck(deck.id)}
                    >
                      <h3
                        className="font-medium transition-colors"
                        style={{ color: theme.text }}
                      >
                        {deck.name}
                      </h3>
                      <div
                        className="flex items-center gap-3 mt-1 text-sm"
                        style={{ color: theme.textMuted }}
                      >
                        <span>{deck.cards.length} cards</span>
                        {deck.courseCode && (
                          <>
                            <span>-</span>
                            <span>{deck.courseCode}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStudyDeck(deck.id)}
                      >
                        Study
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Delete this deck?')) {
                            removeDeck(deck.id)
                          }
                        }}
                        style={{ color: theme.textMuted }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-xl p-8 text-center"
              style={{ backgroundColor: `color-mix(in srgb, ${theme.surface} 50%, transparent)` }}
            >
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: theme.textMuted }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p style={{ color: theme.textMuted }}>
                Create flashcards by entering a subject or searching for a course
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Feature Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 rounded-2xl p-6"
        style={{
          background: `linear-gradient(to right, color-mix(in srgb, ${theme.primary} 20%, transparent), color-mix(in srgb, ${theme.secondary} 20%, transparent))`,
          border: `1px solid color-mix(in srgb, ${theme.primary} 30%, transparent)`,
        }}
      >
        <h3 className="text-lg font-semibold mb-3" style={{ color: theme.text }}>
          Infinite Flip Technology
        </h3>
        <p className="mb-4" style={{ color: theme.textMuted }}>
          Don't understand an answer? Just click again to get a simpler explanation.
          Keep clicking to drill down until you fully understand the concept.
        </p>
        <div className="flex items-center gap-4 text-sm" style={{ color: theme.textMuted }}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary }} />
            <span>Question</span>
          </div>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.secondary }} />
            <span>Answer</span>
          </div>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accent }} />
            <span>Simpler...</span>
          </div>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>...</span>
        </div>
      </motion.div>
    </div>
  )
}
