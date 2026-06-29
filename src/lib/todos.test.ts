import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import { getAllTodos, addTodo, toggleTodo, deleteTodo, replaceAllTodos } from './todos';

describe('todos.ts (Dexie/IndexedDB via fake-indexeddb)', () => {
  beforeEach(async () => {
    await db.todos.clear();
  });

  it('starts empty', async () => {
    expect(await getAllTodos()).toEqual([]);
  });

  it('adds a todo, defaulting completed to false', async () => {
    const todo = await addTodo('Buy milk');
    expect(todo).toMatchObject({ title: 'Buy milk', completed: false });
    expect(await getAllTodos()).toEqual([todo]);
  });

  it('toggles completed', async () => {
    const todo = await addTodo('Sign up for soccer');
    await toggleTodo(todo.id, true);
    const [reloaded] = await getAllTodos();
    expect(reloaded.completed).toBe(true);
  });

  it('deletes a todo', async () => {
    const todo = await addTodo('Temporary');
    await deleteTodo(todo.id);
    expect(await getAllTodos()).toEqual([]);
  });

  it('replaceAllTodos clears existing todos and inserts the new set', async () => {
    await addTodo('Old task');
    await replaceAllTodos([
      { title: 'Imported one', completed: false },
      { title: 'Imported two', completed: true },
    ]);
    const all = await getAllTodos();
    expect(all.map(t => t.title)).toEqual(['Imported one', 'Imported two']);
  });
});
