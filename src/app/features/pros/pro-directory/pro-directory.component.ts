import { Component, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { MokuDatabase } from '../../../shared/services/db.service';
import type { ProNotebookEntry } from '../../../shared/models/pro-notebook.model';

interface ProPlayer {
  name: string;
  region: string;
  youtubeQuery: string;
}

interface CharacterEntry {
  character: string;
  slug: string;
  players: ProPlayer[];
}

@Component({
  selector: 'app-pro-directory',
  imports: [FormsModule, NgOptimizedImage],
  templateUrl: './pro-directory.component.html',
  styleUrl: './pro-directory.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProDirectoryComponent {
  private db = inject(MokuDatabase);

  characters = signal<CharacterEntry[]>([]);
  selectedChar = signal<CharacterEntry | null>(null);
  notebook = signal<ProNotebookEntry[]>([]);

  filteredNotebook = computed(() => {
    const char = this.selectedChar();
    if (!char) return [];
    return this.notebook().filter(e => e.characterName === char.character);
  });

  newUrl = signal('');
  newNotes = signal('');

  constructor() {
    this.loadData();
    this.loadNotebook();
  }

  private async loadData(): Promise<void> {
    const { default: data }: { default: CharacterEntry[] } = await import('../../../../assets/data/pro-players.json');
    this.characters.set(data);
    if (data.length > 0) {
      this.selectedChar.set(data[0]);
    }
  }

  private async loadNotebook(): Promise<void> {
    const entries = await this.db.proNotebook.orderBy('createdAt').reverse().toArray();
    this.notebook.set(entries);
  }

  selectCharacter(char: CharacterEntry): void {
    this.selectedChar.set(char);
  }

  searchYouTube(query: string): void {
    const encoded = encodeURIComponent(`${query} Tekken 8 Matches`);
    window.open(`https://www.youtube.com/results?search_query=${encoded}`, '_blank');
  }

  async saveBookmark(): Promise<void> {
    const char = this.selectedChar();
    const url = this.newUrl().trim();
    if (!char || !url) return;
    await this.db.proNotebook.add({
      characterName: char.character,
      title: url,
      url,
      notes: this.newNotes().trim(),
      createdAt: new Date(),
    });
    this.newUrl.set('');
    this.newNotes.set('');
    await this.loadNotebook();
  }

  async deleteBookmark(id: number): Promise<void> {
    await this.db.proNotebook.delete(id);
    await this.loadNotebook();
  }
}
