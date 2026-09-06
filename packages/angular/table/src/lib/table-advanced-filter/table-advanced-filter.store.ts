import { Injectable, signal } from '@angular/core';
import { DataSourceFilterCondition, DataSourceFilterGroup, DataSourceFilterGroupStore, DataSourceFilterConditionOrGroup, DataSourceFilterConditionOrGroupStore, DataSourceFilterConditionStore, DataSourceFilterOperator } from '@cocokits/common-utils';

let TABLE_ADVANCED_FILTER_STORE_NEXT_ID = 0;
function getNextTableAdvancedFilterStoreId(): string {
  return `TABLE_ADVANCED_FILTER_STORE_NEXT_ID--${TABLE_ADVANCED_FILTER_STORE_NEXT_ID++}`;
}

@Injectable()
export class TableAdvancedFilterStore<T> {
  conditionOrGroup = signal<DataSourceFilterConditionOrGroupStore<T>>({
    id: getNextTableAdvancedFilterStoreId(),
    operator: DataSourceFilterOperator.AND,
    conditions: [],
  });

  public serializeAndSetGroup(group: DataSourceFilterGroup<T>): void {
  }

  private serializeGroupOrCondition(condition: DataSourceFilterConditionOrGroup<T>): DataSourceFilterConditionOrGroupStore<T> {
    if ('conditions' in condition) {
      return this.serializeGroup(condition);
    } else {
      return this.serializeCondition(condition);
    }
  }

  private serializeGroup(group: DataSourceFilterGroup<T>): DataSourceFilterGroupStore<T> {
    return {
      id: getNextTableAdvancedFilterStoreId(),
      operator: group.operator,
      conditions: group.conditions.map((condition) => this.serializeGroupOrCondition(condition)),
    };
  }

  private serializeCondition(condition: DataSourceFilterCondition<T>): DataSourceFilterConditionStore<T> {
    return {
      ...condition,
      id: getNextTableAdvancedFilterStoreId(),
      isValid: true,
      errors: {
        field: null,
        type: null,
        matchType: null,
        filter: null,
      },
      canShowErrors: {
        field: false,
        type: false,
        matchType: false,
        filter: false,
      }
    };
  }
}
