import type { BaseDto, BaseQuery } from './common.types';

export interface LocalDto extends BaseDto {
  nombre: string;
}

export interface LocalRequest {
  nombre: string;
}

export interface LocalQuery extends BaseQuery {}
