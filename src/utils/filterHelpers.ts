import type { AsyncSelectOption } from '../components/AsyncSelectField';

export const createLocalLoader = (
  lazyGetAllLocales: any
) => {
  return async (inputValue: string): Promise<AsyncSelectOption[]> => {
    try {
      const result = await lazyGetAllLocales({
        page: 1,
        query: inputValue ? { nombre: inputValue } : undefined,
      });

      if (!result.data?.data) {
        return [];
      }

      return result.data.data.map((local: any) => ({
        value: local.id,
        label: local.nombre,
      }));
    } catch (error) {
      console.error('Error loading locales:', error);
      return [];
    }
  };
};
