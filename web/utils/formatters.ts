/**
 * Currency and formatting utilities for DhanSetu API data
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Compact INR label for tight spaces (e.g. heatmap tiles): ₹1.2L / ₹45.0k / ₹320 / -₹3.1k
export function formatCurrencyCompact(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return "₹0";
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}k`;
  return `${sign}₹${Math.round(abs)}`;
}
