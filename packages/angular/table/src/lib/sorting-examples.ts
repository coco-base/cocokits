/* eslint-disable */
import { TableDataSource } from './table-data-source.store';
import { SortDirection } from './filter.types';

/**
 * Example demonstrating enhanced sorting functionality with TableDataSource
 */
export class SortingExamples {
  /**
   * Basic single-column sorting example
   */
  static basicSortingExample(): TableDataSource<any> {
    interface Product {
      id: number;
      name: string;
      price: number;
      category: string;
      inStock: boolean;
      releaseDate: Date;
    }

    const dataSource = new TableDataSource<Product>();

    // Sample data
    const products: Product[] = [
      {
        id: 1,
        name: 'Laptop Pro',
        price: 1299,
        category: 'Electronics',
        inStock: true,
        releaseDate: new Date('2024-01-15'),
      },
      { id: 2, name: 'Coffee Mug', price: 15, category: 'Home', inStock: false, releaseDate: new Date('2023-06-20') },
      {
        id: 3,
        name: 'Wireless Mouse',
        price: 45,
        category: 'Electronics',
        inStock: true,
        releaseDate: new Date('2024-03-10'),
      },
      {
        id: 4,
        name: 'Desk Chair',
        price: 199,
        category: 'Furniture',
        inStock: true,
        releaseDate: new Date('2023-11-05'),
      },
      {
        id: 5,
        name: 'Programming Book',
        price: 39,
        category: 'Books',
        inStock: true,
        releaseDate: new Date('2024-02-28'),
      },
    ];

    dataSource.setData(products);

    console.log('=== Basic Single-Column Sorting Example ===');

    // Sort by name ascending
    dataSource.setSort('name', 'asc');
    console.log(
      'Sorted by name (asc):',
      dataSource.data().map((p) => p.name)
    );

    // Sort by price descending
    dataSource.setSort('price', 'desc');
    console.log(
      'Sorted by price (desc):',
      dataSource.data().map((p) => ({ name: p.name, price: p.price }))
    );

    // Sort by date ascending
    dataSource.setSort('releaseDate', 'asc');
    console.log(
      'Sorted by release date (asc):',
      dataSource.data().map((p) => ({ name: p.name, date: p.releaseDate.toISOString().split('T')[0] }))
    );

    // Clear sorting
    dataSource.clearSort();
    console.log(
      'No sorting applied:',
      dataSource.data().map((p) => p.name)
    );

    return dataSource;
  }

