import { getHostClassNames } from './class-names';
import { ThemeUIComponentProps, ThemeUIComponentsConfig, ThemeUIComponentsOptions } from '../model/ui-component.model';
import { validateUiComponentProps } from '../ui-component-props/ui-component-props';

export const formFieldLayoutClassNamesConfig = {
  prefix: 'cck-form-field',
  elements: {
    host: {
      name: 'Host Element',
      selectors: ['cck-form-field'],
      description: 'It will add to the host element of FormField component.',
    },
    wrapper: {
      name: 'Wrapper Element',
      selectors: ['cck-form-field__wrapper'],
      description: 'It;s contains a wrapper element for `leading`, `trailing`, `input-wrapper` elements',
    },
    inputWrapper: {
      name: 'Input Wrapper Element',
      selectors: ['cck-form-field__input-wrapper'],
      description: 'It;s contains a wrapper element for `prefix`, `suffix`, `input` or `chip-list` elements',
    },
    disabled: {
      name: 'Host Element',
      selectors: ['cck-form-field--disabled'],
      description: 'It will add to the host element of FormField component, the component is disabled',
    },
    required: {
      name: 'Host Element',
      selectors: ['cck-form-field--required'],
      description: 'It will add to the host element of FormField component, when the value of input tag is required',
    },
    focused: {
      name: 'Host Element',
      selectors: ['cck-form-field--focused'],
      description: 'It will add to the host element of FormField component, when the input tag is focused',
    },
    untouched: {
      name: 'Host Element',
      selectors: ['cck-form-field--untouched'],
      description: 'It will add to the host element of FormField component, when the value of input tag is untouched',
    },
    touched: {
      name: 'Host Element',
      selectors: ['cck-form-field--touched'],
      description: 'It will add to the host element of FormField component, when the value of input tag is touched',
    },
    pristine: {
      name: 'Host Element',
      selectors: ['cck-form-field--pristine'],
      description: 'It will add to the host element of FormField component, when the value of input tag is pristine',
    },
    dirty: {
      name: 'Host Element',
      selectors: ['cck-form-field--dirty'],
      description: 'It will add to the host element of FormField component, when the value of input tag is dirty',
    },
    valid: {
      name: 'Host Element',
      selectors: ['cck-form-field--valid'],
      description: 'It will add to the host element of FormField component, when the value of input tag is valid',
    },
    invalid: {
      name: 'Host Element',
      selectors: ['cck-form-field--invalid'],
      description: 'It will add to the host element of FormField component, when the value of input tag is invalid',
    },
    pending: {
      name: 'Host Element',
      selectors: ['cck-form-field--pending'],
      description: 'It will add to the host element of FormField component, when the value of input tag is pending',
    },
    error: {
      name: 'Host Element',
      selectors: ['cck-form-field--error'],
      description:
        'It will add to the host element of FormField component, when the value of input is invalid, touched and dirty or error component is present',
    },
    withInput: {
      name: 'Host Element',
      selectors: ['cck-form-field--with-input'],
      description:
        'It will add to the host element of FormField component, when the formFiled component contains input component',
    },
    withTextarea: {
      name: 'Host Element',
      selectors: ['cck-form-field--with-textarea'],
      description:
        'It will add to the host element of FormField component, when the formFiled component contains textarea component',
    },
    withSelect: {
      name: 'Host Element',
      selectors: ['cck-form-field--with-select'],
      description:
        'It will add to the host element of FormField component, when the formFiled component contains select component',
    },
    withChipList: {
      name: 'Host Element',
      selectors: ['cck-form-field--with-chip-list'],
      description:
        'It will add to the host element of FormField component, when the formFiled component contains ChipList component',
    },
  },
};

export function getFormFieldClassNames(
  componentProps: ThemeUIComponentProps,
  uiComponentsConfig: ThemeUIComponentsConfig
): Record<keyof typeof formFieldLayoutClassNamesConfig.elements, string> {
  const options: ThemeUIComponentsOptions = {
    componentName: 'formField',
    componentProps,
    uiComponentsConfig,
  };
  validateUiComponentProps(options);
  return {
    host: [
      ...formFieldLayoutClassNamesConfig.elements.host.selectors,
      ...getHostClassNames(formFieldLayoutClassNamesConfig.prefix, options),
    ].join(' '),
    wrapper: [...formFieldLayoutClassNamesConfig.elements.wrapper.selectors].join(' '),
    inputWrapper: [...formFieldLayoutClassNamesConfig.elements.inputWrapper.selectors].join(' '),
    disabled: [...formFieldLayoutClassNamesConfig.elements.disabled.selectors].join(' '),
    required: [...formFieldLayoutClassNamesConfig.elements.required.selectors].join(' '),
    focused: [...formFieldLayoutClassNamesConfig.elements.focused.selectors].join(' '),
    untouched: [...formFieldLayoutClassNamesConfig.elements.untouched.selectors].join(' '),
    touched: [...formFieldLayoutClassNamesConfig.elements.touched.selectors].join(' '),
    pristine: [...formFieldLayoutClassNamesConfig.elements.pristine.selectors].join(' '),
    dirty: [...formFieldLayoutClassNamesConfig.elements.dirty.selectors].join(' '),
    valid: [...formFieldLayoutClassNamesConfig.elements.valid.selectors].join(' '),
    invalid: [...formFieldLayoutClassNamesConfig.elements.invalid.selectors].join(' '),
    pending: [...formFieldLayoutClassNamesConfig.elements.pending.selectors].join(' '),
    error: [...formFieldLayoutClassNamesConfig.elements.error.selectors].join(' '),
    withInput: [...formFieldLayoutClassNamesConfig.elements.withInput.selectors].join(' '),
    withTextarea: [...formFieldLayoutClassNamesConfig.elements.withTextarea.selectors].join(' '),
    withSelect: [...formFieldLayoutClassNamesConfig.elements.withSelect.selectors].join(' '),
    withChipList: [...formFieldLayoutClassNamesConfig.elements.withChipList.selectors].join(' '),
  };
}
