export const CONTEO_VALUES = ['CantidadOperaciones', 'MontoTotal'] as const;

export type ConteoEnum = (typeof CONTEO_VALUES)[number];

export const CONTEO_NUMBERS = [0, 1] as const;

export type ConteoNumber = (typeof CONTEO_NUMBERS)[number];

export const CONTEO_OPTIONS = CONTEO_VALUES.map((value, index) => ({
  value: index,
  label: value === 'CantidadOperaciones' ? 'Cantidad de Operaciones' : 'Monto Total',
}));
