import { Injectable } from '@angular/core';
import Dexie, { type EntityTable } from 'dexie';
import type { TrainingTodo } from '../models/todo.model';
import type { ProNotebookEntry } from '../models/pro-notebook.model';
import type { ThrowSessionStats } from '../models/throw-break.model';

@Injectable({ providedIn: 'root' })
export class MokuDatabase extends Dexie {
  trainingTodos!: EntityTable<TrainingTodo, 'id'>;
  proNotebook!: EntityTable<ProNotebookEntry, 'id'>;
  throwBreakSessions!: EntityTable<ThrowSessionStats, 'id'>;

  constructor() {
    super('MokuAppDB');
    this.version(2).stores({
      trainingTodos: '++id, title, completed, createdAt',
      proNotebook: '++id, characterName, title, createdAt',
      throwBreakSessions: '++id, date, highestStreak',
    });
  }
}
