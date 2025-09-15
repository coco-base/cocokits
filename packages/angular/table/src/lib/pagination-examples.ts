/* eslint-disable */
import { TableDataSource } from './table-data-source.store';

/**
 * Example demonstrating pagination usage with TableDataSource
 */
export class PaginationExamples {
  /**
   * Basic pagination setup example
   */
  static basicPaginationExample(): TableDataSource<any> {
    interface User {
      id: number;
      name: string;
      email: string;
      age: number;
    }

    const dataSource = new TableDataSource<User>();

    // Sample data
    const users: User[] = Array.from({ length: 250 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: 20 + (i % 50),
    }));

    // Set data
    dataSource.setData(users);

    // Basic pagination operations
    console.log('=== Basic Pagination Example ===');

    // Set page size to 25
    dataSource.setPageSize(25);
    console.log('Page size set to 25');
    console.log('Pagination info:', dataSource.getPaginationInfo());

    // Navigate to page 2
    dataSource.setPage(1); // 0-based indexing
    console.log('Navigated to page 2');
    console.log('Current page data:', dataSource.data());

    // Go to next page
    dataSource.nextPage();
    console.log('Went to next page');
    console.log('Pagination info:', dataSource.getPaginationInfo());

    // Go to last page
    dataSource.lastPage();
    console.log('Went to last page');
    console.log('Pagination info:', dataSource.getPaginationInfo());

    return dataSource;
  }

  /**
   * Pagination with filtering example
   */
  static paginationWithFilteringExample(): TableDataSource<any> {
    interface Product {
      id: number;
      name: string;
      category: string;
      price: number;
      inStock: boolean;
    }

    const dataSource = new TableDataSource<Product>();

    // Sample data
    const products: Product[] = Array.from({ length: 500 }, (_, i) => ({
      id: i + 1,
      name: `Product ${i + 1}`,
      category: ['Electronics', 'Clothing', 'Books', 'Home'][i % 4],
      price: Math.floor(Math.random() * 1000) + 10,
      inStock: Math.random() > 0.3,
    }));

    dataSource.setData(products);
    dataSource.setPageSize(20);

    console.log('=== Pagination with Filtering Example ===');
    console.log('Initial pagination info:', dataSource.getPaginationInfo());

    // Apply filter - this will reset pagination to first page
    dataSource.setColumnFilter('category', 'equals', 'Electronics');
    console.log('Filtered by Electronics category');
    console.log('Pagination info after filter:', dataSource.getPaginationInfo());
    console.log('Filtered data count:', dataSource.getTotalItems());

    // Navigate through filtered results
    if (dataSource.canGoNext()) {
      dataSource.nextPage();
      console.log('Went to next page of filtered results');
      console.log('Current pagination info:', dataSource.getPaginationInfo());
    }

    // Apply global filter
    dataSource.setGlobalFilter('Product 1', ['name']);
    console.log('Applied global filter for "Product 1"');
    console.log('Pagination info after global filter:', dataSource.getPaginationInfo());

    return dataSource;
  }

  /**
   * Advanced pagination configuration example
   */
  static advancedPaginationExample(): TableDataSource<any> {
    interface Order {
      id: number;
      customerName: string;
      orderDate: Date;
      amount: number;
      status: 'pending' | 'completed' | 'cancelled';
    }

    const dataSource = new TableDataSource<Order>();

    // Sample data
    const orders: Order[] = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      customerName: `Customer ${i + 1}`,
      orderDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      amount: Math.floor(Math.random() * 5000) + 100,
      status: ['pending', 'completed', 'cancelled'][Math.floor(Math.random() * 3)] as any,
    }));

    dataSource.setData(orders);

    console.log('=== Advanced Pagination Example ===');

    // Set custom page size options
    dataSource.setPageSizeOptions([5, 10, 25, 50, 100]);
    console.log('Custom page size options set');

    // Start with small page size
    dataSource.setPageSize(10);
    console.log('Page size set to 10');
    console.log('Pagination info:', dataSource.getPaginationInfo());

    // Sort by amount (descending) - pagination should be preserved if valid
    dataSource.setSort('amount', 'desc');
    console.log('Sorted by amount (desc)');
    console.log('Top orders:', dataSource.data());

    // Change page size - should attempt to keep user at similar position
    const currentInfo = dataSource.getPaginationInfo();
    console.log(`Before page size change - viewing items ${currentInfo.startIndex}-${currentInfo.endIndex}`);

    dataSource.setPageSize(25);
    const newInfo = dataSource.getPaginationInfo();
    console.log(`After page size change - viewing items ${newInfo.startIndex}-${newInfo.endIndex}`);

    // Demonstrate pagination helpers
    console.log('Can go previous:', dataSource.canGoPrevious());
    console.log('Can go next:', dataSource.canGoNext());
    console.log('Is pagination needed:', dataSource.isPaginationNeeded());

    return dataSource;
  }

  /**
   * Pagination state management example
   */
  static paginationStateExample(): TableDataSource<any> {
    interface Task {
      id: number;
      title: string;
      priority: 'low' | 'medium' | 'high';
      completed: boolean;
    }

    const dataSource = new TableDataSource<Task>();

    const tasks: Task[] = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      title: `Task ${i + 1}`,
      priority: ['low', 'medium', 'high'][i % 3] as any,
      completed: Math.random() > 0.6,
    }));

    dataSource.setData(tasks);
    dataSource.setPageSize(15);

    console.log('=== Pagination State Management Example ===');

    // Get current state
    const paginationModel = dataSource.getPaginationModel();
    console.log('Current pagination model:', paginationModel);

    // Save state
    const savedState = {
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
    };

    // Navigate around
    dataSource.setPage(3);
    dataSource.setPageSize(20);
    console.log('Changed pagination state');
    console.log('New state:', dataSource.getPaginationModel());

    // Restore state
    dataSource.setPagination(savedState.page, savedState.pageSize);
    console.log('Restored pagination state');
    console.log('Restored state:', dataSource.getPaginationModel());

    // Clear all filters and reset pagination
    dataSource.clearAllFilters(); // This also resets pagination
    console.log('Cleared filters and reset pagination');
    console.log('Final state:', dataSource.getPaginationModel());

    return dataSource;
  }
}

/**
 * Demonstrate all pagination features
 */
export function demonstratePagination(): void {
  console.log('🔄 TableDataSource Pagination Examples\n');

  PaginationExamples.basicPaginationExample();
  console.log('\n');

  PaginationExamples.paginationWithFilteringExample();
  console.log('\n');

  PaginationExamples.advancedPaginationExample();
  console.log('\n');

  PaginationExamples.paginationStateExample();
  console.log('\n✅ All pagination examples completed!');
}
