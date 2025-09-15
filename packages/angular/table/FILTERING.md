# 🔍 Cocokits Table Filtering System

A comprehensive, type-safe filtering system for Angular tables inspired by PrimeNG and AgGrid. This system provides advanced filtering capabilities without requiring any UI components.

## ✨ Features

### 🎯 **Filter Types**
- **Text Filters**: `contains`, `notContains`, `equals`, `notEqual`, `startsWith`, `endsWith`, `blank`, `notBlank`
- **Number Filters**: `equals`, `notEqual`, `greaterThan`, `greaterThanOrEqual`, `lessThan`, `lessThanOrEqual`, `between`, `blank`, `notBlank`
- **Date Filters**: `equals`, `notEqual`, `before`, `after`, `between`, `blank`, `notBlank`
- **Boolean Filters**: `true`, `false`, `blank`
- **Set Filters**: `in`, `notIn` (multi-select values)

### 🔧 **Advanced Configuration**
- **Multiple Conditions**: Combine filters with AND/OR operators
- **Global Search**: Search across multiple columns simultaneously
- **Custom Filter Functions**: Define custom filtering logic for specific columns
- **Type Safety**: Full TypeScript support with generics
- **Case Sensitivity**: Configurable for text filters
- **Performance**: Reactive filtering with Angular signals

### 🚀 **Easy to Use API**
- Simple method calls for common filtering tasks
- Complex filter model support for advanced scenarios
- Utility functions for filter management
- Comprehensive examples and documentation

### 🎭 **NEW: Column-Based AND/OR Logic**
- **Same Column Conditions**: Multiple conditions on the same column can be combined with AND or OR
- **Cross-Column Logic**: Different columns are always combined with AND
- **Flexible Operators**: Set per-column operators (AND/OR) for fine-grained control
- **Backwards Compatibility**: All existing APIs continue to work seamlessly

**Example Use Cases:**
- Find users aged 20-25 OR 35-45 (same column with OR)
- Find Engineering OR Sales departments (same column with OR) 
- Find active users AND (young OR experienced) (cross-column with AND)

```typescript
// Age range with OR: users who are 20-25 OR 35-45
dataSource.addColumnConditions('age', [
  { operator: 'between', value: 20, value2: 25 },
  { operator: 'between', value: 35, value2: 45 }
], 'OR');

// Department with OR: Engineering OR Sales
dataSource.addColumnConditions('department', [
  { operator: 'equals', value: 'Engineering' },
  { operator: 'equals', value: 'Sales' }
], 'OR');

// The above filters will be combined with AND:
// (age: 20-25 OR 35-45) AND (department: Engineering OR Sales)
```

## 📦 Installation

The filtering system is included with the Cocokits Angular Table package:

```bash
npm install @cocokits/angular-table
```

## 🏁 Quick Start

### Basic Setup

```typescript
import { Component, signal } from '@angular/core';
import { TableDataSource, FilterType } from '@cocokits/angular-table';

interface User {
  id: number;
  name: string;
  age: number;
  department: string;
}

@Component({
  selector: 'app-example',
  template: `<!-- Your table template -->`
})
export class ExampleComponent {
  private users = signal<User[]>([
    { id: 1, name: 'John', age: 30, department: 'Engineering' },
    { id: 2, name: 'Jane', age: 25, department: 'Marketing' }
  ]);

  dataSource = new TableDataSource<User>();
  filteredData = this.dataSource.data(this.users);

  filterByName() {
    this.dataSource.setColumnFilter('name', 'contains', 'John', undefined, FilterType.Text);
  }
}
```

## 📚 Detailed Usage

### 1. Simple Column Filtering

```typescript
// Text filter
dataSource.setColumnFilter('name', 'contains', 'John', undefined, FilterType.Text);

// Number filter
dataSource.setColumnFilter('age', 'greaterThan', 25, undefined, FilterType.Number);

// Date filter
dataSource.setColumnFilter('startDate', 'after', new Date('2020-01-01'), undefined, FilterType.Date);

// Boolean filter
dataSource.setColumnFilter('isActive', 'true', null, undefined, FilterType.Boolean);

// Set filter (multiple values)
dataSource.setColumnFilter('department', 'in', ['Engineering', 'Marketing'], undefined, FilterType.Set);
```

