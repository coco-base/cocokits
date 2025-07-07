import { signal } from '@angular/core';

export class TabsFeatureStore {
  private _prevuesSelectedId = signal<string>('');
  private _selectedId = signal<string>('');

  public selectedId = this._selectedId.asReadonly();
  public prevuesSelectedId = this._prevuesSelectedId.asReadonly();

  public selectTabById(id: string) {
    this._prevuesSelectedId.set(this._selectedId());
    this._selectedId.set(id);
  }
}
