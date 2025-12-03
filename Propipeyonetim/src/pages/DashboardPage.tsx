import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  LinearProgress,
  Paper,
  Divider,
  useTheme,
  alpha,
  useMediaQuery,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import {
  getDashboardSummary,
  getLast6MonthsExpensesTrend,
  getLast6MonthsStatementsTrend,
  getUpcomingNetworkActions,
  getLatestExpenses,
  getLatestClosedStatements,
  getExpenseStatusLabel,
  getTransferActionLabel,
  getQuoteStatusLabelTR,
  type DashboardSummary,
  type MonthlyTrendItem,
  type StatementTrendItem,
  type NetworkActionItem,
  type StatementWithProject,
} from '../services/dashboard';
import { updateCompanyOverview, formatCurrency } from '../services/companyOverview';
import type { Expense } from '../types/Expense';
import { Timestamp } from 'firebase/firestore';

const formatDate = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return '-';
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const formatDateShort = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return '-';
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
};

interface SafeEditModalProps {
  open: boolean;
  onClose: () => void;
  currentBalance: number;
  onSave: (newBalance: number) => Promise<void>;
}

const SafeEditModal: React.FC<SafeEditModalProps> = ({
  open,
  onClose,
  currentBalance,
  onSave,
}) => {
  const [balance, setBalance] = useState(currentBalance);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setBalance(currentBalance);
  }, [currentBalance, open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(balance);
      onClose();
    } catch (error) {
      console.error('Kasa güncelleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth fullScreen={fullScreen}>
      <DialogTitle>Şirket Kasasını Güncelle</DialogTitle>
      <DialogContent>
        <TextField
          label="Şirket Kasası (TL)"
          type="number"
          value={balance}
          onChange={(e) => setBalance(Number(e.target.value))}
          onFocus={(e) => e.target.select()}
          fullWidth
          sx={{ mt: 2 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">₺</InputAdornment>,
          }}
          helperText="Banka + Nakit toplam tutarını giriniz"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>İptal</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUserAuth } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  const glassPanelSx = {
    p: { xs: 2.5, md: 3.5 },
    borderRadius: 5,
    border: `1px solid ${isDark ? alpha('#ffffff', 0.08) : alpha('#0f172a', 0.06)}`,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    background: isDark
      ? 'linear-gradient(145deg, rgba(15, 23, 42, 0.80) 0%, rgba(12, 18, 38, 0.75) 100%)'
      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.90) 100%)',
    backdropFilter: 'blur(12px)',
    boxShadow: isDark
      ? '0 24px 60px rgba(0, 0, 0, 0.50)'
      : '0 24px 60px rgba(15, 23, 42, 0.08)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      boxShadow: isDark
        ? '0 28px 72px rgba(0, 0, 0, 0.60)'
        : '0 28px 72px rgba(15, 23, 42, 0.12)',
      transform: 'translateY(-2px)',
    },
  };

  const statCardStyle = (color: string) => ({
    p: { xs: 2.5, md: 3 },
    borderRadius: 5,
    height: '100%',
    background: isDark
      ? `linear-gradient(135deg, ${alpha(color, 0.18)} 0%, ${alpha(color, 0.06)} 100%)`
      : `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, ${alpha(color, 0.04)} 100%)`,
    border: `1px solid ${alpha(color, isDark ? 0.30 : 0.25)}`,
    backdropFilter: 'blur(8px)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 20px 40px ${alpha(color, 0.25)}`,
      border: `1px solid ${alpha(color, isDark ? 0.45 : 0.40)}`,
    },
  });

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [expensesTrend, setExpensesTrend] = useState<MonthlyTrendItem[]>([]);
  const [statementsTrend, setStatementsTrend] = useState<StatementTrendItem[]>([]);
  const [networkActions, setNetworkActions] = useState<NetworkActionItem[]>([]);
  const [latestExpenses, setLatestExpenses] = useState<Expense[]>([]);
  const [latestStatements, setLatestStatements] = useState<StatementWithProject[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [safeModalOpen, setSafeModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        summaryData,
        expensesTrendData,
        statementsTrendData,
        networkActionsData,
        latestExpensesData,
        latestStatementsData,
      ] = await Promise.all([
        getDashboardSummary(),
        getLast6MonthsExpensesTrend(),
        getLast6MonthsStatementsTrend(),
        getUpcomingNetworkActions(),
        getLatestExpenses(5),
        getLatestClosedStatements(5),
      ]);

      setSummary(summaryData);
      setExpensesTrend(expensesTrendData);
      setStatementsTrend(statementsTrendData);
      setNetworkActions(networkActionsData);
      setLatestExpenses(latestExpensesData);
      setLatestStatements(latestStatementsData);
    } catch (err) {
      console.error('Dashboard veri yükleme hatası:', err);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveCompanySafe = async (newBalance: number) => {
    await updateCompanyOverview(
      { companySafeBalance: newBalance },
      currentUserAuth ? {
        uid: currentUserAuth.uid,
        email: currentUserAuth.email || '',
        displayName: currentUserAuth.displayName || '',
      } : undefined
    );
    const newSummary = await getDashboardSummary();
    setSummary(newSummary);
  };

  const expenseChartColor = '#ef4444';
  const statementChartColor = '#10b981';

  // Modern renk paleti
  const colors = {
    cyan: '#06b6d4',
    emerald: '#10b981',
    violet: '#8b5cf6',
    amber: '#f59e0b',
    red: '#ef4444',
  };

  const statCards = [
    {
      title: 'Şirket Kasası',
      subtitle: summary?.lastUpdatedAt ? `Son güncelleme: ${formatDate(summary.lastUpdatedAt)}` : 'Toplam banka + nakit',
      value: formatCurrency(summary?.companySafeBalance || 0, summary?.currency),
      color: colors.cyan,
      icon: <AccountBalanceIcon />,
      action: () => setSafeModalOpen(true),
    },
    {
      title: 'Tersanelerde Bekleyen',
      subtitle: `Toplam ${summary?.totalProjectsCount || 0} tersane`,
      value: formatCurrency(summary?.totalProjectsBalance || 0),
      color: colors.emerald,
      icon: <BusinessIcon />,
    },
    {
      title: 'Bu Ay Ödenen Giderler',
      subtitle: 'Sadece ödenen giderler',
      value: formatCurrency(summary?.totalPaidExpensesThisMonth || 0),
      color: colors.red,
      icon: <ReceiptIcon />,
    },
    {
      title: 'Ortak Hesap Özeti',
      subtitle: 'Net durum',
      value: formatCurrency((summary?.totalPartnersNegative || 0) - (summary?.totalPartnersPositive || 0)),
      color: colors.amber,
      icon: <PeopleIcon />,
      extra: (
        <Box sx={{ display: 'grid', gap: 0.5, mt: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingDownIcon fontSize="small" sx={{ color: colors.red }} />
            <Typography variant="body2" color="text.secondary">
              Şirketin borcu
            </Typography>
            <Typography variant="body2" fontWeight={700} sx={{ color: colors.red }}>
              {formatCurrency(summary?.totalPartnersPositive || 0)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon fontSize="small" sx={{ color: colors.emerald }} />
            <Typography variant="body2" color="text.secondary">
              Ortakların borcu
            </Typography>
            <Typography variant="body2" fontWeight={700} sx={{ color: colors.emerald }}>
              {formatCurrency(summary?.totalPartnersNegative || 0)}
            </Typography>
          </Box>
        </Box>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadData}>
          Yeniden Dene
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Grid Pattern Background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: isDark
            ? 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)'
            : 'linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Glow Effects */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: isDark
            ? `
              radial-gradient(800px 800px at 10% 15%, rgba(6, 182, 212, 0.15), transparent),
              radial-gradient(700px 700px at 85% 5%, rgba(139, 92, 246, 0.12), transparent),
              radial-gradient(600px 600px at 50% 85%, rgba(16, 185, 129, 0.10), transparent)
            `
            : `
              radial-gradient(800px 800px at 10% 15%, rgba(6, 182, 212, 0.08), transparent),
              radial-gradient(700px 700px at 85% 5%, rgba(139, 92, 246, 0.06), transparent),
              radial-gradient(600px 600px at 50% 85%, rgba(16, 185, 129, 0.05), transparent)
            `,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '1440px', mx: 'auto', p: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography
              variant="overline"
              sx={{
                letterSpacing: '0.18em',
                color: isDark ? '#94a3b8' : '#64748b',
                fontSize: '0.7rem',
              }}
            >
              Kontrol Merkezi
            </Typography>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                letterSpacing: '-0.02em',
                background: isDark
                  ? 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)'
                  : 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Ana Kumanda Paneli
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, maxWidth: 400 }}>
              Finans, network ve proje görünümünü tek ekranda takip edin.
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label={`Kasada ${formatCurrency(summary?.companySafeBalance || 0, summary?.currency)}`}
                size="small"
                sx={{
                  borderRadius: 3,
                  bgcolor: isDark ? alpha(colors.cyan, 0.15) : alpha(colors.cyan, 0.10),
                  color: isDark ? '#22d3ee' : colors.cyan,
                  border: `1px solid ${alpha(colors.cyan, 0.30)}`,
                  fontWeight: 600,
                  px: 0.5,
                }}
              />
              <Chip
                label={`${networkActions.length || 0} bekleyen aksiyon`}
                size="small"
                sx={{
                  borderRadius: 3,
                  bgcolor: isDark ? alpha(colors.violet, 0.15) : alpha(colors.violet, 0.10),
                  color: isDark ? '#a78bfa' : colors.violet,
                  border: `1px solid ${alpha(colors.violet, 0.30)}`,
                  fontWeight: 600,
                  px: 0.5,
                }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadData}
              disabled={loading}
              sx={{ borderRadius: 3, px: 2.5 }}
            >
              Yenile
            </Button>
            <Button
              variant="contained"
              onClick={() => setSafeModalOpen(true)}
              sx={{
                borderRadius: 3,
                px: 2.5,
                background: `linear-gradient(135deg, ${colors.cyan} 0%, ${colors.emerald} 100%)`,
                boxShadow: `0 8px 24px ${alpha(colors.cyan, 0.35)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, #0891b2 0%, #059669 100%)`,
                  boxShadow: `0 12px 32px ${alpha(colors.cyan, 0.45)}`,
                },
              }}
            >
              Kasayı Güncelle
            </Button>
          </Box>
        </Box>

        {loading && (
          <LinearProgress
            sx={{
              mb: 3,
              height: 4,
              borderRadius: 2,
              backgroundColor: isDark ? alpha(colors.cyan, 0.15) : alpha(colors.cyan, 0.10),
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${colors.cyan}, ${colors.emerald})`,
                borderRadius: 2,
              },
            }}
          />
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card) => (
            <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={0} sx={statCardStyle(card.color)}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          display: 'grid',
                          placeItems: 'center',
                          background: `linear-gradient(135deg, ${alpha(card.color, 0.20)} 0%, ${alpha(card.color, 0.08)} 100%)`,
                          color: card.color,
                          boxShadow: `0 8px 24px ${alpha(card.color, 0.25)}`,
                          border: `1px solid ${alpha(card.color, 0.20)}`,
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            fontSize: '0.7rem',
                            color: isDark ? '#94a3b8' : '#64748b',
                            fontWeight: 600,
                          }}
                        >
                          {card.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {card.subtitle}
                        </Typography>
                      </Box>
                    </Box>
                    {card.action && (
                      <Tooltip title="Düzenle">
                        <IconButton
                          size="small"
                          onClick={card.action}
                          sx={{
                            color: card.color,
                            bgcolor: alpha(card.color, 0.10),
                            border: `1px solid ${alpha(card.color, 0.20)}`,
                            '&:hover': {
                              bgcolor: alpha(card.color, 0.20),
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{
                      color: card.color,
                      mb: card.extra ? 0 : 0,
                      textShadow: isDark ? `0 2px 20px ${alpha(card.color, 0.30)}` : 'none',
                    }}
                  >
                    {card.value}
                  </Typography>
                  {card.extra}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ ...glassPanelSx, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      letterSpacing: '0.14em',
                      color: isDark ? '#94a3b8' : '#64748b',
                      fontSize: '0.65rem',
                    }}
                  >
                    Giderler
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    Son 6 Ay Ödenen Giderler
                  </Typography>
                </Box>
                <Chip
                  label="Trend"
                  size="small"
                  sx={{
                    borderRadius: 2,
                    bgcolor: alpha(colors.red, 0.12),
                    color: colors.red,
                    border: `1px solid ${alpha(colors.red, 0.25)}`,
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box sx={{ height: 300, minWidth: 0, position: 'relative' }}>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={280} minWidth={0}>
                    <BarChart data={expensesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                      <XAxis 
                        dataKey="monthLabel" 
                        tick={{ fontSize: 12 }}
                        stroke={theme.palette.text.secondary}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke={theme.palette.text.secondary}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                      />
                      <RechartsTooltip
                        formatter={(value: number) => [formatCurrency(value), 'Toplam']}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                        }}
                      />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                        {expensesTrend.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={alpha(expenseChartColor, 0.7 + index * 0.05)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ ...glassPanelSx, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      letterSpacing: '0.14em',
                      color: isDark ? '#94a3b8' : '#64748b',
                      fontSize: '0.65rem',
                    }}
                  >
                    Hakediş
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    Son 6 Ay Hakediş Net Sonuçları
                  </Typography>
                </Box>
                <Chip
                  label="Net"
                  size="small"
                  sx={{
                    borderRadius: 2,
                    bgcolor: alpha(colors.emerald, 0.12),
                    color: colors.emerald,
                    border: `1px solid ${alpha(colors.emerald, 0.25)}`,
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box sx={{ height: 300, minWidth: 0, position: 'relative' }}>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={280} minWidth={0}>
                    <BarChart data={statementsTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                      <XAxis 
                        dataKey="monthLabel" 
                        tick={{ fontSize: 12 }}
                        stroke={theme.palette.text.secondary}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke={theme.palette.text.secondary}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                      />
                      <RechartsTooltip
                        formatter={(value: number) => [
                          formatCurrency(value),
                          'Net Tutar'
                        ]}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                        }}
                      />
                      <Bar dataKey="totalNetCash" radius={[6, 6, 0, 0]}>
                        {statementsTrend.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.totalNetCash >= 0 
                              ? alpha(statementChartColor, 0.7 + index * 0.05)
                              : alpha(theme.palette.error.main, 0.7)
                            } 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ ...glassPanelSx, height: isMobile ? 'auto' : 420 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      letterSpacing: '0.14em',
                      color: isDark ? '#94a3b8' : '#64748b',
                      fontSize: '0.65rem',
                    }}
                  >
                    Network
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    Bugün / Yakında Aranacak Firmalar
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => navigate('/network')}
                  sx={{
                    borderRadius: 2,
                    color: isDark ? '#22d3ee' : colors.cyan,
                    '&:hover': {
                      bgcolor: alpha(colors.cyan, 0.10),
                    },
                  }}
                >
                  Tümünü Gör
                </Button>
              </Box>
              
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={260}>
                  <CircularProgress />
                </Box>
              ) : networkActions.length === 0 ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={260}>
                  <CalendarIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">
                    Yaklaşan aksiyon bulunmuyor
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'grid', gap: 2, maxHeight: 320, overflowY: 'auto', pr: 0.5 }}>
                  {networkActions.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        p: 2,
                        borderRadius: 4,
                        border: `1px solid ${item.isOverdue
                          ? alpha(colors.red, 0.30)
                          : isDark ? alpha('#ffffff', 0.08) : alpha('#0f172a', 0.06)}`,
                        backgroundColor: item.isOverdue
                          ? alpha(colors.red, 0.08)
                          : isDark ? alpha('#ffffff', 0.03) : alpha('#0f172a', 0.02),
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          borderColor: item.isOverdue
                            ? alpha(colors.red, 0.50)
                            : alpha(colors.cyan, 0.40),
                          transform: 'translateY(-2px)',
                          backgroundColor: item.isOverdue
                            ? alpha(colors.red, 0.12)
                            : isDark ? alpha('#ffffff', 0.06) : alpha(colors.cyan, 0.05),
                        },
                      }}
                      onClick={() => navigate('/network')}
                    >
                      <Box sx={{ display: 'grid', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {item.isOverdue && (
                            <Tooltip title="Gecikmiş">
                              <WarningIcon fontSize="small" sx={{ color: colors.red }} />
                            </Tooltip>
                          )}
                          <Typography variant="body1" fontWeight={700}>
                            {item.companyName}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                          <Typography variant="body2">{item.contactPerson}</Typography>
                          {item.phone && (
                            <Tooltip title={item.phone}>
                              <PhoneIcon fontSize="small" sx={{ color: isDark ? '#94a3b8' : '#64748b' }} />
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: item.isOverdue ? colors.red : (isDark ? '#f1f5f9' : '#0f172a'),
                            fontWeight: item.isOverdue ? 700 : 600,
                          }}
                        >
                          {formatDateShort(item.nextActionDate)}
                        </Typography>
                        <Chip
                          label={getQuoteStatusLabelTR(item.quoteStatus)}
                          size="small"
                          sx={{
                            mt: 0.5,
                            borderRadius: 2,
                            fontSize: '0.65rem',
                            height: 22,
                            bgcolor: item.quoteStatus === 'TEKLIF_VERILDI'
                              ? alpha(colors.emerald, 0.12)
                              : item.quoteStatus === 'GORUSME_DEVAM_EDIYOR'
                                ? alpha(colors.cyan, 0.12)
                                : isDark ? alpha('#ffffff', 0.08) : alpha('#0f172a', 0.06),
                            color: item.quoteStatus === 'TEKLIF_VERILDI'
                              ? colors.emerald
                              : item.quoteStatus === 'GORUSME_DEVAM_EDIYOR'
                                ? (isDark ? '#22d3ee' : colors.cyan)
                                : 'text.secondary',
                            border: `1px solid ${item.quoteStatus === 'TEKLIF_VERILDI'
                              ? alpha(colors.emerald, 0.25)
                              : item.quoteStatus === 'GORUSME_DEVAM_EDIYOR'
                                ? alpha(colors.cyan, 0.25)
                                : isDark ? alpha('#ffffff', 0.10) : alpha('#0f172a', 0.10)}`,
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ ...glassPanelSx, height: isMobile ? 'auto' : 420 }}>
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: '0.14em',
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontSize: '0.65rem',
                }}
              >
                Hareketler
              </Typography>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Son Hareketler
              </Typography>

              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={260}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ display: 'grid', gap: 2, maxHeight: 320, overflowY: 'auto', pr: 0.5 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Son 5 Gider
                    </Typography>
                    {latestExpenses.length === 0 ? (
                      <Typography variant="body2" color="text.disabled" sx={{ mb: 2, fontStyle: 'italic' }}>
                        Gider kaydı bulunmuyor
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'grid', gap: 1.5 }}>
                        {latestExpenses.map((expense) => (
                          <Box
                            key={expense.id}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              p: 1.5,
                              borderRadius: 3,
                              border: `1px solid ${isDark ? alpha('#ffffff', 0.08) : alpha(colors.red, 0.15)}`,
                              backgroundColor: alpha(colors.red, isDark ? 0.06 : 0.04),
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              cursor: 'pointer',
                              '&:hover': {
                                borderColor: alpha(colors.red, 0.40),
                                transform: 'translateY(-2px)',
                                backgroundColor: alpha(colors.red, isDark ? 0.10 : 0.08),
                              },
                            }}
                            onClick={() => navigate('/expenses')}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {expense.description}
                              </Typography>
                              <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDateShort(expense.date)}
                                </Typography>
                                <Chip
                                  label={getExpenseStatusLabel(expense.status)}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.6rem',
                                    borderRadius: 1.5,
                                    bgcolor: expense.status === 'PAID'
                                      ? alpha(colors.emerald, 0.12)
                                      : alpha(colors.amber, 0.12),
                                    color: expense.status === 'PAID' ? colors.emerald : colors.amber,
                                    border: `1px solid ${expense.status === 'PAID'
                                      ? alpha(colors.emerald, 0.25)
                                      : alpha(colors.amber, 0.25)}`,
                                  }}
                                />
                              </Box>
                            </Box>
                            <Typography variant="body2" fontWeight={700} sx={{ color: colors.red }}>
                              {formatCurrency(expense.amount)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Son 5 Kapatılan Hakediş
                    </Typography>
                    {latestStatements.length === 0 ? (
                      <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                        Kapatılmış hakediş bulunmuyor
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'grid', gap: 1.5 }}>
                        {latestStatements.map((statement) => (
                          <Box
                            key={statement.id}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              p: 1.5,
                              borderRadius: 3,
                              border: `1px solid ${isDark ? alpha('#ffffff', 0.08) : alpha(colors.emerald, 0.15)}`,
                              backgroundColor: alpha(colors.emerald, isDark ? 0.06 : 0.04),
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              cursor: 'pointer',
                              '&:hover': {
                                borderColor: alpha(colors.emerald, 0.40),
                                transform: 'translateY(-2px)',
                                backgroundColor: alpha(colors.emerald, isDark ? 0.10 : 0.08),
                              },
                            }}
                            onClick={() => navigate(`/projects/${statement.projectId}`)}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {statement.projectName} - {statement.title}
                              </Typography>
                              <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDateShort(statement.date)}
                                </Typography>
                                <Chip
                                  label={getTransferActionLabel(statement.transferAction)}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.6rem',
                                    borderRadius: 1.5,
                                    bgcolor: isDark ? alpha('#ffffff', 0.08) : alpha('#0f172a', 0.06),
                                    color: 'text.secondary',
                                    border: `1px solid ${isDark ? alpha('#ffffff', 0.12) : alpha('#0f172a', 0.10)}`,
                                  }}
                                />
                              </Box>
                            </Box>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{
                                color: statement.totals?.netCashReal >= 0 ? colors.emerald : colors.red,
                              }}
                            >
                              {formatCurrency(statement.totals?.netCashReal || 0)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        <SafeEditModal
          open={safeModalOpen}
          onClose={() => setSafeModalOpen(false)}
          currentBalance={summary?.companySafeBalance || 0}
          onSave={handleSaveCompanySafe}
        />
      </Box>
    </Box>
  );
};

export default DashboardPage;