### 2. Multiple Conditions

```typescript
// Add multiple conditions (default: AND)
dataSource.addFilterCondition({
  field: 'age',
  operator: 'greaterThan',
  value: 25,
  type: FilterType.Number
});

dataSource.addFilterCondition({
  field: 'department',
  operator: 'equals',
  value: 'Engineering',
  type: FilterType.Text
});

// Change to OR operator
dataSource.setFilterOperator('OR');
```

### 3. Column-Based AND/OR Logic (NEW!)

This powerful feature allows you to combine multiple conditions on the same column with AND or OR, while different columns are always combined with AND.

#### Basic Column-Based Filtering

```typescript
// Multiple conditions on the same column with OR logic
// Find users aged 20-25 OR 35-45
dataSource.addColumnConditions('age', [
  { operator: 'between', value: 20, value2: 25 },
  { operator: 'between', value: 35, value2: 45 }
], 'OR');

// Multiple conditions on the same column with AND logic
// Find users aged >= 25 AND <= 40
dataSource.addColumnConditions('age', [
  { operator: 'greaterThanOrEqual', value: 25 },
  { operator: 'lessThanOrEqual', value: 40 }
], 'AND');
```

#### Setting Column Operators

```typescript
// Set the operator for a specific column
dataSource.setColumnOperator('department', 'OR');
dataSource.setColumnOperator('age', 'AND');

// Add conditions to the column (will use the set operator)
dataSource.addColumnConditions('department', [
  { operator: 'equals', value: 'Engineering' },
  { operator: 'equals', value: 'Sales' }
]); // Uses OR because we set it above
```

#### Complex Multi-Column Examples

```typescript
// Example: Active employees in Engineering OR Sales, aged 25-35 OR 40-50
// This creates: isActive=true AND (department=Engineering OR Sales) AND (age=25-35 OR 40-50)

// Set active status (single condition)
dataSource.setColumnFilter('isActive', 'equals', true);

// Set department with OR (multiple values)
dataSource.addColumnConditions('department', [
  { operator: 'equals', value: 'Engineering' },
  { operator: 'equals', value: 'Sales' }
], 'OR');

// Set age ranges with OR
dataSource.addColumnConditions('age', [
  { operator: 'between', value: 25, value2: 35 },
  { operator: 'between', value: 40, value2: 50 }
], 'OR');
```

#### Backwards Compatibility

All existing methods continue to work exactly as before:

```typescript
// These work exactly as before - no breaking changes
dataSource.setColumnFilter('age', 'greaterThan', 30);
dataSource.setColumnFilter('department', 'equals', 'Engineering');
dataSource.addFilterCondition({
  field: 'name',
  operator: 'contains',
  value: 'John',
  type: FilterType.Text
});
```

### 4. Between Filters

```typescript
// Number range
dataSource.setColumnFilter('salary', 'between', 50000, 100000, FilterType.Number);

// Date range
dataSource.setColumnFilter('startDate', 'between', 
  new Date('2020-01-01'), 
  new Date('2023-12-31'), 
  FilterType.Date
);
```

### 4. Global Search

```typescript
// Search across multiple fields
dataSource.setGlobalFilter('john', ['name', 'email', 'department']);
```

### 5. Complex Filter Models

```typescript
import { FilterModel } from '@cocokits/angular-table';

const complexFilter: FilterModel<User> = {
  conditions: [
    {
      field: 'age',
      operator: 'greaterThan',
      value: 25,
      type: FilterType.Number
    },
    {
      field: 'department',
      operator: 'in',
      value: ['Engineering', 'Marketing'],
      type: FilterType.Set
    }
  ],
  operator: 'AND',
  globalFilter: 'active',
  globalFilterFields: ['status', 'notes']
};

dataSource.setFilter(complexFilter);
```

