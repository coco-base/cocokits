/** @module data-source */

import { hasNotValue, hasValue } from '../ensure/ensure-value';
import { normalizeString } from './data-source.utils';
import {
  DataSourceFilterConditionOrGroup,
  DataSourceFilterGroup,
  DataSourceFilterMatchType,
  DataSourceFilterOperator,
} from './data-source.model';

// Define possible input value types
type PrimitiveValue = string | number | boolean | Date | null | undefined;

// Define the matcher interface with specific types for each operation
type Matcher = {
  [K in DataSourceFilterMatchType]: {
    [DataSourceFilterMatchType.Contains]: (value: string, filter: string) => boolean;
    [DataSourceFilterMatchType.NotContains]: (value: string, filter: string) => boolean;
    [DataSourceFilterMatchType.Equals]: (value: PrimitiveValue, filter: string) => boolean;
    [DataSourceFilterMatchType.NotEqual]: (value: PrimitiveValue, filter: string) => boolean;
    [DataSourceFilterMatchType.StartsWith]: (value: string, filter: string) => boolean;
    [DataSourceFilterMatchType.EndsWith]: (value: string, filter: string) => boolean;
    [DataSourceFilterMatchType.GreaterThan]: (value: number, filter: number) => boolean;
    [DataSourceFilterMatchType.GreaterThanOrEqual]: (value: number, filter: number) => boolean;
    [DataSourceFilterMatchType.LessThan]: (value: number, filter: number) => boolean;
    [DataSourceFilterMatchType.LessThanOrEqual]: (value: number, filter: number) => boolean;
    [DataSourceFilterMatchType.Between]: (
      value: number | Date,
      minValue: number | Date,
      maxValue: number | Date
    ) => boolean;
    [DataSourceFilterMatchType.Before]: (value: Date, filter: Date) => boolean;
    [DataSourceFilterMatchType.After]: (value: Date, filter: Date) => boolean;
    [DataSourceFilterMatchType.True]: (value: boolean, filter: boolean) => boolean;
    [DataSourceFilterMatchType.False]: (value: boolean, filter: boolean) => boolean;

    // [DataSourceFilterMatchType.In]: (values: PrimitiveValue[], filter: string) => boolean;
    // [DataSourceFilterMatchType.NotIn]: (values: PrimitiveValue[], filter: string) => boolean;
    [DataSourceFilterMatchType.Blank]: (value: null | undefined) => boolean;
    [DataSourceFilterMatchType.NotBlank]: (value: null | undefined) => boolean;
  }[K];
};

const DEFAULT_FILTER_MATCHER: Matcher = {
  [DataSourceFilterMatchType.Contains]: (value: string, filter: string) =>
    hasNotValue(filter) ? true : normalizeString(value).includes(normalizeString(filter)),

  [DataSourceFilterMatchType.NotContains]: (value: string, filter: string) =>
    hasNotValue(filter) ? true : !normalizeString(value).includes(normalizeString(filter)),

  [DataSourceFilterMatchType.Equals]: (value: PrimitiveValue, filter: PrimitiveValue) =>
    hasNotValue(filter)
      ? true
      : value instanceof Date && filter instanceof Date
        ? value.getTime() === filter.getTime()
        : value === filter,

  [DataSourceFilterMatchType.NotEqual]: (value: PrimitiveValue, filter: PrimitiveValue) =>
    hasNotValue(filter)
      ? true
      : value instanceof Date && filter instanceof Date
        ? value.getTime() !== filter.getTime()
        : value !== filter,

  [DataSourceFilterMatchType.StartsWith]: (value: string, filter: string) =>
    hasNotValue(filter) ? true : normalizeString(value).startsWith(normalizeString(filter)),

  [DataSourceFilterMatchType.EndsWith]: (value: string, filter: string) =>
    hasNotValue(filter) ? true : normalizeString(value).endsWith(normalizeString(filter)),

  [DataSourceFilterMatchType.GreaterThan]: (value: number, filter: number) =>
    hasNotValue(filter) ? true : value > filter,

  [DataSourceFilterMatchType.GreaterThanOrEqual]: (value: number, filter: number) =>
    hasNotValue(filter) ? true : value >= filter,

  [DataSourceFilterMatchType.LessThan]: (value: number, filter: number) =>
    hasNotValue(filter) ? true : value < filter,

  [DataSourceFilterMatchType.LessThanOrEqual]: (value: number, filter: number) =>
    hasNotValue(filter) ? true : value <= filter,

  [DataSourceFilterMatchType.Between]: (value: number | Date, minValue: number | Date, maxValue: number | Date) =>
    hasNotValue(minValue) || hasNotValue(maxValue)
      ? true
      : value instanceof Date && minValue instanceof Date && maxValue instanceof Date
        ? minValue.getTime() <= value.getTime() && value.getTime() <= maxValue.getTime()
        : minValue <= value && value <= maxValue,

  [DataSourceFilterMatchType.Before]: (value: Date, filter: Date) =>
    hasNotValue(filter) ? true : value.getTime() < filter.getTime(),

  [DataSourceFilterMatchType.After]: (value: Date, filter: Date) =>
    hasNotValue(filter) ? true : value.getTime() > filter.getTime(),

  [DataSourceFilterMatchType.True]: (value: boolean, filter: boolean) => (hasNotValue(value) ? true : value === filter),

  [DataSourceFilterMatchType.False]: (value: boolean, filter: boolean) =>
    hasNotValue(value) ? true : value === filter,

  // [DataSourceFilterMatchType.In]: (value: PrimitiveValue[], filter: PrimitiveValue[]) =>
  //   hasNotValue(value) ? true : value.includes(filter),
  // [DataSourceFilterMatchType.NotIn]: (value: PrimitiveValue[], filter: PrimitiveValue[]) =>
  //   hasNotValue(value) ? true : !value.includes(filter),
  [DataSourceFilterMatchType.Blank]: (value: null | undefined) => hasNotValue(value),
  [DataSourceFilterMatchType.NotBlank]: (value: null | undefined) => hasValue(value),
};

