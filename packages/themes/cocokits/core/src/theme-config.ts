import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';
import type { ThemeIconName } from './theme-icons';
import {
  type ThemeActiveColorMode,
  accordionSizeDefaultMode,
  accordionSizeModes,
  badgeSizeDefaultMode,
  badgeSizeModes,
  buttonSizeDefaultMode,
  buttonSizeModes,
  checkboxSizeDefaultMode,
  checkboxSizeModes,
  dividerSizeDefaultMode,
  dividerSizeModes,
  formFieldSizeDefaultMode,
  formFieldSizeModes,
  iconButtonSizeDefaultMode,
  iconButtonSizeModes,
  radioSizeDefaultMode,
  radioSizeModes,
  selectSizeDefaultMode,
  selectSizeModes,
  svgIconSizeModes,
  switchSizeDefaultMode,
  switchSizeModes,
  tabsSizeDefaultMode,
  tabsSizeModes,
  themeActiveColorDefaultMode,
  modeCollections,
  themeActiveColorModes,
} from './generated/token-modes';

/** No token collection holds the variants, so they are written by hand. */
const BUTTON_VARIANTS = ['primary', 'outline', 'light', 'basic'] as const;
const BADGE_VARIANTS = ['rounded', 'rectangle'] as const;
/** No token collection holds the Accordion looks, so they are written by hand. */
const ACCORDION_VARIANTS = ['default', 'group', 'basic'] as const;
/** Which side of the label the chevron sits on, in the writing direction; no token collection holds it. */
const ACCORDION_TOGGLE_POSITIONS = ['after', 'before'] as const;
const TABS_VARIANTS = ['border', 'fill', 'line', 'basic'] as const;
/** Where the list sits across the tabs, in the writing direction; no token collection holds it. */
const TABS_HEADER_ALIGNS = ['start', 'center', 'end', 'stretch'] as const;
/** Where the label sits against the box or track; no token collection holds it. */
const LABEL_POSITIONS = ['after', 'before'] as const;
/** The strength of the line is a border colour, not an Active Color family, so no token collection holds it. */
const DIVIDER_COLORS = ['light', 'default', 'dark'] as const;
/** A two-state option: its `data-*` is present when true and absent when false. */
const BOOLEAN_VALUES = [true, false] as const;
/** The Badge picks its own colour default, `contrast`; the type makes a value that is not a mode an error. */
const BADGE_DEFAULT_COLOR: ThemeActiveColorMode = 'contrast';
/** The Tabs indicator is neutral until the author picks a family; the type makes a value that is not a mode an error. */
const TABS_DEFAULT_COLOR: ThemeActiveColorMode = 'neutral';

interface Option<V extends readonly (string | boolean)[], P extends readonly string[]> {
  readonly attrName: string;
  readonly values: V;
  readonly default: V[number];
  readonly partNames: P;
  readonly description: string;
}

/** An option that renders nothing until the author gives it (`default: null`). */
type OptionalOption<V extends readonly (string | boolean)[]> = Omit<RootOption<V>, 'default'> & {
  readonly default: null;
};

/** An option on the root part only. */
type RootOption<V extends readonly (string | boolean)[]> = Option<V, readonly ['root']>;

/**
 * The options of Tabs and TabNav (they share the look and the tokens). Not an interface: an interface has no index
 * signature, which `ThemeConfig` needs.
 */
type TabsOptions = Readonly<{
  variant: RootOption<typeof TABS_VARIANTS>;
  color: RootOption<typeof themeActiveColorModes>;
  size: RootOption<typeof tabsSizeModes>;
  headerAlign: RootOption<typeof TABS_HEADER_ALIGNS>;
}>;

