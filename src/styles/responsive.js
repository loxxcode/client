import { useMediaQuery, useTheme } from '@mui/material';

// Custom hook for responsive design with enhanced smartphone support
export const useResponsive = () => {
  const theme = useTheme();
  
  // Pre-defined breakpoints with enhanced precision for smartphones
  const isExtraSmallMobile = useMediaQuery('(max-width:320px)'); // For smallest phones like Galaxy Fold
  const isSmallMobile = useMediaQuery('(min-width:321px) and (max-width:375px)'); // For iPhone SE, small Android
  const isMediumMobile = useMediaQuery('(min-width:376px) and (max-width:480px)'); // Most standard smartphones
  const isLargeMobile = useMediaQuery('(min-width:481px) and (max-width:600px)'); // Large smartphones
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // All mobile devices (< 600px)
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // Tablets (600px - 960px)
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // Desktops (> 960px)
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg')); // Large desktops (> 1280px)
  
  // Orientation with improved behavior for folding phones
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isNarrow = useMediaQuery('(max-aspect-ratio: 3/4)'); // Very tall, narrow screen like folded devices
  const isWide = useMediaQuery('(min-aspect-ratio: 16/9)'); // Wide screens for landscape mobile view
  
  // Device-specific checks for edge cases
  const isIphone5 = useMediaQuery('(min-device-width: 320px) and (max-device-width: 568px)');
  const isGalaxyFold = useMediaQuery('(min-device-width: 280px) and (max-device-width: 320px)');
  const isNotchDevice = useMediaQuery('(padding: env(safe-area-inset-top))'); // Devices with notches/dynamic islands
  
  return {
    isExtraSmallMobile, // Tiny phones like Galaxy Fold (< 320px)
    isSmallMobile,      // Small phones (321px - 375px)
    isMediumMobile,     // Standard smartphones (376px - 480px)
    isLargeMobile,      // Large smartphones (481px - 600px)
    isMobile,           // All mobile devices (< 600px)
    isTablet,           // Tablets (600px - 960px)
    isDesktop,          // Desktops (> 960px)
    isLargeDesktop,     // Large desktops (> 1280px)
    isLandscape,        // Landscape orientation
    isPortrait,         // Portrait orientation
    isNarrow,           // Very tall aspect ratio
    isWide,             // Very wide aspect ratio
    isIphone5,          // iPhone 5/SE specific
    isGalaxyFold,       // Samsung Galaxy Fold specific
    isNotchDevice,      // Device with a notch/dynamic island
    
    // For breakpoint checking in components
    breakpoints: {
      xs: theme.breakpoints.values.xs,
      sm: theme.breakpoints.values.sm,
      md: theme.breakpoints.values.md,
      lg: theme.breakpoints.values.lg,
      xl: theme.breakpoints.values.xl
    }
  };
};

// All component styles and responsive configurations
export const responsiveStyles = {
  // Card base styles
  card: {
    base: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
      },
    },
    // Size variants
    xs: {
      padding: '0.75rem',
      borderRadius: '8px',
    },
    sm: {
      padding: '1.25rem',
      borderRadius: '10px',
    },
    md: {
      padding: '1.5rem',
      borderRadius: '12px',
    },
    lg: {
      padding: '2rem',
      borderRadius: '14px',
    },
  },
  
  // Container padding
  container: {
    px: { xs: 1, sm: 2, md: 3, lg: 4 },
    py: { xs: 1.5, sm: 2, md: 3, lg: 4 },
  },
  
  // Text truncation
  truncateText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  
  // Mobile-first flex layouts
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: '8px', sm: '12px', md: '16px' },
  },
  
  flexRow: {
    display: 'flex',
    gap: { xs: '6px', sm: '8px', md: '12px' },
    flexWrap: { xs: 'wrap', sm: 'nowrap' },
    alignItems: 'center',
  },
  
  // Touch-friendly UI elements
  touchFriendly: {
    minHeight: '44px',      // Apple's recommended minimum touch target size
    minWidth: '44px',       // Apple's recommended minimum touch target size
    cursor: 'pointer',
    userSelect: 'none',     // Prevent text selection on touch
    WebkitTapHighlightColor: 'transparent', // Remove tap highlight on mobile
  },
  
  // Safe area adjustments for notched devices
  safeAreaTop: {
    paddingTop: 'env(safe-area-inset-top, 0px)',
  },
  
  safeAreaBottom: {
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  },
  
  // Netflix-inspired mobile card styling
  netflixMobileCard: {
    background: 'linear-gradient(to bottom, rgba(30,30,30,0.8) 0%, rgba(20,20,20,0.8) 100%)',
    borderRadius: { xs: '8px', sm: '12px' },
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    margin: { xs: '0 0 12px 0', sm: '0 0 16px 0' },
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:active': {
      transform: 'scale(0.98)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
    },
  },
  
  // Mobile table-specific styles
  mobileTable: {
    tableLayout: 'fixed',
    '& .MuiTableCell-root': {
      padding: { xs: '8px 6px', sm: '12px 16px' },
      fontSize: { xs: '0.8125rem', sm: '0.875rem' },
      whiteSpace: { xs: 'nowrap', md: 'normal' },
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  
  mobileCardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  
  tableContainer: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
    msOverflowStyle: '-ms-autohiding-scrollbar', // Better scroll handling on Windows
    scrollbarWidth: 'thin', // Firefox
    width: '100%',
    '&::-webkit-scrollbar': {
      height: '4px',
      width: '4px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(0, 0, 0, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 8,
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
      },
    },
  },
  
  flexRowResponsive: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
  },
  
  // Touch-friendly buttons for mobile
  touchFriendlyButton: {
    minHeight: '44px',
    minWidth: '44px',
  },
  
  // Responsive dialog/modal
  mobileDialog: {
    margin: { xs: 1, sm: 2 },
    width: { xs: 'calc(100% - 16px)', sm: 'auto' },
    maxWidth: { xs: '100%', sm: '600px' },
  },
  
  // Responsive table container with improved mobile support - merged with above definition
  
  // Mobile table styles
  mobileTableStyles: {
    '& th, & td': {
      padding: { xs: '8px 12px', sm: '12px 16px' },
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
    },
  },
  
  // Card list view for mobile tables alternative
  mobileCardListView: {
    display: { xs: 'flex', md: 'none' },
    flexDirection: 'column',
    gap: 2,
  },
  
  // Bottom navigation for mobile
  mobileBottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '56px',
    display: { xs: 'flex', sm: 'none' },
    justifyContent: 'space-around',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 1000,
  },
  
  // Dashboard grid spacing
  dashboardGrid: {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
  },
  
  // Touch-friendly form inputs
  touchFriendlyInput: {
    '& .MuiInputBase-input': {
      padding: { xs: '12px', sm: '14px' },
      fontSize: { xs: '16px' }, // Prevents zoom on focus in iOS
      height: { xs: '24px', sm: 'auto' }
    },
    '& .MuiInputLabel-root': {
      fontSize: { xs: '14px', sm: '16px' }
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: { xs: '8px', sm: '4px' }
    }
  },
  
  // Floating action button for mobile
  mobileFab: {
    position: 'fixed',
    bottom: { xs: '70px', sm: '24px' }, // Above bottom nav on mobile
    right: '16px',
    zIndex: 999,
  },
  
  // Netflix-inspired mobile card - enhanced version
  netflixMobileCardEnhanced: {
    borderRadius: { xs: '8px', sm: '12px' },
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'transform 0.2s',
    '&:active': {
      transform: 'scale(0.98)', // Subtle feedback when tapped
    }
  },
  
  // Adjust content padding to avoid bottom navigation
  safeAreaBottomPadding: {
    paddingBottom: { xs: '72px', sm: '24px' },
  }
};

