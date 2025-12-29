import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Box, Button, TextField } from '@mui/material';
import { AsyncSelectField } from '../../../components/AsyncSelectField';
import type { AsyncSelectOption } from '../../../components/AsyncSelectField';
import { useLocalesSelect } from '../../../hooks/useLocalesSelect';
import { useLocalFilter } from '../../../contexts/LocalFilterContext';

export interface PosFormData {
    nombre: string;
    localId: number;
}

interface PosFormProps {
    onSubmit: (data: PosFormData) => void;
    defaultValues?: Partial<PosFormData>;
    loading?: boolean;
    localId?: number;
}

export const PosForm: React.FC<PosFormProps> = ({
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
    } = useForm<PosFormData>({
        defaultValues: {
            nombre: defaultValues?.nombre || '',
            localId: effectiveLocalId || defaultValues?.localId || 0,
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

    const handleFormSubmit = (data: PosFormData) => {
        onSubmit(data);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
                name="nombre"
                control={control}
                rules={{ required: 'El nombre es requerido' }}
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

            {!effectiveLocalId && (
                <Controller
                    name="localId"
                    control={control}
                    rules={{ required: 'El local es requerido', min: { value: 1, message: 'Debe seleccionar un local' } }}
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

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar'}
                </Button>
            </Box>
        </Box>
    );
};
