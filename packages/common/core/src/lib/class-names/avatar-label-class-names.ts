import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const avatarLabelLayoutClassNamesConfig = {
  componentName: 'avatarLabel',
  baseSelectorStructure: { block: 'avatar-label' },
  elements: {
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of `AvatarLabel` component.',
    },
    labelWrapper: {
      name: 'Label Wrapper',
      selectorStructure: [{ element: 'label-wrapper' }],
      description: `Wrapper element that contains title and description text.`,
    },
    title: {
      name: 'Title Element',
      selectorStructure: [{ element: 'title' }],
      description: `The element that contains the title of avatar such as the name.`,
    },
    description: {
      name: 'Description  Element',
      selectorStructure: [{ element: 'description' }],
      description: `The element that contains the description of avatar`,
    },
    avatarPositionLeft: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'avatar-left' }],
      description: 'Apply to the host element when `avatarPosition` is left.',
    },
    avatarPositionRight: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'avatar-right' }],
      description: 'Apply to the host element when `avatarPosition` is right.',
    },
    avatarPositionTop: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'avatar-top' }],
      description: 'Apply to the host element when `avatarPosition` is top.',
    },
    avatarPositionBottom: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'avatar-bottom' }],
      description: 'Apply to the host element when `avatarPosition` is bottom.',
    },
    labelAlignmentHorizontal: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'label-horizontal' }],
      description: 'Apply to the host element when `labelAlignment` is horizontal.',
    },
    labelAlignmentVertical: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'label-vertical' }],
      description: 'Apply to the host element when `labelAlignment` is vertical.',
    },
  },
} satisfies LayoutClassNamesConfig;

export function getAvatarLabelClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof avatarLabelLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(avatarLabelLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    host: generateLayoutClassNameFromElement(avatarLabelLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    labelWrapper: generateLayoutClassNameFromElement(avatarLabelLayoutClassNamesConfig, 'labelWrapper', themeConfig),
    title: generateLayoutClassNameFromElement(avatarLabelLayoutClassNamesConfig, 'title', themeConfig),
    description: generateLayoutClassNameFromElement(avatarLabelLayoutClassNamesConfig, 'description', themeConfig),

    avatarPositionLeft: generateLayoutClassNameFromElement(
      avatarLabelLayoutClassNamesConfig,
      'avatarPositionLeft',
      themeConfig
    ),
    avatarPositionRight: generateLayoutClassNameFromElement(
      avatarLabelLayoutClassNamesConfig,
      'avatarPositionRight',
      themeConfig
    ),
    avatarPositionTop: generateLayoutClassNameFromElement(
      avatarLabelLayoutClassNamesConfig,
      'avatarPositionTop',
      themeConfig
    ),
    avatarPositionBottom: generateLayoutClassNameFromElement(
      avatarLabelLayoutClassNamesConfig,
      'avatarPositionBottom',
      themeConfig
    ),
    labelAlignmentHorizontal: generateLayoutClassNameFromElement(
      avatarLabelLayoutClassNamesConfig,
      'labelAlignmentHorizontal',
      themeConfig
    ),
    labelAlignmentVertical: generateLayoutClassNameFromElement(
      avatarLabelLayoutClassNamesConfig,
      'labelAlignmentVertical',
      themeConfig
    ),
  };
}
