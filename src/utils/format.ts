/**
 * Formats a number as Paraguayan currency with dots for thousands separators
 * @param amount - The number to format
 * @returns Formatted string with dots for thousands and Gs. suffix
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) {
    return "0";
  }
  // Format the number with dots for thousands
  const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}`;
};
