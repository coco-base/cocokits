import { Component, inject } from '@angular/core';
import {
  DataSource,
  DataSourceFilterBooleanMatchTypeList,
  DataSourceFilterGroup,
  DataSourceFilterDateCondition,
  DataSourceFilterDateMatchTypeList,
  DataSourceFilterMatchType,
  DataSourceFilterNumberCondition,
  DataSourceFilterNumberMatchTypeList,
  DataSourceFilterOperator,
  DataSourceFilterTextCondition,
  DataSourceFilterTextMatchTypeList,
  DataSourceFilterType,
} from '@cocokits/common-utils';
import { TableDataSource } from '../table.tokes';
import { toSignal } from '@angular/core/rxjs-interop';
import { Icons } from '@cocokits/common-icons';
import { NgTemplateOutlet, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'cck-column-advanced-filter-overlay',
  imports: [UpperCasePipe, NgTemplateOutlet],
  template: `
    <h4>Advanced Filter</h4>
    
    <div class="root-condition-group">
      <ng-container
        *ngTemplateOutlet="conditionGroupTemplate; context: { $implicit: conditionGroup, level: 1, parent: null, index: -1 }"></ng-container>
    </div>

    <ng-template #conditionGroupTemplate let-group let-level="level" let-parent="parent" let-index="index">
      <div class="condition-group" [style.--cck-advanced-filter-indent]="level">
        <!-- Operator Selection -->
        <!-- DONE: cck-table-advanced-filter-operator-selector -->
        <div class="operator-select">
          <select [value]="group.operator" (change)="updateGroupOperator(group, $event)">
            @for (operator of DataSourceFilterOperator; track operator) {
              <option [value]="operator">{{ operator }}</option>
            }
          </select>
        </div>

        <!-- Conditions -->
        @for (condition of group.conditions; track $index) {
          <div class="condition-item">
            @if (isConditionGroup(condition)) {
              <!-- Nested Condition Group -->
              <ng-container
                *ngTemplateOutlet="
                  conditionGroupTemplate;
                  context: { $implicit: condition, level: level + 1, parent: group, index: $index }
                "></ng-container>
              
              <!-- Action Buttons for Nested Group -->
              <div class="action-buttons">
                <button type="button" class="btn-action btn-add" (click)="addCondition(condition)">
                  + Add Condition
                </button>
                <button type="button" class="btn-action btn-add" (click)="addGroup(condition)">
                  + Add Group
                </button>
                <button type="button" class="btn-action btn-remove" (click)="removeItem(group, $index)">
                  Remove Group
                </button>
              </div>
            } @else {
              <!-- Individual Condition -->
              <div class="condition-controls">
                <!-- Field Selection -->
                <!-- DONE: cck-table-advanced-filter-name-selector -->
                <select [value]="condition.field" (change)="updateConditionField(condition, $event)">
                  <option value="">Select Field</option>
                  @for (field of filedNames(); track field) {
                    <option [value]="field">{{ getFieldDisplayName(field) | uppercase }}</option>
                  }
                </select>

                <!-- Type Selection -->
                <!-- DONE: cck-table-advanced-filter-type-selector -->
                <select [value]="condition.type" (change)="updateConditionType(condition, $event)">
                  <option value="">Select Type</option>
                  @for (type of DataSourceFilterTypeValues; track type) {
                    <option [value]="type">{{ type | uppercase }}</option>
                  }
                </select>

                <!-- Match Type Selection -->
                @if (condition.type) {
                  <!-- DONE: cck-table-advanced-filter-match-type-selector -->
                  <select [value]="condition.matchType" (change)="updateConditionMatchType(condition, $event)">
                    <option value="">Select Match Type</option>
                    @switch (condition.type) {
                      @case (DataSourceFilterType.Text) {
                        @for (matchType of DataSourceFilterTextMatchTypeList; track matchType) {
                          <option [value]="matchType">{{ matchType | uppercase }}</option>
                        }
                      }
                      @case (DataSourceFilterType.Number) {
                        @for (matchType of DataSourceFilterNumberMatchTypeList; track matchType) {
                          <option [value]="matchType">{{ matchType | uppercase }}</option>
                        }
                      }
                      @case (DataSourceFilterType.Date) {
                        @for (matchType of DataSourceFilterDateMatchTypeList; track matchType) {
                          <option [value]="matchType">{{ matchType | uppercase }}</option>
                        }
                      }
                      @case (DataSourceFilterType.Boolean) {
                        @for (matchType of DataSourceFilterBooleanMatchTypeList; track matchType) {
                          <option [value]="matchType">{{ matchType | uppercase }}</option>
                        }
                      }
                    }
                  </select>
                }

                <!-- Value Input based on type and match type -->
                <!-- DONE: cck-table-advanced-filter-input-selector -->
                @if (condition.type && condition.matchType) {
                  @switch (condition.type) {
                    @case (DataSourceFilterType.Text) {
                      @if (!isBlankMatchType(condition.matchType)) {
                        <input
                          type="text"
                          [value]="getTextCondition(condition).filter || ''"
                          (input)="updateConditionFilter(condition, $event)"
                          placeholder="Enter text value" />
                      }
                    }
                    @case (DataSourceFilterType.Number) {
                      @if (!isBlankMatchType(condition.matchType)) {
                        <input
                          type="number"
                          [value]="getNumberCondition(condition).filter || ''"
                          (input)="updateConditionFilter(condition, $event)"
                          placeholder="Enter number value" />
                        @if (condition.matchType === DataSourceFilterMatchType.Between) {
                          <input
                            type="number"
                            [value]="getNumberCondition(condition).filter2 || ''"
                            (input)="updateConditionFilter2(condition, $event)"
                            placeholder="Enter second value" />
                        }
                      }
                    }
                    @case (DataSourceFilterType.Date) {
                      @if (!isBlankMatchType(condition.matchType)) {
                        <input
                          type="date"
                          [value]="formatDateForInput(getDateCondition(condition).filter)"
                          (input)="updateConditionFilter(condition, $event)"
                          placeholder="Select date" />
                        @if (condition.matchType === DataSourceFilterMatchType.Between) {
                          <input
                            type="date"
                            [value]="formatDateForInput(getDateCondition(condition).filter2)"
                            (input)="updateConditionFilter2(condition, $event)"
                            placeholder="Select end date" />
                        }
                      }
                    }
                    @case (DataSourceFilterType.Boolean) {
                      <!-- Boolean True/False don't need input, Blank/NotBlank don't need input -->
                    }
                  }
                }
              </div>
              
              <!-- Action Buttons for Individual Condition -->
              <div class="action-buttons">
                <button type="button" class="btn-action btn-add" (click)="addCondition(group)">
                  + Add Condition
                </button>
                <button type="button" class="btn-action btn-add" (click)="addGroup(group)">
                  + Add Group
                </button>
                <button type="button" class="btn-action btn-remove" (click)="removeItem(group, $index)">
                  Remove Condition
                </button>
              </div>
            }
          </div>
        }
      </div>
    </ng-template>
  `,
  styles: `
    .root-condition-group {
      --cck-advanced-filter-indent: 0;
    }

    // cck-table-advanced-filter-item
    .condition-group {
      margin-left: calc(var(--cck-advanced-filter-indent) * 20px);
      border-left: 2px solid #e0e0e0;
      padding-left: 15px;
      margin-bottom: 15px;
    }

    .condition-item {
      margin-bottom: 10px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e9ecef;
    }

    .condition-controls {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }

    .operator-select {
      margin-bottom: 15px;
    }

    .operator-select select {
      font-weight: bold;
      padding: 8px 12px;
      border: 2px solid #007bff;
      border-radius: 4px;
      background: #e7f3ff;
    }

    select,
    input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
    }

    select:focus,
    input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      flex-wrap: wrap;
    }

    .btn-action {
      padding: 6px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
    }

    .btn-add {
      color: #28a745;
      border-color: #28a745;
    }

    .btn-add:hover {
      background: #28a745;
      color: white;
    }

    .btn-remove {
      color: #dc3545;
      border-color: #dc3545;
    }

    .btn-remove:hover {
      background: #dc3545;
      color: white;
    }
  `,
})
export class ColumnAdvancedFilterOverlayComponent<T extends object> {
  private tableDataSource = inject(TableDataSource) as DataSource<T>;
  protected readonly Icons = Icons;
  protected readonly DataSourceFilterType = DataSourceFilterType;

