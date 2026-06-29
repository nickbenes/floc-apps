import Dexie, { type EntityTable } from 'dexie';

// Architecture-only scaffold (FR-025) — proves the IndexedDB data layer is wired via Dexie.
// No real tables yet; the first module (todos) defines its own schema when it's built.

export class FlocDb extends Dexie {
  declare _placeholder: EntityTable<{ id: number }, 'id'>;

  constructor() {
    super('floc-apps');
    this.version(1).stores({
      _placeholder: '++id',
    });
  }
}

export const db = new FlocDb();
