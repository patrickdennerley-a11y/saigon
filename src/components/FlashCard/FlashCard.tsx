import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFlashcardStore } from '../../store/flashcardStore'
import { useSettingsStore } from '../../store/settingsStore'
import { prefetchManager } from '../../services/cache/prefetchManager'
import type { Flashcard } from '../../types'
import { renderToString } from 'katex'
import 'katex/dist/katex.min.css'

interface FlashCardProps {
  card: Flashcard;
  deckId: string;
}

interface MathRendererProps {
  content: string
}

function MathRenderer({ content }: MathRendererProps) {
  const escapeHtml = useCallback((s: string) => {
    const div = document.createElement('div')
    div.textContent = s
    return div.innerHTML
  }, [])

  const renderMathToHtml = useCallback((text: string) => {
    if (!text) return ''

    // Unified regex to handle both display ($$) and inline ($) math
    // For display math: look for $$ ... $$ (can span multiple lines)
    // For inline math: look for $ ... $ (cannot contain unescaped newlines in standard LaTeX)
    const mathRegex = /(\$\$([\s\S]*?)\$\$)|(\$([^\$]*?)\$)/g
    let result = ''
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = mathRegex.exec(text)) !== null) {
      // Add text before this match
      const textBefore = text.slice(lastIndex, match.index)
      if (textBefore) {
        result += `<span class="katex-text">${escapeHtml(textBefore)}</span>`
      }

      try {
        if (match[2] !== undefined) {
          // Display math: $$ ... $$
          const displayMath = renderToString(match[2], { displayMode: true, throwOnError: false })
          result += `<div class="katex-display-wrapper">${displayMath}</div>`
        } else if (match[4] !== undefined) {
          // Inline math: $ ... $
          const inlineMath = renderToString(match[4], { displayMode: false, throwOnError: false })
          result += `<span class="katex-inline-wrapper">${inlineMath}</span>`
        }
      } catch (e) {
        console.warn('KaTeX error:', e, 'Content:', match[2] || match[4])
        result += `<span class="katex-error">${escapeHtml(match[0])}</span>`
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    const remainingText = text.slice(lastIndex)
    if (remainingText) {
      result += `<span class="katex-text">${escapeHtml(remainingText)}</span>`
    }

    return result
  }, [escapeHtml])

  const html = useMemo(() => renderMathToHtml(content), [content, renderMathToHtml])

  return (
    <div 
      className="katex-wrapper"
      dangerouslySetInnerHTML={{ __html: html }} 
      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
    />
  )
}

