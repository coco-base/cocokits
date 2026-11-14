import { computed, onMounted, watch, type ComputedRef } from 'vue';
import { defaultPartIcons } from '@cocokits/icons';
import { isDevelopment, useIconRegistry, useThemeConfig } from '@cocokits/vue-core';
import { useIconVersion } from './use-icon-version';

const defaults: Readonly<Partial<Record<string, Readonly<Partial<Record<string, string>>>>>> = defaultPartIcons;

/**
 * The name of the icon a part draws when the author gave no content: the icon its theme names in
 * `components.<block>.icons.<part>` when the registry has it, else the default of `defaultPartIcons`. A theme name the
 * registry lacks falls back to the default, and in development logs one `CocoKits:` error after mount. A part
 * re-renders when the registry notifies, so a late registration replaces the default. Call it in `setup`.
 *
 * @internal
 * @param block - The anatomy block of the component, never a literal name.
 * @param part - The name of the part.
 * @returns A computed with the icon name to draw.
 */
export function usePartIcon(block: string, part: string): ComputedRef<string> {
  const registry = useIconRegistry();
  const themeConfig = useThemeConfig();
  const { track } = useIconVersion(registry);
  const themeName = computed(() => themeConfig.value?.components[block]?.icons?.[part]);
  const fallback = defaults[block]?.[part] ?? '';
  const name = computed(() => {
    track();
    const named = themeName.value;
    return named !== undefined && registry.has(named) ? named : fallback;
  });

  /** Development only, after mount, so the server render has no effect. */
  function reportMissing(): void {
    const named = themeName.value;
    if (named !== undefined && !registry.has(named) && isDevelopment()) {
      console.error(
        `CocoKits: the theme names the icon "${named}" for the ${part} of ${block}, but no icon with that name is registered, so the default "${fallback}" is shown. Register it with registerIcons or registerIcon.`,
      );
    }
  }
  onMounted(reportMissing);
  watch(themeName, reportMissing, { flush: 'post' });
  return name;
}
