import { pageValue, readPageParam, useSearchParamsUpdate } from "@/shared/lib/useListSearchParams";

export function usePartListSearchParams() {
  const [searchParams, update] = useSearchParamsUpdate();

  return {
    page: readPageParam(searchParams.get("page")),
    search: searchParams.get("search") ?? "",
    outOfStockOnly: searchParams.get("stock") === "out",
    setPage: (page: number) => {
      update({ page: pageValue(page) });
    },
    setSearch: (search: string) => {
      update({ search, page: null });
    },
    setOutOfStockOnly: (outOfStockOnly: boolean) => {
      update({ stock: outOfStockOnly ? "out" : null, page: null });
    },
  };
}
