import { Component, DestroyRef, Directive, ElementRef, inject, signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { domOrderedList } from '../src/index';

/** Collects the `[item]` elements below it in document order. */
@Directive({ selector: '[list]', exportAs: 'list' })
class List {
  readonly entries = domOrderedList((element: Element) => element);
}

@Directive({ selector: '[item]' })
class Item {
  /** The function that removes this item from the list. */
  readonly remove = inject(List).entries.add(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement);

  constructor() {
    inject(DestroyRef).onDestroy(this.remove);
  }
}

@Component({
  imports: [List, Item],
  template: `<div list>
    @if (early()) {
      <i item>early</i>
    }
    @for (name of names(); track name) {
      <b item>{{ name }}</b>
    }
  </div>`,
})
class Host {
  readonly early = signal(true);
  readonly names = signal(['a', 'b']);
}

const texts = (list: List): string[] => list.entries.items().map((element) => element.textContent);

describe('domOrderedList', () => {
  it('lists items in document order, follows a move and drops a removed item', async () => {
    const { fixture } = await render(Host);
    const list = fixture.debugElement.children[0]?.injector.get(List);
    if (!list) throw new Error('Expected the list.');
    expect(texts(list)).toEqual(['early', 'a', 'b']);
    fixture.componentInstance.names.set(['b', 'a']);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(texts(list)).toEqual(['early', 'b', 'a']);
    fixture.componentInstance.early.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(texts(list)).toEqual(['b', 'a']);
  });
});
