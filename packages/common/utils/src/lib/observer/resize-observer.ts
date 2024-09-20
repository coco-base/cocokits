/** @module observer */

import { Observable, Subscriber } from 'rxjs';
import { share } from 'rxjs/operators';

import { toArray } from '../transform/to-array';

export type ResizeObserverConfig = ResizeObserverOptions;

export interface ResizeObserverChanges {
  entries: ResizeObserverEntry[];
  observer: ResizeObserver;
}

export function resizeObserver$(elems: Element | Element[], config?: ResizeObserverConfig) {
  const elemsList = toArray(elems);

  const onResizeChange = (subscriber: Subscriber<ResizeObserverChanges>) => {
    const callBack: ResizeObserverCallback = (entries, observer) => subscriber.next({ entries, observer });
    const onUnSubscribe = () => resizeObserver.disconnect();
    const resizeObserver = new ResizeObserver(callBack);
    elemsList.forEach((elem) => resizeObserver.observe(elem, config || {}));
    return onUnSubscribe;
  };

  return new Observable<ResizeObserverChanges>(onResizeChange).pipe(share());
}
