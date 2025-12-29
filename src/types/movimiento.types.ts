import type { BaseDto, BaseQuery } from "./common.types";

export interface MovimientoDto extends BaseDto {
  tipoMovimiento: number;
  isEntrada: boolean;
  monto: number;
  descripcion?: string;
  cajaId?: number;
  cajaNombre?: string;
  cuentaBancariaId?: number;
  cuentaBancariaNombre?: string;
  posId?: number;
  posNombre?: string;
  operadoraId?: number;
  operadoraNombre?: string;
  redDePagoId?: number;
  numeroTransaccion?: string;
  cobroComision?: number;
  isBilletera?: boolean;
}

export interface MovimientoQuery extends BaseQuery {
  ventaId?: number;
  operadoraId?: number;
  sesionLocalId?: number;
  localId?: number;
  tipoMovimiento?: number;
  fechaInicio?: string;
  fechaFin?: string;
}
