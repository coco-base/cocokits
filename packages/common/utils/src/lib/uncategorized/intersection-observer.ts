import { Observable, Subscriber } from 'rxjs';
import { share } from 'rxjs/operators';

import { toArray } from './array';

export type IntersectionObserverConfig = IntersectionObserverInit;
export interface IntersectionObserverChanges {
  entries: IntersectionObserverEntry[];
  observer: IntersectionObserver;
}

export function intersectionObserver$(elems: Element | Element[], config?: IntersectionObserverConfig) {
  const elemsList = toArray(elems);
  const onObserverChanges = (subscriber: Subscriber<IntersectionObserverChanges>) => {
    const callBack: IntersectionObserverCallback = (entries, observer) => {
      subscriber.next({ entries, observer });
    };
    const onSubscribe = () => intersectionObserver.disconnect();

    const intersectionObserver = new IntersectionObserver(callBack, config);

    elemsList.forEach((elem) => intersectionObserver.observe(elem));

    return onSubscribe;
  };

  return new Observable<IntersectionObserverChanges>(onObserverChanges).pipe(share());
}
