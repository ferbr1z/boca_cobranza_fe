import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Box,
  Typography,
  IconButton,
  Collapse,
  ListItemIcon,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Home as HomeIcon,
  ExpandLess,
  ExpandMore,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Store as StoreIcon,
  Phone as PhoneIcon,
  Computer as ComputerIcon,
  Folder as FolderIcon,
  Inventory2 as Inventory2Icon,
  ShoppingBag as ShoppingBagIcon,
  AccountCircle as AccountCircleIcon,
  Wallet as WalletIcon,
  PointOfSale as PointOfSaleIcon,
  SwapHoriz as SwapHorizIcon,
  CreditCard as CreditCardIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Send as SendIcon,
  Business as BusinessIcon,
  MoneyOff as MoneyOffIcon,
  PowerSettingsNew as PowerIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  History as HistoryIcon,
  Smartphone as SmartphoneIcon,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useBodyStyleCleanup } from "../hooks/useBodyStyleCleanup";
import { useLocalFilter } from "../contexts/LocalFilterContext";
import { useSesionValidation } from "../hooks/useSesionValidation";
import { AsyncSelectField } from "./AsyncSelectField";
import type { AsyncSelectOption } from "./AsyncSelectField";
import {
  useLazyGetAllLocalesQuery,
  useGetAllLocalesQuery,
} from "../services/api/localesApi";
import { createLocalLoader } from "../utils/filterHelpers";
import {
  useGetActiveSesionByCurrentUserQuery,
  useOpenSesionLocalMutation,
  useCloseSesionLocalMutation,
  useGetAllSesionesLocalQuery,
} from "../services/api/sesionLocalApi";
import { FormDrawer } from "./FormDrawer";
import { SesionLocalForm } from "../pages/localManagement/components";
import type { SesionLocalRequest } from "../types";
import { notify } from "../utils/notify";
import "./Sidebar.scss";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  path?: string;
  children?: MenuItem[];
  adminOnly?: boolean;
  userWithModifyStock?: boolean;
  requiresSesion?: boolean;
  requiresLocalSelected?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { logout, user, isAdmin, canModifyStock } = useAuth();
  const { puedeRealizarVentas, sesionAbiertaPorOtroUsuario } =
    useSesionValidation();
  const { selectedLocalId, setSelectedLocalId } = useLocalFilter();
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [variant, setVariant] = useState<"temporary" | "persistent">(
    "temporary"
  );
  const [lazyGetAllLocales] = useLazyGetAllLocalesQuery();
  const [localesRefreshKey, setLocalesRefreshKey] = useState(0);

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        id: "home",
        label: isAdmin ? "Gestionar Sesiones" : "Sesion Activa",
        icon: <HomeIcon />,
        path: "/home",
      },
      {
        id: "generar-venta",
        label: "Generar Venta",
        icon: <ShoppingCartIcon />,
        path: "/local/:localId/ventas",
        requiresSesion: true,
        requiresLocalSelected: true,
      },

      {
        id: "transferencias",
        label: "Transferencias",
        icon: <SwapHorizIcon />,
        path: "/transferencias",
        requiresLocalSelected: true,
        requiresSesion: true,
      },
      {
        id: "red-pagos-mov",
        label: "Red de Pagos",
        icon: <AccountBalanceWalletIcon />,
        path: "/red-pagos-mov/generar",
        requiresLocalSelected: true,
        requiresSesion: true,
      },
      {
        id: "operaciones-operadora",
        label: "Operaciones de Operadora",
        icon: <BusinessIcon />,
        requiresLocalSelected: true,
        children: [
          {
            id: "cargar-saldo",
            label: "Cargar Saldo",
            icon: <SmartphoneIcon />,
            path: "/operaciones-operadora/cargar-saldo",
            requiresSesion: true,
          },
          {
            id: "giro-billetera",
            label: "Giro Billetera",
            icon: <SendIcon />,
            path: "/operaciones-operadora/giro-billetera",
            requiresSesion: true,
          },
          {
            id: "retirar-billetera",
            label: "Retirar Billetera",
            icon: <MoneyOffIcon />,
            path: "/operaciones-operadora/retirar-billetera",
            requiresSesion: true,
          },
        ],
      },
      {
        id: "historial",
        label: "Historial de Movimientos",
        icon: <HistoryIcon />,
        adminOnly: true,
        requiresLocalSelected: true,
        children: [
          {
            id: "listado-ventas",
            label: "Historial de Ventas",
            icon: <AttachMoneyIcon />,
            path: "/listado-ventas",
            requiresLocalSelected: true,
          },
          {
            id: "transferencias-listado",
            label: "Historial de transferencias",
            icon: <SwapHorizIcon />,
            path: "/transferencias/listado",
          },
          {
            id: "listado-operaciones",
            label: "Historial Telefonía",
            icon: <SmartphoneIcon />,
            path: "/operaciones-operadora/listado",
          },
          {
            id: "listado-movimientos",
            label: "Historial de Red de Pagos",
            icon: <CreditCardIcon />,
            path: "/red-pagos-mov/listado",
          },
        ],
      },
      {
        id: "inventario",
        label: "Inventario",
        icon: <Inventory2Icon />,
        userWithModifyStock: true,
        requiresLocalSelected: true,
        children: [
          {
            id: "productos",
            label: "Productos",
            icon: <ShoppingBagIcon />,
            path: "/productos",
            userWithModifyStock: true,
          },
        ],
      },
      {
        id: "auxiliares",
        label: "Auxiliares",
        icon: <FolderIcon />,
        adminOnly: true,
        requiresLocalSelected: true,
        children: [
          {
            id: "cajas",
            label: "Cajas",
            icon: <WalletIcon />,
            path: "/cajas",
            adminOnly: true,
          },
          {
            id: "cuentasBancarias",
            label: "Cuentas Bancarias",
            icon: <AccountBalanceIcon />,
            path: "/cuentasBancarias",
            adminOnly: true,
          },
          {
            id: "pos",
            label: "POS",
            icon: <PointOfSaleIcon />,
            path: "/pos",
            adminOnly: true,
          },
          {
            id: "operadoras",
            label: "Operadoras",
            icon: <PhoneIcon />,
            path: "/operadoras",
            adminOnly: true,
          },
          {
            id: "sistemaExterno",
            label: "Sistema Externo",
            icon: <ComputerIcon />,
            path: "/sistemaExterno",
            adminOnly: true,
          },
        ],
      },
      {
        id: "locales",
        label: "Locales",
        icon: <StoreIcon />,
        path: "/locales",
        adminOnly: true,
      },
      {
        id: "users",
        label: "Usuarios",
        icon: <PeopleIcon />,
        path: "/users",
        adminOnly: true,
      },
    ],
    [isAdmin]
  );

  const { data: localesData } = useGetAllLocalesQuery(
    { page: 1, query: {} },
    { skip: !isAdmin }
  );

  useEffect(() => {
    if (localesData) {
      setLocalesRefreshKey((prev) => prev + 1);
    }
  }, [localesData]);

  const [openSesionDrawer, setOpenSesionDrawer] = useState(false);
  const [closeSesionDrawer, setCloseSesionDrawer] = useState(false);
  const [logoutConfirmDialog, setLogoutConfirmDialog] = useState(false);
  const [shouldLogoutAfterClose, setShouldLogoutAfterClose] = useState(false);

  const { data: sesionActiva } = useGetActiveSesionByCurrentUserQuery();
  const { data: sesionesAbiertas } = useGetAllSesionesLocalQuery(
    { page: 1, query: { abierta: true } },
    { skip: !isAdmin }
  );
  const [openSesion, { isLoading: isOpeningSesion }] =
    useOpenSesionLocalMutation();
  const [closeSesion, { isLoading: isClosingSesion }] =
    useCloseSesionLocalMutation();

  useBodyStyleCleanup();

  useEffect(() => {
    setVariant(isMobile ? "temporary" : "persistent");

    if (!isMobile) {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, [isMobile]);

  const handleExpand = (item: string) => {
    setExpanded((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const handleOpenSesion = async (formData: SesionLocalRequest) => {
    const localIdToUse =
      isAdmin && selectedLocalId ? selectedLocalId : user?.localId;
    if (!localIdToUse) return;

    try {
      await openSesion({
        localId: Number(localIdToUse),
        body: formData,
      }).unwrap();
      notify.success("Sesión abierta exitosamente");
      setOpenSesionDrawer(false);
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al abrir la sesión");
    }
  };

  const handleCloseSesion = async (formData: SesionLocalRequest) => {
    const localIdToUse =
      isAdmin && selectedLocalId ? selectedLocalId : user?.localId;
    if (!localIdToUse) return;

    try {
      await closeSesion({
        localId: Number(localIdToUse),
        body: formData,
      }).unwrap();
      notify.success("Sesión cerrada exitosamente");
      setCloseSesionDrawer(false);

      if (shouldLogoutAfterClose) {
        setShouldLogoutAfterClose(false);
        setTimeout(() => logout(), 500);
      }
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al cerrar la sesión");
      setShouldLogoutAfterClose(false);
    }
  };

  const handleLogoutClick = () => {
    if (!isAdmin && sesionActiva?.abierta) {
      setLogoutConfirmDialog(true);
    } else if (
      isAdmin &&
      selectedLocalId &&
      localTieneSesionAbierta(selectedLocalId) &&
      sesionAbrioPorMi(selectedLocalId)
    ) {
      setLogoutConfirmDialog(true);
    } else {
      logout();
    }
  };

  const handleLogoutAndCloseSesion = () => {
    setLogoutConfirmDialog(false);
    setShouldLogoutAfterClose(true);
    setCloseSesionDrawer(true);
  };

  const handleLogoutDirectly = () => {
    setLogoutConfirmDialog(false);
    logout();
  };

  const localTieneSesionAbierta = (localId: number | null): boolean => {
    if (!localId) return false;
    if (isAdmin && sesionesAbiertas) {
      return sesionesAbiertas.data.some(
        (s) => s.localId === localId && s.abierta
      );
    }
    return sesionActiva?.abierta === true;
  };

  const sesionAbrioPorMi = (localId: number | null): boolean => {
    if (!localId) return false;
    if (isAdmin && sesionesAbiertas) {
      const sesion = sesionesAbiertas.data.find(
        (s) => s.localId === localId && s.abierta
      );
      return sesion ? sesion.userId === user?.id : false;
    }
    return sesionActiva?.abierta === true;
  };

  const getSesionDelLocal = (localId: number | null) => {
    if (!localId || !isAdmin || !sesionesAbiertas) return null;
    return sesionesAbiertas.data.find(
      (s) => s.localId === localId && s.abierta
    );
  };

  const handleNavigation = (path?: string) => {
    if (path) {
      let finalPath = path;
      if (path.includes(":localId")) {
        const localIdToUse =
          isAdmin && selectedLocalId ? selectedLocalId : user?.localId;

        if (localIdToUse) {
          finalPath = path.replace(":localId", String(localIdToUse));
        } else {
          return;
        }
      }

      if (finalPath.includes("/ventas") && !isAdmin && !puedeRealizarVentas) {
        if (sesionAbiertaPorOtroUsuario) {
          alert(
            `No puedes realizar ventas. Hay una sesión abierta por ${sesionAbiertaPorOtroUsuario.userName} en el local ${sesionAbiertaPorOtroUsuario.localNombre}`
          );
        } else {
          alert("Debes tener una sesión activa para realizar ventas");
        }
        return;
      }
      navigate(finalPath);
      if (isMobile) {
        onToggle();
      }
    }
  };

  const loadLocalOptions = useMemo(
    () => createLocalLoader(lazyGetAllLocales),
    [lazyGetAllLocales]
  );

  const [selectedLocalOption, setSelectedLocalOption] =
    useState<AsyncSelectOption | null>(null);

  useEffect(() => {
    if (!selectedLocalId || selectedLocalOption) {
      return;
    }

    lazyGetAllLocales({ page: 0 })
      .unwrap()
      .then((response) => {
        const local = response.data.find(
          (item) => item.id === selectedLocalId.toString()
        );
        if (local) {
          setSelectedLocalOption({
            value: local.id,
            label: local.nombre,
          });
        }
      })
      .catch((error) => {
        console.error("Error al cargar el local inicial:", error);
      });
  }, [selectedLocalId, selectedLocalOption, lazyGetAllLocales]);

  const handleLocalChange = (option: AsyncSelectOption | null) => {
    setSelectedLocalOption(option);
    setSelectedLocalId(option ? Number(option.value) : null);
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.children) {
      const filteredChildren = item.children.filter((child) => {
        if (child.adminOnly && !isAdmin) return false;
        if (child.userWithModifyStock && !canModifyStock && !isAdmin)
          return false;

        if (child.requiresSesion) {
          if (isAdmin) {
            if (selectedLocalId) {
              return (
                localTieneSesionAbierta(selectedLocalId) &&
                sesionAbrioPorMi(selectedLocalId)
              );
            }
            return false;
          } else {
            return sesionActiva?.abierta === true;
          }
        }

        return true;
      });
      if (filteredChildren.length === 0) return null;

      return (
        <React.Fragment key={item.id}>
          <ListItem>
            <ListItemButton onClick={() => handleExpand(item.id)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              {expanded[item.id] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={expanded[item.id]}>
            <List dense>
              {filteredChildren.map((child) => (
                <ListItem key={child.id} sx={{ pl: 6 }}>
                  <ListItemButton
                    sx={{ pl: 5 }}
                    selected={location.pathname === child.path}
                    onClick={() => handleNavigation(child.path)}
                  >
                    <ListItemIcon sx={{ fontSize: "0.875rem" }}>
                      {child.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={child.label}
                      sx={{ "& .MuiTypography-root": { fontSize: "0.8rem" } }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    if (
      item.adminOnly &&
      !isAdmin &&
      !(item.userWithModifyStock && canModifyStock)
    )
      return null;

    return (
      <ListItem key={item.id}>
        <ListItemButton
          selected={location.pathname === item.path}
          onClick={() => handleNavigation(item.path)}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <>
      <Drawer
        variant={variant}
        open={open}
        onClose={onToggle}
        classes={{ paper: "sidebar-paper" }}
        disableScrollLock={true}
        keepMounted={false}
        ModalProps={{
          keepMounted: false,
          disableScrollLock: true,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {isMobile && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                px: 2,
                pb: 1,
              }}
            >
              <IconButton
                onClick={onToggle}
                className="sidebar-toggle-inside"
                size="small"
                aria-label={open ? "Ocultar menú" : "Mostrar menú"}
              >
                {open ? <ChevronLeftIcon /> : <MenuIcon />}
              </IconButton>
            </Box>
          )}

          {isAdmin ? (
            <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <AsyncSelectField
                    key={`local-select-${localesRefreshKey}`}
                    label="Seleccione un local"
                    value={selectedLocalOption}
                    onChange={handleLocalChange}
                    loadOptions={loadLocalOptions}
                    defaultOptions={true}
                    placeholder="Todos los locales"
                    isClearable={true}
                    clearLabel="Todos"
                    isDisabled={false}
                  />
                </Box>
                {selectedLocalId && (
                  <Tooltip
                    title={
                      !localTieneSesionAbierta(selectedLocalId)
                        ? "Abrir sesión del local"
                        : !sesionAbrioPorMi(selectedLocalId)
                        ? `Sesión abierta por ${
                            getSesionDelLocal(selectedLocalId)?.userName ||
                            "otro usuario"
                          }`
                        : "Cerrar sesión del local"
                    }
                  >
                    <span>
                      <IconButton
                        size="small"
                        disabled={
                          localTieneSesionAbierta(selectedLocalId) &&
                          !sesionAbrioPorMi(selectedLocalId)
                        }
                        onClick={() =>
                          localTieneSesionAbierta(selectedLocalId)
                            ? setCloseSesionDrawer(true)
                            : setOpenSesionDrawer(true)
                        }
                        sx={{
                          color:
                            localTieneSesionAbierta(selectedLocalId) &&
                            sesionAbrioPorMi(selectedLocalId)
                              ? "success.main"
                              : "text.secondary",
                          mt: 4,
                          "&:hover": {
                            backgroundColor:
                              localTieneSesionAbierta(selectedLocalId) &&
                              sesionAbrioPorMi(selectedLocalId)
                                ? "success.50"
                                : "action.hover",
                          },
                        }}
                      >
                        <PowerIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Box>
            </Box>
          ) : user?.localNombre ? (
            <Box
              sx={{
                px: 2,
                pt: 2,
                pb: 1.5,
                backgroundColor: "rgba(25, 118, 210, 0.08)",
                borderRadius: 1,
                mx: 2,
                mt: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Local asignado
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "#1976d2" }}
                  >
                    {user.localNombre}
                  </Typography>
                </Box>
                <Tooltip
                  title={
                    !sesionActiva?.abierta && sesionAbiertaPorOtroUsuario
                      ? `Sesión abierta por ${sesionAbiertaPorOtroUsuario.userName}`
                      : sesionActiva?.abierta
                      ? "Cerrar sesión del local"
                      : "Abrir sesión del local"
                  }
                >
                  <span>
                    <IconButton
                      size="small"
                      disabled={
                        !sesionActiva?.abierta && !!sesionAbiertaPorOtroUsuario
                      }
                      onClick={() =>
                        sesionActiva?.abierta
                          ? setCloseSesionDrawer(true)
                          : setOpenSesionDrawer(true)
                      }
                      sx={{
                        color: sesionActiva?.abierta
                          ? "success.main"
                          : "text.secondary",
                        "&:hover": {
                          backgroundColor: sesionActiva?.abierta
                            ? "success.50"
                            : "action.hover",
                        },
                      }}
                    >
                      <PowerIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          ) : null}
          <Divider sx={{ my: 1 }} />

          <List
            className="sidebar-list"
            sx={{ flexGrow: 1, overflowY: "auto" }}
          >
            {menuItems
              .filter((item) => {
                if (item.adminOnly && !isAdmin) return false;

                if (item.requiresLocalSelected && isAdmin && !selectedLocalId) {
                  return false;
                }

                if (item.requiresSesion) {
                  if (isAdmin) {
                    if (selectedLocalId) {
                      return (
                        localTieneSesionAbierta(selectedLocalId) &&
                        sesionAbrioPorMi(selectedLocalId)
                      );
                    }
                    return false;
                  } else {
                    return sesionActiva?.abierta === true;
                  }
                }

                return true;
              })
              .map((item) => renderMenuItem(item))}
          </List>
          <Box sx={{ p: 2, borderTop: "1px solid rgba(0,0,0,0.1)" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: "rgba(148, 163, 184, 0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#334155",
                  }}
                >
                  <AccountCircleIcon fontSize="small" />
                </Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#1f2937" }}
                >
                  {user?.nombre || "Usuario"}
                </Typography>
              </Box>
              <IconButton
                onClick={handleLogoutClick}
                size="small"
                sx={{
                  color: "#dc004e",
                  backgroundColor: "rgba(220, 0, 78, 0.08)",
                  borderRadius: "12px",
                  transition: "all 0.35s ease",
                  "&:hover": {
                    backgroundColor: "rgba(220, 38, 126, 0.18)",
                  },
                }}
                aria-label="Cerrar sesión"
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Drawer>

      <FormDrawer
        open={openSesionDrawer}
        onClose={() => setOpenSesionDrawer(false)}
        title={`Abrir Sesión - ${
          isAdmin && selectedLocalOption
            ? selectedLocalOption.label
            : user?.localNombre || ""
        }`}
      >
        <SesionLocalForm
          onSubmit={handleOpenSesion}
          loading={isOpeningSesion}
          localId={
            (isAdmin && selectedLocalId) ||
            (user?.localId ? Number(user.localId) : 0)
          }
          mode="open"
        />
      </FormDrawer>

      <FormDrawer
        open={closeSesionDrawer}
        onClose={() => setCloseSesionDrawer(false)}
        title={`Cerrar Sesión - ${
          isAdmin && selectedLocalOption
            ? selectedLocalOption.label
            : user?.localNombre || ""
        }`}
      >
        <SesionLocalForm
          onSubmit={handleCloseSesion}
          loading={isClosingSesion}
          localId={
            (isAdmin && selectedLocalId) ||
            (user?.localId ? Number(user.localId) : 0)
          }
          mode="close"
        />
      </FormDrawer>

      <Dialog
        open={logoutConfirmDialog}
        onClose={() => setLogoutConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cerrar Sesión</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Tienes una sesión de local activa. ¿Qué deseas hacer?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutConfirmDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleLogoutDirectly} color="primary">
            Salir
          </Button>
          <Button
            onClick={handleLogoutAndCloseSesion}
            variant="contained"
            color="error"
          >
            Salir y Cerrar Sesión del Local
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;
