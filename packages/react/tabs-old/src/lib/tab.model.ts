export type TabValue = string;

export interface TabSelectionChangeEvent {
  previousIndex: number;
  previousValue: TabValue;
  index: number;
  value: TabValue;
}
