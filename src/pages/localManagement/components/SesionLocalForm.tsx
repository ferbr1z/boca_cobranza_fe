import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Typography, Divider, TextField } from "@mui/material";
import { useLazyGetAllCajasQuery } from "../../../services/api/cajasApi";
import { useLazyGetAllCuentasBancariasQuery } from "../../../services/api/cuentasBancariasApi";
import { useLazyGetAllOperadorasQuery } from "../../../services/api/operadorasApi";
import { useLazyGetAllSistemaExternoQuery } from "../../../services/api/sistemaExternoApi";
import { useLazyGetAllPosQuery } from "../../../services/api/posApi";
import { useGetActiveSesionByCurrentUserQuery } from "../../../services/api/sesionLocalApi";
import type {
  SesionLocalRequest,
  DetalleSesionLocalRequest,
} from "../../../types";
import { NumericInput } from "../../../components/NumericInput";

interface SesionLocalFormProps {
  onSubmit: (data: SesionLocalRequest) => void;
  loading?: boolean;
  localId: number;
  mode: "open" | "close";
}

interface FuenteFondo {
  id: number;
  nombre: string;
  tipo: "Caja" | "Cuenta" | "Operadora" | "Sistema" | "Pos";
}

interface DetalleForm {
  fuenteDeFondoId: number;
  fuenteNombre: string;
  tipo: "Caja" | "Cuenta" | "Operadora" | "Sistema" | "Pos";
  monto: number;
  montoBilletera: number;
  montoCierreEstimado?: number;
  montoBilleteraEstimado?: number;
}

