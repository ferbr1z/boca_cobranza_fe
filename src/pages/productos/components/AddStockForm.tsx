import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Box, Button, Typography } from '@mui/material';
import { NumericInput } from '../../../components/NumericInput';

export interface AddStockFormData {
    cantidad: number;
}

interface AddStockFormProps {
    productoNombre: string;
    stockActual: number;
    onSubmit: (data: AddStockFormData) => void;
    onCancel: () => void;
    loading?: boolean;
}

export const AddStockForm: React.FC<AddStockFormProps> = ({
    productoNombre,
    stockActual,
    onSubmit,
    onCancel,
    loading = false,
}) => {
    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<AddStockFormData>({
        defaultValues: {
            cantidad: 0,
        },
    });

    const cantidad = watch('cantidad');
    const nuevoStock = stockActual + cantidad;

    const handleFormSubmit = (data: AddStockFormData) => {
        if (data.cantidad <= 0) {
            return;
        }
        onSubmit(data);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Producto
                </Typography>
                <Typography variant="h6">{productoNombre}</Typography>
            </Box>

            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Stock Actual
                </Typography>
                <Typography variant="h6">{stockActual}</Typography>
            </Box>

            <Controller
                name="cantidad"
                control={control}
                rules={{
                    required: 'La cantidad es requerida',
                    min: { value: 1, message: 'La cantidad debe ser mayor a 0' },
                }}
                render={({ field: { onChange, value, ...field } }) => (
                    <NumericInput
                        {...field}
                        value={value || 0}
                        onChange={onChange}
                        label="Cantidad a Agregar"
                        allowDecimal={false}
                        fullWidth
                        error={!!errors.cantidad}
                        helperText={errors.cantidad?.message}
                        disabled={loading}
                        required
                    />
                )}
            />

            <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="body2" color="primary.contrastText" gutterBottom>
                    Nuevo Stock
                </Typography>
                <Typography variant="h5" color="primary.contrastText" fontWeight="bold">
                    {nuevoStock}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button type="submit" variant="contained" disabled={loading || cantidad <= 0}>
                    {loading ? 'Procesando...' : 'Continuar'}
                </Button>
            </Box>
        </Box>
    );
};
