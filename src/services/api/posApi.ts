import { baseApi } from "./baseApi";
import type { PosDto, PosRequest, PosQuery, PageResponse } from "../../types";

export const posApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllPos: build.query<
      PageResponse<PosDto>,
      { page: number; query?: PosQuery }
    >({
      query: ({ page, query }) => {
        const params = new URLSearchParams();
        if (query?.nombre) params.append("nombre", query.nombre);
        if (query?.localId !== undefined)
          params.append("localId", String(query.localId));
        if (query?.orderBy) params.append("orderBy", query.orderBy);
        if (query?.asc !== undefined) params.append("asc", String(query.asc));

        const queryString = params.toString();
        return `pos/page/${page}${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Pos" as const, id })),
              { type: "Pos", id: "LIST" },
            ]
          : [{ type: "Pos", id: "LIST" }],
    }),
    getPos: build.query<PosDto, number>({
      query: (id) => `pos/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Pos", id }],
    }),
    addPos: build.mutation<PosDto, PosRequest>({
      query: (body) => ({
        url: "pos",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Pos", id: "LIST" }],
    }),
    updatePos: build.mutation<PosDto, { id: number; body: PosRequest }>({
      query: ({ id, body }) => ({
        url: `pos/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Pos", id },
        { type: "Pos", id: "LIST" },
      ],
    }),
    deletePos: build.mutation<void, number>({
      query: (id) => ({
        url: `pos/${id}`,
        method: "DELETE",
        body: {},
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Pos", id },
        { type: "Pos", id: "LIST" },
      ],
    }),
    addMontoPos: build.mutation<PosDto, { id: number; monto: number }>({
      query: ({ id, monto }) => ({
        url: `pos/add-monto/${id}`,
        method: "PUT",
        body: { monto },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Pos", id },
        { type: "Pos", id: "LIST" },
      ],
    }),
    subtractMontoPos: build.mutation<PosDto, { id: number; monto: number }>({
      query: ({ id, monto }) => ({
        url: `pos/sustract-monto/${id}`,
        method: "PUT",
        body: { monto },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Pos", id },
        { type: "Pos", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllPosQuery,
  useLazyGetAllPosQuery,
  useGetPosQuery,
  useAddPosMutation,
  useUpdatePosMutation,
  useDeletePosMutation,
  useAddMontoPosMutation,
  useSubtractMontoPosMutation,
} = posApi;
