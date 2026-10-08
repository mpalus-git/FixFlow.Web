import { useSearchParams } from "react-router";

export function readPageParam(value: string | null): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

export function useSearchParamsUpdate() {
  const [searchParams, setSearchParams] = useSearchParams();

  function update(changes: Record<string, string | readonly string[] | null>) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(changes)) {
          next.delete(key);
          const values = typeof value === "string" ? [value] : (value ?? []);
          for (const item of values) {
            if (item !== "") {
              next.append(key, item);
            }
          }
        }
        return next;
      },
      { replace: true },
    );
  }

  return [searchParams, update] as const;
}

export function pageValue(page: number): string | null {
  return page <= 1 ? null : String(page);
}

export function usePageSearchParam(name: string) {
  const [searchParams, update] = useSearchParamsUpdate();

  return {
    page: readPageParam(searchParams.get(name)),
    setPage: (page: number) => {
      update({ [name]: pageValue(page) });
    },
  };
}

export function useListSearchParams() {
  const [searchParams, update] = useSearchParamsUpdate();

  return {
    page: readPageParam(searchParams.get("page")),
    search: searchParams.get("search") ?? "",
    setPage: (page: number) => {
      update({ page: pageValue(page) });
    },
    setSearch: (search: string) => {
      update({ search, page: null });
    },
  };
}
