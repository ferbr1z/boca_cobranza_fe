import { baseApi } from "./baseApi";
import type {
  CuentaBancariaDto,
  CuentaBancariaRequest,
  CuentaBancariaQuery,
  PageResponse,
} from "../../types";

export const cuentasBancariasApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllCuentasBancarias: build.query<
      PageResponse<CuentaBancariaDto>,
      { page: number; query?: CuentaBancariaQuery }
    >({
      query: ({ page, query }) => {
        const params = new URLSearchParams();
        if (query?.nombre) params.append("nombre", query.nombre);
        if (query?.localId !== undefined)
          params.append("localId", String(query.localId));
        if (query?.orderBy) params.append("orderBy", query.orderBy);
        if (query?.asc !== undefined) params.append("asc", String(query.asc));

        const queryString = params.toString();
        return `cuentaBancaria/page/${page}${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "CuentaBancaria" as const,
                id,
              })),
              { type: "CuentaBancaria", id: "LIST" },
            ]
          : [{ type: "CuentaBancaria", id: "LIST" }],
    }),
    getCuentaBancaria: build.query<CuentaBancariaDto, number>({
      query: (id) => `cuentaBancaria/${id}`,
      providesTags: (_result, _error, id) => [{ type: "CuentaBancaria", id }],
    }),
    addCuentaBancaria: build.mutation<CuentaBancariaDto, CuentaBancariaRequest>(
      {
        query: (body) => ({
          url: "cuentaBancaria",
          method: "POST",
          body,
        }),
        invalidatesTags: [
          { type: "CuentaBancaria", id: "LIST" },
          { type: "CuentaBancaria", id: "CURRENT" },
        ],
      }
    ),
    updateCuentaBancaria: build.mutation<
      CuentaBancariaDto,
      { id: number; body: CuentaBancariaRequest }
    >({
      query: ({ id, body }) => ({
        url: `cuentaBancaria/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CuentaBancaria", id },
        { type: "CuentaBancaria", id: "LIST" },
        { type: "CuentaBancaria", id: "CURRENT" },
      ],
    }),
    deleteCuentaBancaria: build.mutation<void, number>({
      query: (id) => ({
        url: `cuentaBancaria/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "CuentaBancaria", id },
        { type: "CuentaBancaria", id: "LIST" },
      ],
    }),
    addMontoCuentaBancaria: build.mutation<
      CuentaBancariaDto,
      { id: number; monto: number }
    >({
      query: ({ id, monto }) => ({
        url: `cuentaBancaria/add-monto/${id}`,
        method: "PUT",
        body: { monto },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CuentaBancaria", id },
        { type: "CuentaBancaria", id: "LIST" },
      ],
    }),
    subtractMontoCuentaBancaria: build.mutation<
      CuentaBancariaDto,
      { id: number; monto: number }
    >({
      query: ({ id, monto }) => ({
        url: `cuentaBancaria/sustract-monto/${id}`,
        method: "PUT",
        body: { monto },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CuentaBancaria", id },
        { type: "CuentaBancaria", id: "LIST" },
      ],
    }),
    getCurrentRedDePago: build.query<CuentaBancariaDto | null, void>({
      query: () => "cuentaBancaria/red-de-pagos",
      providesTags: [{ type: "CuentaBancaria", id: "CURRENT" }],
    }),
  }),
});

export const {
  useGetAllCuentasBancariasQuery,
  useLazyGetAllCuentasBancariasQuery,
  useGetCuentaBancariaQuery,
  useLazyGetCuentaBancariaQuery,
  useAddCuentaBancariaMutation,
  useUpdateCuentaBancariaMutation,
  useDeleteCuentaBancariaMutation,
  useAddMontoCuentaBancariaMutation,
  useSubtractMontoCuentaBancariaMutation,
  useGetCurrentRedDePagoQuery,
} = cuentasBancariasApi;
