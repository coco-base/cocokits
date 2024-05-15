import { BehaviorSubject } from 'rxjs';

import { skipNullish } from '@coco-kits/common-utils';

import { ThemeChangedEvent } from './common.model';

export const themeChangedSubject$ = new BehaviorSubject<ThemeChangedEvent | null>(null);
export const themeChanged$ = themeChangedSubject$.pipe(skipNullish());
