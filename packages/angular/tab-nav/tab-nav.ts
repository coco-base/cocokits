import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterEveryRender,
  afterNextRender,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  untracked,
  viewChild,
  type Signal,
} from '@angular/core';
import { CckAttrs, CckDirection, themeAttrs } from '@cocokits/angular-core';
import { scrollItemIntoList, trackActiveIndicator, type ActiveIndicator } from '@cocokits/cdk/active-indicator';
import { createRovingFocus } from '@cocokits/cdk/roving-focus';
import { getTabNavProps, resolveTabNavStop, tabNavAnatomy, type TabNavParts } from '@cocokits/machines/tab-nav';
import { hasAccessibleName, sortByDomOrder } from '@cocokits/utils';

import type { CckTabNavPanel } from './tab-nav-panel';

/** What the nav needs to know about one link. @internal */
export interface CckTabNavRegistration {
  /** The link element. */
  readonly _element: HTMLElement;
  /** Whether the link is the current page. */
  readonly active: Signal<boolean>;
  /** Whether the link is disabled. */
  readonly disabled: Signal<boolean>;
  /** The id of the link. */
  readonly id: Signal<string>;
}

/**
 * Sorts the links into document order.
 *
 * @param links - The registered links.
 * @returns A new array in document order.
 */
function inDomOrder(links: readonly CckTabNavRegistration[]): CckTabNavRegistration[] {
  const byElement = new Map(links.map((link) => [link._element, link]));
  return sortByDomOrder(links.map((link) => link._element)).flatMap((element) => byElement.get(element) ?? []);
}

/**
 * TabNav: navigation links that look like tabs. Write one `a[cckTabNavLink]` per destination inside the host;
 * the host renders the list around them, with one sliding indicator that follows the active link. The links
 * stay links: there is no selection state here, so the author marks the current link `active` (from the
 * router). Name the `nav` with `aria-label` or `aria-labelledby`; they stay on the host.
 *
 * Link a `cckTabNavPanel` with `tabPanel` when the links drive an outlet: the list becomes a `tablist`, the
 * links become `tab`s that control the panel, the active link is the one Tab stop and the arrow keys move
 * focus between the links without navigating.
 *
 * @example
 * <nav cckTabNav aria-label="Project">
 *   <a cckTabNavLink href="#overview" active>Overview</a>
 *   <a cckTabNavLink href="#activity">Activity</a>
 * </nav>
 * @cckPart root
 * @cckPart list
 * @cckPart indicator
 * @cckSlot default - The `cckTabNavLink` anchors.
 */
@Component({
  selector: 'nav[cckTabNav]',
  exportAs: 'cckTabNav',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs],
  host: {
    '[class]': '_parts().root.class',
  },
  template: `
    <div
      #list
      [class]="_parts().list.class"
      [attr.role]="_parts().list.role ?? null"
      [cckAttrs]="_theme().list"
      (keydown)="onKeydown($event)"
    >
      <ng-content />
      <span
        #indicator
        [class]="_parts().indicator.class"
        [attr.aria-hidden]="_parts().indicator['aria-hidden']"
        [cckAttrs]="_theme().indicator"
      ></span>
    </div>
  `,
})
export class CckTabNav {
  /**
   * The panel the links control, from a `cckTabNavPanel` template reference. It switches the nav to panel mode
   * (tabs with one Tab stop and arrow keys); leave it out for plain links.
   * @cckSemantic none
   * @remarks The Angular panel is the directive itself; React and Vue pass its id to the same prop.
   */
  readonly tabPanel = input<CckTabNavPanel | undefined>(undefined);

  /** The theme attributes of every part; the root's are applied to the host. @internal */
  readonly _theme = themeAttrs(tabNavAnatomy);

  /** The props of the fixed parts and the function that gives the props of one link. @internal */
  readonly _parts: Signal<TabNavParts> = computed(() => getTabNavProps({ panelId: this.tabPanel()?.id() }));

  private readonly registry = signal<ReadonlySet<CckTabNavRegistration>>(new Set());

