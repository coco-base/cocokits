/* eslint-disable */
// Filter operator types for different data types
export type TextFilterOperator =
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'notEqual'
  | 'startsWith'
  | 'endsWith'
  | 'blank'
  | 'notBlank';

export type NumberFilterOperator =
  | 'equals'
  | 'notEqual'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'between'
  | 'blank'
  | 'notBlank';

export type DateFilterOperator = 'equals' | 'notEqual' | 'before' | 'after' | 'between' | 'blank' | 'notBlank';

export type BooleanFilterOperator = 'true' | 'false' | 'blank';

export type SetFilterOperator = 'in' | 'notIn';

export type FilterOperator =
  | TextFilterOperator
  | NumberFilterOperator
  | DateFilterOperator
  | BooleanFilterOperator
  | SetFilterOperator; // TODO: Remove it

// Filter data types
export enum FilterType {
  Text = 'text',
  Number = 'number',
  Date = 'date',
  Boolean = 'boolean',
  Set = 'set',
}

// Logical operators for combining conditions
export type LogicalOperator = 'AND' | 'OR';

// Filter condition interface
export interface FilterCondition<T = any> {
  field: keyof T;
  operator: FilterOperator;
  value: any;
  value2?: any; // For 'between' operators
  type: FilterType;
}

// Column filter group - multiple conditions for the same column
export interface ColumnFilterGroup<T = any> {
  field: keyof T;
  conditions: FilterCondition<T>[];
  operator: LogicalOperator; // AND/OR for conditions within this column
}

// Filter model for complex filtering
export interface FilterModel<T = any> {
  columnGroups: ColumnFilterGroup<T>[]; // Groups of conditions per column
  globalFilter?: string;
  globalFilterFields?: (keyof T)[];
}

// Column filter configuration
export interface ColumnFilterConfig<T = any> {
  field: keyof T;
  type: FilterType;
  operators?: FilterOperator[];
  defaultOperator?: FilterOperator;
  customMatcher?: (value: any, filterValue: any, operator: FilterOperator) => boolean;
  caseSensitive?: boolean;
  debounceMs?: number;
  placeholder?: string;
  allowedValues?: any[]; // For set filters
}

// Simple filter configuration for single conditions
export type SimpleFilterConfig<T = any> = {
  [K in keyof T]?: {
    operator: FilterOperator;
    value: any;
    value2?: any;
  };
};

// Filter matcher function type
export type FilterMatcher<T = any> = (item: T, condition: FilterCondition<T>) => boolean;

// Global filter matcher function type
export type GlobalFilterMatcher<T = any> = (item: T, searchTerm: string, fields: (keyof T)[]) => boolean;

// =============================================================================
// PAGINATION TYPES
// =============================================================================

/**
 * Pagination model interface
 */
export interface PaginationModel {
  /** Current page index (0-based) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items (after filtering) */
  totalItems: number;
  /** Total number of pages (calculated) */
  totalPages: number;
}

/**
 * Pagination information for display purposes
 */
export interface PaginationInfo {
  /** Current page (1-based for display) */
  currentPage: number;
  /** Items per page */
  pageSize: number;
  /** Total items count */
  totalItems: number;
  /** Total pages count */
  totalPages: number;
  /** Start index of current page items (1-based) */
  startIndex: number;
  /** End index of current page items (1-based) */
  endIndex: number;
  /** Whether there's a previous page */
  hasPrevious: boolean;
  /** Whether there's a next page */
  hasNext: boolean;
}

/**
 * Default page size options
 */
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

/**
 * Default page size
 */
export const DEFAULT_PAGE_SIZE = 25;

// =============================================================================
// SORTING TYPES
// =============================================================================

/**
 * Sort direction enum
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration for a single column
 */
export interface SortConfig<T = any> {
  /** Field to sort by */
  field: keyof T;
  /** Sort direction */
  direction: SortDirection;
  /** Sort priority for multi-column sorting (lower number = higher priority) */
  priority?: number;
}

/**
 * Sort model interface for managing multiple sort configurations
 */
export interface SortModel<T = any> {
  /** Array of sort configurations ordered by priority */
  sorts: SortConfig<T>[];
}

/**
 * Sort state information for display purposes
 */
export interface SortInfo<T = any> {
  /** Current sort configurations */
  sorts: SortConfig<T>[];
  /** Whether multi-column sorting is enabled */
  isMultiSort: boolean;
  /** Primary sort field (first in the list) */
  primarySort?: SortConfig<T>;
}

/**
 * Custom sort comparator function type
 */
export type SortComparator<T = any> = (a: T, b: T, field: keyof T, direction: SortDirection) => number;

/**
 * Sort configuration for a specific column
 */
export interface ColumnSortConfig<T = any> {
  /** Field name */
  field: keyof T;
  /** Custom comparator function */
  comparator?: SortComparator<T>;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Default sort direction when first clicked */
  defaultDirection?: SortDirection;
}
