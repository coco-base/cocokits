/** @module rxjs */

import { Subject } from 'rxjs';

export class OnceSubject<T> extends Subject<T> {
  override next(value: T) {
    super.next(value);
    this.complete();
  }
}
