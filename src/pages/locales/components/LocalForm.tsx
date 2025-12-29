import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextField,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';

const localSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
});

export type LocalFormData = z.infer<typeof localSchema>;

interface LocalFormProps {
  onSubmit: (data: LocalFormData) => void;
  defaultValues?: Partial<LocalFormData>;
  loading?: boolean;
}

export const LocalForm: React.FC<LocalFormProps> = ({
  onSubmit,
  defaultValues,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LocalFormData>({
    resolver: zodResolver(localSchema),
    defaultValues: {
      nombre: '',
      ...defaultValues,
    },
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
