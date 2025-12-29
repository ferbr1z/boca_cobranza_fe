import type { BaseDto, BaseQuery } from './common.types';

export interface TransferenciaDto extends BaseDto {
  tipoMovimiento: number;
  isEntrada: boolean;
  monto: number;
  descripcion?: string;
  cuentaBancariaId: number;
  cuentaBancariaNombre: string;
  numeroTransaccion: string;
  cobroComision: number;
}

export interface TransferenciaRequest {
  cuentaBancariaId: number;
  cajaId: number;
  monto: number;
  numeroTransaccion: string;
}

export interface TransferenciaQuery extends BaseQuery {
  localId?: number;
  sesionLocalId?: number;
  cuentaBancariaId?: number;
  numeroTransaccion?: string;
  isEntrada?: boolean;
}
