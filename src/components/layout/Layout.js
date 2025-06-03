import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Box,
  CssBaseline, 
  Divider, 
  IconButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography,
  Menu,
  MenuItem,
  Avatar,
  alpha,
  useTheme,
  Fade,
  Badge,
  Button,
  Container,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Menu as MenuIcon // Imported MenuIcon for mobile menu
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { responsiveStyles } from '../../styles/responsive';

// Constants for layout
const MOBILE_BREAKPOINT = 'md';

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [navMenuAnchorEl, setNavMenuAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(MOBILE_BREAKPOINT));

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavMenuOpen = (event) => {
    setNavMenuAnchorEl(event.currentTarget);
  };

  const handleNavMenuClose = () => {
    setNavMenuAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleNavMenuClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/'
    },
    {
      text: 'Products',
      icon: <InventoryIcon />,
      path: '/products'
    },
    {
      text: 'Sales',
      icon: <ShoppingCartIcon />,
      path: '/sales'
    },
    {
      text: 'Suppliers',
      icon: <PeopleIcon />,
      path: '/suppliers'
    },
    {
      text: 'Reports',
      icon: <BarChartIcon />,
      path: '/reports'
    }
  ];

  // Check if the current route is active
  const isActiveRoute = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: alpha('#000000', 0.9),
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9))',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          // Enhanced mobile responsiveness
          height: { xs: '56px', sm: '64px' },
          '& .MuiToolbar-root': {
            minHeight: { xs: '56px', sm: '64px' },
            padding: { xs: '0 8px', sm: '0 16px', md: '0 24px' }
          }
        }}
      >
        <Container maxWidth="100%" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
          <Toolbar sx={{ justifyContent: 'space-between', py: 0.5 }}>
            {/* Left side - Logo and Navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Logo */}
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ 
                  fontWeight: 'bold', 
                  color: theme.palette.primary.main,
                  letterSpacing: { xs: '0.5px', sm: '1px' },
                  fontSize: { xs: '1.125rem', sm: '1.25rem' },
                  mr: { xs: 1, sm: 2, md: 4 }
                }}
              >
                ICYIZERE
              </Typography>
              
              {/* Desktop Navigation */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', overflow: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                {menuItems.map((item) => (
                  <Button 
                    key={item.text}
                    onClick={() => handleNavigation(item.path)}
                    startIcon={item.icon}
                    sx={{
                      mx: { xs: 0.5, sm: 0.75, md: 1 },
                      color: isActiveRoute(item.path) ? theme.palette.primary.main : theme.palette.text.primary,
                      fontWeight: isActiveRoute(item.path) ? 'bold' : 'normal',
                      '&:hover': {
                        backgroundColor: alpha('#ffffff', 0.05),
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
              
              {/* Mobile menu trigger */}
              <IconButton
                onClick={handleNavMenuOpen}
                color="inherit"
                sx={{ 
                  display: { xs: 'block', md: 'none' },
                  ml: 1 
                }}
              >
                <MenuIcon /> {/* Changed from <AccountCircleIcon /> to <MenuIcon /> */}
              </IconButton>
            </Box>
            
            {/* Right side - User Section */}
            {currentUser && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Notifications button */}
                <IconButton 
                  color="inherit" 
                  sx={{ 
                    mx: { xs: 0.25, sm: 0.5, md: 1 },
                    bgcolor: alpha('#ffffff', 0.05),
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.1),
                    },
                    padding: { xs: '6px', sm: '8px' },
                    ...responsiveStyles.touchFriendly
                  }}
                  aria-label="show notifications"
                >
                  <Badge badgeContent={0} color="primary">
                    <NotificationsIcon fontSize={isMobile ? "small" : "medium"} />
                  </Badge>
                </IconButton>

                {/* Search button */}
                <IconButton 
                  color="inherit" 
                  sx={{ 
                    mx: { xs: 0.25, sm: 0.5, md: 1 },
                    bgcolor: alpha('#ffffff', 0.05),
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.1),
                    },
                    padding: { xs: '6px', sm: '8px' },
                    ...responsiveStyles.touchFriendly
                  }}
                  aria-label="search"
                >
                  <SearchIcon fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
                
                {/* User menu button */}
                <Button
                  onClick={handleMenuOpen}
                  color="inherit"
                  sx={{ 
                    textTransform: 'none',
                    ml: { xs: 0.25, sm: 0.5, md: 1 },
                    minWidth: { xs: 'auto', sm: '80px' },
                    bgcolor: alpha('#ffffff', 0.05),
                    borderRadius: '4px',
                    px: { xs: 0.5, sm: 1, md: 1.5 },
                    py: { xs: 0.5, sm: 0.75 },
                    height: { xs: '36px', sm: 'auto' },
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.1),
                    },
                    ...responsiveStyles.touchFriendly
                  }}
                  startIcon={
                    <Avatar 
                      sx={{ 
                        width: { xs: 24, sm: 28 }, 
                        height: { xs: 24, sm: 28 },
                        bgcolor: theme.palette.primary.main,
                        fontSize: { xs: '12px', sm: '14px' },
                        fontWeight: 'bold'
                      }}
                    >
                      {currentUser.name.charAt(0)}
                    </Avatar>
                  }
                >
                  <Typography 
                    variant="body2" 
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      fontSize: '14px',
                      fontWeight: 'medium'
                    }}
                  >
                    {currentUser.name.split(' ')[0]}
                  </Typography>
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Mobile Navigation Menu */}
      <Menu
        anchorEl={navMenuAnchorEl}
        open={Boolean(navMenuAnchorEl)}
        onClose={handleNavMenuClose}
        TransitionComponent={Fade}
        sx={{
          mt: 1.5,
          '& .MuiPaper-root': {
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(8px)',
            borderRadius: { xs: 1, sm: 2 },
            boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
            minWidth: { xs: '250px', sm: '280px' },
            maxWidth: { xs: 'calc(100vw - 32px)', sm: 'none' },
            maxHeight: { xs: 'calc(100vh - 100px)', sm: 'auto' },
          },
        }}
      >
        {menuItems.map((item) => (
          <MenuItem 
            key={item.text} 
            onClick={() => handleNavigation(item.path)}
            sx={{
              borderLeft: isActiveRoute(item.path) ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
              '&:hover': {
                backgroundColor: alpha('#ffffff', 0.05),
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: isActiveRoute(item.path) ? theme.palette.primary.main : theme.palette.text.secondary
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </MenuItem>
        ))}
      </Menu>
      
      {/* User Profile Menu */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: { xs: 160, sm: 180 },
            borderRadius: { xs: '8px', sm: '4px' },
            mt: 0.5,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            backgroundColor: alpha('#1a1a1a', 0.9),
            border: `1px solid ${alpha('#ffffff', 0.1)}`,
            '& .MuiMenuItem-root': {
              px: { xs: 1.5, sm: 2 },
              py: { xs: 1.25, sm: 1.5 },
              borderRadius: '4px',
              mx: 1,
              my: 0.5,
              minHeight: '44px', // Touch-friendly target size
              '&:hover': {
                backgroundColor: alpha('#ffffff', 0.1),
              },
            },
            '& .MuiListItemIcon-root': {
              minWidth: { xs: 32, sm: 36 },
              color: theme.palette.text.secondary
            }
          }
        }}
      >
        <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Profile</Typography>
        </MenuItem>
        <Divider sx={{ my: 1, mx: 1, backgroundColor: alpha('#ffffff', 0.1) }} />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 1, sm: 1.5, md: 2, lg: 3 }, 
          width: '100%',
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          ...responsiveStyles.safeAreaBottom,
        }}
      >
        <Box sx={{ height: { xs: '56px', sm: '64px' } }} />
        <Box sx={{ 
          maxWidth: '1800px', 
          mx: 'auto',
          borderRadius: { xs: 1, sm: 2 },
          overflow: 'hidden',
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
