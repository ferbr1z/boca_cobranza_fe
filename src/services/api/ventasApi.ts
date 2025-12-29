import { baseApi } from './baseApi';
import type { VentaDto, VentaRequest, VentaQuery, PageResponse } from '../../types';

export const ventasApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllVentas: build.query<PageResponse<VentaDto>, { page: number; query?: VentaQuery }>({
      query: ({ page, query }) => {
        const params = new URLSearchParams();
        if (query?.localId !== undefined) params.append('localId', String(query.localId));
        if (query?.sesionLocalId !== undefined) params.append('sesionLocalId', String(query.sesionLocalId));
        if (query?.productoId !== undefined) params.append('productoId', String(query.productoId));
        if (query?.productoNombre) params.append('productoNombre', query.productoNombre);
        if (query?.cajaId !== undefined) params.append('cajaId', String(query.cajaId));
        if (query?.cuentaBancariaId !== undefined) params.append('cuentaBancariaId', String(query.cuentaBancariaId));
        if (query?.orderBy) params.append('orderBy', query.orderBy);
        if (query?.asc !== undefined) params.append('asc', String(query.asc));

        const queryString = params.toString();
        return `venta/page/${page}${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Venta' as const, id })),
              { type: 'Venta', id: 'LIST' },
            ]
          : [{ type: 'Venta', id: 'LIST' }],
    }),
    getVenta: build.query<VentaDto, number>({
      query: (id) => `venta/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Venta', id }],
    }),
    addVenta: build.mutation<VentaDto, VentaRequest>({
      query: (body) => ({
        url: 'venta',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Venta', id: 'LIST' }, { type: 'Producto', id: 'LIST' }],
    }),
    updateVenta: build.mutation<VentaDto, { id: number; body: VentaRequest }>({
      query: ({ id, body }) => ({
        url: `venta/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Venta', id },
        { type: 'Venta', id: 'LIST' },
        { type: 'Producto', id: 'LIST' },
      ],
    }),
    deleteVenta: build.mutation<void, number>({
      query: (id) => ({
        url: `venta/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Venta', id: 'LIST' }, { type: 'Producto', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAllVentasQuery,
  useGetVentaQuery,
  useAddVentaMutation,
  useUpdateVentaMutation,
  useDeleteVentaMutation,
} = ventasApi;
