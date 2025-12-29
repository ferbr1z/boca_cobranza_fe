import { baseApi } from "./baseApi";
import type {
  RedDePagosMovDto,
  RedDePagoMovRequest,
  RedDePagoMovQuery,
  PageResponse,
  InformeDelMesDto,
} from "../../types";

export const redDePagosMovApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllRedDePagosMov: build.query<
      PageResponse<RedDePagosMovDto>,
      { page: number; query?: RedDePagoMovQuery }
    >({
      query: ({ page, query }) => {
        const params = new URLSearchParams();
        if (query?.redDePagoId !== undefined)
          params.append("redDePagoId", String(query.redDePagoId));
        if (query?.localId !== undefined)
          params.append("localId", String(query.localId));
        if (query?.mes !== undefined) params.append("mes", String(query.mes));
        if (query?.año !== undefined) params.append("año", String(query.año));
        if (query?.fechaInicio) params.append("fechaInicio", query.fechaInicio);
        if (query?.fechaFin) params.append("fechaFin", query.fechaFin);
        if (query?.orderBy) params.append("orderBy", query.orderBy);
        if (query?.asc !== undefined) params.append("asc", String(query.asc));

        const queryString = params.toString();
        return `RedDePagosMov/page/${page}${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "RedDePagosMov" as const,
                id,
              })),
              { type: "RedDePagosMov", id: "LIST" },
            ]
          : [{ type: "RedDePagosMov", id: "LIST" }],
    }),
    getRedDePagosMovById: build.query<RedDePagosMovDto, number>({
      query: (id) => `RedDePagosMov/${id}`,
      providesTags: (_, __, id) => [{ type: "RedDePagosMov", id }],
    }),
    createRedDePagosMov: build.mutation<RedDePagosMovDto, RedDePagoMovRequest>({
      query: (body) => ({
        url: "RedDePagosMov",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "RedDePagosMov", id: "LIST" },
        { type: "Caja", id: "LIST" },
      ],
    }),
    getInformeDelMes: build.query<InformeDelMesDto, RedDePagoMovQuery>({
      query: (query) => {
        const params = new URLSearchParams();
        if (query?.redDePagoId !== undefined)
          params.append("redDePagoId", String(query.redDePagoId));
        if (query?.localId !== undefined)
          params.append("localId", String(query.localId));
        if (query?.mes !== undefined) params.append("mes", String(query.mes));
        if (query?.año !== undefined) params.append("año", String(query.año));

        const queryString = params.toString();
        return `RedDePagosMov/informe${queryString ? `?${queryString}` : ""}`;
      },
    }),
  }),
});

export const {
  useGetAllRedDePagosMovQuery,
  useLazyGetAllRedDePagosMovQuery,
  useGetRedDePagosMovByIdQuery,
  useCreateRedDePagosMovMutation,
  useGetInformeDelMesQuery,
} = redDePagosMovApi;
