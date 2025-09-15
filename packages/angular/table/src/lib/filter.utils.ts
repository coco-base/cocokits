/* eslint-disable */
import { FilterType, FilterOperator } from './filter.types';

/**
 * Utility functions for working with filters
 */
export class FilterUtils {
  /**
   * Auto-detect filter type based on value
   */
  static detectFilterType(value: any): FilterType {
    if (typeof value === 'string') {
      return FilterType.Text;
    }
    if (typeof value === 'number') {
      return FilterType.Number;
    }
    if (typeof value === 'boolean') {
      return FilterType.Boolean;
    }
    if (value instanceof Date) {
      return FilterType.Date;
    }
    if (Array.isArray(value)) {
      return FilterType.Set;
    }

    // Try to parse as date
    if (typeof value === 'string' && !isNaN(Date.parse(value))) {
      return FilterType.Date;
    }

    // Try to parse as number
    if (typeof value === 'string' && !isNaN(Number(value))) {
      return FilterType.Number;
    }

    // Default to text
    return FilterType.Text;
  }

  /**
   * Get user-friendly operator names
   */
  static getOperatorDisplayName(operator: FilterOperator): string {
    const displayNames: Record<FilterOperator, string> = {
      // Text operators
      contains: 'Contains',
      notContains: 'Does not contain',
      equals: 'Equals',
      notEqual: 'Does not equal',
      startsWith: 'Starts with',
      endsWith: 'Ends with',

      // Number operators
      greaterThan: 'Greater than',
      greaterThanOrEqual: 'Greater than or equal',
      lessThan: 'Less than',
      lessThanOrEqual: 'Less than or equal',
      between: 'Between',

      // Date operators
      before: 'Before',
      after: 'After',

      // Boolean operators
      true: 'True',
      false: 'False',

      // Set operators
      in: 'In',
      notIn: 'Not in',

      // Common operators
      blank: 'Is blank',
      notBlank: 'Is not blank',
    };

    return displayNames[operator] || operator;
  }

  /**
   * Validate filter value based on type and operator
   */
  static validateFilterValue(
    value: any,
    type: FilterType,
    operator: FilterOperator
  ): { isValid: boolean; error?: string } {
    // Blank operators don't need values
    if (operator === 'blank' || operator === 'notBlank') {
      return { isValid: true };
    }

    // Check if value is provided
    if (value === null || value === undefined || value === '') {
      return { isValid: false, error: 'Value is required' };
    }

    switch (type) {
      case FilterType.Number:
        if (isNaN(Number(value))) {
          return { isValid: false, error: 'Must be a valid number' };
        }
        break;

      case FilterType.Date:
        if (!(value instanceof Date) && isNaN(Date.parse(value))) {
          return { isValid: false, error: 'Must be a valid date' };
        }
        break;

      case FilterType.Set:
        if (!Array.isArray(value) || value.length === 0) {
          return { isValid: false, error: 'Must select at least one option' };
        }
        break;
    }

    return { isValid: true };
  }

  /**
   * Create a human-readable description of a filter condition
   */
  static describeFilterCondition<T>(field: keyof T, operator: FilterOperator, value: any, value2?: any): string {
    const fieldName = String(field);
    const operatorName = this.getOperatorDisplayName(operator);

    if (operator === 'blank' || operator === 'notBlank') {
      return `${fieldName} ${operatorName}`;
    }

    if (operator === 'between' && value2 !== undefined) {
      return `${fieldName} ${operatorName} ${value} and ${value2}`;
    }

    if (operator === 'in' || operator === 'notIn') {
      const values = Array.isArray(value) ? value.join(', ') : value;
      return `${fieldName} ${operatorName} [${values}]`;
    }

    return `${fieldName} ${operatorName} "${value}"`;
  }

  /**
   * Convert a filter model to a human-readable description
   */
  static describeFilterModel<T>(filterModel: {
    globalFilter?: string;
    conditions?: Array<{
      field: keyof T;
      operator: FilterOperator;
      value: any;
      value2?: any;
    }>;
    operator?: 'AND' | 'OR';
  }): string {
    const descriptions: string[] = [];

    // Add global filter description
    if (filterModel.globalFilter?.trim()) {
      descriptions.push(`Global search: "${filterModel.globalFilter}"`);
    }

    // Add condition descriptions
    if (filterModel.conditions && filterModel.conditions.length > 0) {
      const conditionDescs = filterModel.conditions.map((condition) =>
        this.describeFilterCondition(condition.field, condition.operator, condition.value, condition.value2)
      );

      if (conditionDescs.length > 1) {
        const operator = filterModel.operator === 'OR' ? ' OR ' : ' AND ';
        descriptions.push(`(${conditionDescs.join(operator)})`);
      } else {
        descriptions.push(conditionDescs[0]);
      }
    }

    return descriptions.join(' AND ') || 'No filters applied';
  }

  /**
   * Generate filter options for a column based on unique values
   */
  static generateFilterOptions<T>(data: T[], field: keyof T, maxOptions: number = 100): any[] {
    const uniqueValues = new Set();

    data.forEach((item) => {
      const value = item[field];
      if (value !== null && value !== undefined && value !== '') {
        uniqueValues.add(value);
      }
    });

    const options = Array.from(uniqueValues).slice(0, maxOptions);

    // Sort options based on type
    return options.sort((a, b) => {
      if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b);
      }
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }
      return String(a).localeCompare(String(b));
    });
  }
}
