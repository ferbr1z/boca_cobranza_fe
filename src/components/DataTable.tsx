import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export interface ColumnConfig<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  show?: boolean;
}

export interface ActionMenuItem<T> {
  label: string;
  icon: React.ReactElement;
  onClick: (row: T) => void;
  show?: (row: T) => boolean;
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
}

interface DataTableProps<T> {
  columns: ColumnConfig<T>[];
  rows: T[];
  loading?: boolean;
  error?: any;
  page: number;
  pageSize?: number;
  total: number;
  onPageChange: (page: number) => void;
  actions?: ActionMenuItem<T>[];
}

export function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  loading,
  error,
  page,
  pageSize = 10,
  total,
  onPageChange,
  actions,
}: DataTableProps<T>) {
  const visibleColumns = columns.filter((col) => col.show !== false);
  const [anchorEl, setAnchorEl] = React.useState<{
    [key: string | number]: HTMLElement | null;
  }>({});

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage + 1); // MUI usa 0-indexed, backend usa 1-indexed
  };

  const handleOpenMenu = (
    rowId: string | number,
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorEl({ ...anchorEl, [rowId]: event.currentTarget });
  };

  const handleCloseMenu = (rowId: string | number) => {
    setAnchorEl({ ...anchorEl, [rowId]: null });
  };

  return (
    <Paper>
      <TableContainer sx={{ height: "70vh", overflowY: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {visibleColumns.map((col) => (
                <TableCell key={col.key} align={col.align || "left"}>
                  {col.header}
                </TableCell>
              ))}
              {actions && actions.length > 0 && (
                <TableCell align="center">Acciones</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={
                    visibleColumns.length +
                    (actions && actions.length > 0 ? 1 : 0)
                  }
                  align="center"
                >
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    py={5}
                  >
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={
                    visibleColumns.length +
                    (actions && actions.length > 0 ? 1 : 0)
                  }
                  align="center"
                >
                  <Box py={3}>
                    <Typography variant="body1" color="error" gutterBottom>
                      Error al cargar datos
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {error?.data?.message ||
                        error?.message ||
                        "Ha ocurrido un error inesperado"}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    visibleColumns.length +
                    (actions && actions.length > 0 ? 1 : 0)
                  }
                  align="center"
                >
                  <Box py={5}>
                    <Typography
                      variant="body1"
                      color="textSecondary"
                      gutterBottom
                    >
                      No hay datos disponibles
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      No se encontraron registros con los filtros aplicados
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} hover>
                  {visibleColumns.map((col) => (
                    <TableCell key={col.key} align={col.align || "left"}>
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </TableCell>
                  ))}
                  {actions && actions.length > 0 && (
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(row.id, e)}
                        aria-label="acciones"
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl[row.id]}
                        open={Boolean(anchorEl[row.id])}
                        onClose={() => handleCloseMenu(row.id)}
                      >
                        {actions.map((action, index) => {
                          const shouldShow = action.show
                            ? action.show(row)
                            : true;
                          if (!shouldShow) return null;
                          return (
                            <MenuItem
                              key={index}
                              onClick={() => {
                                action.onClick(row);
                                handleCloseMenu(row.id);
                              }}
                            >
                              <ListItemIcon
                                sx={{ color: action.color || "inherit" }}
                              >
                                {action.icon}
                              </ListItemIcon>
                              <ListItemText>{action.label}</ListItemText>
                            </MenuItem>
                          );
                        })}
                      </Menu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        onPageChange={handleChangePage}
        rowsPerPage={pageSize}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count}`
        }
        rowsPerPageOptions={[]}
      />
    </Paper>
  );
}
