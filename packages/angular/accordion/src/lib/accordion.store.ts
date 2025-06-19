import { computed, Injectable, signal } from '@angular/core';

import { Selection } from '@cocokits/common-utils';

@Injectable()
export class AccordionStore {
  private selection = new Selection<string>([], { multiple: false });
  private _expandedPanelIds = signal<string[]>([]);

  public expandedPanelIds = this._expandedPanelIds.asReadonly();

  constructor() {
    this.selection.addChangeEventListener(() => {
      this._expandedPanelIds.set(this.selection.selected);
    });
  }

  public setExpandedPanelIds(ids: string[] | string) {
    this.selection.setSelection(ids);
  }

  public setMultiMode(isMultiMode: boolean) {
    this.selection.updateOptions({ multiple: isMultiMode });
  }

  public isExpanded(id: string) {
    return computed(() => this._expandedPanelIds().includes(id));
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
}
