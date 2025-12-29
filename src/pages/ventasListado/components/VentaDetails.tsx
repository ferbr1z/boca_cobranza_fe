import React from "react";
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Paper,
  Stack,
} from "@mui/material";
import type { VentaDto } from "../../../types";
import { formatCurrency } from "../../../utils/format";
import { formatDateTime } from "../../../utils/dateFormat";

interface VentaDetailsProps {
  venta?: VentaDto;
  loading?: boolean;
}

export const VentaDetails: React.FC<VentaDetailsProps> = ({
  venta,
  loading,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!venta) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No se encontró la venta</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ mb: 3}}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ opacity: 0.8 }}
              >
                Fecha de Creación
              </Typography>
              <Typography
                variant="body1"
                fontWeight="bold"
              >
                {formatDateTime(venta.createAt)}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ opacity: 0.8 }}
              >
                Responsable
              </Typography>
              { venta.userName }
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Productos
      </Typography>
      {venta.detalles.map((detalle, index) => (
        <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box sx={{ flex: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Producto
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {detalle.productoNombre || "N/A"}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Cantidad
              </Typography>
              <Typography variant="body1">{detalle.cantidad}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Precio Unit.
              </Typography>
              <Typography variant="body1">
                {formatCurrency(detalle.precioUnitario)} Gs.
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Subtotal
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatCurrency(detalle.cantidad * detalle.precioUnitario)} Gs.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      ))}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>
        Formas de Pago
      </Typography>

      {venta.pagoEfectivo && (
        <Paper
          variant="outlined"
          sx={{ p: 2, mb: 2, bgcolor: "success.light" }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color="success.contrastText"
                sx={{ opacity: 0.8 }}
              >
                Tipo
              </Typography>
              <Typography
                variant="body1"
                color="success.contrastText"
                fontWeight="bold"
              >
                Efectivo
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color="success.contrastText"
                sx={{ opacity: 0.8 }}
              >
                Caja
              </Typography>
              <Typography variant="body1" color="success.contrastText">
                {venta.pagoEfectivo.cajaNombre}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color="success.contrastText"
                sx={{ opacity: 0.8 }}
              >
                Monto
              </Typography>
              <Typography
                variant="body1"
                color="success.contrastText"
                fontWeight="bold"
              >
                {formatCurrency(venta.pagoEfectivo.monto)} Gs.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {venta.pagosTransferencia.map((pago, index) => (
        <Paper
          key={index}
          variant="outlined"
          sx={{ p: 2, mb: 2, bgcolor: "info.light" }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color="info.contrastText"
                sx={{ opacity: 0.8 }}
              >
                Tipo
              </Typography>
              <Typography
                variant="body1"
                color="info.contrastText"
                fontWeight="bold"
              >
                Transferencia
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color="info.contrastText"
                sx={{ opacity: 0.8 }}
              >
                Cuenta Bancaria
              </Typography>
              <Typography variant="body1" color="info.contrastText">
                {pago.cuentaBancariaNombre}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color="info.contrastText"
                sx={{ opacity: 0.8 }}
              >
                Monto
              </Typography>
              <Typography
                variant="body1"
                color="info.contrastText"
                fontWeight="bold"
              >
                {formatCurrency(pago.monto)} Gs.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      ))}

      {venta.pagosPos.map((pago, index) => (
        <Paper
          key={index}
          variant="outlined"
          sx={{ p: 2, mb: 2, bgcolor: "secondary.light" }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color="secondary.contrastText"
                sx={{ opacity: 0.8 }}
              >
                Tipo
              </Typography>
              <Typography
                variant="body1"
                color="secondary.contrastText"
                fontWeight="bold"
              >
                POS
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color="secondary.contrastText"
                sx={{ opacity: 0.8 }}
              >
                Terminal POS
              </Typography>
              <Typography variant="body1" color="secondary.contrastText">
                {pago.posNombre}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                color="secondary.contrastText"
                sx={{ opacity: 0.8 }}
              >
                Monto
              </Typography>
              <Typography
                variant="body1"
                color="secondary.contrastText"
                fontWeight="bold"
              >
                {formatCurrency(pago.monto)} Gs.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      ))}

      <Divider sx={{ my: 3 }} />

      <Card sx={{ bgcolor: "grey.100" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Resumen
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {formatCurrency(venta.montoTotal)} Gs.
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Pagado
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {formatCurrency(venta.montoPagado)} Gs.
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Vuelto
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="info.main">
                {formatCurrency(venta.montoVuelto)} Gs.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
