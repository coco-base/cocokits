import { AsyncPipe, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, NgZone } from '@angular/core';

import { Observable, OperatorFunction } from 'rxjs';

import { themeChanged$ } from '@coco-kit/storybook-theme-switcher';

import { SvgIconComponent } from '@coco-kit/angular-icon';

export function runInsideNgZone<T>(zone = inject(NgZone)): OperatorFunction<T, T> {
  return (source) =>
    new Observable<T>((observer) =>
      source.subscribe({
        next: (x) => zone.run(() => observer.next(x)),
        error: (err) => zone.run(() => observer.error(err)),
        complete: () => zone.run(() => observer.complete()),
      })
    );
}

@Component({
  standalone: true,
  selector: 'story-icon-list',
  imports: [AsyncPipe, KeyValuePipe, SvgIconComponent],
  templateUrl: './icon-list.component.html',
  styleUrl: './icon-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconListComponent {
  protected iconsMap$ = themeChanged$.pipe(runInsideNgZone());
}
