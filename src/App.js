import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { 
  ThemeProvider, 
  CssBaseline, 
  useMediaQuery, 
  useTheme,
  Box,
  CircularProgress,
  createTheme,
  responsiveFontSizes
} from '@mui/material';
import { AnimatePresence } from 'framer-motion';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Theme
import { netflixColors } from './theme/theme';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/auth/Login';
import Profile from './pages/auth/Profile';
import Dashboard from './pages/dashboard/Dashboard';
import Products from './pages/products/Products';
import Suppliers from './pages/suppliers/Suppliers';
import StockIn from './pages/stockIn/StockIn';
import Sales from './pages/sales/Sales';
import Reports from './pages/reports/Reports';

// CSS
import './App.css';

// Theme configuration
const themeOptions = {
  palette: {
    primary: {
      main: netflixColors.red,
      light: '#ff3d3d',
      dark: '#b20710',
      contrastText: '#fff',
    },
    secondary: {
      main: netflixColors.blue,
      light: '#5d9cec',
      dark: '#1a4f8b',
      contrastText: '#fff',
    },
    error: {
      main: '#E50914',
    },
    warning: {
      main: '#F5C518',
    },
    success: {
      main: '#46D369',
    },
    background: {
      default: netflixColors.black,
      paper: netflixColors.darkGray,
    },
    text: {
      primary: netflixColors.white,
      secondary: netflixColors.lightGray,
      disabled: netflixColors.gray,
    },
  },
  typography: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.25rem',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem',
      '@media (max-width:600px)': {
        fontSize: '1.125rem',
      },
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      '@media (max-width:600px)': {
        fontSize: '1rem',
      },
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      '@media (max-width:600px)': {
        fontSize: '0.875rem',
      },
    },
    body1: {
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '0.875rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      '@media (max-width:600px)': {
        fontSize: '0.75rem',
      },
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '8px 16px',
          '@media (max-width:600px)': {
            padding: '6px 12px',
            fontSize: '0.875rem',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#F40612', // Brighter red on hover
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0A0A0A', // Nearly black like Netflix header
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0A0A0A', // Nearly black like Netflix sidebar
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '8px 6px',
            fontSize: '0.75rem',
          },
        },
        head: {
          fontWeight: 700,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          overflowX: 'auto',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '@media (max-width:600px)': {
            borderRadius: 6,
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: 12,
          },
          '&:last-child': {
            paddingBottom: 16,
            '@media (max-width:600px)': {
              paddingBottom: 12,
            },
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '0 12px',
          },
        },
      },
    },
  },
};

// Loading component
const LoadingScreen = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: netflixColors.black,
    }}
  >
    <CircularProgress color="error" />
  </Box>
);

// Protected Route component with animation
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: netflixColors.black,
        backgroundImage: 'linear-gradient(to bottom, #141414 0%, #181818 100%)',
        paddingTop: isMobile ? '60px' : '68px', // Account for fixed header
      }}
    >
      <AnimatePresence mode="wait">
        <Box
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          sx={{ flex: 1 }}
        >
          {children}
        </Box>
      </AnimatePresence>
    </Box>
  );
};

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname.split('/')[1]}>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="products" element={<Products />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="stock-in" element={<StockIn />} />
          <Route path="sales" element={<Sales />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

// Create theme with responsive font sizes
const appTheme = responsiveFontSizes(createTheme(themeOptions));

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AnimatedRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
