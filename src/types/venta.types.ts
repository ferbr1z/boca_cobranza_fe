import type { BaseDto, BaseQuery } from './common.types';

export interface DetalleVentaDto extends BaseDto {
  ventaId: number;
  productoId: number;
  productoNombre?: string;
  cantidad: number;
  precioUnitario: number;
}

export interface PagoDto extends BaseDto {
  ventaId: number;
  monto: number;
}

export interface PagoEfectivoDto extends PagoDto {
  cajaId: number;
  cajaNombre: string;
}

export interface PagoTransferenciaDto extends PagoDto {
  cuentaBancariaId: number;
  cuentaBancariaNombre: string;
}

export interface PagoPosDto extends PagoDto {
  posId: number;
  posNombre: string;
}

export interface VentaDto extends BaseDto {
  sesionLocalId: number;
  montoTotal: number;
  montoPagado: number;
  montoVuelto: number;
  pagoEfectivo?: PagoEfectivoDto;
  pagosTransferencia: PagoTransferenciaDto[];
  pagosPos: PagoPosDto[];
  detalles: DetalleVentaDto[];
  userName: string;
}

export interface DetalleVentaRequest {
  productoId: number;
  cantidad: number;
}

export interface PagoEfectivoRequest {
  monto: number;
  cajaId: number;
}

export interface PagoTransferenciaRequest {
  monto: number;
  cuentaBancariaId: number;
}

export interface PagoPosRequest {
  monto: number;
  posId: number;
}

export interface VentaRequest {
  pagoEfectivo?: PagoEfectivoRequest;
  pagosTransferencia: PagoTransferenciaRequest[];
  pagosPos: PagoPosRequest[];
  detallesVentaRequest: DetalleVentaRequest[];
}

export interface VentaQuery extends BaseQuery {
  localId?: number;
  sesionLocalId?: number;
  productoId?: number;
  productoNombre?: string;
  cajaId?: number;
  cuentaBancariaId?: number;
}
