import { Observable, Subscriber } from 'rxjs';
import { share } from 'rxjs/operators';
import { isArray } from './ensure';
import { toArray } from './array';

export type MutationObserverConfig = MutationObserverInit;

export interface MutationObserverChanges {
  entries: MutationRecord[];
  observer: MutationObserver;
}

export function mutationObserver$(elems: HTMLElement | HTMLElement[], config: MutationObserverConfig) {
  const elemsList = toArray(elems);
  const onMutationChange = (subscriber: Subscriber<MutationObserverChanges>) => {
    const callBack: MutationCallback = (entries, observer) => subscriber.next({ entries, observer });
    const onUnSubscribe = () => mutationObserver.disconnect();
    const mutationObserver = new MutationObserver(callBack);
    elemsList.forEach((elem) => mutationObserver.observe(elem, config));

    return onUnSubscribe;
  };

  return new Observable<MutationObserverChanges>(onMutationChange).pipe(share());
}