export const SesionLocalForm: React.FC<SesionLocalFormProps> = ({
  onSubmit,
  loading = false,
  localId,
  mode,
}) => {
  const [detalles, setDetalles] = useState<DetalleForm[]>([]);
  const [observaciones, setObservaciones] = useState<string>("");

  const [lazyGetCajas] = useLazyGetAllCajasQuery();
  const [lazyGetCuentas] = useLazyGetAllCuentasBancariasQuery();
  const [lazyGetOperadoras] = useLazyGetAllOperadorasQuery();
  const [lazyGetSistemas] = useLazyGetAllSistemaExternoQuery();
  const [lazyGetPos] = useLazyGetAllPosQuery();
  const { data: activeSesion, isLoading: isLoadingActiveSesion } =
    useGetActiveSesionByCurrentUserQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });

  const loadAllFuentes = useCallback(async () => {
    if (mode === "close" && activeSesion?.detalleSesionLocal) {
      const initialDetalles: DetalleForm[] =
        activeSesion.detalleSesionLocal.map((d) => {
          let tipo: "Caja" | "Cuenta" | "Operadora" | "Sistema" | "Pos" =
            "Sistema";
          if (d.tipoFuente === 1) tipo = "Operadora";
          else if (d.tipoFuente === 2) tipo = "Caja";
          else if (d.tipoFuente === 3) tipo = "Cuenta";
          else if (d.tipoFuente === 4) tipo = "Sistema";
          else if (d.tipoFuente === 5) tipo = "Pos";

          return {
            fuenteDeFondoId: d.fuenteDeFondoId,
            fuenteNombre: d.fuenteDeFondoNombre,
            tipo,
            monto: 0,
            montoBilletera: 0,
            montoCierreEstimado: d.montoCierreEstimado,
            montoBilleteraEstimado: d.montoBilleteraEstimado,
          };
        });
      setDetalles(initialDetalles);
      return;
    }

    try {
      const [cajas, cuentas, operadoras, sistemas, pos] = await Promise.all([
        lazyGetCajas({ page: 1, query: { localId } }).unwrap(),
        lazyGetCuentas({ page: 1, query: { localId } }).unwrap(),
        lazyGetOperadoras({ page: 1, query: { localId } }).unwrap(),
        lazyGetSistemas({ page: 1, query: { localId } }).unwrap(),
        lazyGetPos({ page: 1, query: { localId } }).unwrap(),
      ]);

      const fuentes: FuenteFondo[] = [
        ...cajas.data.map((c) => ({
          id: Number(c.id),
          nombre: c.nombre,
          tipo: "Caja" as const,
        })),
        ...cuentas.data.map((c) => ({
          id: Number(c.id),
          nombre: c.nombre,
          tipo: "Cuenta" as const,
        })),
        ...operadoras.data.map((o) => ({
          id: Number(o.id),
          nombre: o.nombre,
          tipo: "Operadora" as const,
        })),
        ...sistemas.data.map((s) => ({
          id: Number(s.id),
          nombre: s.nombre,
          tipo: "Sistema" as const,
        })),
        ...pos.data.map((p) => ({
          id: Number(p.id),
          nombre: p.nombre,
          tipo: "Pos" as const,
        })),
      ];

      const initialDetalles: DetalleForm[] = fuentes.map((f) => ({
        fuenteDeFondoId: f.id,
        fuenteNombre: `${f.tipo}: ${f.nombre}`,
        tipo: f.tipo,
        monto: 0,
        montoBilletera: 0,
      }));

      setDetalles(initialDetalles);
    } catch {
      setDetalles([]);
    }
  }, [
    lazyGetCajas,
    lazyGetCuentas,
    lazyGetOperadoras,
    lazyGetSistemas,
    lazyGetPos,
    localId,
    mode,
    activeSesion,
  ]);

  useEffect(() => {
    loadAllFuentes();
  }, [loadAllFuentes]);

  const handleMontoChange = (index: number, value: number) => {
    const newDetalles = [...detalles];
    newDetalles[index] = { ...newDetalles[index], monto: value };
    setDetalles(newDetalles);
  };

  const handleMontoBilleteraChange = (index: number, value: number) => {
    const newDetalles = [...detalles];
    newDetalles[index] = { ...newDetalles[index], montoBilletera: value };
    setDetalles(newDetalles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (detalles.length === 0) {
      return;
    }

    const detalleSesionLocal: DetalleSesionLocalRequest[] = detalles.map(
      (d) => ({
        fuenteDeFondoId: d.fuenteDeFondoId,
        monto: d.monto,
        montoBilletera: d.tipo === "Operadora" ? d.montoBilletera : 0,
      })
    );

    const observacionesValue = mode === "open" ? "" : observaciones.trim();

    onSubmit({
      observaciones: observacionesValue || undefined,
      detalleSesionLocal,
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Typography variant="body2" color="text.secondary">
        {mode === "open"
          ? "Ingresa los montos de apertura para cada fuente de fondo (valor por defecto: 0)"
          : "Ingresa los montos de cierre para cada fuente de fondo"}
      </Typography>

      {mode === "close" && (
        <TextField
          label="Observaciones (opcional)"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          multiline
          rows={3}
          fullWidth
          disabled={loading}
          placeholder="Ingresa cualquier observación sobre esta sesión..."
        />
      )}

      {detalles.length === 0 && (mode === "open" || isLoadingActiveSesion) && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 2 }}
        >
          Cargando fuentes de fondo...
        </Typography>
      )}

      {detalles.length === 0 && mode === "close" && !isLoadingActiveSesion && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 2 }}
        >
          No hay una sesión activa para cerrar
        </Typography>
      )}

      {detalles.length > 0 && (
        <>
          {["Caja", "Cuenta", "Operadora", "Sistema", "Pos"].map((tipo) => {
            const detallesPorTipo = detalles.filter((d) => d.tipo === tipo);
            if (detallesPorTipo.length === 0) return null;

            return (
              <Box key={tipo}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>
                  {tipo === "Pos" ? "POS" : `${tipo}s`}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {detallesPorTipo.map((detalle) => {
                  const globalIndex = detalles.findIndex(
                    (d) => d.fuenteDeFondoId === detalle.fuenteDeFondoId
                  );
                  return (
                    <Box
                      key={detalle.fuenteDeFondoId}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {detalle.fuenteNombre}
                      </Typography>

                      <NumericInput
                        label={
                          mode === "open"
                            ? "Monto de Apertura (Gs.)"
                            : "Monto de Cierre (Gs.)"
                        }
                        value={detalle.monto}
                        onChange={(value) =>
                          handleMontoChange(globalIndex, value)
                        }
                        fullWidth
                        allowDecimal={false}
                      />

                      {mode === "close" &&
                        detalle.montoCierreEstimado !== undefined &&
                        detalle.montoCierreEstimado !== null && (
                          <Typography variant="body2" color="text.secondary">
                            Monto de cierre estimado: Gs.{" "}
                            {detalle.montoCierreEstimado.toLocaleString(
                              "es-PY"
                            )}
                          </Typography>
                        )}

                      {detalle.tipo === "Operadora" && (
                        <NumericInput
                          label={
                            mode === "open"
                              ? "Monto Billetera de Apertura (Gs.)"
                              : "Monto Billetera de Cierre (Gs.)"
                          }
                          value={detalle.montoBilletera}
                          onChange={(value) =>
                            handleMontoBilleteraChange(globalIndex, value)
                          }
                          fullWidth
                          allowDecimal={false}
                        />
                      )}

                      {mode === "close" &&
                        detalle.tipo === "Operadora" &&
                        detalle.montoBilleteraEstimado !== undefined &&
                        detalle.montoBilleteraEstimado !== null && (
                          <Typography variant="body2" color="text.secondary">
                            Monto billetera estimado: Gs.{" "}
                            {detalle.montoBilleteraEstimado.toLocaleString(
                              "es-PY"
                            )}
                          </Typography>
                        )}
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </>
      )}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || detalles.length === 0}
        >
          {loading
            ? "Guardando..."
            : mode === "open"
            ? "Abrir Sesión"
            : "Cerrar Sesión"}
        </Button>
      </Box>
    </Box>
  );
};
