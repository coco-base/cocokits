import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  linkedSignal,
  model,
  output,
  untracked,
  viewChild,
  type Signal,
} from '@angular/core';
import { CckAttrs, IdGenerator, bindAttrs } from '@cocokits/angular-core';
import { deepActiveElement } from '@cocokits/cdk/focus';
import { createPresence } from '@cocokits/cdk/presence';
import { writeContentSize } from '@cocokits/cdk/content-size';
import {
  accordionAnatomy,
  accordionContentSizeVariables,
  getAccordionItemProps,
  type AccordionItemParts,
} from '@cocokits/machines/accordion';
import { containsDeep } from '@cocokits/utils';
import { injectCckAccordion, type CckAccordionItemRegistration } from './accordion';
import { CckAccordionLabel } from './accordion-label';

/** The level of the heading that wraps the trigger: `1` renders an `h1`, `6` an `h6`. */
export type AccordionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * One section of an Accordion. The item renders its heading with one button (the trigger) and its content, and
 * the `cck-accordion-item` tag holds the content. Give the trigger text with `label`, or markup with a
 * `cckAccordionLabel` template. `label`, `expanded`, `disabled` and `headingLevel` do not stay on the host
 * element. Closed content stays in the DOM and is `hidden`.
 *
 * @example
 * <cck-accordion-item label="Shipping" [(expanded)]="open">Orders leave in two days.</cck-accordion-item>
 * @cckPart item
 * @cckPart header
 * @cckPart content
 * @cckSection trigger label label
 * @cckSlot default - The content of the section.
 * @cckSlot label ng-template[cckAccordionLabel] - The markup of the trigger, instead of the `label` text.
 */
