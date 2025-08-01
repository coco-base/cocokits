export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepNullable<T> = {
  [P in keyof T]: T[P] extends object ? DeepNullable<T[P]> : T[P] | null;
};

export type ClassRef<T = any, U = any> = new (...args: U[]) => T;

export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Omit<T, K>;
}[keyof T];
