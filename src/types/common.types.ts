// Tipos base compartidos entre todos los módulos

export interface BaseDto {
  id: string;
  createAt: string;
  updateAt: string;
  deleteAt?: string;
  active: boolean;
}

export interface BaseQuery {
  nombre?: string;
  orderBy?: string;
  asc?: boolean;
}

export interface PageResponse<T> {
  data: T[];
  totalRecords: number;
  page: number;
  recordsPerPage: number;
}
