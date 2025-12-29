import { baseApi } from './baseApi';
import type {
  UserDto,
  UserRequest,
  UserUpdateRequest,
  UserQuery,
  PageResponse,
} from '../../types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllUser: build.query<PageResponse<UserDto>, { page: number; query?: UserQuery }>({
      query: ({ page, query }) => {
        const params = new URLSearchParams();
        if (query?.userName) params.append('userName', query.userName);
        if (query?.role !== undefined) params.append('role', String(query.role));
        if (query?.localId !== undefined) params.append('localId', String(query.localId));
        if (query?.orderBy) params.append('orderBy', query.orderBy);
        if (query?.asc !== undefined) params.append('asc', String(query.asc));

        const queryString = params.toString();
        return `user/page/${page}${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),
    getUser: build.query<UserDto, string>({
      query: (id) => `user/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    addUser: build.mutation<UserDto, UserRequest>({
      query: (body) => ({
        url: 'user',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    updateUser: build.mutation<UserDto, { id: string; body: UserUpdateRequest }>({
      query: ({ id, body }) => ({
        url: `user/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
    deleteUser: build.mutation<void, string>({
      query: (id) => ({
        url: `user/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllUserQuery,
  useGetUserQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
