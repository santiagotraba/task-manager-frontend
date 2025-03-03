import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Input, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('https://task-manager-backend-vpab.onrender.com/api/auth/register', { username, password })
  .then(response => {
    console.log('Respuesta del servidor:', response.data); // Depuración
    setSuccess('User registered successfully');
    setError('');
    navigate('/login');
  })
  .catch(error => {
    console.error('Error completo:', error.response); // Depuración
    if (error.response && error.response.status === 400) {
      setError('Username already exists');
    } else {
      setError('Error registering user');
    }
    setSuccess('');
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
      {success && <Text color="green.500" mb={2}>{success}</Text>}
      <Button type="submit" colorScheme="teal" mb={2}>Register</Button>
      <Button variant="link" onClick={() => navigate('/login')}>
        ¿Ya tienes una cuenta? Inicia sesión
      </Button>
    </Box>
  );
};

export default RegisterForm;