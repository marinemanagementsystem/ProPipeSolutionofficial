import { Timestamp } from 'firebase/firestore';

/**
 * Para birimi formatla
 */
export const formatCurrency = (
  value: number,
  currency: string = 'TRY'
): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(value);
};

/**
 * Sayıyı formatla (para birimi olmadan)
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Tarihi formatla
 */
export const formatDate = (
  date: Date | Timestamp | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!date) return '-';

  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (date && typeof (date as Timestamp).toDate === 'function') {
    d = (date as Timestamp).toDate();
  } else {
    return '-';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('tr-TR', defaultOptions).format(d);
};

/**
 * Tarih ve saati formatla
 */
export const formatDateTime = (date: Date | Timestamp | null | undefined): string => {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Ay ismini getir
 */
export const getMonthName = (month: number): string => {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  return months[month] || '';
};

/**
 * Timestamp'i güvenli bir şekilde Date'e çevir
 */
export const safeToDate = (timestamp: Timestamp | null | undefined): Date | null => {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    return null;
  }
  try {
    return timestamp.toDate();
  } catch {
    return null;
  }
};

/**
 * Metni kısalt
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Telefon numarasını formatla
 */
export const formatPhone = (phone: string | undefined | null): string => {
  if (!phone) return '-';

  // Remove non-digits
  const digits = phone.replace(/\D/g, '');

  // Turkish format: 0xxx xxx xx xx
  if (digits.length === 10) {
    return `0${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6, 8)} ${digits.substring(8)}`;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    return `${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7, 9)} ${digits.substring(9)}`;
  }

  return phone;
};

/**
 * Bakiye durumunu belirle
 */
export const getBalanceStatus = (balance: number): {
  text: string;
  type: 'positive' | 'negative' | 'neutral';
} => {
  if (balance > 0) {
    return {
      text: 'Fazla alınan (ortak şirkete borçlu)',
      type: 'positive',
    };
  } else if (balance < 0) {
    return {
      text: 'Eksik alınan (şirket ortağa borçlu)',
      type: 'negative',
    };
  }
  return {
    text: 'Bakiye dengede',
    type: 'neutral',
  };
};