  /**
   * Multi-column sorting example
   */
  static multiColumnSortingExample(): TableDataSource<any> {
    interface Employee {
      id: number;
      firstName: string;
      lastName: string;
      department: string;
      salary: number;
      hireDate: Date;
      level: 'Junior' | 'Mid' | 'Senior' | 'Lead';
    }

    const dataSource = new TableDataSource<Employee>();

    // Sample data with employees
    const employees: Employee[] = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Smith',
        department: 'Engineering',
        salary: 85000,
        hireDate: new Date('2022-01-15'),
        level: 'Mid',
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        department: 'Engineering',
        salary: 95000,
        hireDate: new Date('2021-06-20'),
        level: 'Senior',
      },
      {
        id: 3,
        firstName: 'Alice',
        lastName: 'Johnson',
        department: 'Marketing',
        salary: 70000,
        hireDate: new Date('2023-03-10'),
        level: 'Junior',
      },
      {
        id: 4,
        firstName: 'Bob',
        lastName: 'Johnson',
        department: 'Engineering',
        salary: 120000,
        hireDate: new Date('2020-11-05'),
        level: 'Lead',
      },
      {
        id: 5,
        firstName: 'Charlie',
        lastName: 'Brown',
        department: 'Marketing',
        salary: 65000,
        hireDate: new Date('2023-08-15'),
        level: 'Junior',
      },
      {
        id: 6,
        firstName: 'David',
        lastName: 'Wilson',
        department: 'Sales',
        salary: 75000,
        hireDate: new Date('2022-09-20'),
        level: 'Mid',
      },
    ];

    dataSource.setData(employees);

    console.log('=== Multi-Column Sorting Example ===');

    // Enable multi-column sorting
    dataSource.setMultiSortEnabled(true);

    // Sort by department first, then by salary within each department
    dataSource.addSort('department', 'asc', 0);
    dataSource.addSort('salary', 'desc', 1);

    console.log('Sorted by department (asc), then salary (desc):');
    dataSource.data().forEach((emp) => {
      console.log(`  ${emp.department} - ${emp.firstName} ${emp.lastName}: $${emp.salary}`);
    });

    // Add a third sort level by last name
    dataSource.addSort('lastName', 'asc', 2);

    console.log('\nWith additional sort by lastName (asc):');
    dataSource.data().forEach((emp) => {
      console.log(`  ${emp.department} - ${emp.lastName}, ${emp.firstName}: $${emp.salary}`);
    });

    // Toggle sort for a specific column
    dataSource.toggleSort('level', true); // Multi-sort mode

    console.log('\nAfter adding level sort:');
    const sortInfo = dataSource.getSortInfo();
    console.log('Current sorts:', sortInfo.sorts.map((s) => `${String(s.field)}(${s.direction})`).join(', '));

    return dataSource;
  }

  /**
   * Custom sorting with comparators example
   */
  static customSortingExample(): TableDataSource<any> {
    interface Task {
      id: number;
      title: string;
      priority: 'Low' | 'Medium' | 'High' | 'Critical';
      status: 'Todo' | 'InProgress' | 'Review' | 'Done';
      assignee: string;
      estimatedHours: number;
    }

    const dataSource = new TableDataSource<Task>();

    // Sample tasks
    const tasks: Task[] = [
      { id: 1, title: 'Fix login bug', priority: 'High', status: 'InProgress', assignee: 'John', estimatedHours: 4 },
      { id: 2, title: 'Update documentation', priority: 'Low', status: 'Todo', assignee: 'Jane', estimatedHours: 8 },
      { id: 3, title: 'Add new feature', priority: 'Medium', status: 'Review', assignee: 'Bob', estimatedHours: 16 },
      { id: 4, title: 'Security audit', priority: 'Critical', status: 'Todo', assignee: 'Alice', estimatedHours: 12 },
      {
        id: 5,
        title: 'Performance optimization',
        priority: 'High',
        status: 'Done',
        assignee: 'Charlie',
        estimatedHours: 6,
      },
    ];

    dataSource.setData(tasks);

    console.log('=== Custom Sorting Example ===');

    // Define custom priority order
    const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };

    // Set custom comparator for priority
    dataSource.setCustomComparator('priority', (a, b, field, direction) => {
      const aValue = priorityOrder[a[field] as keyof typeof priorityOrder];
      const bValue = priorityOrder[b[field] as keyof typeof priorityOrder];
      const comparison = aValue - bValue;
      return direction === 'desc' ? -comparison : comparison;
    });

    // Define custom status order
    const statusOrder = { Todo: 0, InProgress: 1, Review: 2, Done: 3 };

    // Set custom comparator for status
    dataSource.setCustomComparator('status', (a, b, field, direction) => {
      const aValue = statusOrder[a[field] as keyof typeof statusOrder];
      const bValue = statusOrder[b[field] as keyof typeof statusOrder];
      const comparison = aValue - bValue;
      return direction === 'desc' ? -comparison : comparison;
    });

    // Sort by priority (Critical first)
    dataSource.setSort('priority', 'asc');
    console.log('Sorted by priority (Critical -> High -> Medium -> Low):');
    dataSource.data().forEach((task) => {
      console.log(`  ${task.priority} - ${task.title}`);
    });

    // Multi-sort: priority first, then status
    dataSource.setMultiSortEnabled(true);
    dataSource.setSorts([
      { field: 'priority', direction: 'asc', priority: 0 },
      { field: 'status', direction: 'asc', priority: 1 },
    ]);

    console.log('\nSorted by priority, then status:');
    dataSource.data().forEach((task) => {
      console.log(`  ${task.priority} | ${task.status} - ${task.title}`);
    });

    return dataSource;
  }

  /**
   * Sort toggling and state management example
   */
  static sortStateManagementExample(): TableDataSource<any> {
    interface Order {
      id: number;
      customerName: string;
      orderDate: Date;
      amount: number;
      status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
    }

    const dataSource = new TableDataSource<Order>();

    const orders: Order[] = [
      {
        id: 1001,
        customerName: 'Alice Johnson',
        orderDate: new Date('2024-01-15'),
        amount: 299.99,
        status: 'Delivered',
      },
      { id: 1002, customerName: 'Bob Smith', orderDate: new Date('2024-01-16'), amount: 149.5, status: 'Shipped' },
      {
        id: 1003,
        customerName: 'Charlie Brown',
        orderDate: new Date('2024-01-14'),
        amount: 599.0,
        status: 'Processing',
      },
      { id: 1004, customerName: 'Diana Wilson', orderDate: new Date('2024-01-17'), amount: 89.99, status: 'Pending' },
    ];

    dataSource.setData(orders);

    console.log('=== Sort State Management Example ===');

    // Test single-column toggle behavior
    console.log('Testing single-column sort toggling:');

    // First toggle: none -> asc
    dataSource.toggleSort('amount', false);
    console.log('1st toggle (none -> asc):', dataSource.getColumnSort('amount')?.direction);

    // Second toggle: asc -> desc
    dataSource.toggleSort('amount', false);
    console.log('2nd toggle (asc -> desc):', dataSource.getColumnSort('amount')?.direction);

    // Third toggle: desc -> none
    dataSource.toggleSort('amount', false);
    console.log('3rd toggle (desc -> none):', dataSource.getColumnSort('amount')?.direction || 'none');

    // Test multi-column toggle behavior
    console.log('\nTesting multi-column sort toggling:');
    dataSource.setMultiSortEnabled(true);

    dataSource.toggleSort('customerName', true); // Add first sort
    dataSource.toggleSort('amount', true); // Add second sort

    console.log('After adding two sorts:');
    dataSource.getSortInfo().sorts.forEach((sort, index) => {
      console.log(`  Priority ${index}: ${String(sort.field)} (${sort.direction})`);
    });

    // Test sort state queries
    console.log('\nSort state queries:');
    console.log('Is customerName sorted?', dataSource.isColumnSorted('customerName'));
    console.log('Is orderDate sorted?', dataSource.isColumnSorted('orderDate'));
    console.log('CustomerName sort priority:', dataSource.getColumnSortPriority('customerName'));
    console.log('Amount sort priority:', dataSource.getColumnSortPriority('amount'));
    console.log('Has active sorts?', dataSource.hasActiveSorts());

    // Save and restore sort state
    const savedSorts = dataSource.getSortModel();
    console.log('\nSaved sort state:', savedSorts);

    dataSource.clearSort();
    console.log('After clearing sorts:', dataSource.getSortInfo().sorts.length);

    dataSource.setSorts(savedSorts.sorts);
    console.log('After restoring sorts:', dataSource.getSortInfo().sorts.length);

    return dataSource;
  }

  /**
   * Column sort configuration example
   */
  static columnSortConfigExample(): TableDataSource<any> {
    interface User {
      id: number;
      username: string;
      email: string;
      lastLogin: Date | null;
      isActive: boolean;
      role: 'Admin' | 'User' | 'Guest';
    }

    const dataSource = new TableDataSource<User>();

    const users: User[] = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        lastLogin: new Date('2024-01-17'),
        isActive: true,
        role: 'Admin',
      },
      { id: 2, username: 'john_doe', email: 'john@example.com', lastLogin: null, isActive: false, role: 'User' },
      {
        id: 3,
        username: 'jane_smith',
        email: 'jane@example.com',
        lastLogin: new Date('2024-01-16'),
        isActive: true,
        role: 'User',
      },
      {
        id: 4,
        username: 'guest_user',
        email: 'guest@example.com',
        lastLogin: new Date('2024-01-15'),
        isActive: true,
        role: 'Guest',
      },
    ];

    dataSource.setData(users);

    console.log('=== Column Sort Configuration Example ===');

    // Configure column sort settings
    dataSource.setColumnSortConfigs([
      { field: 'id', sortable: false }, // ID column not sortable
      { field: 'username', sortable: true, defaultDirection: 'asc' },
      { field: 'email', sortable: true, defaultDirection: 'asc' },
      { field: 'lastLogin', sortable: true, defaultDirection: 'desc' },
      { field: 'isActive', sortable: true, defaultDirection: 'desc' },
      { field: 'role', sortable: true, defaultDirection: 'asc' },
    ]);

    // Test sortable checks
    console.log('Column sortability:');
    (['id', 'username', 'email', 'lastLogin', 'isActive', 'role'] as (keyof User)[]).forEach((field) => {
      console.log(`  ${String(field)}: ${dataSource.isColumnSortable(field)}`);
    });

    // Custom comparator for handling null lastLogin values
    dataSource.setCustomComparator('lastLogin', (a, b, field, direction) => {
      const aValue = a[field];
      const bValue = b[field];

      // Handle null values (put them at the end)
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const comparison = (aValue as Date).getTime() - (bValue as Date).getTime();
      return direction === 'desc' ? -comparison : comparison;
    });

    // Sort by lastLogin to see custom null handling
    dataSource.setSort('lastLogin', 'desc');
    console.log('\nSorted by lastLogin (desc, nulls last):');
    dataSource.data().forEach((user) => {
      const loginDate = user.lastLogin ? user.lastLogin.toISOString().split('T')[0] : 'Never';
      console.log(`  ${user.username}: ${loginDate}`);
    });

    return dataSource;
  }
}

/**
 * Demonstrate all sorting features
 */
export function demonstrateSorting(): void {
  console.log('🔄 TableDataSource Enhanced Sorting Examples\n');

  SortingExamples.basicSortingExample();
  console.log('\n');

  SortingExamples.multiColumnSortingExample();
  console.log('\n');

  SortingExamples.customSortingExample();
  console.log('\n');

  SortingExamples.sortStateManagementExample();
  console.log('\n');

  SortingExamples.columnSortConfigExample();
  console.log('\n✅ All sorting examples completed!');
}
