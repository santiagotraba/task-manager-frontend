import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Input, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // Obtén el token de localStorage
  const token = localStorage.getItem('token');

  // Configura Axios para incluir el token en todas las solicitudes
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('https://task-manager-backend-vpab.onrender.com/api/auth/login', { username, password }, {
      withCredentials: true,
    })
      .then(response => {
        console.log('Respuesta del servidor:', response.data);
        localStorage.setItem('token', response.data.token);
        onLogin();
        navigate('/tasks');
      })
      .catch(error => {
        console.error('Error completo:', error.response);
        setError('Invalid credentials');
      });
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={4} borderWidth={1} borderRadius={8} mb={4}>
      <Input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        mb={2}
        required
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        mb={2}
        required
      />
      {error && <Text color="red.500" mb={2}>{error}</Text>}
      <Button type="submit" colorScheme="teal">Login</Button>
    </Box>
  );
};

export default LoginForm;