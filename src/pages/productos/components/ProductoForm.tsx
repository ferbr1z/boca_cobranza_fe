import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Box, CircularProgress } from "@mui/material";
import { AsyncSelectField } from "../../../components/AsyncSelectField";
import type { AsyncSelectOption } from "../../../components/AsyncSelectField";
import { useLocalesSelect } from "../../../hooks/useLocalesSelect";
import { NumericInput } from "../../../components/NumericInput";
import { useLocalFilter } from "../../../contexts/LocalFilterContext";

const productoSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(150, "Máximo 150 caracteres"),
  codigo: z
    .string()
    .min(1, "El código es requerido")
    .max(100, "Máximo 100 caracteres"),
  localId: z.number().min(1, "El local es requerido"),
  precio: z.number().min(0, "Debe ser un número válido"),
  costo: z.number().min(0, "Debe ser un número válido"),
  stock: z.number().int().min(0, "Debe ser un entero válido"),
});

export type ProductoFormData = z.infer<typeof productoSchema>;

interface ProductoFormProps {
  onSubmit: (data: ProductoFormData) => void;
  defaultValues?: Partial<ProductoFormData>;
  loading?: boolean;
  localId?: number;
}

export const ProductoForm: React.FC<ProductoFormProps> = ({
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
  } = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: "",
      codigo: "",
      localId: effectiveLocalId || 0,
      precio: 0,
      costo: 0,
      stock: 0,
      ...defaultValues,
    },
  });

  const { defaultOptions, loadOptions, getOptionFromValue, isLoading } =
    useLocalesSelect({
      initialLocalId: effectiveLocalId || defaultValues?.localId,
    });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Box sx={{ display: "grid", gap: 2 }}>
        <Controller
          name="nombre"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nombre"
              fullWidth
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
              disabled={loading}
            />
          )}
        />
        <Controller
          name="codigo"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Código"
              fullWidth
              error={!!errors.codigo}
              helperText={errors.codigo?.message}
              disabled={loading}
              required
            />
          )}
        />
        {!effectiveLocalId && (
          <Controller
            name="localId"
            control={control}
            render={({ field }) => {
              const selectedOption: AsyncSelectOption | null = useMemo(
                () => getOptionFromValue(field.value),
                [field.value, getOptionFromValue]
              );

              return (
                <AsyncSelectField
                  label="Local"
                  value={selectedOption}
                  onChange={(option) =>
                    field.onChange(option ? Number(option.value) : 0)
                  }
                  loadOptions={loadOptions}
                  defaultOptions={defaultOptions}
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

        <Controller
          name="precio"
          control={control}
          render={({ field }) => (
            <NumericInput
              label="Precio"
              value={field.value}
              onChange={(v) => field.onChange(Number(v))}
              fullWidth
              disabled={loading}
              currency="Gs."
              currencyPosition="suffix"
            />
          )}
        />
        <Controller
          name="costo"
          control={control}
          render={({ field }) => (
            <NumericInput
              label="Costo"
              value={field.value}
              onChange={(v) => field.onChange(Number(v))}
              fullWidth
              disabled={loading}
              currency="Gs."
              currencyPosition="suffix"
            />
          )}
        />
        <Controller
          name="stock"
          control={control}
          render={({ field }) => (
            <NumericInput
              label="Stock"
              value={field.value}
              onChange={(v) => field.onChange(Number(v))}
              fullWidth
              disabled={loading}
              error={!!errors.stock}
              helperText={errors.stock?.message}
            />
          )}
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? "Guardando..." : "Guardar"}
      </Button>
    </Box>
  );
};
