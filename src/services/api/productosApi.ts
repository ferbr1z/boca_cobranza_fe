import { baseApi } from "./baseApi";
import type {
  ProductoDto,
  ProductoRequest,
  ProductoQuery,
  PageResponse,
} from "../../types";

export const productosApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllProductos: build.query<
      PageResponse<ProductoDto>,
      { page: number; query?: ProductoQuery }
    >({
      query: ({ page, query }) => {
        const params = new URLSearchParams();
        if (query?.busqueda) params.append("busqueda", query.busqueda);
        if (query?.localId) params.append("localId", String(query.localId));
        if (query?.stock !== undefined)
          params.append("stock", String(query.stock));
        if (query?.orderBy) params.append("orderBy", query.orderBy);
        if (query?.asc !== undefined) params.append("asc", String(query.asc));
        const queryString = params.toString();
        return `producto/page/${page}${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Producto" as const,
                id,
              })),
              { type: "Producto", id: "LIST" },
            ]
          : [{ type: "Producto", id: "LIST" }],
    }),
    getProducto: build.query<ProductoDto, number>({
      query: (id) => `producto/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Producto", id }],
    }),
    addProducto: build.mutation<ProductoDto, ProductoRequest>({
      query: (body) => ({
        url: "producto",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Producto", id: "LIST" }],
    }),
    updateProducto: build.mutation<
      ProductoDto,
      { id: number; body: ProductoRequest }
    >({
      query: ({ id, body }) => ({
        url: `producto/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Producto", id },
        { type: "Producto", id: "LIST" },
      ],
    }),
    deleteProducto: build.mutation<void, number>({
      query: (id) => ({
        url: `producto/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Producto", id },
        { type: "Producto", id: "LIST" },
      ],
    }),
    addStock: build.mutation<ProductoDto, { id: number; cantidad: number }>({
      query: ({ id, cantidad }) => ({
        url: `producto/addstock/${id}?cantidad=${cantidad}`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Producto", id },
        { type: "Producto", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllProductosQuery,
  useLazyGetAllProductosQuery,
  useGetProductoQuery,
  useAddProductoMutation,
  useUpdateProductoMutation,
  useDeleteProductoMutation,
  useAddStockMutation,
} = productosApi;
