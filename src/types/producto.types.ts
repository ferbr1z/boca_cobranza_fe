import type { BaseDto, BaseQuery } from "./common.types";

export interface ProductoDto extends BaseDto {
  nombre: string;
  codigo: string;
  localId: number;
  localNombre?: string;
  precio: number;
  costo: number;
  stock: number;
  isServicio: boolean;
}

export interface ProductoRequest {
  localId: number;
  nombre: string;
  codigo: string;
  precio: number;
  costo: number;
  stock: number;
  isServicio: boolean;
}

export interface ProductoQuery extends BaseQuery {
  localId?: number;
  stock?: boolean;
  busqueda?: string;
  isServicio: boolean;
}
