import { CLASS_NAMES_FN_MAP } from '@cocokits/core';

import { FormFieldStoreService } from '../form-field.store';

export function getExtraHostElementClass(
  store: FormFieldStoreService,
  classNames: ReturnType<typeof CLASS_NAMES_FN_MAP.formField>
): string[] {
  const extraClassNames: string[] = [];

  if (store.state.disabled()) {
    extraClassNames.push(...classNames.disabled);
  }

  if (store.state.focused()) {
    extraClassNames.push(...classNames.focused);
  }

  if (store.input.control?.untouched()) {
    extraClassNames.push(...classNames.untouched);
  }

  if (store.input.control?.touched()) {
    extraClassNames.push(...classNames.touched);
  }

  if (store.input.control?.pristine()) {
    extraClassNames.push(...classNames.pristine);
  }

  if (store.input.control?.dirty()) {
    extraClassNames.push(...classNames.dirty);
  }

  if (store.input.control?.valid()) {
    extraClassNames.push(...classNames.valid);
  }

  if (store.input.control?.invalid()) {
    extraClassNames.push(...classNames.invalid);
  }

  if (store.state.hasError()) {
    extraClassNames.push(...classNames.error);
  }

  if (store.input.control?.pending()) {
    extraClassNames.push(...classNames.pending);
  }
  return extraClassNames;
}
