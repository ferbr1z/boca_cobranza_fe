/**
 * Utilidades para debugging de modales y drawers bloqueados
 * Ejecutar en la consola del navegador cuando haya problemas
 */

// Ver estilos actuales del body
export const checkBodyStyles = () => {
  return {
    overflow: document.body.style.overflow,
    paddingRight: document.body.style.paddingRight,
    position: document.body.style.position,
  };
};

// Contar backdrops atascados
export const checkBackdrops = () => {
  const backdrops = document.querySelectorAll('.MuiBackdrop-root');
  return backdrops;
};

// Limpiar manualmente todos los estilos y backdrops
export const forceCleanup = () => {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  document.body.style.position = '';
  
  const backdrops = document.querySelectorAll('.MuiBackdrop-root');
  backdrops.forEach(el => el.remove());
};

// Exponer funciones globalmente para uso en consola
if (typeof window !== 'undefined') {
  (window as any).debugModals = {
    checkBodyStyles,
    checkBackdrops,
    forceCleanup,
  };
}
