export interface PunishableMove {
  name: string;
  notation: string;
  startup: string;
  onBlock: string;
  onHit: string;
  category: PunishCategory;
}

export type PunishCategory = 'launch-punishable' | 'punishable';

export interface CharacterPunishData {
  character: string;
  slug: string;
  punishableMoves: PunishableMove[];
}

export const CATEGORY_LABELS: Record<PunishCategory, string> = {
  'launch-punishable': 'LAUNCH PUNISHABLE',
  'punishable': 'PUNISHABLE',
};

export const CATEGORY_ORDER: PunishCategory[] = [
  'launch-punishable',
  'punishable',
];
