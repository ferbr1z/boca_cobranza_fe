export function useHasPermisos() {
  const hasWritePermission = true;
  const hasReadPermission = true;
  const hasDeletePermission = true;

  return {
    hasWritePermission,
    hasReadPermission,
    hasDeletePermission,
  };
}
