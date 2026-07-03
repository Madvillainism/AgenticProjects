import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import type { NotationToken } from '../../../shared/models/notation.model';

@Component({
  selector: 'app-move-item',
  imports: [],
  templateUrl: './move-item.component.html',
  styleUrl: './move-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveItemComponent {
  token = input.required<NotationToken>();
}
