import React, { useMemo, useState } from "react";
import { Box, Button, Chip, Typography, Paper } from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { DataTable } from "../../components/DataTable";
import type { ColumnConfig, ActionMenuItem } from "../../components/DataTable";
import { FilterDrawer } from "../../components/FilterDrawer";
import { FormDrawer } from "../../components/FormDrawer";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { SistemaExternoForm } from "./components/SistemaExternoForm";
import type { SistemaExternoFormData } from "./components/SistemaExternoForm";
import { SistemaExternoDetails } from "./components/SistemaExternoDetails";
import { useFilters } from "../../hooks/useFilters";
import type { FilterConfig } from "../../hooks/useFilters";
import { useOpenModal } from "../../hooks/useOpenModal";
import { useHasPermisos } from "../../hooks/useHasPermisos";
import {
  useGetAllSistemaExternoQuery,
  useGetSistemaExternoQuery,
  useAddSistemaExternoMutation,
  useUpdateSistemaExternoMutation,
  useDeleteSistemaExternoMutation,
} from "../../services/api/sistemaExternoApi";
import { useLazyGetAllLocalesQuery } from "../../services/api/localesApi";
import type { SistemaExternoDto } from "../../types";
import { CONTEO_OPTIONS } from "../../enum/conteoEnum";
import { notify } from "../../utils/notify";
import { formatCurrency } from "../../utils/format";
import { formatDate } from "../../utils/dateFormat";
import { createLocalLoader } from "../../utils/filterHelpers";
import { useLocalFilter } from "../../contexts/LocalFilterContext";

