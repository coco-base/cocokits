import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  ElementRef,
  inject,
  input,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';

import { TabHeaderTemplateDirective } from './tab-header.tmpl-directive';
import { TabsFeatureStore } from '../tabs.feature-store';

let NEXT_ID = 1;

@Component({
  standalone: true,
  imports: [NgTemplateOutlet],
  selector: 'cck-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classNames().content',
  },
})
export class TabComponent<TValue = unknown> extends _UiBaseComponent<'tab'> {
  private featStore = inject(TabsFeatureStore);

  protected readonly componentName = 'tab';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.disabled(), classes: this.classNames().disabled },
    { if: this._isSelected(), classes: this.classNames().selected },
    { if: !this._isSelected(), classes: this.classNames().unselected },
  ]);

  public _id = `TAB_ID_${NEXT_ID++}`;

  /**
   * The label of the tab.
   */
  public header = input<string>();

  /**
   * The value of the tab, which is used to identify the tab when selected.
   * If not provided, a unique ID will be used.
   */
  public value = input<TValue>(undefined as TValue);

  public _value = computed(() => this.value() ?? this._id);

  /**
   * Whether the tab is disabled. If true, the tab will not be selectable by user.
   * @default false
   */
  public disabled = input(false, { transform: booleanAttribute });

  protected defaultHeaderTemplateContent = viewChild.required('defaultHeaderTemp', { read: TemplateRef });
  protected customHeaderTemplateContent = contentChild(TabHeaderTemplateDirective, { read: TemplateRef });
  protected headerTemplateContent = computed(
    () => this.customHeaderTemplateContent() ?? this.defaultHeaderTemplateContent()
  );
  public _headerTemplate = viewChild.required('headerTemp', { read: TemplateRef });

  public _contentTemplate = viewChild.required('contentTemp', { read: TemplateRef });

  public _isSelected = computed(() => this.featStore.selectedId() === this._id);

  public _indicatorElemRef = viewChild.required<unknown, ElementRef<HTMLElement>>('indicatorElemRef', {
    read: ElementRef<HTMLElement>,
  });

  protected toggle() {
    if (this.disabled()) {
      return;
    }
    this.featStore.selectTabById(this._id);
  }
}
