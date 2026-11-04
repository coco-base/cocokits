import { ElementRef, computed, inject, type Signal } from '@angular/core';
import { resolveThemeAttrs, type ThemeAttrsByPart, type ThemeConfig } from '@cocokits/shared';
import { bindAttrs } from './attrs';
import { CCK_THEME, CCK_THEME_OPTIONS } from './theme-provider';

/** `Node.ELEMENT_NODE`, as a number so the module needs no `Node` global (server rendering). */
const ELEMENT_NODE = 1;

const NO_THEME: ThemeConfig = { name: '', components: {} };

/** The return value of {@link themeAttrs}. */
export type ThemeAttrsSignal<A extends { readonly parts: object }> = Signal<ThemeAttrsByPart<A>>;

/**
 * Resolves the theme `data-*` attributes of every part of a component. Call it once, in an
 * injection context. Without a provided theme every record is empty. The theme directive's input
 * signals are read inside the returned signal, so a change of an input updates the attributes.
 *
 * The `root` part is the host element in Angular, so its record is applied to the host (with
 * `Renderer2`, in an effect). A root that renders no element (its host is a comment, as with `<ng-container>`)
 * has no attributes to carry, so its record is not applied. The other parts are bound by the template with
 * `[cckAttrs]`.
 *
 * @param anatomy - The component anatomy; its block names the component in the `ThemeConfig` and
 *   its parts are the parts resolved.
 * @returns The attribute record of each part, as a signal.
 */
export function themeAttrs<A extends { readonly block: string; readonly parts: { readonly root: unknown } }>(
  anatomy: A,
): ThemeAttrsSignal<A> {
  const themeState = inject(CCK_THEME, { optional: true });
  const themeOptions = inject(CCK_THEME_OPTIONS, { optional: true });
  const attrs = computed<ThemeAttrsByPart<A>>(() => {
    const ownValues: Record<string, string | boolean | null | undefined> = {};
    if (themeOptions?.componentName === anatomy.block) {
      for (const [optionName, value] of Object.entries(themeOptions.values)) ownValues[optionName] = value();
    }
    return resolveThemeAttrs(
      themeState?.themeConfig ?? NO_THEME,
      anatomy,
      ownValues,
      themeState?.overrides[anatomy.block],
    );
  });

  const host = inject<ElementRef<Node>>(ElementRef).nativeElement;
  if (host.nodeType === ELEMENT_NODE) bindAttrs(host as Element, () => attrs().root);
  return attrs;
}
