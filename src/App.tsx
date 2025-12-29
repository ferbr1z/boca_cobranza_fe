import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/login/LoginPage";
import Home from "./pages/home/home";
import Users from "./pages/users/users";
import CajasPage from "./pages/cajas/CajasPage";
import CuentasBancariasPage from "./pages/cuentasBancarias/CuentasBancariasPage";
import PosPage from "./pages/pos/PosPage";
import LocalesPage from "./pages/locales/LocalesPage";
import LocalManagementPage from "./pages/localManagement/LocalManagementPage";
import VentasPage from "./pages/ventas/VentasPage";
import VentasListadoPage from "./pages/ventasListado/VentasListadoPage";
import SesionLocalDetailPage from "./pages/sesionLocalDetail/SesionLocalDetailPage";
import SesionLocalMovimientosPage from "./pages/sesionLocalVentas/SesionLocalVentasPage";
import ProtectedVentaRoute from "./components/ProtectedVentaRoute";
import TransferenciasPage from "./pages/transferencias/TransferenciasPage";
import TransferenciasListadoPage from "./pages/transferencias/TransferenciasListadoPage";
import GenerarMovimientoPage from "./pages/redDePagosMovimientos/GenerarMovimientoPage";
import ListadoMovimientosPage from "./pages/redDePagosMovimientos/ListadoMovimientosPage";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import OperadorasPage from "./pages/operadoras/OperadorasPage";
import SistemaExternoPage from "./pages/sistemaExterno/SistemaExternoPage";
import ProductosPage from "./pages/productos/ProductosPage";
import GenerarCargarSaldoPage from "./pages/operacionesOperadora/GenerarCargarSaldoPage";
import GenerarGiroBilleteraPage from "./pages/operacionesOperadora/GenerarGiroBilleteraPage";
import GenerarRetirarBilleteraPage from "./pages/operacionesOperadora/GenerarRetirarBilleteraPage";
import ListadoOperacionesPage from "./pages/operacionesOperadora/ListadoOperacionesPage";
import { useAuth } from "./hooks/useAuth";
import { LocalFilterProvider } from "./contexts/LocalFilterContext";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function AppRoutes() {
  const { isAdmin, canModifyStock } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route
          path="local/:localId/ventas"
          element={
            <ProtectedVentaRoute>
              <VentasPage />
            </ProtectedVentaRoute>
          }
        />
        <Route path="sesion-local/:id" element={<SesionLocalDetailPage />} />
        <Route
          path="sesion-local/:id/movimientos"
          element={<SesionLocalMovimientosPage />}
        />
        {canModifyStock && (
          <Route path="productos" element={<ProductosPage />} />
        )}
        <Route path="red-pagos-mov">
          <Route path="generar" element={<GenerarMovimientoPage />} />
          {isAdmin && (
            <Route path="listado" element={<ListadoMovimientosPage />} />
          )}
        </Route>
        <Route path="operaciones-operadora">
          <Route path="cargar-saldo" element={<GenerarCargarSaldoPage />} />
          <Route path="giro-billetera" element={<GenerarGiroBilleteraPage />} />
          <Route
            path="retirar-billetera"
            element={<GenerarRetirarBilleteraPage />}
          />
          {isAdmin && (
            <Route path="listado" element={<ListadoOperacionesPage />} />
          )}
        </Route>
        <Route path="transferencias">
          <Route index element={<TransferenciasPage />} />
          {isAdmin && (
            <Route path="listado" element={<TransferenciasListadoPage />} />
          )}
        </Route>
        {isAdmin && (
          <>
            <Route path="users" element={<Users />} />
            <Route path="cajas" element={<CajasPage />} />
            <Route path="cuentasBancarias" element={<CuentasBancariasPage />} />
            <Route path="pos" element={<PosPage />} />
            <Route path="locales" element={<LocalesPage />} />
            <Route path="local/:localId" element={<LocalManagementPage />} />
            <Route path="operadoras" element={<OperadorasPage />} />
            <Route path="sistemaExterno" element={<SistemaExternoPage />} />
            <Route path="listado-ventas" element={<VentasListadoPage />} />

          </>
        )}
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster />
      <BrowserRouter>
        <LocalFilterProvider>
          <AppRoutes />
        </LocalFilterProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
