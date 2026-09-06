import { describe, it, expect } from 'vitest';
import { DataSourceFilter } from './data-source-filter';
import {
  DataSourceFilterCondition,
  DataSourceFilterConditionGroup,
  DataSourceFilterMatchType,
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

describe('DataSourceFilter', () => {
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

  it('should return all data when no conditions are set', () => {
    const filter = new DataSourceFilter<Example>();
    const result = filter.apply(exampleRows);
    expect(result).toEqual(exampleRows);
  });

  it('should set conditions and apply AND filters correctly', () => {
    const filter = new DataSourceFilter<Example>();
    const group: DataSourceFilterConditionGroup<Example> = {
      operator: DataSourceFilterOperator.AND,
      conditions: [
        {
          field: 'name',
          type: DataSourceFilterType.Text,
          matchType: DataSourceFilterMatchType.Contains,
          filter: 'John',
        } as DataSourceFilterCondition<Example>,
        {
          field: 'age',
          type: DataSourceFilterType.Number,
          matchType: DataSourceFilterMatchType.GreaterThan,
          filter: 30,
        } as DataSourceFilterCondition<Example>,
      ],
    };
    filter.setConditions(group);
    const result = filter.apply(exampleRows);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(1);
  });

  it('should append a root condition when addRootCondition is called', () => {
    const filter = new DataSourceFilter<Example>();
    const cond: DataSourceFilterCondition<Example> = {
      field: 'name',
      type: DataSourceFilterType.Text,
      matchType: DataSourceFilterMatchType.Contains,
      filter: 'Alice',
    };
    filter.addRootCondition(cond);
    const result = filter.apply(exampleRows);
    expect(result.length).toBe(1);
    expect(result[0].name).toContain('Alice');
  });

  it('should remove root conditions by field when removeRootConditionByField is called', () => {
    const filter = new DataSourceFilter<Example>();
    // setup conditions that produce no results until we remove one
    const group: DataSourceFilterConditionGroup<Example> = {
      operator: DataSourceFilterOperator.AND,
      conditions: [
        {
          field: 'name',
          type: DataSourceFilterType.Text,
          matchType: DataSourceFilterMatchType.Contains,
          filter: 'John',
        } as DataSourceFilterCondition<Example>,
        {
          field: 'age',
          type: DataSourceFilterType.Number,
          matchType: DataSourceFilterMatchType.GreaterThan,
          filter: 40,
        } as DataSourceFilterCondition<Example>,
      ],
    };
    filter.setConditions(group);
    // no matches currently (age>40 filters out John)
    expect(filter.apply(exampleRows).length).toBe(0);
    filter.removeRootConditionByField('age');
    const after = filter.apply(exampleRows);
    // After removing age condition, name contains 'John' matches both John Doe and Alice Johnson
    expect(after.length).toBe(2);
    expect(after.every(r => r.name.includes('John'))).toBe(true);
  });

  it('should remove the exact root condition object when removeRootCondition is called', () => {
    const filter = new DataSourceFilter<Example>();
    const c1: DataSourceFilterCondition<Example> = {
      field: 'name',
      type: DataSourceFilterType.Text,
      matchType: DataSourceFilterMatchType.Contains,
      filter: 'John',
    };
    const c2: DataSourceFilterCondition<Example> = {
      field: 'age',
      type: DataSourceFilterType.Number,
      matchType: DataSourceFilterMatchType.GreaterThan,
      filter: 30,
    };
    filter.setConditions({ operator: DataSourceFilterOperator.AND, conditions: [c1, c2] });
    expect(filter.apply(exampleRows).length).toBe(1);
    filter.removeRootCondition(c1);
    const res = filter.apply(exampleRows);
    // with only age>30 remaining, John still matches
    expect(res.length).toBe(1);
    expect(res[0].id).toBe(1);
  });

  it('should clear all root conditions when clearAllConditions is called', () => {
    const filter = new DataSourceFilter<Example>();
    filter.setConditions({
      operator: DataSourceFilterOperator.AND,
      conditions: [
        {
          field: 'age',
          type: DataSourceFilterType.Number,
          matchType: DataSourceFilterMatchType.GreaterThan,
          filter: 30,
        } as DataSourceFilterCondition<Example>,
      ],
    });
    expect(filter.apply(exampleRows).length).toBe(1);
    filter.clearAllConditions();
    expect(filter.apply(exampleRows).length).toBe(3);
  });

  it('should return a cloned condition group from getConditionGroup', () => {
    const filter = new DataSourceFilter<Example>();
    const c: DataSourceFilterCondition<Example> = {
      field: 'age',
      type: DataSourceFilterType.Number,
      matchType: DataSourceFilterMatchType.GreaterThan,
      filter: 30,
    };
    filter.setConditions({ operator: DataSourceFilterOperator.AND, conditions: [c] });
    const cg = filter.getConditionGroup();
    expect(cg.conditions.length).toBe(1);
    cg.conditions.push({ field: 'name', type: DataSourceFilterType.Text, matchType: DataSourceFilterMatchType.Contains, filter: 'x' } as DataSourceFilterCondition<Example>);
    // original should still have 1 condition
    expect(filter.getConditions().length).toBe(1);
  });

  it('should return current conditions snapshot from getConditions', () => {
    const filter = new DataSourceFilter<Example>();
    const c: DataSourceFilterCondition<Example> = {
      field: 'age',
      type: DataSourceFilterType.Number,
      matchType: DataSourceFilterMatchType.GreaterThan,
      filter: 10,
    };
    filter.setConditions({ operator: DataSourceFilterOperator.AND, conditions: [c] });
    const conds = filter.getConditions();
    expect(conds.length).toBe(1);
    const first = conds[0];
    // ensure it's a simple condition (not a group)
    expect('field' in first).toBe(true);
    if ('field' in first) {
      expect(first.field).toBe('age');
    }
  });

  it('should return items matching any condition when using OR operator', () => {
    const filter = new DataSourceFilter<Example>();
    const group: DataSourceFilterConditionGroup<Example> = {
      operator: DataSourceFilterOperator.OR,
      conditions: [
        {
          field: 'name',
          type: DataSourceFilterType.Text,
          matchType: DataSourceFilterMatchType.Contains,
          filter: 'Alice',
        } as DataSourceFilterCondition<Example>,
        {
          field: 'age',
          type: DataSourceFilterType.Number,
          matchType: DataSourceFilterMatchType.LessThan,
          filter: 18,
        } as DataSourceFilterCondition<Example>,
      ],
    };
    filter.setConditions(group);
    const res = filter.apply(exampleRows);
    // Alice and Bob (age < 18)
    expect(res.some(r => r.name.includes('Alice'))).toBe(true);
    expect(res.some(r => r.name.includes('Bob'))).toBe(true);
  });

  it('should handle between and blank edge cases', () => {
    const filter = new DataSourceFilter<Example>();
    // between on score should match John (88) and Alice (72)
    filter.setConditions({
      operator: DataSourceFilterOperator.AND,
      conditions: [
        {
          field: 'score',
          type: DataSourceFilterType.Number,
          matchType: DataSourceFilterMatchType.Between,
          filter: 70,
          filter2: 90,
        } as DataSourceFilterCondition<Example>,
      ],
    });
    const betweenRes = filter.apply(exampleRows);
    expect(betweenRes.map(r => r.id).sort()).toEqual([1, 2]);

    // blank on notes should match Alice (null) and Bob (undefined)
    filter.setConditions({
      operator: DataSourceFilterOperator.AND,
      conditions: [
        {
          field: 'notes',
          type: DataSourceFilterType.Text,
          matchType: DataSourceFilterMatchType.Blank,
        } as DataSourceFilterCondition<Example>,
      ],
    });
    const blankRes = filter.apply(exampleRows);
    expect(blankRes.map(r => r.id).sort()).toEqual([2, 3]);
  });
});
