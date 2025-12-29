import React from "react";
import {
  Box,
  Typography,
  Divider,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useGetVentaQuery } from "../../../services/api/ventasApi";
import { formatCurrency } from "../../../utils/format";
import { formatDateTime } from "../../../utils/dateFormat";

interface VentaDetailsProps {
  ventaId: number;
}

export const VentaDetails: React.FC<VentaDetailsProps> = ({ ventaId }) => {
  const { data: venta, isLoading } = useGetVentaQuery(ventaId);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!venta) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">No se pudo cargar la venta</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Información General
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="text.secondary">ID:</Typography>
            <Typography>{venta.id}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="text.secondary">Fecha:</Typography>
            <Typography>{formatDateTime(venta.createAt)}</Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Productos
        </Typography>
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="center">Cantidad</TableCell>
                <TableCell align="right">Precio Unit.</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {venta.detalles.map((detalle) => (
                <TableRow key={detalle.id}>
                  <TableCell>{detalle.productoNombre}</TableCell>
                  <TableCell align="center">{detalle.cantidad}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(detalle.precioUnitario)} Gs.
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(detalle.cantidad * detalle.precioUnitario)}{" "}
                    Gs.
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      <Divider />

      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Formas de Pago
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {venta.pagoEfectivo && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip label="Efectivo" color="success" size="small" />
                <Typography variant="body2">
                  {venta.pagoEfectivo.cajaNombre}
                </Typography>
              </Box>
              <Typography>
                {formatCurrency(venta.pagoEfectivo.monto)} Gs.
              </Typography>
            </Box>
          )}
          {venta.pagosTransferencia.map((pago) => (
            <Box
              key={pago.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip label="Transferencia" color="primary" size="small" />
                <Typography variant="body2">
                  {pago.cuentaBancariaNombre}
                </Typography>
              </Box>
              <Typography>{formatCurrency(pago.monto)} Gs.</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Monto Total:</Typography>
          <Typography variant="h6">
            {formatCurrency(venta.montoTotal)} Gs.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography>Monto Pagado:</Typography>
          <Typography>{formatCurrency(venta.montoPagado)} Gs.</Typography>
        </Box>
        {venta.montoVuelto > 0 && (
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="success.main">Vuelto:</Typography>
            <Typography color="success.main">
              {formatCurrency(venta.montoVuelto)} Gs.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
