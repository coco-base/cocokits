import { inject, Injectable, InjectionToken, OnDestroy, Signal, signal, WritableSignal } from '@angular/core';

import { Subject } from 'rxjs';

import { RenderedOverlay } from '@cocokits/angular-overlay';
import { Selection, SelectionOptions, SelectionUpdateConfig } from '@cocokits/common-utils';

export enum SelectTriggerSource {
  FromControl = 'fromControl',
  FromOption = 'fromOption',
}

export const SelectStore = new InjectionToken<SelectStoreService<any>>('SELECT_STORE_SERVICE');

export function injectSelectStore<T>(): SelectStoreService<T> {
  return inject(SelectStore, { optional: true }) ?? new SelectStoreService<T>();
}

@Injectable()
export class SelectStoreService<T> implements OnDestroy {
  private selection = new Selection<T>();
  private selectionSignalMap = new Map<T, WritableSignal<boolean>>();
  public renderedOverlay: RenderedOverlay<void, T> | undefined;

  private changesSubject$ = new Subject<{ selected: T[]; triggerSource: SelectTriggerSource }>();
  public changes$ = this.changesSubject$.asObservable();

  // region ---------------- selectedItems ----------------
  private _selectedItems: WritableSignal<T[]> | undefined;
  public get selectedItems(): Signal<T[]> {
    if (!this._selectedItems) {
      this._selectedItems = signal(this.selection.getSelected());
    }

    return this._selectedItems.asReadonly();
  }
  private set selectedItems(items: T[]) {
    this._selectedItems?.set(items);
  }
  // endregion

  // region ---------------- isEmpty ----------------
  private _isEmpty: WritableSignal<boolean> | undefined;
  public get isEmpty(): Signal<boolean> {
    if (!this._isEmpty) {
      this._isEmpty = signal(this.selection.isEmpty());
    }

    return this._isEmpty.asReadonly();
  }
  private set isEmpty(isEmpty: boolean) {
    this._isEmpty?.set(isEmpty);
  }
  // endregion

  // region ---------------- hasValue ----------------
  private _hasValue: WritableSignal<boolean> | undefined;
  public get hasValue(): Signal<boolean> {
    if (!this._hasValue) {
      this._hasValue = signal(this.selection.hasValue());
    }

    return this._hasValue.asReadonly();
  }
  private set hasValue(hasValue: boolean) {
    this._hasValue?.set(hasValue);
  }
  // endregion

  // region ---------------- hasValue ----------------
  private _isMultiple: WritableSignal<boolean> | undefined;
  public get isMultiple(): Signal<boolean> {
    if (!this._isMultiple) {
      this._isMultiple = signal(this.selection.isMultipleSelection());
    }

    return this._isMultiple.asReadonly();
  }
  private set isMultiple(isMultiple: boolean) {
    this._isMultiple?.set(isMultiple);
  }

  constructor() {
    this.selection.addChangeEventListener((changes) => {
      changes.added.forEach((item) => {
        const itemSignal = this.selectionSignalMap.get(item);
        itemSignal?.set(true);
      });

      changes.removed.forEach((item) => {
        const itemSignal = this.selectionSignalMap.get(item);
        itemSignal?.set(false);
      });

      this.changesSubject$.next({
        selected: this.selection.getSelected(),
        triggerSource: changes.triggerSource as SelectTriggerSource,
      });

      this.syncValuesWithSelection();
    });
  }

  private syncValuesWithSelection() {
    this.selectedItems = this.selection.getSelected();
    this.isEmpty = this.selection.isEmpty();
    this.hasValue = this.selection.hasValue();
  }

  public resetWithOption(options: Partial<SelectionOptions<T>> = {}) {
    this.selection.clear();
    this.selection.updateOptions(options);
    this.isMultiple = this.selection.isMultipleSelection();
    this.syncValuesWithSelection();
  }

  public isSelected(item: T): Signal<boolean> {
    const itemSignal = this.selectionSignalMap.get(item);

    if (itemSignal) {
      return itemSignal.asReadonly();
    }

    const newSignal = signal(this.selection.isSelected(item));
    this.selectionSignalMap.set(item, newSignal);
    return newSignal.asReadonly();
  }

  public clear(config?: SelectionUpdateConfig) {
    this.selection.clear(config);
  }

  public select(items: T | T[], config?: SelectionUpdateConfig) {
    this.selection.select(items, config);
  }

  public deselect(items: T | T[], config?: SelectionUpdateConfig) {
    this.selection.deselect(items, config);
  }

  public setSelection(items: T | T[], config?: SelectionUpdateConfig) {
    this.selection.setSelection(items, config);
  }

  public toggle(items: T, config?: SelectionUpdateConfig) {
    this.selection.toggle(items, config);
  }

  ngOnDestroy() {
    this.selection.removeAllChangeEventListener();
    this.selectionSignalMap.clear();
  }
}
