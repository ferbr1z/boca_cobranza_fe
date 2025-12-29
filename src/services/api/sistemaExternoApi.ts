import { baseApi } from './baseApi';
import type {
  SistemaExternoDto,
  SistemaExternoRequest,
  SistemaExternoQuery,
  PageResponse,
} from '../../types';

export const sistemaExternoApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllSistemaExterno: build.query<PageResponse<SistemaExternoDto>, { page: number; query?: SistemaExternoQuery }>({
      query: ({ page, query }) => {
        const params = new URLSearchParams();
        if (query?.nombre) params.append('nombre', query.nombre);
        if (query?.conteo !== undefined) params.append('conteo', String(query.conteo));
        if (query?.localId !== undefined) params.append('localId', String(query.localId));
        if (query?.orderBy) params.append('orderBy', query.orderBy);
        if (query?.asc !== undefined) params.append('asc', String(query.asc));

        const queryString = params.toString();
        return `sistemaExterno/page/${page}${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'SistemaExterno' as const, id })),
              { type: 'SistemaExterno', id: 'LIST' },
            ]
          : [{ type: 'SistemaExterno', id: 'LIST' }],
    }),
    getSistemaExterno: build.query<SistemaExternoDto, number>({
      query: (id) => `sistemaExterno/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'SistemaExterno', id }],
    }),
    addSistemaExterno: build.mutation<SistemaExternoDto, SistemaExternoRequest>({
      query: (body) => ({
        url: 'sistemaExterno',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'SistemaExterno', id: 'LIST' }],
    }),
    updateSistemaExterno: build.mutation<SistemaExternoDto, { id: number; body: SistemaExternoRequest }>({
      query: ({ id, body }) => ({
        url: `sistemaExterno/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'SistemaExterno', id },
        { type: 'SistemaExterno', id: 'LIST' },
      ],
    }),
    deleteSistemaExterno: build.mutation<void, number>({
      query: (id) => ({
        url: `sistemaExterno/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'SistemaExterno', id },
        { type: 'SistemaExterno', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllSistemaExternoQuery,
  useLazyGetAllSistemaExternoQuery,
  useGetSistemaExternoQuery,
  useAddSistemaExternoMutation,
  useUpdateSistemaExternoMutation,
  useDeleteSistemaExternoMutation,
} = sistemaExternoApi;
