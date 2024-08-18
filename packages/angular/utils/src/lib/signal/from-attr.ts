import { DestroyRef, ElementRef, inject, InputSignal, signal } from '@angular/core';

import { reduceMerge } from '@cocokits/common-utils';

export function fromAttrByName<T = unknown>(name: string): InputSignal<T> {
  const host = inject<ElementRef<HTMLElement>>(ElementRef);
  const value = signal(host.nativeElement.attributes.getNamedItem(name)?.value);

  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      const attrName = mutation.attributeName;
      if (mutation.type === 'attributes' && attrName && attrName === name) {
        value.set(host.nativeElement.attributes.getNamedItem(name)?.value);
      }
    });
  });

  observer.observe(host.nativeElement, { attributes: true });

  inject(DestroyRef).onDestroy(() => observer.disconnect());

  return value.asReadonly() as InputSignal<T>;
}

export function fromAttrByNameToBoolean(name: string): InputSignal<boolean> {
  const host = inject<ElementRef<HTMLElement>>(ElementRef);

  const getValue = () => {
    const rawValue = host.nativeElement.attributes.getNamedItem(name)?.value;

    // Attr doesn't exist in DOM
    if (rawValue === undefined) {
      return undefined;
    }

    // Attr exist in DOM without value. For example `<input disabled/>`
    if (rawValue === '') {
      return true;
    }

    return !!rawValue;

    // return isAttrExist ? true : !!rawValue;
  };

  const value = signal(getValue());

  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      const attrName = mutation.attributeName;
      if (mutation.type === 'attributes' && attrName && attrName === name) {
        value.set(getValue());
      }
    });
  });

  observer.observe(host.nativeElement, { attributes: true });

  inject(DestroyRef).onDestroy(() => observer.disconnect());

  return value.asReadonly() as InputSignal<boolean>;
}

export function fromAttrWithPrefix<T = Record<string, unknown>>(prefix: string): InputSignal<T> {
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

  inject(DestroyRef).onDestroy(() => observer.disconnect());

  return value.asReadonly() as InputSignal<T>;
}

function generateResult(host: ElementRef<HTMLElement>, prefix: string) {
  const attrs = Object.values(host.nativeElement.attributes).filter((attrName) => attrName.name.startsWith(prefix));
  const result = reduceMerge(attrs, (attr) => ({
    [attr.name.replace(prefix, '')]: attr.value,
  }));

  return result;
}