/** The type of `cocokitsThemeConfig`; theme layers derive their option unions from it. */
export interface CocokitsThemeConfig extends ThemeConfig {
  readonly name: 'cocokits';
  readonly components: {
    readonly accordion: {
      readonly variant: RootOption<typeof ACCORDION_VARIANTS>;
      readonly size: RootOption<typeof accordionSizeModes>;
      readonly togglePosition: RootOption<typeof ACCORDION_TOGGLE_POSITIONS>;
      readonly hideToggle: RootOption<typeof BOOLEAN_VALUES>;
      readonly icons: { readonly indicator: ThemeIconName };
    };
    readonly badge: {
      readonly variant: RootOption<typeof BADGE_VARIANTS>;
      readonly color: RootOption<typeof themeActiveColorModes>;
      readonly size: RootOption<typeof badgeSizeModes>;
    };
    /** Supported with no options. */
    readonly 'badge-container': Record<string, never>;
    /** Supported with no options. */
    readonly dialog: Record<string, never>;
    readonly divider: {
      readonly size: RootOption<typeof dividerSizeModes>;
      readonly color: RootOption<typeof DIVIDER_COLORS>;
    };
    readonly button: {
      readonly variant: RootOption<typeof BUTTON_VARIANTS>;
      readonly color: RootOption<typeof themeActiveColorModes>;
      readonly size: RootOption<typeof buttonSizeModes>;
    };
    readonly checkbox: {
      readonly size: RootOption<typeof checkboxSizeModes>;
      readonly color: RootOption<typeof themeActiveColorModes>;
      readonly labelPosition: RootOption<typeof LABEL_POSITIONS>;
      readonly icons: { readonly background: ThemeIconName };
    };
    /** Supported with no options. */
    readonly 'field-error': Record<string, never>;
    readonly 'form-field': {
      readonly size: Option<typeof formFieldSizeModes, readonly ['root', 'inputWrapper']>;
    };
    /** Supported with no options. */
    readonly hint: Record<string, never>;
    readonly 'icon-button': {
      readonly variant: RootOption<typeof BUTTON_VARIANTS>;
      readonly color: RootOption<typeof themeActiveColorModes>;
      readonly size: RootOption<typeof iconButtonSizeModes>;
      readonly rounded: RootOption<typeof BOOLEAN_VALUES>;
    };
    /** Supported with no options; the Input is sized by the FormField. */
    readonly input: Record<string, never>;
    /** Supported with no options. */
    readonly label: Record<string, never>;
    /** Supported with no options; the field places it. */
    readonly leading: Record<string, never>;
    /** Supported with no options; the field box places it. */
    readonly prefix: Record<string, never>;
    /** Supported with no options; the field box places it. */
    readonly suffix: Record<string, never>;
    /** Supported with no options. */
    readonly popover: Record<string, never>;
    readonly radio: {
      readonly size: RootOption<typeof radioSizeModes>;
      readonly color: RootOption<typeof themeActiveColorModes>;
      readonly labelPosition: RootOption<typeof LABEL_POSITIONS>;
    };
    /** Supported with no options; the layout is CSS on its own attributes. */
    readonly 'radio-group': Record<string, never>;
    readonly select: {
      readonly size: RootOption<typeof selectSizeModes>;
      readonly icons: { readonly dropdownIcon: ThemeIconName; readonly optionIndicator: ThemeIconName };
    };
    readonly switch: {
      readonly size: RootOption<typeof switchSizeModes>;
      readonly color: RootOption<typeof themeActiveColorModes>;
      readonly labelPosition: RootOption<typeof LABEL_POSITIONS>;
    };
    /** The icon is 1em and `currentColor` until the author gives a size or a color. */
    readonly 'svg-icon': {
      readonly size: OptionalOption<typeof svgIconSizeModes>;
      readonly color: OptionalOption<typeof themeActiveColorModes>;
      readonly rtlMirror: RootOption<typeof BOOLEAN_VALUES>;
    };
    readonly tabs: TabsOptions;
    /** Link tabs: the Tabs options, the same look. */
    readonly 'tab-nav': TabsOptions;
    readonly textarea: {
      readonly autoResize: RootOption<typeof BOOLEAN_VALUES>;
    };
    /** Supported with no options. */
    readonly tooltip: Record<string, never>;
    /** Supported with no options; the field places it. */
    readonly trailing: Record<string, never>;
  };
}

