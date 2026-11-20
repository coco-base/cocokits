import { radioAnatomy } from './radio.anatomy';
import type { RadioParts, RadioProps } from './radio.types';

const present = (condition: boolean): '' | undefined => (condition ? '' : undefined);

const native = (condition: boolean): true | undefined => (condition ? true : undefined);

/**
 * Computes the props of a Radio. Pure: no DOM, same result on the server and the client. A standalone radio
 * has no field contract and renders only `data-checked`, `data-disabled` and `data-required`.
 *
 * @param state - The author's props and the tracked facts.
 * @returns The props of each part.
 */
export function getRadioProps(state: RadioProps): RadioParts {
  const checked = state.checked === true;
  const disabled = state.disabled === true;
  const required = state.required === true;
  const id = state.id === '' ? undefined : state.id;
  const { classes } = radioAnatomy;
  return {
    root: {
      class: classes.root,
      'data-checked': present(checked),
      'data-disabled': present(disabled),
      'data-required': present(required),
    },
    wrapper: { class: classes.wrapper },
    inputWrapper: { class: classes.inputWrapper },
    input: {
      class: classes.input,
      id,
      name: state.name === '' ? undefined : state.name,
      type: 'radio',
      checked,
      disabled: native(disabled),
      required: native(required),
      tabIndex: state.tabIndex,
    },
    backdrop: { class: classes.backdrop, 'aria-hidden': 'true' },
    background: { class: classes.background, 'aria-hidden': 'true' },
    label: { class: classes.label, for: id },
  };
}
