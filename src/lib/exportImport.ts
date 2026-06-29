import Papa from 'papaparse';
import type { Todo } from '../db';

type TodoInput = Pick<Todo, 'title' | 'completed'>;

export function todosToCsv(todos: Todo[]): string {
  return Papa.unparse(
    todos.map(t => ({ title: t.title, completed: t.completed })),
    { columns: ['title', 'completed'] }
  );
}

export function todosFromCsv(csv: string): TodoInput[] {
  const { data } = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  return data
    .filter(row => typeof row.title === 'string' && row.title.trim() !== '')
    .map(row => ({
      title: row.title.trim(),
      completed: String(row.completed).trim().toLowerCase() === 'true',
    }));
}

export function todosToJson(todos: Todo[]): string {
  return JSON.stringify(
    todos.map(t => ({ title: t.title, completed: t.completed })),
    null,
    2
  );
}

export function todosFromJson(json: string): TodoInput[] {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error('Expected a JSON array of todos');
  return parsed
    .filter((item): item is { title: unknown; completed: unknown } => typeof item === 'object' && item !== null)
    .filter(item => typeof item.title === 'string' && item.title.trim() !== '')
    .map(item => ({
      title: (item.title as string).trim(),
      completed: Boolean(item.completed),
    }));
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
