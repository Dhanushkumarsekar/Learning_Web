import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  CssBaseline,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Dashboard,
  People,
  School,
  Groups,
  Analytics,
  Notifications,
  Assignment,
  History,
  Feedback,
  WorkspacePremium,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import api, { isNetworkConnectionError } from '../../api';
import vdartLogo from '../../assets/vdartacademylogo1 1.png';

const drawerWidth = 180;
const collapsedWidth = 64;

const AdminLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [logoHovered, setLogoHovered] = useState(false);
  const [railHovered, setRailHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const lastNotificationAtRef = useRef(null);
  const liveNotificationFailureCountRef = useRef(0);
  const liveNotificationsPausedRef = useRef(false);
  const liveNotificationPauseLoggedRef = useRef(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await api.get('/notifications/');
      setNotifications(response.data);
      const latest = response.data?.[0]?.created_at || null;
      lastNotificationAtRef.current = latest;
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Poll for new notifications to keep badge fresh
  const fetchLiveNotifications = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }

    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }

    if (liveNotificationsPausedRef.current || !localStorage.getItem('token')) {
      return;
    }

    try {
      const since = lastNotificationAtRef.current;
      const params = since ? { params: { since } } : undefined;
      const response = await api.get('/notifications/live/', params);
      const incoming = response.data?.notifications || [];
      const latest = response.data?.latest || null;

      liveNotificationFailureCountRef.current = 0;
      liveNotificationsPausedRef.current = false;
      liveNotificationPauseLoggedRef.current = false;

      if (incoming.length) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const merged = [
            ...incoming.filter((n) => !existingIds.has(n.id)),
            ...prev,
          ];
          merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          return merged.slice(0, 100);
        });
      }

      if (latest) {
        lastNotificationAtRef.current = latest;
      }
    } catch (error) {
      if (isNetworkConnectionError(error)) {
        liveNotificationFailureCountRef.current += 1;

        if (liveNotificationFailureCountRef.current >= 3) {
          liveNotificationsPausedRef.current = true;

          if (!liveNotificationPauseLoggedRef.current) {
            console.warn('Live notifications are temporarily unavailable. Polling will resume when the connection returns.');
            liveNotificationPauseLoggedRef.current = true;
          }
        }

        return;
      }

      console.error('Error fetching live notifications:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (event) => {
    setNotificationAnchorEl(event.currentTarget);
    
    // Mark all notifications as read when dropdown is opened
    try {
      await api.put('/notifications/mark-all-read/');
      // Update local state to mark all notifications as read
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  // Mark notification as read and navigate
  const handleNotificationItemClick = async (notification) => {
    try {
      // Mark as read
      await api.put(`/notifications/${notification.id}/mark-read/`);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id 
            ? { ...n, is_read: true }
            : n
        )
      );
      
      // Navigate based on notification type
      if (notification.navigation_data && notification.navigation_data.path) {
        navigate(notification.navigation_data.path);
        setNotificationAnchorEl(null); // Close notification dropdown
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchLiveNotifications, 10000);

    const resumeLiveNotifications = () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return;
      }

      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      liveNotificationFailureCountRef.current = 0;
      liveNotificationsPausedRef.current = false;
      liveNotificationPauseLoggedRef.current = false;
      fetchLiveNotifications();
    };

    window.addEventListener('online', resumeLiveNotifications);
    document.addEventListener('visibilitychange', resumeLiveNotifications);

    return () => {
      window.removeEventListener('online', resumeLiveNotifications);
      document.removeEventListener('visibilitychange', resumeLiveNotifications);
      clearInterval(interval);
    };
  }, []);

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
  { text: 'Users', icon: <People />, path: '/admin/users' },
  { text: 'Courses', icon: <School />, path: '/admin/courses' },
  { text: 'Team', icon: <Groups />, path: '/admin/teams' },
  { text: 'Analytics', icon: <Analytics />, path: '/admin/analytics' },
  { text: 'Certificates', icon: <WorkspacePremium />, path: '/admin/certificates' },
  { text: 'Feedback', icon: <Feedback />, path: '/admin/feedback' },
  // ✅ Show only for Admin users
  ...(user?.user_type === 'ADMIN'
    ? [
        { text: 'Approval Dashboard', icon: <Assignment />, path: '/admin/requests' },
        { text: 'Approved List', icon: <History />, path: '/admin/deleted-actions' }
      ]
    : []),
];


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          backgroundColor: theme.palette.primary.main,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderRadius: 0,
          boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
        }}
      >
        <Toolbar>
          {/* VDart logo — hover reveals toggle arrow */}
          <Tooltip title={drawerOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}>
            <Box
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
              onClick={handleDrawerToggle}
              sx={{
                mr: 2,
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                '&:hover': { background: 'rgba(255,255,255,0.15)' },
              }}
            >
              {logoHovered
                ? (drawerOpen ? <MenuOpenIcon sx={{ color: theme.palette.primary.main, fontSize: 26 }} /> : <MenuIcon sx={{ color: theme.palette.primary.main, fontSize: 26 }} />)
                : <Box component="img" src={vdartLogo} alt="VDart" sx={{ width: 48, height: 48, objectFit: 'contain' }} />}
            </Box>
          </Tooltip>
          
          {/* Spacer to push icons to the right */}
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Icons moved to the right side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={notifications.filter(n => !n.is_read).length} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            {/* Profile Avatar */}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="inherit">
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                {user?.username?.[0]?.toUpperCase() || 'A'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        onMouseEnter={() => !drawerOpen && setRailHovered(true)}
        onMouseLeave={() => setRailHovered(false)}
        sx={{
          width: drawerOpen ? drawerWidth : railHovered ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          transition: 'width 0.25s ease',
          '& .MuiDrawer-paper': {
            mt: '64px',
            width: drawerOpen ? drawerWidth : railHovered ? drawerWidth : collapsedWidth,
            height: 'calc(100% - 64px)',
            boxSizing: 'border-box',
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            transition: 'width 0.25s ease',
            border: 'none',
            borderRight: `1px solid ${theme.palette.divider}`,
            boxShadow: railHovered && !drawerOpen
              ? '4px 0 24px rgba(0,0,0,0.13)'
              : '2px 0 8px rgba(0,0,0,0.04)',
            zIndex: theme.zIndex.drawer,
          },
        }}
      >
        <List sx={{ px: 1, pt: 1.5 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const expanded = drawerOpen || railHovered;
            return (
              <Tooltip key={item.text} title={!expanded ? item.text : ''} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    justifyContent: expanded ? 'flex-start' : 'center',
                    px: expanded ? 2 : 0,
                    py: 1.2,
                    borderRadius: 999,
                    my: 1.2,
                    backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
                    color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
                    boxShadow: isActive ? 3 : 0,
                    transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
                    '&:hover': {
                      backgroundColor: isActive ? theme.palette.primary.dark : theme.palette.action.hover,
                      color: isActive ? theme.palette.primary.contrastText : theme.palette.primary.main,
                      boxShadow: 4,
                    },
                    minHeight: 48,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: expanded ? 2 : 'auto',
                      ml: expanded ? 1 : 'auto',
                      justifyContent: 'center',
                      color: isActive ? theme.palette.primary.contrastText : theme.palette.primary.main,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {expanded && <ListItemText primary={item.text} />}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Drawer>

      {/* Main content — flexGrow fills remaining space naturally */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          mt: '64px',
          transition: 'margin-left 0.25s ease',
          bgcolor: theme.palette.background.default,
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Outlet />
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem disabled>
          <Typography variant="subtitle1">{user?.username || 'Admin'}</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>

      {/* Notification Dropdown */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 6,
            minWidth: 320,
            maxHeight: 400,
            overflow: 'auto',
            mt: 1.5,
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={500}>
            Notifications
          </Typography>
        </Box>
        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {loadingNotifications ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Loading notifications...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <Box
                key={notification.id}
                sx={{
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  backgroundColor: notification.is_read ? 'transparent' : theme.palette.action.hover,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
                onClick={() => handleNotificationItemClick(notification)}
              >
                {/* Sender info with profile picture */}
                {notification.sender_username && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar
                      src={notification.sender_profile_picture || undefined}
                      imgProps={{ referrerPolicy: 'no-referrer' }}
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        mr: 1,
                        fontSize: '0.75rem'
                      }}
                    >
                      {notification.sender_username[0]?.toUpperCase()}
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight={500} color="primary">
                      {notification.sender_username}
                    </Typography>
                  </Box>
                )}
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.created_at).toLocaleString()}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Menu>
    </Box>
  );
};

export default AdminLayout;
