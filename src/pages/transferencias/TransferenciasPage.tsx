import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Grid,
  Divider,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { AccountBalance, Wallet } from "@mui/icons-material";
import { useLocalFilter } from "../../contexts/LocalFilterContext";
import { useGetActiveSesionByCurrentUserQuery } from "../../services/api/sesionLocalApi";
import {
  useLazyGetAllCajasQuery,
  useLazyGetCajaQuery,
} from "../../services/api/cajasApi";
import {
  useLazyGetAllCuentasBancariasQuery,
  useLazyGetCuentaBancariaQuery,
} from "../../services/api/cuentasBancariasApi";
import {
  useEnviarTransferenciaMutation,
  useRetirarTransferenciaMutation,
} from "../../services/api/transferenciaApi";
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

interface CuentaBancariaData {
  id: string;
  nombre: string;
  monto: number;
  comisionCuentaBancarias?: ComisionCuentaBancariaDto[];
}

const TransferenciasPage: React.FC = () => {
  const { selectedLocalId } = useLocalFilter();
  const [operacion, setOperacion] = useState<"enviar" | "retirar">("retirar");
  const [monto, setMonto] = useState<number>(0);
  const [numeroTransaccion, setNumeroTransaccion] = useState("");
  const [cuentaBancaria, setCuentaBancaria] =
    useState<AsyncSelectOption | null>(null);
  const [caja, setCaja] = useState<AsyncSelectOption | null>(null);
  const [cajaData, setCajaData] = useState<CajaData | null>(null);
  const [cuentaBancariaData, setCuentaBancariaData] =
    useState<CuentaBancariaData | null>(null);

  const { data: sesionActiva } = useGetActiveSesionByCurrentUserQuery();
  const [lazyGetAllCajas] = useLazyGetAllCajasQuery();
  const [lazyGetAllCuentasBancarias] = useLazyGetAllCuentasBancariasQuery();
  const [lazyGetCaja] = useLazyGetCajaQuery();
  const [lazyGetCuentaBancaria] = useLazyGetCuentaBancariaQuery();

  const [enviarTransferencia, { isLoading: isEnviando }] =
    useEnviarTransferenciaMutation();
  const [retirarTransferencia, { isLoading: isRetirando }] =
    useRetirarTransferenciaMutation();

  const calculateComision = useMemo(() => {
    return (
      monto: number,
      comisiones?: ComisionCuentaBancariaDto[]
    ): number => {
      if (!comisiones || comisiones.length === 0) return 0;

      const match = comisiones
        .filter((c) => monto >= c.base)
        .sort((a, b) => b.base - a.base)[0];

      return match?.comision ?? 0;
    };
  }, []);

  const comision = useMemo(() => {
    if (!cuentaBancariaData || !monto) return 0;
    return calculateComision(monto, cuentaBancariaData.comisionCuentaBancarias);
  }, [monto, cuentaBancariaData, calculateComision]);

  const montoFinal =
    operacion === "enviar" ? monto + comision : monto - comision;

  useEffect(() => {
    setMonto(0);
    setNumeroTransaccion("");
    setCuentaBancaria(null);
    setCaja(null);
    setCajaData(null);
    setCuentaBancariaData(null);

    if (selectedLocalId) {
      lazyGetAllCuentasBancarias({
        page: 1,
        query: { localId: selectedLocalId },
      })
        .unwrap()
        .then((response) => {
          const cuentaPorDefecto = response.data.find((c) => c.porDefecto);
          if (cuentaPorDefecto) {
            setCuentaBancaria({
              value: cuentaPorDefecto.id,
              label: `${cuentaPorDefecto.nombre} - ${formatCurrency(
                cuentaPorDefecto.monto
              )} Gs.`,
            });
          }
        })
        .catch(() => {});

      lazyGetAllCajas({
        page: 1,
        query: { localId: selectedLocalId },
      })
        .unwrap()
        .then((response) => {
          if (response.data.length > 0) {
            const primeraCaja = response.data[0];
            setCaja({
              value: primeraCaja.id,
              label: `${primeraCaja.nombre} - ${formatCurrency(
                primeraCaja.monto
              )} Gs.`,
            });
          }
        })
        .catch(() => {});
    }
  }, [selectedLocalId, lazyGetAllCuentasBancarias, lazyGetAllCajas]);

  useEffect(() => {
    if (caja) {
      lazyGetCaja(Number(caja.value))
        .unwrap()
        .then((data: CajaData) => setCajaData(data))
        .catch(() => setCajaData(null));
    } else {
      setCajaData(null);
    }
  }, [caja, lazyGetCaja]);

  useEffect(() => {
    if (cuentaBancaria) {
      lazyGetCuentaBancaria(Number(cuentaBancaria.value))
        .unwrap()
        .then((data: CuentaBancariaData) => setCuentaBancariaData(data))
        .catch(() => setCuentaBancariaData(null));
    } else {
      setCuentaBancariaData(null);
    }
  }, [cuentaBancaria, lazyGetCuentaBancaria]);

  const refreshCajaData = () => {
    if (caja) {
      lazyGetCaja(Number(caja.value))
        .unwrap()
        .then((data: CajaData) => {
          setCajaData(data);
          setCaja({
            value: data.id,
            label: `${data.nombre} - ${formatCurrency(data.monto)} Gs.`,
          });
        })
        .catch(() => setCajaData(null));
    }
  };

  const refreshCuentaBancariaData = () => {
    if (cuentaBancaria) {
      lazyGetCuentaBancaria(Number(cuentaBancaria.value))
        .unwrap()
        .then((data: CuentaBancariaData) => {
          setCuentaBancariaData(data);
          setCuentaBancaria({
            value: data.id,
            label: `${data.nombre} - ${formatCurrency(data.monto)} Gs.`,
          });
        })
        .catch(() => setCuentaBancariaData(null));
    }
  };

  const handleSubmit = async () => {
    if (!sesionActiva) {
      notify.error("No hay una sesión activa");
      return;
    }

    if (!cuentaBancaria || !caja || !monto || !numeroTransaccion) {
      notify.error("Por favor complete todos los campos");
      return;
    }

    if (monto < 10000) {
      notify.error("El monto mínimo de transferencia es 10,000 Gs.");
      return;
    }

    try {
      const request = {
        cuentaBancariaId: Number(cuentaBancaria.value),
        cajaId: Number(caja.value),
        monto,
        numeroTransaccion,
      };

      if (operacion === "enviar") {
        await enviarTransferencia(request).unwrap();
        notify.success("Transferencia enviada exitosamente");
      } else {
        await retirarTransferencia(request).unwrap();
        notify.success("Transferencia retirada exitosamente");
      }

      setMonto(0);
      setNumeroTransaccion("");
      refreshCajaData();
      refreshCuentaBancariaData();
    } catch (error: any) {
      notify.error(
        error?.data?.message || "Error al procesar la transferencia"
      );
    }
  };

  if (!selectedLocalId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Por favor, selecciona un local del menú para realizar transferencias
        </Alert>
      </Box>
    );
  }

  if (!sesionActiva) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Debes tener una sesión activa para realizar transferencias
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          Transferencias
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                    Tipo de Operación
                  </FormLabel>
                  <RadioGroup
                    row
                    value={operacion}
                    onChange={(e) =>
                      setOperacion(e.target.value as "enviar" | "retirar")
                    }
                    sx={{ gap: 2 }}
                  >
                    <FormControlLabel
                      value="retirar"
                      control={<Radio />}
                      label="Retirar (Caja → Cuenta Bancaria)"
                    />
                    <FormControlLabel
                      value="enviar"
                      control={<Radio />}
                      label="Enviar (Cuenta Bancaria → Caja)"
                    />
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Cuenta Bancaria
                </Typography>
                <AsyncSelectField
                  key={`cuenta-${selectedLocalId}`}
                  label="Seleccionar Cuenta"
                  value={cuentaBancaria}
                  onChange={setCuentaBancaria}
                  loadOptions={async (inputValue: string) => {
                    const response = await lazyGetAllCuentasBancarias({
                      page: 1,
                      query: { nombre: inputValue, localId: selectedLocalId },
                    }).unwrap();
                    return response.data.map((c) => ({
                      value: c.id,
                      label: `${c.nombre} - ${formatCurrency(c.monto)} Gs.`,
                    }));
                  }}
                  placeholder="Seleccionar cuenta bancaria..."
                />
                {cuentaBancariaData && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: "primary.50",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "primary.200",
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
                      <AccountBalance color="primary" fontSize="small" />
                      <Typography variant="subtitle2" fontWeight={600}>
                        {cuentaBancariaData.nombre}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Saldo Actual:{" "}
                      <strong>
                        {formatCurrency(cuentaBancariaData.monto)} Gs.
                      </strong>
                    </Typography>
                    {cuentaBancariaData.comisionCuentaBancarias &&
                    cuentaBancariaData.comisionCuentaBancarias.length > 0 ? (
                      <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Comisiones:
                        </Typography>
                        {cuentaBancariaData.comisionCuentaBancarias.map((c, idx) => (
                          <Typography key={idx} variant="body2" color="text.secondary">
                            {formatCurrency(c.base)} =&gt; {formatCurrency(c.comision)} Gs.
                          </Typography>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Comisión: <strong>{formatCurrency(comision)} Gs.</strong>
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
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
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Detalles de la Transferencia
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <NumericInput
                      label="Monto a Transferir (Gs.)"
                      value={monto}
                      onChange={setMonto}
                      allowDecimal={false}
                      fullWidth
                      size="medium"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Número de Transacción"
                      value={numeroTransaccion}
                      onChange={(e) => setNumeroTransaccion(e.target.value)}
                      placeholder="Ingrese número de transacción"
                      fullWidth
                    />
                  </Grid>
                </Grid>

                {monto > 0 && cuentaBancariaData && (
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
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Monto a Transferir:
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {formatCurrency(monto)} Gs.
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
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
                          {operacion === "enviar"
                            ? "Total a Retirar de Caja:"
                            : "Total a Descontar de Caja:"}
                        </Typography>
                        <Chip
                          label={`${formatCurrency(montoFinal)} Gs.`}
                          color="primary"
                          sx={{ fontWeight: 600, fontSize: "0.95rem" }}
                        />
                      </Box>
                      {operacion === "enviar" && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          * La caja recibirá el monto - comisión
                        </Typography>
                      )}
                      {operacion === "retirar" && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          * La caja perderá el monto + comisión
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={isEnviando || isRetirando}
                sx={{ minWidth: 250, py: 1.5, fontSize: "1.1rem" }}
              >
                {operacion === "enviar" ? "Enviar" : "Retirar"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default TransferenciasPage;
