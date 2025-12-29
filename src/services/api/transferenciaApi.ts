import { baseApi } from './baseApi';
import type { TransferenciaDto, TransferenciaRequest, TransferenciaQuery, PageResponse } from '../../types';

export const transferenciaApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllTransferencias: build.query<PageResponse<TransferenciaDto>, { page: number; query?: TransferenciaQuery }>({
      query: ({ page, query }) => {
        const params = new URLSearchParams();
        if (query?.localId !== undefined) params.append('localId', String(query.localId));
        if (query?.sesionLocalId !== undefined) params.append('sesionLocalId', String(query.sesionLocalId));
        if (query?.cuentaBancariaId !== undefined) params.append('cuentaBancariaId', String(query.cuentaBancariaId));
        if (query?.numeroTransaccion) params.append('numeroTransaccion', query.numeroTransaccion);
        if (query?.isEntrada !== undefined) params.append('isEntrada', String(query.isEntrada));
        if (query?.orderBy) params.append('orderBy', query.orderBy);
        if (query?.asc !== undefined) params.append('asc', String(query.asc));
        
        const queryString = params.toString();
        return `transferencia/page/${page}${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Transferencia' as const, id })),
              { type: 'Transferencia', id: 'LIST' },
            ]
          : [{ type: 'Transferencia', id: 'LIST' }],
    }),
    enviarTransferencia: build.mutation<TransferenciaDto, TransferenciaRequest>({
      query: (body) => ({
        url: 'transferencia/enviar',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Transferencia', id: 'LIST' }],
    }),
    retirarTransferencia: build.mutation<TransferenciaDto, TransferenciaRequest>({
      query: (body) => ({
        url: 'transferencia/retirar',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Transferencia', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAllTransferenciasQuery,
  useEnviarTransferenciaMutation,
  useRetirarTransferenciaMutation,
} = transferenciaApi;
