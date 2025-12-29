import { baseApi } from "./baseApi";
import type {
  OperadoraDto,
  OperadoraRequest,
  OperadoraQuery,
  PageResponse,
} from "../../types";

export const operadorasApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllOperadoras: build.query<
      PageResponse<OperadoraDto>,
      { page: number; query?: OperadoraQuery }
    >({
      query: ({ page, query }) => {
        const params = new URLSearchParams();
        if (query?.nombre) params.append("nombre", query.nombre);
        if (query?.numeroTelefono)
          params.append("numeroTelefono", query.numeroTelefono);
        if (query?.localId !== undefined)
          params.append("localId", String(query.localId));
        if (query?.orderBy) params.append("orderBy", query.orderBy);
        if (query?.asc !== undefined) params.append("asc", String(query.asc));

        const queryString = params.toString();
        return `operadora/page/${page}${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Operadora" as const,
                id,
              })),
              { type: "Operadora", id: "LIST" },
            ]
          : [{ type: "Operadora", id: "LIST" }],
    }),
    getOperadora: build.query<OperadoraDto, number>({
      query: (id) => `operadora/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Operadora", id }],
    }),
    addOperadora: build.mutation<OperadoraDto, OperadoraRequest>({
      query: (body) => ({
        url: "operadora",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Operadora", id: "LIST" }],
    }),
    updateOperadora: build.mutation<
      OperadoraDto,
      { id: number; body: OperadoraRequest }
    >({
      query: ({ id, body }) => ({
        url: `operadora/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Operadora", id },
        { type: "Operadora", id: "LIST" },
      ],
    }),
    deleteOperadora: build.mutation<void, number>({
      query: (id) => ({
        url: `operadora/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Operadora", id },
        { type: "Operadora", id: "LIST" },
      ],
    }),
    addMontoOperadora: build.mutation<
      OperadoraDto,
      { id: number; monto: number }
    >({
      query: ({ id, monto }) => ({
        url: `operadora/add-monto/${id}`,
        method: "PUT",
        body: { monto },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Operadora", id },
        { type: "Operadora", id: "LIST" },
      ],
    }),
    subtractMontoOperadora: build.mutation<
      OperadoraDto,
      { id: number; monto: number }
    >({
      query: ({ id, monto }) => ({
        url: `operadora/sustract-monto/${id}`,
        method: "PUT",
        body: { monto },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Operadora", id },
        { type: "Operadora", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllOperadorasQuery,
  useLazyGetAllOperadorasQuery,
  useGetOperadoraQuery,
  useLazyGetOperadoraQuery,
  useAddOperadoraMutation,
  useUpdateOperadoraMutation,
  useDeleteOperadoraMutation,
  useAddMontoOperadoraMutation,
  useSubtractMontoOperadoraMutation,
} = operadorasApi;
