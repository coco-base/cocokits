/* eslint-disable max-lines */
import { PreparedMeta, PreparedStory, StrictInputType } from '@storybook/types';

import { deepMerge, recordReduceDeepMerge, reduceDeepMerge } from '@cocokits/common-utils';
import { ThemeComponentConfig, ThemeConfig, UIBaseComponentsPropName } from '@cocokits/core';

import { StoryDocPageArgTypes, StoryDocPageComponentArgTypeGroup } from './story-doc-page-api.model';
import { AddonParameters, AddonThemeConfig, ComponentRef } from '../../model/addon.model';
import { isClassRef, isReactComponent } from '../../utils/common.utils';
import { getStoryComponentName } from '../../utils/get-story-parameters';

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

export function getArgTypesApiList(
  preparedMeta: PreparedMeta,
  themeConfig: ThemeConfig,
  framework: AddonThemeConfig['framework']
): StoryDocPageArgTypes[] {
  const mainComponent = preparedMeta.component as ComponentRef;
  const parameters = preparedMeta.parameters as AddonParameters;
  const mainComponentName = parameters.cckAddon.componentName;

  // Type of storybook is wrong, so we have to change it
  const subcomponents: ComponentRef[] =
    preparedMeta.subcomponents && Array.isArray(preparedMeta.subcomponents)
      ? ((preparedMeta.subcomponents as unknown as ComponentRef[]) ?? [])
      : Object.values((preparedMeta.subcomponents as Record<string, ComponentRef>) ?? {});
  const argTypeGroup = [] as StoryDocPageArgTypes[];

  argTypeGroup.push({
    componentName: getStoryComponentName(mainComponent, preparedMeta.id),
    deception: parameters.cckAddon.deception,
    argTypeGroup: getComponentArgTypes({
      componentRef: mainComponent,
      originalArgTypes: preparedMeta.argTypes,
      parameters: parameters,
      themeComponentConfig: themeConfig.components[mainComponentName],
      framework: framework,
    }),
  });

  subcomponents
    ?.filter((subcomponent) => {
      // displayName for react and name for Angular
      const name = subcomponent.displayName ?? subcomponent.name;
      return !name.startsWith('_');
    })
    .forEach((subcomponent) => {
      const name = subcomponent.displayName ?? subcomponent.name;
      const argTypes = deepMerge(
        parameters.docs.extractArgTypes?.(subcomponent) ?? {},
        parameters.cckAddon.subcomponents?.[name]?.argsTypes ?? {}
      );
      const subcomponentName = parameters.cckAddon.subcomponents?.[name]?.name;
      // Not all subcomponents are part of UIBaseComponents (e.g., MenuTriggerDirective).
      // If a component has the value 'null', we skip taking the config from the theme and only show the APIs from the component.
      if (subcomponentName === undefined) {
        throw new Error(`Subcomponent name is missing in the story parameters for story: ${name}`);
      }

      argTypeGroup.push({
        componentName: name,
        deception: parameters.cckAddon.subcomponents?.[name]?.description,
        argTypeGroup: getComponentArgTypes({
          componentRef: subcomponent,
          originalArgTypes: argTypes,
          parameters,
          themeComponentConfig: subcomponentName ? themeConfig.components[subcomponentName] : undefined,
          framework,
        }),
      });
    });

  return argTypeGroup;
}

