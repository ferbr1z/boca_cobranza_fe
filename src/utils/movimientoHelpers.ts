import type { MovimientoDto } from "../types";

export const getFuenteDeFondoNombre = (movimiento: MovimientoDto): string => {
  switch (movimiento.tipoMovimiento) {
    case 1:
      return movimiento.cajaNombre || "-";
    case 2:
      return movimiento.cuentaBancariaNombre || "-";
    case 3:
      return movimiento.posNombre || "-";
    case 4:
      return movimiento.cuentaBancariaNombre || "-";
    case 5:
      return movimiento.operadoraNombre || "-";
    case 6:
      return movimiento.cajaNombre || "-";
    default:
      return "-";
  }
};