### 6. Column Configuration

```typescript
import { ColumnFilterConfig } from '@cocokits/angular-table';

const configs: ColumnFilterConfig<User>[] = [
  {
    field: 'name',
    type: FilterType.Text,
    operators: ['contains', 'equals', 'startsWith'],
    defaultOperator: 'contains',
    caseSensitive: false,
    placeholder: 'Search names...'
  },
  {
    field: 'age',
    type: FilterType.Number,
    operators: ['equals', 'greaterThan', 'lessThan', 'between'],
    defaultOperator: 'equals'
  }
];

dataSource.setColumnConfigs(configs);
```

### 7. Custom Filter Matchers

```typescript
// Custom matcher for email domains
dataSource.setCustomMatcher('email', (item, condition) => {
  if (condition.operator === 'contains') {
    const email = item.email.toLowerCase();
    const domain = condition.value.toLowerCase();
    return email.includes(`@${domain}`);
  }
  return false;
});

// Custom global filter matcher
dataSource.setCustomGlobalMatcher((item, searchTerm, fields) => {
  // Custom search logic
  return fields.some(field => {
    const value = String(item[field]).toLowerCase();
    return value.includes(searchTerm.toLowerCase());
  });
});
```

### 8. Filter Management

```typescript
// Clear specific column filter
dataSource.clearColumnFilter('name');

// Clear all column filters
dataSource.clearAllColumnFilters();

// Clear global filter
dataSource.clearGlobalFilter();

// Clear everything
dataSource.clearAllFilters();

// Check if filters are active
const hasFilters = dataSource.hasActiveFilters();

// Get current filter state
const filterModel = dataSource.getFilterModel();

// Get filtered count
const filteredCount = dataSource.getFilteredCount(originalData);
```

## 🛠️ Utility Functions

```typescript
import { FilterUtils } from '@cocokits/angular-table';

// Auto-detect filter type
const type = FilterUtils.detectFilterType('John'); // FilterType.Text
const type2 = FilterUtils.detectFilterType(25); // FilterType.Number

// Get operator display names
const displayName = FilterUtils.getOperatorDisplayName('greaterThan'); // "Greater than"

// Generate filter options from data
const options = FilterUtils.generateFilterOptions(userData, 'department');

// Describe filter conditions
const description = FilterUtils.describeFilterCondition('age', 'greaterThan', 25);
// Output: "age Greater than "25""

// Describe complete filter model
const fullDescription = FilterUtils.describeFilterModel(filterModel);
// Output: "age Greater than "25" AND department In [Engineering, Marketing]"

// Validate filter values
const validation = FilterUtils.validateFilterValue(25, FilterType.Number, 'greaterThan');
// Output: { isValid: true }
```

## 🎨 Integration with UI Components

The filtering system is designed to work with any UI framework. Here are some integration patterns:

### With Angular Material

```typescript
// In your component
onFilterChange(column: string, value: string) {
  this.dataSource.setColumnFilter(column, 'contains', value, undefined, FilterType.Text);
}

onDateRangeChange(start: Date, end: Date) {
  this.dataSource.setColumnFilter('dateField', 'between', start, end, FilterType.Date);
}
```

### With PrimeNG

```typescript
// With PrimeNG dropdown
onDropdownChange(event: any, field: string) {
  this.dataSource.setColumnFilter(field, 'in', event.value, undefined, FilterType.Set);
}

// With PrimeNG calendar
onDateFilterChange(event: any, field: string) {
  this.dataSource.setColumnFilter(field, 'equals', event, undefined, FilterType.Date);
}
```

## 🔧 Advanced Examples

### Real-world Employee Filter

