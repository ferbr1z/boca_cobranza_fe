import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Box, CircularProgress } from '@mui/material';
import { AsyncSelectField } from '../../../components/AsyncSelectField';
import type { AsyncSelectOption } from '../../../components/AsyncSelectField';
import { useLocalesSelect } from '../../../hooks/useLocalesSelect';
import { useLocalFilter } from '../../../contexts/LocalFilterContext';

const operadoraSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(150, 'Máximo 150 caracteres'),
  localId: z.number().min(1, 'El local es requerido'),
  numeroTelefono: z
    .string()
    .min(6, 'El número debe tener al menos 6 dígitos')
    .max(20, 'Máximo 20 caracteres'),
});

export type OperadoraFormData = z.infer<typeof operadoraSchema>;

interface OperadoraFormProps {
  onSubmit: (data: OperadoraFormData) => void;
  defaultValues?: Partial<OperadoraFormData>;
  loading?: boolean;
  localId?: number;
}

export const OperadoraForm: React.FC<OperadoraFormProps> = ({ onSubmit, defaultValues, loading = false, localId }) => {
  const { selectedLocalId } = useLocalFilter();
  const effectiveLocalId = localId || selectedLocalId;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OperadoraFormData>({
    resolver: zodResolver(operadoraSchema),
    defaultValues: {
      nombre: '',
      localId: effectiveLocalId || 0,
      numeroTelefono: '',
      ...defaultValues,
    },
  });

  const { defaultOptions, loadOptions, getOptionFromValue, isLoading } = useLocalesSelect({
    initialLocalId: effectiveLocalId || defaultValues?.localId,
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'grid', gap: 2 }}>
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
                  onChange={(option) => field.onChange(option ? Number(option.value) : 0)}
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
          name="numeroTelefono"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Número de Teléfono"
              fullWidth
              error={!!errors.numeroTelefono}
              helperText={errors.numeroTelefono?.message}
              disabled={loading}
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
        {loading ? 'Guardando...' : 'Guardar'}
      </Button>
    </Box>
  );
};
