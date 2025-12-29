import { baseApi } from './baseApi';
import type { LocalDto, LocalRequest, LocalQuery, PageResponse } from '../../types';

export const localesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllLocales: build.query<PageResponse<LocalDto>, { page: number; query?: LocalQuery }>({
      query: ({ page, query }) => {
        const params = new URLSearchParams();
        if (query?.nombre) params.append('nombre', query.nombre);
        if (query?.orderBy) params.append('orderBy', query.orderBy);
        if (query?.asc !== undefined) params.append('asc', String(query.asc));
        
        const queryString = params.toString();
        return `local/page/${page}${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Local' as const, id })),
              { type: 'Local', id: 'LIST' },
            ]
          : [{ type: 'Local', id: 'LIST' }],
    }),
    getLocal: build.query<LocalDto, number>({
      query: (id) => `local/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Local', id }],
    }),
    addLocal: build.mutation<LocalDto, LocalRequest>({
      query: (body) => ({
        url: 'local',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Local', id: 'LIST' }],
    }),
    updateLocal: build.mutation<LocalDto, { id: number; body: LocalRequest }>({
      query: ({ id, body }) => ({
        url: `local/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Local', id },
        { type: 'Local', id: 'LIST' },
      ],
    }),
    deleteLocal: build.mutation<void, number>({
      query: (id) => ({
        url: `local/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Local', id },
        { type: 'Local', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllLocalesQuery,
  useLazyGetAllLocalesQuery,
  useGetLocalQuery,
  useAddLocalMutation,
  useUpdateLocalMutation,
  useDeleteLocalMutation,
} = localesApi;
