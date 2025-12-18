import Anthropic from '@anthropic-ai/sdk'
import type { GenerationRequest, AppSettings } from '../../types'
import { getSystemPrompt, getUserPrompt, parseAIResponse } from './prompts'

let clientInstance: Anthropic | null = null
let currentApiKey: string = ''

function getClient(apiKey: string): Anthropic {
  if (!clientInstance || currentApiKey !== apiKey) {
    clientInstance = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    })
    currentApiKey = apiKey
  }
  return clientInstance
}

export async function generateContent(
  request: GenerationRequest,
  settings: AppSettings
): Promise<string> {
  const client = getClient(settings.apiKey)

  const response = await client.messages.create({
    model: settings.model,
    max_tokens: 2000,
    system: getSystemPrompt(request.type),
    messages: [
      { role: 'user', content: getUserPrompt(request) },
    ],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  return textBlock?.type === 'text' ? textBlock.text : ''
}

export async function* streamExplanation(
  content: string,
  depth: number,
  settings: AppSettings
): AsyncGenerator<string, void, unknown> {
  const client = getClient(settings.apiKey)

  const stream = client.messages.stream({
    model: settings.model,
    max_tokens: 500,
    system: getSystemPrompt('explanation'),
    messages: [
      {
        role: 'user',
        content: getUserPrompt({
          type: 'explanation',
          context: '',
          depth,
          previousContent: content,
        }),
      },
    ],
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text
    }
  }
}

export async function generateFlashcards(
  subject: string,
  context: string,
  settings: AppSettings
): Promise<Array<{ question: string; answer: string }>> {
  const response = await generateContent(
    { type: 'flashcards', subject, context },
    settings
  )
  return parseAIResponse(response, 'flashcards') ?? []
}

export async function inferCourse(
  courseCode: string,
  university: string,
  settings: AppSettings
): Promise<{
  name: string;
  description: string;
  subtopics: Array<{ id: string; name: string; description: string }>;
} | null> {
  const response = await generateContent(
    { type: 'course-inference', context: courseCode, subject: university },
    settings
  )
  return parseAIResponse(response, 'course-inference')
}

export async function generateSubtopics(
  subject: string,
  focus: string,
  settings: AppSettings
): Promise<Array<{ id: string; name: string; description: string }>> {
  const response = await generateContent(
    { type: 'subtopics', subject, context: focus },
    settings
  )
  return parseAIResponse(response, 'subtopics') ?? []
}

export { parseAIResponse }
