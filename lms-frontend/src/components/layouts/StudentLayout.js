import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import UserProfile from '../../pages/student/UserProfile';
import ChatBot from '../ChatBot';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GroupsIcon from '@mui/icons-material/Groups';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Dialog,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Button,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Forum as ForumIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { CourseProgressProvider, useCourseProgress } from '../../contexts/CourseProgressContext';
import api from '../../api';
import { useTheme } from '@mui/material/styles';
import vdartLogo from '../../assets/vdartacademylogo1 1.png';
import dashboardIcon from '../../assets/Container11.png';
import courseCatalogIcon from '../../assets/container12.png';
import myCoursesIcon from '../../assets/Container13.png';
import creditPointsIcon from '../../assets/Container14.png';
import headerBellIcon from '../../assets/header1.png';
import headerProfileIcon from '../../assets/header3.png';

const expandedWidth = 200;
const collapsedWidth = 64;
const SIDEBAR_COLORS = {
  text: '#475569',
  active: '#1E40AF',
  activeBackground: '#DBEAFE',
  surface: '#FFFFFF',
  border: 'rgba(71, 85, 105, 0.12)',
};
const STUDENT_SURFACE_BACKGROUND = `
  radial-gradient(circle at 50% 12%, rgba(29, 78, 216, 0.10) 0%, rgba(219, 234, 254, 0.28) 26%, rgba(255, 255, 255, 0) 55%),
  linear-gradient(180deg, #eef8ff 0%, #f8fcff 54%, #f5fbff 100%)
`;

const StudentLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [logoHovered, setLogoHovered] = useState(false);
  const [railHovered, setRailHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [creditPoints, setCreditPoints] = useState(0);
  const [chatBotOpen, setChatBotOpen] = useState(false);
  const lastNotificationAtRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: courseId } = useParams();
  const { setCourseProgress } = useCourseProgress();
  const theme = useTheme();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openProfileDialog = (event) => {
    console.log("EDIT PROFILE CLICKED");
    setProfileOpen(true);
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

  const fetchCreditPoints = async () => {
    try {
      const response = await api.get('/student/credit-points/');
      setCreditPoints(Number(response.data?.total_credit_points || 0));
    } catch (error) {
      console.error('Error fetching credit points:', error);
    }
  };

  // Poll for new notifications (near real-time)
  const fetchLiveNotifications = async () => {
    try {
      const since = lastNotificationAtRef.current;
      const params = since ? { params: { since } } : undefined;
      const response = await api.get('/notifications/live/', params);
      const incoming = response.data?.notifications || [];
      const latest = response.data?.latest || null;

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
      // Keep polling quietly; console for debugging only
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

  const menuItems = [
    { text: 'Dashboard', iconAsset: dashboardIcon, path: '/userlogin', iconWidth: 18, iconHeight: 18 },
    { text: 'Course Catalog', iconAsset: courseCatalogIcon, path: '/catalog', iconWidth: 22, iconHeight: 20 },
    { text: 'My Courses', iconAsset: myCoursesIcon, path: '/my-courses', iconWidth: 22, iconHeight: 18 },
    { text: 'Credit Points', iconAsset: creditPointsIcon, path: '/credit-points', iconWidth: 20, iconHeight: 20 },
    // { text: 'Student Feedback', icon: <Feedback />, path: '/feedback' },
    // { text: 'Performance', icon: <Timeline />, path: '/performance' }
  ];

  // Detect if on course page
  const isCourseView = location.pathname.startsWith('/course/');

  useEffect(() => {
    const fetchProgress = async () => {
      if (isCourseView && courseId) {
        try {
          const res = await api.get(`/courses/${courseId}/enrollment_status/`);
          if (typeof res.data.progress_percent === 'number') {
            setCourseProgress(Math.round(res.data.progress_percent));
          }
        } catch (e) {
          // Optionally handle error
        }
      }
    };
    fetchProgress();
  }, [isCourseView, courseId, setCourseProgress]);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    fetchCreditPoints();
    const interval = setInterval(fetchLiveNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CourseProgressProvider>
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Sidebar (Drawer) */}
      <Drawer
  variant={window.innerWidth < 768 ? "temporary" : "permanent"}
        onMouseEnter={() => !drawerOpen && setRailHovered(true)}
        onMouseLeave={() => setRailHovered(false)}
        sx={{
          width: drawerOpen ? expandedWidth : railHovered ? expandedWidth : collapsedWidth,
          flexShrink: 0,
          transition: 'width 0.25s ease',
          '& .MuiDrawer-paper': {
            width: drawerOpen ? expandedWidth : railHovered ? expandedWidth : collapsedWidth,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: 'width 0.25s ease',
            background: SIDEBAR_COLORS.surface,
            color: SIDEBAR_COLORS.text,
            border: 'none',
            borderRight: `1px solid ${SIDEBAR_COLORS.border}`,
            boxShadow: railHovered && !drawerOpen
              ? '4px 0 24px rgba(0,0,0,0.10)'
              : '2px 0 8px rgba(0,0,0,0.03)',
            zIndex: theme.zIndex.drawer,
          }
        }}
      >
        <Toolbar
          sx={{
            minHeight: '64px !important',
            px: 0,
            py: 0,
            background: SIDEBAR_COLORS.surface,
          }}
        />
        <Divider sx={{ borderColor: SIDEBAR_COLORS.border }} />
        <List
          sx={{
            px: 1,
            py: 1.75,
            width: '100%',
          }}
        >
          {menuItems.map((item) => {
            const isActive = location && location.pathname === item.path;
            const expanded = drawerOpen || railHovered;
            return (
              <Tooltip key={item.text} title={!expanded ? item.text : ''} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: expanded ? 'flex-start' : 'center',
                    width: '100%',
                    px: expanded ? 1.5 : 0,
                    py: 1,
                    my: 0.6,
                    minHeight: 40,
                    borderRadius: '12px',
                    backgroundColor: isActive ? SIDEBAR_COLORS.activeBackground : 'transparent',
                    color: isActive ? SIDEBAR_COLORS.active : SIDEBAR_COLORS.text,
                    boxShadow: 'none',
                    transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
                    '&:hover': {
                      backgroundColor: isActive ? SIDEBAR_COLORS.activeBackground : 'rgba(219,234,254,0.55)',
                      color: isActive ? SIDEBAR_COLORS.active : SIDEBAR_COLORS.text,
                    },
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: 0,
                    mr: expanded ? 1.25 : 'auto',
                    ml: expanded ? 0 : 'auto',
                    justifyContent: 'center',
                    color: isActive ? SIDEBAR_COLORS.active : SIDEBAR_COLORS.text,
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    width: 22,
                  }}>
                    <Box
                      component="span"
                      sx={{
                        width: item.iconWidth,
                        height: item.iconHeight,
                        display: 'inline-block',
                        flexShrink: 0,
                        backgroundColor: isActive ? SIDEBAR_COLORS.active : SIDEBAR_COLORS.text,
                        WebkitMaskImage: `url(${item.iconAsset})`,
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        WebkitMaskSize: 'contain',
                        maskImage: `url(${item.iconAsset})`,
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        maskSize: 'contain',
                      }}
                    />
                  </ListItemIcon>
                  {expanded && (
                    <ListItemText
                      primary={item.text}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        my: 0,
                        '& .MuiListItemText-primary': {
                          fontSize: 14,
                          fontWeight: isActive ? 700 : 600,
                          lineHeight: 1.2,
                          color: isActive ? SIDEBAR_COLORS.active : SIDEBAR_COLORS.text,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                      }}
                      primaryTypographyProps={{ component: 'span' }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Drawer>

      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: '100%',
          ml: 0,
          borderRadius: 0,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <Tooltip title={drawerOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}>
            <Box
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
              onClick={toggleDrawer}
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

          <Box sx={{ flexGrow: 1 }} />
          
          {/* Icons moved to the right side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Credit Points">
              <Box
                sx={{
                  minWidth: 36,
                  height: 36,
                  px: 1,
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F8C344',
                  color: '#1F2937',
                  boxShadow: 'none',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    lineHeight: 1,
                    textAlign: 'center',
                    color: '#1F2937',
                  }}
                >
                  {creditPoints}
                </Typography>
              </Box>
            </Tooltip>
            <IconButton
              color="inherit"
              onClick={handleNotificationClick}
              sx={{ width: 36, height: 36, p: 0 }}
            >
              <Box
                component="img"
                src={headerBellIcon}
                alt=""
                sx={{ width: 32, height: 36, display: 'block' }}
              />
            </IconButton>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="inherit">
             <Avatar
  src={user?.profile_picture || undefined}
  sx={{
    width: 48,
    height: 48,
    bgcolor: '#1E293B',
    fontWeight: 700
  }}
>
  {!user?.profile_picture &&
    user?.username?.[0]?.toUpperCase()}
</Avatar>
            </IconButton>
          </Box>
         {/* Profile Menu */}
         <Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={() => setAnchorEl(null)}
  PaperProps={{
  sx: {
    borderRadius: '35px',
    width: {
  xs: '90vw',
sm:300,
md:320
},
     maxHeight:'90vh',
    overflow: 'hidden',
    p: 0,
    height: 'auto',
minHeight: 'unset',
  }
}}
>
  <Box
  sx={{
    p: 1,
    textAlign: 'center',
   background: 'rgba(255,255,255,0.75)',
backdropFilter: 'blur(20px)',
WebkitBackdropFilter: 'blur(20px)',
boxShadow: '0 8px 32px rgba(31,38,135,0.15)',
border: '1px solid rgba(255,255,255,0.3)',
  }}
>
  <Box
  sx={{
    display: 'flex',
    justifyContent: 'flex-end',
    mb: 0.2
  }}
>
  <IconButton
    onClick={openProfileDialog}
    size="small"
    sx={{
      color: '#1E293B'
    }}
  >
    <EditIcon />
  </IconButton>
</Box>
    <Avatar
      src={user?.profile_picture || undefined}
      sx={{
       width: {
  xs: 40,
  sm: 50
},
height: {
  xs: 40,
  sm: 50
},
        mx: 'auto',
        mb: 0.2,
       bgcolor: '#1E293B',
        fontSize: '1.5rem'
      }}
    >
       {!user?.profile_picture &&
      user?.username?.[0]?.toUpperCase()}
    </Avatar>

    <Typography
      variant="h6"
      fontWeight={700}
      mb={0.2}
    >
      {user?.username}
    </Typography>

    {user?.email && (
  <Typography
    color="text.secondary"
    mb={1}
  >
    {user.email}
  </Typography>
)}

    <Box
  sx={{
    mb: 1.5
  }}
>
<Box
  sx={{
    display: 'grid',
    gridTemplateColumns: '120px 20px 1fr',
    alignItems: 'center',
    mb: 1
  }}
>
  <Typography fontWeight={500}>
    First Name
  </Typography>

  <Typography>:</Typography>

  <Typography>
    {user?.first_name || 'N/A'}
  </Typography>
</Box>
<Box
  sx={{
    display: 'grid',
    gridTemplateColumns: '120px 20px 1fr',
    alignItems: 'center',
    mb: 1
  }}
>

  <Typography fontWeight={500}>
    Last Name
  </Typography>

  <Typography>:</Typography>

  <Typography>
    {user?.last_name || 'N/A'}
  </Typography>
</Box>
<Box
  sx={{
    display: 'grid',
   gridTemplateColumns: '120px 20px 1fr',
    alignItems: 'center',
    mb: 1
  }}
>

  <Typography fontWeight={500}>
    Team
  </Typography>

  <Typography>:</Typography>

  <Typography>
    {user?.team?.name || 'No Team'}
  </Typography>
</Box>
<Typography
  sx={{
    fontSize: '1rem',
    fontWeight: 500,
    textAlign:'left'
  }}
>
</Typography>
    </Box>

    <Divider sx={{ my: 0.2 }} />
    <Button
  fullWidth
  variant="outlined"
  startIcon={<LogoutIcon />}
  onClick={handleLogout}
      sx={{
  width: '80%',
  mx: 'auto',
  borderRadius: '30px',
  height: 50,
  borderColor: '#DC2626',
color: '#DC2626',
'&:hover': {
  borderColor: '#B91C1C',
  background: '#FEF2F2'
},
  fontWeight: 600,
  textTransform: 'none',
}}
    >
      Logout
    </Button>
  </Box>
</Menu>

          {/* Profile Dialog */}
          <Dialog
  open={profileOpen}
  onClose={() => setProfileOpen(false)}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      width: {
        xs: '95vw',
        sm: '600px'
      },
      maxHeight: '90vh'
    }
  }}
>
            <UserProfile user={user} onClose={() => setProfileOpen(false)} />
          </Dialog>
        </Toolbar>
      </AppBar>

      {/* Main content + footer — flexGrow fills remaining space naturally */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        <Toolbar sx={{ flexShrink: 0 }} />
        <Box sx={{ flexGrow: 1, background: STUDENT_SURFACE_BACKGROUND, position: 'relative' }}>
          <Outlet context={{ drawerOpen, creditPoints, refreshCreditPoints: fetchCreditPoints }} />
          
          {/* ChatBot FAB Button */}
          <Tooltip title="Ask Learning Assistant">
            <Fab
              color="primary"
              aria-label="chat"
              onClick={() => setChatBotOpen(true)}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                backgroundColor: '#FCD980',
                color: '#282938',
                '&:hover': {
                  backgroundColor: '#FBD570',
                },
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}
            >
              <ForumIcon />
            </Fab>
          </Tooltip>
        </Box>
        {/* Footer */}
        <Box sx={{
          background: '#ffffff',
          color: SIDEBAR_COLORS.text,
          textAlign: 'center',
          borderTop: `1px solid ${SIDEBAR_COLORS.border}`,
          py: 3,
          flexShrink: 0,
          boxShadow: '0 -2px 8px rgba(71,85,105,0.04)',
        }}>
          <Typography variant="body2" sx={{ color: SIDEBAR_COLORS.text, fontWeight: 500 }}>
            © {new Date().getFullYear()} YourLMS. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>

    {/* ChatBot Dialog */}
    <ChatBot open={chatBotOpen} onClose={() => setChatBotOpen(false)} />

    </CourseProgressProvider>
  );
};

export default StudentLayout;
