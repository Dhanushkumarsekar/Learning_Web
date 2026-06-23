import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import api from '../../api';
import {
  Box,
  Typography,
  TextField,
  Button,
  DialogContent,
  DialogActions,
  Avatar,
  Grid
} from '@mui/material';

const UserProfile = ({ user, onClose }) => {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    team: user?.team?.name || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
 const handleSave = async () => {
  try {

    const token = localStorage.getItem("token");
    console.log("TOKEN =", token);
console.log("USER ID =", user.id);

    await api.put(
  `/users/${user.id}/`,
      {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        user_type: user.user_type
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const updatedUser = {
      ...user,
      username: formData.username,
      first_name: formData.first_name,
      last_name: formData.last_name
    };

    setUser(updatedUser);

    alert("Profile Updated Successfully!");

    onClose();

  } catch (err) {
    console.error(err);
    alert("Update Failed");
  }
};
  return (
    <>
      <DialogContent sx={{ p: 3 }}>

        <Typography
  variant="h4"
  fontWeight={700}
  mb={3}
>
  Edit Profile
</Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3
          }}
        >
          <Avatar
  sx={{
    width: 90,
    height: 90,
    mr: 3,
    bgcolor: '#0f766e',
    fontSize: '2rem',
    fontWeight: 700
  }}
>
  {user?.username?.[0]?.toUpperCase()}
</Avatar>
          <Box>
            <Typography
  variant="h5"
  fontWeight={600}
>
  Profile Picture
</Typography>

<Typography
  variant="body1"
  color="text.secondary"
>
  PNG or JPG no larger than 5.0 MB
</Typography>
          </Box>
        </Box>

        <TextField
          label="USER NAME"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="EMAIL"
          name="email"
          value={formData.email}
          disabled
          fullWidth
          sx={{ mb: 2 }}
        />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="FIRST NAME"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="LAST NAME"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>

        <TextField
          label="TEAM"
          name="team"
          value={formData.team}
          disabled
          fullWidth
          sx={{ mt: 2 }}
        />

      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: '#555'
          }}
        >
          Cancel
        </Button>

       <Button
  onClick={handleSave}
  variant="contained"
  sx={{
    background: '#312F90',
    borderRadius: '15px',
    px: 5,
    py: 1.5,
    fontWeight: 700,
    textTransform: 'none',
    boxShadow: '0 8px 20px rgba(49,47,144,0.3)',
    '&:hover': {
      background: '#27257A'
    }
  }}
>
  Save Changes
</Button>
      </DialogActions>
    </>
  );
};

export default UserProfile;