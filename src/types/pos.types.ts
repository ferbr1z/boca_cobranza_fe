import type { BaseDto, BaseQuery } from './common.types';

export interface PosDto extends BaseDto {
    nombre: string;
    monto: number;
    localId: number;
    localNombre: string;
}

export interface PosRequest {
    nombre: string;
    localId: number;
}

export interface PosQuery extends BaseQuery {
    nombre?: string;
    localId?: number;
}
