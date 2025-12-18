import type { GenerationRequest } from '../../types'

export function getSystemPrompt(type: GenerationRequest['type']): string {
  switch (type) {
    case 'flashcards':
      return `You are an expert educational content creator. Generate flashcards for studying.

Rules:
- Create clear, concise questions that test understanding
- Answers should be comprehensive but not overly long (2-4 sentences)
- Focus on key concepts and important details
- Use varied question types (definition, comparison, application)

Output format: Return a JSON array of flashcards:
[{"question": "...", "answer": "..."}]`

    case 'explanation':
      return `You are a patient teacher who excels at breaking down complex concepts into simpler terms.

Your task: Explain the given text in simpler terms. Each level of explanation should be more accessible than the previous.

CRITICAL FORMATTING RULES FOR MATHEMATICAL EXPRESSIONS:
- ALL mathematical notation must use proper LaTeX delimiters
- Display equations (centered, separate line): $$...$$ (e.g., $$\\int_a^b f(x) dx$$)
- Inline math (within text): $...$ (e.g., area $A = \\pi r^2$)
- Keep explanations concise (2-4 sentences)
- If already very simple, try a different angle or analogy`

- Use analogies and everyday examples
- Avoid jargon unless you explain it
- Keep explanations concise (2-4 sentences)
- If already very simple, try a different angle or analogy
- Preserve ALL mathematical expressions in LaTeX form even when simplifying`

    case 'course-inference':
      return `You are an expert in university curricula and academic courses.

Given a course code and university name, infer what the course is likely about based on:
- Common naming conventions for that university/country
- The typical structure of course codes (department prefixes, level numbers)
- Your knowledge of academic programs

Output format: Return JSON with course details:
{
  "name": "Inferred Course Name",
  "description": "Brief description of likely course content",
  "subtopics": [
    {"id": "1", "name": "Topic 1", "description": "Brief description"},
    ...
  ]
}`

    case 'subtopics':
      return `You are an expert in academic subjects and curriculum design.

Generate a comprehensive list of subtopics for studying a given subject.

Rules:
- Create 8-12 subtopics that cover the main areas
- Order from foundational to advanced concepts
- Include practical applications where relevant

Output format: Return JSON array:
[{"id": "1", "name": "Subtopic Name", "description": "Brief description"}]`
  }
}

export function getUserPrompt(request: GenerationRequest): string {
  switch (request.type) {
    case 'flashcards':
      return `Generate 10 flashcards for studying: ${request.subject}
${request.context ? `\nContext/Focus area: ${request.context}` : ''}`

    case 'explanation':
      return `Explain this in simpler terms (this is explanation depth ${request.depth}):

"${request.previousContent}"

${request.depth && request.depth > 3 ? 'Make this extremely simple, like explaining to a young child.' : ''}`

    case 'course-inference':
      return `Course code: ${request.context}
University: ${request.subject}

Infer what this course is about and list its likely subtopics.`

    case 'subtopics':
      return `Subject: ${request.subject}
${request.context ? `Specific focus: ${request.context}` : ''}

Generate subtopics for comprehensive study of this subject.`
  }
}

export function parseAIResponse<T>(response: string, _type: GenerationRequest['type']): T | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\[[\s\S]*\]|\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T
    }
    return JSON.parse(response) as T
  } catch {
    console.error('Failed to parse AI response:', response)
    return null
  }
}
