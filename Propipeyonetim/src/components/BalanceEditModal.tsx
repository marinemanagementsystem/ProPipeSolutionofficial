import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import type { Partner } from '../types/Partner';
import { updatePartnerBalance } from '../services/partners';
import { useAuth } from '../context/AuthContext';

interface BalanceEditModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  partner: Partner | null;
}

const BalanceEditModal: React.FC<BalanceEditModalProps> = ({
  open,
  onClose,
  onSuccess,
  partner,
}) => {
  const { currentUserAuth } = useAuth();
  const [newBalance, setNewBalance] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (partner && open) {
      setNewBalance(partner.currentBalance.toString());
      setReason('');
      setError(null);
    }
  }, [partner, open]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleSubmit = async () => {
    if (!partner) return;

    const balanceValue = parseFloat(newBalance.replace(',', '.'));
    if (isNaN(balanceValue)) {
      setError('Geçerli bir tutar giriniz.');
      return;
    }

    if (!reason.trim()) {
      setError('Değişiklik sebebi zorunludur.');
      return;
    }

    if (reason.trim().length < 5) {
      setError('Değişiklik sebebi en az 5 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updatePartnerBalance(
        partner.id,
        balanceValue,
        reason.trim(),
        currentUserAuth
          ? {
              uid: currentUserAuth.uid,
              email: currentUserAuth.email || '',
              displayName: currentUserAuth.displayName || '',
            }
          : undefined
      );
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Bakiye güncellenirken hata:', err);
      setError('Bakiye güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const difference = partner
    ? parseFloat(newBalance.replace(',', '.')) - partner.currentBalance
    : 0;

  const isValidDifference = !isNaN(difference) && difference !== 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box component="span" sx={{ fontWeight: 'bold' }}>
          Bakiye Düzenle
        </Box>
        {partner && (
          <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
            {partner.name}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {partner && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Mevcut Bakiye
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              color={partner.currentBalance >= 0 ? 'warning.main' : 'success.main'}
            >
              {formatCurrency(partner.currentBalance)}
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          label="Yeni Bakiye"
          type="text"
          value={newBalance}
          onChange={(e) => setNewBalance(e.target.value)}
          onFocus={(e) => e.target.select()}
          InputProps={{
            endAdornment: <InputAdornment position="end">TRY</InputAdornment>,
          }}
          sx={{ mb: 2 }}
          helperText="Pozitif değer: Ortak şirkete borçlu | Negatif değer: Şirket ortağa borçlu"
        />

        {isValidDifference && (
          <Alert severity={difference > 0 ? 'warning' : 'info'} sx={{ mb: 2 }}>
            <Typography variant="body2">
              Değişim:{' '}
              <strong>
                {difference > 0 ? '+' : ''}
                {formatCurrency(difference)}
              </strong>
            </Typography>
          </Alert>
        )}

        <TextField
          fullWidth
          label="Değişiklik Sebebi"
          multiline
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Örn: Açılış bakiyesi düzeltmesi, Hesaplama hatası düzeltmesi, vb."
          required
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !reason.trim()}
        >
          {loading ? <CircularProgress size={24} /> : 'Güncelle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BalanceEditModal;
