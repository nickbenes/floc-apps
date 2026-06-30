import type { Puzzle, PuzzleQuery, SheetRequest, Difficulty } from './types'
import rawBank from '../data/puzzles.json'

const bank = rawBank as unknown as Puzzle[]

// ─── Schema validation ────────────────────────────────────────────────────────

export interface ValidationError {
  id: string
  field: string
  message: string
}

/** Validates a single puzzle's internal consistency. Returns [] if valid. */
export function validatePuzzle(p: unknown): ValidationError[] {
  const errors: ValidationError[] = []
  if (typeof p !== 'object' || p === null) return [{ id: '?', field: 'root', message: 'Not an object' }]
  const puzzle = p as Record<string, unknown>
  const id = typeof puzzle.id === 'string' ? puzzle.id : '?'

  const require = (field: string, type: string, check?: (v: unknown) => boolean) => {
    const v = puzzle[field]
    if (v === undefined) { errors.push({ id, field, message: 'Required field missing' }); return }
    if (typeof v !== type) { errors.push({ id, field, message: `Expected ${type}, got ${typeof v}` }); return }
    if (check && !check(v)) errors.push({ id, field, message: 'Failed value check' })
  }

  require('id', 'string', v => /^[a-z0-9-]+$/.test(v as string))
  require('type', 'string', v => v === 'logic_puzzle')
  require('title', 'string')
  require('grade_min', 'number', v => (v as number) >= 1 && (v as number) <= 12)
  require('grade_max', 'number', v => (v as number) >= 1 && (v as number) <= 12)
  require('difficulty', 'string', v => ['warmup', 'standard', 'challenge'].includes(v as string))
  require('verified', 'boolean', v => v === true)
  require('verified_at', 'string', v => /^\d{4}-\d{2}-\d{2}/.test(v as string))

  if (!Array.isArray(puzzle.themes)) errors.push({ id, field: 'themes', message: 'Must be an array' })
  if (!Array.isArray(puzzle.entities) || (puzzle.entities as unknown[]).length < 2)
    errors.push({ id, field: 'entities', message: 'Must be an array with ≥2 items' })
  if (!Array.isArray(puzzle.clues) || (puzzle.clues as unknown[]).length === 0)
    errors.push({ id, field: 'clues', message: 'Must be a non-empty array' })

  if (typeof puzzle.categories !== 'object' || puzzle.categories === null || Array.isArray(puzzle.categories)) {
    errors.push({ id, field: 'categories', message: 'Must be a non-null object' })
  } else {
    const cats = puzzle.categories as Record<string, unknown>
    for (const [k, v] of Object.entries(cats)) {
      if (!Array.isArray(v) || v.length < 2)
        errors.push({ id, field: `categories.${k}`, message: 'Must be an array with ≥2 values' })
    }
  }

  // Solution must assign every entity to every category
  if (typeof puzzle.solution !== 'object' || puzzle.solution === null) {
    errors.push({ id, field: 'solution', message: 'Must be a non-null object' })
  } else if (Array.isArray(puzzle.entities) && typeof puzzle.categories === 'object' && puzzle.categories !== null) {
    const solution = puzzle.solution as Record<string, Record<string, string>>
    const entities = puzzle.entities as string[]
    const categories = puzzle.categories as Record<string, string[]>
    for (const entity of entities) {
      if (!solution[entity]) {
        errors.push({ id, field: `solution.${entity}`, message: 'Entity missing from solution' })
        continue
      }
      for (const [cat, vals] of Object.entries(categories)) {
        const assigned = solution[entity][cat]
        if (!assigned) errors.push({ id, field: `solution.${entity}.${cat}`, message: 'Category not assigned' })
        else if (!vals.includes(assigned)) errors.push({ id, field: `solution.${entity}.${cat}`, message: `Value "${assigned}" not in category values` })
      }
    }
    // Check that every category value appears exactly once
    for (const [cat, vals] of Object.entries(categories)) {
      const assigned = entities.map(e => solution[e]?.[cat]).filter(Boolean)
      const unique = new Set(assigned)
      if (unique.size !== vals.length || assigned.length !== vals.length)
        errors.push({ id, field: `solution.${cat}`, message: 'Category values must appear exactly once each' })
    }
  }

  if (typeof puzzle.grade_min === 'number' && typeof puzzle.grade_max === 'number') {
    if (puzzle.grade_min > puzzle.grade_max)
      errors.push({ id, field: 'grade_min', message: 'grade_min must be ≤ grade_max' })
  }

  return errors
}

/** Validates all puzzles in the bank. Throws if any fail. */
export function validateBank(puzzles: unknown[] = bank): void {
  const allErrors: ValidationError[] = []
  const ids = new Set<string>()
  for (const p of puzzles) {
    const errs = validatePuzzle(p)
    allErrors.push(...errs)
    const id = (p as Record<string, unknown>).id as string
    if (id && ids.has(id)) allErrors.push({ id, field: 'id', message: 'Duplicate id' })
    if (id) ids.add(id)
  }
  if (allErrors.length > 0) {
    throw new Error(`Puzzle bank validation failed:\n${allErrors.map(e => `  ${e.id}.${e.field}: ${e.message}`).join('\n')}`)
  }
}

// ─── Query ────────────────────────────────────────────────────────────────────

/** Returns all puzzles matching the query. Order is stable (bank insertion order). */
export function queryPuzzles(query: PuzzleQuery, puzzles: Puzzle[] = bank): Puzzle[] {
  return puzzles.filter(p => {
    if (query.grade !== undefined && (p.grade_min > query.grade || p.grade_max < query.grade)) return false
    if (query.types?.length && !query.types.includes(p.type)) return false
    if (query.difficulty && p.difficulty !== query.difficulty) return false
    if (query.themes?.length && !query.themes.some(t => p.themes.includes(t))) return false
    if (query.excludeIds?.includes(p.id)) return false
    return true
  })
}

/**
 * Selects puzzles for a sheet request. Spreads difficulty when count allows:
 * tries to include one warmup and one challenge before filling with standard.
 * Returns up to `request.count` puzzles; may return fewer if the bank can't satisfy.
 */
export function selectPuzzles(request: SheetRequest, puzzles: Puzzle[] = bank): Puzzle[] {
  const base: PuzzleQuery = { grade: request.grade, themes: request.themes, types: request.types }
  const pool = queryPuzzles(base, puzzles)

  if (request.difficulty) {
    return pool.filter(p => p.difficulty === request.difficulty).slice(0, request.count)
  }

  const selected: Puzzle[] = []
  const used = new Set<string>()

  const pick = (difficulty: Difficulty, n: number) => {
    const candidates = pool.filter(p => p.difficulty === difficulty && !used.has(p.id))
    for (const p of candidates.slice(0, n)) { selected.push(p); used.add(p.id) }
  }

  // 1 warmup, fill middle with standard, 1 challenge at end (if count allows)
  if (request.count >= 3) {
    pick('warmup', 1)
    pick('standard', request.count - 2)
    pick('challenge', 1)
  } else {
    pick('warmup', 1)
    pick('standard', request.count - 1)
  }

  // Back-fill if difficulty tiers didn't have enough
  if (selected.length < request.count) {
    const remaining = pool.filter(p => !used.has(p.id)).slice(0, request.count - selected.length)
    selected.push(...remaining)
  }

  return selected
}

export { bank }
