import { db, type Todo } from '../db';

export async function getAllTodos(): Promise<Todo[]> {
  return db.todos.orderBy('id').toArray();
}

export async function addTodo(title: string): Promise<Todo> {
  const id = await db.todos.add({ title, completed: false } as Todo);
  return { id, title, completed: false };
}

export async function toggleTodo(id: number, completed: boolean): Promise<void> {
  await db.todos.update(id, { completed });
}

export async function updateTodoTitle(id: number, title: string): Promise<void> {
  await db.todos.update(id, { title });
}

export async function deleteTodo(id: number): Promise<void> {
  await db.todos.delete(id);
}

export async function replaceAllTodos(todos: Pick<Todo, 'title' | 'completed'>[]): Promise<void> {
  await db.transaction('rw', db.todos, async () => {
    await db.todos.clear();
    await db.todos.bulkAdd(todos as Todo[]);
  });
}
