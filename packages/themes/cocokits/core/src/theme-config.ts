import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';
import { type AvatarComponentsConfig, avatarComponents } from './avatar-config';
import type { OptionalOption, Option, RootOption } from './option-types';
import { inheritable, rootSize } from './option-helpers';
import { type TabsOptions, tabsOptions } from './tabs-config';
import type { ThemeIconName } from './theme-icons';
import {
  accordionSizeDefaultMode,
  accordionSizeModes,
  badgeSizeDefaultMode,
  badgeSizeModes,
  buttonSizeDefaultMode,
  buttonSizeModes,
  checkboxSizeDefaultMode,
  checkboxSizeModes,
  chipListSizeDefaultMode,
  chipListSizeModes,
  chipSizeDefaultMode,
  chipSizeModes,
  dialogContentSizeDefaultMode,
  dialogContentSizeModes,
  dividerSizeDefaultMode,
  dividerSizeModes,
  formFieldSizeDefaultMode,
  formFieldSizeModes,
  formFieldWidthModes,
  iconButtonSizeDefaultMode,
  iconButtonSizeModes,
  inputSizeDefaultMode,
  inputSizeModes,
  menuContentSizeDefaultMode,
  menuContentSizeModes,
  radioSizeDefaultMode,
  radioSizeModes,
  selectSizeDefaultMode,
  selectSizeModes,
  svgIconSizeModes,
  switchSizeDefaultMode,
  switchSizeModes,
  textareaSizeDefaultMode,
  textareaSizeModes,
  themeActiveColorDefaultMode,
  modeCollections,
  themeActiveColorModes,
  tooltipContentSizeDefaultMode,
  tooltipContentSizeModes,
} from './generated/token-modes';

/** No token collection holds the variants, so they are written by hand. */
const BUTTON_VARIANTS = ['primary', 'outline', 'basic'] as const;
const BADGE_VARIANTS = ['rounded', 'rectangle'] as const;
/** No token collection holds the Accordion looks, so they are written by hand. */
const ACCORDION_VARIANTS = ['default', 'group', 'basic'] as const;
/** Which side of the label the chevron sits on, in the writing direction; no token collection holds it. */
const ACCORDION_TOGGLE_POSITIONS = ['after', 'before'] as const;
/** The look of the track: a contained pill with the thumb inside, or a thin rail with the thumb on it. */
const SWITCH_VARIANTS = ['contained', 'rail'] as const;
/** Which mark an option of the Select list shows; no token collection holds it. */
const SELECT_INDICATORS = ['checkmark', 'checkbox', 'none'] as const;
/** Where the label sits against the box or track; no token collection holds it. */
const LABEL_POSITIONS = ['after', 'before'] as const;
/** The strength of the line is a border colour, not an Active Color family, so no token collection holds it. */
const DIVIDER_COLORS = ['light', 'default', 'dark'] as const;
/** A two-state option: its `data-*` is present when true and absent when false. */
const BOOLEAN_VALUES = [true, false] as const;
/** The grip of the Textarea: `true` and `vertical` resize the height, then the width or both; `false` shows none. */
const TEXTAREA_RESIZES = [true, false, 'vertical', 'horizontal', 'both'] as const;
/** An option on the content part only. */
type ContentOption<V extends readonly (string | boolean)[]> = Option<V, readonly ['content']>;

