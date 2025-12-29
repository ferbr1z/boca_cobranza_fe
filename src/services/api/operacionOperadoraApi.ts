import { baseApi } from "./baseApi";
import type {
  OperacionOperadoraDto,
  OperacionRequest,
  OperacionOperadoraQuery,
  PageResponse,
} from "../../types";

export const operacionOperadoraApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllOperacionesOperadora: build.query<
      PageResponse<OperacionOperadoraDto>,
      { page: number; query?: OperacionOperadoraQuery }
    >({
      query: ({ page, query }) => {
        const params = new URLSearchParams();
        if (query?.operadoraId !== undefined)
          params.append("operadoraId", String(query.operadoraId));
        if (query?.sesionLocalId !== undefined)
          params.append("sesionLocalId", String(query.sesionLocalId));
        if (query?.orderBy) params.append("orderBy", query.orderBy);
        if (query?.asc !== undefined) params.append("asc", String(query.asc));

        const queryString = params.toString();
        return `OperacionesOperadora/page/${page}${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "OperacionOperadora" as const,
                id,
              })),
              { type: "OperacionOperadora", id: "LIST" },
            ]
          : [{ type: "OperacionOperadora", id: "LIST" }],
    }),
    getOperacionOperadoraById: build.query<OperacionOperadoraDto, number>({
      query: (id) => `OperacionesOperadora/id/${id}`,
      providesTags: (_, __, id) => [{ type: "OperacionOperadora", id }],
    }),
    cargarSaldo: build.mutation<OperacionOperadoraDto, OperacionRequest>({
      query: (body) => ({
        url: "OperacionesOperadora/cargar-saldo",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "OperacionOperadora", id: "LIST" },
        { type: "Movimiento", id: "LIST" },
      ],
    }),
    giroBilletera: build.mutation<OperacionOperadoraDto, OperacionRequest>({
      query: (body) => ({
        url: "OperacionesOperadora/giro-billetera",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "OperacionOperadora", id: "LIST" },
        { type: "Movimiento", id: "LIST" },
      ],
    }),
    retirarBilletera: build.mutation<OperacionOperadoraDto, OperacionRequest>({
      query: (body) => ({
        url: "OperacionesOperadora/retirar-billetera",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "OperacionOperadora", id: "LIST" },
        { type: "Movimiento", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllOperacionesOperadoraQuery,
  useLazyGetAllOperacionesOperadoraQuery,
  useGetOperacionOperadoraByIdQuery,
  useCargarSaldoMutation,
  useGiroBilleteraMutation,
  useRetirarBilleteraMutation,
} = operacionOperadoraApi;
