import { Component, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { MoveItemComponent } from '../move-item/move-item.component';
import { PunishableMovesService } from '../../../shared/services/punishable-moves.service';
import { parseTekkenNotation } from '../../../shared/utils/notation-parser';
import { CATEGORY_ORDER, CATEGORY_LABELS } from '../../../shared/models/punishable-move.model';
import type { CharacterPunishData, PunishableMove, PunishCategory } from '../../../shared/models/punishable-move.model';
import type { NotationToken } from '../../../shared/models/notation.model';

interface CharInfo {
  character: string;
  slug: string;
}

const CHARACTERS: CharInfo[] = [
  { character: 'Alisa', slug: 'alisa' },
  { character: 'Anna', slug: 'anna' },
  { character: 'Armor King', slug: 'armor-king' },
  { character: 'Asuka', slug: 'asuka' },
  { character: 'Azucena', slug: 'azucena' },
  { character: 'Bryan Fury', slug: 'bryan' },
  { character: 'Claudio', slug: 'claudio' },
  { character: 'Clive', slug: 'clive' },
  { character: 'Devil Jin', slug: 'devil-jin' },
  { character: 'Dragunov', slug: 'dragunov' },
  { character: 'Eddy', slug: 'eddy' },
  { character: 'Fahkumram', slug: 'fahkumram' },
  { character: 'Feng Wei', slug: 'feng' },
  { character: 'Heihachi', slug: 'heihachi' },
  { character: 'Hwoarang', slug: 'hwoarang' },
  { character: 'Jack-8', slug: 'jack-8' },
  { character: 'Jin Kazama', slug: 'jin' },
  { character: 'Jun', slug: 'jun' },
  { character: 'Kazuya Mishima', slug: 'kazuya' },
  { character: 'King', slug: 'king' },
  { character: 'Kuma', slug: 'kuma' },
  { character: 'Kunimitsu', slug: 'kunimitsu' },
  { character: 'Lars Alexandersson', slug: 'lars' },
  { character: 'Law', slug: 'law' },
  { character: 'Lee', slug: 'lee' },
  { character: 'Leo', slug: 'leo' },
  { character: 'Leroy', slug: 'leroy' },
  { character: 'Lidia', slug: 'lidia' },
  { character: 'Lili', slug: 'lili' },
  { character: 'Miary-zo', slug: 'miary-zo' },
  { character: 'Nina', slug: 'nina' },
  { character: 'Panda', slug: 'panda' },
  { character: 'Paul Phoenix', slug: 'paul' },
  { character: 'Raven', slug: 'raven' },
  { character: 'Reina', slug: 'reina' },
  { character: 'Shaheen', slug: 'shaheen' },
  { character: 'Steve Fox', slug: 'steve' },
  { character: 'Victor', slug: 'victor' },
  { character: 'Xiaoyu', slug: 'xiaoyu' },
  { character: 'Yoshimitsu', slug: 'yoshimitsu' },
  { character: 'Zafina', slug: 'zafina' },
];

@Component({
  selector: 'app-move-list',
  imports: [FormsModule, NgOptimizedImage, MoveItemComponent],
  templateUrl: './move-list.component.html',
  styleUrl: './move-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveListComponent {
  private punishSvc = inject(PunishableMovesService);

  characters = CHARACTERS;
  readonly CATEGORY_ORDER = CATEGORY_ORDER;
  selectedSlug = signal<string>('');
  searchQuery = signal('');
  activeFilter = signal<PunishCategory | null>(null);

  selectedChar = computed<CharacterPunishData | undefined>(() =>
    this.punishSvc.getBySlug(this.selectedSlug())
  );

  groupedMoves = computed(() => {
    const data = this.selectedChar();
    if (!data) return [];
    const q = this.searchQuery().toLowerCase();
    const cat = this.activeFilter();
    let filtered = data.punishableMoves;
    if (q) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(q) || m.notation.toLowerCase().includes(q)
      );
    }
    if (cat) {
      filtered = filtered.filter(m => m.category === cat);
    }
    return CATEGORY_ORDER
      .map(c => ({
        category: c,
        label: CATEGORY_LABELS[c],
        moves: filtered.filter(m => m.category === c),
      }))
      .filter(g => g.moves.length > 0);
  });

  stats = computed(() => {
    const data = this.selectedChar();
    if (!data) return null;
    const total = data.punishableMoves.length;
    const counts = CATEGORY_ORDER.map(cat => ({
      category: cat,
      count: data.punishableMoves.filter(m => m.category === cat).length,
    }));
    return { total, counts };
  });

  parsedTokens = signal<NotationToken[]>([]);

  selectCharacter(slug: string): void {
    this.selectedSlug.set(slug);
    this.parsedTokens.set([]);
    this.searchQuery.set('');
    this.activeFilter.set(null);
  }

  showNotation(notation: string): void {
    this.parsedTokens.set(parseTekkenNotation(notation));
  }

  setFilter(cat: PunishCategory | null): void {
    this.activeFilter.set(this.activeFilter() === cat ? null : cat);
  }

  trackBySlug(_: number, c: CharInfo): string {
    return c.slug;
  }

  trackByMove(_: number, m: PunishableMove): string {
    return m.name;
  }

  trackByGroup(_: number, g: { category: PunishCategory }): PunishCategory {
    return g.category;
  }
}