/** The type of `cocokitsThemeConfig`; theme layers derive their option unions from it. */
export interface CocokitsThemeConfig extends ThemeConfig {
  readonly name: 'cocokits';
  readonly components: AvatarComponentsConfig & {
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
    /** The size is set on the themed root and drawn on the content. */
    readonly dialog: {
      readonly size: ContentOption<typeof dialogContentSizeModes>;
    };
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
    readonly chip: {
      readonly size: RootOption<typeof chipSizeModes>;
      readonly icons: { readonly remove: ThemeIconName };
    };
    /** The list sizes its own row and its text box; inside a FormField it takes the field's size. */
    readonly 'chip-list': {
      readonly size: RootOption<typeof chipListSizeModes>;
    };
    /** Supported with no options. */
    readonly 'field-error': Record<string, never>;
    readonly 'form-field': {
      readonly size: Option<typeof formFieldSizeModes, readonly ['root', 'inputWrapper']>;
      readonly width: OptionalOption<typeof formFieldWidthModes>;
    };
    /** Supported with no options. */
    readonly hint: Record<string, never>;
    readonly 'icon-button': {
      readonly variant: RootOption<typeof BUTTON_VARIANTS>;
      readonly color: RootOption<typeof themeActiveColorModes>;
      readonly size: RootOption<typeof iconButtonSizeModes>;
      readonly rounded: RootOption<typeof BOOLEAN_VALUES>;
    };
    /** The menu draws no icon of its own: item icons are the author's content, so there is no `icons` key. */
    readonly menu: {
      readonly size: ContentOption<typeof menuContentSizeModes>;
    };
    readonly input: {
      readonly size: RootOption<typeof inputSizeModes>;
    };
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
    /** The options exist to be inherited by its radios; the layout is CSS on its own attributes. */
    readonly 'radio-group': {
      readonly size: OptionalOption<typeof radioSizeModes>;
      readonly color: OptionalOption<typeof themeActiveColorModes>;
      readonly labelPosition: OptionalOption<typeof LABEL_POSITIONS>;
    };
    readonly select: {
      readonly size: RootOption<typeof selectSizeModes>;
      readonly indicator: OptionalOption<typeof SELECT_INDICATORS, readonly ['content']>;
      readonly icons: { readonly dropdownIcon: ThemeIconName; readonly optionIndicator: ThemeIconName };
    };
    readonly switch: {
      readonly variant: RootOption<typeof SWITCH_VARIANTS>;
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
      readonly size: RootOption<typeof textareaSizeModes>;
      readonly resize: RootOption<typeof TEXTAREA_RESIZES>;
      readonly autoResize: RootOption<typeof BOOLEAN_VALUES>;
    };
    /** The size is set on the themed root and drawn on the content. */
    readonly tooltip: {
      readonly size: ContentOption<typeof tooltipContentSizeModes>;
    };
    /** Supported with no options; the field places it. */
    readonly trailing: Record<string, never>;
  };
}

