// ─── Puzzle bank types ───────────────────────────────────────────────────────
// Only logic_puzzle for now; union broadens as activity types are added.

export type ActivityType = 'logic_puzzle'

export type Difficulty = 'warmup' | 'standard' | 'challenge'

/** Categories are Record<categoryName, allowedValues[]>.
 *  e.g. { breed: ['calico','ragdoll'], treat: ['tuna','salmon'] } */
export type Categories = Record<string, string[]>

/** Solution maps each entity to its full assignment across all categories.
 *  e.g. { Pearl: { breed: 'calico', 'nap spot': 'sunny windowsill' } } */
export type Solution = Record<string, Record<string, string>>

export interface LogicPuzzle {
  id: string
  type: 'logic_puzzle'
  title: string
  /** Inclusive grade range this puzzle is calibrated for. */
  grade_min: number
  grade_max: number
  /** Searchable theme tags, lowercase kebab-case. e.g. ['cats','calico','ragdoll'] */
  themes: string[]
  difficulty: Difficulty
  /** Grid dimensions as "${rows}x${cols}" where rows = entity count, cols = sum of category value counts. */
  grid_size: `${number}x${number}`
  entities: string[]
  categories: Categories
  /** Human-readable clue text for display. Order matters — rendered as a numbered list. */
  clues: string[]
  solution: Solution
  /** Always true in the published bank — unverified puzzles must never be added. */
  verified: true
  verified_at: string  // ISO 8601 date
}

export type Puzzle = LogicPuzzle

// ─── Sheet builder request ────────────────────────────────────────────────────

export interface SheetRequest {
  grade: number
  /** Empty = match any theme */
  themes: string[]
  count: number
  types: ActivityType[]
  /** Optional: filter to specific difficulty */
  difficulty?: Difficulty
}

// ─── Query / filter types ─────────────────────────────────────────────────────

export interface PuzzleQuery {
  grade?: number
  themes?: string[]
  types?: ActivityType[]
  difficulty?: Difficulty
  excludeIds?: string[]
}
