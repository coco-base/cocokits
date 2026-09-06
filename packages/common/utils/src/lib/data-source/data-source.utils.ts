/** @module data-source */

import { DeepNullable } from '../model/common.model';
import { DataSourceFilterBooleanCondition, DataSourceFilterBooleanMatchType, DataSourceFilterBooleanMatchTypeList, DataSourceFilterCondition, DataSourceFilterDateCondition, DataSourceFilterDateMatchType, DataSourceFilterDateMatchTypeList, DataSourceFilterMatchType, DataSourceFilterNumberCondition, DataSourceFilterNumberMatchType, DataSourceFilterNumberMatchTypeList, DataSourceFilterTextCondition, DataSourceFilterTextMatchType, DataSourceFilterTextMatchTypeList, DataSourceFilterType } from './data-source.model';

export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeString(str: string): string {
  return str
    .toString()
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function detectDataSourceFilterType(value: any): DataSourceFilterType {
  // Handle null, undefined, or empty string
  if (value == null || value === '') {
    return DataSourceFilterType.Text; // Default fallback
  }

  // Check for boolean
  if (typeof value === 'boolean') {
    return DataSourceFilterType.Boolean;
  }

  // Check for number
  if (typeof value === 'number' && !isNaN(value)) {
    return DataSourceFilterType.Number;
  }

  // Check for Date object
  if (value instanceof Date && !isNaN(value.getTime())) {
    return DataSourceFilterType.Date;
  }

  // Check if string represents different types
  if (typeof value === 'string') {
    const trimmed = value.trim();

    // Check if it's a boolean string first
    const lowerTrimmed = trimmed.toLowerCase();
    if (lowerTrimmed === 'true' || lowerTrimmed === 'false') {
      return DataSourceFilterType.Boolean;
    }

    // Check if it's a valid number string (but not a date-like string)
    if (trimmed !== '' && !isNaN(Number(trimmed))) {
      // Check if it could be a timestamp
      const numValue = Number(trimmed);
      const minTimestamp = new Date('1970-01-01').getTime();
      const maxTimestamp = new Date('2100-01-01').getTime();

      if (numValue >= minTimestamp && numValue <= maxTimestamp) {
        return DataSourceFilterType.Date;
      }

      return DataSourceFilterType.Number;
    }

    // Check if it's a valid date string
    if (trimmed !== '') {
      const dateValue = new Date(trimmed);
      if (!isNaN(dateValue.getTime())) {
        // Additional patterns that suggest it's a date
        const datePatterns = [
          /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
          /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
          /^\d{2}-\d{2}-\d{4}/, // MM-DD-YYYY
          /^\d{4}\/\d{2}\/\d{2}/, // YYYY/MM/DD
          /T\d{2}:\d{2}:\d{2}/, // ISO time part
          /\d{2}:\d{2}:\d{2}/, // Time format
          /^\w{3},?\s+\w{3}\s+\d{1,2}/, // Mon, Jan 01 or Mon Jan 01
        ];

        const isDateLike = datePatterns.some((pattern) => pattern.test(trimmed));
        if (isDateLike) {
          return DataSourceFilterType.Date;
        }
      }
    }
  }

  // Default to text for everything else
  return DataSourceFilterType.Text;
}

export function validateDataSourceItem<T>(condition: Partial<DataSourceFilterCondition<T>>, rawData: T[]): {
  field: string[] | null,
  type: string[] | null,
  matchType: string[] | null,
  filter: string[] | null,
} | null {
  const fieldErrors: string[] = [];
  const typeErrors: string[] = [];
  const matchTypeErrors: string[] = [];
  const filterErrors: string[] = [];

  // Check if condition has required basic properties
  if (!condition.field) {
    fieldErrors.push('Field is required');
  }
  if (!condition.type) {
    typeErrors.push('Type is required');
  }
  if (!condition.matchType) {
    matchTypeErrors.push('Match type is required');
  }

  // If basic properties are missing, we can still continue validation for other fields
  
  // Validate field exists in data
  if (condition.field) {
    const fieldNames = rawData.length > 0 ? Object.keys(rawData[0] as Record<string, unknown>) : [];
    if (!fieldNames.includes(String(condition.field))) {
      fieldErrors.push(`Field '${String(condition.field)}' does not exist in data`);
    }
  }

  // Get the match type lists for validation
  const textMatchTypes = DataSourceFilterTextMatchTypeList;
  const numberMatchTypes = DataSourceFilterNumberMatchTypeList;
  const dateMatchTypes = DataSourceFilterDateMatchTypeList;
  const booleanMatchTypes = DataSourceFilterBooleanMatchTypeList;

  // Validate match type is appropriate for the condition type
  if (condition.type && condition.matchType) {
    switch (condition.type) {
      case DataSourceFilterType.Text:
        if (!textMatchTypes.includes(condition.matchType as DataSourceFilterTextMatchType)) {
          matchTypeErrors.push(`Match type '${condition.matchType}' is not valid for text fields`);
        }
        // For text conditions, check if filter value is required and valid
        if (
          condition.matchType !== DataSourceFilterMatchType.Blank &&
          condition.matchType !== DataSourceFilterMatchType.NotBlank
        ) {
          const textCondition = condition as DataSourceFilterTextCondition<T>;
          if (textCondition.filter === undefined || textCondition.filter === null || textCondition.filter === '') {
            filterErrors.push('Filter value is required for this match type');
          }
        }
        break;

      case DataSourceFilterType.Number:
        if (!numberMatchTypes.includes(condition.matchType as DataSourceFilterNumberMatchType)) {
          matchTypeErrors.push(`Match type '${condition.matchType}' is not valid for number fields`);
        }
        // For number conditions, validate filter values
        if (
          condition.matchType !== DataSourceFilterMatchType.Blank &&
          condition.matchType !== DataSourceFilterMatchType.NotBlank
        ) {
          const numberCondition = condition as DataSourceFilterNumberCondition<T>;
          if (numberCondition.filter === undefined || numberCondition.filter === null) {
            filterErrors.push('Filter value is required for this match type');
          } else if (isNaN(numberCondition.filter)) {
            filterErrors.push('Filter value must be a valid number');
          }

          // For between operator, validate filter2
          if (condition.matchType === DataSourceFilterMatchType.Between) {
            if (numberCondition.filter2 === undefined || numberCondition.filter2 === null) {
              filterErrors.push('Second filter value is required for between operation');
            } else if (isNaN(numberCondition.filter2)) {
              filterErrors.push('Second filter value must be a valid number');
            } else if (
              numberCondition.filter !== undefined &&
              !isNaN(numberCondition.filter) &&
              numberCondition.filter > numberCondition.filter2
            ) {
              filterErrors.push('First filter number must be less than or equal to second filter number');
            }
          }
        }
        break;

      case DataSourceFilterType.Date:
        if (!dateMatchTypes.includes(condition.matchType as DataSourceFilterDateMatchType)) {
          matchTypeErrors.push(`Match type '${condition.matchType}' is not valid for date fields`);
        }
        // For date conditions, validate filter values
        if (
          condition.matchType !== DataSourceFilterMatchType.Blank &&
          condition.matchType !== DataSourceFilterMatchType.NotBlank
        ) {
          const dateCondition = condition as DataSourceFilterDateCondition<T>;
          if (!dateCondition.filter) {
            filterErrors.push('Filter value is required for this match type');
          } else if (!(dateCondition.filter instanceof Date)) {
            filterErrors.push('Filter value must be a Date object');
          } else if (isNaN(dateCondition.filter.getTime())) {
            filterErrors.push('Filter value must be a valid date');
          }

          // For between operator, validate filter2
          if (condition.matchType === DataSourceFilterMatchType.Between) {
            if (!dateCondition.filter2) {
              filterErrors.push('Second filter value is required for between operation');
            } else if (!(dateCondition.filter2 instanceof Date)) {
              filterErrors.push('Second filter value must be a Date object');
            } else if (isNaN(dateCondition.filter2.getTime())) {
              filterErrors.push('Second filter value must be a valid date');
            } else if (
              dateCondition.filter &&
              !isNaN(dateCondition.filter.getTime()) &&
              dateCondition.filter.getTime() > dateCondition.filter2.getTime()
            ) {
              filterErrors.push('First filter date must be before or equal to second filter date');
            }
          }
        }
        break;

      case DataSourceFilterType.Boolean:
        if (!booleanMatchTypes.includes(condition.matchType as DataSourceFilterBooleanMatchType)) {
          matchTypeErrors.push(`Match type '${condition.matchType}' is not valid for boolean fields`);
        }
        // Boolean conditions with True/False don't need filter values, but validate if provided
        if (
          condition.matchType === DataSourceFilterMatchType.True ||
          condition.matchType === DataSourceFilterMatchType.False
        ) {
          const booleanCondition = condition as DataSourceFilterBooleanCondition<T>;
          // Filter value is optional for boolean, but if provided should be boolean
          if (booleanCondition.filter !== undefined && typeof booleanCondition.filter !== 'boolean') {
            filterErrors.push('Filter value must be a boolean when provided');
          }
        }
        break;
    }
  }

  // Return the result in the new format
  const hasErrors = fieldErrors.length > 0 || typeErrors.length > 0 || matchTypeErrors.length > 0 || filterErrors.length > 0;
  
  if (!hasErrors) {
    return null;
  }

  return {
    field: fieldErrors.length > 0 ? fieldErrors : null,
    type: typeErrors.length > 0 ? typeErrors : null,
    matchType: matchTypeErrors.length > 0 ? matchTypeErrors : null,
    filter: filterErrors.length > 0 ? filterErrors : null,
  };
}
