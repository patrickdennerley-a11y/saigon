import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../UI/Button'
import { Input } from '../UI/Input'
import { useSettingsStore } from '../../store/settingsStore'
import { useFlashcardStore } from '../../store/flashcardStore'
import { useNavigationStore } from '../../store/navigationStore'
import { generateFlashcards, generateSubtopics } from '../../services/ai/claude'
import type { Subtopic, Flashcard, FlashcardDeck } from '../../types'

export function SubjectInput() {
  const { settings } = useSettingsStore()
  const { addDeck, setCurrentDeck } = useFlashcardStore()
  const { navigate } = useNavigationStore()

  const [subject, setSubject] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [subtopics, setSubtopics] = useState<Subtopic[]>([])
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [mode, setMode] = useState<'direct' | 'subtopics'>('direct')

  const handleGenerateDirect = async () => {
    if (!subject.trim()) {
      setError('Please enter a subject')
      return
    }

    if (!settings.apiKey) {
      setError('Please add your OpenAI API key in settings')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const cards = await generateFlashcards(subject.trim(), '', settings)

      if (cards.length === 0) {
        throw new Error('No flashcards generated')
      }

      const flashcards: Flashcard[] = cards.map((card, index) => ({
        id: `${subject}-${index}-${Date.now()}`,
        question: card.question,
        answer: card.answer,
        subject: subject.trim(),
        layers: [],
        createdAt: Date.now(),
      }))

      const deck: FlashcardDeck = {
        id: `deck-${Date.now()}`,
        name: subject.trim(),
        subject: subject.trim(),
        cards: flashcards,
        createdAt: Date.now(),
      }

      addDeck(deck)
      setCurrentDeck(deck.id)
      navigate('study', deck.id)
    } catch (err) {
      console.error('Generation failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate flashcards')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExploreSubtopics = async () => {
    if (!subject.trim()) {
      setError('Please enter a subject')
      return
    }

    if (!settings.apiKey) {
      setError('Please add your OpenAI API key in settings')
      return
    }

    setIsLoading(true)
    setError('')
    setSubtopics([])

    try {
      const topics = await generateSubtopics(subject.trim(), '', settings)

      if (topics.length === 0) {
        throw new Error('No subtopics generated')
      }

      setSubtopics(topics)
    } catch (err) {
      console.error('Subtopic generation failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate subtopics')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubtopicSelect = async (subtopic: Subtopic) => {
    if (!settings.apiKey) return

    setSelectedSubtopic(subtopic)
    setIsGenerating(true)
    setError('')

    try {
      const cards = await generateFlashcards(
        `${subject}: ${subtopic.name}`,
        subtopic.description,
        settings
      )

      if (cards.length === 0) {
        throw new Error('No flashcards generated')
      }

      const flashcards: Flashcard[] = cards.map((card, index) => ({
        id: `${subject}-${subtopic.id}-${index}-${Date.now()}`,
        question: card.question,
        answer: card.answer,
        subject: subject.trim(),
        subtopic: subtopic.name,
        layers: [],
        createdAt: Date.now(),
      }))

      const deck: FlashcardDeck = {
        id: `deck-${Date.now()}`,
        name: `${subject}: ${subtopic.name}`,
        subject: subject.trim(),
        cards: flashcards,
        createdAt: Date.now(),
      }

      addDeck(deck)
      setCurrentDeck(deck.id)
      navigate('study', deck.id)
    } catch (err) {
      console.error('Generation failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate flashcards')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-2">Create Flashcards</h2>
      <p className="text-slate-400 mb-6">
        Enter any subject to generate AI-powered flashcards
      </p>

      <div className="space-y-4">
        <Input
          label="Subject"
          placeholder="e.g., Quantum Physics, Machine Learning, French Revolution"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={isLoading}
        />

        <div className="flex gap-2">
          <Button
            variant={mode === 'direct' ? 'primary' : 'secondary'}
            onClick={() => setMode('direct')}
            size="sm"
          >
            Quick Generate
          </Button>
          <Button
            variant={mode === 'subtopics' ? 'primary' : 'secondary'}
            onClick={() => setMode('subtopics')}
            size="sm"
          >
            Explore Subtopics
          </Button>
        </div>

        <Button
          onClick={mode === 'direct' ? handleGenerateDirect : handleExploreSubtopics}
          isLoading={isLoading}
          disabled={!subject.trim()}
          className="w-full"
        >
          {mode === 'direct' ? 'Generate Flashcards' : 'Find Subtopics'}
        </Button>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </div>

      <AnimatePresence>
        {subtopics.length > 0 && mode === 'subtopics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8"
          >
            <h4 className="text-lg font-medium text-white mb-4">Select a subtopic:</h4>

            <div className="grid grid-cols-1 gap-3">
              {subtopics.map((subtopic) => (
                <motion.button
                  key={subtopic.id}
                  onClick={() => handleSubtopicSelect(subtopic)}
                  disabled={isGenerating}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`
                    text-left p-4 rounded-xl transition-all
                    ${selectedSubtopic?.id === subtopic.id && isGenerating
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }
                    disabled:opacity-50
                  `}
                >
                  <div className="font-medium">{subtopic.name}</div>
                  <div className="text-sm text-slate-400 mt-1">{subtopic.description}</div>
                  {selectedSubtopic?.id === subtopic.id && isGenerating && (
                    <div className="flex items-center gap-2 mt-2 text-blue-200">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating flashcards...
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
