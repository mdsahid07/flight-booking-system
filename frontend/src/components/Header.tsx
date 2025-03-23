import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  ButtonProps,
  Box, 
  Avatar, 
  IconButton, 
  Menu, 
  MenuItem, 
  Divider, 
  Tooltip 
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import LoginSignupModal from './LoginSignupModal';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import logo from '../assets/logo.png';

// Extend ButtonProps and optionally include RouterLinkProps
interface NavButtonProps extends ButtonProps {
  component?: React.ElementType;
  to?: string;
}

const NavButton = styled(Button)<NavButtonProps>(({ theme }) => ({
  color: '#fff',
  fontWeight: 600,
  padding: '6px 16px',
  margin: '0 8px',
  borderRadius: '20px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'scale(1.05)',
  },
  '&:active': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
}));

const Header: React.FC = () => {
  const { user, logout, isLoggedIn } = useAuth();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  // Check if the user is an admin
  const isAdmin = user?.roles?.some(role => role.name === 'ADMIN') ?? false;
console.log("Check if the user is an admin: ", isAdmin);
console.log(user?.roles);

  return (
    <AppBar 
      position="static" 
      elevation={4} 
      sx={{ 
        background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        borderBottom: 'none',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', padding: '0 24px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="FlyHigh Airlines Logo" style={{ width: 40, height: 40, marginRight: 12 }} />
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
            XAI Travel 
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
          <NavButton component={RouterLink} to="/">Home</NavButton>
          {isLoggedIn && (
            <NavButton component={RouterLink} to="/myxai">MyXAI</NavButton>
          )}
          <NavButton component={RouterLink} to="/about">About</NavButton>
          {isLoggedIn && isAdmin && (
            <NavButton component={RouterLink} to="/management">Management</NavButton>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isLoggedIn && user ? (
            <>
              <Tooltip title="Account">
                <IconButton onClick={handleMenuOpen} sx={{ p: 0, mr: 1 }}>
                  <Avatar 
                    alt={user.name} 
                    src={user.avatarUrl} 
                    sx={{ width: 36, height: 36, border: '2px solid #fff', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.1)' } }} 
                  />
                </IconButton>
              </Tooltip>
              <Typography variant="body1" sx={{ color: '#fff', mr: 2, display: { xs: 'none', sm: 'block' } }}>
                {user.name}
              </Typography>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: { mt: 1.5, minWidth: 200, backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
                }}
              >
                <MenuItem disabled sx={{ opacity: 1, py: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">{user.email}</Typography>
                </MenuItem>
                <Divider />
                <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>Profile</MenuItem>
                <MenuItem component={RouterLink} to="/my-bookings" onClick={handleMenuClose}>My Bookings</MenuItem>
                {isAdmin && (
                  <MenuItem component={RouterLink} to="/management" onClick={handleMenuClose}>Management</MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              onClick={handleOpenModal}
              sx={{
                color: '#fff',
                fontWeight: 600,
                padding: '6px 16px',
                margin: '0 8px',
                borderRadius: '20px',
                transition: 'all 0.3s ease',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)', transform: 'scale(1.05)' },
              }}
            >
              Login/Signup
            </Button>
          )}
        </Box>
      </Toolbar>
      <LoginSignupModal open={modalOpen} onClose={handleCloseModal} />
    </AppBar>
  );
};

export default Header;