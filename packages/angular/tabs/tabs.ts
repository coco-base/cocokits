import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterEveryRender,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
  viewChild,
  viewChildren,
  type Signal,
  type TemplateRef,
} from '@angular/core';
import { CckAttrs, CckDirection, IdGenerator, themeAttrs } from '@cocokits/angular-core';
import { scrollItemIntoList, trackActiveIndicator, type ActiveIndicator } from '@cocokits/cdk/active-indicator';
import { trackFocusVisible, type FocusVisibleTracker } from '@cocokits/cdk/focus';
import { createRovingFocus } from '@cocokits/cdk/roving-focus';
import {
  getTabsProps,
  resolveSelectedTab,
  tabsAnatomy,
  transitionTabs,
  type TabsActivationMode,
  type TabsEvent,
  type TabsItem,
  type TabsOrientation,
  type TabsParts,
  type TabsState,
} from '@cocokits/machines/tabs';
import { sortByDomOrder } from '@cocokits/utils';
import { CCK_TABS_CONFIG } from './tabs-config';

/** What a Tabs knows about one `cckTab`: the tab a change event reports. */
export interface CckTabRegistration {
  /** The section element, which is the panel. */
  readonly _element: HTMLElement;
  /** Whether the trigger is disabled. */
  readonly disabled: Signal<boolean>;
  /** The text of the trigger. */
  readonly label: Signal<string | undefined>;
  /** The markup of the trigger, when the author gave a `cckTabLabel` template. */
  readonly _labelTemplate: Signal<TemplateRef<unknown> | undefined>;
  /** The trigger id the author gave, if any. */
  readonly id: Signal<string | undefined>;
  /** The accessible name of the trigger. */
  readonly ariaLabel: Signal<string | undefined>;
  /** The id of the element that names the trigger. */
  readonly ariaLabelledBy: Signal<string | undefined>;
  /** The machine's view of the tab: its position as the value, its generated key and its trigger id. */
  readonly _item: Signal<TabsItem>;
}

/** What the `selectedTabChange` and `focusChange` outputs of a Tabs emit. */
export interface CckTabChangeEvent {
  /** The position of the tab among the tabs, in document order, starting at 0. */
  readonly index: number;
  /** The tab. */
  readonly tab: CckTabRegistration;
}

/**
 * Sorts the tabs into document order.
 *
 * @param tabs - The registered tabs.
 * @returns A new array in document order.
 */
function inDomOrder(tabs: readonly CckTabRegistration[]): CckTabRegistration[] {
  const byElement = new Map(tabs.map((tab) => [tab._element, tab]));
  return sortByDomOrder(tabs.map((tab) => tab._element)).flatMap((element) => byElement.get(element) ?? []);
}

/**
 * Tabs: a list of triggers and one panel per trigger, one tab selected at a time. Write one `cckTab` section
 * per tab inside the host; the host renders the list (with the triggers and one sliding indicator) before the
 * sections, which are the panels. Arrow keys, Home and End move between the enabled triggers; with `automatic`
 * activation the focused trigger is selected, with `manual` Enter or Space selects it. A panel holds its content
 * only while its tab is selected (see `preserveContent`). Name the list with `aria-label` or `aria-labelledby`
 * on the host: they are forwarded to the list and never stay on the host.
 *
 * @example
 * <div cckTabs aria-label="Account settings" [(selectedIndex)]="tab">
 *   <div cckTab label="Account">Change your name.</div>
 *   <div cckTab label="Password">Change your password.</div>
 * </div>
 * @cckPart root
 * @cckPart list
 * @cckPart indicator
 * @cckSlot default - The `cckTab` sections.
 */
