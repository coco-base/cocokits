# Enhanced Sorting Implementation

## 🎯 Overview

The `TableDataSource` sorting functionality has been completely enhanced to support both single and multi-column sorting with advanced features including custom comparators, sort priorities, and flexible configuration options.

## 📦 New Types and Interfaces

### Core Sorting Types
```typescript
type SortDirection = 'asc' | 'desc';

interface SortConfig<T> {
  field: keyof T;           // Field to sort by
  direction: SortDirection; // Sort direction
  priority?: number;        // Sort priority for multi-column sorting
}

interface SortModel<T> {
  sorts: SortConfig<T>[];   // Array of sort configurations ordered by priority
}
```

### Display and Configuration Types
```typescript
interface SortInfo<T> {
  sorts: SortConfig<T>[];         // Current sort configurations
  isMultiSort: boolean;           // Whether multi-column sorting is enabled
  primarySort?: SortConfig<T>;    // Primary sort field (first in the list)
}

interface ColumnSortConfig<T> {
  field: keyof T;                    // Field name
  comparator?: SortComparator<T>;    // Custom comparator function
  sortable?: boolean;                // Whether this column is sortable
  defaultDirection?: SortDirection;  // Default sort direction when first clicked
}

type SortComparator<T> = (
  a: T,
  b: T,
  field: keyof T,
  direction: SortDirection
) => number;
```

## 🔧 New Properties

### Sorting State
- `sortModel: Signal<SortModel<T>>` - Core multi-sort state
- `multiSortEnabled: Signal<boolean>` - Multi-sort mode toggle
- `columnSortConfigs: Signal<Map<keyof T, ColumnSortConfig<T>>>` - Column configurations
- `customComparators: Signal<Map<keyof T, SortComparator<T>>>` - Custom sort functions

## 🚀 Enhanced Methods

### Core Sorting Control
```typescript
setSort(field: keyof T, direction: SortDirection): void          // Single column sort
addSort(field: keyof T, direction: SortDirection, priority?: number): void  // Add to multi-sort
toggleSort(field: keyof T, multiSort?: boolean): void           // Toggle sort state
removeSort(field: keyof T): void                                // Remove specific sort
clearSort(): void                                               // Clear all sorts
setSorts(sorts: SortConfig<T>[]): void                         // Set multiple sorts
```

### Multi-Sort Management
```typescript
setMultiSortEnabled(enabled: boolean): void                     // Enable/disable multi-sort
getColumnSort(field: keyof T): SortConfig<T> | undefined       // Get column sort config
isColumnSorted(field: keyof T): boolean                        // Check if column is sorted
getColumnSortPriority(field: keyof T): number | undefined      // Get sort priority
```

### Configuration Methods
```typescript
setColumnSortConfig(field: keyof T, config: ColumnSortConfig<T>): void
setColumnSortConfigs(configs: ColumnSortConfig<T>[]): void
getColumnSortConfig(field: keyof T): ColumnSortConfig<T> | undefined
setCustomComparator(field: keyof T, comparator: SortComparator<T>): void
isColumnSortable(field: keyof T): boolean
```

### State Query Methods
```typescript
getSortModel(): SortModel<T>                                   // Get current sort state
getSortInfo(): SortInfo<T>                                     // Get display information
hasActiveSorts(): boolean                                      // Check if any sorts active
```

## 🔄 Enhanced Data Flow

```
Raw Data → Filtering → Multi-Column Sorting → Pagination → Display Data
```

### Multi-Column Sort Process:
1. **Primary Sort**: First sort configuration (priority 0)
2. **Secondary Sort**: Applied when primary values are equal
3. **Tertiary Sort**: Applied when primary and secondary are equal
4. **Continue...**: Up to N sort levels

## ⚡ Smart Features

### Toggle Behavior
**Single Sort Mode**: `none → asc → desc → none`
**Multi Sort Mode**: `none → asc → desc → remove`

### Automatic Priority Management
- Sorts are automatically ordered by priority
- Adding new sorts assigns next available priority
- Priorities are reassigned when sorts are removed

### Intelligent Type Detection
- **Strings**: Case-insensitive locale comparison
- **Numbers**: Numeric comparison
- **Dates**: Timestamp comparison
- **Generic**: String conversion with locale comparison

