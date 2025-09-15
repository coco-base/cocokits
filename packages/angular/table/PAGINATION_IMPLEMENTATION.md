# TableDataSource Pagination Implementation

## 🎯 Overview

Pagination has been successfully implemented in the `TableDataSource` class, providing comprehensive page navigation and data management capabilities that integrate seamlessly with existing filtering and sorting features.

## 📦 New Types and Interfaces

### PaginationModel
```typescript
interface PaginationModel {
  page: number;        // Current page index (0-based)
  pageSize: number;    // Number of items per page
  totalItems: number;  // Total number of items (after filtering)
  totalPages: number;  // Total number of pages (calculated)
}
```

### PaginationInfo
```typescript
interface PaginationInfo {
  currentPage: number;    // Current page (1-based for display)
  pageSize: number;       // Items per page
  totalItems: number;     // Total items count
  totalPages: number;     // Total pages count
  startIndex: number;     // Start index of current page items (1-based)
  endIndex: number;       // End index of current page items (1-based)
  hasPrevious: boolean;   // Whether there's a previous page
  hasNext: boolean;       // Whether there's a next page
}
```

## 🔧 New Properties

### Pagination State
- `pagination: Signal<PaginationModel>` - Core pagination state
- `pageSizeOptions: Signal<readonly number[]>` - Available page size options

### Computed Data Properties
- `filteredSortedData: Signal<T[]>` - Data after filtering and sorting (before pagination)
- `paginationModel: Signal<PaginationModel>` - Computed pagination state with updated totals
- `data: Signal<T[]>` - Final paginated data for display

## 🚀 New Methods

### Basic Pagination Control
```typescript
setPagination(page: number, pageSize: number): void
setPage(page: number): void
setPageSize(pageSize: number): void
resetPagination(): void
```

### Navigation Methods
```typescript
nextPage(): void
previousPage(): void
firstPage(): void
lastPage(): void
```

### Configuration Methods
```typescript
setPageSizeOptions(options: readonly number[]): void
```

### State Query Methods
```typescript
getPaginationModel(): PaginationModel
getPaginationInfo(): PaginationInfo
canGoNext(): boolean
canGoPrevious(): boolean
isPaginationNeeded(): boolean
getTotalItems(): number
```

## 🔄 Data Flow

```
Raw Data → Filtering → Sorting → Pagination Calculation (Computed) → Paginated Data
```

1. **Raw Data**: Original data set
2. **Filtering**: Apply column and global filters (computed)
3. **Sorting**: Apply sort configuration (computed)
4. **Pagination Calculation**: Compute total counts and page limits (computed)
5. **Paginated Data**: Extract current page slice (computed)

## ⚡ Smart Behaviors

### Auto-Reset on Data Changes
- **Filter Changes**: Reset to page 0, recalculate totals
- **Data Changes**: Reset to page 0, recalculate totals
- **Clear All Filters**: Reset to page 0

### Intelligent Page Size Changes
- When page size changes, attempts to keep user viewing similar data position
- Automatically adjusts current page if it becomes invalid

### Edge Case Handling
- Prevents negative page numbers
- Handles empty data sets gracefully
- Ensures page doesn't exceed total pages
- Manages single-page scenarios

## 📊 Default Configuration

```typescript
const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
```

## 🎮 Usage Examples

### Basic Setup
```typescript
const dataSource = new TableDataSource<User>();
dataSource.setData(users);
dataSource.setPageSize(25);
```

### Navigation
```typescript
dataSource.nextPage();
dataSource.setPage(2);
dataSource.lastPage();
```

### Get Current State
```typescript
const info = dataSource.getPaginationInfo();
console.log(`Showing ${info.startIndex}-${info.endIndex} of ${info.totalItems}`);
```

### With Filtering
```typescript
dataSource.setColumnFilter('status', 'equals', 'active');
// Pagination automatically resets to first page
const filteredData = dataSource.data(); // Gets paginated, filtered data
```

## 🔗 Integration Points

### Computed Properties
- `filteredSortedData()` - Triggers reactive filtering and sorting
- `paginationModel()` - Automatically calculates pagination totals
- `data()` - Returns final paginated slice

### Filter Integration
- All filter methods now call `resetPagination()` when filters change
- Filtering automatically recalculates pagination totals

### Sort Integration
- Sorting preserves current page if still valid
- No automatic reset (user stays on same page)

## 📝 Method Integration

### Updated Existing Methods
- `clearAllFilters()` - Now resets pagination
- `setGlobalFilter()` - Now resets pagination  
- `addFilterCondition()` - Now resets pagination
- `setData()` - Now resets pagination

### New Private Methods
- `applyPagination()` - Slices data for current page

### Removed Methods
- `updatePaginationTotals()` - No longer needed (handled by computed signals)

## 🎯 Key Features

1. **Zero-based internal indexing** with 1-based display values
2. **Automatic recalculation** of totals when data changes
3. **Smart page preservation** during page size changes
4. **Integrated reset behavior** with filtering operations
5. **Comprehensive state information** for UI components
6. **Flexible page size options** with defaults
7. **Navigation state helpers** for UI controls
8. **Type-safe implementation** with full TypeScript support

## 📁 Files Modified

1. `filter.types.ts` - Added pagination interfaces and constants
2. `table-data-source.store.ts` - Implemented pagination functionality  
3. `pagination-examples.ts` - Created comprehensive examples
4. `index.ts` - Updated exports

The pagination implementation provides a complete, production-ready solution that maintains consistency with the existing TableDataSource API patterns while adding powerful page navigation capabilities.
