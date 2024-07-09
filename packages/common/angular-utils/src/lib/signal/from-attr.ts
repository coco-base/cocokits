import { DestroyRef, ElementRef, inject, InputSignal, signal } from '@angular/core';

import { reduceMerge } from '@cocokits/common-utils';

export function fromAttr<T = Record<string, unknown>>({ prefix }: { prefix: string }): InputSignal<T> {
  const host = inject<ElementRef<HTMLElement>>(ElementRef);
  const value = signal(generateResult(host, prefix));

  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      const attrName = mutation.attributeName;
      if (mutation.type === 'attributes' && attrName && attrName.startsWith(prefix)) {
        value.set(generateResult(host, prefix));
      }
    });
  });

  observer.observe(host.nativeElement, { attributes: true });

  inject(DestroyRef).onDestroy(() => {
    observer.disconnect();
  });

  return value.asReadonly() as InputSignal<T>;
}

function generateResult(host: ElementRef<HTMLElement>, prefix: string) {
  const attrs = Object.values(host.nativeElement.attributes).filter((attrName) => attrName.name.startsWith(prefix));
  const result = reduceMerge(attrs, (attr) => ({
    [attr.name.replace(prefix, '')]: attr.value,
  }));

  return result;
}
