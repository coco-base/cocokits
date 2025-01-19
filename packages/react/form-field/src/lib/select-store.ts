import { Selection, SelectionOptions } from '@cocokits/common-utils';
import { createComponentStore } from '@cocokits/react-utils';
import { createContext, useContext, useMemo, Provider } from 'react';

interface SelectState<T> {
  selectedItems: T[] | undefined;
  isEmpty: boolean;
  hasValue: boolean;
  // isMultiple: boolean;
}

export interface SelectStoreConfig<T> {
  onSelectionChange?: (selected: T[]) => void;
  onlyEmitOnValueChange?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DEFAULT_STATE: SelectState<any> = {
  selectedItems: undefined,
  isEmpty: true,
  hasValue: false,
  // isMultiple: false,
};

class SelectStore<T> {
  private selection: Selection<T>;
  private state = createComponentStore<SelectState<T>>(DEFAULT_STATE);
  private onSelectionChange?: (selected: T[]) => void;

  constructor({ onSelectionChange, onlyEmitOnValueChange }: SelectStoreConfig<T> = {}) {
    this.selection = new Selection<T>([], { onlyEmitOnValueChange });
    this.onSelectionChange = onSelectionChange;
    this.selection.addChangeEventListener(() => {
      this.syncSelectionWithStore();
      this.onSelectionChange?.(this.selection.getSelected());
    });
  }

  public useState = this.state.useState;
  public getState = this.state.getState;

  public clear = () => this.selection.clear();
  public deselect = (values: T | T[]) => this.selection.deselect(values);
  public setSelection = (values: T | T[]) => this.selection.setSelection(values);
  public toggle = (value: T) => this.selection.toggle(value);
  public select = (values: T | T[], skipEmitEvent = false) => {
    this.selection.select(values, { skipEmitEvent });
    if (skipEmitEvent) {
      this.syncSelectionWithStore();
    }
  };

  private syncSelectionWithStore() {
    this.state.updateState({
      selectedItems: this.selection.getSelected(),
      isEmpty: this.selection.isEmpty(),
      hasValue: this.selection.hasValue(),
      // isMultiple: this.selection.isMultipleSelection(),
    });
  }

  public resetWithOption(options: Partial<SelectionOptions<T>> = {}) {
    this.selection.clear();
    this.selection.updateOptions(options);
    this.syncSelectionWithStore();
  }

  public useIsSelected(item: T) {
    return this.state.useState((state) => state.selectedItems?.includes(item) ?? false);
  }

  public destroy() {
    this.selection.removeAllChangeEventListener();
  }
}

const SelectStoreContent = createContext<SelectStore<unknown> | null>(null);

export function useCreateSelectStore<T>(config?: SelectStoreConfig<T>) {
  return useMemo(
    () => ({
      SelectStoreProvider: SelectStoreContent.Provider as Provider<SelectStore<T>>,
      selectStore: new SelectStore<T>(config),
    }),
    []
  );
}

export function useSelectStore<T>() {
  return useContext(SelectStoreContent) as SelectStore<T> | null;
}