// Responsive typography sizes - optimized for mobile
export const fontSizes = {
  h1: {
    xs: '1.5rem',    // Even smaller for tiny phones
    sm: '1.75rem',   // Small phones
    md: '2.25rem',   // Tablets
    lg: '2.75rem',   // Desktop
  },
  h2: {
    xs: '1.25rem',
    sm: '1.5rem',
    md: '1.75rem',
    lg: '2rem',
  },
  h3: {
    xs: '1.125rem',
    sm: '1.25rem',
    md: '1.5rem',
    lg: '1.75rem',
  },
  h4: {
    xs: '1rem',
    sm: '1.125rem',
    md: '1.25rem',
    lg: '1.5rem',
  },
  h5: {
    xs: '0.875rem',
    sm: '1rem',
    md: '1.125rem',
    lg: '1.25rem',
  },
  h6: {
    xs: '0.8125rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
  },
  body1: {
    xs: '0.875rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1rem',
  },
  body2: {
    xs: '0.75rem',
    sm: '0.75rem',
    md: '0.875rem',
    lg: '0.875rem',
  },
  // For very small text elements
  caption: {
    xs: '0.6875rem',
    sm: '0.75rem',
    md: '0.75rem',
    lg: '0.75rem',
  },
  // For buttons/interactive elements
  button: {
    xs: '0.875rem',
    sm: '0.875rem',
    md: '0.9375rem',
    lg: '1rem',
  }
};

// Responsive spacing - optimized for mobile
export const spacing = {
  xs: {
    container: '0.75rem', // Tighter for small phones
    section: '1.25rem',
    card: '0.625rem',
    inputField: '0.5rem',
    iconButton: '0.375rem',
  },
  sm: {
    container: '1rem',
    section: '1.75rem',
    card: '0.875rem',
    inputField: '0.625rem',
    iconButton: '0.5rem',
  },
  md: {
    container: '1.5rem',
    section: '2.5rem',
    card: '1.25rem',
    inputField: '0.75rem',
    iconButton: '0.625rem',
  },
  lg: {
    container: '2rem',
    section: '3.5rem',
    card: '1.5rem',
    inputField: '1rem',
    iconButton: '0.75rem',
  },
};

// Helper for dynamic sizing based on screen width
export const dynamicSize = (smallSize, largeSize) => {
  return {
    xs: smallSize,
    sm: smallSize * 1.25,
    md: largeSize * 0.8,
    lg: largeSize,
  };
};

// Media query strings for direct CSS usage
export const mediaQueries = {
  smallMobile: '(max-width: 360px)',
  mobile: '(max-width: 600px)',
  tablet: '(min-width: 601px) and (max-width: 960px)',
  desktop: '(min-width: 961px)',
  landscape: '(orientation: landscape)',
  portrait: '(orientation: portrait)',
};

// Touch target size recommendations (accessibility)
export const touchTargets = {
  minimum: '44px', // WCAG recommendation
  comfortable: '48px',
  spacing: '8px',  // Min space between touch targets
};
