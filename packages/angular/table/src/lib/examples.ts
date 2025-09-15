/* eslint-disable */
/**
 * COCOKITS TABLE FILTERING SYSTEM - USAGE EXAMPLES
 *
 * This file demonstrates how to use the advanced filtering system
 * with the TableDataSource. In real usage, you would connect this
 * to your TableComponent which handles the data() method internally.
 *
 * NEW FEATURES:
 * - Column-based AND/OR logic: Multiple conditions on the same column
 *   can be combined with AND or OR operators
 * - Cross-column AND logic: Different columns are always combined with AND
 * - Backwards compatibility: All existing APIs continue to work
 *
 * EXAMPLES:
 * - Basic filtering: dataSource.setColumnFilter('age', 'greaterThan', 25)
 * - Multiple conditions per column: dataSource.addColumnConditions('age', [...], 'OR')
 * - Column operator control: dataSource.setColumnOperator('age', 'OR')
 *
 * For detailed column-based AND/OR examples, see: advanced-filtering-examples.ts
 */

import { signal, computed } from '@angular/core';
import {
  TableDataSource,
  FilterType,
  FilterOperator,
  ColumnFilterConfig,
  FilterCondition,
  FilterModel,
  FilterUtils,
} from './index';

// Example data type
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  department: string;
  salary: number;
  startDate: Date;
}

