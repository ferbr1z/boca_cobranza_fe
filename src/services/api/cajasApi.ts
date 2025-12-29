import { baseApi } from "./baseApi";
import type {
  CajaDto,
  CajaRequest,
  CajaQuery,
  PageResponse,
} from "../../types";

export const cajasApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllCajas: build.query<
      PageResponse<CajaDto>,
      { page: number; query?: CajaQuery }
    >({
      query: ({ page, query }) => {
        const params = new URLSearchParams();
        if (query?.nombre) params.append("nombre", query.nombre);
        if (query?.localId !== undefined)
          params.append("localId", String(query.localId));
        if (query?.orderBy) params.append("orderBy", query.orderBy);
        if (query?.asc !== undefined) params.append("asc", String(query.asc));

        const queryString = params.toString();
        return `caja/page/${page}${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Caja" as const, id })),
              { type: "Caja", id: "LIST" },
            ]
          : [{ type: "Caja", id: "LIST" }],
    }),
    getCaja: build.query<CajaDto, number>({
      query: (id) => `caja/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Caja", id }],
    }),
    addCaja: build.mutation<CajaDto, CajaRequest>({
      query: (body) => ({
        url: "caja",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Caja", id: "LIST" }],
    }),
    updateCaja: build.mutation<CajaDto, { id: number; body: CajaRequest }>({
      query: ({ id, body }) => ({
        url: `caja/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Caja", id },
        { type: "Caja", id: "LIST" },
      ],
    }),
    deleteCaja: build.mutation<void, number>({
      query: (id) => ({
        url: `caja/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Caja", id },
        { type: "Caja", id: "LIST" },
      ],
    }),
    addMontoCaja: build.mutation<CajaDto, { id: number; monto: number }>({
      query: ({ id, monto }) => ({
        url: `caja/add-monto/${id}`,
        method: "PUT",
        body: { monto },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Caja", id },
        { type: "Caja", id: "LIST" },
      ],
    }),
    subtractMontoCaja: build.mutation<CajaDto, { id: number; monto: number }>({
      query: ({ id, monto }) => ({
        url: `caja/sustract-monto/${id}`,
        method: "PUT",
        body: { monto },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Caja", id },
        { type: "Caja", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllCajasQuery,
  useLazyGetAllCajasQuery,
  useGetCajaQuery,
  useLazyGetCajaQuery,
  useAddCajaMutation,
  useUpdateCajaMutation,
  useDeleteCajaMutation,
  useAddMontoCajaMutation,
  useSubtractMontoCajaMutation,
} = cajasApi;
