import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
} from "@mui/material";
import { NumericInput } from "../../../components/NumericInput";
import { AsyncSelectField } from "../../../components/AsyncSelectField";
import type { AsyncSelectOption } from "../../../components/AsyncSelectField";
import { ComisionesManager } from "../../../components/ComisionesManager";
import { useLocalesSelect } from "../../../hooks/useLocalesSelect";
import { useLocalFilter } from "../../../contexts/LocalFilterContext";
import type { ComisionCuentaBancariaRequest } from "../../../types";

export interface CuentaBancariaFormData {
  nombre: string;
  localId: number;
  comision: number;
  porDefecto: boolean;
  redDePagos: boolean;
  comisionCuentaBancarias: ComisionCuentaBancariaRequest[];
}

interface CuentaBancariaFormProps {
  onSubmit: (data: CuentaBancariaFormData) => void;
  defaultValues?: Partial<CuentaBancariaFormData>;
  loading?: boolean;
  localId?: number;
  comision?: number;
}

export const CuentaBancariaForm: React.FC<CuentaBancariaFormProps> = ({
  onSubmit,
  defaultValues,
  loading = false,
  localId,
}) => {
  const { selectedLocalId } = useLocalFilter();
  const effectiveLocalId = localId || selectedLocalId;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CuentaBancariaFormData>({
    defaultValues: {
      nombre: defaultValues?.nombre || "",
      comision: defaultValues?.comision || 0,
      localId: effectiveLocalId || defaultValues?.localId || 0,
      porDefecto: defaultValues?.porDefecto || false,
      redDePagos: defaultValues?.redDePagos || false,
      comisionCuentaBancarias: defaultValues?.comisionCuentaBancarias || [],
    },
  });

  const redDePagos = watch("redDePagos");

  const { loadOptions, getOptionFromValue, isLoading } = useLocalesSelect({
    initialLocalId: effectiveLocalId || defaultValues?.localId,
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        nombre: defaultValues.nombre || "",
        comision: defaultValues.comision || 0,
        localId: defaultValues.localId || effectiveLocalId || 0,
        porDefecto: defaultValues.porDefecto || false,
        redDePagos: defaultValues.redDePagos || false,
        comisionCuentaBancarias: defaultValues.comisionCuentaBancarias || [],
      });
    }
  }, [defaultValues, reset, effectiveLocalId]);

  const handleFormSubmit = (data: CuentaBancariaFormData) => {
    onSubmit(data);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Controller
        name="nombre"
        control={control}
        rules={{ required: "El nombre es requerido" }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Nombre"
            error={!!errors.nombre}
            helperText={errors.nombre?.message}
            fullWidth
            required
            disabled={loading}
          />
        )}
      />

      <Controller
        name="comision"
        control={control}
        rules={{
          min: { value: 0, message: "La comisión debe ser mayor o igual a 0" },
        }}
        render={({ field: { onChange, value, ...field } }) => (
          <NumericInput
            {...field}
            value={value || 0}
            onChange={onChange}
            label="Comisión"
            currency="Gs."
            thousandSeparator="."
            decimalSeparator=","
            fullWidth
            error={!!errors.comision}
            helperText={errors.comision?.message}
            disabled={loading}
          />
        )}
      />

      {!effectiveLocalId && (
        <Controller
          name="localId"
          control={control}
          rules={{
            required: "El local es requerido",
            min: { value: 1, message: "Debe seleccionar un local" },
          }}
          render={({ field }) => {
            const selectedOption: AsyncSelectOption | null = useMemo(
              () => getOptionFromValue(field.value),
              [field.value, getOptionFromValue]
            );

            return (
              <AsyncSelectField
                label="Local"
                value={selectedOption}
                onChange={(option: AsyncSelectOption | null) => {
                  field.onChange(option?.value || 0);
                }}
                loadOptions={loadOptions}
                defaultOptions={true}
                placeholder="Buscar local..."
                isLoading={isLoading}
                isDisabled={loading}
                error={errors.localId?.message}
                required
              />
            );
          }}
        />
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Configuración Adicional
      </Typography>

      <Controller
        name="porDefecto"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox {...field} checked={field.value} disabled={loading} />
            }
            label="Cuenta bancaria por defecto para pagos"
          />
        )}
      />

      <Controller
        name="redDePagos"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox {...field} checked={field.value} disabled={loading} />
            }
            label="Es red de pago"
          />
        )}
      />

      {redDePagos && (
        <>
          <Divider sx={{ my: 2 }} />
          <Controller
            name="comisionCuentaBancarias"
            control={control}
            render={({ field }) => (
              <ComisionesManager
                comisiones={field.value}
                onChange={field.onChange}
                disabled={loading}
              />
            )}
          />
        </>
      )}

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </Box>
    </Box>
  );
};
