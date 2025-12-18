import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../UI/Button'
import { Input } from '../UI/Input'
import { useSettingsStore } from '../../store/settingsStore'
import { useFlashcardStore } from '../../store/flashcardStore'
import { useNavigationStore } from '../../store/navigationStore'
import { inferCourse, generateFlashcards } from '../../services/ai/claude'
import { cacheCourse, getCachedCourse } from '../../services/cache/indexedDB'
import type { Subtopic, Flashcard, FlashcardDeck } from '../../types'

export function CourseInput() {
  const { settings } = useSettingsStore()
  const { addDeck, setCurrentDeck } = useFlashcardStore()
  const { navigate } = useNavigationStore()

  const [courseCode, setCourseCode] = useState('')
  const [university, setUniversity] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [courseName, setCourseName] = useState('')
  const [courseDescription, setCourseDescription] = useState('')
  const [subtopics, setSubtopics] = useState<Subtopic[]>([])
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSearch = async () => {
    if (!courseCode.trim() || !university.trim()) {
      setError('Please enter both course code and university')
      return
    }

    if (!settings.apiKey) {
      setError('Please add your OpenAI API key in settings')
      return
    }

    setIsLoading(true)
    setError('')
    setSubtopics([])
    setSelectedSubtopic(null)

    try {
      // Check cache first
      const cached = await getCachedCourse(courseCode.trim(), university.trim())

      if (cached) {
        setCourseName(cached.name)
        setCourseDescription(cached.description)
        setSubtopics(cached.subtopics)
      } else {
        // Infer course from AI
        const result = await inferCourse(courseCode.trim(), university.trim(), settings)

        if (!result) {
          throw new Error('Failed to infer course content')
        }

        setCourseName(result.name)
        setCourseDescription(result.description)
        setSubtopics(result.subtopics)

        // Cache the result
        await cacheCourse({
          code: courseCode.trim(),
          name: result.name,
          university: university.trim(),
          description: result.description,
          subtopics: result.subtopics,
        })
      }
    } catch (err) {
      console.error('Course search failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to search course')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateFlashcards = async (subtopic: Subtopic) => {
    if (!settings.apiKey) {
      setError('Please add your OpenAI API key in settings')
      return
    }

    setSelectedSubtopic(subtopic)
    setIsGenerating(true)
    setError('')

    try {
      const cards = await generateFlashcards(
        subtopic.name,
        `${courseName} (${courseCode}) at ${university}. ${subtopic.description}`,
        settings
      )

      if (cards.length === 0) {
        throw new Error('No flashcards generated')
      }

      // Create flashcard objects
      const flashcards: Flashcard[] = cards.map((card, index) => ({
        id: `${courseCode}-${subtopic.id}-${index}-${Date.now()}`,
        question: card.question,
        answer: card.answer,
        subject: subtopic.name,
        subtopic: subtopic.name,
        layers: [],
        createdAt: Date.now(),
      }))

      // Create deck
      const deck: FlashcardDeck = {
        id: `deck-${courseCode}-${subtopic.id}-${Date.now()}`,
        name: `${courseName}: ${subtopic.name}`,
        subject: courseName,
        courseCode: courseCode.trim(),
        university: university.trim(),
        cards: flashcards,
        createdAt: Date.now(),
      }

      addDeck(deck)
      setCurrentDeck(deck.id)
      navigate('study', deck.id)
    } catch (err) {
      console.error('Flashcard generation failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate flashcards')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-2">Course Search</h2>
      <p className="text-slate-400 mb-6">
        Enter a university course code to generate flashcards from the syllabus
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Course Code"
            placeholder="e.g., COMP10001, CS50, MATH101"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            disabled={isLoading}
          />
          <Input
            label="University"
            placeholder="e.g., University of Melbourne, Harvard"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleSearch}
          isLoading={isLoading}
          disabled={!courseCode.trim() || !university.trim()}
          className="w-full"
        >
          Search Course
        </Button>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </div>

      <AnimatePresence>
        {subtopics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8"
          >
            <div className="bg-slate-800/50 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-white">{courseName}</h3>
              <p className="text-slate-400 mt-2">{courseDescription}</p>
            </div>

            <h4 className="text-lg font-medium text-white mb-4">Select a topic to study:</h4>

            <div className="grid grid-cols-1 gap-3">
              {subtopics.map((subtopic) => (
                <motion.button
                  key={subtopic.id}
                  onClick={() => handleGenerateFlashcards(subtopic)}
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
