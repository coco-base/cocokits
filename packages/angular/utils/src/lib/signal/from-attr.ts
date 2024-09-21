/** @module signal */
import { DestroyRef, ElementRef, inject, InputSignal, signal } from '@angular/core';

import { reduceMerge } from '@cocokits/common-utils';

/**
 * Creates a signal that tracks changes to a specified attribute of an HTML element.
 *
 * This function creates a reactive signal bound to the value of the attribute `name` on the
 * host element. The signal updates automatically when the attribute changes.
 *
 * @template T The type of the attribute's value.
 * @param name The name of the attribute to observe.
 * @returns A readonly signal that tracks the attribute value.
 *
 * @example
 * ```typescript
 * const attrSignal = fromAttrByName<string>('data-example');
 * console.log(attrSignal()); // Logs the current value of the 'data-example' attribute
 * ```
 */
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

/**
 * Creates a signal that tracks the existence and value of a boolean attribute on an HTML element.
 *
 * This function is useful for attributes like `disabled` or `checked`, which may exist in the DOM
 * without an explicit value. If the attribute is present without a value, the signal returns `true`.
 * If the attribute has a value, it returns a boolean based on its value.
 *
 * @param name The name of the attribute to observe and convert to a boolean.
 * @returns A readonly signal that represents the boolean state of the attribute.
 *
 * @example
 * ```typescript
 * const booleanAttrSignal = fromAttrByNameToBoolean('disabled');
 * console.log(booleanAttrSignal()); // Logs `true` if the attribute is present, `false` otherwise
 * ```
 */
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

/**
 * Creates a signal that tracks changes to multiple attributes with a specified prefix.
 *
 * This function monitors all attributes on the host element that start with the given `prefix`
 * and returns an object where each attribute (minus the prefix) is a key, and its value is
 * the attribute's value. The signal updates automatically when any of the matching attributes change.
 *
 * @template T The type of the result object containing the attribute key-value pairs.
 * @param prefix The prefix of the attributes to observe.
 * @returns A readonly signal that represents an object with the matching attributes' key-value pairs.
 *
 * @example
 * ```typescript
 * const prefixedAttrsSignal = fromAttrWithPrefix('data-');
 * console.log(prefixedAttrsSignal()); // Logs an object with all 'data-' prefixed attributes
 * ```
 */
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