export function getComponentArgTypes({
  componentRef,
  originalArgTypes,
  parameters,
  themeComponentConfig,
  framework,
}: {
  componentRef: unknown;
  originalArgTypes: PreparedStory['argTypes'];
  parameters: AddonParameters;
  themeComponentConfig: ThemeComponentConfig | undefined;
  framework: AddonThemeConfig['framework'];
}): StoryDocPageComponentArgTypeGroup | null {
  /**
   * Storybook source code check if the componentRef is a class reference.
   * I don't know if it's necessary to check it, but I will keep it for now.
   */
  const isValidComponentRef = isClassRef(componentRef) || isReactComponent(componentRef);

  if (!isValidComponentRef) {
    return null;
  }
  const componentName = getStoryComponentName(componentRef);
  const uiBaseComponentName = parameters.cckAddon.componentName;
  const overrideArgsType = parameters.cckAddon.subcomponents?.[componentName]?.argsTypes ?? {};

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
          argType.name.startsWith('_') // Skip public methods or properties that start with `_`.
        )
    )
    .flatMap((argType) => toArgTypesWithThemeConfig(argType, themeComponentConfig));

  const argTypeGroup = reduceDeepMerge<StrictInputType, StoryDocPageComponentArgTypeGroup>(
    argTypeWithThemeProps,
    (argType) => {
      const category = transformArgTypeCategory(argType);
      const defaultValue =
        category === 'props' ? serializeDefaultValue(argType.table?.defaultValue?.summary) : undefined;
      const type = getValueWithoutCompodocIssue(
        argType.table?.type?.summary === 'union' ? argType.type?.raw : argType.table?.type?.summary
      );

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

  const additionalArgTypes = getThemeAdditionalArgTypes(themeComponentConfig, framework);
  const ArgTypesWithThemeAdditional = deepMerge(argTypeGroup, additionalArgTypes);

  return ArgTypesWithThemeAdditional;
}

function getThemeAdditionalArgTypes(
  themeComponentConfig: ThemeComponentConfig | undefined,
  framework: AddonThemeConfig['framework']
): Partial<StoryDocPageComponentArgTypeGroup> {
  if (!themeComponentConfig?.additional || Object.keys(themeComponentConfig.additional).length === 0) {
    return {};
  }

  // React
  if (framework === 'react') {
    const { description, type, defaultValue } = Object.values(themeComponentConfig.additional).reduce(
      (result, componentPropConfig) => {
        return {
          description: result.description + `- **${componentPropConfig.name}**: ${componentPropConfig.description}\n`,
          type: result.type + `  ${componentPropConfig.name}: ${componentPropConfig.values.join(' | ')};\n`,
          defaultValue:
            result.defaultValue + `- ${componentPropConfig.name}: ${componentPropConfig.default.toString()}\n`,
        };
      },
      { description: '', type: '', defaultValue: '' }
    );

    const additionalArgTypes = {
      props: [
        {
          name: `additional`,
          description: description,
          defaultValue: defaultValue,
          type: `{\n${type}}`,
        },
      ],
    } satisfies Partial<StoryDocPageComponentArgTypeGroup>;

    return additionalArgTypes;
  }

  // Angular
  const additionalArgTypes = recordReduceDeepMerge(themeComponentConfig.additional, (componentPropConfig) => {
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

function toArgTypesWithThemeConfig(
  argType: StrictInputType,
  themeComponentConfig: ThemeComponentConfig | undefined
): StrictInputType[] {
  const themePropsNameToOverride = ['type', 'color', 'size', 'additional'];

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

  // React only
  if (argType.name === 'additional') {
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

  if (argType.table?.category === 'outputs' || argType.name.match(/^on[A-Z]/)) {
    return 'events';
  }

  return 'props';
}

function serializeDefaultValue(value: string | undefined): string {
  if (!value) {
    return '';
  }
  // React wrap the default value with quotes, so we have to remove them.
  const valueWithoutQuotes =
    (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))
      ? value.slice(1, -1)
      : value;

  const valueWithoutCompodocIssue = getValueWithoutCompodocIssue(valueWithoutQuotes);
  return valueWithoutCompodocIssue;
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

/**
 * Parses a TypeScript type definition string into an array of individual types.
 * This handles complex nested structures including functions, generics, and union types.
 * Removes unnecessary outer parentheses from type definitions.
 *
 * @param {string} typeStrRaw - The TypeScript type definition string (e.g. "string | number | boolean")
 * @returns {string[]} An array of individual types (e.g. ["string", "number", "boolean"])
 *
 * @example
 * // Returns ["string", "number"]
 * parseTypeDefinition("string | number")
 *
 * @example
 * // Returns ["string", "number"]  - removes unnecessary parentheses
 * parseTypeDefinition("(string | number)")
 *
 * @example
 * // Returns ["TValue", "TValue[]"]
 * parseTypeDefinition("TValue | TValue[]")
 *
 * @example
 * // Function types are preserved
 * // Returns ["(value: TValue | TValue[] | null) => void"]
 * parseTypeDefinition("(value: TValue | TValue[] | null) => void")
 */
export function parseTypeDefinition(typeStrRaw: string): string[] {
  // Trim and remove leading pipe if present
  let typeStr = typeStrRaw.trim();
  if (typeStr.startsWith('|')) {
    typeStr = typeStr.substring(1).trim();
  }

  // Prepare result array and tracking variables
  const result = [];
  let current = ''; // Builds the current type token
  let depth = 0; // Tracks nesting level of brackets/braces/parentheses

  // Process each character individually to properly handle nested structures
  for (let i = 0; i < typeStr.length; i++) {
    const char = typeStr[i];

    // Detect opening brackets/braces/parentheses to track nesting depth
    if ('({[<'.includes(char)) {
      depth++; // Increase nesting level
      current += char;
    }
    // Detect closing brackets/braces/parentheses to decrease nesting depth
    else if (')}]>'.includes(char)) {
      depth--; // Decrease nesting level
      current += char;
    }
    // Split on pipe character only when at the root level (depth=0)
    else if (char === '|' && depth === 0) {
      // Only add non-empty types to the result array
      if (current.trim()) {
        result.push(removeUnnecessaryParentheses(current.trim()));
      }
      current = ''; // Reset current token builder
    }
    // For all other characters, keep building the current token
    else {
      current += char;
    }
  }

  // Add the last type token after the loop completes
  if (current.trim()) {
    result.push(removeUnnecessaryParentheses(current.trim()));
  }

  return result.map((type) => (type.startsWith("'") && type.endsWith("'") ? type.slice(1, -1) : type));
}

/**
 * Removes unnecessary parentheses wrapping a type.
 * Only removes parentheses if they're surrounding the entire type and aren't part of a function type.
 */
function removeUnnecessaryParentheses(typeStrRaw: string): string {
  const type = typeStrRaw.trim();
  // While the type starts with '(' and ends with ')', check if we can remove them
  return type.startsWith('(') && type.endsWith(')') ? type.slice(1, -1) : type;
}
