import { describe, it, expect } from 'vitest'
import { validatePuzzle, validateBank, queryPuzzles, selectPuzzles } from './puzzleBank'
import type { Puzzle, LogicPuzzle, ActivityType } from './types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const VALID_PUZZLE: LogicPuzzle = {
  id: 'test-nap-3x3',
  type: 'logic_puzzle',
  title: 'Naptime',
  grade_min: 1,
  grade_max: 3,
  themes: ['cats'],
  difficulty: 'warmup',
  grid_size: '3x6',
  entities: ['Biscuit', 'Shadow', 'Pumpkin'],
  categories: {
    color:      ['black', 'orange', 'gray'],
    'nap spot': ['laundry basket', 'cardboard box', 'windowsill'],
  },
  clues: ['Pumpkin is not black.', 'Shadow is not orange.'],
  solution: {
    Biscuit: { color: 'black',  'nap spot': 'laundry basket' },
    Shadow:  { color: 'gray',   'nap spot': 'windowsill' },
    Pumpkin: { color: 'orange', 'nap spot': 'cardboard box' },
  },
  verified: true,
  verified_at: '2026-06-29',
}

const makeBank = (...overrides: Partial<LogicPuzzle>[]): Puzzle[] =>
  overrides.map((o, i) => ({ ...VALID_PUZZLE, id: `puzzle-${i}`, ...o }))

// ─── validatePuzzle ───────────────────────────────────────────────────────────

describe('validatePuzzle', () => {
  it('returns no errors for a valid puzzle', () => {
    expect(validatePuzzle(VALID_PUZZLE)).toHaveLength(0)
  })

  it('rejects missing required fields', () => {
    const { title: _t, ...noTitle } = VALID_PUZZLE
    const errors = validatePuzzle(noTitle)
    expect(errors.some(e => e.field === 'title')).toBe(true)
  })

  it('rejects non-boolean or false verified field', () => {
    const errors = validatePuzzle({ ...VALID_PUZZLE, verified: false as unknown as true })
    expect(errors.some(e => e.field === 'verified')).toBe(true)
  })

  it('rejects grade_min > grade_max', () => {
    const errors = validatePuzzle({ ...VALID_PUZZLE, grade_min: 8, grade_max: 3 })
    expect(errors.some(e => e.field === 'grade_min')).toBe(true)
  })

  it('rejects solution with wrong category value', () => {
    const bad = {
      ...VALID_PUZZLE,
      solution: {
        ...VALID_PUZZLE.solution,
        Biscuit: { color: 'purple', 'nap spot': 'laundry basket' }, // 'purple' not in categories
      },
    }
    const errors = validatePuzzle(bad)
    expect(errors.some(e => e.field.includes('solution.Biscuit.color'))).toBe(true)
  })

  it('rejects solution where a category value appears twice', () => {
    const bad = {
      ...VALID_PUZZLE,
      solution: {
        Biscuit: { color: 'black',  'nap spot': 'laundry basket' },
        Shadow:  { color: 'black',  'nap spot': 'windowsill' },    // 'black' duplicated
        Pumpkin: { color: 'orange', 'nap spot': 'cardboard box' },
      },
    }
    const errors = validatePuzzle(bad)
    expect(errors.some(e => e.field === 'solution.color')).toBe(true)
  })

  it('rejects solution missing an entity', () => {
    const { Shadow: _s, ...noShadow } = VALID_PUZZLE.solution
    const errors = validatePuzzle({ ...VALID_PUZZLE, solution: noShadow })
    expect(errors.some(e => e.field === 'solution.Shadow')).toBe(true)
  })

  it('rejects non-array clues', () => {
    const errors = validatePuzzle({ ...VALID_PUZZLE, clues: 'a clue' as unknown as string[] })
    expect(errors.some(e => e.field === 'clues')).toBe(true)
  })

  it('rejects id with uppercase or spaces', () => {
    const errors = validatePuzzle({ ...VALID_PUZZLE, id: 'My Puzzle' })
    expect(errors.some(e => e.field === 'id')).toBe(true)
  })
})

// ─── validateBank ─────────────────────────────────────────────────────────────

describe('validateBank', () => {
  it('passes for a bank of valid puzzles', () => {
    expect(() => validateBank(makeBank({}, { id: 'puzzle-1' }))).not.toThrow()
  })

  it('throws for duplicate ids', () => {
    const dupes = [VALID_PUZZLE, { ...VALID_PUZZLE }]  // same id
    expect(() => validateBank(dupes)).toThrow(/Duplicate id/)
  })

  it('throws and names every invalid puzzle', () => {
    const bad = makeBank({ title: undefined as unknown as string }, {})
    expect(() => validateBank(bad)).toThrow(/puzzle-0/)
  })

  it('passes against the actual seed bank', async () => {
    // Importing bank exercises the real puzzles.json — catches regressions
    const { bank } = await import('./puzzleBank')
    expect(() => validateBank(bank)).not.toThrow()
  })
})

