import { format as dateFnsFormat } from "date-fns";
import { tr } from "date-fns/locale";
import { Timestamp } from "firebase/firestore";
import { Currency } from "../types";

export const formatCurrency = (
  amount: number,
  currency: Currency = "TRY"
): string => {
  const symbols: Record<Currency, string> = {
    TRY: "₺",
    EUR: "€",
    USD: "$"
  };

  const symbol = symbols[currency] || currency;
  const formattedAmount = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  return `${symbol}${formattedAmount}`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
};

export const formatDate = (
  date: Date | Timestamp | undefined | null,
  formatStr: string = "dd MMM yyyy"
): string => {
  if (!date) return "-";

  let dateObj: Date;

  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    return "-";
  }

  return dateFnsFormat(dateObj, formatStr, { locale: tr });
};

export const formatDateTime = (
  date: Date | Timestamp | undefined | null
): string => {
  return formatDate(date, "dd MMM yyyy HH:mm");
};

export const formatShortDate = (
  date: Date | Timestamp | undefined | null
): string => {
  return formatDate(date, "dd/MM/yyyy");
};

export const formatMonthYear = (month: number, year: number): string => {
  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  return `${monthNames[month - 1]} ${year}`;
};

export const formatPercentage = (value: number): string => {
  return `%${value.toFixed(1)}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

export const getInitials = (name: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const getRelativeTime = (date: Date | Timestamp | undefined | null): string => {
  if (!date) return "-";

  let dateObj: Date;

  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    return "-";
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "Az önce";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} dakika önce`;
  } else if (diffHours < 24) {
    return `${diffHours} saat önce`;
  } else if (diffDays < 7) {
    return `${diffDays} gün önce`;
  } else {
    return formatShortDate(dateObj);
  }
};
