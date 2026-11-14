import {
  DestroyRef,
  Directive,
  ElementRef,
  InjectionToken,
  inject,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import type { SelectContentProps } from '@cocokits/machines/select';
import type { ThemeAttrs } from '@cocokits/shared';

/**
 * What the content part needs from the Select. A token, not the `CckSelect` class: the Select imports this
 * file for its template, so importing the class here would be a cycle.
 *
 * @internal
 */
export interface SelectContentHost {
  /** The props of the content part. */
  readonly _contentProps: Signal<SelectContentProps>;
  /** The theme attributes of the content part. */
  readonly _contentTheme: Signal<ThemeAttrs>;
  /** The element of the content while it is rendered. */
  readonly _contentElement: WritableSignal<HTMLElement | null>;
}

/** Provided by `CckSelect` for the content in its portal template. @internal */
export const CCK_SELECT_CONTENT_HOST = new InjectionToken<SelectContentHost>('CCK_SELECT_CONTENT_HOST');

/**
 * The listbox of the Select, inside the portal template of `CckSelect`. It renders the content props and
 * registers its element with the Select. Internal.
 *
 * @internal
 */
@Directive({
  selector: '[cckSelectContent]',
  host: {
    '[class]': 'props().class',
    '[id]': 'props().id',
    '[attr.role]': 'props().role',
    '[attr.aria-multiselectable]': 'props()["aria-multiselectable"]',
    '[attr.aria-labelledby]': 'props()["aria-labelledby"]',
    '[attr.aria-label]': 'props()["aria-label"]',
    '[attr.data-state]': 'props()["data-state"]',
    '[attr.data-multiple]': 'props()["data-multiple"]',
    '[attr.data-side]': 'props()["data-side"]',
    '[attr.data-align]': 'props()["data-align"]',
    '(mousedown)': 'props().onMouseDown($event)',
  },
})
export class CckSelectContent {
  private readonly host = inject(CCK_SELECT_CONTENT_HOST);
  protected readonly props = this.host._contentProps;

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.host._contentElement.set(element);
    inject(DestroyRef).onDestroy(() => {
      this.host._contentElement.update((current) => (current === element ? null : current));
    });
    bindAttrs(element, this.host._contentTheme);
  }
}