// ─── queryPuzzles ─────────────────────────────────────────────────────────────

describe('queryPuzzles', () => {
  const pool = makeBank(
    { id: 'p0', grade_min: 1, grade_max: 3, themes: ['cats'], difficulty: 'warmup' },
    { id: 'p1', grade_min: 4, grade_max: 6, themes: ['cats', 'space'], difficulty: 'standard' },
    { id: 'p2', grade_min: 4, grade_max: 6, themes: ['space'], difficulty: 'challenge' },
    { id: 'p3', grade_min: 6, grade_max: 9, themes: ['cats'], difficulty: 'challenge' },
  )

  it('returns all puzzles when query is empty', () => {
    expect(queryPuzzles({}, pool)).toHaveLength(4)
  })

  it('filters by grade', () => {
    const results = queryPuzzles({ grade: 5 }, pool)
    expect(results.map(p => p.id)).toEqual(['p1', 'p2'])
  })

  it('grade boundary: grade_min and grade_max are inclusive', () => {
    expect(queryPuzzles({ grade: 1 }, pool).map(p => p.id)).toContain('p0')
    expect(queryPuzzles({ grade: 3 }, pool).map(p => p.id)).toContain('p0')
    expect(queryPuzzles({ grade: 4 }, pool).map(p => p.id)).not.toContain('p0')
  })

  it('filters by theme (OR logic — any match suffices)', () => {
    const results = queryPuzzles({ themes: ['space'] }, pool)
    expect(results.map(p => p.id)).toEqual(['p1', 'p2'])
  })

  it('filters by difficulty', () => {
    expect(queryPuzzles({ difficulty: 'warmup' }, pool).map(p => p.id)).toEqual(['p0'])
    expect(queryPuzzles({ difficulty: 'challenge' }, pool).map(p => p.id)).toEqual(['p2', 'p3'])
  })

  it('excludes ids in excludeIds', () => {
    const results = queryPuzzles({ excludeIds: ['p1', 'p2'] }, pool)
    expect(results.map(p => p.id)).toEqual(['p0', 'p3'])
  })

  it('combines filters with AND logic', () => {
    const results = queryPuzzles({ grade: 6, themes: ['cats'], difficulty: 'challenge' }, pool)
    expect(results.map(p => p.id)).toEqual(['p3'])
  })

  it('returns empty array when nothing matches', () => {
    expect(queryPuzzles({ grade: 12 }, pool)).toHaveLength(0)
  })
})

// ─── selectPuzzles ────────────────────────────────────────────────────────────

describe('selectPuzzles', () => {
  const pool = makeBank(
    { id: 'w1', grade_min: 3, grade_max: 5, themes: ['cats'], difficulty: 'warmup' },
    { id: 'w2', grade_min: 3, grade_max: 5, themes: ['cats'], difficulty: 'warmup' },
    { id: 's1', grade_min: 3, grade_max: 5, themes: ['cats'], difficulty: 'standard' },
    { id: 's2', grade_min: 3, grade_max: 5, themes: ['cats'], difficulty: 'standard' },
    { id: 'c1', grade_min: 3, grade_max: 5, themes: ['cats'], difficulty: 'challenge' },
  )

  const req = { grade: 4, themes: ['cats'], count: 3, types: ['logic_puzzle'] as ActivityType[] }

  it('returns at most count puzzles', () => {
    expect(selectPuzzles({ ...req, count: 2 }, pool)).toHaveLength(2)
  })

  it('includes 1 warmup + standard fill + 1 challenge when count ≥ 3', () => {
    const selected = selectPuzzles(req, pool)
    expect(selected).toHaveLength(3)
    expect(selected[0].difficulty).toBe('warmup')
    expect(selected[selected.length - 1].difficulty).toBe('challenge')
  })

  it('does not repeat puzzles', () => {
    const selected = selectPuzzles({ ...req, count: 5 }, pool)
    const ids = selected.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('filters by themes', () => {
    const spacePool = makeBank(
      { id: 'sc', grade_min: 4, grade_max: 6, themes: ['space'], difficulty: 'standard' },
    )
    const selected = selectPuzzles({ ...req, themes: ['space'] }, [...pool, ...spacePool])
    expect(selected.every(p => p.themes.includes('space'))).toBe(true)
  })

  it('returns fewer than count if pool is too small', () => {
    const tiny = makeBank({ id: 'only', grade_min: 4, grade_max: 4, themes: ['cats'], difficulty: 'warmup' })
    const selected = selectPuzzles({ ...req, grade: 4, count: 5 }, tiny)
    expect(selected.length).toBeLessThanOrEqual(1)
  })
})
