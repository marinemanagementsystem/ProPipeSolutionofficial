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

export const formatDateShort = (timestamp?: Timestamp): string => {
  if (!timestamp) return "-";
  const date = timestamp.toDate();
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
  });
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString("tr-TR");
};

export const getInitials = (name: string): string => {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};
