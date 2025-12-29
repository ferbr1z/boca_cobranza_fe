export const TIPO_MOVIMIENTO_LABELS: Record<number, string> = {
  1: "Pago Efectivo",
  2: "Pago Transferencia",
  3: "Pago POS",
  4: "Transferencia",
  5: "Operación Operadora",
  6: "Red de Pago",
};

export const TipoMovimiento = {
  PagoEfectivo: 1,
  PagoTransferencia: 2,
  PagoPos: 3,
  Transferencia: 4,
  OperacionOperadora: 5,
  RedDePago: 6,
} as const;
