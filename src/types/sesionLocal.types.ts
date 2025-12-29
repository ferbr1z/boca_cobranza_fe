import type { BaseDto, BaseQuery } from "./common.types";

export interface DetalleSesionLocalDto extends BaseDto {
  sesionLocalId: number;
  fuenteDeFondoNombre: string;
  fuenteDeFondoId: number;
  tipoFuente: number;
  montoApertura: number;
  montoCierre?: number;
  montoCierreEstimado?: number;
  montoBilleteraEstimado?: number;
}

export interface SesionLocalDto extends BaseDto {
  userName: string;
  userId: string;
  localId: number;
  localNombre: string;
  abierta: boolean;
  observaciones?: string;
  detalleSesionLocal: DetalleSesionLocalDto[];
}

export interface DetalleSesionLocalRequest {
  fuenteDeFondoId: number;
  monto: number;
  montoBilletera: number;
}

export interface SesionLocalRequest {
  observaciones?: string;
  detalleSesionLocal: DetalleSesionLocalRequest[];
}

export interface SesionLocalQuery extends BaseQuery {
  userId?: string;
  localId?: number;
  abierta?: boolean;
  desde?: string;
  hasta?: string;
}
