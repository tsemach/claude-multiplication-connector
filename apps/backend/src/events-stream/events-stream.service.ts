import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface MultiplicationResult {
  /** Grid dimension n (full n×n table: row i has i×1 … i×n). */
  size: number;
  /** grid[i][j] = (i + 1) × (j + 1) for i,j in 0..size-1 */
  grid: number[][];
  timestamp: string;
  requestedBy: string;
}

@Injectable()
export class EventsStreamService {
  private eventSubject = new Subject<MultiplicationResult>();

  get events$() {
    return this.eventSubject.asObservable();
  }

  emit(result: MultiplicationResult) {
    this.eventSubject.next(result);
  }
}
