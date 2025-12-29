import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Paper, Typography, Chip, Alert } from "@mui/material";
import {
  Add as AddIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowForward as ArrowForwardIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { DataTable } from "../../../components/DataTable";
import type { ColumnConfig } from "../../../components/DataTable";
import { FilterDrawer } from "../../../components/FilterDrawer";
import { useFilters } from "../../../hooks/useFilters";
import type { FilterConfig } from "../../../hooks/useFilters";
import { FormDrawer } from "../../../components/FormDrawer";
import {
  useGetAllSesionesLocalQuery,
  useGetActiveSesionByCurrentUserQuery,
  useOpenSesionLocalMutation,
  useCloseSesionLocalMutation,
} from "../../../services/api/sesionLocalApi";
import { useGetAllMovimientosQuery } from "../../../services/api/movimientoApi";
import { useGetProfileQuery } from "../../../services/api/authApi";
import { useAuth } from "../../../hooks/useAuth";
import { useSesionValidation } from "../../../hooks/useSesionValidation";
import type { SesionLocalDto, SesionLocalRequest, MovimientoDto } from "../../../types";
import { notify } from "../../../utils/notify";
import { formatDateTime } from "../../../utils/dateFormat";
import { formatCurrency } from "../../../utils/format";
import { TIPO_MOVIMIENTO_LABELS } from "../../../enum/tipoMovimientoEnum";
import { getFuenteDeFondoNombre } from "../../../utils/movimientoHelpers";
import { SesionLocalForm } from "../components";

interface SesionLocalSectionProps {
  localId: number;
  localNombre: string;
}

export const SesionLocalSection: React.FC<SesionLocalSectionProps> = ({
  localId,
  localNombre,
}) => {
  const navigate = useNavigate();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [closeDrawer, setCloseDrawer] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const { data: profile } = useGetProfileQuery();
  const { isAdmin } = useAuth();
  const { puedeRealizarVentas } = useSesionValidation(localId);
  const currentUserId = profile?.id;

  const { data: activeSesion, isLoading: isLoadingActive } =
    useGetActiveSesionByCurrentUserQuery(undefined, { skip: isAdmin });

  const filterConfigsAdmin: FilterConfig[] = useMemo(
    () => [
      {
        name: "abierta",
        label: "Estado",
        type: "select",
        initialValue: "",
        options: [
          { value: "", label: "Todos" },
          { value: "true", label: "Abiertas" },
          { value: "false", label: "Cerradas" },
        ],
      },
      {
        name: "fechaRango",
        label: "Rango de Fechas",
        type: "date-range",
        initialValue: { desde: "", hasta: "" },
      },
    ],
    []
  );

  const filterConfigsUser: FilterConfig[] = useMemo(
    () => [
      {
        name: "tipoMovimiento",
        label: "Tipo de Movimiento",
        type: "select",
        initialValue: "",
        options: [
          { value: "", label: "Todos" },
          { value: "1", label: "Pago Efectivo" },
          { value: "2", label: "Pago Transferencia" },
          { value: "3", label: "Pago POS" },
          { value: "4", label: "Transferencia" },
          { value: "5", label: "Operación Operadora" },
          { value: "6", label: "Red de Pago" },
        ],
      },
      {
        name: "fechaRango",
        label: "Rango de Fechas",
        type: "date-range",
        initialValue: { desde: "", hasta: "" },
      },
    ],
    []
  );

  const {
    filterValues,
    appliedFilters,
    page,
    pageSize,
    handleFilterChange,
    applyFilters,
    validateFilters,
    handlePageChange,
    resetFilters,
  } = useFilters({
    filters: isAdmin ? filterConfigsAdmin : filterConfigsUser,
    initialPage: 1,
    initialPageSize: 10,
  });

  const { data, isLoading, error } = useGetAllSesionesLocalQuery(
    {
      page,
      query: {
        localId,
        abierta: appliedFilters.abierta
          ? appliedFilters.abierta === "true"
          : undefined,
        desde: appliedFilters.fechaRango?.desde || undefined,
        hasta: appliedFilters.fechaRango?.hasta || undefined,
        orderBy: "createAt",
        asc: false,
      },
    },
    { skip: !isAdmin }
  );

  const { data: movimientosData, isLoading: isLoadingMovimientos, error: errorMovimientos } = useGetAllMovimientosQuery(
    {
      page,
      query: {
        sesionLocalId: Number(activeSesion?.id),
        tipoMovimiento: appliedFilters.tipoMovimiento
          ? Number(appliedFilters.tipoMovimiento)
          : undefined,
        fechaInicio: appliedFilters.fechaRango?.desde || undefined,
        fechaFin: appliedFilters.fechaRango?.hasta || undefined,
        orderBy: "CreateAt",
        asc: false,
      },
    },
    { skip: isAdmin || !activeSesion?.id }
  );

  const sortedData = useMemo(() => {
    if (!data?.data) return [];
    return [...data.data].sort((a, b) => {
      if (a.abierta === b.abierta) return 0;
      return a.abierta ? -1 : 1;
    });
  }, [data]);

  const [openSesion, { isLoading: isOpening }] = useOpenSesionLocalMutation();
  const [closeSesion, { isLoading: isClosing }] = useCloseSesionLocalMutation();

  const sesionAbierta = useMemo(() => {
    if (isAdmin) {
      return data?.data.find((s) => s.abierta);
    }
    return activeSesion;
  }, [data, activeSesion, isAdmin]);

  const canCloseSession = useMemo(() => {
    if (!sesionAbierta || !currentUserId) return false;
    return sesionAbierta.userId === currentUserId;
  }, [sesionAbierta, currentUserId]);

  const handleOpenSesion = async (formData: SesionLocalRequest) => {
    try {
      await openSesion({ localId, body: formData }).unwrap();
      notify.success("Sesión abierta exitosamente");
      setOpenDrawer(false);
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al abrir la sesión");
    }
  };

  const handleCloseSesion = async (formData: SesionLocalRequest) => {
    try {
      await closeSesion({ localId, body: formData }).unwrap();
      notify.success("Sesión cerrada exitosamente");
      setCloseDrawer(false);
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al cerrar la sesión");
    }
  };

  const columns: ColumnConfig<SesionLocalDto>[] = [
    {
      key: "userName",
      header: "Usuario",
    },
    {
      key: "abierta",
      header: "Estado",
      align: "center",
      render: (row) => {
        if (!row.abierta) {
          return (
            <Chip
              icon={<LockIcon />}
              label="Cerrada"
              color="default"
              size="small"
            />
          );
        }
        const isCurrentUser = row.userId === currentUserId;
        return (
          <Chip
            icon={<LockOpenIcon />}
            label={isCurrentUser ? "Abierta (Tuya)" : "Abierta (Otro usuario)"}
            color={isCurrentUser ? "success" : "warning"}
            size="small"
          />
        );
      },
    },
    {
      key: "createAt",
      header: "Fecha Apertura",
      render: (row) => formatDateTime(row.createAt),
    },
    {
      key: "actions",
      header: "Acciones",
      align: "center",
      render: (row) => (
        <Button
          variant="text"
          size="small"
          startIcon={<VisibilityIcon />}
          endIcon={<ArrowForwardIcon className="arrow-icon" />}
          onClick={() => navigate(`/sesion-local/${row.id}`)}
          sx={{
            "& .arrow-icon": {
              transition: "transform 0.2s ease",
            },
            "&:hover .arrow-icon": {
              transform: "translateX(4px)",
            },
          }}
        >
          Ver
        </Button>
      ),
    },
  ];

  const movimientosColumns: ColumnConfig<MovimientoDto>[] = [
    {
      key: "createAt",
      header: "Fecha",
      render: (row) => formatDateTime(row.createAt),
    },
    {
      key: "tipoMovimiento",
      header: "Tipo",
      render: (row) =>
        TIPO_MOVIMIENTO_LABELS[row.tipoMovimiento] || "Desconocido",
    },
    {
      key: "fuenteDeFondo",
      header: "Fuente de Fondo",
      render: (row) => getFuenteDeFondoNombre(row),
    },
    {
      key: "isEntrada",
      header: "Dirección",
      render: (row) => (row.isEntrada ? "Entrada" : "Salida"),
      align: "center",
    },
    {
      key: "monto",
      header: "Monto (Gs.)",
      render: (row) => formatCurrency(row.monto),
      align: "right",
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (row) => row.descripcion || "-",
    },
  ];

  if (!isAdmin) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6">Mi Sesión</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {sesionAbierta && (
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFilterDrawerOpen(true)}
                size="small"
              >
                Filtros
              </Button>
            )}
            {!sesionAbierta && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDrawer(true)}
                size="small"
              >
                Abrir Sesión
              </Button>
            )}
            {sesionAbierta && (
              <>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<LockIcon />}
                  onClick={() => setCloseDrawer(true)}
                  size="small"
                >
                  Cerrar Sesión
                </Button>
                {puedeRealizarVentas && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ShoppingCartIcon />}
                    endIcon={<ArrowForwardIcon className="arrow-icon" />}
                    onClick={() => navigate(`/local/${localId}/ventas`)}
                    size="small"
                    sx={{
                      "& .arrow-icon": {
                        transition: "transform 0.2s ease",
                      },
                      "&:hover .arrow-icon": {
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    Ir a Ventas
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>

        {isLoadingActive ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Cargando...
          </Alert>
        ) : sesionAbierta ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Tienes una sesión abierta en{" "}
            {sesionAbierta.localNombre || localNombre}
            <br />
            <Typography variant="caption">
              Abierta el: {formatDateTime(sesionAbierta.createAt)}
            </Typography>
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            No tienes ninguna sesión abierta
          </Alert>
        )}

        {sesionAbierta && (
          <>
            <FilterDrawer
              open={filterDrawerOpen}
              onClose={() => setFilterDrawerOpen(false)}
              filters={filterConfigsUser}
              values={filterValues}
              onChange={handleFilterChange}
              onReset={resetFilters}
              onApply={applyFilters}
              validateFilters={validateFilters}
            />

            <DataTable
              columns={movimientosColumns}
              rows={movimientosData?.data || []}
              loading={isLoadingMovimientos}
              error={errorMovimientos}
              page={page}
              pageSize={pageSize}
              total={movimientosData?.totalRecords || 0}
              onPageChange={handlePageChange}
            />
          </>
        )}

        <FormDrawer
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          title={`Abrir Sesión - ${localNombre}`}
        >
          <SesionLocalForm
            onSubmit={handleOpenSesion}
            loading={isOpening}
            localId={localId}
            mode="open"
          />
        </FormDrawer>

        <FormDrawer
          open={closeDrawer}
          onClose={() => setCloseDrawer(false)}
          title={`Cerrar Sesión - ${localNombre}`}
        >
          <SesionLocalForm
            onSubmit={handleCloseSesion}
            loading={isClosing}
            localId={localId}
            mode="close"
          />
        </FormDrawer>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">Sesión del Local</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setFilterDrawerOpen(true)}
            size="small"
          >
            Filtros
          </Button>
          {!sesionAbierta && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDrawer(true)}
              size="small"
            >
              Abrir Sesión
            </Button>
          )}
          {sesionAbierta && (
            <>
              {canCloseSession && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<LockIcon />}
                  onClick={() => setCloseDrawer(true)}
                  size="small"
                >
                  Cerrar Sesión
                </Button>
              )}
              {canCloseSession && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ShoppingCartIcon />}
                  endIcon={<ArrowForwardIcon className="arrow-icon" />}
                  onClick={() => navigate(`/local/${localId}/ventas`)}
                  size="small"
                  sx={{
                    "& .arrow-icon": {
                      transition: "transform 0.2s ease",
                    },
                    "&:hover .arrow-icon": {
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  Ir a Ventas
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>

      {sesionAbierta ? (
        canCloseSession ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Hay una sesión abierta para este local (abierta por ti)
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Hay una sesión abierta para este local (abierta por{" "}
            {sesionAbierta.userName}). Solo el usuario que abrió la sesión puede
            cerrarla.
          </Alert>
        )
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          No hay sesión abierta para este local
        </Alert>
      )}

      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filterConfigsAdmin}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={resetFilters}
        onApply={applyFilters}
        validateFilters={validateFilters}
      />

      <DataTable
        columns={columns}
        rows={sortedData}
        loading={isLoading}
        error={error}
        page={page}
        pageSize={pageSize}
        total={data?.totalRecords || 0}
        onPageChange={handlePageChange}
      />

      <FormDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        title={`Abrir Sesión - ${localNombre}`}
      >
        <SesionLocalForm
          onSubmit={handleOpenSesion}
          loading={isOpening}
          localId={localId}
          mode="open"
        />
      </FormDrawer>

      <FormDrawer
        open={closeDrawer}
        onClose={() => setCloseDrawer(false)}
        title={`Cerrar Sesión - ${localNombre}`}
      >
        <SesionLocalForm
          onSubmit={handleCloseSesion}
          loading={isClosing}
          localId={localId}
          mode="close"
        />
      </FormDrawer>
    </Paper>
  );
};