/** The options of Tabs and TabNav. */
const TABS_OPTIONS: TabsOptions = {
  variant: {
    attrName: 'variant',
    values: TABS_VARIANTS,
    default: 'border',
    partNames: ['root'],
    description: 'Look of the list and the indicator: a bordered list, a filled list, a line, or the indicator alone.',
  },
  color: {
    attrName: 'cck-color',
    values: themeActiveColorModes,
    default: TABS_DEFAULT_COLOR,
    partNames: ['root'],
    description: 'Color family of the indicator; renders the Active Color marker data-cck-color.',
  },
  size: {
    attrName: 'size',
    values: tabsSizeModes,
    default: tabsSizeDefaultMode,
    partNames: ['root'],
    description: 'Height, padding and text of the triggers.',
  },
  headerAlign: {
    attrName: 'header-align',
    values: TABS_HEADER_ALIGNS,
    default: 'start',
    partNames: ['root'],
    description: 'Where the list sits across the tabs, or stretched over their whole width.',
  },
};

/** The options of the cocokits theme per component. */
export const cocokitsThemeConfig: CocokitsThemeConfig = defineThemeConfig({
  name: 'cocokits',
  modeCollections,
  components: {
    accordion: {
      variant: {
        attrName: 'variant',
        values: ACCORDION_VARIANTS,
        default: 'default',
        partNames: ['root'],
        description: 'Look of the sections: separate bordered items, one bordered group with dividers, or no chrome.',
      },
      size: {
        attrName: 'size',
        values: accordionSizeModes,
        default: accordionSizeDefaultMode,
        partNames: ['root'],
        description: 'Height, padding and text of the triggers.',
      },
      togglePosition: {
        attrName: 'toggle-position',
        values: ACCORDION_TOGGLE_POSITIONS,
        default: 'after',
        partNames: ['root'],
        description: 'Whether the chevron follows the label or precedes it, in the writing direction.',
      },
      hideToggle: {
        attrName: 'hide-toggle',
        values: BOOLEAN_VALUES,
        default: false,
        partNames: ['root'],
        description: 'Hides the chevron.',
      },
      icons: { indicator: 'chevron-down' },
    },
    badge: {
      variant: {
        attrName: 'variant',
        values: BADGE_VARIANTS,
        default: 'rounded',
        partNames: ['root'],
        description: 'Corner radius: a pill or a small radius.',
      },
      color: {
        attrName: 'cck-color',
        values: themeActiveColorModes,
        default: BADGE_DEFAULT_COLOR,
        partNames: ['root'],
        description: 'Color family; renders the Active Color marker data-cck-color.',
      },
      size: {
        attrName: 'size',
        values: badgeSizeModes,
        default: badgeSizeDefaultMode,
        partNames: ['root'],
        description: 'Height, padding, dot size and text.',
      },
    },
    'badge-container': {},
    dialog: {},
    divider: {
      size: {
        attrName: 'size',
        values: dividerSizeModes,
        default: dividerSizeDefaultMode,
        partNames: ['root'],
        description: 'Thickness of the line.',
      },
      color: {
        attrName: 'color',
        values: DIVIDER_COLORS,
        default: 'default',
        partNames: ['root'],
        description: 'Strength of the line: a light, the default or a dark border colour.',
      },
    },
    button: {
      variant: {
        attrName: 'variant',
        values: BUTTON_VARIANTS,
        default: 'primary',
        partNames: ['root'],
        description: 'Fill and border style.',
      },
      color: {
        attrName: 'cck-color',
        values: themeActiveColorModes,
        default: themeActiveColorDefaultMode,
        partNames: ['root'],
        description: 'Color family; renders the Active Color marker data-cck-color.',
      },
      size: {
        attrName: 'size',
        values: buttonSizeModes,
        default: buttonSizeDefaultMode,
        partNames: ['root'],
        description: 'Minimum height, padding and text.',
      },
    },
    checkbox: {
      size: {
        attrName: 'size',
        values: checkboxSizeModes,
        default: checkboxSizeDefaultMode,
        partNames: ['root'],
        description: 'Size of the box and its label text.',
      },
      color: {
        attrName: 'cck-color',
        values: themeActiveColorModes,
        default: themeActiveColorDefaultMode,
        partNames: ['root'],
        description: 'Color family of the checked state; renders the Active Color marker data-cck-color.',
      },
      labelPosition: {
        attrName: 'label-position',
        values: LABEL_POSITIONS,
        default: 'after',
        partNames: ['root'],
        description: 'Whether the label follows the box or precedes it, in the writing direction.',
      },
      icons: { background: 'check' },
    },
    'field-error': {},
    'form-field': {
      size: {
        attrName: 'size',
        values: formFieldSizeModes,
        default: formFieldSizeDefaultMode,
        partNames: ['root', 'inputWrapper'],
        description: 'Height, padding and text of the input box.',
      },
    },
    hint: {},
    'icon-button': {
      variant: {
        attrName: 'variant',
        values: BUTTON_VARIANTS,
        default: 'primary',
        partNames: ['root'],
        description: 'Fill and border style.',
      },
      color: {
        attrName: 'cck-color',
        values: themeActiveColorModes,
        default: themeActiveColorDefaultMode,
        partNames: ['root'],
        description: 'Color family; renders the Active Color marker data-cck-color.',
      },
      size: {
        attrName: 'size',
        values: iconButtonSizeModes,
        default: iconButtonSizeDefaultMode,
        partNames: ['root'],
        description: 'Side of the square and size of the icon.',
      },
      rounded: {
        attrName: 'rounded',
        values: BOOLEAN_VALUES,
        default: false,
        partNames: ['root'],
        description: 'Fully round corners (a circle).',
      },
    },
    input: {},
    label: {},
    leading: {},
    prefix: {},
    suffix: {},
    popover: {},
    radio: {
      size: {
        attrName: 'size',
        values: radioSizeModes,
        default: radioSizeDefaultMode,
        partNames: ['root'],
        description: 'Size of the radio and its label text.',
      },
      color: {
        attrName: 'cck-color',
        values: themeActiveColorModes,
        default: themeActiveColorDefaultMode,
        partNames: ['root'],
        description: 'Color family of the checked state; renders the Active Color marker data-cck-color.',
      },
      labelPosition: {
        attrName: 'label-position',
        values: LABEL_POSITIONS,
        default: 'after',
        partNames: ['root'],
        description: 'Whether the label follows the radio or precedes it, in the writing direction.',
      },
    },
    'radio-group': {},
    select: {
      size: {
        attrName: 'size',
        values: selectSizeModes,
        default: selectSizeDefaultMode,
        partNames: ['root'],
        description: 'Height, padding and text of the trigger; inside a FormField the field sets them.',
      },
      icons: { dropdownIcon: 'chevron-down', optionIndicator: 'check' },
    },
    switch: {
      size: {
        attrName: 'size',
        values: switchSizeModes,
        default: switchSizeDefaultMode,
        partNames: ['root'],
        description: 'Size of the track and its label text.',
      },
      color: {
        attrName: 'cck-color',
        values: themeActiveColorModes,
        default: themeActiveColorDefaultMode,
        partNames: ['root'],
        description: 'Color family of the checked state; renders the Active Color marker data-cck-color.',
      },
      labelPosition: {
        attrName: 'label-position',
        values: LABEL_POSITIONS,
        default: 'after',
        partNames: ['root'],
        description: 'Whether the label follows the track or precedes it, in the writing direction.',
      },
    },
    'svg-icon': {
      size: {
        attrName: 'size',
        values: svgIconSizeModes,
        default: null,
        partNames: ['root'],
        description: 'Size of the icon. Without it the icon is 1em and follows the font size around it.',
      },
      color: {
        attrName: 'cck-color',
        values: themeActiveColorModes,
        default: null,
        partNames: ['root'],
        description:
          'Color family; renders the Active Color marker data-cck-color. Without it the icon is currentColor.',
      },
      rtlMirror: {
        attrName: 'rtl-mirror',
        values: BOOLEAN_VALUES,
        default: false,
        partNames: ['root'],
        description: 'Mirrors the icon in a right-to-left context, for an icon that points along the text.',
      },
    },
    tabs: TABS_OPTIONS,
    'tab-nav': TABS_OPTIONS,
    textarea: {
      autoResize: {
        attrName: 'auto-resize',
        values: BOOLEAN_VALUES,
        default: false,
        partNames: ['root'],
        description: 'Grows with its content between the min and max rows.',
      },
    },
    tooltip: {},
    trailing: {},
  },
});
