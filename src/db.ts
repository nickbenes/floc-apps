import Dexie, { type EntityTable } from 'dexie';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export class FlocDb extends Dexie {
  declare todos: EntityTable<Todo, 'id'>;

  constructor() {
    super('floc-apps');
    this.version(1).stores({
      todos: '++id, title, completed',
    });
  }
}

export const db = new FlocDb();
