import type { BaseDto, BaseQuery } from './common.types';

export interface SistemaExternoDto extends BaseDto {
  nombre: string;
  localId: number;
  montoPorOperacion: number;
  conteo: number;
}

export interface SistemaExternoRequest {
  nombre: string;
  localId: number;
  montoPorOperacion: number;
  conteo: number;
}

export interface SistemaExternoQuery extends BaseQuery {
  conteo?: number;
  localId?: number;
}
