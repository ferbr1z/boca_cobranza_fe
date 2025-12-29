import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginMutation } from '../../services/api/authApi';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';

const loginSchema = z.object({
  telefono: z.string().min(1, 'El teléfono es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [login, { isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      telefono: '',
      password: '',
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home');
    }
  }, [navigate]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data).unwrap();

      localStorage.setItem('token', response.token);

      try {
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: response.userId,
            nombre: response.name,
            email: response.email,
            role: response.role,
            localId: response.localId ?? null,
            localNombre: response.localNombre ?? null,
          })
        );
      } catch { }

      window.dispatchEvent(new Event('auth-storage-change'));
      navigate('/home');
    } catch (err: any) {
      console.error('Error de login:', err);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        px: { xs: 2, sm: 0 },
        boxShadow: 'initial',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          width: '100%',
          maxWidth: 600,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ color: '#1976d2', fontWeight: 700 }}
          >
            Boca Cobranzas
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Ingresa tus credenciales
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(error as any)?.data?.message || 'Credenciales incorrectas'}
            </Alert>
          )}

          <TextField
            {...register('telefono')}
            label="Teléfono"
            fullWidth
            margin="normal"
            error={!!errors.telefono}
            helperText={errors.telefono?.message}
            autoComplete="tel"
            autoFocus
          />

          <TextField
            {...register('password')}
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              mt: 3,
              py: 1.5,
            }}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;

