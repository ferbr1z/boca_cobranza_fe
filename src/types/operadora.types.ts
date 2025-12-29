import type { BaseDto, BaseQuery } from "./common.types";

export interface OperadoraDto extends BaseDto {
  nombre: string;
  localId: number;
  numeroTelefono: string;
  monto: number;
  montoBilletera: number;
}

export interface OperadoraRequest {
  nombre: string;
  localId: number;
  numeroTelefono: string;
}

export interface OperadoraQuery extends BaseQuery {
  numeroTelefono?: string;
  localId?: number;
}
