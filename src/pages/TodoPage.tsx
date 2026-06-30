import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Todo } from '../db';
import { getAllTodos, addTodo, toggleTodo, deleteTodo, replaceAllTodos } from '../lib/todos';
import { todosToCsv, todosFromCsv, todosToJson, todosFromJson, downloadFile } from '../lib/exportImport';

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    getAllTodos()
      .then(setTodos)
      .catch(() => setError('Failed to load todos'));
  };

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!newTitle.trim()) return;
    await addTodo(newTitle.trim());
    setNewTitle('');
    load();
  }

  async function handleToggle(todo: Todo) {
    await toggleTodo(todo.id, !todo.completed);
    load();
  }

  async function handleDelete(id: number) {
    await deleteTodo(id);
    load();
  }

  function exportCsv() { downloadFile('todos.csv', todosToCsv(todos), 'text/csv'); }
  function exportJson() { downloadFile('todos.json', todosToJson(todos), 'application/json'); }

  async function handleImportFile(file: File) {
    setError(null);
    try {
      const text = await file.text();
      const imported = file.name.endsWith('.json') ? todosFromJson(text) : todosFromCsv(text);
      if (imported.length === 0) { setError('No valid todos found in that file.'); return; }
      await replaceAllTodos(imported);
      load();
    } catch {
      setError('Could not read that file — expected a CSV or JSON export from this app.');
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12 font-sans">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-slate-400 hover:text-slate-600 text-sm">← Apps</Link>
        <h1 className="text-2xl font-semibold text-slate-900">Todos</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">Stored only on this device — nothing is sent anywhere.</p>

      {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add a new todo…"
          className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
        />
        <button onClick={handleAdd} className="bg-slate-900 text-white rounded px-4 py-2 text-sm font-medium">
          Add
        </button>
      </div>

      <ul className="space-y-2 mb-8">
        {todos.length === 0 && <li className="text-sm text-slate-400 italic">Nothing here yet.</li>}
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center justify-between border border-slate-200 rounded px-3 py-2">
            <label className="flex items-center gap-3 flex-1 cursor-pointer">
              <input type="checkbox" checked={todo.completed} onChange={() => handleToggle(todo)} />
              <span className={todo.completed ? 'line-through text-slate-400' : 'text-slate-800'}>
                {todo.title}
              </span>
            </label>
            <button onClick={() => handleDelete(todo.id)} className="text-sm text-red-500 px-2">Delete</button>
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-200 pt-4 flex flex-wrap gap-2">
        <button onClick={exportCsv} className="text-sm border border-slate-300 rounded px-3 py-1.5">Export CSV</button>
        <button onClick={exportJson} className="text-sm border border-slate-300 rounded px-3 py-1.5">Export JSON</button>
        <button onClick={() => fileInputRef.current?.click()} className="text-sm border border-slate-300 rounded px-3 py-1.5">
          Import CSV/JSON
        </button>
        <input
          ref={fileInputRef} type="file" accept=".csv,.json" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = ''; }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-2">Importing replaces your current list — export first if you want a backup.</p>
    </div>
  );
}