/** The options of the cocokits theme per component. */
export const cocokitsThemeConfig: CocokitsThemeConfig = defineThemeConfig({
  name: 'cocokits',
  modeCollections,
  components: {
    ...avatarComponents,
    accordion: {
      variant: {
        attrName: 'variant',
        values: ACCORDION_VARIANTS,
        default: 'default',
        partNames: ['root'],
        description: 'Look of the sections: separate bordered items, one bordered group with dividers, or no chrome.',
      },
      size: rootSize(accordionSizeModes, accordionSizeDefaultMode, 'Height, padding and text of the triggers.'),
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
        description: 'Pill or small radius.',
      },
      color: {
        attrName: 'cck-color',
        values: themeActiveColorModes,
        default: themeActiveColorDefaultMode,
        partNames: ['root'],
        description: 'Seven colours.',
      },
      size: rootSize(badgeSizeModes, badgeSizeDefaultMode, 'Four sizes.'),
    },
    'badge-container': {},
    dialog: {
      size: {
        attrName: 'size',
        values: dialogContentSizeModes,
        default: dialogContentSizeDefaultMode,
        partNames: ['content'],
        description: 'Width, padding and gap of the window, set on the root and drawn on the content.',
      },
    },
    divider: {
      size: rootSize(dividerSizeModes, dividerSizeDefaultMode, 'Thickness of the line.'),
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
        description: 'Colour family of the button.',
      },
      size: rootSize(buttonSizeModes, buttonSizeDefaultMode, 'Minimum height, padding and text.'),
    },
    checkbox: {
      size: rootSize(checkboxSizeModes, checkboxSizeDefaultMode, 'Size of the box and its label text.'),
      color: {
        attrName: 'cck-color',
        values: themeActiveColorModes,
        default: themeActiveColorDefaultMode,
        partNames: ['root'],
        description: 'Colour family of the checked state.',
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
    chip: {
      size: rootSize(chipSizeModes, chipSizeDefaultMode, 'Height of the chip.'),
      icons: { remove: 'circle-xmark' },
    },
    'chip-list': {
      size: rootSize(
        chipListSizeModes,
        chipListSizeDefaultMode,
        'Height of its text box and its row; inside a FormField it takes the size of the field.',
      ),
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
      width: {
        attrName: 'width',
        values: formFieldWidthModes,
        default: null,
        partNames: ['root'],
        description: 'Width of the field. Without it the field keeps the width its layout gives it.',
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
        description: 'Colour family of the button.',
      },
      size: rootSize(iconButtonSizeModes, iconButtonSizeDefaultMode, 'Side of the square and size of the icon.'),
      rounded: {
        attrName: 'rounded',
        values: BOOLEAN_VALUES,
        default: false,
        partNames: ['root'],
        description: 'Fully round corners (a circle).',
      },
    },
    input: {
      size: rootSize(
        inputSizeModes,
        inputSizeDefaultMode,
        'Height, padding and text; inside a FormField it takes the size of the field.',
      ),
    },
    menu: {
      size: {
        attrName: 'size',
        values: menuContentSizeModes,
        default: menuContentSizeDefaultMode,
        partNames: ['content'],
        description: 'Height of the items, set on the content; the items follow it.',
      },
    },
    label: {},
    leading: {},
    prefix: {},
    suffix: {},
    popover: {},
    radio: {
      size: rootSize(radioSizeModes, radioSizeDefaultMode, 'Size of the radio.'),
      color: {
        attrName: 'cck-color',
        values: themeActiveColorModes,
        default: themeActiveColorDefaultMode,
        partNames: ['root'],
        description: 'Colour family of the checked state.',
      },
      labelPosition: {
        attrName: 'label-position',
        values: LABEL_POSITIONS,
        default: 'after',
        partNames: ['root'],
        description: 'Whether the label follows the radio or precedes it, in the writing direction.',
      },
    },
    'radio-group': {
      size: inheritable('size', radioSizeModes, 'Size of its radios that set none of their own.'),
      color: inheritable('cck-color', themeActiveColorModes, 'Color family of its radios that set none of their own.'),
      labelPosition: inheritable('label-position', LABEL_POSITIONS, 'Label side of its radios that set none.'),
    },
    select: {
      size: rootSize(
        selectSizeModes,
        selectSizeDefaultMode,
        'Height, padding and text of the trigger; inside a FormField it takes the size of the field.',
      ),
      indicator: {
        attrName: 'indicator',
        values: SELECT_INDICATORS,
        default: null,
        partNames: ['content'],
        description:
          'Mark of the selected option: a check after the text, a box before it, or none. Without it a single list shows a check and a multiple list a box.',
      },
      icons: { dropdownIcon: 'chevron-down', optionIndicator: 'check' },
    },
    switch: {
      variant: {
        attrName: 'variant',
        values: SWITCH_VARIANTS,
        default: 'contained',
        partNames: ['root'],
        description: 'Look of the track: a contained pill with the thumb inside, or a thin rail with the thumb on it.',
      },
      size: rootSize(switchSizeModes, switchSizeDefaultMode, 'Size of the track and its label text.'),
      color: {
        attrName: 'cck-color',
        values: themeActiveColorModes,
        default: themeActiveColorDefaultMode,
        partNames: ['root'],
        description: 'Colour family of the checked state.',
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
        description: 'Colour family. Without it the icon takes the colour of the text around it.',
      },
      rtlMirror: {
        attrName: 'rtl-mirror',
        values: BOOLEAN_VALUES,
        default: false,
        partNames: ['root'],
        description: 'Mirrors the icon in a right-to-left context, for an icon that points along the text.',
      },
    },
    tabs: tabsOptions,
    'tab-nav': tabsOptions,
    textarea: {
      size: rootSize(
        textareaSizeModes,
        textareaSizeDefaultMode,
        'Padding and text; inside a FormField it takes the size of the field.',
      ),
      resize: {
        attrName: 'resize',
        values: TEXTAREA_RESIZES,
        default: true,
        partNames: ['root'],
        description:
          'Which way the grip resizes the box: vertical (true), horizontal or both. False shows no grip. It has no effect with autoResize.',
      },
      autoResize: {
        attrName: 'auto-resize',
        values: BOOLEAN_VALUES,
        default: false,
        partNames: ['root'],
        description: 'Grows with its content between the min and max rows.',
      },
    },
    tooltip: {
      size: {
        attrName: 'size',
        values: tooltipContentSizeModes,
        default: tooltipContentSizeDefaultMode,
        partNames: ['content'],
        description: 'Padding, width and text of the bubble, set on the root and drawn on the content.',
      },
    },
    trailing: {},
  },
});
