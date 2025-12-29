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
import { UsersForm } from "./components/UsersForm";
import type { UsersFormData } from "./components/UsersForm";
import { UsersDetails } from "./components/UsersDetails";
import { useFilters } from "../../hooks/useFilters";
import type { FilterConfig } from "../../hooks/useFilters";
import { useOpenModal } from "../../hooks/useOpenModal";
import { useHasPermisos } from "../../hooks/useHasPermisos";
import {
  useGetAllUserQuery,
  useGetUserQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../../services/api/userApi";
import { useLazyGetAllLocalesQuery } from "../../services/api/localesApi";
import type {
  UserDto,
  UserRequest,
  UserUpdateRequest,
  RoleEnum,
} from "../../types";
import { ROLE_OPTIONS } from "../../enum/roleEnum";
import { notify } from "../../utils/notify";
import { createLocalLoader } from "../../utils/filterHelpers";
import { useLocalFilter } from "../../contexts/LocalFilterContext";
import { formatDate } from "../../utils/dateFormat";

const UsersPage: React.FC = () => {
  const { hasWritePermission } = useHasPermisos();
  const { modalState, openModal, closeModal } = useOpenModal();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const { selectedLocalId } = useLocalFilter();

  const [lazyGetAllLocales] = useLazyGetAllLocalesQuery();

  const filterConfigs: FilterConfig[] = useMemo(() => {
    const configs: FilterConfig[] = [
      {
        name: "userName",
        label: "Nombre de Usuario",
        type: "string",
        initialValue: "",
      },
      {
        name: "role",
        label: "Rol",
        type: "select",
        initialValue: "",
        options: ROLE_OPTIONS,
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

  const { data, isLoading, error } = useGetAllUserQuery({
    page,
    query: {
      userName: appliedFilters.userName || undefined,
      role:
        appliedFilters.role !== ""
          ? (Number(appliedFilters.role) as RoleEnum)
          : undefined,
      localId: selectedLocalId || appliedFilters.localId?.value || undefined,
    },
  });

  const paginatedData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.slice(0, pageSize);
  }, [data, pageSize]);

  const shouldFetchSelected =
    Boolean(modalState.id) && ["details"].includes(modalState.type || "");

  const { data: fetchedUser, isLoading: isLoadingUser } = useGetUserQuery(
    String(modalState.id || ""),
    {
      skip: !shouldFetchSelected,
    }
  );

  const [addUser, { isLoading: isAdding }] = useAddUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const currentUser =
    modalState.type === "details" && modalState.data
      ? (modalState.data as UserDto)
      : fetchedUser;

  const handleAdd = async (formData: UsersFormData) => {
    try {
      const requestData: UserRequest = {
        userName: formData.userName,
        telefono: formData.telefono,
        password: formData.password || "",
        role: formData.role as RoleEnum,
        localId: formData.localId,
        modifyStock: formData.modifyStock ?? false,
      };
      await addUser(requestData).unwrap();
      notify.success("Usuario creado exitosamente");
      closeModal();
    } catch (err: unknown) {
      const error = err as any;
      notify.error(error?.data?.message || "Error al crear el usuario");
    }
  };

  const handleEdit = async (formData: UsersFormData) => {
    if (modalState.id === undefined || modalState.id === null) return;
    try {
      const requestData: UserUpdateRequest = {
        userName: formData.userName,
        telefono: formData.telefono,
        password: formData.password || undefined,
        role: formData.role as RoleEnum,
        localId: formData.localId,
        modifyStock: formData.modifyStock,
      };
      await updateUser({
        id: String(modalState.id),
        body: requestData,
      }).unwrap();
      notify.success("Usuario actualizado exitosamente");
      closeModal();
    } catch (err: unknown) {
      const error = err as any;
      notify.error(error?.data?.message || "Error al actualizar el usuario");
    }
  };

  const handleDelete = async () => {
    if (modalState.id === undefined || modalState.id === null) return;
    try {
      await deleteUser(String(modalState.id)).unwrap();
      notify.success("Usuario eliminado exitosamente");
      closeModal();
    } catch (err: unknown) {
      const error = err as any;
      notify.error(error?.data?.message || "Error al eliminar el usuario");
    }
  };

  const columns: ColumnConfig<UserDto>[] = [
    {
      key: "userName",
      header: "Nombre de Usuario",
    },
    {
      key: "telefono",
      header: "Teléfono",
    },
    {
      key: "localNombre",
      header: "Local",
      render: (row) => row.localNombre ?? "",
    },
    {
      key: "role",
      header: "Rol",
      render: (row) =>
        ROLE_OPTIONS.find((o) => o.value === row.role)?.label ?? row.role,
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

  const actions: ActionMenuItem<UserDto>[] = [
    {
      label: "Ver detalles",
      icon: <VisibilityIcon fontSize="small" />,
      onClick: (row) => openModal("details", row.id, row),
      color: "info",
    },
    {
      label: "Editar",
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => openModal("edit", row.id, row),
      color: "primary",
      show: () => hasWritePermission,
    },
    {
      label: "Eliminar",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row) => openModal("delete", row.id, row),
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
            Gestión de Usuarios
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
                Nuevo Usuario
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
        title="Nuevo Usuario"
      >
        <UsersForm onSubmit={handleAdd} loading={isAdding} mode="create" />
      </FormDrawer>

      <FormDrawer
        open={modalState.type === "edit"}
        onClose={closeModal}
        title="Editar Usuario"
      >
        <UsersForm
          key={modalState.id}
          onSubmit={handleEdit}
          defaultValues={
            modalState.data
              ? {
                  userName: modalState.data.userName,
                  telefono: modalState.data.telefono,
                  role: modalState.data.role,
                  localId: modalState.data.localId,
                }
              : undefined
          }
          loading={isUpdating}
          mode="update"
        />
      </FormDrawer>

      <ConfirmDialog
        open={modalState.type === "delete"}
        title="Eliminar Usuario"
        description={`¿Está seguro que desea eliminar el usuario "${
          modalState.data?.userName ?? ""
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
        title="Detalles del Usuario"
      >
        <UsersDetails user={currentUser} loading={isLoadingUser} />
      </FormDrawer>
    </Box>
  );
};

export default UsersPage;
