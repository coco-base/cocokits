import { defineThemeConfig, type ThemeConfig, type ThemeOption } from '@cocokits/shared';
import { modeCollections } from './mode-collections';

/** The variants are written by hand: FramesX has no token collections. */
const BUTTON_VARIANTS = ['solid', 'outline'] as const;

/** A button option: a ThemeOption with literal values, rendered on the root part. */
interface RootOption<V extends readonly string[]> extends ThemeOption {
  readonly values: V;
  readonly default: V[number];
  readonly partNames: readonly ['root'];
  readonly description: string;
}

/** The type of `framesxThemeConfig`; theme layers derive their option unions from it. */
export interface FramesxThemeConfig extends ThemeConfig {
  readonly name: 'framesx';
  readonly components: {
    readonly button: {
      readonly variant: RootOption<typeof BUTTON_VARIANTS>;
    };
  };
}

/** The options of the framesx theme per component. */
export const framesxThemeConfig: FramesxThemeConfig = defineThemeConfig({
  name: 'framesx',
  modeCollections,
  components: {
    button: {
      variant: {
        attrName: 'variant',
        values: BUTTON_VARIANTS,
        default: 'solid',
        partNames: ['root'],
        description: 'Fill and border style.',
      },
    },
  },
});
