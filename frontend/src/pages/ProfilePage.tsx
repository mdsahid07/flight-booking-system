import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  styled,
} from '@mui/material';
import { keyframes } from '@emotion/react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
const apiUrlStem = import.meta.env.VITE_API_URL;
// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
const AnimatedBox = styled(Box)(({ theme }) => ({
  animation: `${fadeIn} 0.5s ease-out forwards`,
  padding: '20px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
}));

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(null);
  };

  const handleChange = (field: keyof typeof profile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  const handleSave = async () => {
    // Simulate API call to update profile (replace with actual endpoint)
    try {
      const response = await fetch(`${apiUrlStem}/api/user/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profile),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      setIsEditing(false);
      // Update AuthContext if necessary (assuming backend updates user data)
    } catch (err) {
      setError('Failed to save changes. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <Box sx={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
      
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: '#1e3c72' }}>
          Please log in to view your profile.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{
            display: 'block',
            mx: 'auto',
            mt: 2,
            backgroundColor: '#ffeb3b',
            color: '#1e3c72',
            '&:hover': { backgroundColor: '#ffd700' },
          }}
        >
          Back to Home
        </Button>
        
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
    
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: '#1e3c72', textAlign: 'center', animation: `${fadeIn} 0.5s ease-out` }}
      >
        My Profile
      </Typography>
      <AnimatedBox>
        {error && (
          <Alert severity="error" sx={{ mb: 2, animation: `${fadeIn} 0.5s ease-out` }}>
            {error}
          </Alert>
        )}
        <Typography variant="h6" sx={{ color: '#2a5298', mb: 2 }}>
          Personal Information
        </Typography>
        <TextField
          label="Name"
          value={profile.name}
          onChange={handleChange('name')}
          fullWidth
          margin="normal"
          disabled={!isEditing}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
            animation: `${fadeIn} 0.5s ease-out 0.1s forwards`,
            opacity: 0,
          }}
        />
        <TextField
          label="Email"
          value={profile.email}
          onChange={handleChange('email')}
          fullWidth
          margin="normal"
          disabled={!isEditing}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
            animation: `${fadeIn} 0.5s ease-out 0.2s forwards`,
            opacity: 0,
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          {isEditing ? (
            <>
              <Button
                onClick={handleEditToggle}
                sx={{
                  borderRadius: '8px',
                  color: '#1e3c72',
                  border: '1px solid #1e3c72',
                  '&:hover': { backgroundColor: '#f5f7fa' },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: '#ffeb3b',
                  color: '#1e3c72',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#ffd700', transform: 'scale(1.05)' },
                }}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleEditToggle}
                variant="contained"
                sx={{
                  borderRadius: '8px',
                  backgroundColor: '#ffeb3b',
                  color: '#1e3c72',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#ffd700', transform: 'scale(1.05)' },
                }}
              >
                Edit Profile
              </Button>
              <Button
                onClick={handleLogout}
                sx={{
                  borderRadius: '8px',
                  color: '#1e3c72',
                  border: '1px solid #1e3c72',
                  '&:hover': { backgroundColor: '#f5f7fa' },
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </AnimatedBox>
     
    </Box>
  );
};

export default ProfilePage;