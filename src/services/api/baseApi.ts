import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (typeof window !== "undefined" && (window as any).__API_BASE_URL__) ??
  "/";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const baseQueryWithAuthHandling: typeof rawBaseQuery = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (
    "error" in result &&
    result.error &&
    (result.error as any).status === 401
  ) {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {}
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: [
    "Auth",
    "User",
    "Caja",
    "CuentaBancaria",
    "Local",
    "Operadora",
    "SesionLocal",
    "SistemaExterno",
    "Producto",
    "Venta",
    "Pos",
    "Transferencia",
    "Movimiento",
    "RedDePagosMov",
    "OperacionOperadora",
  ] as const,
  keepUnusedDataFor: 0,
  endpoints: () => ({}),
});
