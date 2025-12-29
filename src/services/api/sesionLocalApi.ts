import { baseApi } from "./baseApi";
import type {
  SesionLocalDto,
  SesionLocalRequest,
  SesionLocalQuery,
  PageResponse,
} from "../../types";

export const sesionLocalApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllSesionesLocal: build.query<
      PageResponse<SesionLocalDto>,
      { page: number; query?: SesionLocalQuery }
    >({
      query: ({ page, query }) => {
        const params = new URLSearchParams();
        if (query?.userId) params.append("userId", query.userId);
        if (query?.localId !== undefined)
          params.append("localId", String(query.localId));
        if (query?.abierta !== undefined)
          params.append("abierta", String(query.abierta));
        if (query?.desde) params.append("desde", query.desde);
        if (query?.hasta) params.append("hasta", query.hasta);
        if (query?.orderBy) params.append("orderBy", query.orderBy);
        if (query?.asc !== undefined) params.append("asc", String(query.asc));

        const queryString = params.toString();
        return `sesionLocal/page/${page}${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "SesionLocal" as const,
                id,
              })),
              { type: "SesionLocal", id: "LIST" },
            ]
          : [{ type: "SesionLocal", id: "LIST" }],
    }),
    getSesionLocal: build.query<SesionLocalDto, number>({
      query: (id) => `sesionLocal/${id}`,
      providesTags: (_result, _error, id) => [{ type: "SesionLocal", id }],
    }),
    getActiveSesionByCurrentUser: build.query<SesionLocalDto | null, void>({
      query: () => "sesionLocal/get-active-sesion-by-current-user",
      providesTags: [{ type: "SesionLocal", id: "ACTIVE" }],
    }),
    openSesionLocal: build.mutation<
      SesionLocalDto,
      { localId: number; body: SesionLocalRequest }
    >({
      query: ({ localId, body }) => ({
        url: `sesionLocal/open/${localId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "SesionLocal", id: "LIST" },
        { type: "SesionLocal", id: "ACTIVE" },
        { type: "Local", id: "LIST" },
      ],
    }),
    closeSesionLocal: build.mutation<
      SesionLocalDto,
      { localId: number; body: SesionLocalRequest }
    >({
      query: ({ localId, body }) => ({
        url: `sesionLocal/close/${localId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "SesionLocal", id: "LIST" },
        { type: "SesionLocal", id: "ACTIVE" },
        { type: "Local", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllSesionesLocalQuery,
  useGetSesionLocalQuery,
  useGetActiveSesionByCurrentUserQuery,
  useOpenSesionLocalMutation,
  useCloseSesionLocalMutation,
} = sesionLocalApi;
