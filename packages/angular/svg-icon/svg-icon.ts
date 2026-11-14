import { Component, ViewEncapsulation, afterRenderEffect, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CckIconRegistry, themeAttrs } from '@cocokits/angular-core';
import { parseSvg } from '@cocokits/cdk/icon-registry';
import type { Icon } from '@cocokits/icons';
import { getSvgIconProps, svgIconAnatomy } from '@cocokits/machines/svg-icon';

/** Escapes a value for a double-quoted attribute. */
function escapeAttribute(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

/**
 * An SVG icon, drawn from a registered icon by its name (`iconName`) or from a full SVG string (`svg`). Register icons with `provideCckIcons`, or with `CckIconRegistry` later; the four base icons (`chevron-down`, `check`, `minus`, `close`) are always there.
 *
 * The icon is hidden from screen readers. Give `label` to a meaningful icon: it becomes an image with that name. Inside a named button the icon stays hidden and the button carries the name.
 *
 * Trusted content only: the markup of an icon is inserted as it is, with no sanitising. Never register or pass markup from users or other untrusted sources.
 *
 * The component always owns the `svg` element. An icon that is registered eagerly is in the server HTML. A lazy icon and an `svg` string are drawn after the first render. A name that is not registered renders an empty `svg`, and in development logs an error.
 *
 * Without the theme CSS the browser gives the `svg` its default size: size `.cck-svg-icon__svg`. The icons of `@cocokits/icons` paint in `currentColor`, so they take the text colour.
 *
 * @example
 * <cck-svg-icon iconName="check" />
 * <cck-svg-icon iconName="check" label="Done" />
 * @example
 * import { searchIcon } from '@cocokits/icons';
 *
 * // In the app config: providers: [provideCckIcons({ icons: { search: searchIcon } })]
 * // In a component that has imports: [CckSvgIconImports] from '@cocokits/angular/svg-icon':
 * <cck-svg-icon iconName="search" label="Search" />
 * @example
 * import logoSvg from './logo.svg?raw';
 *
 * // In the component class: protected readonly logo = logoSvg;
 * <cck-svg-icon [svg]="logo" label="Acme" />
 * @cckPart root
 * @cckPart svg
 */
@Component({
  selector: 'cck-svg-icon',
  exportAs: 'cckSvgIcon',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'parts().root.class',
    '[attr.data-icon]': 'parts().root["data-icon"] ?? null',
    '[attr.aria-hidden]': 'parts().root["aria-hidden"] ?? null',
    '[attr.role]': 'parts().root.role ?? null',
    '[attr.aria-label]': 'parts().root["aria-label"] ?? null',
    '[innerHTML]': 'markup()',
  },
  // The whole `<svg>` is one trusted string on the host: the server renderer cannot set `innerHTML` on an SVG element.
  template: '',
})
export class CckSvgIcon {
  /**
   * The name of a registered icon. When not set, the icon comes from `svg`.
   * @remarks A name that is not registered renders an empty `svg`. When `svg` is also set, this input wins and development logs an error.
   */
  readonly iconName = input<string | undefined>();

  /**
   * A full SVG string to draw, for an icon that has no name. It is parsed once in the browser, after the first render. When not set, the icon comes from `iconName`.
   *
   * Trusted content only: the markup is inserted as it is, with no sanitising. Never pass text from users or other untrusted sources.
   */
  readonly svg = input<string | undefined>();

  /**
   * Names the icon: the icon becomes an image (`role="img"`) with this `aria-label`. When not set or empty, the icon is decorative and hidden from screen readers.
   */
  readonly label = input<string | undefined>();

  private readonly registry = inject(CckIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  /** The parsed `svg` string; `icon` is `undefined` when it is not an `<svg>`. */
  private readonly parsed = signal<{ readonly source: string; readonly icon: Icon | undefined } | undefined>(undefined);

  private readonly icon = computed<Icon | undefined>(() => {
    this.registry.changes();
    const name = this.iconName();
    if (name) return this.registry.get(name);
    const parsed = this.parsed();
    return parsed?.source === this.svg() ? parsed?.icon : undefined;
  });

  protected readonly parts = computed(() =>
    getSvgIconProps({ iconName: this.iconName(), icon: this.icon(), label: this.label() }),
  );

  // The markup is trusted content (registered icons and the `svg` input); Angular's sanitiser would strip it.
  protected readonly markup = computed(() => {
    const { svg, body } = this.parts();
    const viewBox = svg.viewBox === undefined ? '' : ` viewBox="${escapeAttribute(svg.viewBox)}"`;
    const html = `<svg class="${svg.class}"${viewBox} aria-hidden="${svg['aria-hidden']}" focusable="${svg.focusable}">${body}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  /** The theme attributes of the root, applied to the host. */
  protected readonly theme = themeAttrs(svgIconAnatomy);

  /** What is wrong with the inputs, if anything; development logs it once per change. */
  private readonly problem = computed<string | undefined>(() => {
    this.registry.changes();
    const name = this.iconName();
    const svg = this.svg();
    if (name && svg) return 'give iconName or svg, not both; iconName is used';
    if (name) {
      return this.registry.has(name)
        ? undefined
        : `no icon named "${name}" is registered; register it with registerIcons or registerIcon`;
    }
    if (!svg) return 'give iconName or svg';
    const parsed = this.parsed();
    return parsed?.source === svg && !parsed.icon ? 'svg is not an <svg> element with a viewBox or a size' : undefined;
  });

  constructor() {
    // Client only (after render): parse the `svg` string once per value, and start a lazy icon.
    afterRenderEffect(() => {
      const svg = this.iconName() ? undefined : this.svg();
      if (svg) this.parsed.set({ source: svg, icon: parseSvg(svg) });
    });
    afterRenderEffect(() => {
      this.registry.changes();
      const name = this.iconName();
      if (name && !this.registry.get(name) && this.registry.has(name)) void this.registry.load(name);
    });
    afterRenderEffect(() => {
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
      const problem = this.problem();
      if (problem) console.error(`CocoKits: ${problem}.`);
    });
  }
}