export class DataSourceFilterMatcher<T = unknown> {
  private matchers: Matcher = DEFAULT_FILTER_MATCHER;

  public updateMatcher(matcher: Matcher) {
    this.matchers = { ...this.matchers, ...matcher };
  }

  public match(matchType: DataSourceFilterMatchType.Contains, value: string, filter: string): boolean;
  public match(matchType: DataSourceFilterMatchType.NotContains, value: string, filter: string): boolean;
  public match(matchType: DataSourceFilterMatchType.Equals, value: PrimitiveValue, filter: PrimitiveValue): boolean;
  public match(matchType: DataSourceFilterMatchType.NotEqual, value: PrimitiveValue, filter: PrimitiveValue): boolean;
  public match(matchType: DataSourceFilterMatchType.StartsWith, value: string, filter: string): boolean;
  public match(matchType: DataSourceFilterMatchType.EndsWith, value: string, filter: string): boolean;
  public match(matchType: DataSourceFilterMatchType.GreaterThan, value: number, filter: number): boolean;
  public match(matchType: DataSourceFilterMatchType.GreaterThanOrEqual, value: number, filter: number): boolean;
  public match(matchType: DataSourceFilterMatchType.LessThan, value: number, filter: number): boolean;
  public match(matchType: DataSourceFilterMatchType.LessThanOrEqual, value: number, filter: number): boolean;
  public match(
    matchType: DataSourceFilterMatchType.Between,
    value: number | Date,
    minValue: number | Date,
    maxValue: number | Date
  ): boolean;
  public match(matchType: DataSourceFilterMatchType.Before, value: Date, filter: Date): boolean;
  public match(matchType: DataSourceFilterMatchType.After, value: Date, filter: Date): boolean;
  public match(matchType: DataSourceFilterMatchType.True, value: boolean, filter: boolean): boolean;
  public match(matchType: DataSourceFilterMatchType.False, value: boolean, filter: boolean): boolean;
  // public filter(matchType: DataSourceFilterMatchType.In, values: PrimitiveValue[], filter: PrimitiveValue): boolean;
  // public filter(matchType: DataSourceFilterMatchType.NotIn, values: PrimitiveValue[], filter: PrimitiveValue): boolean;
  public match(matchType: DataSourceFilterMatchType.Blank, value: null | undefined): boolean;
  public match(matchType: DataSourceFilterMatchType.NotBlank, value: null | undefined): boolean;
  public match(matchType: DataSourceFilterMatchType, ...args: any[]): boolean;
  public match(matchType: DataSourceFilterMatchType, ...args: any[]) {
    const matcher = this.matchers[matchType] as (...a: any[]) => boolean;
    return matcher ? matcher(...args) : false;
  }

  public filter(data: T, filters: DataSourceFilterGroup<T>): boolean {
    if (filters.operator === DataSourceFilterOperator.AND) {
      return filters.conditions.every((condition) => this.filterByCondition(data, condition));
    }

    if (filters.operator === DataSourceFilterOperator.OR) {
      return filters.conditions.some((condition) => this.filterByCondition(data, condition));
    }

    throw new Error(`Unknown operator for filter: ${filters.operator}`);
  }

  public filterByCondition(data: T, condition: DataSourceFilterConditionOrGroup<T>): boolean {
    if ('operator' in condition) {
      return this.filter(data, condition);
    }
    const args =
      'filter2' in condition
        ? [data[condition.field], condition.filter, condition.filter2]
        : [data[condition.field], condition.filter];
    return this.match(condition.matchType, ...args);
  }
}
