import { ClassRef, ThemeComponentConfig, ThemeConfig, UIBaseComponentsPropName } from '@cocokits/core';
import { PreparedMeta, PreparedStory, StrictInputType, Args } from '@storybook/types';
import { StoryDocPageArgTypes, StoryDocPageComponentArgTypeGroup } from './story-doc-page-api.model';
import { deepMerge, reduceDeepMerge } from '@cocokits/common-utils';
import { AddonParameters } from '../../model/addon.model';
import { reduceMerge, recordReduceMerge } from '../../../../../../common/utils/src/lib/uncategorized/reduce';

/**
 * To override the common alias names to the real name.
 * Usually the following props will be repeated in the whole project and we don't want to repeat them.
 * For other props, use storybook argTypes.
 * ```
 * argTypes: {
 *  _color: { name: 'color', ...},
 * }
 * ```
 */
const NAME_TRANSFORM_MAP: Record<string, string> = {
  _type: 'type',
  _size: 'size',
  _color: 'color',
  // _required: 'required',
  // _name: 'name',
  // _checked: 'checked',
  // _disabled: 'disabled',
  // menuTemplate: 'cckMenuTrigger',
};

export function getArgTypesApiList(preparedMeta: PreparedMeta, themeConfig: ThemeConfig): StoryDocPageArgTypes[] {
  const mainComponent = preparedMeta.component as ClassRef;
  const parameters = preparedMeta.parameters as AddonParameters;
  // Type of storybook is wrong, so we have to change it
  const subComponents = preparedMeta.subcomponents as unknown as ClassRef[] | undefined;

  const argTypeGroup = [] as StoryDocPageArgTypes[];

  if (mainComponent) {
    const mainComponentName = parameters.cckAddon?.componentName;
    if (!mainComponentName) {
      throw new Error(`Component name is missing in the story parameters for story: ${mainComponent.name}`);
    }
    argTypeGroup.push({
      componentName: mainComponent.name,
      argTypeGroup: getComponentArgTypes(
        mainComponent,
        preparedMeta.argTypes,
        parameters,
        themeConfig.components[mainComponentName]
      ),
    });
  }

  subComponents?.forEach((subcomponent) => {
    const argTypes = deepMerge(
      parameters.docs?.extractArgTypes?.(subcomponent) ?? {},
      parameters.cckAddon?.subcomponentArgsTypes?.[subcomponent.name] ?? {}
    );
    const subcomponentName = parameters.cckAddon?.subcomponentNames?.[subcomponent.name];
    if (!subcomponentName) {
      throw new Error(`Subcomponent name is missing in the story parameters for story: ${subcomponent.name}`);
    }

    argTypeGroup.push({
      componentName: subcomponent.name,
      argTypeGroup: getComponentArgTypes(subcomponent, argTypes, parameters, themeConfig.components[subcomponentName]),
    });
  });

  return argTypeGroup;
}

export function getComponentArgTypes(
  componentRef: unknown,
  originalArgTypes: PreparedStory['argTypes'],
  parameters: AddonParameters,
  themeComponentConfig: ThemeComponentConfig | undefined
): StoryDocPageComponentArgTypeGroup | null {
  /**
   * Storybook source code check if the componentRef is a class reference.
   * I don't know if it's necessary to check it, but I will keep it for now.
   */
  const isValidComponentRef = isClassRef(componentRef);

  if (!isValidComponentRef) {
    return null;
  }
  const componentName = componentRef.name;
  const uiBaseComponentName = parameters.cckAddon?.componentName;
  const overrideArgsType = parameters.cckAddon?.subcomponentArgsTypes?.[componentName] ?? {};

  if (!uiBaseComponentName) {
    throw new Error(`Component name is missing in the story parameters for story: ${componentName}`);
  }

  const argTypes = deepMerge(originalArgTypes, overrideArgsType);

  // Not all components/Directive has argTypes. For example `MenuTriggerDirective`
  if (!argTypes || Object.keys(argTypes).length === 0) {
    return { props: [], events: [], methods: [] };
  }

  const argTypeWithThemeProps = Object.values(argTypes)
    /** Convert alias names to the original names */
    .map((argType) => ({ ...argType, name: NAME_TRANSFORM_MAP[argType.name] ?? argType.name }))
    .filter(
      (argType) =>
        !(
          argType.table?.disable || // Skip argType, if the story ArgsType is disabled.
          argType.name.startsWith('_') || // Skip public methods or properties that start with `_`.
          argType.name === 'cckControl' // Skip theme addon control types
        )
    )
    .flatMap((argType) => toArgTypesWithThemeConfig(argType, themeComponentConfig));

  const argTypeGroup = reduceDeepMerge<StrictInputType, StoryDocPageComponentArgTypeGroup>(
    argTypeWithThemeProps,
    (argType) => {
      const category = transformArgTypeCategory(argType);
      const defaultValue =
        category === 'props' ? getValueWithoutCompodocIssue(argType.table?.defaultValue?.summary) : undefined;
      const type = getValueWithoutCompodocIssue(argType.table?.type?.summary);

      return {
        [category]: [
          {
            name: argType.name,
            description: argType.description,
            defaultValue,
            type,
          },
        ],
      } satisfies Partial<StoryDocPageComponentArgTypeGroup>;
    }
  );

  const additionalArgTypes = getThemeAdditionalArgTypes(themeComponentConfig);
  const ArgTypesWithThemeAdditional = deepMerge(argTypeGroup, additionalArgTypes);

  return ArgTypesWithThemeAdditional;
}

