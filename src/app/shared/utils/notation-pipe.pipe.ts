import { Pipe, type PipeTransform } from '@angular/core';
import { parseTekkenNotation } from './notation-parser';
import type { NotationToken } from '../models/notation.model';

@Pipe({ name: 'tekkenNotation', pure: true })
export class NotationPipe implements PipeTransform {
  transform(value: string): NotationToken[] {
    if (!value) return [];
    return parseTekkenNotation(value);
  }
}