@Component({
  selector: 'cck-accordion-item',
  exportAs: 'cckAccordionItem',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs, NgTemplateOutlet],
  host: {
    '[class]': 'parts().item.class',
    '[attr.data-state]': 'parts().item["data-state"]',
    '[attr.data-disabled]': 'parts().item["data-disabled"] ?? null',
    '[attr.data-orientation]': 'parts().item["data-orientation"]',
    '[attr.label]': 'null',
    '[attr.expanded]': 'null',
    '[attr.disabled]': 'null',
    '[attr.headinglevel]': 'null',
  },
  template: `
    <ng-template #triggerTemplate>
      <button
        #trigger
        [class]="parts().trigger.class"
        [attr.id]="parts().trigger.id"
        [attr.type]="parts().trigger.type"
        [attr.aria-expanded]="parts().trigger['aria-expanded']"
        [attr.aria-controls]="parts().trigger['aria-controls'] ?? null"
        [attr.aria-disabled]="parts().trigger['aria-disabled'] ?? null"
        [attr.disabled]="parts().trigger.disabled ? '' : null"
        [attr.data-state]="parts().trigger['data-state']"
        [attr.data-orientation]="parts().trigger['data-orientation']"
        [attr.data-disabled]="parts().trigger['data-disabled'] ?? null"
        [attr.data-focus-visible]="parts().trigger['data-focus-visible'] ?? null"
        [cckAttrs]="root._theme().trigger"
        (click)="parts().trigger.onClick($event)"
        (keydown)="parts().trigger.onKeyDown($event)"
        (focus)="root._onTriggerFocus(_id)"
        (blur)="root._focusVisibleKey.set(undefined)"
      >
        @if (labelSlot(); as slot) {
          <ng-container [ngTemplateOutlet]="slot._template" />
        } @else {
          {{ label() }}
        }
      </button>
    </ng-template>
    @switch (headingLevel()) {
      @case (1) {
        <h1
          [class]="parts().header.class"
          [attr.data-state]="parts().header['data-state']"
          [attr.data-disabled]="parts().header['data-disabled'] ?? null"
          [attr.data-orientation]="parts().header['data-orientation']"
          [cckAttrs]="root._theme().header"
        >
          <ng-container [ngTemplateOutlet]="triggerTemplate" />
        </h1>
      }
      @case (2) {
        <h2
          [class]="parts().header.class"
          [attr.data-state]="parts().header['data-state']"
          [attr.data-disabled]="parts().header['data-disabled'] ?? null"
          [attr.data-orientation]="parts().header['data-orientation']"
          [cckAttrs]="root._theme().header"
        >
          <ng-container [ngTemplateOutlet]="triggerTemplate" />
        </h2>
      }
      @case (4) {
        <h4
          [class]="parts().header.class"
          [attr.data-state]="parts().header['data-state']"
          [attr.data-disabled]="parts().header['data-disabled'] ?? null"
          [attr.data-orientation]="parts().header['data-orientation']"
          [cckAttrs]="root._theme().header"
        >
          <ng-container [ngTemplateOutlet]="triggerTemplate" />
        </h4>
      }
      @case (5) {
        <h5
          [class]="parts().header.class"
          [attr.data-state]="parts().header['data-state']"
          [attr.data-disabled]="parts().header['data-disabled'] ?? null"
          [attr.data-orientation]="parts().header['data-orientation']"
          [cckAttrs]="root._theme().header"
        >
          <ng-container [ngTemplateOutlet]="triggerTemplate" />
        </h5>
      }
      @case (6) {
        <h6
          [class]="parts().header.class"
          [attr.data-state]="parts().header['data-state']"
          [attr.data-disabled]="parts().header['data-disabled'] ?? null"
          [attr.data-orientation]="parts().header['data-orientation']"
          [cckAttrs]="root._theme().header"
        >
          <ng-container [ngTemplateOutlet]="triggerTemplate" />
        </h6>
      }
      @default {
        <h3
          [class]="parts().header.class"
          [attr.data-state]="parts().header['data-state']"
          [attr.data-disabled]="parts().header['data-disabled'] ?? null"
          [attr.data-orientation]="parts().header['data-orientation']"
          [cckAttrs]="root._theme().header"
        >
          <ng-container [ngTemplateOutlet]="triggerTemplate" />
        </h3>
      }
    }
    <div
      #content
      [class]="parts().content.class"
      [attr.id]="parts().content.id"
      [attr.role]="parts().content.role"
      [attr.aria-labelledby]="parts().content['aria-labelledby']"
      [hidden]="parts().content.hidden === true"
      [attr.data-state]="parts().content['data-state']"
      [attr.data-disabled]="parts().content['data-disabled'] ?? null"
      [attr.data-orientation]="parts().content['data-orientation']"
      [cckAttrs]="root._theme().content"
    >
      <ng-content />
    </div>
  `,
})
export class CckAccordionItem implements CckAccordionItemRegistration {
  /**
   * Whether the item is open. Two-way (`[(expanded)]`), one-way (the start state) or unbound. A write from the
   * parent emits nothing; the user's clicks and the methods emit `expandedChange`.
   * @defaultValue false
   * @cckSemantic none
   * @remarks Each item holds its own open state; the accordion has no root-wide `value`.
   * @cckParity The open state lives on each item.
   */
  readonly expanded = model(false);

  /**
   * Whether the item is disabled: the user cannot toggle it, `openAll` and `closeAll` of the root skip it
   * and the arrow keys skip it. A write to `[expanded]` by the parent still opens or closes it.
   * @remarks The accordion has no root-wide `disabled`; set it on each item.
   * @defaultValue false
   * @cckSemantic accordion.item.disabled
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * The text of the trigger.
   * @cckSemantic none
   * @remarks The item renders the trigger from this text.
   * @cckParity Only this framework has this member.
   */
  readonly label = input<string | undefined>(undefined);

  /**
   * The level of the heading that wraps the trigger. Choose the level that fits the page outline.
   * @defaultValue 3
   * @cckSemantic accordion.header.headingLevel
   */
  readonly headingLevel = input<AccordionHeadingLevel, AccordionHeadingLevel | `${AccordionHeadingLevel}`>(3, {
    transform: (level) => Number(level) as AccordionHeadingLevel,
  });

  /**
   * Emits when the item opens by a click, a method of the item or the root, or a key. Never for a write from the
   * parent.
   * @cckSemantic none
   * @remarks The accordion has no change event of its own; listen on each item.
   * @cckParity The open state lives on each item.
   */
  readonly opened = output();

