import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Alert, 
  Typography, 
  Box, 
  IconButton, 
  InputAdornment 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import { validateEmail, validatePassword } from '../utils/validation';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    background: '#fff',
  },
}));

const apiUrlStem = import.meta.env.VITE_API_URL;

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
  color: '#fff',
  textAlign: 'center',
  padding: '16px 24px',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
}));

const ToggleButton = styled(Button)(({ theme }) => ({
  color: '#1e3c72',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'rgba(30, 60, 114, 0.1)',
    color: '#ffeb3b',
  },
}));

interface LoginSignupModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

const getHeaders = () => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');
  const token = localStorage.getItem('token');
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  return headers;
};

const LoginSignupModal: React.FC<LoginSignupModalProps> = ({ open, onClose, onSuccess }) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || !validatePassword(password)) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!isLogin && (!name || !phone || !address)) {
      setError('Please fill all required fields for signup.');
      return;
    }

    if (isLogin) {
      const request = { email, password };
      try {
        console.log('Sending login request to:', `${apiUrlStem}/api/auth/login`);
        console.log('Sending login request (object):', request);
        console.log('Sending login request (JSON):', JSON.stringify(request));
        const response = await fetch(`${apiUrlStem}/api/auth/login`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Received login response from backend:', data);
        localStorage.setItem('token', data.token);

        const userResponse = await fetch(`${apiUrlStem}/api/users/search/email?email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: getHeaders(),
        });

        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          throw new Error(`HTTP error! Status: ${userResponse.status} - ${errorText}`);
        }

        const contentType = userResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response format. Expected JSON.');
        }

        let userData;
        try {
          userData = await userResponse.json();
        } catch (parseError) {
          console.error('Failed to parse user data:');
          throw new Error('Invalid JSON response from server.');
        }

        console.log('RECEIVED USER DETAILS:', userData.roles.id);

        const user = {
          id: userData.id, // No [0] since it's a single user
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          avatarUrl: userData.avatar || 'https://via.placeholder.com/40',
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          roles: [{ id: userData.roles[0].id || '1', name: userData.roles[0].name || 'USER' }], // Adjusting for roles as an array of objects
        };
        login(user);
        if (onSuccess) onSuccess(user);
        onClose();
      } catch (error) {
        console.error('Login failed:', error);
        setError(`Login failed. ${error}`);
      }
    } else {
      const request = { name, email, password, phone, address };
      try {
        const response = await fetch(`${apiUrlStem}/api/auth/signup`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Received signup response from backend:', data);
        localStorage.setItem('token', data.token);

        const user = {
          name,
          email,
          phone,
          address,
          avatarUrl: 'https://via.placeholder.com/40',
          roles: data.roles || ['USER'],
        };
        login(user);
        if (onSuccess) onSuccess(user);
        onClose();
      } catch (error) {
        console.error('Signup failed:', error);
        setError(`Signup failed. ${error}`);
      }
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle>{isLogin ? 'Login' : 'Signup'}</StyledDialogTitle>
      <DialogContent sx={{ py: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!isLogin && (
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: '#1e3c72' }} />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
          />
        )}
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
          error={!!email && !validateEmail(email)}
          helperText={!!email && !validateEmail(email) ? 'Invalid email format' : ''}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: '#1e3c72' }} />
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
          error={!!password && !validatePassword(password)}
          helperText={!!password && !validatePassword(password) ? 'Password must be at least 6 characters' : ''}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: '#1e3c72' }} />
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
        />
        {!isLogin && (
          <>
            <TextField
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: '#1e3c72' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
            />
            <TextField
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon sx={{ color: '#1e3c72' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
            />
          </>
        )}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <ToggleButton onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Need an account? Signup' : 'Already have an account? Login'}
          </ToggleButton>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onClose} 
          color="secondary" 
          sx={{ borderRadius: 8, px: 3 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          sx={{ 
            borderRadius: 8, 
            px: 3, 
            backgroundColor: '#1e3c72', 
            '&:hover': { backgroundColor: '#2a5298' } 
          }}
        >
          {isLogin ? 'Login' : 'Signup'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default LoginSignupModal;