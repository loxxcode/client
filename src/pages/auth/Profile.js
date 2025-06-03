import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Avatar, 
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { currentUser, updateUserInContext } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setUserData(prevData => ({
        ...prevData,
        name: currentUser.name || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match if provided
    if (userData.password && userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Only include password if it's provided
      const updateData = {
        name: userData.name,
        email: userData.email
      };
      
      if (userData.password) {
        updateData.password = userData.password;
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/auth/profile', updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update user in context
      if (response.data.success) {
        updateUserInContext(response.data.data);
        setSuccessMessage('Profile updated successfully');
        
        // Clear password fields
        setUserData({
          ...userData,
          password: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
    setError('');
  };

  if (!currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main' }}
            >
              <PersonIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {currentUser.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Admin User
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                value={userData.name}
                onChange={handleChange}
                autoFocus
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                value={userData.email}
                onChange={handleChange}
              />
              
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Change Password
              </Typography>
              
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label="New Password"
                type="password"
                id="password"
                value={userData.password}
                onChange={handleChange}
              />
              
              <TextField
                margin="normal"
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
              />
              
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Profile'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Success and Error messages */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