@Component({
  selector: '[cckTabs]',
  exportAs: 'cckTabs',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs, NgTemplateOutlet],
  host: {
    '[class]': '_parts().root.class',
    '[attr.data-orientation]': '_parts().root["data-orientation"]',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
  },
  template: `
    <div
      #list
      [class]="_parts().list.class"
      [attr.role]="_parts().list.role"
      [attr.aria-orientation]="_parts().list['aria-orientation']"
      [attr.aria-label]="ariaLabel() ?? null"
      [attr.aria-labelledby]="ariaLabelledBy() ?? null"
      [attr.data-orientation]="_parts().list['data-orientation']"
      [cckAttrs]="_theme().list"
      (keydown)="onKeydown($event)"
    >
      @for (tab of ordered(); track tab) {
        @let props = _parts().trigger(tab._item());
        <button
          #trigger
          [class]="props.class"
          [attr.id]="props.id"
          [attr.role]="props.role"
          [attr.type]="props.type"
          [attr.aria-selected]="props['aria-selected']"
          [attr.aria-controls]="props['aria-controls']"
          [attr.aria-label]="tab.ariaLabel() ?? null"
          [attr.aria-labelledby]="tab.ariaLabelledBy() ?? null"
          [attr.tabindex]="props.tabIndex"
          [attr.disabled]="props.disabled ? '' : null"
          [attr.data-orientation]="props['data-orientation']"
          [attr.data-selected]="props['data-selected'] ?? null"
          [attr.data-disabled]="props['data-disabled'] ?? null"
          [attr.data-focus-visible]="props['data-focus-visible'] ?? null"
          [cckAttrs]="_theme().trigger"
          (click)="props.onClick($event)"
          (focus)="onTriggerFocus(tab)"
          (blur)="focusVisibleTab.set(undefined)"
        >
          <span [class]="_parts().triggerLabel.class" [cckAttrs]="_theme().triggerLabel">
            @if (tab._labelTemplate(); as template) {
              <ng-container [ngTemplateOutlet]="template" />
            } @else {
              {{ tab.label() }}
            }
          </span>
        </button>
      }
      <span
        #indicator
        [class]="_parts().indicator.class"
        [attr.aria-hidden]="_parts().indicator['aria-hidden']"
        [cckAttrs]="_theme().indicator"
      ></span>
    </div>
    <ng-content />
  `,
})
export class CckTabs {
  /**
   * The position of the selected tab, starting at 0. Two-way, one-way (the start position) or unbound; `null`
   * selects the first enabled tab and stays `null` until the user selects. A position outside the tabs selects
   * the nearest tab, and the position follows the selected tab when tabs are added or removed.
   * @cckSemantic tabs.value
   */
  readonly selectedIndex = model<number | null>(null);

  /**
   * Whether the tabs are laid out in a row or a column; `vertical` moves with Up and Down.
   * @defaultValue 'horizontal'
   */
  readonly orientation = input<TabsOrientation>('horizontal');

  /**
   * `automatic` selects a tab when it receives focus by an arrow key; `manual` waits for Enter or Space.
   * @defaultValue 'automatic'
   */
  readonly activationMode = input<TabsActivationMode>('automatic');

  /**
   * Whether a panel keeps its content once its tab was selected, hidden while the tab is not selected. Without
   * it the content of a panel is removed when the tab is left. The default comes from `CCK_TABS_CONFIG`.
   * @defaultValue false
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly preserveContent = input(inject(CCK_TABS_CONFIG, { optional: true })?.preserveContent ?? false, {
    transform: booleanAttribute,
  });

  /**
   * The accessible name of the list. It is forwarded to the list element and does not stay on the host.
   * @cckSemantic tabs.list.aria-label
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /**
   * The id of the element that names the list. It is forwarded to the list element and does not stay on the host.
   * @cckSemantic tabs.list.aria-labelledby
   */
  readonly ariaLabelledBy = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /**
   * Emits after every selection the user makes (a click, or a key), with the position and the tab. Never for a
   * write from the parent.
   * @cckSemantic tabs.valueChange
   */
  readonly selectedTabChange = output<CckTabChangeEvent>();

  /**
   * Emits when keyboard focus reaches a tab: an arrow key, Home or End, or Tab into the list. Not for pointer
   * focus.
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly focusChange = output<CckTabChangeEvent>();

  /** The theme attributes of every part; the root's are applied to the host. @internal */
  readonly _theme = themeAttrs(tabsAnatomy);

  private readonly registry = signal<ReadonlySet<CckTabRegistration>>(new Set());

  /** The tabs in document order. */
  protected readonly ordered = linkedSignal<ReadonlySet<CckTabRegistration>, readonly CckTabRegistration[]>({
    source: this.registry,
    computation: (tabs) => inDomOrder([...tabs]),
  });

