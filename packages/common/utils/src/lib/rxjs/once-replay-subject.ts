import { ReplaySubject } from 'rxjs';

export class OnceReplaySubject<T> extends ReplaySubject<T> {
  override next(value: T) {
    super.next(value);
    this.complete();
  }
}
