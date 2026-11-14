import { Directive, ElementRef, computed, inject, input, signal } from '@angular/core';
import { IdGenerator } from '@cocokits/angular-core';
import { getTabNavProps, tabNavAnatomy } from '@cocokits/machines/tab-nav';

/**
 * The panel that the links of a tab nav control. Put your router outlet inside it, and pass its template reference to `tabPanel` on the nav.
 *
 * The panel can sit anywhere in the page, and it always stays there. It is the `tabpanel`, and the active link names it. While no link is active, it has no name.
 *
 * @example
 * <nav cckTabNav aria-label="Project" [tabPanel]="panel">
 *   <a cckTabNavLink routerLink="/overview" [active]="true">Overview</a>
 * </nav>
 * <cck-tab-nav-panel #panel="cckTabNavPanel"><router-outlet /></cck-tab-nav-panel>
 * @cckPart panel
 * @cckSlot default - The content of the active page. When not set, the panel is empty.
 */
@Directive({
  selector: 'cck-tab-nav-panel',
  exportAs: 'cckTabNavPanel',
  host: {
    '[class]': 'props().class',
    '[attr.id]': 'props().id',
    '[attr.role]': 'props().role',
    '[attr.aria-labelledby]': 'props()["aria-labelledby"] ?? null',
    '[attr.tabindex]': 'props().tabIndex',
  },
})
export class CckTabNavPanel {
  /**
   * The `id` of the panel. The links point at it. When not set, the panel gets a generated id.
   * @cckSemantic none
   * @cckParity Declared as an input; the directive forwards it to the element.
   */
  readonly id = input(inject(IdGenerator).getId(tabNavAnatomy.classes.panel));

  /** The id of the active link, set by the nav that links this panel; `undefined` while no link is active. @internal */
  readonly _activeLinkId = signal<string | undefined>(undefined);

  /** The panel element. @internal */
  readonly _element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly props = computed(() => {
    const id = this.id();
    const activeLinkId = this._activeLinkId();
    return getTabNavProps({ panelId: id }).panel({ id, activeLinkId, hasActiveLink: activeLinkId !== undefined });
  });
}
