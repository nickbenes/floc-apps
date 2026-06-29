import { describe, it, expect } from 'vitest';
import { todosToCsv, todosFromCsv, todosToJson, todosFromJson } from './exportImport';
import type { Todo } from '../db';

const sample: Todo[] = [
  { id: 1, title: 'Buy milk', completed: false },
  { id: 2, title: 'Sign up for soccer', completed: true },
];

describe('CSV export/import', () => {
  it('round-trips title and completed through CSV', () => {
    const csv = todosToCsv(sample);
    const imported = todosFromCsv(csv);
    expect(imported).toEqual([
      { title: 'Buy milk', completed: false },
      { title: 'Sign up for soccer', completed: true },
    ]);
  });

  it('drops rows with an empty title', () => {
    const csv = 'title,completed\n,false\nReal task,true\n';
    expect(todosFromCsv(csv)).toEqual([{ title: 'Real task', completed: true }]);
  });

  it('treats any non-"true" completed value as false', () => {
    const csv = 'title,completed\nTask,nope\n';
    expect(todosFromCsv(csv)).toEqual([{ title: 'Task', completed: false }]);
  });
});

describe('JSON export/import', () => {
  it('round-trips title and completed through JSON', () => {
    const json = todosToJson(sample);
    const imported = todosFromJson(json);
    expect(imported).toEqual([
      { title: 'Buy milk', completed: false },
      { title: 'Sign up for soccer', completed: true },
    ]);
  });

  it('throws on non-array JSON', () => {
    expect(() => todosFromJson('{"title": "not an array"}')).toThrow('Expected a JSON array');
  });

  it('skips entries with a missing or blank title', () => {
    const json = JSON.stringify([{ title: '', completed: true }, { title: 'Keep me', completed: false }]);
    expect(todosFromJson(json)).toEqual([{ title: 'Keep me', completed: false }]);
  });
});
