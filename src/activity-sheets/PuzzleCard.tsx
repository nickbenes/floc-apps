import type { LogicPuzzle } from './types';

const BORDER_COLORS = [
  'border-blue-400', 'border-violet-400', 'border-orange-400',
  'border-emerald-400', 'border-pink-400', 'border-amber-400',
];
const TITLE_COLORS = [
  'text-blue-600', 'text-violet-600', 'text-orange-500',
  'text-emerald-600', 'text-pink-600', 'text-amber-600',
];

interface Props {
  puzzle: LogicPuzzle;
  index: number;
}

export default function PuzzleCard({ puzzle, index }: Props) {
  const color = index % BORDER_COLORS.length;
  const allCategoryValues = Object.values(puzzle.categories).flat();

  return (
    <div className={`border-2 ${BORDER_COLORS[color]} rounded-xl p-5 break-inside-avoid`}>
      <h2 className={`font-bold text-base mb-3 ${TITLE_COLORS[color]}`}>
        {puzzle.title}
        <span className="ml-2 text-xs font-normal text-slate-400 normal-case">
          ({puzzle.difficulty})
        </span>
      </h2>

      <ol className="text-sm text-slate-700 space-y-1 mb-4 list-decimal list-inside">
        {puzzle.clues.map((clue, i) => (
          <li key={i}>{clue}</li>
        ))}
      </ol>

      <div className="overflow-x-auto">
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr>
              <th className="border border-slate-300 px-2 py-1 bg-slate-50 min-w-[5rem]" />
              {allCategoryValues.map(val => (
                <th
                  key={val}
                  className="border border-slate-300 px-1 py-1 bg-slate-50 font-mono font-bold text-center whitespace-nowrap"
                >
                  {val}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {puzzle.entities.map(entity => (
              <tr key={entity}>
                <td className="border border-slate-300 px-2 py-1 font-mono text-slate-700 whitespace-nowrap">
                  {entity}
                </td>
                {allCategoryValues.map(val => (
                  <td key={val} className="border border-slate-300 px-1 py-2 text-center" />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
