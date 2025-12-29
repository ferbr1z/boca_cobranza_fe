import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  History as HistoryIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useGetSesionLocalQuery } from "../../services/api/sesionLocalApi";
import { formatCurrency } from "../../utils/format";
import { formatDate, formatDateTime } from "../../utils/dateFormat";

const TIPO_FUENTE_LABELS: Record<number, string> = {
  1: "Operadora",
  2: "Caja",
  3: "Cuenta Bancaria",
  4: "Sistema Externo",
  5: "Pos",
};

const SesionLocalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: sesion,
    isLoading,
    error,
  } = useGetSesionLocalQuery(Number(id), {
    skip: !id,
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !sesion) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          No se pudo cargar la información de la sesión
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/home")}
          sx={{ mt: 2 }}
        >
          Volver
        </Button>
      </Box>
    );
  }

  const detallesPorTipo = sesion.detalleSesionLocal.reduce((acc, detalle) => {
    const tipo = TIPO_FUENTE_LABELS[detalle.tipoFuente] || "Otros";
    if (!acc[tipo]) {
      acc[tipo] = [];
    }
    acc[tipo].push(detalle);
    return acc;
  }, {} as Record<string, typeof sesion.detalleSesionLocal>);

  return (
    <Box>
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => navigate("/home")} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                {sesion.localNombre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Resumen {formatDate(sesion.createAt)} -{" "}
                {formatDateTime(sesion.createAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Responsable: {sesion.userName}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<HistoryIcon />}
            endIcon={<ArrowForwardIcon className="arrow-icon" />}
            onClick={() => navigate(`/sesion-local/${sesion.id}/movimientos`)}
            sx={{
              width: { xs: "100%", sm: "auto" },
              "& .arrow-icon": {
                transition: "transform 0.2s ease",
              },
              "&:hover .arrow-icon": {
                transform: "translateX(4px)",
              },
            }}
          >
            Historial de movimientos
          </Button>
        </Box>

        {sesion.observaciones && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Observaciones:
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              {sesion.observaciones}
            </Typography>
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        {Object.entries(detallesPorTipo).map(([tipo, detalles]) => (
          <Grid size={{ xs: 12, md: 6 }} key={tipo}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  {tipo}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {detalles.map((detalle) => (
                    <Box key={detalle.id}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          {detalle.fuenteDeFondoNombre}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Inicio:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(detalle.montoApertura)} Gs.
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Cierre:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: sesion.abierta ? "success.main" : "inherit",
                          }}
                        >
                          {sesion.abierta
                            ? "Caja abierta"
                            : `${formatCurrency(detalle.montoCierre ?? 0)} Gs.`}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontStyle: "italic", fontSize: "0.75rem" }}
                        >
                          Monto estimado:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontStyle: "italic",
                            fontSize: "0.75rem",
                            color: "text.secondary",
                          }}
                        >
                          {detalle.montoCierreEstimado !== null &&
                          detalle.montoCierreEstimado !== undefined
                            ? `${formatCurrency(
                                detalle.montoCierreEstimado
                              )} Gs.`
                            : "No disponible"}
                        </Typography>
                      </Box>
                      {!sesion.abierta &&
                        detalle.montoCierreEstimado !== null &&
                        detalle.montoCierreEstimado !== undefined && (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontStyle: "italic", fontSize: "0.75rem" }}
                            >
                              Diferencia:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontStyle: "italic",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color:
                                  (detalle.montoCierre ?? 0) -
                                    detalle.montoCierreEstimado ===
                                  0
                                    ? "success.main"
                                    : (detalle.montoCierre ?? 0) -
                                        detalle.montoCierreEstimado >
                                      0
                                    ? "warning.main"
                                    : "error.main",
                              }}
                            >
                              {(() => {
                                const diferencia =
                                  (detalle.montoCierre ?? 0) -
                                  detalle.montoCierreEstimado;
                                const signo =
                                  diferencia > 0
                                    ? "+"
                                    : diferencia < 0
                                    ? "-"
                                    : "";
                                return `${signo}${formatCurrency(
                                  Math.abs(diferencia)
                                )} Gs.`;
                              })()}
                            </Typography>
                          </Box>
                        )}
                      {detalle !== detalles[detalles.length - 1] && (
                        <Divider sx={{ mt: 2 }} />
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {!sesion.abierta &&
          Object.values(detallesPorTipo)
            .flat()
            .some(
              (detalle) =>
                detalle.montoCierreEstimado !== null &&
                detalle.montoCierreEstimado !== undefined
            ) && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Estado:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                  Esta sesión está cerrada
                </Typography>
              </Alert>
            </Grid>
          )}
      </Grid>
    </Box>
  );
};

export default SesionLocalDetailPage;
