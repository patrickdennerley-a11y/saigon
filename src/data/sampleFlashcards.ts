import type { FlashcardDeck } from '../types'

export const sampleDecks: FlashcardDeck[] = [
  {
    id: 'deck-complex-integration',
    name: 'Complex Integration',
    subject: 'Calculus',
    courseCode: 'MATH201',
    university: 'Demo University',
    createdAt: Date.now(),
    cards: [
      {
        id: 'card-1',
        question: 'What is the integral of $\\frac{1}{x^2 + 1}$ with respect to $x$?',
        answer: 'The integral of $\\frac{1}{x^2 + 1}$ is $\\arctan(x) + C$, where $C$ is the constant of integration. This is a fundamental result that appears frequently in calculus and can be proven using trigonometric substitution.',
        subject: 'Calculus',
        subtopic: 'Integration',
        layers: [],
        createdAt: Date.now(),
      },
      {
        id: 'card-2',
        question: 'Solve: $$\\int_0^{\\pi} \\sin(x) \\cos(x) \\, dx$$',
        answer: 'Using the identity $\\sin(x)\\cos(x) = \\frac{1}{2}\\sin(2x)$, we get: $$\\int_0^{\\pi} \\frac{1}{2}\\sin(2x) \\, dx = \\left[-\\frac{1}{4}\\cos(2x)\\right]_0^{\\pi} = 0$$',
        subject: 'Calculus',
        subtopic: 'Integration',
        layers: [],
        createdAt: Date.now(),
      },
      {
        id: 'card-3',
        question: 'What technique would you use to integrate $\\int x e^{2x} \\, dx$?',
        answer: 'Use integration by parts with $u = x$ and $dv = e^{2x}dx$. This gives: $$\\int x e^{2x} \\, dx = \\frac{x e^{2x}}{2} - \\frac{e^{2x}}{4} + C$$',
        subject: 'Calculus',
        subtopic: 'Integration',
        layers: [],
        createdAt: Date.now(),
      },
    ],
  },
]