  /**
   * The selected tab. It follows the position `selectedIndex` names; while that position does not change the
   * tab stays selected when others are added or removed before it, and a removed tab gives way to the tab now
   * at its place.
   * @internal
   */
  readonly _selectedTab = linkedSignal<
    { model: number | null; tabs: readonly CckTabRegistration[]; settled: boolean },
    CckTabRegistration | undefined
  >({
    source: () => ({ model: this.selectedIndex(), tabs: this.ordered(), settled: this.settled() }),
    computation: ({ model, tabs }, previous) => {
      if (tabs.length === 0) return undefined;
      const before = previous?.value;
      // The tabs register one after the other while the first view is built: only a settled tab is kept.
      if (before && previous.source.settled && previous.source.model === model) {
        if (tabs.includes(before)) return before;
        return tabs[Math.min(previous.source.tabs.indexOf(before), tabs.length - 1)];
      }
      if (model === null) {
        const first = resolveSelectedTab(
          tabs.map((tab) => tab._item()),
          undefined,
        );
        return typeof first === 'number' ? tabs[first] : undefined;
      }
      return tabs[Math.min(Math.max(model, 0), tabs.length - 1)];
    },
  });

  /** Whether the first view is built, so every tab of the template is registered. */
  private readonly settled = signal(false);

  /** The tab whose trigger has keyboard focus visible. */
  protected readonly focusVisibleTab = signal<CckTabRegistration | undefined>(undefined);

  private readonly id = inject(IdGenerator).getId(tabsAnatomy.classes.root);
  private readonly direction = inject(CckDirection);
  private readonly listRef = viewChild<ElementRef<HTMLElement>>('list');
  private readonly indicatorRef = viewChild<ElementRef<HTMLElement>>('indicator');
  private readonly triggerRefs = viewChildren<ElementRef<HTMLElement>>('trigger');
  private focusTracker: FocusVisibleTracker | undefined;
  private indicator: ActiveIndicator | undefined;
  private selectionRendered = false;

  private readonly state = computed<TabsState>(() => {
    const tabs = this.ordered();
    const selected = this._selectedTab();
    const index = selected ? tabs.indexOf(selected) : -1;
    const focusVisible = this.focusVisibleTab();
    return {
      id: this.id,
      items: tabs.map((tab) => tab._item()),
      value: index >= 0 ? index : undefined,
      orientation: this.orientation(),
      activationMode: this.activationMode(),
      dir: this.direction.dir(),
      focusVisibleValue: focusVisible ? tabs.indexOf(focusVisible) : undefined,
    };
  });

  /** The props of every part and of each tab's trigger and panel. @internal */
  readonly _parts: Signal<TabsParts> = computed(() =>
    getTabsProps(this.state(), (event) => {
      this.send(event);
    }),
  );

  /** The keyboard handler of the list; a new one when the orientation changes. */
  protected readonly roving = computed(() => {
    const orientation = this.orientation();
    return createRovingFocus({
      getItems: () =>
        this.triggerRefs().map((trigger, index) => ({
          element: trigger.nativeElement,
          disabled: this.ordered()[index]?.disabled() ?? true,
        })),
      strategy: 'focus',
      orientation,
      loop: true,
      getDirection: () => this.direction.dir(),
      getCurrentIndex: () => this.selectedIndexOf(),
      onActiveChange: (index, { event }) => {
        this.send({ type: 'TRIGGER.NAVIGATE', value: index, event });
        this.scrollTriggerIntoView(index);
      },
    });
  });

