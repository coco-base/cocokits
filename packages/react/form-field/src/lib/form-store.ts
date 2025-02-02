'use client';
import { createContext, ReactNode, useContext, useMemo } from 'react';

import { deepMerge } from '@cocokits/common-utils';
import { UIBaseComponentsPropValue } from '@cocokits/core';
import { createComponentStore } from '@cocokits/react-utils';

interface FormState {
  disabled: boolean;
  required: boolean;
  hasInput: boolean;
  // hasTextarea: boolean;
  hasSelect: boolean;
  // hasChipList: boolean;
  hideRequiredMarker: boolean;
  // required: boolean;
  focused: boolean;
  invalid: boolean;
  size: UIBaseComponentsPropValue | undefined;
  labelTemplate: ReactNode | undefined;
  hintTemplate: ReactNode | undefined;
  errorsTemplates: ReactNode[];
  prefixTemplate: ReactNode | undefined;
  suffixTemplate: ReactNode | undefined;
  trailingTemplate: ReactNode | undefined;
  leadingTemplate: ReactNode | undefined;
}

interface FormStoreComponents {
  formField?: {
    disabled?: boolean;
    required?: boolean;
    hideRequiredMarker: boolean;
    wrapperElem?: React.RefObject<HTMLElement>;
    invalid?: boolean;
    size?: UIBaseComponentsPropValue;
  };
  input?: {
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    focused?: boolean;
  };
  textarea?: {
    // disabled: boolean;
    // required: boolean;
    focused?: boolean;
  };
  select?: {
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    size?: UIBaseComponentsPropValue;
  };
  chipList?: {
    // disabled: boolean;
    // size: string;
  };
  // TODO: Add to doc that we have have only one label
  label?: {
    template: ReactNode;
  };
  hint?: {
    template: ReactNode;
  };
  errors: {
    id: string;
    template: ReactNode;
  }[];
  prefix?: {
    template: ReactNode;
  };
  suffix?: {
    template: ReactNode;
  };
  leading?: {
    template: ReactNode;
  };
  trailing?: {
    template: ReactNode;
  };
}

const DEFAULT_STATE: FormState = {
  disabled: false,
  required: false,
  hasInput: false,
  // hasTextarea: false,
  hasSelect: false,
  // hasChipList: false,
  hideRequiredMarker: false,
  focused: false,
  invalid: false,
  size: undefined,
  labelTemplate: undefined,
  hintTemplate: undefined,
  errorsTemplates: [],
  prefixTemplate: undefined,
  suffixTemplate: undefined,
  leadingTemplate: undefined,
  trailingTemplate: undefined,
};

const FormStoreContent = createContext<FormStore | null>(null);

export function useCreateFormStore() {
  return useMemo(
    () => ({
      FormStoreProvider: FormStoreContent.Provider,
      formStore: new FormStore(),
    }),
    []
  );
}

export function useFormStore() {
  return useContext(FormStoreContent);
}

class FormStore {
  private state = createComponentStore(DEFAULT_STATE);
  private _components: FormStoreComponents = {
    errors: [],
  };

  public get components() {
    return this._components;
  }

  public useState = this.state.useState;
  public getState = this.state.getState;
  public updateState = this.state.updateState;

  public registerComponent<K extends keyof FormStoreComponents>(key: K) {
    this._components[key] = {} as FormStoreComponents[K];
    this.updateStates();
  }

  public deepUpdateComponent<K extends keyof FormStoreComponents>(key: K, value: Partial<FormStoreComponents[K]>) {
    this._components[key] = deepMerge(this._components[key], value);
    this.updateStates();
  }

  public updateComponent<Key extends keyof Required<FormStoreComponents>>(key: Key, value: FormStoreComponents[Key]) {
    this._components[key] = { ...this._components[key], ...value };
    this.updateStates();
  }

  public updateErrorComponent(value: FormStoreComponents['errors'][0]) {
    const index = this._components.errors.findIndex((error) => error.id === value.id);
    const currentValue = this._components.errors[index] ?? {};
    index === -1
      ? this._components.errors.push({ ...currentValue, ...value })
      : (this._components.errors[index] = { ...currentValue, ...value });
    this.updateStates();
  }

  public unregisterErrorComponent(id: string) {
    this._components.errors = this._components.errors.filter((error) => error.id !== id);
    this.updateStates();
  }

  public unregisterComponent<K extends keyof FormStoreComponents>(key: K) {
    delete this._components[key];
    this.updateStates();
  }

  private updateStates() {
    const disabled =
      this.components.input?.disabled ??
      // this.components.textarea?.disabled ??
      this.components.select?.disabled ??
      // this.components.chipList?.disabled ??
      this.components.formField?.disabled ??
      false;

    const required =
      this.components.input?.required ??
      // this.components.textarea?.required ??
      this.components.select?.required ??
      this.components.formField?.required ??
      false;

    const invalid =
      this.components.input?.invalid ||
      // this.components.textarea?.invalid ||
      this.components.select?.invalid ||
      this.components.formField?.invalid ||
      this.components.errors.length > 0;

    const size =
      // this.components.textarea?.size ??
      this.components.select?.size ?? this.components.formField?.size ?? undefined;

    const focused = this._components.input?.focused ?? this._components.textarea?.focused ?? false;

    this.state.updateState({
      disabled,
      required,
      hasInput: !!this._components.input,
      // hasTextarea: !!this.components.textarea,
      hasSelect: !!this._components.select,
      // hasChipList: !!this.components.chipList,
      hideRequiredMarker: this.components.formField?.hideRequiredMarker ?? false,
      focused,
      invalid,
      size,
      labelTemplate: this._components.label?.template,
      hintTemplate: this._components.hint?.template,
      errorsTemplates: this._components.errors.map((error) => error.template),
      prefixTemplate: this._components.prefix?.template,
      suffixTemplate: this._components.suffix?.template,
      leadingTemplate: this._components.leading?.template,
      trailingTemplate: this._components.trailing?.template,
    });
  }
}
