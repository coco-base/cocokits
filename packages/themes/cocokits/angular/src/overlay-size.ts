import { ElementRef, Renderer2, afterRenderEffect, inject } from '@angular/core';
import { CCK_THEME } from '@cocokits/angular-core';
import { resolveInheritedValue } from '@cocokits/theme-cocokits';

/** The part of a `ThemeOption` this helper reads. */
interface SizeOption {
  readonly attrName: string;
  readonly default: string | boolean | null;
}

/**
 * Writes the `size` of the overlay content the theme directive sits on: the root's own value, else the
 * `provideCckTheme` override, else the config default; `null` removes it. It writes after the render, so it lands after
 * the base binding of the content (which only resolves the override and the default) and again whenever the root's
 * size changes. Without a provided theme it writes nothing. Call it in an injection context. @internal
 *
 * @param componentName - The component name in the `ThemeConfig` (`dialog` or `tooltip`).
 * @param readRootSize - Reads the size of the themed root: `undefined` defers, `null` removes.
 */
export function bindContentSize(componentName: string, readRootSize: () => string | null | undefined): void {
  const theme = inject(CCK_THEME, { optional: true });
  const element = inject<ElementRef<Element>>(ElementRef).nativeElement;
  const renderer = inject(Renderer2);
  afterRenderEffect(() => {
    const option = theme?.themeConfig.components[componentName]?.size as SizeOption | undefined;
    if (!theme || !option) return;
    const value = resolveInheritedValue(readRootSize(), theme.overrides[componentName]?.size, option.default);
    const name = `data-${option.attrName}`;
    if (typeof value === 'string') renderer.setAttribute(element, name, value);
    else renderer.removeAttribute(element, name);
  });
}
