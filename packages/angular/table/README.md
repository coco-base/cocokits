# 📊 Cocokits Angular Table

A powerful, type-safe table component with advanced filtering capabilities for Angular applications.

## ✨ Features

- **🔍 Advanced Filtering System**: Comprehensive filtering with multiple operators and data types
- **📱 Reactive Data Management**: Built with Angular signals for optimal performance
- **🎯 Type Safety**: Full TypeScript support with generics
- **🎨 Flexible Styling**: Customizable grid lines, striped rows, and hover effects
- **🔧 Easy Integration**: Simple API that works with any UI framework

## 🚀 Quick Start

```typescript
import { TableComponent, TableDataSource } from '@cocokits/angular-table';

@Component({
  selector: 'app-example',
  template: `
    <cck-table [data]="users()">
      <ng-template #tableHeader>
        <!-- Your header template -->
      </ng-template>
      <ng-template #tableBody let-user>
        <!-- Your body template -->
      </ng-template>
    </cck-table>
  `
})
export class ExampleComponent {
  users = signal([
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 }
  ]);
}
```

## 📖 Documentation

- **[Complete Filtering Guide](./FILTERING.md)** - Comprehensive documentation for the filtering system
- **[API Reference](./src/lib/index.ts)** - TypeScript definitions and interfaces
- **[Examples](./src/lib/examples.ts)** - Practical usage examples

## 🔍 Filtering System

The table includes a powerful filtering system inspired by PrimeNG and AgGrid:

```typescript
const dataSource = new TableDataSource<User>();

// Simple filters
dataSource.setColumnFilter('name', 'contains', 'John');
dataSource.setColumnFilter('age', 'greaterThan', 25);

// Complex filters with multiple conditions
dataSource.addFilterCondition({
  field: 'department',
  operator: 'in',
  value: ['Engineering', 'Marketing'],
  type: FilterType.Set
});

// Global search
dataSource.setGlobalFilter('search term', ['name', 'email']);
```

**Supported Filter Types:**
- Text (contains, equals, startsWith, etc.)
- Number (equals, greaterThan, between, etc.)  
- Date (before, after, between, etc.)
- Boolean (true, false, blank)
- Set (in, notIn for multi-select)

## 📦 Installation

```bash
npm install @cocokits/angular-table
```

## 🤝 Contributing

We welcome contributions! Please check our [Contributing Guide](../../CONTRIBUTING.md).

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.
