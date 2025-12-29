import React, { useEffect, useMemo } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Button, Box, CircularProgress, MenuItem } from '@mui/material';
import { AsyncSelectField } from '../../../components/AsyncSelectField';
import type { AsyncSelectOption } from '../../../components/AsyncSelectField';
import { NumericInput } from '../../../components/NumericInput';
import { useLocalesSelect } from '../../../hooks/useLocalesSelect';
import { CONTEO_OPTIONS } from '../../../enum/conteoEnum';
import { useLocalFilter } from '../../../contexts/LocalFilterContext';

const sistemaExternoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(150, 'Máximo 150 caracteres'),
  localId: z.number().min(1, 'El local es requerido'),
  montoPorOperacion: z.number().min(0, 'El monto debe ser mayor o igual a 0'),
  conteo: z.number().min(0).max(1),
});

export type SistemaExternoFormData = z.infer<typeof sistemaExternoSchema>;

interface SistemaExternoFormProps {
  onSubmit: (data: SistemaExternoFormData) => void;
  defaultValues?: Partial<SistemaExternoFormData>;
  loading?: boolean;
  localId?: number;
}

export const SistemaExternoForm: React.FC<SistemaExternoFormProps> = ({
  onSubmit,
  defaultValues,
  loading = false,
  localId,
}) => {
  const { selectedLocalId } = useLocalFilter();
  const effectiveLocalId = localId || selectedLocalId;

  const initialValues = useMemo<SistemaExternoFormData>(() => ({
    nombre: defaultValues?.nombre ?? '',
    localId: effectiveLocalId ?? defaultValues?.localId ?? 0,
    montoPorOperacion: defaultValues?.montoPorOperacion ?? 0,
    conteo: defaultValues?.conteo ?? 0,
  }), [defaultValues, effectiveLocalId]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SistemaExternoFormData>({
    resolver: zodResolver(sistemaExternoSchema),
    defaultValues: initialValues,
  });

  const { defaultOptions, loadOptions, getOptionFromValue, isLoading } = useLocalesSelect({
    initialLocalId: effectiveLocalId || defaultValues?.localId,
  });

  const watchedConteo = useWatch({ control, name: 'conteo' });

  useEffect(() => {
    if (watchedConteo === 0) {
      setValue('montoPorOperacion', 0);
    }
  }, [watchedConteo, setValue]);

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
        name="conteo"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Conteo"
            fullWidth
            error={!!errors.conteo}
            helperText={errors.conteo?.message}
            disabled={loading}
          >
            {CONTEO_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      {watchedConteo === 0 && (
        <Controller
          name="montoPorOperacion"
          control={control}
          render={({ field }) => (
            <NumericInput
              label="Monto por Operación"
              currency="Gs."
              currencyPosition="suffix"
              value={field.value}
              onChange={field.onChange}
              fullWidth
              error={!!errors.montoPorOperacion}
              helperText={errors.montoPorOperacion?.message}
              disabled={loading}
              allowDecimal={false}
            />
          )}
        />
      )}



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
