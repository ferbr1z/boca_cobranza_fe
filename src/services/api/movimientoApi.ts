import { baseApi } from "./baseApi";
import type { MovimientoDto, MovimientoQuery, PageResponse } from "../../types";

export const movimientoApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllMovimientos: build.query<
      PageResponse<MovimientoDto>,
      { page: number; query?: MovimientoQuery }
    >({
      query: ({ page, query }) => {
        const params = new URLSearchParams();
        params.append("page", String(page));
        if (query?.ventaId !== undefined)
          params.append("ventaId", String(query.ventaId));
        if (query?.operadoraId !== undefined)
          params.append("operadoraId", String(query.operadoraId));
        if (query?.sesionLocalId !== undefined)
          params.append("sesionLocalId", String(query.sesionLocalId));
        if (query?.localId !== undefined)
          params.append("localId", String(query.localId));
        if (query?.tipoMovimiento !== undefined)
          params.append("tipoMovimiento", String(query.tipoMovimiento));
        if (query?.fechaInicio) params.append("fechaInicio", query.fechaInicio);
        if (query?.fechaFin) params.append("fechaFin", query.fechaFin);
        if (query?.orderBy) params.append("orderBy", query.orderBy);
        if (query?.asc !== undefined) params.append("asc", String(query.asc));

        return `movimientos?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Movimiento" as const,
                id,
              })),
              { type: "Movimiento", id: "LIST" },
            ]
          : [{ type: "Movimiento", id: "LIST" }],
    }),
  }),
});

export const { useGetAllMovimientosQuery } = movimientoApi;
