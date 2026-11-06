import { Directive, ElementRef, computed, inject, input, signal } from '@angular/core';
import { IdGenerator } from '@cocokits/angular-core';
import { getTabNavProps, tabNavAnatomy } from '@cocokits/machines/tab-nav';

/**
 * The panel a TabNav controls, for links that drive a router outlet: put the outlet inside it, give it a
 * template reference and pass that to `tabPanel` on the nav. It may sit anywhere in the page. It is the
 * `tabpanel`, labelled by the active link; while no link is active it has no label. It stays on the page
 * whatever the active link is.
 *
 * @example
 * <nav cckTabNav aria-label="Project" [tabPanel]="panel">…</nav>
 * <div cckTabNavPanel #panel="cckTabNavPanel"><router-outlet /></div>
 * @cckPart panel
 * @cckSlot default - The content of the active link.
 */
@Directive({
  selector: '[cckTabNavPanel]',
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
   * The id of the panel, which the links point at. Generated when left out.
   * @cckSemantic none
   * @remarks The panel is the directive itself, not its id.
   * @cckParity React and Vue pass the id of the panel.
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
