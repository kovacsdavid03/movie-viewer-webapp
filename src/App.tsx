
import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Movie as MovieIcon, Favorite as FavoriteIcon, Logout as LogoutIcon, Login as LoginIcon, PersonAdd as RegisterIcon, Add as AddIcon } from '@mui/icons-material';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import MovieDetails from './pages/MovieDetails';
import MovieImport from './pages/MovieImport';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
             Movie Viewer
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {!userId ? (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  startIcon={<LoginIcon />}
                  sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/register"
                  startIcon={<RegisterIcon />}
                  sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                >
                  Register
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/home"
                  startIcon={<MovieIcon />}
                  sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                >
                  Movies
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/favourites"
                  startIcon={<FavoriteIcon />}
                  sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                >
                  Favorites
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/import"
                  startIcon={<AddIcon />}
                  sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                >
                  Import
                </Button>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
                >
                  Logout
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/favourites" element={<Favorites />} />
          <Route path="/import" element={<MovieImport />} />
          <Route path="/movie/:movieId" element={<MovieDetails />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