const SistemaExternoPage: React.FC = () => {
  const { hasWritePermission } = useHasPermisos();
  const { modalState, openModal, closeModal } = useOpenModal();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const { selectedLocalId } = useLocalFilter();

  const [lazyGetAllLocales] = useLazyGetAllLocalesQuery();

  const filterConfigs: FilterConfig[] = useMemo(() => {
    const configs: FilterConfig[] = [
      {
        name: "nombre",
        label: "Nombre",
        type: "string",
        initialValue: "",
      },
      {
        name: "conteo",
        label: "Conteo",
        type: "select",
        initialValue: "",
        options: CONTEO_OPTIONS,
      },
    ];

    if (!selectedLocalId) {
      configs.push({
        name: "localId",
        label: "Local",
        type: "async-select",
        initialValue: null,
        loadOptions: createLocalLoader(lazyGetAllLocales),
        placeholder: "Buscar local...",
      });
    }

    return configs;
  }, [lazyGetAllLocales, selectedLocalId]);

  const {
    filterValues,
    appliedFilters,
    page,
    pageSize,
    handleFilterChange,
    applyFilters,
    handlePageChange,
    resetFilters,
  } = useFilters({
    filters: filterConfigs,
    initialPage: 1,
    initialPageSize: 10,
  });

  const { data, isLoading, error } = useGetAllSistemaExternoQuery({
    page,
    query: {
      nombre: appliedFilters.nombre || undefined,
      conteo:
        appliedFilters.conteo !== ""
          ? Number(appliedFilters.conteo)
          : undefined,
      localId: selectedLocalId || appliedFilters.localId?.value || undefined,
    },
  });

  const paginatedData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.slice(0, pageSize);
  }, [data, pageSize]);

  const shouldFetchSelected =
    Boolean(modalState.id) &&
    ["edit", "details"].includes(modalState.type || "");

  const { data: fetchedSistema, isLoading: isLoadingSistema } =
    useGetSistemaExternoQuery((modalState.id as number) || 0, {
      skip: !shouldFetchSelected,
    });

  const [addSistemaExterno, { isLoading: isAdding }] =
    useAddSistemaExternoMutation();
  const [updateSistemaExterno, { isLoading: isUpdating }] =
    useUpdateSistemaExternoMutation();
  const [deleteSistemaExterno, { isLoading: isDeleting }] =
    useDeleteSistemaExternoMutation();

  const currentSistema =
    modalState.type === "details" && modalState.data
      ? (modalState.data as SistemaExternoDto)
      : fetchedSistema;

  const handleAdd = async (formData: SistemaExternoFormData) => {
    try {
      await addSistemaExterno(formData).unwrap();
      notify.success("Sistema externo creado exitosamente");
      closeModal();
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al crear el sistema externo");
    }
  };

  const handleEdit = async (formData: SistemaExternoFormData) => {
    if (!modalState.id) return;
    try {
      await updateSistemaExterno({
        id: modalState.id as number,
        body: formData,
      }).unwrap();
      notify.success("Sistema externo actualizado exitosamente");
      closeModal();
    } catch (err: any) {
      notify.error(
        err?.data?.message || "Error al actualizar el sistema externo"
      );
    }
  };

  const handleDelete = async () => {
    if (!modalState.id) return;
    try {
      await deleteSistemaExterno(modalState.id as number).unwrap();
      notify.success("Sistema externo eliminado exitosamente");
      closeModal();
    } catch (err: any) {
      notify.error(
        err?.data?.message || "Error al eliminar el sistema externo"
      );
    }
  };

  const columns: ColumnConfig<SistemaExternoDto>[] = [
    {
      key: "nombre",
      header: "Nombre",
    },
    {
      key: "montoPorOperacion",
      header: "Monto por Operación (Gs.)",
      align: "center",
      render: (row) => formatCurrency(row.montoPorOperacion),
    },
    {
      key: "conteo",
      header: "Conteo",
      render: (row) =>
        CONTEO_OPTIONS.find((option) => option.value === row.conteo)?.label ??
        row.conteo,
    },
    {
      key: "localNombre",
      header: "Local",
      align: "center",
    },
    {
      key: "active",
      header: "Estado",
      align: "center",
      render: (row) =>
        row.active ? (
          <Chip
            icon={<CheckCircleIcon />}
            label="Activo"
            color="success"
            size="small"
          />
        ) : (
          <Chip
            icon={<CancelIcon />}
            label="Inactivo"
            color="default"
            size="small"
          />
        ),
    },
    {
      key: "createAt",
      header: "Fecha Creación",
      render: (row) => formatDate(row.createAt),
    },
  ];

  const actions: ActionMenuItem<SistemaExternoDto>[] = [
    {
      label: "Ver detalles",
      icon: <VisibilityIcon fontSize="small" />,
      onClick: (row) => openModal("details", Number(row.id), row),
      color: "info",
    },
    {
      label: "Editar",
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => openModal("edit", Number(row.id)),
      color: "primary",
      show: () => hasWritePermission,
    },
    {
      label: "Eliminar",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row) => openModal("delete", Number(row.id), row),
      color: "error",
      show: () => hasWritePermission,
    },
  ];

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
          }}
        >
          <Typography variant="h5" component="h1">
            Gestión de Sistemas Externos
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDrawerOpen(true)}
              size="small"
            >
              Filtros
            </Button>
            {hasWritePermission && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openModal("add")}
                size="small"
              >
                Nuevo Sistema
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filterConfigs}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={resetFilters}
        onApply={applyFilters}
      />

      <DataTable
        columns={columns}
        rows={paginatedData}
        loading={isLoading}
        error={error}
        page={page}
        pageSize={pageSize}
        total={data?.totalRecords || 0}
        onPageChange={handlePageChange}
        actions={actions}
      />

      <FormDrawer
        open={modalState.type === "add"}
        onClose={closeModal}
        title="Nuevo Sistema Externo"
      >
        <SistemaExternoForm onSubmit={handleAdd} loading={isAdding} />
      </FormDrawer>

      <FormDrawer
        open={modalState.type === "edit"}
        onClose={closeModal}
        title="Editar Sistema Externo"
      >
        {isLoadingSistema ? (
          <Typography>Cargando...</Typography>
        ) : (
          <SistemaExternoForm
            onSubmit={handleEdit}
            defaultValues={
              fetchedSistema
                ? {
                    nombre: fetchedSistema.nombre,
                    localId: fetchedSistema.localId,
                    montoPorOperacion: fetchedSistema.montoPorOperacion,
                    conteo: fetchedSistema.conteo,
                  }
                : undefined
            }
            loading={isUpdating}
          />
        )}
      </FormDrawer>

      <ConfirmDialog
        open={modalState.type === "delete"}
        title="Eliminar Sistema Externo"
        description={`¿Está seguro que desea eliminar el sistema externo "${
          modalState.data?.nombre ?? ""
        }"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={closeModal}
        loading={isDeleting}
        confirmText="Eliminar"
        confirmColor="error"
      />

      <FormDrawer
        open={modalState.type === "details"}
        onClose={closeModal}
        title="Detalles del Sistema Externo"
      >
        <SistemaExternoDetails
          sistema={currentSistema}
          loading={isLoadingSistema}
        />
      </FormDrawer>
    </Box>
  );
};

export default SistemaExternoPage;
