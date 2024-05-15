export interface SvgIcon {
  name: string;
  content: string;
  viewBox: string;
}

export interface ThemeChangedEvent {
  name: string;
  iconList: Record<string, SvgIcon>;
}
