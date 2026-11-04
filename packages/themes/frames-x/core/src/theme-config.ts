import { defineThemeConfig, type ThemeConfig, type ThemeOption } from '@cocokits/shared';
import { modeCollections } from './mode-collections';

/** The variants are written by hand: Frames X has no token collections. */
const BUTTON_VARIANTS = ['solid', 'outline'] as const;

/** A button option: a ThemeOption with literal values, rendered on the root part. */
interface RootOption<V extends readonly string[]> extends ThemeOption {
  readonly values: V;
  readonly default: V[number];
  readonly partNames: readonly ['root'];
  readonly description: string;
}

/** The type of `framesXThemeConfig`; theme layers derive their option unions from it. */
export interface FramesXThemeConfig extends ThemeConfig {
  readonly name: 'frames-x';
  readonly components: {
    readonly button: {
      readonly variant: RootOption<typeof BUTTON_VARIANTS>;
    };
  };
}

/** The options of the frames-x theme per component. */
export const framesXThemeConfig: FramesXThemeConfig = defineThemeConfig({
  name: 'frames-x',
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
