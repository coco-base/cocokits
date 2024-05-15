import { BehaviorSubject, filter, Observable } from 'rxjs';

import { ThemeChangedEvent } from './common.model';

export const themeChangedSubject$ = new BehaviorSubject<ThemeChangedEvent | null>(null);
export const themeChanged$ = themeChangedSubject$.pipe(filter((value) => !!value)) as Observable<ThemeChangedEvent>;
