import { useState } from 'react';
import { Link } from 'react-router-dom';
import { selectPuzzles } from './puzzleBank';
import type { LogicPuzzle, Difficulty } from './types';
import PuzzleCard from './PuzzleCard';

const ALL_THEMES = [
  { id: 'cats',         label: 'Cats' },
  { id: 'space',        label: 'Space' },
  { id: 'ocean',        label: 'Ocean' },
  { id: 'food',         label: 'Food' },
  { id: 'animals',      label: 'Animals' },
];

const COUNTS = [1, 2, 3, 4, 5, 6];

export default function ActivitySheetsPage() {
  const [grade, setGrade] = useState(3);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [count, setCount] = useState(3);
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [puzzles, setPuzzles] = useState<LogicPuzzle[]>([]);
  const [searched, setSearched] = useState(false);

  function toggleTheme(id: string) {
    setSelectedThemes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  }

  function buildSheet() {
    const selected = selectPuzzles({
      grade,
      themes: selectedThemes,
      count,
      types: ['logic_puzzle'],
      difficulty: difficulty || undefined,
    });
    setPuzzles(selected);
    setSearched(true);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 py-8 print:hidden">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-slate-400 hover:text-slate-600 text-sm">← Apps</Link>
          <h1 className="text-2xl font-semibold text-slate-900">Activity Sheets</h1>
        </div>

        {/* Controls */}
        <div className="bg-slate-50 rounded-xl p-5 space-y-5">
          {/* Grade */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Grade: <span className="font-bold text-slate-900">{grade}</span>
            </label>
            <input
              type="range" min={1} max={9} value={grade}
              onChange={e => setGrade(Number(e.target.value))}
              className="w-full accent-violet-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1</span><span>5</span><span>9</span>
            </div>
          </div>

          {/* Themes */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Theme <span className="text-slate-400 font-normal">(pick any, or none for all)</span></p>
            <div className="flex flex-wrap gap-2">
              {ALL_THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => toggleTheme(t.id)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedThemes.includes(t.id)
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-violet-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Count + Difficulty row */}
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Number of puzzles</p>
              <div className="flex gap-2">
                {COUNTS.map(n => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                      count === n
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-violet-400'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Difficulty</p>
              <div className="flex gap-2">
                {(['', 'warmup', 'standard', 'challenge'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                      difficulty === d
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-violet-400'
                    }`}
                  >
                    {d === '' ? 'Mix' : d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={buildSheet}
              className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Build Sheet
            </button>
            {puzzles.length > 0 && (
              <button
                onClick={() => window.print()}
                className="border border-slate-300 hover:border-slate-400 text-slate-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Print / Save PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="max-w-3xl mx-auto px-6 pb-12 print:px-0 print:py-0 print:max-w-none">
          {puzzles.length === 0 ? (
            <p className="text-slate-500 text-sm print:hidden">
              No puzzles found for those filters — try a different grade or theme.
            </p>
          ) : (
            <div className="space-y-6">
              {puzzles.map((puzzle, i) => (
                <PuzzleCard key={puzzle.id} puzzle={puzzle} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
