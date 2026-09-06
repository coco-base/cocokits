/** @module data-source */

// ---------------- Table ----------------
export interface DataSourceChange<T> {
  conditionGroup: DataSourceFilterGroup<T>;
  sortFields: SortConfig<T>[];
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
  };
  data: T[];
}

// ---------------- Pagination ----------------

// ---------------- Filter ----------------
export enum DataSourceFilterOperator {
  AND = 'AND',
  OR = 'OR',
}

export enum DataSourceFilterType {
  Text = 'text',
  Number = 'number',
  Date = 'date',
  Boolean = 'boolean',
  // Set = 'set',
}

export enum DataSourceFilterMatchType {
  Contains = 'contains', // Text
  NotContains = 'notContains', // Text
  Equals = 'equals', // Text | Number | Date | Boolean
  NotEqual = 'notEqual', // Text | Number | Date | Boolean
  StartsWith = 'startsWith', // Text
  EndsWith = 'endsWith', // Text
  GreaterThan = 'greaterThan', // Number
  GreaterThanOrEqual = 'greaterThanOrEqual', // Number
  LessThan = 'lessThan', // Number
  LessThanOrEqual = 'lessThanOrEqual', // Number
  Between = 'between', // Number | Date
  Before = 'before', // Date
  After = 'after', // Date
  True = 'true', // Boolean
  False = 'false', // Boolean
  // In = 'in', // Set
  // NotIn = 'notIn', // Set
  Blank = 'blank', // Text | Number | Date | Boolean | Set
  NotBlank = 'notBlank', // Text | Number | Date | Boolean | Set
}

export const DataSourceFilterTextMatchTypeList = [
  DataSourceFilterMatchType.Contains,
  DataSourceFilterMatchType.NotContains,
  DataSourceFilterMatchType.Equals,
  DataSourceFilterMatchType.NotEqual,
  DataSourceFilterMatchType.StartsWith,
  DataSourceFilterMatchType.EndsWith,
  DataSourceFilterMatchType.Blank,
  DataSourceFilterMatchType.NotBlank,
] as const;

export const DataSourceFilterNumberMatchTypeList = [
  DataSourceFilterMatchType.Equals,
  DataSourceFilterMatchType.NotEqual,
  DataSourceFilterMatchType.GreaterThan,
  DataSourceFilterMatchType.GreaterThanOrEqual,
  DataSourceFilterMatchType.LessThan,
  DataSourceFilterMatchType.LessThanOrEqual,
  DataSourceFilterMatchType.Between,
  DataSourceFilterMatchType.Blank,
  DataSourceFilterMatchType.NotBlank,
] as const;

export const DataSourceFilterDateMatchTypeList = [
  DataSourceFilterMatchType.Equals,
  DataSourceFilterMatchType.NotEqual,
  DataSourceFilterMatchType.Before,
  DataSourceFilterMatchType.After,
  DataSourceFilterMatchType.Between,
  DataSourceFilterMatchType.Blank,
  DataSourceFilterMatchType.NotBlank,
] as const;

export const DataSourceFilterBooleanMatchTypeList = [
  DataSourceFilterMatchType.True,
  DataSourceFilterMatchType.False,
  DataSourceFilterMatchType.Blank,
  DataSourceFilterMatchType.NotBlank,
] as const;

// const DataSourceFilterSetMatchTypeList = [
//   DataSourceFilterMatchType.In,
//   DataSourceFilterMatchType.NotIn,
//   DataSourceFilterMatchType.Blank,
//   DataSourceFilterMatchType.NotBlank,
// ] as const;

export type DataSourceFilterTextMatchType = (typeof DataSourceFilterTextMatchTypeList)[number];
export type DataSourceFilterNumberMatchType = (typeof DataSourceFilterNumberMatchTypeList)[number];
export type DataSourceFilterDateMatchType = (typeof DataSourceFilterDateMatchTypeList)[number];
export type DataSourceFilterBooleanMatchType = (typeof DataSourceFilterBooleanMatchTypeList)[number];
// export type DataSourceFilterSetMatchType = (typeof DataSourceFilterSetMatchTypeList)[number];

export interface DataSourceFilterTextCondition<T> {
  field: keyof T;
  type: DataSourceFilterType.Text;
  matchType: DataSourceFilterTextMatchType;
  filter?: string; // For all except 'blank' and 'notBlank'
}