## 🎮 Usage Examples

### Basic Single-Column Sorting
```typescript
const dataSource = new TableDataSource<Product>();

// Set single sort
dataSource.setSort('name', 'asc');

// Toggle sort (cycles through states)
dataSource.toggleSort('price', false);
```

### Multi-Column Sorting
```typescript
// Enable multi-sort mode
dataSource.setMultiSortEnabled(true);

// Add multiple sorts
dataSource.addSort('category', 'asc', 0);    // Primary sort
dataSource.addSort('price', 'desc', 1);      // Secondary sort
dataSource.addSort('name', 'asc', 2);        // Tertiary sort

// Or set all at once
dataSource.setSorts([
  { field: 'category', direction: 'asc', priority: 0 },
  { field: 'price', direction: 'desc', priority: 1 },
  { field: 'name', direction: 'asc', priority: 2 }
]);
```

### Custom Comparators
```typescript
// Custom priority sorting
const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };

dataSource.setCustomComparator('priority', (a, b, field, direction) => {
  const aValue = priorityOrder[a[field]];
  const bValue = priorityOrder[b[field]];
  const comparison = aValue - bValue;
  return direction === 'desc' ? -comparison : comparison;
});
```

### Column Configuration
```typescript
// Configure sortable columns
dataSource.setColumnSortConfigs([
  { field: 'id', sortable: false },                    // Not sortable
  { field: 'name', sortable: true, defaultDirection: 'asc' },
  { field: 'date', sortable: true, defaultDirection: 'desc' }
]);

// Check if column is sortable
if (dataSource.isColumnSortable('name')) {
  dataSource.toggleSort('name', true);
}
```

## 🔗 Integration with Filtering and Pagination

### Preserved Behavior
- **Filtering Changes**: Sorts are preserved when filters change
- **Data Changes**: Sorts are preserved when data is updated
- **Pagination**: Sorting is applied before pagination

### Reset Behavior
- **Clear All Filters**: Sorts are preserved (independent operation)
- **Sort Changes**: Pagination resets to first page

## 📊 Sort State Information

### Display Information
```typescript
const sortInfo = dataSource.getSortInfo();
// {
//   sorts: [
//     { field: 'category', direction: 'asc', priority: 0 },
//     { field: 'price', direction: 'desc', priority: 1 }
//   ],
//   isMultiSort: true,
//   primarySort: { field: 'category', direction: 'asc', priority: 0 }
// }
```

### Column-Specific Information
```typescript
const isNameSorted = dataSource.isColumnSorted('name');
const nameSortConfig = dataSource.getColumnSort('name');
const namePriority = dataSource.getColumnSortPriority('name');
```

## 🎯 Key Features

1. **Multi-Column Support**: Sort by multiple columns with automatic priority management
2. **Smart Toggle Behavior**: Intuitive cycling through sort states
3. **Custom Comparators**: Define custom sorting logic for specific data types
4. **Type-Aware Sorting**: Intelligent handling of strings, numbers, dates, and null values
5. **Column Configuration**: Control sortability and default behavior per column
6. **State Management**: Complete sort state persistence and restoration
7. **Integration**: Seamless integration with existing filtering and pagination
8. **Performance**: Efficient multi-column comparison with early termination

## 🔄 Migration from Old Sorting

### Old API (Single Column)
```typescript
dataSource.setSort('name', 'asc');         // ✅ Still works
dataSource.clearSort();                    // ✅ Still works
const sortState = dataSource.getSortModel(); // ⚠️ Returns SortModel now
```

### New API (Enhanced)
```typescript
// Multi-column support
dataSource.setMultiSortEnabled(true);
dataSource.addSort('category', 'asc');
dataSource.addSort('name', 'desc');

// Advanced features
dataSource.setCustomComparator('priority', customComparator);
dataSource.toggleSort('price', true); // Multi-sort mode
```

## 📁 Files Modified

1. `filter.types.ts` - Added comprehensive sorting type definitions
2. `table-data-source.store.ts` - Implemented enhanced sorting functionality
3. `sorting-examples.ts` - Created comprehensive usage examples
4. `index.ts` - Updated exports

The enhanced sorting implementation provides enterprise-level sorting capabilities while maintaining backward compatibility and following the established patterns of the existing codebase.
