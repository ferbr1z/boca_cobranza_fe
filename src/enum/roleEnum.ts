export const ROLE_VALUES = ['ADMIN', 'USER'] as const;

export type RoleEnum = (typeof ROLE_VALUES)[number];

export const ROLE_NUMBERS = [1, 2] as const;

export type RoleNumber = (typeof ROLE_NUMBERS)[number];

export const ROLE_OPTIONS = [
  { value: 1, label: 'Administrador' },
  { value: 2, label: 'Usuario' },
];
