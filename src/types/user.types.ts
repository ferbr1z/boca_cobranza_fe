import type { BaseDto, BaseQuery } from "./common.types";

export type RoleEnum = 1 | 2;

export interface UserDto extends BaseDto {
  userName: string;
  telefono: string;
  role: RoleEnum;
  localId?: number;
  localNombre?: string;
  modifyStock?: boolean;
}

export interface UserRequest {
  userName: string;
  telefono: string;
  password: string;
  role: RoleEnum;
  localId?: number;
  modifyStock: boolean;
}

export interface UserUpdateRequest {
  userName?: string;
  telefono?: string;
  password?: string;
  role?: RoleEnum;
  localId?: number;
  modifyStock?: boolean;
}

export interface UserQuery extends BaseQuery {
  userName?: string;
  role?: RoleEnum;
  localId?: number;
}
