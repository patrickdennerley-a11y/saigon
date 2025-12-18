import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { ExplanationLayer, Course } from '../../types'

interface FlashcardDB extends DBSchema {
  explanations: {
    key: [string, number]; // [cardId, depth]
    value: {
      cardId: string;
      depth: number;
      content: string;
      generatedAt: number;
      expiresAt: number;
    };
    indexes: {
      'by-card': string;
      'by-expiry': number;
    };
  };
  courses: {
    key: [string, string]; // [code, university]
    value: Course & { cachedAt: number; expiresAt: number };
    indexes: {
      'by-expiry': number;
    };
  };
  prefetch: {
    key: [string, number]; // [cardId, depth]
    value: {
      cardId: string;
      depth: number;
      content: string;
      generatedAt: number;
      priority: number;
    };
    indexes: {
      'by-card': string;
      'by-priority': number;
    };
  };
}

const DB_NAME = 'recursive-flashcards'
const DB_VERSION = 1
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

let dbInstance: IDBPDatabase<FlashcardDB> | null = null

export async function getDB(): Promise<IDBPDatabase<FlashcardDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<FlashcardDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Explanations store
      const explanationStore = db.createObjectStore('explanations', {
        keyPath: ['cardId', 'depth'],
      })
      explanationStore.createIndex('by-card', 'cardId')
      explanationStore.createIndex('by-expiry', 'expiresAt')

      // Courses store
      const courseStore = db.createObjectStore('courses', {
        keyPath: ['code', 'university'],
      })
      courseStore.createIndex('by-expiry', 'expiresAt')

      // Prefetch store
      const prefetchStore = db.createObjectStore('prefetch', {
        keyPath: ['cardId', 'depth'],
      })
      prefetchStore.createIndex('by-card', 'cardId')
      prefetchStore.createIndex('by-priority', 'priority')
    },
  })

  return dbInstance
}

// Explanation cache operations
export async function cacheExplanation(
  cardId: string,
  depth: number,
  content: string
): Promise<void> {
  const db = await getDB()
  const now = Date.now()
  await db.put('explanations', {
    cardId,
    depth,
    content,
    generatedAt: now,
    expiresAt: now + CACHE_DURATION_MS,
  })
}

export async function getCachedExplanation(
  cardId: string,
  depth: number
): Promise<ExplanationLayer | null> {
  const db = await getDB()
  const result = await db.get('explanations', [cardId, depth])

  if (!result) return null
  if (result.expiresAt < Date.now()) {
    // Expired, delete and return null
    await db.delete('explanations', [cardId, depth])
    return null
  }

  return {
    content: result.content,
    depth: result.depth,
    generatedAt: result.generatedAt,
  }
}

export async function getAllCachedExplanations(cardId: string): Promise<ExplanationLayer[]> {
  const db = await getDB()
  const results = await db.getAllFromIndex('explanations', 'by-card', cardId)
  const now = Date.now()

  return results
    .filter((r) => r.expiresAt > now)
    .map((r) => ({
      content: r.content,
      depth: r.depth,
      generatedAt: r.generatedAt,
    }))
    .sort((a, b) => a.depth - b.depth)
}

// Prefetch operations
export async function cachePrefetch(
  cardId: string,
  depth: number,
  content: string,
  priority: number = 1
): Promise<void> {
  const db = await getDB()
  await db.put('prefetch', {
    cardId,
    depth,
    content,
    generatedAt: Date.now(),
    priority,
  })
}

export async function getPrefetch(
  cardId: string,
  depth: number
): Promise<ExplanationLayer | null> {
  const db = await getDB()
  const result = await db.get('prefetch', [cardId, depth])

  if (!result) return null

  return {
    content: result.content,
    depth: result.depth,
    generatedAt: result.generatedAt,
  }
}

export async function clearCardPrefetch(cardId: string): Promise<void> {
  const db = await getDB()
  const keys = await db.getAllKeysFromIndex('prefetch', 'by-card', cardId)
  const tx = db.transaction('prefetch', 'readwrite')
  await Promise.all(keys.map((key) => tx.store.delete(key)))
  await tx.done
}

// Course cache operations
export async function cacheCourse(course: Course): Promise<void> {
  const db = await getDB()
  const now = Date.now()
  await db.put('courses', {
    ...course,
    cachedAt: now,
    expiresAt: now + CACHE_DURATION_MS * 7, // 7 days for courses
  })
}

export async function getCachedCourse(
  code: string,
  university: string
): Promise<Course | null> {
  const db = await getDB()
  const result = await db.get('courses', [code, university])

  if (!result) return null
  if (result.expiresAt < Date.now()) {
    await db.delete('courses', [code, university])
    return null
  }

  const { cachedAt: _cachedAt, expiresAt: _expiresAt, ...course } = result
  return course
}

// Cleanup expired entries
export async function cleanupExpired(): Promise<void> {
  const db = await getDB()
  const now = Date.now()

  // Clean explanations
  const expiredExplanations = await db.getAllFromIndex('explanations', 'by-expiry', IDBKeyRange.upperBound(now))
  const txExp = db.transaction('explanations', 'readwrite')
  await Promise.all(expiredExplanations.map((e) => txExp.store.delete([e.cardId, e.depth])))
  await txExp.done

  // Clean courses
  const expiredCourses = await db.getAllFromIndex('courses', 'by-expiry', IDBKeyRange.upperBound(now))
  const txCourse = db.transaction('courses', 'readwrite')
  await Promise.all(expiredCourses.map((c) => txCourse.store.delete([c.code, c.university])))
  await txCourse.done
}
