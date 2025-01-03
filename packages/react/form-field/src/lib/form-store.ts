import { deepMerge } from '@cocokits/common-utils';
import { createComponentStore } from '@cocokits/react-utils';
import { createContext, useContext, useMemo } from 'react';

interface FormState {
  // disabled: boolean;
  hasInput: boolean;
  // hasTextarea: boolean;
  hasSelect: boolean;
  // hasChipList: boolean;
  // hideRequiredMarker: boolean;
  // required: boolean;
  focused: boolean;
  // hasError: boolean;
}

interface FormStoreComponents {
  formField?: {
    // disabled: boolean;
    // hideRequiredMarker: boolean;
    wrapperElem?: React.RefObject<HTMLElement>;
    // size: string;
  };
  input?: {
    // disabled: boolean;
    // required: boolean;
    focused?: boolean;
  };
  textarea?: {
    // disabled: boolean;
    // required: boolean;
    focused?: boolean;
  };
  select?: {
    // disabled: boolean;
    // required: boolean;
  };
  chipList?: {
    // disabled: boolean;
    // size: string;
  };
}

const DEFAULT_STATE: FormState = {
  // disabled: false,
  hasInput: false,
  // hasTextarea: false,
  hasSelect: false,
  // hasChipList: false,
  // hideRequiredMarker: false,
  // required: false,
  focused: false,
  // hasError: false,
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
  private _components: FormStoreComponents = {};

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

  public updateComponent<K extends keyof FormStoreComponents>(key: K, value: Partial<FormStoreComponents[K]>) {
    this._components[key] = deepMerge(this._components[key], value);
    this.updateStates();
  }

  public unregisterComponent<K extends keyof FormStoreComponents>(key: K) {
    delete this._components[key];
    this.updateStates();
  }

  private updateStates() {
    // const disabled =
    //   this.components.input?.disabled ??
    //   this.components.textarea?.disabled ??
    //   this.components.select?.disabled ??
    //   this.components.chipList?.disabled ??
    //   this.components.formField?.disabled ??
    //   false;

    // const required =
    //   this.components.input?.required ??
    //   this.components.textarea?.required ??
    //   this.components.select?.required ??
    //   false;

    const focused = this._components.input?.focused ?? this._components.textarea?.focused ?? false;

    this.state.updateState({
      // disabled,
      hasInput: !!this._components.input,
      // hasTextarea: !!this.components.textarea,
      hasSelect: !!this._components.select,
      // hasChipList: !!this.components.chipList,
      // hideRequiredMarker: this.components.formField?.hideRequiredMarker ?? false,
      // required,
      focused,
      // hasError: false,
    });
  }
}
