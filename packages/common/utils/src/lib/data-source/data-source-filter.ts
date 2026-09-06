/** @module data-source */

import { DataSourceFilterMatcher } from "./data-source-filter-matcher";
import { DataSourceFilterConditionOrGroup, DataSourceFilterGroup, DataSourceFilterOperator, DataSourceFilterType } from "./data-source.model";

export class DataSourceFilter<T> {

  private matcher = new DataSourceFilterMatcher<T>();

  private conditionGroup: DataSourceFilterGroup<T> = {
    operator: DataSourceFilterOperator.AND,
    conditions: []
  };
 
  public setConditions(conditions: DataSourceFilterGroup<T>): void {
    this.conditionGroup = conditions;
  }

  public apply(data: T[]): T[] {
    return data.filter(item => this.matcher.filter(item, this.conditionGroup));
  }

  public clearAllConditions(): void {
    this.conditionGroup = {
      ...this.conditionGroup,
      conditions: []
    };
  }

  public removeRootConditionByField(field: keyof T): void {
    const conditionGroup = this.getConditionGroup();
    conditionGroup.conditions = conditionGroup.conditions.filter(c => 'field' in c ? c.field !== field : true);
    this.setConditions(conditionGroup);
  }

  public removeRootCondition(condition: DataSourceFilterConditionOrGroup<T>): void {
    const conditionGroup = this.getConditionGroup();
    conditionGroup.conditions = conditionGroup.conditions.filter(c => JSON.stringify(c) !== JSON.stringify(condition));
    this.setConditions(conditionGroup);
  }

  public addRootCondition(newCondition: DataSourceFilterConditionOrGroup<T>): void {
    const conditionGroup = this.getConditionGroup();
    conditionGroup.conditions.push(newCondition);
    this.setConditions(conditionGroup);
  }

  public getConditionGroup(): DataSourceFilterGroup<T> {
    return structuredClone(this.conditionGroup);
  }

  public getConditions(): DataSourceFilterConditionOrGroup<T>[] {
    return this.getConditionGroup().conditions;
  }

  // public validateConditionGroup(conditionGroup: DataSourceFilterConditionGroup<T>): boolean {
  //   const error: string[] = [];
  // }

}