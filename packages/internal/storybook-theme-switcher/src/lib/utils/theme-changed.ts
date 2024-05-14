import { BehaviorSubject, filter } from 'rxjs';

import { SvgIcon } from '@coco-kits/finalui';

// THEME_CHANGED_EVENT_NAME

export const themeChangedSubject$ = new BehaviorSubject<Record<string, SvgIcon> | null>(null);
export const themeChanged$ = themeChangedSubject$.pipe(filter((value) => !!value));
