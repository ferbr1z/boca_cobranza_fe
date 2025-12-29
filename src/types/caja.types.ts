import type { BaseDto, BaseQuery } from './common.types';

export interface CajaDto extends BaseDto {
  nombre: string;
  monto: number;
  localId: number;
}

export interface CajaRequest {
  nombre: string;
  localId: number;
}

export interface CajaQuery extends BaseQuery {
  localId?: number;
}
