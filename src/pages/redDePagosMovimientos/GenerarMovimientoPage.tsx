import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { Wallet } from "@mui/icons-material";
import { useLocalFilter } from "../../contexts/LocalFilterContext";
import { useGetActiveSesionByCurrentUserQuery } from "../../services/api/sesionLocalApi";
import {
  useLazyGetAllCajasQuery,
  useLazyGetCajaQuery,
} from "../../services/api/cajasApi";
import { useGetCurrentRedDePagoQuery } from "../../services/api/cuentasBancariasApi";
import { useCreateRedDePagosMovMutation } from "../../services/api/redDePagosMovApi";
import { notify } from "../../utils/notify";
import { formatCurrency } from "../../utils/format";
import { NumericInput } from "../../components/NumericInput";
import { AsyncSelectField } from "../../components/AsyncSelectField";
import type { AsyncSelectOption } from "../../components/AsyncSelectField";
import type { ComisionCuentaBancariaDto } from "../../types";

interface CajaData {
  id: string;
  nombre: string;
  monto: number;
}

const GenerarMovimientoPage: React.FC = () => {
  const { selectedLocalId } = useLocalFilter();
  const [monto, setMonto] = useState<number>(0);
  const [caja, setCaja] = useState<AsyncSelectOption | null>(null);
  const [cajaData, setCajaData] = useState<CajaData | null>(null);

  const { data: sesionActiva } = useGetActiveSesionByCurrentUserQuery();
  const { data: redDePagos, isLoading: isLoadingRedDePagos } =
    useGetCurrentRedDePagoQuery();
  const [lazyGetAllCajas] = useLazyGetAllCajasQuery();
  const [lazyGetCaja] = useLazyGetCajaQuery();
  const [createMovimiento, { isLoading: isCreating }] =
    useCreateRedDePagosMovMutation();

  const calculateComision = useMemo(() => {
    return (monto: number, comisiones: ComisionCuentaBancariaDto[]): number => {
      if (!comisiones || comisiones.length === 0) return 0;

      const match = comisiones
        .filter((c) => monto >= c.base)
        .sort((a, b) => b.base - a.base)[0];

      return match?.comision ?? 0;
    };
  }, []);

  const comision = useMemo(() => {
    if (!redDePagos || !monto) return 0;
    return calculateComision(monto, redDePagos.comisionCuentaBancarias);
  }, [monto, redDePagos, calculateComision]);

  const montoFinal = monto + comision;

  useEffect(() => {
    setMonto(0);
    setCaja(null);
    setCajaData(null);

    if (selectedLocalId) {
      lazyGetAllCajas({
        page: 1,
        query: { nombre: "", localId: selectedLocalId },
      })
        .unwrap()
        .then((response) => {
          if (response.data.length > 0) {
            const firstCaja = response.data[0];
            setCaja({
              value: firstCaja.id,
              label: `${firstCaja.nombre} - ${formatCurrency(
                firstCaja.monto
              )} Gs.`,
            });
          }
        })
        .catch(() => {});
    }
  }, [selectedLocalId, lazyGetAllCajas]);

  const refreshCajaData = () => {
    if (caja) {
      lazyGetCaja(Number(caja.value))
        .unwrap()
        .then((data) => {
          const cajaActualizada = data as CajaData;
          setCajaData(cajaActualizada);
          setCaja({
            value: cajaActualizada.id,
            label: `${cajaActualizada.nombre} - ${formatCurrency(
              cajaActualizada.monto
            )} Gs.`,
          });
        })
        .catch(() => setCajaData(null));
    }
  };

  useEffect(() => {
    if (caja) {
      lazyGetCaja(Number(caja.value))
        .unwrap()
        .then((data) => setCajaData(data as CajaData))
        .catch(() => setCajaData(null));
    } else {
      setCajaData(null);
    }
  }, [caja, lazyGetCaja]);

  const handleSubmit = async () => {
    if (!sesionActiva) {
      notify.error("No hay una sesión activa");
      return;
    }

    if (!redDePagos) {
      notify.error("No existe una Red de Pagos activa");
      return;
    }

    if (!caja || !monto) {
      notify.error("Por favor complete todos los campos");
      return;
    }

    if (monto < 10000) {
      notify.error("El monto mínimo es 10,000 Gs.");
      return;
    }

    if (cajaData && cajaData.monto < monto) {
      notify.error("La caja no tiene saldo suficiente para cubrir el monto");
      return;
    }

    try {
      await createMovimiento({
        cajaId: Number(caja.value),
        monto,
      }).unwrap();

      notify.success("Movimiento realizado exitosamente");
      setMonto(0);
      refreshCajaData();
    } catch (error: any) {
      notify.error(error?.data?.message || "Error al procesar el movimiento");
    }
  };

  if (!selectedLocalId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Por favor, selecciona un local del menú para generar movimientos
        </Alert>
      </Box>
    );
  }

  if (!sesionActiva) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Debes tener una sesión activa para generar movimientos
        </Alert>
      </Box>
    );
  }

  if (isLoadingRedDePagos) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  if (!redDePagos) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          No existe una Red de Pagos activa para este local. Contacte al
          administrador.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          Generar Movimiento - Red de Pagos
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Caja
              </Typography>
              <AsyncSelectField
                key={`caja-${selectedLocalId}`}
                label="Seleccionar Caja"
                value={caja}
                onChange={setCaja}
                loadOptions={async (inputValue: string) => {
                  const response = await lazyGetAllCajas({
                    page: 1,
                    query: { nombre: inputValue, localId: selectedLocalId },
                  }).unwrap();
                  return response.data.map((c) => ({
                    value: c.id,
                    label: `${c.nombre} - ${formatCurrency(c.monto)} Gs.`,
                  }));
                }}
                placeholder="Seleccionar caja..."
              />
              {cajaData && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "success.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "success.200",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Wallet color="success" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={600}>
                      {cajaData.nombre}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Saldo Actual:{" "}
                    <strong>{formatCurrency(cajaData.monto)} Gs.</strong>
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Detalles del Movimiento
              </Typography>
              <NumericInput
                label="Monto (Gs.)"
                value={monto}
                onChange={setMonto}
                allowDecimal={false}
                fullWidth
                size="medium"
              />
              {monto > 0 && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2.5,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    Resumen de la Operación
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Monto a Transferir:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatCurrency(monto)} Gs.
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Comisión:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatCurrency(comision)} Gs.
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body1" fontWeight={600}>
                        Total a Descontar de Caja:
                      </Typography>
                      <Chip
                        label={`${formatCurrency(monto)} Gs.`}
                        color="primary"
                        sx={{ fontWeight: 600, fontSize: "0.95rem" }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      * La caja perderá solo el monto base (sin comisión)
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      * El movimiento registrará {formatCurrency(montoFinal)}{" "}
                      Gs. (monto + comisión)
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={isCreating || !caja || !monto}
              sx={{ minWidth: 250, py: 1.5, fontSize: "1.1rem" }}
            >
              {isCreating ? "Procesando..." : "Realizar Movimiento"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default GenerarMovimientoPage;
