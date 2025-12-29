import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextField,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { AsyncSelectField } from '../../../components/AsyncSelectField';
import type { AsyncSelectOption } from '../../../components/AsyncSelectField';
import { useLocalesSelect } from '../../../hooks/useLocalesSelect';
import { useLocalFilter } from '../../../contexts/LocalFilterContext';

const cajaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  localId: z.number().min(1, 'El local es requerido'),
});

export type CajaFormData = z.infer<typeof cajaSchema>;

interface CajaFormProps {
  onSubmit: (data: CajaFormData) => void;
  defaultValues?: Partial<CajaFormData>;
  loading?: boolean;
  localId?: number;
}

export const CajaForm: React.FC<CajaFormProps> = ({
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
  } = useForm<CajaFormData>({
    resolver: zodResolver(cajaSchema),
    defaultValues: {
      nombre: '',
      localId: effectiveLocalId || 0,
      ...defaultValues,
    },
  });

  const { loadOptions, getOptionFromValue, isLoading } = useLocalesSelect({
    initialLocalId: effectiveLocalId || defaultValues?.localId,
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

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
                onChange={(option) => field.onChange(option ? option.value : 0)}
                loadOptions={loadOptions}
                defaultOptions={true}
                placeholder="Buscar local..."
                isLoading={isLoading}
                isDisabled={loading}
                error={errors.localId?.message}
                debounceTimeout={500}
                required
              />
            );
          }}
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