  /**
   * Emits when the item closes by a click, a method, or because single mode opened another item. Never for a
   * write from the parent.
   * @cckSemantic none
   * @remarks The accordion has no change event of its own; listen on each item.
   * @cckParity The open state lives on each item.
   */
  readonly closed = output();

  /** The generated id of the item; the ids of the trigger and the content derive from it. @internal */
  readonly _id = inject(IdGenerator).getId(accordionAnatomy.classes.item);

  /** The item element. @internal */
  readonly _element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** The accordion the item sits in. @internal */
  protected readonly root = injectCckAccordion('cck-accordion-item');

  /** Whether the item is open: in single mode only one item is. */
  protected readonly isOpen = computed(() => this.root._openKeys().includes(this._id));

  /** Whether the content is still shown: open, or closing while its exit animation runs. */
  private readonly shown = linkedSignal<boolean, boolean>({
    source: this.isOpen,
    computation: (open, previous) => open || (previous?.value ?? false),
  });

  /** The label template, when the author wrote one. @internal */
  protected readonly labelSlot = contentChild(CckAccordionLabel);

  /** The props of the item, header, trigger and content. @internal */
  protected readonly parts: Signal<AccordionItemParts> = computed(() =>
    getAccordionItemProps(
      this.root._state(),
      { id: this._id, key: this._id, disabled: this.disabled(), contentMounted: true, contentPresent: this.shown() },
      (event) => {
        this.root._send(event);
      },
    ),
  );

  private readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  private readonly contentRef = viewChild<ElementRef<HTMLElement>>('content');
  private mounted = false;
  private readonly presence = createPresence({
    getElement: () => this.contentRef()?.nativeElement ?? null,
    onStateChange: (state) => {
      if (state === 'unmounted') this.shown.set(false);
    },
  });

  constructor() {
    bindAttrs(this._element, () => this.root._theme().item);
    const unregister = this.root._register(this);
    inject(DestroyRef).onDestroy(() => {
      unregister();
      this.presence.destroy();
    });

    // After a change of the open state: write the size for the animation (never on the first render), move focus
    // out of closing content, then let the presence wait for the exit.
    afterRenderEffect({
      write: () => {
        const open = this.isOpen();
        untracked(() => {
          this.syncPresence(open);
        });
      },
    });
  }

  /**
   * Opens the item. Does nothing while the item is disabled.
   * @cckSemantic none
   * @cckParity The open state lives on each item.
   */
  open(): void {
    this.root._send({ type: 'ITEM.OPEN', key: this._id });
  }

  /**
   * Closes the item. Does nothing while the item is disabled.
   * @cckSemantic none
   * @cckParity The open state lives on each item.
   */
  close(): void {
    this.root._send({ type: 'ITEM.CLOSE', key: this._id });
  }

  /**
   * Opens the item when it is closed and closes it when it is open. Does nothing while the item is disabled.
   * @cckSemantic none
   * @cckParity The open state lives on each item.
   */
  toggle(): void {
    if (this.isOpen()) this.close();
    else this.open();
  }

  /** @internal */
  _commit(open: boolean): void {
    this.expanded.set(open);
    if (open) this.opened.emit();
    else this.closed.emit();
  }

  /** @internal */
  _focusTrigger(): void {
    this.triggerRef()?.nativeElement.focus();
  }

  private syncPresence(open: boolean): void {
    const content = this.contentRef()?.nativeElement;
    const measure = this.mounted;
    this.mounted = true;
    if (open) {
      this.presence.setOpen(true);
      if (content && measure) writeContentSize(content, accordionContentSizeVariables);
    } else if (this.shown()) {
      if (content) {
        writeContentSize(content, accordionContentSizeVariables);
        this.refocus(content);
      }
      this.presence.setOpen(false);
    }
  }

  /** Focus is inside the closing content: it moves to a trigger before the content is hidden. */
  private refocus(content: HTMLElement): void {
    if (!containsDeep(content, deepActiveElement(content.ownerDocument))) return;
    const target = this.root._focusTargetOnClose(this._id);
    if (target !== undefined) this.root._focusTrigger(target);
  }
}
