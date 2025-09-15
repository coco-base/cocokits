/* eslint-disable */

/**
 * Advanced Column-Based Filtering Examples
 *
 * This file demonstrates the advanced filtering capabilities where:
 * - Multiple conditions on the same column can be combined with AND or OR
 * - Different columns are always combined with AND
 */

import { TableDataSource } from './table-data-source.store';

interface User {
  id: number;
  name: string;
  age: number;
  department: string;
  salary: number;
  isActive: boolean;
  joinDate: Date;
}

// Sample data
const users: User[] = [
  {
    id: 1,
    name: 'John Doe',
    age: 30,
    department: 'Engineering',
    salary: 75000,
    isActive: true,
    joinDate: new Date('2020-01-15'),
  },
  {
    id: 2,
    name: 'Jane Smith',
    age: 25,
    department: 'Marketing',
    salary: 65000,
    isActive: true,
    joinDate: new Date('2021-03-20'),
  },
  {
    id: 3,
    name: 'Bob Johnson',
    age: 35,
    department: 'Engineering',
    salary: 85000,
    isActive: false,
    joinDate: new Date('2019-07-10'),
  },
  {
    id: 4,
    name: 'Alice Brown',
    age: 28,
    department: 'Sales',
    salary: 70000,
    isActive: true,
    joinDate: new Date('2020-11-05'),
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    age: 42,
    department: 'Engineering',
    salary: 95000,
    isActive: true,
    joinDate: new Date('2018-02-28'),
  },
];

export class AdvancedFilteringExamples {
  private dataSource = new TableDataSource<User>();

  constructor() {
    this.dataSource.setData(users);
  }

  /**
   * Example 1: Age Range with OR Logic
   * Find users who are either young (20-25) OR experienced (35-45)
   */
  example1_AgeRangeWithOR() {
    console.log('=== Example 1: Age Range with OR Logic ===');

    // Set column operator to OR for age conditions
    this.dataSource.setColumnOperator('age', 'OR');

    // Add multiple age conditions
    this.dataSource.addColumnConditions(
      'age',
      [
        { operator: 'between', value: 20, value2: 25 }, // Young employees
        { operator: 'between', value: 35, value2: 45 }, // Experienced employees
      ],
      'OR'
    );

    const filteredData = this.dataSource.data();
    console.log('Users who are 20-25 OR 35-45 years old:', filteredData);
  }

  /**
   * Example 2: Age Range with AND Logic
   * Find users who are between 25 AND 40 (traditional range filter)
   */
  example2_AgeRangeWithAND() {
    console.log('\n=== Example 2: Age Range with AND Logic ===');

    this.dataSource.clearAllFilters();

    // Set column operator to AND for age conditions
    this.dataSource.setColumnOperator('age', 'AND');

    // Add multiple age conditions that must ALL be true
    this.dataSource.addColumnConditions(
      'age',
      [
        { operator: 'greaterThanOrEqual', value: 25 },
        { operator: 'lessThanOrEqual', value: 40 },
      ],
      'AND'
    );

    const filteredData = this.dataSource.data();
    console.log('Users who are 25-40 years old (AND logic):', filteredData);
  }

  /**
   * Example 3: Complex Department Filter with OR
   * Find users in Engineering OR Sales departments
   */
  example3_DepartmentWithOR() {
    console.log('\n=== Example 3: Department Filter with OR ===');

    this.dataSource.clearAllFilters();

    // Multiple department conditions with OR
    this.dataSource.addColumnConditions(
      'department',
      [
        { operator: 'equals', value: 'Engineering' },
        { operator: 'equals', value: 'Sales' },
      ],
      'OR'
    );

    const filteredData = this.dataSource.data();
    console.log('Users in Engineering OR Sales:', filteredData);
  }

  /**
   * Example 4: Salary Range with OR Logic
   * Find users with either low salary (< 70k) OR high salary (> 80k)
   */
  example4_SalaryRangeWithOR() {
    console.log('\n=== Example 4: Salary Range with OR Logic ===');

    this.dataSource.clearAllFilters();

    this.dataSource.addColumnConditions(
      'salary',
      [
        { operator: 'lessThan', value: 70000 }, // Low salary
        { operator: 'greaterThan', value: 80000 }, // High salary
      ],
      'OR'
    );

    const filteredData = this.dataSource.data();
    console.log('Users with salary < 70k OR > 80k:', filteredData);
  }

