import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  linkedSignal,
  type OnInit,
  type Signal,
  type TemplateRef,
} from '@angular/core';
import { IdGenerator, bindAttrs } from '@cocokits/angular-core';
import type { TabsItem } from '@cocokits/machines/tabs';
import { CckTabContent } from './tab-content';
import { CckTabLabel } from './tab-label';
import { injectCckTabs, type CckTabRegistration } from './tabs';

/**
 * One tab: the section holds the content of the panel and defines its trigger, which the `cck-tabs` host renders in
 * its list. The section is the panel (`role="tabpanel"`); it is hidden while its tab is not selected and holds
 * its content only while it is selected (see `preserveContent` on the Tabs and the `cckTabContent` template for
 * lazy creation). Give the trigger text with `label`, or markup with a `cckTabLabel` template. `label`,
 * `disabled`, `aria-label` and `aria-labelledby` do not stay on the host element, and `id` is the id of the
 * trigger. A tab is found by its position, so it has no value.
 *
 * @example
 * <cck-tab label="Account">Change your name.</cck-tab>
 * @cckPart panel
 * @cckSection trigger label label
 * @cckSlot default - The content of the panel.
 * @cckSlot label ng-template[cckTabLabel] - The markup of the trigger, instead of the `label` text.
 * @cckSlot content ng-template[cckTabContent] - The content of the panel, created when the tab is first selected.
 */
@Component({
  selector: 'cck-tab',
  exportAs: 'cckTab',
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet],
  host: {
    '[class]': 'props().class',
    '[attr.id]': 'props().id',
    '[attr.role]': 'props().role',
    '[attr.aria-labelledby]': 'props()["aria-labelledby"]',
    '[attr.aria-label]': 'null',
    '[attr.tabindex]': 'props().tabIndex',
    '[hidden]': 'props().hidden === true',
    '[attr.data-orientation]': 'props()["data-orientation"]',
    '[attr.data-selected]': 'props()["data-selected"] ?? null',
    '[attr.label]': 'null',
    '[attr.disabled]': 'null',
  },
  template: `
    @if (hasContent()) {
      @if (contentTemplate(); as template) {
        <ng-container [ngTemplateOutlet]="template" />
      }
      <ng-content />
    }
  `,
})
export class CckTab implements CckTabRegistration, OnInit {
  /**
   * Whether the trigger is disabled: it is never selected by the user and the arrow keys skip it.
   * @defaultValue false
   * @cckSemantic tabs.trigger.disabled
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * The text of the trigger.
   * @cckSemantic none
   * @remarks The Tabs renders the trigger from this text.
   * @cckParity Only this framework has this member.
   */
  readonly label = input<string | undefined>(undefined);

  /**
   * The id of the trigger, which the panel's `aria-labelledby` follows. Generated when left out.
   * @cckSemantic none
   * @remarks Applies to the trigger the Tabs renders.
   * @cckParity Declared as an input; the Tabs sets it on the trigger it renders.
   */
  readonly id = input<string | undefined>(undefined);

  /**
   * The accessible name of the trigger, forwarded to it and never kept on the section.
   * @cckSemantic none
   * @remarks Applies to the trigger the Tabs renders.
   * @cckParity Declared as an input; the Tabs sets it on the trigger it renders.
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /**
   * The id of the element that names the trigger, forwarded to it and never kept on the section.
   * @cckSemantic none
   * @remarks Applies to the trigger the Tabs renders.
   * @cckParity Declared as an input; the Tabs sets it on the trigger it renders.
   */
  readonly ariaLabelledBy = input<string | undefined>(undefined, { alias: 'aria-labelledby' });

  /** The markup of the trigger, when the author wrote a `cckTabLabel` template. @internal */
  readonly _labelTemplate: Signal<TemplateRef<unknown> | undefined> = computed(() => this.labelSlot()?._template);

  /** The section element, which is the panel. @internal */
  readonly _element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** The machine's view of this tab: its position as the value, its generated key and its trigger id. @internal */
  readonly _item: Signal<TabsItem>;

  /** Whether this tab is the selected one. @internal */
  readonly _selected: Signal<boolean>;

  private readonly root = injectCckTabs('cck-tab');
  private readonly destroyRef = inject(DestroyRef);
  private readonly key = inject(IdGenerator).getId('cck-tab');
  private readonly labelSlot = contentChild(CckTabLabel, { descendants: false });
  private readonly contentSlot = contentChild(CckTabContent, { descendants: false });
  protected readonly contentTemplate = computed(() => this.contentSlot()?._template);
  private readonly shown: Signal<boolean>;
  protected readonly props = computed(() => this.root._parts().panel(this._item()));
  protected readonly hasContent = computed(() =>
    this.root._parts().hasContent(this._item(), this.shown() && this.root.preserveContent()),
  );

  constructor() {
    this._item = computed(() => ({
      value: this.root._indexOf(this),
      key: this.key,
      id: this.id(),
      disabled: this.disabled(),
    }));
    this._selected = computed(() => this.root._selectedTab() === this);
    // Once the tab was shown it stays "shown", which `preserveContent` uses to keep the content.
    this.shown = linkedSignal<boolean, boolean>({
      source: this._selected,
      computation: (selected, previous) => selected || (previous?.value ?? false),
    });
    bindAttrs(this._element, () => this.root._theme().panel);
  }

  /** Registers with the Tabs once the inputs are set: the root reads `disabled` and `id` of every tab. @internal */
  ngOnInit(): void {
    this.destroyRef.onDestroy(this.root._register(this));
  }
}
