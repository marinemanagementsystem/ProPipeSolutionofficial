import type { Timestamp } from "firebase/firestore";

export const formatCurrency = (
  amount: number,
  currency: string = "TRY"
): string => {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("tr-TR")} ${currency}`;
  }
};

export const formatDate = (timestamp?: Timestamp): string => {
  if (!timestamp) return "-";
  const date = timestamp.toDate();
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