  /**
   * Example 5: Multi-Column Complex Filter
   * Find Engineering employees who are either young (< 30) OR high earners (> 80k)
   * This demonstrates: Department AND (Age OR Salary)
   */
  example5_MultiColumnComplex() {
    console.log('\n=== Example 5: Multi-Column Complex Filter ===');

    this.dataSource.clearAllFilters();

    // Department filter (will be ANDed with other columns)
    this.dataSource.setColumnFilter('department', 'equals', 'Engineering');

    // Age OR Salary conditions
    this.dataSource.addColumnConditions('age', [{ operator: 'lessThan', value: 30 }], 'OR');

    this.dataSource.addColumnConditions('salary', [{ operator: 'greaterThan', value: 80000 }], 'OR');

    const filteredData = this.dataSource.data();
    console.log('Engineering employees who are < 30 years old OR earn > 80k:', filteredData);
  }

  /**
   * Example 6: Name Pattern Matching with OR
   * Find users whose name contains 'John' OR 'Jane'
   */
  example6_NamePatternWithOR() {
    console.log('\n=== Example 6: Name Pattern with OR ===');

    this.dataSource.clearAllFilters();

    this.dataSource.addColumnConditions(
      'name',
      [
        { operator: 'contains', value: 'John' },
        { operator: 'contains', value: 'Jane' },
      ],
      'OR'
    );

    const filteredData = this.dataSource.data();
    console.log('Users with names containing John OR Jane:', filteredData);
  }

  /**
   * Example 7: Active Status with Complex Age Logic
   * Find active users who are either very young (< 26) OR in prime age (30-40)
   */
  example7_StatusAndAgeComplex() {
    console.log('\n=== Example 7: Active Status with Complex Age Logic ===');

    this.dataSource.clearAllFilters();

    // Active status (ANDed with age conditions)
    this.dataSource.setColumnFilter('isActive', 'equals', true);

    // Complex age logic with OR
    this.dataSource.addColumnConditions(
      'age',
      [
        { operator: 'lessThan', value: 26 }, // Very young
        { operator: 'between', value: 30, value2: 40 }, // Prime age
      ],
      'OR'
    );

    const filteredData = this.dataSource.data();
    console.log('Active users who are < 26 OR between 30-40:', filteredData);
  }

  /**
   * Example 8: Join Date Range with OR
   * Find users who joined either early (before 2020) OR recently (after 2021)
   */
  example8_JoinDateWithOR() {
    console.log('\n=== Example 8: Join Date with OR Logic ===');

    this.dataSource.clearAllFilters();

    this.dataSource.addColumnConditions(
      'joinDate',
      [
        { operator: 'lessThan', value: new Date('2020-01-01') }, // Early joiners
        { operator: 'greaterThan', value: new Date('2021-01-01') }, // Recent joiners
      ],
      'OR'
    );

    const filteredData = this.dataSource.data();
    console.log('Users who joined before 2020 OR after 2021:', filteredData);
  }

  /**
   * Example 9: Using the convenient setColumnFilter for single conditions
   * This shows the backwards compatibility with the original API
   */
  example9_SingleConditionCompatibility() {
    console.log('\n=== Example 9: Single Condition Compatibility ===');

    this.dataSource.clearAllFilters();

    // These work exactly as before
    this.dataSource.setColumnFilter('age', 'greaterThan', 30);
    this.dataSource.setColumnFilter('department', 'equals', 'Engineering');
    this.dataSource.setColumnFilter('isActive', 'equals', true);

    const filteredData = this.dataSource.data();
    console.log('Engineering users > 30 years old and active (traditional filtering):', filteredData);
  }

  /**
   * Example 10: Global Filter Combined with Column Filters
   * Column filters with OR logic + global search
   */
  example10_GlobalFilterWithColumnFilters() {
    console.log('\n=== Example 10: Global Filter with Column Filters ===');

    this.dataSource.clearAllFilters();

    // Column filter with OR logic
    this.dataSource.addColumnConditions(
      'department',
      [
        { operator: 'equals', value: 'Engineering' },
        { operator: 'equals', value: 'Sales' },
      ],
      'OR'
    );

    // Global filter (searches across all specified fields)
    this.dataSource.setGlobalFilter('John', ['name', 'department']);

    const filteredData = this.dataSource.data();
    console.log('Engineering OR Sales users with "John" in name/department:', filteredData);
  }

  /**
   * Run all examples
   */
  runAllExamples() {
    this.example1_AgeRangeWithOR();
    this.example2_AgeRangeWithAND();
    this.example3_DepartmentWithOR();
    this.example4_SalaryRangeWithOR();
    this.example5_MultiColumnComplex();
    this.example6_NamePatternWithOR();
    this.example7_StatusAndAgeComplex();
    this.example8_JoinDateWithOR();
    this.example9_SingleConditionCompatibility();
    this.example10_GlobalFilterWithColumnFilters();
  }
}

// Usage
export function demonstrateAdvancedFiltering() {
  const examples = new AdvancedFilteringExamples();
  examples.runAllExamples();
}
