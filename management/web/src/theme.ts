import { createTheme, alpha } from '@mui/material/styles';

// Modern gradient ve renk paleti - Cyan/Emerald teması
const brandColors = {
      primary: {
            light: '#22d3ee', // Cyan 400
            main: '#06b6d4', // Cyan 500
            dark: '#0891b2', // Cyan 600
      },
      secondary: {
            light: '#a78bfa', // Violet 400
            main: '#8b5cf6', // Violet 500
            dark: '#7c3aed', // Violet 600
      },
      success: {
            light: '#34d399', // Emerald 400
            main: '#10b981', // Emerald 500
            dark: '#059669', // Emerald 600
      },
      error: {
            light: '#f87171', // Red 400
            main: '#ef4444', // Red 500
            dark: '#dc2626', // Red 600
      },
      warning: {
            light: '#fbbf24', // Amber 400
            main: '#f59e0b', // Amber 500
            dark: '#d97706', // Amber 600
      },
      info: {
            light: '#60a5fa', // Blue 400
            main: '#3b82f6', // Blue 500
            dark: '#2563eb', // Blue 600
      }
};

export const getTheme = (mode: 'light' | 'dark') => {
      const isDark = mode === 'dark';
      const backgroundGradient = isDark
            ? `
                  radial-gradient(1000px 1000px at 10% 10%, rgba(56, 189, 248, 0.12), transparent),
                  radial-gradient(900px 900px at 80% 10%, rgba(139, 92, 246, 0.10), transparent),
                  radial-gradient(700px 700px at 40% 90%, rgba(16, 185, 129, 0.08), transparent),
                  #060a18
            `
            : `
                  radial-gradient(1000px 1000px at 10% 10%, rgba(6, 182, 212, 0.08), transparent),
                  radial-gradient(900px 900px at 80% 10%, rgba(139, 92, 246, 0.06), transparent),
                  radial-gradient(700px 700px at 40% 90%, rgba(16, 185, 129, 0.05), transparent),
                  #f8fafc
            `;
      const panelBackground = isDark
            ? `linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(12, 18, 38, 0.80) 100%)`
            : `linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.92) 100%)`;
      const borderColor = isDark ? alpha('#ffffff', 0.10) : alpha('#0f172a', 0.08);
      
      return createTheme({
            palette: {
                  mode,
                  primary: {
                        light: brandColors.primary.light,
                        main: isDark ? brandColors.primary.light : brandColors.primary.main,
                        dark: brandColors.primary.dark,
                        contrastText: '#ffffff',
                  },
                  secondary: {
                        light: brandColors.secondary.light,
                        main: brandColors.secondary.main,
                        dark: brandColors.secondary.dark,
                        contrastText: '#ffffff',
                  },
                  success: {
                        light: alpha(brandColors.success.light, 0.1),
                        main: brandColors.success.main,
                        dark: brandColors.success.dark,
                        contrastText: '#ffffff',
                  },
                  error: {
                        light: alpha(brandColors.error.light, 0.1),
                        main: brandColors.error.main,
                        dark: brandColors.error.dark,
                        contrastText: '#ffffff',
                  },
                  warning: {
                        light: alpha(brandColors.warning.light, 0.1),
                        main: brandColors.warning.main,
                        dark: brandColors.warning.dark,
                        contrastText: '#ffffff',
                  },
                  info: {
                        light: alpha(brandColors.info.light, 0.1),
                        main: brandColors.info.main,
                        dark: brandColors.info.dark,
                        contrastText: '#ffffff',
                  },
                  background: {
                        default: isDark ? '#060a18' : '#f8fafc',
                        paper: isDark ? alpha('#0f172a', 0.80) : '#ffffff',
                  },
                  text: {
                        primary: isDark ? '#f1f5f9' : '#0f172a', // Slate 100 : Slate 900 (daha koyu metin)
                        secondary: isDark ? '#94a3b8' : '#475569', // Slate 400 : Slate 600 (daha koyu secondary)
                  },
                  divider: isDark ? alpha('#94a3b8', 0.12) : alpha('#334155', 0.15),
            },
            typography: {
                  fontFamily: '"Sora", "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  h1: {
                        fontWeight: 800,
                        letterSpacing: '-0.025em',
                  },
                  h2: {
                        fontWeight: 700,
                        letterSpacing: '-0.025em',
                  },
                  h3: {
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                  },
                  h4: {
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                  },
                  h5: {
                        fontWeight: 600,
                        letterSpacing: '-0.01em',
                  },
                  h6: {
                        fontWeight: 600,
                        letterSpacing: '-0.01em',
                  },
                  subtitle1: {
                        fontWeight: 500,
                  },
                  subtitle2: {
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase' as const,
                        fontSize: '0.75rem',
                  },
                  body1: {
                        lineHeight: 1.7,
                  },
                  body2: {
                        lineHeight: 1.6,
                  },
                  button: {
                        textTransform: 'none' as const,
                        fontWeight: 600,
                        letterSpacing: '0.01em',
                  },
            },
            shape: {
                  borderRadius: 16,
            },
            components: {
                  MuiCssBaseline: {
                        styleOverrides: {
                              body: {
                                    backgroundColor: isDark ? '#060a18' : '#f8fafc',
                                    backgroundImage: backgroundGradient,
                                    backgroundAttachment: 'fixed',
                                    color: isDark ? '#e2e8f0' : '#0f172a',
                                    scrollbarWidth: 'thin',
                                    '&::-webkit-scrollbar': {
                                          width: '8px',
                                          height: '8px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                          background: isDark ? '#0f172a' : '#f1f5f9',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                          background: isDark ? '#334155' : '#cbd5e1',
                                          borderRadius: '4px',
                                    },
                                    '&::-webkit-scrollbar-thumb:hover': {
                                          background: isDark ? '#475569' : '#94a3b8',
                                    },
                              },
                        },
                  },
                  MuiButton: {
                        styleOverrides: {
                              root: {
                                    borderRadius: 12,
                                    padding: '10px 24px',
                                    fontSize: '0.9rem',
                                    boxShadow: 'none',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                          boxShadow: isDark
                                                ? `0 4px 24px ${alpha(brandColors.primary.main, 0.35)}`
                                                : `0 4px 20px ${alpha(brandColors.primary.main, 0.25)}`,
                                          transform: 'translateY(-1px)',
                                    },
                                    '&:active': {
                                          transform: 'translateY(0)',
                                    },
                              },
                              containedPrimary: {
                                    background: `linear-gradient(135deg, ${brandColors.primary.light} 0%, ${brandColors.success.main} 100%)`,
                                    boxShadow: `0 4px 16px ${alpha(brandColors.primary.main, 0.3)}`,
                                    '&:hover': {
                                          background: `linear-gradient(135deg, ${brandColors.primary.main} 0%, ${brandColors.success.dark} 100%)`,
                                          boxShadow: `0 6px 24px ${alpha(brandColors.primary.main, 0.4)}`,
                                    },
                              },
                              containedSecondary: {
                                    background: `linear-gradient(135deg, ${brandColors.secondary.light} 0%, ${brandColors.secondary.main} 100%)`,
                                    boxShadow: `0 4px 16px ${alpha(brandColors.secondary.main, 0.3)}`,
                                    '&:hover': {
                                          background: `linear-gradient(135deg, ${brandColors.secondary.main} 0%, ${brandColors.secondary.dark} 100%)`,
                                    },
                              },
                              outlined: {
                                    borderWidth: '1.5px',
                                    borderColor: isDark ? alpha('#ffffff', 0.15) : alpha(brandColors.primary.main, 0.3),
                                    '&:hover': {
                                          borderWidth: '1.5px',
                                          backgroundColor: isDark
                                                ? alpha('#ffffff', 0.08)
                                                : alpha(brandColors.primary.main, 0.08),
                                          borderColor: isDark ? alpha('#ffffff', 0.25) : brandColors.primary.main,
                                    },
                              },
                        },
                  },
                  MuiCard: {
                        styleOverrides: {
                              root: {
                                    borderRadius: 22,
                                    boxShadow: isDark 
                                          ? '0 20px 60px rgba(0, 0, 0, 0.45)' 
                                          : '0 20px 50px rgba(15, 23, 42, 0.08)',
                                    border: `1px solid ${borderColor}`,
                                    backgroundImage: panelBackground,
                                    backdropFilter: 'blur(12px)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                          boxShadow: isDark 
                                                ? '0 28px 72px rgba(0, 0, 0, 0.55)' 
                                                : '0 28px 72px rgba(15, 23, 42, 0.12)',
                                          transform: 'translateY(-3px)',
                                    },
                              },
                        },
                  },
                  MuiPaper: {
                        styleOverrides: {
                              root: {
                                    backgroundImage: panelBackground,
                                    border: `1px solid ${borderColor}`,
                                    backdropFilter: 'blur(12px)',
                              },
                              elevation1: {
                                    boxShadow: isDark 
                                          ? '0 12px 40px rgba(0, 0, 0, 0.35)' 
                                          : '0 12px 40px rgba(15, 23, 42, 0.06)',
                              },
                              elevation2: {
                                    boxShadow: isDark 
                                          ? '0 16px 48px rgba(0, 0, 0, 0.45)' 
                                          : '0 16px 48px rgba(15, 23, 42, 0.08)',
                              },
                              elevation3: {
                                    boxShadow: isDark 
                                          ? '0 24px 64px rgba(0, 0, 0, 0.5)' 
                                          : '0 24px 64px rgba(15, 23, 42, 0.12)',
                              },
                        },
                  },
                  MuiTextField: {
                        styleOverrides: {
                              root: {
                                    '& .MuiOutlinedInput-root': {
                                          borderRadius: 12,
                                          backgroundColor: isDark ? alpha('#0f172a', 0.5) : alpha('#f8fafc', 0.8),
                                          transition: 'all 0.2s ease',
                                          '& fieldset': {
                                                borderColor: isDark ? alpha('#94a3b8', 0.2) : alpha('#64748b', 0.2),
                                                borderWidth: '1.5px',
                                          },
                                          '&:hover fieldset': {
                                                borderColor: isDark ? alpha('#94a3b8', 0.4) : alpha('#64748b', 0.4),
                                          },
                                          '&.Mui-focused fieldset': {
                                                borderColor: brandColors.primary.main,
                                                borderWidth: '2px',
                                          },
                                          '&.Mui-focused': {
                                                backgroundColor: isDark ? alpha('#0f172a', 0.7) : '#ffffff',
                                                boxShadow: `0 0 0 4px ${alpha(brandColors.primary.main, 0.1)}`,
                                          },
                                    },
                                    '& .MuiInputLabel-root': {
                                          fontWeight: 500,
                                    },
                              },
                        },
                  },
                  MuiChip: {
                        styleOverrides: {
                              root: {
                                    fontWeight: 600,
                                    borderRadius: 8,
                                    transition: 'all 0.2s ease',
                              },
                              filled: {
                                    '&:hover': {
                                          transform: 'scale(1.02)',
                                    },
                              },
                              outlined: {
                                    borderColor: isDark ? alpha('#94a3b8', 0.3) : alpha('#334155', 0.25),
                              },
                        },
                  },
                  MuiAppBar: {
                        styleOverrides: {
                              root: {
                                    backgroundColor: isDark 
                                          ? alpha('#0f172a', 0.8) 
                                          : alpha('#ffffff', 0.9),
                                    backdropFilter: 'blur(12px)',
                                    borderBottom: `1px solid ${isDark ? alpha('#94a3b8', 0.1) : alpha('#334155', 0.12)}`,
                                    boxShadow: isDark ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                              },
                        },
                  },
                  MuiDialog: {
                        styleOverrides: {
                              paper: {
                                    borderRadius: 24,
                                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                    boxShadow: isDark 
                                          ? '0 24px 48px rgba(0, 0, 0, 0.5)' 
                                          : '0 24px 48px rgba(0, 0, 0, 0.15)',
                              },
                        },
                  },
                  MuiMenu: {
                        styleOverrides: {
                              paper: {
                                    borderRadius: 16,
                                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                    boxShadow: isDark 
                                          ? '0 12px 32px rgba(0, 0, 0, 0.4)' 
                                          : '0 12px 32px rgba(0, 0, 0, 0.12)',
                                    border: `1px solid ${isDark ? alpha('#94a3b8', 0.1) : alpha('#334155', 0.1)}`,
                              },
                        },
                  },
                  MuiTableCell: {
                        styleOverrides: {
                              root: {
                                    borderBottom: `1px solid ${isDark ? alpha('#94a3b8', 0.1) : alpha('#334155', 0.15)}`,
                              },
                              head: {
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    fontSize: '0.75rem',
                                    letterSpacing: '0.05em',
                                    color: isDark ? '#94a3b8' : '#334155',
                                    backgroundColor: isDark ? alpha('#0f172a', 0.5) : alpha('#e2e8f0', 0.6),
                              },
                        },
                  },
                  MuiTableRow: {
                        styleOverrides: {
                              root: {
                                    transition: 'background-color 0.2s ease',
                                    '&:hover': {
                                          backgroundColor: isDark 
                                                ? alpha('#94a3b8', 0.05) 
                                                : alpha('#64748b', 0.04),
                                    },
                              },
                        },
                  },
                  MuiAlert: {
                        styleOverrides: {
                              root: {
                                    borderRadius: 12,
                              },
                        },
                  },
                  MuiAvatar: {
                        styleOverrides: {
                              root: {
                                    background: `linear-gradient(135deg, ${brandColors.success.main} 0%, ${brandColors.primary.main} 100%)`,
                              },
                        },
                  },
                  MuiTabs: {
                        styleOverrides: {
                              indicator: {
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                              },
                        },
                  },
                  MuiTab: {
                        styleOverrides: {
                              root: {
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    minHeight: 48,
                              },
                        },
                  },
                  MuiIconButton: {
                        styleOverrides: {
                              root: {
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                          backgroundColor: isDark 
                                                ? alpha('#94a3b8', 0.1) 
                                                : alpha('#64748b', 0.08),
                                          transform: 'scale(1.05)',
                                    },
                              },
                        },
                  },
                  MuiToggleButton: {
                        styleOverrides: {
                              root: {
                                    borderRadius: 10,
                                    textTransform: 'none',
                                    fontWeight: 600,
                              },
                        },
                  },
                  MuiLinearProgress: {
                        styleOverrides: {
                              root: {
                                    borderRadius: 4,
                                    height: 6,
                              },
                        },
                  },
            },
      });
};

export default getTheme;
