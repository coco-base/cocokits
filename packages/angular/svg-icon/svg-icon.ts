import { Component, ViewEncapsulation, afterRenderEffect, computed, input } from '@angular/core';
import { themeAttrs, themeIcons } from '@cocokits/angular-core';
import { getSvgIconProps, svgIconAnatomy } from '@cocokits/machines/svg-icon';

/**
 * An icon of the provided theme, drawn by its name. The theme gives the icons (`ThemeConfig.icons`), so the name must be one of them. To add an icon or replace one, provide an extended theme config.
 *
 * The icon is hidden from screen readers. Give `label` to a meaningful icon: it becomes an image with that name. Inside a named button the icon stays hidden and the button carries the name.
 *
 * The icon is only `svg` and `path` elements from the icon data; no markup is parsed or injected. An unknown name renders an empty `svg`, and in development logs an error.
 *
 * Without the theme CSS the browser gives the `svg` its default size and fills it black: size `.cck-svg-icon__svg` and set `fill: currentColor`.
 *
 * @example
 * <cck-svg-icon iconName="heart" />
 * <cck-svg-icon iconName="search" label="Search" />
 * @example
 * import { provideCckTheme } from '@cocokits/angular-core';
 * import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
 *
 * const logo = { viewBox: '0 0 24 24', paths: [{ d: 'M12 2 2 22h20z' }] };
 * const appTheme = { ...cocokitsThemeConfig, icons: { ...cocokitsThemeConfig.icons, logo } };
 *
 * // In the app config: providers: [provideCckTheme(appTheme)]
 * // In a component that has imports: [CckSvgIconImports] from '@cocokits/angular/svg-icon':
 * <cck-svg-icon iconName="logo" label="Acme" />
 * @cckPart root
 * @cckPart svg
 */
@Component({
  selector: 'cck-svg-icon',
  exportAs: 'cckSvgIcon',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'parts().root.class',
    '[attr.data-icon-name]': 'parts().root["data-icon-name"]',
    '[attr.aria-hidden]': 'parts().root["aria-hidden"] ?? null',
    '[attr.role]': 'parts().root.role ?? null',
    '[attr.aria-label]': 'parts().root["aria-label"] ?? null',
  },
  template: `
    <svg [class]="parts().svg.class" [attr.viewBox]="parts().svg.viewBox ?? null">
      @for (path of parts().paths; track $index) {
        <path
          [attr.d]="path.d"
          [attr.fill-rule]="path['fill-rule'] ?? null"
          [attr.clip-rule]="path['clip-rule'] ?? null"
        />
      }
    </svg>
  `,
})
export class CckSvgIcon {
  /**
   * The name of the icon in the provided theme's icon set. A name the theme does not have renders an empty `svg`.
   */
  readonly iconName = input.required<string>();

  /**
   * Names the icon: the icon becomes an image (`role="img"`) with this `aria-label`. When not set or empty, the icon is decorative and hidden from screen readers.
   */
  readonly label = input<string | undefined>();

  private readonly icons = themeIcons().icons;

  protected readonly parts = computed(() =>
    getSvgIconProps({ iconName: this.iconName(), icons: this.icons, label: this.label() }),
  );

  /** The theme attributes of the root, applied to the host. */
  protected readonly theme = themeAttrs(svgIconAnatomy);

  constructor() {
    // Client only (after render), once per mount and per change of the name.
    afterRenderEffect(() => {
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
      const name = this.iconName();
      if (!Object.hasOwn(this.icons, name)) {
        console.error(
          `CocoKits: the theme has no icon named "${name}". Check the name, or add the icon to the icons of the theme config.`,
        );
      }
    });
  }
}
