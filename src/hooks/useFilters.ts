import { useState, useCallback } from "react";
import type { AsyncSelectOption } from "../components/AsyncSelectField";

export interface FilterConfig {
  name: string;
  label: string;
  type: "string" | "select" | "number" | "async-select" | "date-range" | "date";
  initialValue?: any;
  options?: { value: any; label: string }[];
  loadOptions?: (inputValue: string) => Promise<AsyncSelectOption[]>;
  placeholder?: string;
}

export interface UseFiltersConfig {
  filters: FilterConfig[];
  initialPage?: number;
  initialPageSize?: number;
}

export function useFilters({
  filters,
  initialPage = 1,
  initialPageSize = 10,
}: UseFiltersConfig) {
  const [filterValues, setFilterValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    filters.forEach((filter) => {
      if (filter.type === "date-range") {
        initial[filter.name] = { desde: "", hasta: "" };
      } else {
        initial[filter.name] = filter.initialValue ?? "";
      }
    });
    return initial;
  });

  // Valores aplicados que se usan para las llamadas a la API
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>(
    () => {
      const initial: Record<string, any> = {};
      filters.forEach((filter) => {
        if (filter.type === "date-range") {
          initial[filter.name] = { desde: "", hasta: "" };
        } else {
          initial[filter.name] = filter.initialValue ?? "";
        }
      });
      return initial;
    }
  );

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handleFilterChange = useCallback((name: string, value: any) => {
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const validateFilters = useCallback(
    (values: Record<string, any>): boolean => {
      for (const filter of filters) {
        if (filter.type === "date-range") {
          const dateRange = values[filter.name];
          if (dateRange) {
            // Validar que si una fecha está presente, la otra también lo esté
            const hasDesde = dateRange.desde && dateRange.desde.trim() !== "";
            const hasHasta = dateRange.hasta && dateRange.hasta.trim() !== "";

            // Si una fecha está presente pero la otra no, es inválido
            if ((hasDesde && !hasHasta) || (!hasDesde && hasHasta)) {
              return false;
            }

            // Validar que la fecha desde no sea posterior a la fecha hasta
            if (hasDesde && hasHasta) {
              const desde = new Date(dateRange.desde);
              const hasta = new Date(dateRange.hasta);
              if (desde > hasta) {
                return false;
              }
            }
          }
        }
      }
      return true;
    },
    [filters]
  );

  const applyFilters = useCallback(() => {
    if (!validateFilters(filterValues)) {
      return false;
    }
    setAppliedFilters(filterValues);
    setPage(1);
    return true;
  }, [filterValues, validateFilters]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    const initial: Record<string, any> = {};
    filters.forEach((filter) => {
      if (filter.type === "date-range") {
        initial[filter.name] = { desde: "", hasta: "" };
      } else {
        initial[filter.name] = filter.initialValue ?? "";
      }
    });
    setFilterValues(initial);
    setAppliedFilters(initial);
    setPage(1);
  }, [filters]);

  const filterData = {
    ...appliedFilters,
    page,
  };

  return {
    filterValues,
    appliedFilters,
    page,
    pageSize,
    handleFilterChange,
    applyFilters,
    validateFilters,
    handlePageChange,
    handlePageSizeChange,
    resetFilters,
    filterData,
  };
}