export interface DataSourceFilterNumberCondition<T> {
  field: keyof T;
  type: DataSourceFilterType.Number;
  matchType: DataSourceFilterNumberMatchType;
  filter?: number; // For all except 'blank' and 'notBlank'
  filter2?: number; // For 'between' operator
}

export interface DataSourceFilterDateCondition<T> {
  field: keyof T;
  type: DataSourceFilterType.Date;
  matchType: DataSourceFilterDateMatchType;
  filter?: Date; // For all except 'blank' and 'notBlank'
  filter2?: Date; // For 'between' operator
}

export interface DataSourceFilterBooleanCondition<T> {
  field: keyof T;
  type: DataSourceFilterType.Boolean;
  matchType: DataSourceFilterBooleanMatchType;
  filter?: boolean; // For all except 'blank' and 'notBlank'
}

// export type DataSourceFilterSetCondition<T> = {
//   [K in keyof T]: {
//     field: K;
//     type: DataSourceFilterType.Set;
//     matchType: DataSourceFilterSetMatchType;
//     value?: T[K] extends (infer U)[] ? U : T[K];
//   };
// }[keyof T];

export type DataSourceFilterConditionOrGroup<T> = DataSourceFilterCondition<T> | DataSourceFilterGroup<T>;

export type DataSourceFilterCondition<T> =
  | DataSourceFilterTextCondition<T>
  | DataSourceFilterNumberCondition<T>
  | DataSourceFilterDateCondition<T>
  | DataSourceFilterBooleanCondition<T>;
// | DataSourceFilterSetCondition<T>

export interface DataSourceFilterGroup<T> {
  operator: DataSourceFilterOperator; // AND/OR between conditions
  conditions: DataSourceFilterConditionOrGroup<T>[];
}

export type DataSourceFilterConditionOrGroupStore<T> =
  | DataSourceFilterConditionStore<T>
  | DataSourceFilterGroupStore<T>;

export type DataSourceFilterGroupStore<T> = Omit<Partial<DataSourceFilterGroup<T>>, 'conditions'> & {
  id: string;
  conditions: DataSourceFilterConditionOrGroupStore<T>[];
};

export type DataSourceFilterConditionStore<T> = Partial<DataSourceFilterCondition<T>> & {
  id: string;
  isValid: boolean;
  errors: {
    field: string[] | null;
    type: string[] | null;
    matchType: string[] | null;
    filter: string[] | null;
  };
  canShowErrors: {
    field: false,
    type: false,
    matchType: false,
    filter: false,
  }
};

// ---------------- Sort ----------------
export type SortDirection = 'none' | 'asc' | 'desc';

export interface SortConfig<T> {
  field: keyof T;
  direction: Exclude<SortDirection, 'none'>;
}

export const DEFAULT_SORT_DIRECTION: SortDirection = 'asc';

// interface Example {
//   id: number;
//   name: string;
//   age: number;
//   joinDate: Date;
//   isActive: boolean;
//   roles: string[];
// }

// const example: DataSourceFilterCondition<Example> = {
//   operator: DataSourceFilterOperator.AND,
//   conditions: [
//     {
//       field: 'name',
//       type: DataSourceFilterType.Text,
//       matchType: DataSourceFilterMatchType.Contains,
//       value: 'John',
//     },
//     {
//       field: 'age',
//       type: DataSourceFilterType.Number,
//       matchType: DataSourceFilterMatchType.GreaterThan,
//       value: 30,
//     },
//     {
//       field: 'joinDate',
//       type: DataSourceFilterType.Date,
//       matchType: DataSourceFilterMatchType.Before,
//       value: new Date('2022-01-01'),
//     },
//     {
//       operator: DataSourceFilterOperator.OR,
//       conditions: [
//         {
//           field: 'isActive',
//           type: DataSourceFilterType.Boolean,
//           matchType: DataSourceFilterMatchType.True,
//         },
//         {
//           operator: DataSourceFilterOperator.AND,
//           conditions: [
//             {
//               field: 'roles',
//               type: DataSourceFilterType.Set,
//               matchType: DataSourceFilterMatchType.In,
//               value: 'admin',
//             },
//           ],
//         },
//         {
//           field: 'roles',
//           type: DataSourceFilterType.Set,
//           matchType: DataSourceFilterMatchType.In,
//           value: 'admin',
//         },
//       ],
//     },
//   ],
// };
