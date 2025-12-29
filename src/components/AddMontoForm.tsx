import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Box, Button, Typography } from "@mui/material";
import { NumericInput } from "./NumericInput";
import { formatCurrency } from "../utils/format";

export interface AddMontoFormData {
  monto: number;
}

interface AddMontoFormProps {
  entityName: string;
  montoActual: number;
  onSubmit: (data: AddMontoFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  isSubtract?: boolean;
}

export const AddMontoForm: React.FC<AddMontoFormProps> = ({
  entityName,
  montoActual,
  onSubmit,
  onCancel,
  loading = false,
  isSubtract = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AddMontoFormData>({
    defaultValues: {
      monto: 0,
    },
  });

  const monto = watch("monto");
  const nuevoMonto = isSubtract ? montoActual - monto : montoActual + monto;

  const handleFormSubmit = (data: AddMontoFormData) => {
    if (data.monto <= 0) {
      return;
    }
    if (isSubtract && data.monto > montoActual) {
      return;
    }
    onSubmit(data);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {isSubtract ? "Retirar de" : "Agregar a"}
        </Typography>
        <Typography variant="h6">{entityName}</Typography>
      </Box>

      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Monto Actual
        </Typography>
        <Typography variant="h6">{formatCurrency(montoActual)} Gs.</Typography>
      </Box>

      <Controller
        name="monto"
        control={control}
        rules={{
          required: "El monto es requerido",
          min: { value: 1, message: "El monto debe ser mayor a 0" },
          max: isSubtract
            ? {
                value: montoActual,
                message: "El monto no puede ser mayor al monto actual",
              }
            : undefined,
        }}
        render={({ field: { onChange, value, ...field } }) => (
          <NumericInput
            {...field}
            value={value || 0}
            onChange={onChange}
            label={isSubtract ? "Monto a Retirar" : "Monto a Agregar"}
            allowDecimal={true}
            fullWidth
            error={!!errors.monto}
            helperText={errors.monto?.message}
            disabled={loading}
            required
          />
        )}
      />

      <Box
        sx={{
          p: 2,
          bgcolor: isSubtract ? "warning.light" : "primary.light",
          borderRadius: 1,
        }}
      >
        <Typography
          variant="body2"
          color={isSubtract ? "warning.contrastText" : "primary.contrastText"}
          gutterBottom
        >
          Nuevo Monto
        </Typography>
        <Typography
          variant="h5"
          color={isSubtract ? "warning.contrastText" : "primary.contrastText"}
          fontWeight="bold"
        >
          {formatCurrency(nuevoMonto)} Gs.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={
            loading || monto <= 0 || (isSubtract && monto > montoActual)
          }
        >
          {loading ? "Procesando..." : "Continuar"}
        </Button>
      </Box>
    </Box>
  );
};