function getThemeAdditionalArgTypes(
  themeComponentConfig: ThemeComponentConfig | undefined
): Partial<StoryDocPageComponentArgTypeGroup> {
  if (!themeComponentConfig?.additional || Object.keys(themeComponentConfig.additional).length === 0) {
    return {};
  }

  const additionalArgTypes = recordReduceMerge(themeComponentConfig.additional, (componentPropConfig) => {
    return {
      props: [
        {
          name: `data-cck-${componentPropConfig.name}`,
          description: componentPropConfig.description,
          defaultValue: componentPropConfig.default.toString(),
          type: componentPropConfig.values.join(' | '),
        },
      ],
    } satisfies Partial<StoryDocPageComponentArgTypeGroup>;
  });

  return additionalArgTypes;
}

function isClassRef(ref: any): ref is ClassRef {
  return typeof ref === 'function' && !!ref.prototype && ref.prototype.constructor === ref;
}

function toArgTypesWithThemeConfig(
  argType: StrictInputType,
  themeComponentConfig: ThemeComponentConfig | undefined
): StrictInputType[] {
  const themePropsNameToOverride = ['type', 'color', 'size'];

  // Use original argType, if the argType must be taken from the component API and not change it to the themeConfig Types.
  if (argType.table?.['useComponentApi']) {
    return [argType];
  }

  // Use original argType, if the prop is not part of themeConfig.
  if (!themePropsNameToOverride.includes(argType.name)) {
    return [argType];
  }

  const themComponentPropConfig = themeComponentConfig?.[argType.name as UIBaseComponentsPropName];
  // Skip argType, if the prop has no themeConfig in selected Theme.
  if (!themComponentPropConfig) {
    return [];
  }

  return [
    deepMerge(argType, {
      description: themComponentPropConfig.description
        ? `${argType.description}\n${themComponentPropConfig.description}`
        : argType.description,
      table: {
        defaultValue: { summary: themComponentPropConfig.default.toString() },
        type: { summary: themComponentPropConfig.values.join(' | '), required: false },
      },
    }),
  ];
}

function transformArgTypeCategory(argType: StrictInputType): 'methods' | 'events' | 'props' {
  if (argType.table?.category === 'methods') {
    return 'methods';
  }

  if (argType.table?.category === 'outputs') {
    return 'events';
  }

  return 'props';
}

/**
 * Sometimes compodoc doc can not parse the correct values, that's why we have to fix it.
 */
function getValueWithoutCompodocIssue(value: string | unknown): string {
  if (typeof value !== 'string') {
    return value as string;
  }

  let _value = value.toString();

  // DefaultValue CheckboxComponent: public id: InputSignal<string> = input<string>(`cck-checkbox-${NEXT_ID++}`);
  if (_value.startsWith('input<')) {
    const match = _value.match(/\(([^)]+)\)/);
    if (match) {
      _value = match[1];
    }
  }

  // DefaultValue ChipComponent: disabled = input(undefined, { transform: toBooleanOrPresent });
  if (_value.startsWith('input(undefined, { transform:')) {
    _value = '';
  }

  // Type CheckboxComponent: public id: InputSignal<string> = input<string>(`cck-checkbox-${NEXT_ID++}`);
  if (_value.startsWith('InputSignal<') || _value.startsWith('ModelSignal<')) {
    const match = _value.match(/<([^)]+)>/);
    if (match) {
      _value = match[1];
    }
  }

  // Type SelectComponent: @Input() set value(value: T | T[])
  if (_value === 'T | []') {
    _value = 'T | T[]';
  }

  // Type SelectComponent: public placeholder: InputSignal<string> = input('');
  if (_value === `input('')`) {
    _value = '';
  }

  return _value;
}