// Example usage class
export class TableFilteringExamples {
  // Sample data
  private users: User[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 30,
      isActive: true,
      department: 'Engineering',
      salary: 75000,
      startDate: new Date('2020-01-15'),
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      age: 28,
      isActive: true,
      department: 'Marketing',
      salary: 68000,
      startDate: new Date('2021-03-22'),
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      age: 35,
      isActive: false,
      department: 'Engineering',
      salary: 82000,
      startDate: new Date('2019-07-10'),
    },
  ];

  private dataSignal = signal<User[]>(this.users);
  public dataSource = new TableDataSource<User>();

  constructor() {
    this.setupColumnConfigurations();
    this.demonstrateFilteringMethods();
  }

  /**
   * Setup column configurations for different filter types
   */
  private setupColumnConfigurations(): void {
    const configs: ColumnFilterConfig<User>[] = [
      {
        field: 'name',
        type: FilterType.Text,
        operators: ['contains', 'equals', 'startsWith'],
        defaultOperator: 'contains',
        caseSensitive: false,
        placeholder: 'Search names...',
      },
      {
        field: 'age',
        type: FilterType.Number,
        operators: ['equals', 'greaterThan', 'lessThan', 'between'],
        defaultOperator: 'equals',
      },
      {
        field: 'salary',
        type: FilterType.Number,
        operators: ['greaterThanOrEqual', 'lessThanOrEqual', 'between'],
        defaultOperator: 'greaterThanOrEqual',
      },
      {
        field: 'startDate',
        type: FilterType.Date,
        operators: ['equals', 'before', 'after', 'between'],
        defaultOperator: 'after',
      },
      {
        field: 'isActive',
        type: FilterType.Boolean,
        operators: ['true', 'false'],
        defaultOperator: 'true',
      },
      {
        field: 'department',
        type: FilterType.Set,
        operators: ['in', 'notIn'],
        defaultOperator: 'in',
        allowedValues: ['Engineering', 'Marketing', 'Sales', 'HR'],
      },
    ];

    this.dataSource.setColumnConfigs(configs);
  }

  /**
   * Demonstrate various filtering methods
   */
  private demonstrateFilteringMethods(): void {
    console.log('=== COCOKITS TABLE FILTERING EXAMPLES ===\n');

    // Note: In real usage with TableComponent, these filters would be applied
    // to the data reactively. These examples demonstrate the API usage.

    // Example 1: Simple column filter
    console.log('1. Simple text filter - names containing "John":');
    this.dataSource.setColumnFilter('name', 'contains', 'John', undefined, FilterType.Text);
    console.log('Filter description:', FilterUtils.describeFilterModel(this.dataSource.getFilterModel()));
    console.log('');

    // Example 2: Number filter
    console.log('2. Number filter - age greater than 29:');
    this.dataSource.clearAllFilters();
    this.dataSource.setColumnFilter('age', 'greaterThan', 29, undefined, FilterType.Number);
    console.log('Filter description:', FilterUtils.describeFilterModel(this.dataSource.getFilterModel()));
    console.log('');

    // Example 3: Multiple conditions with AND
    console.log('3. Multiple conditions (AND) - active users in Engineering:');
    this.dataSource.clearAllFilters();
    this.dataSource.addFilterCondition({
      field: 'isActive',
      operator: 'true',
      value: null,
      type: FilterType.Boolean,
    });
    this.dataSource.addFilterCondition({
      field: 'department',
      operator: 'equals',
      value: 'Engineering',
      type: FilterType.Text,
    });
    console.log('Filter description:', FilterUtils.describeFilterModel(this.dataSource.getFilterModel()));
    console.log('');

    // Example 4: Multiple conditions with OR
    console.log('4. Multiple conditions (OR) - age 28 OR 35:');
    this.dataSource.clearAllFilters();
    this.dataSource.setFilterOperator('OR');
    this.dataSource.addFilterCondition({
      field: 'age',
      operator: 'equals',
      value: 28,
      type: FilterType.Number,
    });
    this.dataSource.addFilterCondition({
      field: 'age',
      operator: 'equals',
      value: 35,
      type: FilterType.Number,
    });
    console.log('Filter description:', FilterUtils.describeFilterModel(this.dataSource.getFilterModel()));
    console.log('');

    // Example 5: Between filter
    console.log('5. Between filter - salary between 65000 and 80000:');
    this.dataSource.clearAllFilters();
    this.dataSource.setFilterOperator('AND');
    this.dataSource.setColumnFilter('salary', 'between', 65000, 80000, FilterType.Number);
    console.log('Filter description:', FilterUtils.describeFilterModel(this.dataSource.getFilterModel()));
    console.log('');

    // Example 6: Date filter
    console.log('6. Date filter - started after 2020:');
    this.dataSource.clearAllFilters();
    this.dataSource.setColumnFilter('startDate', 'after', new Date('2020-01-01'), undefined, FilterType.Date);
    console.log('Filter description:', FilterUtils.describeFilterModel(this.dataSource.getFilterModel()));
    console.log('');

    // Example 7: Set filter (multiple values)
    console.log('7. Set filter - departments in Engineering or Marketing:');
    this.dataSource.clearAllFilters();
    this.dataSource.setColumnFilter('department', 'in', ['Engineering', 'Marketing'], undefined, FilterType.Set);
    console.log('Filter description:', FilterUtils.describeFilterModel(this.dataSource.getFilterModel()));
    console.log('');

    // Example 8: Global filter
    console.log('8. Global filter - search for "john" across all text fields:');
    this.dataSource.clearAllFilters();
    this.dataSource.setGlobalFilter('john', ['name', 'email', 'department']);
    console.log('Filter description:', FilterUtils.describeFilterModel(this.dataSource.getFilterModel()));
    console.log('');

    // Example 9: Complex filter model
    console.log('9. Complex filter - multiple conditions with custom model:');
    const complexFilter: FilterModel<User> = {
      conditions: [
        {
          field: 'isActive',
          operator: 'true',
          value: null,
          type: FilterType.Boolean,
        },
        {
          field: 'salary',
          operator: 'greaterThan',
          value: 70000,
          type: FilterType.Number,
        },
      ],
      operator: 'AND',
      globalFilter: '',
    };
    this.dataSource.setFilter(complexFilter);
    console.log('Filter description:', FilterUtils.describeFilterModel(this.dataSource.getFilterModel()));
    console.log('');

    // Example 10: Custom filter matcher
    console.log('10. Custom filter matcher - custom email domain filter:');
    this.dataSource.clearAllFilters();

    // Set custom matcher for email field
    this.dataSource.setCustomMatcher('email', (item, condition) => {
      if (condition.operator === 'contains') {
        const email = item.email.toLowerCase();
        const domain = condition.value.toLowerCase();
        return email.includes(`@${domain}`) || email.includes(domain);
      }
      return false;
    });

    this.dataSource.setColumnFilter('email', 'contains', 'example.com', undefined, FilterType.Text);
    console.log('Filter description:', FilterUtils.describeFilterModel(this.dataSource.getFilterModel()));
    console.log('');

    // Example 11: Utility functions
    console.log('11. Utility functions:');
    console.log('Available operators for Text:', FilterUtils.getOperatorDisplayName('contains'));
    console.log('Auto-detect type for "John":', FilterUtils.detectFilterType('John'));
    console.log('Auto-detect type for 25:', FilterUtils.detectFilterType(25));
    console.log(
      'Generated filter options for department:',
      FilterUtils.generateFilterOptions(this.users, 'department')
    );
    console.log('');

    // Reset for final state
    this.dataSource.clearAllFilters();
    console.log('=== Examples completed. Data source is ready for use! ===');
  }

  /**
   * Get the data source instance for external use
   */
  public getDataSource(): TableDataSource<User> {
    return this.dataSource;
  }

  /**
   * Get current filter state
   */
  public getCurrentFilters(): FilterModel<User> {
    return this.dataSource.getFilterModel();
  }

  /**
   * Get filter statistics
   */
  public getFilterStats(): {
    totalRecords: number;
    filteredRecords: number;
    hasActiveFilters: boolean;
    filterDescription: string;
  } {
    const total = this.users.length;
    const filtered = this.dataSource.getFilteredCount(this.users);
    const hasFilters = this.dataSource.hasActiveFilters();
    const description = FilterUtils.describeFilterModel(this.dataSource.getFilterModel());

    return {
      totalRecords: total,
      filteredRecords: filtered,
      hasActiveFilters: hasFilters,
      filterDescription: description,
    };
  }

  /**
   * Example method showing how to connect with TableComponent
   *
   * In your actual component, you would do:
   *
   * @Component({
   *   template: `<cck-table [data]="rawData">`
   * })
   * class MyComponent {
   *   rawData = signal([...]);
   *   // The TableComponent internally uses: this.dataSource.data(this.rawData)
   * }
   */
  public connectWithTableComponent() {
    console.log('In real usage, the TableComponent handles data() method internally.');
    console.log('You just provide the raw data signal and configure filters on the dataSource.');

    // This is what happens inside TableComponent:
    // const filteredData = this.dataSource.data(this.dataSignal);
  }
}

// Export for easy import and usage
export const tableFilteringDemo = new TableFilteringExamples();
