/**
 * Formatea un número al formato de Pesos Colombianos (COP)
 * Ejemplo: 85000 -> "$ 85.000 COP"
 */
export const formatCOP = (amount) => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$ 0 COP';
  }
  
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(amount);

  return `${formatted} COP`;
};
