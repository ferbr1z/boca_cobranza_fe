import type { BaseQuery } from "./common.types";
import type { MovimientoDto } from "./movimiento.types";

export interface RedDePagosMovDto extends MovimientoDto {
  redDePagoId: number;
  cajaId: number;
  cajaNombre: string;
}

export interface RedDePagoMovRequest {
  cajaId: number;
  monto: number;
}

export interface RedDePagoMovQuery extends BaseQuery {
  redDePagoId?: number;
  localId?: number;
  mes: number;
  año: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface InformeDelMesDto {
  total: number;
}