  /** The links in document order. */
  private readonly ordered = linkedSignal<ReadonlySet<CckTabNavRegistration>, readonly CckTabNavRegistration[]>({
    source: this.registry,
    computation: (links) => inDomOrder([...links]),
  });

  private readonly direction = inject(CckDirection);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly listRef = viewChild<ElementRef<HTMLElement>>('list');
  private readonly indicatorRef = viewChild<ElementRef<HTMLElement>>('indicator');

  /** The first link marked active; `undefined` when none is. */
  private readonly activeLink = computed(() => this.ordered().find((link) => link.active()));

  /** The link that holds the one Tab stop in panel mode: the active link, else the first enabled one. @internal */
  readonly _stopLink: Signal<CckTabNavRegistration | undefined> = computed(() => {
    const links = this.ordered();
    return links[resolveTabNavStop(links.map((link) => ({ active: link.active(), disabled: link.disabled() })))];
  });

  /** Whether a panel is linked. @internal */
  readonly _panelMode = computed(() => this.tabPanel() !== undefined);

  private readonly roving = createRovingFocus({
    getItems: () => this.ordered().map((link) => ({ element: link._element, disabled: link.disabled() })),
    strategy: 'focus',
    orientation: 'horizontal',
    loop: true,
    getDirection: () => this.direction.dir(),
    getCurrentIndex: () => this.ordered().findIndex((link) => link === this.activeLink()),
    onActiveChange: (index) => {
      const link = this.ordered().at(index);
      const list = this.listRef()?.nativeElement;
      if (link && list) scrollItemIntoList(list, link._element);
    },
  });

  constructor() {
    let indicator: ActiveIndicator | undefined;

    afterEveryRender({
      read: () => {
        const current = untracked(this.ordered);
        const sorted = inDomOrder(current);
        if (sorted.some((link, index) => link !== current[index])) this.ordered.set(sorted);
      },
    });

    // Tells the panel which link labels it; no active link, no label.
    effect((onCleanup) => {
      const panel = this.tabPanel();
      const id = this.activeLink()?.id();
      if (!panel) return;
      untracked(() => {
        panel._activeLinkId.set(id);
      });
      onCleanup(() => {
        panel._activeLinkId.set(undefined);
      });
    });

    // Measures the active link into the indicator after mount and after every change of the active link.
    afterRenderEffect({
      write: () => {
        this.activeLink();
        this.ordered();
        this.direction.dir();
        untracked(() => {
          indicator ??= trackActiveIndicator({
            getList: () => this.listRef()?.nativeElement ?? null,
            getActiveItem: () => this.activeLink()?._element ?? null,
            getIndicator: () => this.indicatorRef()?.nativeElement ?? null,
            getItems: () => this.ordered().map((link) => link._element),
          });
          indicator.update();
        });
      },
    });

    afterNextRender(() => {
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
      if (!hasAccessibleName(this.host)) {
        console.warn(
          'CocoKits: a TabNav has no accessible name. Add an aria-label or aria-labelledby to the element with cckTabNav.',
        );
      }
    });

    inject(DestroyRef).onDestroy(() => {
      indicator?.destroy();
    });
  }

  /**
   * Registers a link.
   *
   * @param link - The link.
   * @returns The function that unregisters it.
   * @internal
   */
  _register(link: CckTabNavRegistration): () => void {
    this.registry.update((links) => new Set(links).add(link));
    return () => {
      this.registry.update((links) => {
        const next = new Set(links);
        next.delete(link);
        return next;
      });
    };
  }

  /**
   * Moves focus between the links with the arrow keys, Home and End in panel mode; never navigates.
   *
   * @param event - The key press on the list.
   * @internal
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (this._panelMode() && !event.shiftKey) this.roving.handleKeyDown(event);
  }
}

/**
 * Finds the TabNav a link sits in.
 *
 * @param part - The calling part, for the error message.
 * @returns The TabNav.
 * @internal
 */
export function injectCckTabNav(part: string): CckTabNav {
  const root = inject(CckTabNav, { optional: true });
  if (!root) throw new Error(`CocoKits: ${part} must be placed inside an element with cckTabNav.`);
  return root;
}
