import { baseApi } from "./baseApi";

export interface LoginRequest {
  telefono: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  name: string;
  email: string;
  role?: string | number;
  localId?: number | string;
  localNombre?: string;
}

export interface UserProfile {
  id: string;
  telefono: string;
  nombre: string;
  autenticado: boolean;
  role?: string | number;
  localId?: number | string;
  localNombre?: string;
  modifyStock?: boolean;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    getProfile: build.query<UserProfile, void>({
      query: () => "auth/whoami",
      providesTags: ["Auth"],
    }),
  }),
});

export const { useLoginMutation, useGetProfileQuery } = authApi;
