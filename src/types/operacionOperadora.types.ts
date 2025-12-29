import type { BaseDto, BaseQuery } from "./common.types";

export interface OperacionOperadoraDto extends BaseDto {
  operadoraId: number;
  operadoraNombre: string;
  isBilletera: boolean;
  tipoMovimiento: number;
  isEntrada: boolean;
  monto: number;
  descripcion?: string;
}

export interface OperacionRequest {
  cajaId: number;
  operadoraId: number;
  monto: number;
  descripcion?: string;
}

export interface OperacionOperadoraQuery extends BaseQuery {
  operadoraId?: number;
  sesionLocalId?: number;
}
