import React, { useState, useMemo } from "react";
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
import { LocalForm } from "./components/LocalForm";
import type { LocalFormData } from "./components/LocalForm";
import { LocalDetails } from "./components/LocalDetails";
import { useFilters } from "../../hooks/useFilters";
import type { FilterConfig } from "../../hooks/useFilters";
import { useOpenModal } from "../../hooks/useOpenModal";
import { useHasPermisos } from "../../hooks/useHasPermisos";
import {
  useGetAllLocalesQuery,
  useGetLocalQuery,
  useAddLocalMutation,
  useUpdateLocalMutation,
  useDeleteLocalMutation,
} from "../../services/api/localesApi";
import type { LocalDto } from "../../types";
import { notify } from "../../utils/notify";

const filterConfigs: FilterConfig[] = [
  {
    name: "nombre",
    label: "Nombre",
    type: "string",
    initialValue: "",
  },
];

const LocalesPage: React.FC = () => {
  const { hasWritePermission } = useHasPermisos();
  const { modalState, openModal, closeModal } = useOpenModal();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

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

  const { data, isLoading, error } = useGetAllLocalesQuery({
    page,
    query: {
      nombre: appliedFilters.nombre || undefined,
    },
  });

  const paginatedData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.slice(0, pageSize);
  }, [data, pageSize]);

  const { data: selectedLocal, isLoading: isLoadingLocal } = useGetLocalQuery(
    (modalState.id as number) || 0,
    {
      skip:
        (modalState.type !== "edit" && modalState.type !== "details") ||
        !modalState.id,
    }
  );

  const [addLocal, { isLoading: isAdding }] = useAddLocalMutation();
  const [updateLocal, { isLoading: isUpdating }] = useUpdateLocalMutation();
  const [deleteLocal, { isLoading: isDeleting }] = useDeleteLocalMutation();

  const handleAdd = async (formData: LocalFormData) => {
    try {
      await addLocal(formData).unwrap();
      notify.success("Local creado exitosamente");
      closeModal();
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al crear el local");
    }
  };

  const handleEdit = async (formData: LocalFormData) => {
    if (!modalState.id) return;
    try {
      await updateLocal({
        id: modalState.id as number,
        body: formData,
      }).unwrap();
      notify.success("Local actualizado exitosamente");
      closeModal();
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al actualizar el local");
    }
  };

  const handleDelete = async () => {
    if (!modalState.id) return;
    try {
      await deleteLocal(modalState.id as number).unwrap();
      notify.success("Local eliminado exitosamente");
      closeModal();
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al eliminar el local");
    }
  };

  const columns: ColumnConfig<LocalDto>[] = [
    {
      key: "nombre",
      header: "Nombre",
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
      render: (row) => new Date(row.createAt).toLocaleDateString(),
    },
  ];

  const actions: ActionMenuItem<LocalDto>[] = [
    {
      label: "Ver detalles",
      icon: <VisibilityIcon fontSize="small" />,
      onClick: (row) => openModal("details", Number(row.id)),
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
            Gestión de Locales
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
                Nuevo Local
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
        title="Nuevo Local"
      >
        <LocalForm onSubmit={handleAdd} loading={isAdding} />
      </FormDrawer>
      <FormDrawer
        open={modalState.type === "edit"}
        onClose={closeModal}
        title="Editar Local"
      >
        {isLoadingLocal ? (
          <Typography>Cargando...</Typography>
        ) : (
          <LocalForm
            onSubmit={handleEdit}
            defaultValues={
              selectedLocal ? { nombre: selectedLocal.nombre } : undefined
            }
            loading={isUpdating}
          />
        )}
      </FormDrawer>

      <ConfirmDialog
        open={modalState.type === "delete"}
        title="Eliminar Local"
        description={`¿Está seguro que desea eliminar el local "${modalState.data?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={closeModal}
        loading={isDeleting}
        confirmText="Eliminar"
        confirmColor="error"
      />

      <FormDrawer
        open={modalState.type === "details"}
        onClose={closeModal}
        title="Detalles del Local"
      >
        <LocalDetails local={selectedLocal} loading={isLoadingLocal} />
      </FormDrawer>
    </Box>
  );
};

export default LocalesPage;
