import { useSearchParams } from "react-router";

export function readPageParam(value: string | null): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

export function useListSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  function update(changes: Record<string, string | null>) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(changes)) {
          if (value === null || value === "") {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        }
        return next;
      },
      { replace: true },
    );
  }

  return {
    page: readPageParam(searchParams.get("page")),
    search: searchParams.get("search") ?? "",
    setPage: (page: number) => {
      update({ page: page <= 1 ? null : String(page) });
    },
    setSearch: (search: string) => {
      update({ search, page: null });
    },
  };
}
