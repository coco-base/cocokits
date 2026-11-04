import type { Direction } from '@cocokits/shared';

/** The direction the headers are laid out in; it decides the arrow keys. */
export type AccordionOrientation = 'horizontal' | 'vertical';

/** `single` keeps at most one item open; `multiple` lets every item toggle on its own. */
export type AccordionType = 'single' | 'multiple';

/** Why the open items changed. Only the user changes them. */
export type AccordionChangeReason = 'user';

/** One registered item, read in document order by the adapter. */
export interface AccordionItem {
  /** The key stored in the open value: the item `value` (React, Vue) or its generated id (Angular). */
  readonly key: string;
  /** A disabled item is never toggled by the user and the arrow keys skip it. @defaultValue false */
  readonly disabled?: boolean | undefined;
}

/** Inputs of `getAccordionProps` and `transitionAccordion`. */
export interface AccordionState {
  /** The items in document order. */
  readonly items: readonly AccordionItem[];
  /** The keys of the open items (controlled or tracked). In `single` mode at most one. */
  readonly value: readonly string[];
  /** @defaultValue 'single' */
  readonly type?: AccordionType | undefined;
  /** Whether the open item can be closed in `single` mode. Angular passes `true`. @defaultValue false */
  readonly collapsible?: boolean | undefined;
  /** Disables every item. @defaultValue false */
  readonly disabled?: boolean | undefined;
  /** @defaultValue 'vertical' */
  readonly orientation?: AccordionOrientation | undefined;
  /** The text direction from the direction runtime; it flips the horizontal arrows only. @defaultValue 'ltr' */
  readonly dir?: Direction | undefined;
  /** The key of the item whose trigger has keyboard focus visible; the adapter tracks it after mount. */
  readonly focusVisibleKey?: string | undefined;
  /**
   * The key of the item whose content holds the focus. The adapter reads it when it sends an event
   * (`containsDeep` with the deep active element), never while it renders.
   */
  readonly focusInContent?: string | undefined;
}

/** The events the adapters send. */
export type AccordionEvent =
  | {
      /** A click (or native Enter and Space activation) on a trigger. */
      readonly type: 'TRIGGER.CLICK';
      readonly key: string;
      readonly event: Event;
    }
  | {
      /** An arrow, Home or End key moved to another enabled trigger. */
      readonly type: 'TRIGGER.NAVIGATE';
      readonly key: string;
      readonly event: Event;
    }
  | {
      /** A method asked to open an item (Angular `open()`, `openAll()`). */
      readonly type: 'ITEM.OPEN';
      readonly key: string;
    }
  | {
      /** A method asked to close an item (Angular `close()`, `closeAll()`). */
      readonly type: 'ITEM.CLOSE';
      readonly key: string;
    }
  | {
      /** The parent wrote the open items (a controlled value, `[expanded]`). It changes no value; it only checks focus. */
      readonly type: 'VALUE.SYNC';
      readonly value: readonly string[];
    };

/** What the adapter does after an event. A missing key means nothing to do. */
export interface AccordionTransition {
  /** Focus the trigger of this key. */
  readonly focus?: string;
  /** Report these keys as the new open items (reason `'user'`). */
  readonly value?: readonly string[];
}

/** The ids of the trigger and the content of one item. */
export interface AccordionIds {
  /** `<itemId>-trigger`. */
  readonly trigger: string;
  /** `<itemId>-content`. */
  readonly content: string;
}

/** The names of the two custom properties the content gets after mount. */
export interface AccordionContentSizeVariables {
  /** The measured height of the content. */
  readonly height: '--accordion-content-height';
  /** The measured width of the content. */
  readonly width: '--accordion-content-width';
}

/** One item as the adapter renders it. */
export interface AccordionItemInput extends AccordionItem {
  /** The SSR-stable id of the item, from the adapter's id generator. */
  readonly id: string;
  /** Whether the content element is in the DOM; it decides `aria-controls`. @defaultValue true */
  readonly contentMounted?: boolean | undefined;
  /** Whether the content is still shown: open, or closing while its exit animation runs. @defaultValue the item is open */
  readonly contentPresent?: boolean | undefined;
}

/** Props shared by every part. */
export interface AccordionPartProps {
  /** The part's class from the anatomy. */
  readonly class: string;
}

/** Props of the root part. */
export interface AccordionRootProps extends AccordionPartProps {
  /** The orientation. */
  readonly 'data-orientation': AccordionOrientation;
  /** Present when the root is disabled. */
  readonly 'data-disabled'?: '' | undefined;
  /** Present in multiple mode, when several items can be open at once. */
  readonly 'data-multiple'?: '' | undefined;
}

/** Props of the item and header parts. */
export interface AccordionItemPartProps extends AccordionPartProps {
  /** `'open'` or `'closed'`. */
  readonly 'data-state': 'open' | 'closed';
  /** Present when the item is disabled. */
  readonly 'data-disabled'?: '' | undefined;
  /** The orientation. */
  readonly 'data-orientation': AccordionOrientation;
}

/** Props of one trigger. */
export interface AccordionTriggerProps extends AccordionItemPartProps {
  /** `<itemId>-trigger`. */
  readonly id: string;
  /** Always `'button'`, so a trigger never submits a form. */
  readonly type: 'button';
  /** `'true'` while the item is open. */
  readonly 'aria-expanded': 'true' | 'false';
  /** The id of the content; absent while the content element is not in the DOM. */
  readonly 'aria-controls'?: string | undefined;
  /** `'true'` on the open trigger of a `single` accordion that cannot be collapsed. */
  readonly 'aria-disabled'?: 'true' | undefined;
  /** Native `disabled`, present only when the item is disabled. */
  readonly disabled?: true | undefined;
  /** Present while the trigger has keyboard focus. */
  readonly 'data-focus-visible'?: '' | undefined;
  /** Sends `TRIGGER.CLICK` unless a consumer handler vetoed the click. */
  readonly onClick: (event: Event) => void;
  /** Sends `TRIGGER.NAVIGATE` for a handled key and prevents its default. */
  readonly onKeyDown: (event: KeyboardEvent) => void;
}

/** Props of one content. */
export interface AccordionContentProps extends AccordionItemPartProps {
  /** `<itemId>-content`. */
  readonly id: string;
  /** Always `'region'`. */
  readonly role: 'region';
  /** The id of the trigger. */
  readonly 'aria-labelledby': string;
  /** Native `hidden`, present while the content is not shown. */
  readonly hidden?: true | undefined;
}

/** What `getAccordionItemProps` returns. */
export interface AccordionItemParts {
  /** The item props. */
  readonly item: AccordionItemPartProps;
  /** The header props. */
  readonly header: AccordionItemPartProps;
  /** The trigger props. */
  readonly trigger: AccordionTriggerProps;
  /** The content props. */
  readonly content: AccordionContentProps;
}

/** One handled key of the keymap. */
export interface AccordionKeyBinding {
  /** The keys. */
  readonly keys: readonly string[];
  /** The orientation the keys apply to; every orientation when left out. */
  readonly orientation?: AccordionOrientation;
  /** The `key` text of the matching row of the meta keyboard table. */
  readonly row: string;
}