export function FlashCard({ card, deckId }: FlashCardProps) {
  const { settings, getActiveTheme } = useSettingsStore()
  const theme = getActiveTheme()
  const {
    getCardViewState,
    setCardDepth,
    setCardLoading,
    addLayerToCard,
    getCardLayers,
  } = useFlashcardStore()

  const viewState = getCardViewState(card.id)
  const [displayContent, setDisplayContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const layers = getCardLayers(card.id)

  // Get current content based on depth
  const getCurrentContent = useCallback(() => {
    if (viewState.currentDepth === 0) {
      return { type: 'question' as const, content: card.question }
    }
    if (viewState.currentDepth === 1) {
      return { type: 'answer' as const, content: card.answer }
    }

    // Look for cached layer
    const layer = layers.find((l) => l.depth === viewState.currentDepth)
    if (layer) {
      return { type: 'explanation' as const, content: layer.content }
    }

    return { type: 'loading' as const, content: '' }
  }, [viewState.currentDepth, card.question, card.answer, layers])

  const currentContent = getCurrentContent()

  // Update display content when current content changes
  useEffect(() => {
    if (currentContent.type !== 'loading') {
      setDisplayContent(currentContent.content)
    }
  }, [currentContent])

  // Handle flip (drill deeper)
  const handleFlip = async () => {
    if (viewState.isLoading || isStreaming) return

    const newDepth = viewState.currentDepth + 1
    setCardDepth(card.id, newDepth)

    // If going from question to answer, no AI needed
    if (newDepth === 1) {
      return
    }

    // Check if we already have this layer
    const existingLayer = layers.find((l) => l.depth === newDepth)
    if (existingLayer) {
      return
    }

    // Need to generate explanation
    setCardLoading(card.id, true)
    setIsStreaming(true)
    setDisplayContent('')

    try {
      // Get content from previous layer
      const prevContent = newDepth === 2
        ? card.answer
        : layers.find((l) => l.depth === newDepth - 1)?.content ?? card.answer

      const layer = await prefetchManager.getOrGenerate(
        card.id,
        newDepth,
        prevContent,
        settings,
        (streamedContent) => {
          setDisplayContent(streamedContent)
        }
      )

      // Add to card layers
      addLayerToCard(deckId, card.id, layer)
    } catch (error) {
      console.error('Failed to generate explanation:', error)
      setDisplayContent('Failed to generate explanation. Please try again.')
    } finally {
      setCardLoading(card.id, false)
      setIsStreaming(false)
    }
  }

  // Handle going back one level
  const handleBack = () => {
    if (viewState.currentDepth > 0) {
      setCardDepth(card.id, viewState.currentDepth - 1)
    }
  }

  // Prefetch on mount and when depth changes
  useEffect(() => {
    if (settings.apiKey && viewState.currentDepth >= 1) {
      const content = viewState.currentDepth === 1
        ? card.answer
        : layers.find((l) => l.depth === viewState.currentDepth)?.content ?? card.answer

      prefetchManager.setSettings(settings)
      prefetchManager.prefetch(card.id, content, viewState.currentDepth, settings.prefetchDepth)
    }
  }, [card.id, card.answer, viewState.currentDepth, settings, layers])

  const getDepthLabel = () => {
    if (viewState.currentDepth === 0) return 'Question'
    if (viewState.currentDepth === 1) return 'Answer'
    return `Explanation (Level ${viewState.currentDepth - 1})`
  }

  const getDepthHint = () => {
    if (viewState.currentDepth === 0) return 'Click to reveal answer'
    if (!settings.apiKey) return 'Add API key in settings to unlock Claude explanations'
    return 'Click for simpler explanation'
  }

  return (
    <div className="perspective-1000 w-full max-w-md mx-auto">
      <motion.div
        className="relative w-full min-h-96 cursor-pointer"
        onClick={handleFlip}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={viewState.currentDepth}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-2xl shadow-2xl p-6 flex flex-col"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            }}
          >
            {/* Depth indicator */}
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-sm font-medium"
                style={{ color: theme.textMuted }}
              >
                {getDepthLabel()}
              </span>
              <div className="flex items-center gap-2">
                {viewState.currentDepth > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBack()
                    }}
                    className="text-sm px-2 py-1 rounded transition-colors"
                    style={{
                      color: theme.textMuted,
                      backgroundColor: `${theme.secondary}40`,
                    }}
                  >
                    Back
                  </button>
                )}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(viewState.currentDepth + 1, 5) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: i === viewState.currentDepth
                          ? theme.text
                          : `${theme.text}66`,
                      }}
                    />
                  ))}
                  {viewState.currentDepth >= 5 && (
                    <span
                      className="text-xs ml-1"
                      style={{ color: theme.textMuted }}
                    >
                      +{viewState.currentDepth - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-2">
              <div className="text-center min-h-full flex flex-col justify-center">
                {viewState.isLoading && !displayContent ? (
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: theme.text }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.1s]"
                      style={{ backgroundColor: theme.text }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s]"
                      style={{ backgroundColor: theme.text }}
                    />
                  </div>
                ) : (
                  <div
                    className={`leading-relaxed ${
                      viewState.currentDepth === 0 ? 'text-xl font-semibold' : 'text-lg'
                    }`}
                    style={{ color: theme.text }}
                  >
                    <MathRenderer content={displayContent || currentContent.content} />
                    {isStreaming && (
                      <span
                        className="inline-block w-2 h-5 ml-1 animate-pulse"
                        style={{ backgroundColor: theme.text }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Hint */}
            <div className="mt-4 text-center">
              <span
                className="text-xs"
                style={{ color: theme.textMuted }}
              >
                {getDepthHint()}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