  // protected conditionGroup = signal<DataSourceFilterConditionGroup<T>>({
  //   operator: DataSourceFilterOperator.AND,
  //   conditions: [],
  // });
  protected conditionGroup: DataSourceFilterGroup<any> = {
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
          },
          {
            operator: DataSourceFilterOperator.AND,
            conditions: [
              {
                field: 'roles',
                type: DataSourceFilterType.Boolean,
                matchType: DataSourceFilterMatchType.True,
              },
              {
                field: 'roles',
                type: DataSourceFilterType.Boolean,
                matchType: DataSourceFilterMatchType.Blank,
              },
            ],
          },
          {
            field: 'roles',
            type: DataSourceFilterType.Date,
            matchType: DataSourceFilterMatchType.Before,
            filter: new Date(),
          },
        ],
      },
    ],
  };

  protected DataSourceFilterMatchType = DataSourceFilterMatchType;
  protected DataSourceFilterOperator = Object.values(DataSourceFilterOperator);
  protected DataSourceFilterTextMatchTypeList = DataSourceFilterTextMatchTypeList;
  protected DataSourceFilterNumberMatchTypeList = DataSourceFilterNumberMatchTypeList;
  protected DataSourceFilterDateMatchTypeList = DataSourceFilterDateMatchTypeList;
  protected DataSourceFilterBooleanMatchTypeList = DataSourceFilterBooleanMatchTypeList;

  protected filedNames = toSignal(this.tableDataSource.fieldNames$, { initialValue: [] as (keyof T)[] });

  // ChatGPT:

  // ...existing code...

  protected DataSourceFilterTypeValues = Object.values(DataSourceFilterType);

  protected isConditionGroup(condition: any): condition is DataSourceFilterGroup<T> {
    return 'operator' in condition && 'conditions' in condition;
  }

  protected isBlankMatchType(matchType: DataSourceFilterMatchType): boolean {
    return matchType === DataSourceFilterMatchType.Blank || matchType === DataSourceFilterMatchType.NotBlank;
  }

  protected getTextCondition(condition: any): DataSourceFilterTextCondition<T> {
    return condition as DataSourceFilterTextCondition<T>;
  }

  protected getNumberCondition(condition: any): DataSourceFilterNumberCondition<T> {
    return condition as DataSourceFilterNumberCondition<T>;
  }

  protected getDateCondition(condition: any): DataSourceFilterDateCondition<T> {
    return condition as DataSourceFilterDateCondition<T>;
  }

  protected formatDateForInput(date: Date | undefined): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  protected updateGroupOperator(group: DataSourceFilterGroup<T>, event: Event): void {
    const target = event.target as HTMLSelectElement;
    group.operator = target.value as DataSourceFilterOperator;
  }

  protected updateConditionField(condition: any, event: Event): void {
    const target = event.target as HTMLSelectElement;
    condition.field = target.value;
  }

  protected updateConditionType(condition: any, event: Event): void {
    const target = event.target as HTMLSelectElement;
    condition.type = target.value as DataSourceFilterType;
    // Clear filter values when type changes
    condition.matchType = undefined;
    condition.filter = undefined;
    condition.filter2 = undefined;
  }

  protected updateConditionMatchType(condition: any, event: Event): void {
    const target = event.target as HTMLSelectElement;
    condition.matchType = target.value as DataSourceFilterMatchType;
    // Clear filter values when match type changes
    condition.filter = undefined;
    condition.filter2 = undefined;
  }

  protected updateConditionFilter(condition: any, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value =
      condition.type === DataSourceFilterType.Number
        ? target.value
          ? Number(target.value)
          : undefined
        : condition.type === DataSourceFilterType.Date
          ? target.value
            ? new Date(target.value)
            : undefined
          : target.value;

    condition.filter = value;
  }

  protected updateConditionFilter2(condition: any, event: Event): void {
    const target = event.target as HTMLInputElement;
    const value =
      condition.type === DataSourceFilterType.Number
        ? target.value
          ? Number(target.value)
          : undefined
        : condition.type === DataSourceFilterType.Date
          ? target.value
            ? new Date(target.value)
            : undefined
          : target.value;

    condition.filter2 = value;
  }

  protected getFieldDisplayName(field: keyof T): string {
    return String(field);
  }

  protected addCondition(group: DataSourceFilterGroup<T>): void {
    const newCondition: DataSourceFilterTextCondition<T> = {
      field: '' as keyof T,
      type: DataSourceFilterType.Text,
      matchType: DataSourceFilterMatchType.Contains,
      filter: ''
    };
    group.conditions.push(newCondition);
  }

  protected addGroup(group: DataSourceFilterGroup<T>): void {
    const newGroup: DataSourceFilterGroup<T> = {
      operator: DataSourceFilterOperator.AND,
      conditions: []
    };
    group.conditions.push(newGroup);
  }

  protected removeItem(parentGroup: DataSourceFilterGroup<T>, index: number): void {
    // Always allow removing items
    parentGroup.conditions.splice(index, 1);
    
    // If the group becomes empty, add a default condition to keep it functional
    if (parentGroup.conditions.length === 0) {
      const defaultCondition: DataSourceFilterTextCondition<T> = {
        field: '' as keyof T,
        type: DataSourceFilterType.Text,
        matchType: DataSourceFilterMatchType.Contains,
        filter: ''
      };
      parentGroup.conditions.push(defaultCondition);
    }
  }
}
