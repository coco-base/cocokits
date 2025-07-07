import { InputType, StrictInputType } from '@storybook/types';

import { DeepPartial } from '@cocokits/common-utils';

interface NgArgType {
  name: string;
  category?: 'outputs' | 'input';
  type?: string;
  defaultValue?: string | number | boolean | null;
}
export function ngArgType({ name, category, type, defaultValue }: NgArgType): DeepPartial<StrictInputType> {
  const argType: InputType & { table: NonNullable<InputType['table']> } = { name, table: {} };

  if (category) {
    argType.table.category = category;
  }

  if (type !== undefined) {
    if (!argType.table.type) {
      argType.table.type = {};
    }
    argType.table.type.summary = type;
  }

  if (defaultValue !== undefined) {
    if (!argType.table.defaultValue) {
      argType.table.defaultValue = {};
    }
    argType.table.defaultValue.summary = `${defaultValue}`;
  }

  return { [name]: argType };
}
