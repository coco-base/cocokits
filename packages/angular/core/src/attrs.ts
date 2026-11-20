import { Directive, ElementRef, Renderer2, effect, inject, input, type InputSignal } from '@angular/core';
import type { ThemeAttrs } from '@cocokits/shared';

/**
 * Keeps an attribute record on an element: sets every `data-*` attribute of the current record and removes
 * the ones the previous record had and the current one does not. Call it in an injection context.
 * Uses `Renderer2` in an effect, the documented exception to host bindings, because a record has
 * no fixed attribute names to bind.
 *
 * @param element - The element that carries the attributes.
 * @param record - Reads the current record; read inside the effect, so a signal it reads re-applies it.
 */
export function bindAttrs(element: Element, record: () => ThemeAttrs): void {
  const renderer = inject(Renderer2);
  let appliedNames: string[] = [];
  effect(() => {
    const next = record();
    for (const attrName of appliedNames) {
      if (!Object.hasOwn(next, attrName)) renderer.removeAttribute(element, attrName);
    }
    appliedNames = [];
    for (const [attrName, value] of Object.entries(next)) {
      // The type already says `data-*`; this guards a record built without it (an `any` or a cast).
      if (!attrName.startsWith('data-')) continue;
      renderer.setAttribute(element, attrName, value);
      appliedNames.push(attrName);
    }
  });
}

/**
 * Applies a theme attribute record to the element it sits on. Only `data-*` names are applied; any other key is skipped. Use it for the internal parts of a
 * component (the host part is handled by `themeAttrs`).
 *
 * @example
 * <span [class]="content.class" [cckAttrs]="themeAttrs().content">…</span>
 */
@Directive({ selector: '[cckAttrs]' })
export class CckAttrs {
  /** The attribute name to value record, for example one part of `themeAttrs(anatomy)()`. */
  readonly cckAttrs: InputSignal<ThemeAttrs> = input.required<ThemeAttrs>();

  constructor() {
    bindAttrs(inject<ElementRef<Element>>(ElementRef).nativeElement, () => this.cckAttrs());
  }
}
