import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MokuDatabase } from '../../../shared/services/db.service';
import type { TrainingTodo } from '../../../shared/models/todo.model';

@Component({
  selector: 'app-todo-list',
  imports: [FormsModule],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListComponent {
  private db = inject(MokuDatabase);

  todos = signal<TrainingTodo[]>([]);
  newTitle = signal('');

  constructor() {
    this.loadTodos();
  }

  private async loadTodos(): Promise<void> {
    const items = await this.db.trainingTodos
      .orderBy('createdAt')
      .reverse()
      .toArray();
    this.todos.set(items);
  }

  async addTodo(): Promise<void> {
    const title = this.newTitle().trim();
    if (!title) return;
    const id = await this.db.trainingTodos.add({
      title,
      completed: false,
      createdAt: new Date(),
    });
    this.todos.update(list => [
      { id, title, completed: false, createdAt: new Date() },
      ...list,
    ]);
    this.newTitle.set('');
  }

  async toggleTodo(todo: TrainingTodo): Promise<void> {
    await this.db.trainingTodos.update(todo.id!, { completed: !todo.completed });
    this.todos.update(list =>
      list.map(t => (t.id === todo.id ? { ...t, completed: !t.completed } : t))
    );
  }

  async deleteTodo(id: number): Promise<void> {
    await this.db.trainingTodos.delete(id);
    this.todos.update(list => list.filter(t => t.id !== id));
  }
}