  constructor() {
    // The order of the tabs: a keyed reorder changes no signal the root tracks.
    afterEveryRender({
      read: () => {
        const current = untracked(this.ordered);
        const sorted = inDomOrder(current);
        if (sorted.some((tab, index) => tab !== current[index])) this.ordered.set(sorted);
      },
    });

    // The position follows the selected tab when tabs come and go, and a position outside the tabs is clamped.
    effect(() => {
      if (!this.settled()) return;
      const selected = this._selectedTab();
      const model = this.selectedIndex();
      const index = selected ? this.ordered().indexOf(selected) : -1;
      if (model === null || index < 0 || index === model) return;
      untracked(() => {
        this.selectedIndex.set(index);
      });
    });

    afterNextRender(() => {
      this.settled.set(true);
      const doc = this.listRef()?.nativeElement.ownerDocument;
      if (doc) this.focusTracker = trackFocusVisible(doc);
    });

    // Measures the selected trigger into the indicator after every selection, order, orientation or direction change.
    afterRenderEffect({
      write: () => {
        this._selectedTab();
        this.ordered();
        this.orientation();
        this.direction.dir();
        untracked(() => {
          this.indicator ??= trackActiveIndicator({
            getList: () => this.listRef()?.nativeElement ?? null,
            getActiveItem: () => this.triggerElement(this.selectedIndexOf()) ?? null,
            getIndicator: () => this.indicatorRef()?.nativeElement ?? null,
            getItems: () => this.triggerRefs().map((trigger) => trigger.nativeElement),
          });
          this.indicator.update();
        });
      },
    });

    // Scrolls the list to the selected trigger when the selection changes after the first render.
    afterRenderEffect({
      write: () => {
        const selected = this._selectedTab();
        untracked(() => {
          if (this.selectionRendered && selected) this.scrollTriggerIntoView(this.selectedIndexOf());
          this.selectionRendered = true;
        });
      },
    });

    inject(DestroyRef).onDestroy(() => {
      this.focusTracker?.destroy();
      this.indicator?.destroy();
    });
  }

  /**
   * Registers a tab section.
   *
   * @param tab - The section.
   * @returns The function that unregisters it.
   * @internal
   */
  _register(tab: CckTabRegistration): () => void {
    this.registry.update((tabs) => new Set(tabs).add(tab));
    return () => {
      this.registry.update((tabs) => {
        const next = new Set(tabs);
        next.delete(tab);
        return next;
      });
    };
  }

  /**
   * The position of a tab among the tabs in document order.
   *
   * @param tab - The section.
   * @returns The position, `0` while the tab is not registered.
   * @internal
   */
  _indexOf(tab: CckTabRegistration): number {
    return Math.max(this.ordered().indexOf(tab), 0);
  }

  /**
   * Moves between the triggers with the arrow keys, Home and End. A key with Shift is not a move. The handler
   * returns nothing: a template listener that returns `false` would cancel Tab and Enter.
   *
   * @param event - The key press on the list.
   * @internal
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (!event.shiftKey) this.roving().handleKeyDown(event);
  }

  /**
   * Marks the trigger as keyboard-focused when the last input was the keyboard, and reports it.
   *
   * @param tab - The tab whose trigger received focus.
   * @internal
   */
  protected onTriggerFocus(tab: CckTabRegistration): void {
    if (this.focusTracker?.isFocusVisible() !== true) {
      this.focusVisibleTab.set(undefined);
      return;
    }
    this.focusVisibleTab.set(tab);
    this.focusChange.emit({ index: this.ordered().indexOf(tab), tab });
  }

  private selectedIndexOf(): number {
    const selected = this._selectedTab();
    return selected ? this.ordered().indexOf(selected) : -1;
  }

  private triggerElement(index: number): HTMLElement | undefined {
    return this.triggerRefs()[index]?.nativeElement;
  }

  private scrollTriggerIntoView(index: number): void {
    const list = this.listRef()?.nativeElement;
    const trigger = this.triggerElement(index);
    if (list && trigger) scrollItemIntoList(list, trigger);
  }

  private send(event: TabsEvent): void {
    const result = transitionTabs(this.state(), event);
    if (typeof result.select === 'number') {
      const tab = this.ordered().at(result.select);
      this.selectedIndex.set(result.select);
      if (tab) this.selectedTabChange.emit({ index: result.select, tab });
    }
    if (typeof result.focus === 'number') this.triggerElement(result.focus)?.focus();
  }
}

/**
 * Finds the Tabs a section sits in.
 *
 * @param part - The calling part, for the error message.
 * @returns The Tabs.
 * @internal
 */
export function injectCckTabs(part: string): CckTabs {
  const root = inject(CckTabs, { optional: true });
  if (!root) throw new Error(`CocoKits: ${part} must be placed inside an element with cckTabs.`);
  return root;
}
