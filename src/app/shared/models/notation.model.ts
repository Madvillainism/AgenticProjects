export type NotationTokenType = 'arrow' | 'neutral' | 'button' | 'combo' | 'text';

export interface NotationToken {
  type: NotationTokenType;
  value: string;
}
