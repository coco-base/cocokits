/** Returns the element, or fails the test when it is missing. */
export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected the element to exist.');
  return value;
}

/** Builds markup inside a fresh host in the body and returns a query by id. */
export function mount(markup: string): { host: HTMLElement; byId: (id: string) => HTMLElement } {
  const host = document.createElement('div');
  host.innerHTML = markup;
  document.body.append(host);
  return { host, byId: (id) => must(host.querySelector<HTMLElement>(`#${id}`)) };
}
