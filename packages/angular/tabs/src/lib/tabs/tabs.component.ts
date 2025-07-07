import { NgTemplateOutlet } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  inject,
  Input,
  input,
  output,
  untracked,
  ViewEncapsulation,
} from '@angular/core';

import { _UiBaseComponent } from '@cocokits/angular-core';
import { Animation, hasValue } from '@cocokits/common-utils';

import { TabComponent } from '../tab/tab.component';
import { TabsFeatureStore } from '../tabs.feature-store';
import { TabSelectionChangeEvent } from '../tabs.model';

@Component({
  standalone: true,
  imports: [NgTemplateOutlet],
  selector: 'cck-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
  },
  providers: [TabsFeatureStore],
})
export class TabsComponent<TValue = unknown> extends _UiBaseComponent<'tabs'> implements AfterContentInit {
  private featStore = inject(TabsFeatureStore);

  protected readonly componentName = 'tabs';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.headerAlign() === 'left', classes: this.classNames().alignLeft },
    { if: this.headerAlign() === 'right', classes: this.classNames().alignRight },
    { if: this.headerAlign() === 'center', classes: this.classNames().alignCenter },
    { if: this.headerAlign() === 'stretch', classes: this.classNames().alignStretch },
  ]);

  private _selectedIndex: number | undefined;
  /**
   * The index of the currently selected tab.
   * If `selected` is provided, the value of `selectedIndex` will be ignored.
   * @default 0
   */
  @Input() public set selectedIndex(index: number) {
    this._selectedIndex = index;
    this._updateSelected();
  }

  private _selectedValue: TValue | undefined;
  /**
   * The value of the currently selected tab.
   * If not provided, the `selectedIndex` will be used, and if `selectedIndex` is not provided, the first tab will be selected by default.
   */
  @Input() public set selected(value: TValue) {
    this._selectedValue = value;
    this._updateSelected();
  }

  /**
   * Whether to hide the content of the tabs when they are not selected.
   * @default false
   */
  public hideContent = input<boolean>(false);

  /**
   * Whether to disable the animation when switching between tabs.
   * @default false
   */
  public instantAnimation = input<boolean>(false);

  /**
   * The alignment of the tab headers.
   * @default 'left'
   */
  public headerAlign = input<'left' | 'center' | 'right' | 'stretch'>('left');

  /**
   * Emitter for the selected tab change event.
   * IIt will return only the value of the selected tab and you can combine it with `selected` to activate 2way data binding.
   */
  public selectedChange = output<TValue>();

  /**
   * Emitter for the selected index change event.
   * It will return only the index of the selected tab and you can combine it with `selectedIndex` to activate 2way data binding.
   */
  public selectedIndexChange = output<number>();

  /**
   * Emitter for the selection change event.
   * event is an object with the new and previous selected index and value.
   */
  public change = output<TabSelectionChangeEvent<TValue>>();

  protected tabComponents = contentChildren(TabComponent);

  protected selectedTabComponent = computed(() => {
    return this.tabComponents().find((tab) => this.featStore.selectedId() === tab._id);
  });

  private __dispatchChanges = effect(() => {
    const selectedId = this.featStore.selectedId();
    untracked(async () => {
      const prevuesSelectedId = this.featStore.prevuesSelectedId();
      const prevuesTabComponent = this.tabComponents().find((tab) => tab._id === prevuesSelectedId);
      const prevuesSelectedIndex = this.tabComponents().findIndex((tab) => tab._id === prevuesSelectedId);
      const prevuesSelectedValue = prevuesTabComponent?._value();

      const selectedTabComponent = this.selectedTabComponent();
      const selectedIndex = this.tabComponents().findIndex((tab) => tab._id === selectedId);
      const selectedValue = selectedTabComponent?._value();

      if (!selectedTabComponent) {
        return;
      }

      this.selectedChange.emit(selectedValue);
      this.selectedIndexChange.emit(selectedIndex);
      this.change.emit({
        previousIndex: prevuesSelectedIndex,
        previousValue: prevuesSelectedValue,
        index: selectedIndex,
        value: selectedValue,
      });

      if (!this.instantAnimation() && prevuesTabComponent) {
        const animationRef = Animation.getOrCreateInstance(selectedTabComponent._indicatorElemRef().nativeElement);

        selectedTabComponent._indicatorElemRef().nativeElement.style.removeProperty('display');
        const prevuesTabReact = prevuesTabComponent._indicatorElemRef().nativeElement.getBoundingClientRect();
        const newTabReact = selectedTabComponent._indicatorElemRef().nativeElement.getBoundingClientRect();

        animationRef
          .setDimension({ width: prevuesTabReact.width, height: prevuesTabReact.height })
          .setTranslate({ x: prevuesTabReact.left - newTabReact.left, y: prevuesTabReact.top - newTabReact.top })
          .applyImmediately();

        await animationRef
          .setDimension({ width: newTabReact.width, height: newTabReact.height })
          .setTranslate({ x: 0, y: 0 })
          .animate({ duration: 300 });

        selectedTabComponent._indicatorElemRef().nativeElement.style.removeProperty('width');
        selectedTabComponent._indicatorElemRef().nativeElement.style.removeProperty('height');
        selectedTabComponent._indicatorElemRef().nativeElement.style.removeProperty('transform');
      }
    });
  });

  ngAfterContentInit() {
    this._updateSelected();
  }

  public _updateSelected() {
    if (this.tabComponents().length === 0) {
      return;
    }

    if (hasValue(this._selectedValue)) {
      const selectedTab =
        this.tabComponents().find((tab) => tab.value() === this._selectedValue) ?? this.tabComponents()[0];
      this.featStore.selectTabById(selectedTab._id);
      return;
    }

    const selectedTabByIndex =
      this.tabComponents().find((_, index) => index === this._selectedIndex) ?? this.tabComponents()[0];
    this.featStore.selectTabById(selectedTabByIndex._id);
  }
}