```typescript
interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number;
  startDate: Date;
  isActive: boolean;
  skills: string[];
}

class EmployeeTableComponent {
  dataSource = new TableDataSource<Employee>();
  
  setupFilters() {
    // Configure columns
    this.dataSource.setColumnConfigs([
      {
        field: 'name',
        type: FilterType.Text,
        operators: ['contains', 'startsWith', 'equals'],
        caseSensitive: false
      },
      {
        field: 'salary',
        type: FilterType.Number,
        operators: ['between', 'greaterThanOrEqual', 'lessThanOrEqual']
      },
      {
        field: 'department',
        type: FilterType.Set,
        allowedValues: ['Engineering', 'Marketing', 'Sales', 'HR']
      }
    ]);
  }

  // Filter active engineering employees with salary > 70k
  filterHighEarningEngineers() {
    this.dataSource.setFilter({
      conditions: [
        { field: 'isActive', operator: 'true', value: null, type: FilterType.Boolean },
        { field: 'department', operator: 'equals', value: 'Engineering', type: FilterType.Text },
        { field: 'salary', operator: 'greaterThan', value: 70000, type: FilterType.Number }
      ],
      operator: 'AND',
      globalFilter: ''
    });
  }

  // Search by skills (custom matcher)
  setupSkillsFilter() {
    this.dataSource.setCustomMatcher('skills', (item, condition) => {
      if (condition.operator === 'contains') {
        return item.skills.some(skill => 
          skill.toLowerCase().includes(condition.value.toLowerCase())
        );
      }
      return false;
    });
  }
}
```

## 📊 Performance Considerations

- **Reactive Updates**: Uses Angular signals for efficient change detection
- **Immutable Operations**: Filtering creates new arrays without mutating original data
- **Debounced Filtering**: Can be configured for text inputs to reduce filtering frequency
- **Memory Efficient**: Filters are applied on-demand, not pre-computed

## 🔗 API Reference

### TableDataSource Methods

| Method | Description |
|--------|-------------|
| `setColumnFilter(field, operator, value, value2?, type?)` | Set a single column filter |
| `setColumnFilters(filters)` | Set multiple column filters |
| `addFilterCondition(condition)` | Add a filter condition |
| `addColumnConditions(field, conditions, operator)` | **NEW**: Add multiple conditions to same column |
| `setColumnOperator(field, operator)` | **NEW**: Set AND/OR operator for a column |
| `removeFilterCondition(field)` | Remove filter for a field |
| `setFilter(filterModel)` | Set complete filter model |
| `setGlobalFilter(term, fields?)` | Set global search |
| `setFilterOperator(operator)` | ~~Deprecated~~: Use `setColumnOperator` instead |
| `clearColumnFilter(field)` | Clear specific column filter |
| `clearAllFilters()` | Clear all filters |
| `setColumnConfig(field, config)` | Configure a column |
| `setCustomMatcher(field, matcher)` | Set custom filter logic |
| `hasActiveFilters()` | Check if any filters active |
| `getFilterModel()` | Get current filter state |

### Filter Types

- `FilterType.Text` - String-based filtering
- `FilterType.Number` - Numeric filtering
- `FilterType.Date` - Date-based filtering
- `FilterType.Boolean` - Boolean filtering
- `FilterType.Set` - Multi-value filtering

### Filter Operators

See the complete list in the [Filter Types documentation](./filter.types.ts).

## 📋 Advanced Examples

For comprehensive examples of the new column-based AND/OR filtering, see:
- **[Advanced Filtering Examples](./src/lib/advanced-filtering-examples.ts)** - Complete examples with complex scenarios
- **[Basic Examples](./src/lib/examples.ts)** - Simple usage patterns and getting started guide

The advanced examples demonstrate:
- Age ranges with OR logic (young OR experienced employees)
- Department filtering with multiple values  
- Complex multi-column combinations
- Salary ranges with OR conditions
- Global filtering combined with column filters
- Backwards compatibility patterns

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@cocokits.com
- 💬 Discord: [Join our community](https://discord.gg/cocokits)
- 📖 Documentation: [docs.cocokits.com](https://docs.cocokits.com)
- 🐛 Issues: [GitHub Issues](https://github.com/coco-kits/cocokits/issues)

---

Built with ❤️ by the Cocokits Team
