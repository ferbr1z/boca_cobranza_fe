import { useMemo, useCallback, useRef } from 'react';
import type { AsyncSelectOption } from '../components/AsyncSelectField';
import type { LocalDto } from '../types';
import {
  useGetAllLocalesQuery,
  useLazyGetAllLocalesQuery,
  useGetLocalQuery,
} from '../services/api/localesApi';

interface UseLocalesSelectOptions {
  initialLocalId?: number;
}

export function useLocalesSelect({ initialLocalId }: UseLocalesSelectOptions = {}) {
  const { data: defaultData, isLoading: isLoadingDefaults } = useGetAllLocalesQuery({
    page: 1,
    query: {},
  });

  const optionCacheRef = useRef<Map<number, AsyncSelectOption>>(new Map());

  const defaultOptions = useMemo<AsyncSelectOption[]>(() => {
    const options = (defaultData?.data || []).map(
      (local: LocalDto): AsyncSelectOption => ({
        value: Number(local.id),
        label: local.nombre,
      })
    );
    options.forEach((option) => {
      optionCacheRef.current.set(Number(option.value), option);
    });
    return options;
  }, [defaultData]);

  const {
    data: initialLocalData,
    isFetching: isFetchingInitial,
  } = useGetLocalQuery(initialLocalId ?? 0, {
    skip: !initialLocalId,
  });

  const initialOption = useMemo<AsyncSelectOption | null>(() => {
    if (!initialLocalData) return null;
    const option: AsyncSelectOption = {
      value: Number(initialLocalData.id),
      label: initialLocalData.nombre,
    };
    optionCacheRef.current.set(Number(option.value), option);
    return option;
  }, [initialLocalData]);

  const [triggerSearch, { isFetching: isFetchingSearch }] = useLazyGetAllLocalesQuery();

  const loadOptions = useCallback(
    async (inputValue: string) => {
      try {
        const response = await triggerSearch({
          page: 1,
          query: {
            nombre: inputValue || undefined,
          },
        }).unwrap();

        const options = response.data.map(
          (local: LocalDto): AsyncSelectOption => ({
            value: Number(local.id),
            label: local.nombre,
          })
        );
        options.forEach((option) => {
          optionCacheRef.current.set(Number(option.value), option);
        });
        return options;
      } catch (error) {
        return [];
      }
    },
    [triggerSearch]
  );

  const getOptionFromValue = useCallback(
    (value?: number | string | null) => {
      if (!value) return null;
      const numericValue = Number(value);
      const cached = optionCacheRef.current.get(numericValue);
      if (cached) return cached;
      if (initialOption && Number(initialOption.value) === numericValue) {
        return initialOption;
      }
      return null;
    },
    [initialOption]
  );

  return {
    defaultOptions,
    loadOptions,
    getOptionFromValue,
    isLoading: isLoadingDefaults || isFetchingInitial || isFetchingSearch,
  };
}
