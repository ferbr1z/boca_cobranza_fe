import type { BaseDto, BaseQuery } from "./common.types";

export interface ComisionCuentaBancariaDto {
  id: number;
  cuentaBancariaId: number;
  base: number;
  comision: number;
}

export interface ComisionCuentaBancariaRequest {
  base: number;
  comision: number;
}

export interface CuentaBancariaDto extends BaseDto {
  nombre: string;
  monto: number;
  localId: number;
  localNombre?: string;
  comision: number;
  porDefecto: boolean;
  redDePagos: boolean;
  comisionCuentaBancarias: ComisionCuentaBancariaDto[];
}

export interface CuentaBancariaRequest {
  nombre: string;
  localId: number;
  comision: number;
  porDefecto: boolean;
  redDePagos: boolean;
  comisionCuentaBancarias: ComisionCuentaBancariaRequest[];
}

export interface CuentaBancariaQuery extends BaseQuery {
  localId?: number;
}
