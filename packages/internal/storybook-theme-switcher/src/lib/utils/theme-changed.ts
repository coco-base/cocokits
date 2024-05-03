import { BehaviorSubject, filter } from 'rxjs';

// THEME_CHANGED_EVENT_NAME

export const themeChangedSubject$ = new BehaviorSubject<Record<
  string,
  { name: string; content: string; viewBox: string }
> | null>(null);
export const themeChanged$ = themeChangedSubject$.pipe(filter((value) => !!value));
