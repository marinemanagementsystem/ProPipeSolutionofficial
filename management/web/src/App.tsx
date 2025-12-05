import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { CssBaseline, AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Avatar, Tooltip, alpha, Chip, useMediaQuery, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import LoginPage from './pages/LoginPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import StatementEditorPage from './pages/StatementEditorPage';
import NetworkPage from './pages/NetworkPage';
import PartnersPage from './pages/PartnersPage';
import PartnerDetailPage from './pages/PartnerDetailPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider, useThemeContext } from './context/ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BusinessIcon from '@mui/icons-material/Business';
import HandshakeIcon from '@mui/icons-material/Handshake';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

// Layout Component with Modern Navigation
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { currentUserProfile, logout } = useAuth();
  const location = useLocation();
  const { mode, toggleTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = mode === 'dark';

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/expenses', label: 'Giderler', icon: <ReceiptLongIcon /> },
    { path: '/projects', label: 'Tersaneler', icon: <BusinessIcon /> },
    { path: '/network', label: 'Network', icon: <HandshakeIcon /> },
    { path: '/partners', label: 'Ortaklar', icon: <PeopleIcon /> },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const NavButton = ({ item }: { item: typeof navItems[0] }) => (
    <Button
      component={Link}
      to={item.path}
      startIcon={item.icon}
      sx={{
        color: isActive(item.path)
          ? (isDark ? '#22d3ee' : theme.palette.primary.main)
          : 'text.secondary',
        fontWeight: isActive(item.path) ? 700 : 500,
        px: 2.5,
        py: 1,
        borderRadius: 3,
        position: 'relative',
        backgroundColor: isActive(item.path)
          ? alpha(isDark ? '#22d3ee' : theme.palette.primary.main, 0.10)
          : 'transparent',
        border: isActive(item.path)
          ? `1px solid ${alpha(isDark ? '#22d3ee' : theme.palette.primary.main, 0.20)}`
          : '1px solid transparent',
        '&:hover': {
          backgroundColor: alpha(isDark ? '#22d3ee' : theme.palette.primary.main, 0.15),
          borderColor: alpha(isDark ? '#22d3ee' : theme.palette.primary.main, 0.30),
        },
        '&::after': isActive(item.path) ? {
          content: '""',
          position: 'absolute',
          bottom: -9,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 28,
          height: 3,
          borderRadius: '3px 3px 0 0',
          background: isDark
            ? 'linear-gradient(90deg, #22d3ee, #10b981)'
            : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
        } : {},
      }}
    >
      {item.label}
    </Button>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      transition: 'background-color 0.3s ease'
    }}>
      {/* Modern AppBar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: isDark ? alpha('#0c1226', 0.85) : alpha('#ffffff', 0.90),
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${isDark ? alpha('#ffffff', 0.08) : alpha('#0f172a', 0.08)}`,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
            {/* Logo */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mr: 4,
                textDecoration: 'none',
              }}
            >
              <Box
                component="img"
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="PRO PIPE|STEEL Logo"
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  objectFit: 'contain',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 300,
                      background: 'linear-gradient(135deg, #22d3ee 0%, #10b981 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '0.08em',
                    }}
                  >
                    PRO{' '}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #22d3ee 0%, #10b981 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    PIPE
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 300,
                      color: alpha(theme.palette.text.primary, 0.3),
                      mx: 0.3,
                    }}
                  >
                    |
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    STEEL
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontSize: '0.6rem',
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    display: 'block',
                  }}
                >
                  SOLUTION
                </Typography>
              </Box>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                {navItems.map((item) => (
                  <NavButton key={item.path} item={item} />
                ))}
              </Box>
            )}

            {/* Spacer for mobile */}
            {isMobile && <Box sx={{ flexGrow: 1 }} />}

            {/* Right side actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Theme Toggle */}
              <Tooltip title={mode === 'dark' ? 'Açık Tema' : 'Koyu Tema'}>
                <IconButton
                  onClick={toggleTheme}
                  sx={{
                    bgcolor: isDark ? alpha('#ffffff', 0.08) : alpha('#0f172a', 0.05),
                    border: `1px solid ${isDark ? alpha('#ffffff', 0.10) : alpha('#0f172a', 0.08)}`,
                    '&:hover': {
                      bgcolor: isDark ? alpha('#ffffff', 0.12) : alpha('#0f172a', 0.08),
                    },
                  }}
                >
                  {mode === 'dark' ? <Brightness7Icon fontSize="small" sx={{ color: '#fbbf24' }} /> : <Brightness4Icon fontSize="small" />}
                </IconButton>
              </Tooltip>

              {/* User Info - Desktop */}
              {!isMobile && currentUserProfile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                    }}
                  >
                    {currentUserProfile.displayName?.charAt(0) || 'U'}
                  </Avatar>
                  <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                    <Typography variant="body2" fontWeight={600} lineHeight={1.2} sx={{ color: isDark ? '#f1f5f9' : '#1e293b' }}>
                      {currentUserProfile.displayName}
                    </Typography>
                    <Chip
                      label={currentUserProfile.role}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        bgcolor: isDark ? alpha('#22d3ee', 0.15) : alpha('#06b6d4', 0.12),
                        color: isDark ? '#22d3ee' : '#0891b2',
                        border: `1px solid ${isDark ? alpha('#22d3ee', 0.25) : alpha('#06b6d4', 0.25)}`,
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* Logout - Desktop */}
              {!isMobile && (
                <Tooltip title="Çıkış Yap">
                  <IconButton
                    onClick={logout}
                    sx={{
                      color: 'text.secondary',
                      bgcolor: isDark ? alpha('#ffffff', 0.05) : alpha('#0f172a', 0.03),
                      border: `1px solid ${isDark ? alpha('#ffffff', 0.08) : alpha('#0f172a', 0.06)}`,
                      '&:hover': {
                        color: '#ef4444',
                        bgcolor: alpha('#ef4444', 0.12),
                        borderColor: alpha('#ef4444', 0.25),
                      },
                    }}
                  >
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {/* Mobile Menu Button */}
              {isMobile && (
                <IconButton
                  onClick={() => setMobileMenuOpen(true)}
                  sx={{
                    bgcolor: isDark ? alpha('#ffffff', 0.08) : alpha('#0f172a', 0.05),
                    border: `1px solid ${isDark ? alpha('#ffffff', 0.10) : alpha('#0f172a', 0.08)}`,
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            bgcolor: isDark ? '#0c1226' : '#ffffff',
            backgroundImage: isDark
              ? 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(12, 18, 38, 0.90) 100%)'
              : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
            borderLeft: `1px solid ${isDark ? alpha('#ffffff', 0.08) : alpha('#0f172a', 0.08)}`,
            p: 2.5,
          },
        }}
      >
        {/* User Info in Drawer */}
        {currentUserProfile && (
          <Box
            sx={{
              mb: 3,
              p: 2.5,
              bgcolor: isDark ? alpha('#ffffff', 0.05) : alpha('#06b6d4', 0.05),
              borderRadius: 4,
              border: `1px solid ${isDark ? alpha('#ffffff', 0.08) : alpha('#06b6d4', 0.15)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                }}
              >
                {currentUserProfile.displayName?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography fontWeight={600} sx={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                  {currentUserProfile.displayName}
                </Typography>
                <Chip
                  label={currentUserProfile.role}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: isDark ? alpha('#22d3ee', 0.15) : alpha('#06b6d4', 0.12),
                    color: isDark ? '#22d3ee' : '#0891b2',
                    border: `1px solid ${isDark ? alpha('#22d3ee', 0.25) : alpha('#06b6d4', 0.25)}`,
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Navigation Items */}
        <List>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 3,
                  border: isActive(item.path)
                    ? `1px solid ${isDark ? alpha('#22d3ee', 0.25) : alpha('#06b6d4', 0.25)}`
                    : '1px solid transparent',
                  '&.Mui-selected': {
                    bgcolor: isDark ? alpha('#22d3ee', 0.10) : alpha('#06b6d4', 0.08),
                    '&:hover': {
                      bgcolor: isDark ? alpha('#22d3ee', 0.15) : alpha('#06b6d4', 0.12),
                    },
                  },
                  '&:hover': {
                    bgcolor: isDark ? alpha('#ffffff', 0.05) : alpha('#0f172a', 0.03),
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path)
                      ? (isDark ? '#22d3ee' : '#0891b2')
                      : 'text.secondary',
                    minWidth: 44,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 600 : 400,
                    color: isActive(item.path)
                      ? (isDark ? '#22d3ee' : '#0891b2')
                      : 'text.primary',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Logout Button */}
        <Box sx={{ mt: 'auto', pt: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
            }}
            sx={{
              borderRadius: 3,
              borderColor: alpha('#ef4444', 0.4),
              color: '#ef4444',
              py: 1.2,
              '&:hover': {
                bgcolor: alpha('#ef4444', 0.10),
                borderColor: '#ef4444',
              },
            }}
          >
            Çıkış Yap
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <Router basename="/yonetim">
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes Wrapped in Layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ExpensesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId/statements/:statementId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StatementEditorPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/network"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NetworkPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/partners"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PartnersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/partners/:partnerId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PartnerDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
