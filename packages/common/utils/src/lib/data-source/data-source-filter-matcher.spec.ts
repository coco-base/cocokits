import { describe, it, expect } from 'vitest';
import { DataSourceFilterMatcher } from './data-source-filter-matcher';
import {
  DataSourceFilterMatchType,
  DataSourceFilterCondition,
  DataSourceFilterConditionGroup,
  DataSourceFilterOperator,
  DataSourceFilterType,
} from './data-source.model';


interface Example {
  id: number;
  name: string;
  age: number;
  joinDate: Date;
  isActive: boolean;
  roles: string[];
  score?: number | null;
  notes?: string | null;
}

describe('DataSourceFilterMatcher', () => {
  const matcher = new DataSourceFilterMatcher<Example>();
  const exampleRows: Example[] = [
    {
      id: 1,
      name: 'John Doe',
      age: 35,
      joinDate: new Date('2021-06-15'),
      isActive: false,
      roles: ['user', 'editor', 'admin'],
      score: 88,
      notes: 'Senior contributor',
    },
    {
      id: 2,
      name: 'Alice Johnson',
      age: 28,
      joinDate: new Date('2019-03-10'),
      isActive: true,
      roles: ['user'],
      score: 72,
      notes: null,
    },
    {
      id: 3,
      name: 'Bob Smith',
      age: 17,
      joinDate: new Date('2023-02-20'),
      isActive: false,
      roles: [],
      score: null,
      notes: undefined,
    },
  ];

  it('should contain match substring (case-insensitive) and return true for empty filter', () => {
    expect(matcher.match(DataSourceFilterMatchType.Contains, 'Hello World', 'world')).toBe(true);
    // empty filter treated as "no filter" -> true
    expect(matcher.match(DataSourceFilterMatchType.Contains, 'Hello', '')).toBe(true);
  });

  it('should not contain invert contains and treat empty filter as true', () => {
    expect(matcher.match(DataSourceFilterMatchType.NotContains, 'Hello World', 'foo')).toBe(true);
    expect(matcher.match(DataSourceFilterMatchType.NotContains, 'Hello', '')).toBe(true);
  });

  it('should equal compare primitives and dates, and treat empty filter as true', () => {
    expect(matcher.match(DataSourceFilterMatchType.Equals, 5, 5)).toBe(true);
    expect(matcher.match(DataSourceFilterMatchType.Equals, 'a', 'a')).toBe(true);
    const d = new Date(2020, 0, 1);
    expect(matcher.match(DataSourceFilterMatchType.Equals, d, new Date(2020, 0, 1))).toBe(true);
    expect(matcher.match(DataSourceFilterMatchType.Equals, 'x', '')).toBe(true);
  });

  it('should not equal return false for equal values and true when different; empty value yields true', () => {
    expect(matcher.match(DataSourceFilterMatchType.NotEqual, 5, 5)).toBe(false);
    expect(matcher.match(DataSourceFilterMatchType.NotEqual, 5, 6)).toBe(true);
    // when the value being checked is undefined/null -> implementation treats as hasNotValue(value) ? true
    expect(matcher.match(DataSourceFilterMatchType.NotEqual, undefined, 5)).toBe(true);
  });

  it('should startsWith and endsWith match correctly and handle empty filter', () => {
    expect(matcher.match(DataSourceFilterMatchType.StartsWith, 'testing', 'test')).toBe(true);
    expect(matcher.match(DataSourceFilterMatchType.EndsWith, 'testing', 'ing')).toBe(true);
    expect(matcher.match(DataSourceFilterMatchType.StartsWith, 'abc', '')).toBe(true);
  });

  it('should comparison operators work for numbers and respect empty filter', () => {
    expect(matcher.match(DataSourceFilterMatchType.GreaterThan, 10, 5)).toBe(true);
    expect(matcher.match(DataSourceFilterMatchType.GreaterThanOrEqual, 5, 5)).toBe(true);
    expect(matcher.match(DataSourceFilterMatchType.LessThan, 1, 2)).toBe(true);
    expect(matcher.match(DataSourceFilterMatchType.LessThanOrEqual, 2, 2)).toBe(true);
    expect(matcher.match(DataSourceFilterMatchType.GreaterThan, 10, undefined)).toBe(true);
  });

  it('should between work for numbers and dates and return true when min/max missing', () => {
    expect(matcher.match(DataSourceFilterMatchType.Between, 5, 1, 10)).toBe(true);
    const d = new Date(2021, 5, 1);
    expect(matcher.match(DataSourceFilterMatchType.Between, d, new Date(2021, 0, 1), new Date(2021, 11, 31))).toBe(
      true
    );
    expect(matcher.match(DataSourceFilterMatchType.Between, 5, undefined, 10)).toBe(true);
  });

  it('should before and after compare dates and treat empty filter as true', () => {
    const d1 = new Date(2020, 0, 1);
    const d2 = new Date(2021, 0, 1);
    expect(matcher.match(DataSourceFilterMatchType.Before, d1, d2)).toBe(true);
    expect(matcher.match(DataSourceFilterMatchType.After, d2, d1)).toBe(true);
    expect(matcher.match(DataSourceFilterMatchType.Before, d1, undefined)).toBe(true);
  });

  it('should true/false matchers match booleans and treat missing value as true', () => {
    expect(matcher.match(DataSourceFilterMatchType.True, true, true)).toBe(true);
    expect(matcher.match(DataSourceFilterMatchType.False, false, false)).toBe(true);
    expect(matcher.match(DataSourceFilterMatchType.True, undefined, true)).toBe(true);
  });

  it('should blank and not-blank detect null/undefined correctly', () => {
    expect(matcher.match(DataSourceFilterMatchType.Blank, null)).toBe(true);
    expect(matcher.match(DataSourceFilterMatchType.Blank, undefined)).toBe(true);
    expect(matcher.match(DataSourceFilterMatchType.NotBlank, 'value')).toBe(true);
  });

  it('should filter apply AND operator across conditions', () => {
    const data: Example = exampleRows[1];
    const group: DataSourceFilterConditionGroup<Example> = {
      operator: DataSourceFilterOperator.AND,
      conditions: [
        {
          field: 'name',
          type: DataSourceFilterType.Text,
          matchType: DataSourceFilterMatchType.Contains,
          filter: 'ali',
        } as DataSourceFilterCondition<Example>,
        {
          field: 'age',
          type: DataSourceFilterType.Number,
          matchType: DataSourceFilterMatchType.GreaterThanOrEqual,
          filter: 18,
        } as DataSourceFilterCondition<Example>,
      ],
    };
    expect(matcher.filter(data, group)).toBe(true);
  });

  it('should filter apply OR operator across conditions', () => {
    const data: Example = exampleRows[2];
    const group: DataSourceFilterConditionGroup<Example> = {
      operator: DataSourceFilterOperator.OR,
      conditions: [
        {
          field: 'name',
          type: DataSourceFilterType.Text,
          matchType: DataSourceFilterMatchType.Contains,
          filter: 'alice',
        } as DataSourceFilterCondition<Example>,
        {
          field: 'age',
          type: DataSourceFilterType.Number,
          matchType: DataSourceFilterMatchType.LessThan,
          filter: 18,
        } as DataSourceFilterCondition<Example>,
      ],
    };
    expect(matcher.filter(data, group)).toBe(true);
  });

  it('should nested condition groups evaluate correctly', () => {
    const data: Example = exampleRows[0];
    const nested: DataSourceFilterConditionGroup<Example> = {
      operator: DataSourceFilterOperator.AND,
      conditions: [
        {
          field: 'age',
          type: DataSourceFilterType.Number,
          matchType: DataSourceFilterMatchType.Equals,
          filter: 35,
        } as DataSourceFilterCondition<Example>,
        {
          operator: DataSourceFilterOperator.OR,
          conditions: [
            {
              field: 'age',
              type: DataSourceFilterType.Number,
              matchType: DataSourceFilterMatchType.Equals,
              filter: 99,
            } as DataSourceFilterCondition<Example>,
            {
              field: 'id',
              type: DataSourceFilterType.Number,
              matchType: DataSourceFilterMatchType.Equals,
              filter: 1,
            } as DataSourceFilterCondition<Example>,
          ],
        } as DataSourceFilterConditionGroup<Example>,
      ],
    };
    expect(matcher.filter(data, nested)).toBe(true);
  });

  it('should filterByCondition call match for simple condition and between with two values', () => {
    const data: Example = exampleRows[0];
    const cond: DataSourceFilterCondition<Example> = {
      field: 'score',
      type: DataSourceFilterType.Number,
      matchType: DataSourceFilterMatchType.Between,
      filter: 80,
      filter2: 90,
    } as DataSourceFilterCondition<Example>;
    expect(matcher.filterByCondition(data, cond)).toBe(true);
  });

  it('should complex example evaluate combined AND/OR groups and set membership (using contains as proxy for In)', () => {
    const exampleRows: Example[] = [
      {
        id: 1,
        name: 'John Doe',
        age: 35,
        joinDate: new Date('2021-06-15'),
        isActive: false,
        roles: ['user', 'editor', 'admin'],
        score: 88,
        notes: 'Senior contributor',
      },
      {
        id: 2,
        name: 'Alice Johnson',
        age: 28,
        joinDate: new Date('2019-03-10'),
        isActive: true,
        roles: ['user'],
        score: 72,
        notes: null,
      },
      {
        id: 3,
        name: 'Bob Smith',
        age: 17,
        joinDate: new Date('2023-02-20'),
        isActive: false,
        roles: [],
        score: null,
        notes: undefined,
      },
    ];

    // Build a filter similar to the sample in the model file. DataSource currently does not implement In/NotIn,
    // so we will use Contains on a joined string of roles to simulate set membership where needed.
    const complex: DataSourceFilterConditionGroup<Example> = {
      operator: DataSourceFilterOperator.AND,
      conditions: [
        {
          field: 'name',
          type: DataSourceFilterType.Text,
          matchType: DataSourceFilterMatchType.Contains,
          filter: 'John',
        },
        {
          field: 'age',
          type: DataSourceFilterType.Number,
          matchType: DataSourceFilterMatchType.GreaterThan,
          filter: 30,
        },
        {
          field: 'joinDate',
          type: DataSourceFilterType.Date,
          matchType: DataSourceFilterMatchType.Before,
          filter: new Date('2022-01-01'),
        },
        {
          operator: DataSourceFilterOperator.OR,
          conditions: [
            {
              field: 'isActive',
              type: DataSourceFilterType.Boolean,
              matchType: DataSourceFilterMatchType.True,
              filter: true,
            },
            {
              operator: DataSourceFilterOperator.AND,
              conditions: [
                // simulate roles contains 'admin' by joining roles as string
                {
                  field: 'roles',
                  type: DataSourceFilterType.Text,
                  matchType: DataSourceFilterMatchType.Contains,
                  filter: 'admin',
                } as DataSourceFilterCondition<Example>,
              ],
            } as DataSourceFilterConditionGroup<Example>,
          ],
        } as DataSourceFilterConditionGroup<Example>,
      ],
    };

    // Convert exampleRow into a shape matcher expects: the filter implementation reads data[field] directly.
    // For roles we provide a joined string to enable the Contains matcher to work as a proxy for 'In'.
    // Use the first example in the list
    const shaped: Example = { ...exampleRows[0], roles: exampleRows[0].roles };
    // The matcher reads the raw field; roles is an array — the Contains matcher will call toString() on it at runtime
    expect(matcher.filter(shaped, complex)).toBe(true);
  });

  it('should blank and not-blank logic handle null and optional fields on Example', () => {
    const a: Example = {
      id: 2,
      name: 'Empty Fields',
      age: 0,
      joinDate: new Date('2020-01-01'),
      isActive: false,
      roles: [],
      score: null,
      notes: undefined,
    };
    // score is null -> Blank should be true
    const blankCond: DataSourceFilterCondition<Example> = {
      field: 'score',
      type: DataSourceFilterType.Number,
      matchType: DataSourceFilterMatchType.Blank,
    };
  expect(matcher.filterByCondition(a, blankCond)).toBe(true);

    const notBlankCond: DataSourceFilterCondition<Example> = {
      field: 'notes',
      type: DataSourceFilterType.Text,
      matchType: DataSourceFilterMatchType.NotBlank,
    };
    // notes is undefined -> NotBlank should be false
  expect(matcher.filterByCondition(a, notBlankCond)).toBe(false);
  });

  it('should negative cases and boundaries: contains false, between boundaries, before/after negatives', () => {
    // contains false
    expect(matcher.match(DataSourceFilterMatchType.Contains, 'abc', 'z')).toBe(false);

    // between boundaries - inclusive
    expect(matcher.match(DataSourceFilterMatchType.Between, 5, 5, 10)).toBe(true);
    expect(matcher.match(DataSourceFilterMatchType.Between, 10, 5, 10)).toBe(true);
    // outside range
    expect(matcher.match(DataSourceFilterMatchType.Between, 4, 5, 10)).toBe(false);

    // before/after negatives
    const d1 = new Date('2020-01-01');
    const d2 = new Date('2020-01-02');
    expect(matcher.match(DataSourceFilterMatchType.Before, d2, d1)).toBe(false);
    expect(matcher.match(DataSourceFilterMatchType.After, d1, d2)).toBe(false);
  });
});
