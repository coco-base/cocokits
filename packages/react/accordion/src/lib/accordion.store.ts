import { createContext, Provider, useContext, useMemo } from 'react';

import { Selection } from '@cocokits/common-utils';
import { createComponentStore } from '@cocokits/react-utils';

interface AccordionState {
  expandedPanelIds: string[];
  multiple: boolean;
  iconPosition: 'left' | 'right';
  instantAnimation: boolean;
  animationDuration: number;
  toggleTrigger: 'header' | 'icon';
  iconTemplate:
    | React.ReactNode
    | React.ReactNode[]
    | ((props: { isExpanded: boolean; disabled: boolean }) => React.ReactNode);
}

export interface AccordionStoreOptions {
  expandedPanelIds: string[];
  multiple: boolean;
  iconPosition: 'left' | 'right';
  instantAnimation: boolean;
  animationDuration: number;
  toggleTrigger: 'header' | 'icon';
  onSelectionChange: ((selected: string[] | string | null) => void) | undefined;
  iconTemplate:
    | React.ReactNode
    | React.ReactNode[]
    | ((props: { isExpanded: boolean; disabled: boolean }) => React.ReactNode);
}

export class AccordionStore {
  private selection: Selection<string>;
  private panels = new Map<string, { id: string; value: string }>();

  private state: ReturnType<typeof createComponentStore<AccordionState>>;
  public useState: ReturnType<typeof createComponentStore<AccordionState>>['useState'];
  public getState: ReturnType<typeof createComponentStore<AccordionState>>['getState'];
  public updateState: ReturnType<typeof createComponentStore<AccordionState>>['updateState'];

  constructor({ onSelectionChange, ...options }: AccordionStoreOptions) {
    this.state = createComponentStore<AccordionState>(options);
    this.useState = this.state.useState;
    this.getState = this.state.getState;
    this.updateState = this.state.updateState;

    this.selection = new Selection<string>([], { multiple: options.multiple });
    this.selection.addChangeEventListener(() => {
      this.state.updateState({
        expandedPanelIds: this.selection.selected,
        multiple: this.selection.isMultipleSelection(),
      });

      const selectedValues = this.selection.selected.map((id) => this.findValueFromId(id));
      onSelectionChange?.(this.selection.isMultipleSelection() ? selectedValues : (selectedValues[0] ?? null));
    });
  }

  public findPanelByValue(value: string) {
    for (const panel of this.panels.values()) {
      if (panel.value === value) {
        return panel;
      }
    }
    throw new Error(`Accordion panel with value "${value}" not found.`);
  }

  public addPanel(panel: { id: string; value: string }) {
    this.panels.set(panel.id, panel);
  }

  public removePanel(id: string) {
    this.panels.delete(id);
    this.selection.deselect(id);
  }

  public setExpandedPanelIds(ids: string[] | string) {
    this.selection.setSelection(ids);
  }

  public setMultiMode(isMultiMode: boolean) {
    this.selection.updateOptions({ multiple: isMultiMode });
  }

  public isExpanded(id: string) {
    return this.state.useState((state) => state.expandedPanelIds.includes(id));
  }

  public toggle(id: string) {
    this.selection.toggle(id);
  }

  public expand(id: string) {
    this.selection.select(id);
  }

  public collapse(id: string) {
    this.selection.deselect(id);
  }

  private findValueFromId(id: string): string {
    const panel = this.panels.get(id);
    if (!panel) {
      throw new Error(`Accordion panel with id "${id}" not found.`);
    }
    return panel.value;
  }
}

const AccordionStoreContent = createContext<AccordionStore | null>(null);

export function useCreateAccordionStore(config?: AccordionStoreOptions) {
  return useMemo(
    () => ({
      StoreProvider: AccordionStoreContent.Provider as Provider<AccordionStore>,
      store: new AccordionStore(config),
    }),
    []
  );
}

export function useAccordionStore() {
  return useContext(AccordionStoreContent) as AccordionStore | null;
}
