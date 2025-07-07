export interface TabSelectionChangeEvent<TValue> {
  previousIndex: number;
  previousValue: TValue;
  index: number;
  value: TValue;
}
