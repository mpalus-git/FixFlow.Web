class FakeMediaQueryList extends EventTarget implements MediaQueryList {
  readonly media: string;
  onchange: ((this: MediaQueryList, event: MediaQueryListEvent) => void) | null = null;
  private readonly readMatches: () => boolean;

  constructor(media: string, readMatches: () => boolean) {
    super();
    this.media = media;
    this.readMatches = readMatches;
  }

  get matches(): boolean {
    return this.media === "(prefers-color-scheme: dark)" && this.readMatches();
  }

  addListener(): void {
    throw new Error("Deprecated MediaQueryList.addListener is not supported");
  }

  removeListener(): void {
    throw new Error("Deprecated MediaQueryList.removeListener is not supported");
  }
}

export function mockColorScheme(initialPrefersDark: boolean) {
  let prefersDark = initialPrefersDark;
  const queries: FakeMediaQueryList[] = [];

  vi.stubGlobal("matchMedia", (media: string) => {
    const query = new FakeMediaQueryList(media, () => prefersDark);
    queries.push(query);
    return query;
  });

  return {
    setPrefersDark(value: boolean) {
      prefersDark = value;
      for (const query of queries) {
        query.dispatchEvent(new Event("change"));
      }
    },
  };
}
