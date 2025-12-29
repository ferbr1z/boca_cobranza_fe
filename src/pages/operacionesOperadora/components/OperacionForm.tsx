import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { AccountBalance, Send, MoneyOff } from "@mui/icons-material";
import { useLocalFilter } from "../../../contexts/LocalFilterContext";
import { useGetActiveSesionByCurrentUserQuery } from "../../../services/api/sesionLocalApi";
import {
  useLazyGetAllCajasQuery,
  useLazyGetCajaQuery,
} from "../../../services/api/cajasApi";
import {
  useLazyGetAllOperadorasQuery,
  useLazyGetOperadoraQuery,
} from "../../../services/api/operadorasApi";
import { formatCurrency } from "../../../utils/format";
import { NumericInput } from "../../../components/NumericInput";
import { AsyncSelectField } from "../../../components/AsyncSelectField";
import type { AsyncSelectOption } from "../../../components/AsyncSelectField";
import type { OperacionRequest } from "../../../types";

interface OperacionFormProps {
  title: string;
  description: string;
  icon: React.ReactElement;
  operationType: "cargar-saldo" | "giro-billetera" | "retirar-billetera";
  onSubmit: (data: OperacionRequest) => void;
  loading?: boolean;
  isEntrada?: boolean;
}

export const OperacionForm: React.FC<OperacionFormProps> = ({
  title,
  description,
  icon,
  operationType,
  onSubmit,
  loading = false,
  isEntrada = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { selectedLocalId } = useLocalFilter();
  const [monto, setMonto] = useState<number>(0);
  const [caja, setCaja] = useState<AsyncSelectOption | null>(null);
  const [operadora, setOperadora] = useState<AsyncSelectOption | null>(null);
  const [descripcion, setDescripcion] = useState<string>("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<OperacionRequest | null>(null);
  const [validationError, setValidationError] = useState<string>("");

  const { data: sesionActiva } = useGetActiveSesionByCurrentUserQuery();
  const [lazyGetAllCajas] = useLazyGetAllCajasQuery();
  const [lazyGetAllOperadoras] = useLazyGetAllOperadorasQuery();
  const [lazyGetCaja] = useLazyGetCajaQuery();
  const [lazyGetOperadora] = useLazyGetOperadoraQuery();

  useEffect(() => {
    if (selectedLocalId) {
      loadCajas("");
    }
    loadOperadoras("");
  }, [selectedLocalId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!caja || !operadora || monto <= 0) {
      return;
    }

    if (monto < 1000) {
      setValidationError("El monto mínimo de transferencia es 1.000");
      return;
    }

    const requestData: OperacionRequest = {
      cajaId: Number(caja.value),
      operadoraId: Number(operadora.value),
      monto,
      descripcion: descripcion || undefined,
    };

    setPendingData(requestData);
    setShowConfirmDialog(true);
  };

  const refreshCajaData = () => {
    if (caja) {
      lazyGetCaja(Number(caja.value))
        .unwrap()
        .then((data) => {
          setCaja({
            value: data.id.toString(),
            label: data.nombre,
            monto: data.monto,
          });
        })
        .catch(() => {});
    }
  };

  const refreshOperadoraData = () => {
    if (operadora) {
      lazyGetOperadora(Number(operadora.value))
        .unwrap()
        .then((data) => {
          setOperadora({
            value: data.id.toString(),
            label: data.nombre,
            monto: data.montoBilletera,
          });
        })
        .catch(() => {});
    }
  };

  const handleConfirmSubmit = () => {
    if (pendingData) {
      onSubmit(pendingData);
      setShowConfirmDialog(false);
      setPendingData(null);
      setMonto(0);
      setDescripcion("");
      setValidationError("");
      refreshCajaData();
      refreshOperadoraData();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
    setPendingData(null);
  };

  const loadCajas = async (inputValue: string) => {
    if (!selectedLocalId) return [];

    try {
      const result = await lazyGetAllCajas({
        page: 1,
        query: {
          localId: selectedLocalId,
          nombre: inputValue || undefined,
        },
      }).unwrap();

      const cajasOptions = result.data.map((caja) => ({
        value: caja.id.toString(),
        label: caja.nombre,
        monto: caja.monto,
      }));

      // Si no hay caja seleccionada y hay resultados, seleccionar la primera
      if (!caja && cajasOptions.length > 0 && !inputValue) {
        setCaja(cajasOptions[0]);
      }

      return cajasOptions;
    } catch (error) {
      return [];
    }
  };

  const loadOperadoras = async (inputValue: string) => {
    try {
      const result = await lazyGetAllOperadoras({
        page: 1,
        query: {
          nombre: inputValue || undefined,
        },
      }).unwrap();

      const operadorasOptions = result.data.map((operadora) => ({
        value: operadora.id.toString(),
        label: operadora.nombre,
        monto: operadora.montoBilletera,
      }));

      // Si no hay operadora seleccionada y hay resultados, seleccionar la primera
      if (!operadora && operadorasOptions.length > 0 && !inputValue) {
        setOperadora(operadorasOptions[0]);
      }

      return operadorasOptions;
    } catch (error) {
      return [];
    }
  };

  const getOperationIcon = () => {
    switch (operationType) {
      case "cargar-saldo":
        return <AccountBalance sx={{ fontSize: 40, color: "#4caf50" }} />;
      case "giro-billetera":
        return <Send sx={{ fontSize: 40, color: "#2196f3" }} />;
      case "retirar-billetera":
        return <MoneyOff sx={{ fontSize: 40, color: "#ff9800" }} />;
      default:
        return icon;
    }
  };

  const getOperationColor = () => {
    switch (operationType) {
      case "cargar-saldo":
        return "success";
      case "giro-billetera":
        return "primary";
      case "retirar-billetera":
        return "warning";
      default:
        return "primary";
    }
  };

  if (!sesionActiva?.abierta) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Alert severity="warning" sx={{ maxWidth: 500 }}>
          Debes tener una sesión activa para realizar operaciones de operadora.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: isMobile ? "100%" : "70%",
        mx: isMobile ? 0 : "auto",
        p: isMobile ? 1 : 2,
      }}
    >
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          {getOperationIcon()}
          <Box>
            <Typography variant="h5" component="h1" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Sesión activa: {sesionActiva.userName} - {sesionActiva.localNombre}
        </Alert>

        {validationError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {validationError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <AsyncSelectField
                label="Operadora"
                value={operadora}
                onChange={setOperadora}
                loadOptions={loadOperadoras}
                placeholder="Seleccionar operadora..."
                required
                formatOptionLabel={(option: any) => (
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {option.label}
                    </Typography>
                    {option.monto !== undefined && (
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(option.monto)} Gs.
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Box>

            <Box>
              <AsyncSelectField
                label="Caja"
                value={caja}
                onChange={setCaja}
                loadOptions={loadCajas}
                placeholder="Seleccionar caja..."
                required
                formatOptionLabel={(option: any) => (
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {option.label}
                    </Typography>
                    {option.monto !== undefined && (
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(option.monto)} Gs.
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Box>

            <Box>
              <NumericInput
                label="Monto"
                value={monto}
                onChange={setMonto}
                placeholder="0"
                required
                fullWidth
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Descripción (opcional)
              </Typography>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Agregar descripción de la operación..."
                style={{
                  width: "100%",
                  minHeight: "80px",
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Card sx={{ mb: 3, bgcolor: isEntrada ? "#f8fff8" : "#fff8f8" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen de Operación
              </Typography>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Operadora:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {operadora?.label || "No seleccionada"}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Caja:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {caja?.label || "No seleccionada"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Monto:</Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color={isEntrada ? "success.main" : "error.main"}
                >
                  {isEntrada ? "+" : "-"} Gs. {monto.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Button
            type="submit"
            variant="contained"
            color={getOperationColor()}
            fullWidth
            size="large"
            disabled={loading || !caja || !operadora || monto <= 0}
            sx={{ py: 1.5 }}
          >
            {loading ? "Procesando..." : title}
          </Button>
        </form>

        {/* Diálogo de Confirmación */}
        <Dialog
          open={showConfirmDialog}
          onClose={handleCancelSubmit}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirmar Operación</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                ¿Estás seguro de realizar la siguiente operación?
              </Typography>

              <Card sx={{ mt: 2, bgcolor: isEntrada ? "#f8fff8" : "#fff8f8" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {title}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Operadora:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {operadora?.label || "No seleccionada"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Caja:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {caja?.label || "No seleccionada"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Monto:</Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={isEntrada ? "success.main" : "error.main"}
                    >
                      {isEntrada ? "+" : "-"} Gs. {monto.toLocaleString()}
                    </Typography>
                  </Box>

                  {descripcion && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Descripción: {descripcion}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelSubmit} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              variant="contained"
              color={getOperationColor()}
              disabled={loading}
            >
              {loading ? "Procesando..." : "Confirmar"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};
