import { generateContent } from '../ai/claude'
import { cachePrefetch, getPrefetch, cacheExplanation, getCachedExplanation } from './indexedDB'
import type { AppSettings, ExplanationLayer } from '../../types'

interface PrefetchTask {
  cardId: string;
  depth: number;
  content: string;
  priority: number;
}

class PrefetchManager {
  private queue: PrefetchTask[] = []
  private isProcessing = false
  private settings: AppSettings | null = null
  private activeRequests = new Set<string>()

  setSettings(settings: AppSettings) {
    this.settings = settings
  }

  private getTaskKey(cardId: string, depth: number): string {
    return `${cardId}:${depth}`
  }

  async prefetch(
    cardId: string,
    currentContent: string,
    currentDepth: number,
    prefetchDepth: number = 2
  ): Promise<void> {
    if (!this.settings?.apiKey) return

    // Queue prefetch for next N layers
    for (let i = 1; i <= prefetchDepth; i++) {
      const targetDepth = currentDepth + i
      const taskKey = this.getTaskKey(cardId, targetDepth)

      // Skip if already in queue or being processed
      if (this.activeRequests.has(taskKey)) continue
      if (this.queue.some((t) => t.cardId === cardId && t.depth === targetDepth)) continue

      // Check if already cached
      const cached = await getCachedExplanation(cardId, targetDepth)
      if (cached) continue

      // Check prefetch cache
      const prefetched = await getPrefetch(cardId, targetDepth)
      if (prefetched) continue

      this.queue.push({
        cardId,
        depth: targetDepth,
        content: currentContent,
        priority: i, // Lower priority for deeper layers
      })
    }

    // Sort by priority (lower = higher priority)
    this.queue.sort((a, b) => a.priority - b.priority)

    this.processQueue()
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || !this.settings?.apiKey) return
    this.isProcessing = true

    while (this.queue.length > 0) {
      const task = this.queue.shift()
      if (!task) break

      const taskKey = this.getTaskKey(task.cardId, task.depth)
      if (this.activeRequests.has(taskKey)) continue

      this.activeRequests.add(taskKey)

      try {
        // Get the content to explain (previous layer or base content)
        let contentToExplain = task.content

        // If this is depth > 1, we need the previous layer's content
        if (task.depth > 1) {
          const prevLayer = await getCachedExplanation(task.cardId, task.depth - 1)
            ?? await getPrefetch(task.cardId, task.depth - 1)

          if (prevLayer) {
            contentToExplain = prevLayer.content
          }
        }

        const response = await generateContent(
          {
            type: 'explanation',
            context: '',
            depth: task.depth,
            previousContent: contentToExplain,
          },
          this.settings!
        )

        // Cache the prefetched content
        await cachePrefetch(task.cardId, task.depth, response, task.priority)
      } catch (error) {
        console.error('Prefetch failed:', error)
      } finally {
        this.activeRequests.delete(taskKey)
      }
    }

    this.isProcessing = false
  }

  async getOrGenerate(
    cardId: string,
    depth: number,
    previousContent: string,
    settings: AppSettings,
    onStream?: (chunk: string) => void
  ): Promise<ExplanationLayer> {
    // Check main cache first
    const cached = await getCachedExplanation(cardId, depth)
    if (cached) return cached

    // Check prefetch cache
    const prefetched = await getPrefetch(cardId, depth)
    if (prefetched) {
      // Move to main cache
      await cacheExplanation(cardId, depth, prefetched.content)
      return prefetched
    }

    // Generate fresh
    const { streamExplanation } = await import('../ai/claude')
    let content = ''

    for await (const chunk of streamExplanation(previousContent, depth, settings)) {
      content += chunk
      onStream?.(content)
    }

    const layer: ExplanationLayer = {
      content,
      depth,
      generatedAt: Date.now(),
    }

    // Cache the result
    await cacheExplanation(cardId, depth, content)

    // Trigger prefetch for next layers
    this.setSettings(settings)
    this.prefetch(cardId, content, depth, settings.prefetchDepth)

    return layer
  }

  clearQueue(): void {
    this.queue = []
  }

  cancelCard(cardId: string): void {
    this.queue = this.queue.filter((t) => t.cardId !== cardId)
  }
}

export const prefetchManager = new PrefetchManager()
