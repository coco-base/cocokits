/* eslint-disable */
import { Injectable } from '@angular/core';
import {
  FilterCondition,
  FilterType,
  FilterOperator,
  TextFilterOperator,
  NumberFilterOperator,
  DateFilterOperator,
  BooleanFilterOperator,
  SetFilterOperator,
  FilterMatcher,
  GlobalFilterMatcher,
  ColumnFilterGroup,
} from './filter.types';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  /**
   * Default filter matcher that handles all standard filter operations
   */
  public readonly defaultFilterMatcher: FilterMatcher<any> = (item, condition) => {
    const { field, operator, value, value2, type } = condition;
    const itemValue = item[field];

    // Handle blank/notBlank for all types
    if (operator === 'blank') {
      return this.isBlankValue(itemValue);
    }
    if (operator === 'notBlank') {
      return !this.isBlankValue(itemValue);
    }

    // If item value is blank and we're not checking for blank, return false
    if (this.isBlankValue(itemValue)) {
      return false;
    }

    switch (type) {
      case FilterType.Text:
        return this.matchTextFilter(itemValue, value, operator as TextFilterOperator);
      case FilterType.Number:
        return this.matchNumberFilter(itemValue, value, value2, operator as NumberFilterOperator);
      case FilterType.Date:
        return this.matchDateFilter(itemValue, value, value2, operator as DateFilterOperator);
      case FilterType.Boolean:
        return this.matchBooleanFilter(itemValue, operator as BooleanFilterOperator);
      case FilterType.Set:
        return this.matchSetFilter(itemValue, value, operator as SetFilterOperator);
      default:
        return true;
    }
  };

  /**
   * Default global filter matcher
   */
  public readonly defaultGlobalFilterMatcher: GlobalFilterMatcher<any> = (item, searchTerm, fields) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return true;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

    return fields.some((field) => {
      const value = item[field];
      if (this.isBlankValue(value)) {
        return false;
      }

      const stringValue = String(value).toLowerCase();
      return stringValue.includes(normalizedSearchTerm);
    });
  };

  /**
   * Apply a single filter condition to an item
   */
  public applyCondition<T>(item: T, condition: FilterCondition<T>, customMatcher?: FilterMatcher<T>): boolean {
    const matcher = customMatcher || (this.defaultFilterMatcher as FilterMatcher<T>);
    return matcher(item, condition);
  }

  /**
   * Apply multiple filter conditions within a column group with logical operator
   */
  public applyColumnGroup<T>(
    item: T,
    columnGroup: ColumnFilterGroup<T>,
    customMatchers?: Map<keyof T, FilterMatcher<T>>
  ): boolean {
    if (columnGroup.conditions.length === 0) {
      return true;
    }

    const customMatcher = customMatchers?.get(columnGroup.field);

    if (columnGroup.operator === 'AND') {
      return columnGroup.conditions.every((condition: FilterCondition<T>) =>
        this.applyCondition(item, condition, customMatcher)
      );
    } else {
      return columnGroup.conditions.some((condition: FilterCondition<T>) =>
        this.applyCondition(item, condition, customMatcher)
      );
    }
  }

  /**
   * Apply multiple column groups (always combined with AND)
   */
  public applyColumnGroups<T>(
    item: T,
    columnGroups: ColumnFilterGroup<T>[],
    customMatchers?: Map<keyof T, FilterMatcher<T>>
  ): boolean {
    if (columnGroups.length === 0) {
      return true;
    }

    // All column groups must pass (AND logic between columns)
    return columnGroups.every((group) => this.applyColumnGroup(item, group, customMatchers));
  }

  /**
   * Apply global filter
   */
  public applyGlobalFilter<T>(
    item: T,
    searchTerm: string,
    fields: (keyof T)[],
    customMatcher?: GlobalFilterMatcher<T>
  ): boolean {
    const matcher = customMatcher || this.defaultGlobalFilterMatcher;
    return matcher(item, searchTerm, fields);
  }

  /**
   * Check if a value is considered blank (null, undefined, empty string)
   */
  private isBlankValue(value: any): boolean {
    return value === null || value === undefined || value === '';
  }

  /**
   * Text filter matching logic
   */
  private matchTextFilter(itemValue: any, filterValue: string, operator: TextFilterOperator): boolean {
    if (typeof itemValue !== 'string') {
      itemValue = String(itemValue);
    }

    const itemStr = itemValue.toLowerCase();
    const filterStr = filterValue.toLowerCase();

    switch (operator) {
      case 'contains':
        return itemStr.includes(filterStr);
      case 'notContains':
        return !itemStr.includes(filterStr);
      case 'equals':
        return itemStr === filterStr;
      case 'notEqual':
        return itemStr !== filterStr;
      case 'startsWith':
        return itemStr.startsWith(filterStr);
      case 'endsWith':
        return itemStr.endsWith(filterStr);
      default:
        return true;
    }
  }

  /**
   * Number filter matching logic
   */
  private matchNumberFilter(
    itemValue: any,
    filterValue: number,
    filterValue2: number | undefined,
    operator: NumberFilterOperator
  ): boolean {
    const numValue = typeof itemValue !== 'number' ? parseFloat(itemValue) : itemValue;
    const filterValueNumber = typeof filterValue !== 'number' ? parseFloat(filterValue) : filterValue;
    const filterValue2Number =
      typeof filterValue2 !== 'number' && filterValue2 !== undefined ? parseFloat(filterValue2) : filterValue2;

    console.log('-->', numValue, typeof filterValue, filterValue2);

    if (isNaN(numValue)) {
      return false;
    }

    switch (operator) {
      case 'equals':
        return numValue === filterValueNumber;
      case 'notEqual':
        return numValue !== filterValueNumber;
      case 'greaterThan':
        return numValue > filterValueNumber;
      case 'greaterThanOrEqual':
        return numValue >= filterValueNumber;
      case 'lessThan':
        return numValue < filterValueNumber;
      case 'lessThanOrEqual':
        return numValue <= filterValueNumber;
      case 'between':
        if (filterValue2Number === undefined) return false;
        const min = Math.min(filterValueNumber, filterValue2Number);
        const max = Math.max(filterValueNumber, filterValue2Number);
        return numValue >= min && numValue <= max;
      default:
        return true;
    }
  }

  /**
   * Date filter matching logic
   */
  private matchDateFilter(
    itemValue: any,
    filterValue: Date | string | number,
    filterValue2: Date | string | number | undefined,
    operator: DateFilterOperator
  ): boolean {
    let itemDate: Date;

    if (itemValue instanceof Date) {
      itemDate = itemValue;
    } else {
      itemDate = new Date(itemValue);
    }

    if (isNaN(itemDate.getTime())) {
      return false;
    }

    // Normalize dates to compare only date parts (ignore time)
    const normalizeDate = (date: Date | string | number) => {
      const d = new Date(date);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    const normalizedItemDate = normalizeDate(itemDate);
    const normalizedFilterDate = normalizeDate(filterValue);

    switch (operator) {
      case 'equals':
        return normalizedItemDate.getTime() === normalizedFilterDate.getTime();
      case 'notEqual':
        return normalizedItemDate.getTime() !== normalizedFilterDate.getTime();
      case 'before':
        return normalizedItemDate.getTime() < normalizedFilterDate.getTime();
      case 'after':
        return normalizedItemDate.getTime() > normalizedFilterDate.getTime();
      case 'between':
        if (!filterValue2) return false;
        const normalizedFilterDate2 = normalizeDate(filterValue2);
        const minDate =
          normalizedFilterDate.getTime() <= normalizedFilterDate2.getTime()
            ? normalizedFilterDate
            : normalizedFilterDate2;
        const maxDate =
          normalizedFilterDate.getTime() > normalizedFilterDate2.getTime()
            ? normalizedFilterDate
            : normalizedFilterDate2;
        return normalizedItemDate.getTime() >= minDate.getTime() && normalizedItemDate.getTime() <= maxDate.getTime();
      default:
        return true;
    }
  }

  /**
   * Boolean filter matching logic
   */
  private matchBooleanFilter(itemValue: any, operator: BooleanFilterOperator): boolean {
    const boolValue = Boolean(itemValue);

    switch (operator) {
      case 'true':
        return boolValue === true;
      case 'false':
        return boolValue === false;
      default:
        return true;
    }
  }

  /**
   * Set filter matching logic
   */
  private matchSetFilter(itemValue: any, filterValues: any[], operator: SetFilterOperator): boolean {
    if (!Array.isArray(filterValues) || filterValues.length === 0) {
      return true;
    }

    const isIncluded = filterValues.includes(itemValue);

    switch (operator) {
      case 'in':
        return isIncluded;
      case 'notIn':
        return !isIncluded;
      default:
        return true;
    }
  }

  /**
   * Get available operators for a filter type
   */
  public getOperatorsForType(type: FilterType): FilterOperator[] {
    switch (type) {
      case FilterType.Text:
        return ['contains', 'notContains', 'equals', 'notEqual', 'startsWith', 'endsWith', 'blank', 'notBlank'];
      case FilterType.Number:
        return [
          'equals',
          'notEqual',
          'greaterThan',
          'greaterThanOrEqual',
          'lessThan',
          'lessThanOrEqual',
          'between',
          'blank',
          'notBlank',
        ];
      case FilterType.Date:
        return ['equals', 'notEqual', 'before', 'after', 'between', 'blank', 'notBlank'];
      case FilterType.Boolean:
        return ['true', 'false', 'blank'];
      case FilterType.Set:
        return ['in', 'notIn'];
      default:
        return [];
    }
  }

  /**
   * Get default operator for a filter type
   */
  public getDefaultOperator(type: FilterType): FilterOperator {
    switch (type) {
      case FilterType.Text:
        return 'contains';
      case FilterType.Number:
        return 'equals';
      case FilterType.Date:
        return 'equals';
      case FilterType.Boolean:
        return 'true';
      case FilterType.Set:
        return 'in';
      default:
        return 'equals';
    }
  }
}
